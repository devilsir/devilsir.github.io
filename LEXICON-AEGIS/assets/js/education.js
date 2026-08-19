(function () {
  'use strict';

  const difficultyRank = { starter: 1, guided: 2, independent: 3 };
  const supportive = [
    'Almost! Look at the key word.',
    'Good attempt. Read the sentence one more time.',
    'Check the subject and the verb form.',
    'Look at the relationship between the two ideas.',
    'Try again using the hint when you need it.'
  ];

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }
  function normalize(value) {
    return String(value ?? '').trim().replace(/[.,?!;:]+$/g, '').replace(/\s+/g, ' ').toLowerCase();
  }
  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  class EducationEngine {
    constructor() { this.recentIds = []; this.challengeOpen = false; }
    allQuestions() {
      return [...(window.LEXICON_QUESTIONS || []), ...(window.LexiconStorage.state.customQuestions || [])];
    }
    filter(config = {}) {
      const support = Number(config.supportLevel || 3);
      const maxRank = config.difficulty ? difficultyRank[config.difficulty] || 3 : 3;
      return this.allQuestions().filter(q =>
        (!config.year || Number(q.schoolYear) === Number(config.year)) &&
        (!config.topic || config.topic === 'all' || q.topic === config.topic) &&
        Number(q.accessibilityLevel || 2) <= support &&
        (difficultyRank[q.difficulty] || 2) <= maxRank &&
        (!config.type || q.type === config.type)
      );
    }
    nextQuestion(config = {}) {
      let pool = this.filter(config).filter(q => !this.recentIds.includes(q.id));
      if (!pool.length) { this.recentIds = this.recentIds.slice(-4); pool = this.filter(config).filter(q => !this.recentIds.includes(q.id)); }
      if (!pool.length) pool = this.filter(config);
      const q = pool[Math.floor(Math.random() * pool.length)] || this.allQuestions()[0];
      if (q) { this.recentIds.push(q.id); this.recentIds = this.recentIds.slice(-14); }
      return q;
    }
    selectSession(config = {}, count = 10) {
      const pool = shuffle(this.filter(config));
      const unique = [];
      const seen = new Set();
      for (const q of pool) { if (!seen.has(q.id)) { seen.add(q.id); unique.push(q); } if (unique.length >= count) break; }
      return unique;
    }
    record(question, correct, usedHint = false, formatOverride = null) {
      const profile = window.LexiconStorage.activeProfile();
      if (!profile || !question) return;
      if (!profile.mastery[question.topic]) profile.mastery[question.topic] = { correct:0, attempts:0, hints:0, streak:0, formats:[], bossWins:0, recent:[], state:'Starting', percent:0 };
      const m = profile.mastery[question.topic];
      m.attempts += 1; if (correct) { m.correct += 1; m.streak += 1; } else m.streak = 0;
      if (usedHint) m.hints += 1;
      const format = formatOverride || question.type;
      if (!m.formats.includes(format)) m.formats.push(format);
      m.recent.push(correct ? 1 : 0); m.recent = m.recent.slice(-10);
      const accuracy = m.attempts ? m.correct / m.attempts : 0;
      const recent = m.recent.length ? m.recent.reduce((a,b)=>a+b,0) / m.recent.length : 0;
      const variety = Math.min(1, m.formats.length / 5);
      const boss = Math.min(1, (m.bossWins || 0) / 2);
      const hintRatio = m.attempts ? m.hints / m.attempts : 0;
      m.percent = Math.round(Math.max(0, Math.min(100, accuracy * 52 + recent * 28 + variety * 14 + boss * 6 - hintRatio * 8)));
      m.state = m.percent >= 88 && m.attempts >= 12 ? 'Mastered' : m.percent >= 72 && m.attempts >= 8 ? 'Secure' : m.percent >= 48 && m.attempts >= 5 ? 'Developing' : m.attempts >= 2 ? 'Practicing' : 'Starting';
      window.LexiconStorage.updateProfile(profile.id, { mastery: profile.mastery });
    }
    addBossWin(topic) {
      const profile = window.LexiconStorage.activeProfile(); if (!profile) return;
      const m = profile.mastery[topic]; if (!m) return;
      m.bossWins = (m.bossWins || 0) + 1;
      window.LexiconStorage.updateProfile(profile.id, { mastery: profile.mastery });
    }
    show(question, config = {}) {
      const layer = document.getElementById('challenge-layer');
      if (!layer || !question) return Promise.resolve({ correct:false, skipped:true, question });
      this.challengeOpen = true;
      const support = Number(config.supportLevel || window.LexiconStorage.activeProfile()?.supportLevel || 2);
      const assessment = !!config.assessment;
      const showTeacher = !!config.teacher;
      const ptSupport = config.ptSupport ?? window.LexiconStorage.state.settings.ptSupport;
      let usedHint = false;
      let selectedSequence = [];
      let attempts = 0;
      let resolved = false;
      let timerId = null;
      let seconds = Number(config.timeLimit || window.LexiconStorage.state.settings.challengeTime || 0);

      return new Promise(resolve => {
        const finish = result => {
          if (resolved) return; resolved = true; clearInterval(timerId);
          this.challengeOpen = false;
          layer.classList.remove('open'); layer.setAttribute('aria-hidden','true'); layer.innerHTML = '';
          resolve(Object.assign({ question, usedHint, attempts }, result));
        };
        const meta = `${window.LexiconCurriculum.getYear(question.schoolYear).label} · ${escapeHTML(question.subtopic)} · ${escapeHTML(question.difficulty)}`;
        const listening = question.type === 'listening';
        const sequenceMode = ['build-sentence','put-words-in-order'].includes(question.type);
        const options = shuffle(question.options || []);
        layer.innerHTML = `
          <section class="challenge-card level-${support}" role="dialog" aria-modal="true" aria-labelledby="challenge-title">
            <div class="challenge-header">
              <div><span class="micro-label">LANGUAGE TERMINAL</span><p>${meta}</p></div>
              ${seconds ? `<strong class="challenge-timer" id="challenge-timer">${seconds}</strong>` : ''}
            </div>
            <h2 id="challenge-title">${escapeHTML(question.prompt)}</h2>
            ${ptSupport ? `<p class="pt-support">Resolva o desafio em inglês. Você pode usar a dica sem perder a missão.</p>` : ''}
            ${listening ? `<div class="listening-controls"><button class="chip-button" data-listen="1">▶ Listen</button><button class="chip-button" data-listen=".72">◷ Slower</button></div>` : ''}
            ${sequenceMode ? `<div class="sequence-answer" id="sequence-answer"><span>Build here…</span></div><div class="sequence-bank" id="challenge-options"></div>` : `<div class="challenge-options" id="challenge-options"></div>`}
            <div class="challenge-feedback" id="challenge-feedback" aria-live="polite"></div>
            <div class="challenge-actions">
              ${assessment ? '' : '<button class="text-button" id="challenge-hint">Mostrar dica / Show Hint</button>'}
              ${config.allowSkip ? '<button class="text-button" id="challenge-skip">Pular / Skip</button>' : ''}
            </div>
            ${showTeacher ? `<details class="teacher-alignment"><summary>Teacher mapping</summary><p><strong>BNCC:</strong> ${question.bnccCodes.join(', ')}</p><p><strong>Objective:</strong> ${escapeHTML(window.LexiconCurriculum.getTopic(question.schoolYear, question.topic).objective)}</p><p><strong>CRMG:</strong> ${escapeHTML(question.crmgReference)}</p></details>` : ''}
          </section>`;
        layer.classList.add('open'); layer.setAttribute('aria-hidden','false');
        const feedback = layer.querySelector('#challenge-feedback');
        const optionsEl = layer.querySelector('#challenge-options');
        const answerEl = layer.querySelector('#sequence-answer');

        function renderOptions() {
          optionsEl.innerHTML = '';
          const available = sequenceMode ? options.filter((_, i) => !selectedSequence.some(s => s.index === i)) : options.map((value,index)=>({value,index}));
          available.forEach(item => {
            const value = sequenceMode ? item : item.value;
            const index = sequenceMode ? options.indexOf(item) : item.index;
            const button = document.createElement('button');
            button.className = sequenceMode ? 'word-chip' : 'answer-button';
            button.type = 'button'; button.textContent = value;
            button.addEventListener('click', () => {
              window.LexiconAudio.ui();
              if (sequenceMode) {
                const actualIndex = options.findIndex((v, i) => v === value && !selectedSequence.some(s => s.index === i));
                selectedSequence.push({ value, index: actualIndex }); renderSequence(); renderOptions();
              } else check(value, button);
            });
            optionsEl.appendChild(button);
          });
        }
        function renderSequence() {
          answerEl.innerHTML = '';
          if (!selectedSequence.length) answerEl.innerHTML = '<span>Build here…</span>';
          selectedSequence.forEach((entry, position) => {
            const button = document.createElement('button'); button.className='word-chip selected'; button.textContent=entry.value;
            button.addEventListener('click',()=>{ selectedSequence.splice(position,1); renderSequence(); renderOptions(); });
            answerEl.appendChild(button);
          });
          if (selectedSequence.length === (question.sequence || question.options).length) {
            const submit = document.createElement('button'); submit.className='sequence-submit'; submit.textContent='Confirm ✓';
            submit.addEventListener('click',()=>checkSequence()); answerEl.appendChild(submit);
          }
        }
        function showResult(isCorrect, chosen) {
          attempts += 1;
          if (isCorrect) {
            window.LexiconAudio.correct();
            feedback.className = 'challenge-feedback success';
            feedback.innerHTML = assessment ? '<strong>Resposta registrada.</strong>' : `<strong>Perfect Sentence!</strong><span>${escapeHTML(question.explanation)}</span>`;
            if (!assessment) setTimeout(()=>finish({ correct:true, answer:chosen }), 760); else setTimeout(()=>finish({ correct:true, answer:chosen }), 280);
          } else {
            window.LexiconAudio.incorrect();
            feedback.className = 'challenge-feedback error';
            const message = supportive[Math.floor(Math.random()*supportive.length)];
            feedback.innerHTML = assessment ? '<strong>Resposta registrada.</strong>' : `<strong>${escapeHTML(message)}</strong><span>${escapeHTML(attempts >= 2 ? question.explanation : 'Try again or open the hint.')}</span>`;
            if (assessment) setTimeout(()=>finish({ correct:false, answer:chosen }), 280);
          }
        }
        function check(value, button) {
          if (resolved) return;
          const isCorrect = normalize(value) === normalize(question.correctAnswer);
          button.classList.add(isCorrect ? 'correct' : 'wrong');
          if (!isCorrect && !assessment) setTimeout(()=>button.classList.remove('wrong'), 550);
          showResult(isCorrect, value);
        }
        function checkSequence() {
          const built = selectedSequence.map(s=>s.value).join(' ').replace(/\s+([?.!,])/g,'$1');
          const target = (question.sequence || []).join(' ');
          const isCorrect = normalize(built) === normalize(target) || normalize(built) === normalize(question.correctAnswer);
          if (!isCorrect && !assessment) { selectedSequence=[]; renderSequence(); renderOptions(); }
          showResult(isCorrect, built);
        }

        layer.querySelector('#challenge-hint')?.addEventListener('click', () => {
          usedHint = true; feedback.className='challenge-feedback hint'; feedback.innerHTML=`<strong>Hint</strong><span>${escapeHTML(question.hint)}</span>`; window.LexiconAudio.ui();
        });
        layer.querySelector('#challenge-skip')?.addEventListener('click',()=>finish({correct:false,skipped:true}));
        layer.querySelectorAll('[data-listen]').forEach(btn=>btn.addEventListener('click',()=>window.LexiconAudio.speak(question.listenText || question.prompt, Number(btn.dataset.listen))));
        if (listening) setTimeout(()=>window.LexiconAudio.speak(question.listenText || question.prompt, 1), 250);
        if (seconds) {
          timerId = setInterval(()=>{
            seconds -= 1; const el=layer.querySelector('#challenge-timer'); if(el) el.textContent=String(seconds);
            if(seconds <= 0) finish({correct:false,timeout:true});
          },1000);
        }
        renderOptions();
        setTimeout(()=>layer.querySelector('button')?.focus(), 30);
      });
    }
  }

  window.LexiconEducation = new EducationEngine();
  window.LexiconEducationUtils = { escapeHTML, normalize, shuffle };
})();
