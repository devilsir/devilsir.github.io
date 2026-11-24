export const OMR_ANNULLED = '__OMR_ANNULLED__';

export const OPTION_SCHEMES = Object.freeze({
  upper: Object.freeze({
    id: 'upper',
    name: 'Letras maiúsculas (A–F)',
    shortName: 'A–F',
    labels: Object.freeze(['A', 'B', 'C', 'D', 'E', 'F']),
    fixedCount: null,
    defaultCount: 5,
    minCount: 2,
    maxCount: 6,
    aliases: Object.freeze({
      A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F'
    })
  }),
  lower: Object.freeze({
    id: 'lower',
    name: 'Letras minúsculas (a–f)',
    shortName: 'a–f',
    labels: Object.freeze(['a', 'b', 'c', 'd', 'e', 'f']),
    fixedCount: null,
    defaultCount: 5,
    minCount: 2,
    maxCount: 6,
    aliases: Object.freeze({
      A: 'a', B: 'b', C: 'c', D: 'd', E: 'e', F: 'f'
    })
  }),
  roman: Object.freeze({
    id: 'roman',
    name: 'Algarismos romanos (I–VI)',
    shortName: 'I–VI',
    labels: Object.freeze(['I', 'II', 'III', 'IV', 'V', 'VI']),
    fixedCount: null,
    defaultCount: 5,
    minCount: 2,
    maxCount: 6,
    aliases: Object.freeze({
      I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI'
    })
  }),
  vf: Object.freeze({
    id: 'vf',
    name: 'Verdadeiro ou Falso (V / F)',
    shortName: 'V/F',
    labels: Object.freeze(['V', 'F']),
    fixedCount: 2,
    defaultCount: 2,
    minCount: 2,
    maxCount: 2,
    aliases: Object.freeze({
      V: 'V', VERDADEIRO: 'V', VERDADE: 'V', TRUE: 'V', T: 'V',
      F: 'F', FALSO: 'F', FALSE: 'F'
    })
  }),
  ce: Object.freeze({
    id: 'ce',
    name: 'Certo ou Errado (C / E)',
    shortName: 'C/E',
    labels: Object.freeze(['C', 'E']),
    fixedCount: 2,
    defaultCount: 2,
    minCount: 2,
    maxCount: 2,
    aliases: Object.freeze({
      C: 'C', CERTO: 'C', CORRETO: 'C',
      E: 'E', ERRADO: 'E', INCORRETO: 'E'
    })
  })
});

export const MARK_STYLES = Object.freeze({
  auto: 'Automático (bolha, quadrado, parênteses, aspas)',
  bubble: 'Bolhas / círculos (◯)',
  box: 'Quadrados / células de tabela (☐)',
  delimited: 'Parênteses / aspas / colchetes ((A), "A", [A])',
  plain: 'Letras ou símbolos soltos (a, I, V/F)'
});

export const ORIENTATIONS = Object.freeze({
  vertical: 'Vertical (alternativas na horizontal)',
  horizontal: 'Horizontal (alternativas na vertical)'
});

export const LIMITS = Object.freeze({
  uploadMaxDimension: 2600,
  documentDetectionMaxDimension: 1400,
  rectifiedMaxDimension: 2200,
  minDocumentAreaRatio: 0.16,
  maxDocumentAreaRatio: 0.99,
  maxQuestions: 180
});

export const COLORS = Object.freeze({
  correct: '#37e589',
  incorrect: '#ff5f65',
  blank: '#b8c0cc',
  multiple: '#a885ff',
  ambiguous: '#ffbf47',
  unkeyed: '#5ed7ff',
  annulled: '#5ed7ff',
  inferred: '#ffbf47',
  manual: '#5ed7ff',
  row: '#5ed7ff'
});

export const THRESHOLDS = Object.freeze({
  blankThreshold: 0.34,
  certainThreshold: 0.56,
  minimumMargin: 0.12,
  multipleAbsoluteThreshold: 0.54,
  multipleRelativeRatio: 0.75
});

export const STORAGE_KEYS = Object.freeze({
  template: 'omr-scan.saved-template.v2',
  legacyTemplate: 'omr-scan.saved-template.v1',
  setup: 'omr-scan.setup.v2',
  legacySetup: 'omr-scan.setup.v1'
});

export const STAGE_PROGRESS = Object.freeze({
  rectify: 12,
  preprocess: 28,
  candidates: 48,
  structure: 66,
  fill: 82,
  classify: 92,
  quality: 98,
  done: 100
});

export function getOptionScheme(schemeId) {
  return OPTION_SCHEMES[schemeId] || OPTION_SCHEMES.upper;
}

export function resolveOptionCount(schemeId, requestedCount) {
  const scheme = getOptionScheme(schemeId);
  if (scheme.fixedCount != null) return scheme.fixedCount;
  const n = Number(requestedCount) || scheme.defaultCount;
  return Math.min(scheme.maxCount, Math.max(scheme.minCount, Math.round(n)));
}

export function getOptionLabels(schemeId = 'upper', optionCount = 5) {
  const scheme = getOptionScheme(schemeId);
  const count = resolveOptionCount(schemeId, optionCount);
  return scheme.labels.slice(0, count);
}

export function formatOptionRange(schemeId = 'upper', optionCount = 5) {
  const labels = getOptionLabels(schemeId, optionCount);
  if (labels.length <= 2) return labels.join(' / ');
  return `${labels[0]}–${labels[labels.length - 1]}`;
}
