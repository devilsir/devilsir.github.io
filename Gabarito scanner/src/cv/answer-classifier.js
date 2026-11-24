import { THRESHOLDS } from '../config.js';
import { clamp, confidenceLabel, mean } from '../utils/math.js';

function unresolvedQuestion(row) {
  return {
    ...row,
    detectedAnswer: null,
    manualAnswer: undefined,
    classification: 'ambiguous',
    answerConfidence: 0,
    confidenceLabel: 'baixa',
    scoreMargin: 0,
    reasons: ['A posição física desta questão não foi localizada na fotografia.']
  };
}

function classifyRow(row, calibration) {
  if (row.unresolved || !row.bubbles.length) return unresolvedQuestion(row);

  const ranked = [...row.bubbles].sort((a, b) => (b.fillScore ?? 0) - (a.fillScore ?? 0));
  const best = ranked[0];
  const second = ranked[1];
  const bestScore = best.fillScore ?? 0;
  const secondScore = second?.fillScore ?? 0;
  const margin = bestScore - secondScore;

  const strongMarks = ranked.filter(
    (b) => (b.fillScore ?? 0) >= THRESHOLDS.multipleAbsoluteThreshold && (b.fillScore ?? 0) >= bestScore * THRESHOLDS.multipleRelativeRatio
  );

  const inferredWinner = best.inferred;
  const rowConf = row.rowConfidence ?? 0;
  const fillConf = mean([best.fillConfidence ?? 0, second?.fillConfidence ?? best.fillConfidence ?? 0]);
  const reasons = [];

  let classification;
  let detectedAnswer;
  let answerConfidence;

  if (strongMarks.length > 1) {
    classification = 'multiple';
    detectedAnswer = strongMarks.map((b) => b.option);
    answerConfidence = clamp(
      (Math.min(...strongMarks.map((b) => b.fillScore)) - THRESHOLDS.multipleAbsoluteThreshold) * 1.8 +
        rowConf * 0.36 +
        fillConf * 0.28
    );
    reasons.push(`Mais de uma alternativa apresenta marcação forte: ${detectedAnswer.join(' e ')}.`);
  } else if (bestScore < THRESHOLDS.blankThreshold) {
    // Catch visibly faint/erased marks that stand cleanly above completely empty siblings (>= 3.2x secondScore)
    if (bestScore >= 0.14 && best.faintEvidence && margin >= 0.10 && bestScore >= Math.max(0.04, secondScore) * 3.2) {
      classification = 'ambiguous';
      detectedAnswer = best.option;
      answerConfidence = clamp(0.32 + margin * 0.8 + rowConf * 0.12);
      reasons.push('Há evidência fraca ou parcialmente apagada nesta alternativa; recomenda-se revisão.');
    } else {
      classification = 'blank';
      detectedAnswer = null;
      answerConfidence = clamp(
        ((THRESHOLDS.blankThreshold - bestScore) / THRESHOLDS.blankThreshold) * 0.6 + rowConf * 0.22 + fillConf * 0.18
      );
      reasons.push('Nenhuma alternativa superou a evidência mínima de marcação.');
    }
  } else {
    detectedAnswer = best.option;
    const isCircledClear = best.markType === 'circled' && bestScore >= 0.44 && margin >= 0.22;
    const isOverwhelminglyIsolated =
      bestScore >= 0.44 && margin >= 0.34 && bestScore >= Math.max(0.05, secondScore) * 5.0;
    const isWeak = bestScore < THRESHOLDS.certainThreshold && !isCircledClear && !isOverwhelminglyIsolated;
    const isTightMargin = margin < THRESHOLDS.minimumMargin;
    const lowGeom = rowConf < 0.42;

    // If inferred bubble has strong ink evidence & margin (e.g., filled table cell or circled symbol
    // whose contour grew past slot snap radius), accept it cleanly instead of forcing ambiguity!
    const inferredUncertain = inferredWinner && (bestScore < 0.58 || margin < 0.24);

    if (isWeak || isTightMargin || lowGeom || inferredUncertain) {
      classification = 'ambiguous';
      if (isWeak) reasons.push('A marca mais forte está fraca ou parcialmente apagada.');
      if (isTightMargin) reasons.push(`A diferença entre ${best.option} e ${second?.option ?? 'a segunda marca'} é pequena.`);
      if (inferredUncertain) reasons.push('A posição da alternativa vencedora foi inferida pela geometria vizinha.');
      else if (lowGeom) reasons.push('A geometria desta questão está pouco consistente.');
    } else {
      classification = 'single';
    }

    const strengthFactor = clamp((bestScore - THRESHOLDS.blankThreshold) / (1 - THRESHOLDS.blankThreshold));
    const marginFactor = clamp(margin / 0.35);
    answerConfidence = clamp(
      strengthFactor * 0.38 +
        marginFactor * 0.28 +
        rowConf * 0.16 +
        (best.fillConfidence ?? 0) * 0.18 -
        (inferredUncertain ? 0.16 : 0)
    );
  }

  if (!reasons.length) {
    const kindNote =
      best.markType === 'x-mark'
        ? 'Marcação em X clara e separada das demais.'
        : best.markType === 'circled'
          ? 'Marcação circulada clara e separada das demais.'
          : 'Marca forte, separada das demais e geometricamente alinhada.';
    reasons.push(kindNote);
  }

  return {
    ...row,
    detectedAnswer,
    manualAnswer: undefined,
    classification,
    answerConfidence,
    confidenceLabel: confidenceLabel(answerConfidence),
    scoreMargin: margin,
    reasons,
    strongestOption: best.option,
    strongestScore: bestScore,
    secondScore,
    markType: best.markType || null,
    calibrationEvidence: (best.rawInkScore ?? 0) - (best.slotBaseline ?? calibration.emptyBaseline ?? 0)
  };
}

export class AnswerClassifier {
  classify(fillResult, structure) {
    const questions = fillResult.rows.map((row) => classifyRow(row, fillResult.calibration));
    return {
      questions,
      confidence: mean(questions.map((q) => q.answerConfidence)),
      lowConfidenceQuestions: questions
        .filter((q) => q.answerConfidence < 0.58 || q.classification === 'ambiguous')
        .map((q) => q.question),
      structureConfidence: structure.confidence,
      calibration: fillResult.calibration
    };
  }
}
