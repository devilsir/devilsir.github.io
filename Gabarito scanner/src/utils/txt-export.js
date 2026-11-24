import { OMR_ANNULLED, formatOptionRange } from '../config.js';

const STATUS_PT = {
  correct: 'CORRETA',
  incorrect: 'INCORRETA',
  blank: 'EM BRANCO',
  multiple: 'MÚLTIPLA',
  ambiguous: 'REVISAR',
  unkeyed: 'SEM GABARITO',
  annulled: 'ANULADA'
};

function fmtVal(v) {
  if (v === OMR_ANNULLED) return '--';
  if (Array.isArray(v)) return v.join('+');
  return v ?? '—';
}

function pad(str, len) {
  const s = String(str ?? '');
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

export function formatSingleScanTxt(result, scored, { student = '', subject = '' } = {}) {
  const s = scored.summary;
  const d = result.structure.diagnostics;
  const q = result.quality;
  const lines = [
    '========================================================================',
    'RELATÓRIO DE LEITURA OMR (BUILD v10)',
    '========================================================================',
    `Data/Hora        : ${new Date(result.createdAt || Date.now()).toLocaleString('pt-BR')}`,
    `Aluno            : ${student || '(não informado)'}`,
    `Matéria          : ${subject || '(não informada)'}`,
    `Orientação       : ${result.orientation === 'horizontal' ? 'Horizontal (opções na vertical)' : 'Vertical (opções na horizontal)'}`,
    `Alternativas     : ${formatOptionRange(result.optionScheme, result.optionCount)} (${result.optionCount} opções)`,
    `Detector usado   : ${d.winningPool || d.detectorPool || 'auto'} (estilo: ${result.shapeKind || 'auto'})`,
    `Grade detectada  : ${d.detectedRows} detectadas, ${d.inferredRows} inferidas, ${d.unresolvedRows} ausentes (${d.detectedBubbleCount}/${d.expectedBubbleCount} posições)`,
    `Qualidade geral  : ${Math.round((q.overall || 0) * 100)}% (Nitidez ${Math.round((q.components.sharpness || 0) * 100)}% | Luz ${Math.round((q.components.lighting || 0) * 100)}% | Perspectiva ${Math.round((q.components.perspective || 0) * 100)}%)`,
    '------------------------------------------------------------------------',
    `Nota             : ${s.earnedGrade != null ? s.earnedGrade.toFixed(2) : '—'} / ${s.maxGrade.toFixed(2)} (${s.keyedQuestions ? `${s.percentage}%` : 'sem gabarito'})`,
    `Resumo           : ${s.correct} corretas | ${s.incorrect} incorretas | ${s.blank} em branco | ${s.multiple} múltiplas | ${s.ambiguous} revisar | ${s.annulled} anuladas`,
    '========================================================================',
    'QUESTÃO POR QUESTÃO',
    '------------------------------------------------------------------------',
    `${pad('Q#', 5)} ${pad('DETECTADA', 12)} ${pad('FINAL', 10)} ${pad('GABARITO', 10)} ${pad('STATUS', 14)} ${pad('CONF.', 7)} ${pad('MARCA', 10)}`,
    '------------------------------------------------------------------------'
  ];

  for (const item of scored.questions) {
    lines.push(
      `${pad(String(item.question).padStart(2, '0'), 5)} ` +
        `${pad(fmtVal(item.detectedAnswer), 12)} ` +
        `${pad(item.status === 'annulled' ? 'ANULADA' : fmtVal(item.finalAnswer), 10)} ` +
        `${pad(fmtVal(item.correctAnswer), 10)} ` +
        `${pad(STATUS_PT[item.status] || item.status, 14)} ` +
        `${pad(`${Math.round((item.answerConfidence || 0) * 100)}%`, 7)} ` +
        `${pad(item.manuallyReviewed ? 'manual' : item.markType || '-', 10)}`
    );
  }

  if (q.issues?.length) {
    lines.push('------------------------------------------------------------------------');
    lines.push('DIAGNÓSTICOS:');
    q.issues.forEach((issue) => lines.push(`- ${issue}`));
  }

  lines.push('========================================================================');
  return lines.join('\n');
}

export function formatBenchmarkSuiteTxt(entries, { startedAt, finishedAt } = {}) {
  const totalCases = entries.length;
  const totalQuestions = entries.reduce((acc, e) => acc + e.totalQuestions, 0);
  const totalExpectedMatches = entries.reduce((acc, e) => acc + e.expectedMatches, 0);
  const totalIncorrect = entries.reduce((acc, e) => acc + e.incorrect, 0);
  const totalAmbiguous = entries.reduce((acc, e) => acc + e.ambiguous, 0);
  const totalMs = entries.reduce((acc, e) => acc + e.durationMs, 0);
  const overallPct = totalQuestions ? ((totalExpectedMatches / totalQuestions) * 100).toFixed(1) : '0.0';

  const lines = [
    '====================================================================================================',
    'BATERIA DE TESTES AUTOMATIZADOS — LEITOR OMR v10',
    '====================================================================================================',
    `Data/Hora          : ${new Date(finishedAt || Date.now()).toLocaleString('pt-BR')}`,
    `Cenários testados  : ${totalCases}`,
    `Questões avaliadas : ${totalQuestions}`,
    `Acurácia global    : ${totalExpectedMatches} / ${totalQuestions} (${overallPct}%)`,
    `Incorretas totais  : ${totalIncorrect} | Revisar totais: ${totalAmbiguous}`,
    `Tempo total        : ${(totalMs / 1000).toFixed(2)}s (média ${(totalMs / Math.max(1, totalCases)).toFixed(0)} ms/folha)`,
    '====================================================================================================',
    'RESUMO POR CENÁRIO',
    '----------------------------------------------------------------------------------------------------',
    `${pad('ID', 28)} ${pad('CONDIÇÃO', 13)} ${pad('ACERTOS', 11)} ${pad('ERR', 4)} ${pad('REV', 4)} ${pad('BRC', 4)} ${pad('MUL', 4)} ${pad('COBERT.', 8)} ${pad('DETECTOR', 17)} TEMPO`,
    '----------------------------------------------------------------------------------------------------'
  ];

  for (const e of entries) {
    const pct = e.totalQuestions ? `${Math.round((e.expectedMatches / e.totalQuestions) * 100)}%` : '0%';
    lines.push(
      `${pad(e.presetId, 28)} ` +
        `${pad(e.conditionShort, 13)} ` +
        `${pad(`${e.expectedMatches}/${e.totalQuestions} (${pct})`, 11)} ` +
        `${pad(e.incorrect, 4)} ` +
        `${pad(e.ambiguous, 4)} ` +
        `${pad(e.blank, 4)} ` +
        `${pad(e.multiple, 4)} ` +
        `${pad(`${Math.round(e.bubbleCoverage * 100)}%`, 8)} ` +
        `${pad(e.detector, 17)} ` +
        `${e.durationMs}ms`
    );
  }

  // Group summary by capture condition
  const byCondition = new Map();
  for (const e of entries) {
    if (!byCondition.has(e.conditionShort)) byCondition.set(e.conditionShort, { matched: 0, total: 0, cases: 0 });
    const stat = byCondition.get(e.conditionShort);
    stat.matched += e.expectedMatches;
    stat.total += e.totalQuestions;
    stat.cases += 1;
  }

  lines.push('====================================================================================================');
  lines.push('RESUMO POR CONDIÇÃO DE CAPTURA');
  lines.push('----------------------------------------------------------------------------------------------------');
  for (const [cond, stat] of byCondition.entries()) {
    const pct = stat.total ? ((stat.matched / stat.total) * 100).toFixed(1) : '0.0';
    lines.push(`- ${pad(cond, 15)} : ${stat.matched}/${stat.total} questões (${pct}%) em ${stat.cases} folha(s)`);
  }

  // Detailed breakdown of any non-100% cases
  const imperfect = entries.filter((e) => e.expectedMatches < e.totalQuestions || e.error);
  lines.push('====================================================================================================');
  if (!imperfect.length) {
    lines.push('DETALHES DE FALHAS: Nenhuma falha registrada — 100% em todos os cenários!');
  } else {
    lines.push(`DETALHES DOS CENÁRIOS COM PENDÊNCIAS (${imperfect.length}/${totalCases})`);
    lines.push('----------------------------------------------------------------------------------------------------');
    for (const e of imperfect) {
      lines.push(`[${e.presetId}] ${e.presetLabel} | Condição: ${e.conditionLabel} | Detector: ${e.detector}`);
      if (e.error) {
        lines.push(`  ERRO: ${e.error}`);
      } else {
        lines.push(
          `  Acertos: ${e.expectedMatches}/${e.totalQuestions} | Qualidade: ${Math.round(e.qualityOverall * 100)}% | Cobertura: ${Math.round(e.bubbleCoverage * 100)}% | Blocos: ${e.blockCount}`
        );
        for (const miss of e.mismatches) {
          lines.push(
            `  - Q${String(miss.question).padStart(2, '0')}: esperado=${miss.expected} | detectado=${fmtVal(miss.detected)} | status=${miss.status} | conf=${Math.round(miss.confidence * 100)}% | scores=[${miss.scores}]`
          );
        }
      }
      lines.push('');
    }
  }

  lines.push('====================================================================================================');
  return lines.join('\n');
}

export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
