import { OMR_ANNULLED, getOptionLabels, getOptionScheme } from '../config.js';
import { round } from '../utils/math.js';

function stripDelimiters(raw) {
  let token = String(raw ?? '').trim();
  // Strip repeated surrounding quotes, parentheses, brackets, chevrons, or trailing ')' / '.'
  let prev;
  do {
    prev = token;
    token = token
      .replace(/^["'“”‘’«»(\[{<\s]+/, '')
      .replace(/["'“”‘’«»)\]}>.,;:\s]+$/, '');
  } while (token !== prev);
  return token;
}

export function normalizeAnswerToken(rawValue, optionCount = 5, optionScheme = 'upper') {
  const trimmed = String(rawValue ?? '').trim();
  const stripped = stripDelimiters(trimmed);
  const upperRaw = trimmed.toUpperCase();
  const upper = stripped.toUpperCase();

  if (['--', 'ANULADA', 'ANULADO', 'NULLA', 'NULA'].includes(upperRaw) || ['--', 'ANULADA', 'ANULADO', 'NULA'].includes(upper)) {
    return OMR_ANNULLED;
  }
  if (['-', '—', '–', '_', 'BLANK', 'BRANCO', 'EM BRANCO'].includes(upperRaw) || ['-', '—', '–', '_', 'BLANK', 'BRANCO'].includes(upper)) {
    return null;
  }

  const scheme = getOptionScheme(optionScheme);
  const validLabels = getOptionLabels(optionScheme, optionCount);
  const mapped = scheme.aliases[upper];
  if (mapped && validLabels.includes(mapped)) {
    return mapped;
  }

  // Direct exact or case-insensitive match against active labels
  const direct = validLabels.find((lbl) => lbl.toUpperCase() === upper);
  if (direct) return direct;

  return undefined;
}

export class AnswerKeyParser {
  parse(rawText, { optionCount = 5, optionScheme = 'upper', expectedQuestions = 0 } = {}) {
    const raw = String(rawText ?? '').trim();
    if (!raw) {
      return {
        answers: [],
        validCount: 0,
        annulledCount: 0,
        errors: [],
        warnings: ['Nenhum gabarito oficial foi informado.']
      };
    }

    const errors = [];
    const warnings = [];
    let answers = [];

    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error('O JSON precisa ser um array.');
        answers = parsed.map((entry, idx) => {
          const norm = normalizeAnswerToken(entry, optionCount, optionScheme);
          if (norm === undefined) {
            errors.push(`Valor inválido na posição ${idx + 1}: “${entry}”.`);
          }
          return norm ?? null;
        });
      } catch (err) {
        errors.push(`JSON inválido: ${err.message}`);
      }
    } else {
      // Split by lines, semicolons, or numbered chunks like "1) (A)  2) (B)"
      // Detect numbered pattern: "<num> [sep] <token>" where token can be wrapped in (), "", '', []
      // Note: a single '-' is only a separator when NOT followed by another '-' (so "11 --" stays annulled).
      const numberedRegex =
        /(?:^|[\n;,])\s*(\d{1,3})(?:\s+(?=--)|[.):]\s*|\s*-(?!-)\s*|\s+)([("'“”‘’\[«]*?(?:--|ANULADA|ANULADO|BRANCO|BLANK|VERDADEIRO|FALSO|CERTO|ERRADO|TRUE|FALSE|III|II|IV|VI|I|V|[A-Fa-f]|-|—|–)[)"'“”‘’\]»]*)(?=\s*(?:$|[\n;,]))/gim;
      const numberedMatches = [...raw.matchAll(numberedRegex)];

      if (numberedMatches.length) {
        const byQuestion = new Map();
        numberedMatches.forEach((match) => {
          const qNum = Number(match[1]);
          const norm = normalizeAnswerToken(match[2], optionCount, optionScheme);
          if (!Number.isInteger(qNum) || qNum < 1) {
            errors.push(`Número de questão inválido: “${match[1]}”.`);
          } else if (norm === undefined) {
            errors.push(`Alternativa inválida na questão ${qNum}: “${match[2]}”.`);
          } else if (byQuestion.has(qNum)) {
            errors.push(`A questão ${qNum} aparece mais de uma vez no gabarito.`);
          } else {
            byQuestion.set(qNum, norm);
          }
        });

        const maxQ = Math.max(0, ...byQuestion.keys());
        answers = Array.from({ length: maxQ }, (_, i) => byQuestion.get(i + 1) ?? null);
        const missing = Array.from({ length: maxQ }, (_, i) => i + 1).filter((q) => !byQuestion.has(q));
        if (missing.length) {
          warnings.push(
            `Questões sem resposta no gabarito: ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? '…' : ''}.`
          );
        }
      } else {
        // Also support inline numbered pairs separated by spaces: "1-A 2-B 3-C" or "1.(a) 2.(b)"
        const inlinePairs = [
          ...raw.matchAll(
            /(?:^|\s)(\d{1,3})\s*[.):\-–—]\s*([("'“”‘’\[«]*?(?:--|ANULADA|ANULADO|BRANCO|BLANK|VERDADEIRO|FALSO|CERTO|ERRADO|III|II|IV|VI|I|V|[A-Fa-f]|-|—)[)"'“”‘’\]»]*)(?=\s|$)/gim
          )
        ];
        if (inlinePairs.length >= 2) {
          const byQuestion = new Map();
          inlinePairs.forEach((match) => {
            const qNum = Number(match[1]);
            const norm = normalizeAnswerToken(match[2], optionCount, optionScheme);
            if (!Number.isInteger(qNum) || qNum < 1) {
              errors.push(`Número de questão inválido: “${match[1]}”.`);
            } else if (norm === undefined) {
              errors.push(`Alternativa inválida na questão ${qNum}: “${match[2]}”.`);
            } else if (byQuestion.has(qNum)) {
              errors.push(`A questão ${qNum} aparece mais de uma vez no gabarito.`);
            } else {
              byQuestion.set(qNum, norm);
            }
          });
          const maxQ = Math.max(0, ...byQuestion.keys());
          answers = Array.from({ length: maxQ }, (_, i) => byQuestion.get(i + 1) ?? null);
        } else {
          // Flat sequence: "(A) (B) (C)" or '"a" "b" "c"' or "I II IV III" or "V F V F"
          const tokens = raw.split(/[\s,;|/]+/).filter(Boolean);
          answers = tokens.map((tok, idx) => {
            const norm = normalizeAnswerToken(tok, optionCount, optionScheme);
            if (norm === undefined) {
              errors.push(`Alternativa inválida na posição ${idx + 1}: “${tok}”.`);
            }
            return norm ?? null;
          });
        }
      }
    }

    if (expectedQuestions && answers.length < expectedQuestions) {
      warnings.push(`O gabarito possui ${answers.length} respostas para ${expectedQuestions} questões configuradas.`);
    }
    if (expectedQuestions && answers.length > expectedQuestions) {
      warnings.push(`O gabarito tem ${answers.length - expectedQuestions} resposta(s) além do total configurado.`);
      answers = answers.slice(0, expectedQuestions);
    }

    return {
      answers,
      validCount: answers.filter((a) => a != null && a !== OMR_ANNULLED).length,
      annulledCount: answers.filter((a) => a === OMR_ANNULLED).length,
      errors,
      warnings
    };
  }

  format(answers) {
    return answers.map((ans, idx) => `${idx + 1} ${ans === OMR_ANNULLED ? '--' : ans ?? '—'}`).join('\n');
  }
}

export function effectiveAnswer(question) {
  return question.manualAnswer === undefined ? question.detectedAnswer : question.manualAnswer;
}

export function resolveQuestionStatus(question, correctAnswer) {
  if (correctAnswer === OMR_ANNULLED) return 'annulled';
  const manuallyReviewed = question.manualAnswer !== undefined;
  const finalAnswer = effectiveAnswer(question);

  if (manuallyReviewed) {
    if (finalAnswer == null) return 'blank';
    if (correctAnswer == null) return 'unkeyed';
    return finalAnswer === correctAnswer ? 'correct' : 'incorrect';
  }
  if (question.classification === 'multiple') return 'multiple';
  if (question.classification === 'ambiguous') return 'ambiguous';
  if (question.classification === 'blank' || finalAnswer == null) return 'blank';
  if (Array.isArray(finalAnswer)) return 'multiple';
  if (correctAnswer == null) return 'unkeyed';
  return finalAnswer === correctAnswer ? 'correct' : 'incorrect';
}

export class AnswerScorer {
  score(questions, answerKey = [], { maxGrade = 10 } = {}) {
    const maxQuestionNum = questions.reduce((acc, q, idx) => Math.max(acc, Number(q.question) || idx + 1), 0);
    const total = Math.max(maxQuestionNum, answerKey.length);
    const safeMaxGrade = Number.isFinite(Number(maxGrade)) && Number(maxGrade) > 0 ? Number(maxGrade) : 10;
    const paddedKey = Array.from({ length: total }, (_, idx) => answerKey[idx] ?? null);
    const annulled = paddedKey.filter((ans) => ans === OMR_ANNULLED).length;
    const eligibleQuestions = Math.max(0, total - annulled);
    const pointsPerQuestion = eligibleQuestions ? safeMaxGrade / eligibleQuestions : 0;

    const scored = questions.map((q, idx) => {
      const qNum = Math.max(1, Number(q.question) || idx + 1);
      const correctAnswer = paddedKey[qNum - 1] ?? null;
      const finalAnswer = effectiveAnswer(q);
      const status = resolveQuestionStatus(q, correctAnswer);
      const pointsPossible = status === 'annulled' ? 0 : round(pointsPerQuestion, 4);
      const pointsAwarded =
        status === 'annulled' ? 0 : correctAnswer == null ? null : status === 'correct' ? round(pointsPerQuestion, 4) : 0;

      return {
        ...q,
        question: qNum,
        correctAnswer,
        finalAnswer,
        manuallyReviewed: q.manualAnswer !== undefined,
        status,
        pointsPossible,
        pointsAwarded
      };
    });

    const byNum = new Map(scored.map((q) => [q.question, q]));
    for (let qNum = 1; qNum <= total; qNum += 1) {
      if (!byNum.has(qNum)) {
        const correctAnswer = paddedKey[qNum - 1] ?? null;
        const status = correctAnswer === OMR_ANNULLED ? 'annulled' : 'unkeyed';
        scored.push({
          question: qNum,
          source: 'missing-row',
          detected: false,
          inferred: false,
          unresolved: true,
          yCenter: null,
          xStart: null,
          columnGap: null,
          bubbles: [],
          rowConfidence: 0,
          matchedBubbleCount: 0,
          detectedAnswer: null,
          manualAnswer: undefined,
          classification: 'blank',
          answerConfidence: 0,
          confidenceLabel: 'baixa',
          scoreMargin: 0,
          reasons: ['A linha desta questão não foi localizada na imagem.'],
          strongestOption: null,
          strongestScore: 0,
          secondScore: 0,
          correctAnswer,
          finalAnswer: null,
          manuallyReviewed: false,
          status,
          pointsPossible: status === 'annulled' ? 0 : round(pointsPerQuestion, 4),
          pointsAwarded: status === 'annulled' ? 0 : correctAnswer == null ? null : 0
        });
      }
    }

    scored.sort((a, b) => a.question - b.question);
    const countByStatus = (st) => scored.filter((q) => q.status === st).length;
    const correct = countByStatus('correct');
    const keyedQuestions = scored.filter((q) => q.correctAnswer != null && q.correctAnswer !== OMR_ANNULLED).length;
    const earnedGrade = keyedQuestions ? round((correct / Math.max(1, eligibleQuestions)) * safeMaxGrade, 2) : null;

    return {
      questions: scored,
      summary: {
        total,
        eligibleQuestions,
        annulled,
        keyedQuestions,
        correct,
        incorrect: countByStatus('incorrect'),
        blank: countByStatus('blank'),
        multiple: countByStatus('multiple'),
        ambiguous: countByStatus('ambiguous'),
        unkeyed: countByStatus('unkeyed'),
        manuallyReviewed: scored.filter((q) => q.manuallyReviewed).length,
        percentage: eligibleQuestions ? round((correct / eligibleQuestions) * 100, 1) : 0,
        keyedPercentage: keyedQuestions ? round((correct / keyedQuestions) * 100, 1) : null,
        maxGrade: round(safeMaxGrade, 2),
        earnedGrade,
        pointsPerQuestion: round(pointsPerQuestion, 4),
        gradedPointsAvailable: round(keyedQuestions * pointsPerQuestion, 2),
        gradeProvisional: keyedQuestions > 0 && keyedQuestions < eligibleQuestions
      }
    };
  }
}
