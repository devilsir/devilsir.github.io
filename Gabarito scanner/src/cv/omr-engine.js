import { STAGE_PROGRESS, getOptionLabels, resolveOptionCount } from '../config.js';
import { mean } from '../utils/math.js';
import { DocumentDetector, PerspectiveCorrector } from './document-detector.js';
import { Preprocessor } from './preprocessor.js';
import { MarkDetector } from './mark-detector.js';
import { GridReconstructor, StructureSelector } from './grid-reconstructor.js';
import { BubbleAnalyzer } from './bubble-analyzer.js';
import { AnswerClassifier } from './answer-classifier.js';
import { QualityEstimator } from './quality-estimator.js';
import { TemplateRegistrar } from './template-registrar.js';

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => window.setTimeout(resolve, 0)));
}

export class OMREngine {
  constructor(cv) {
    if (!cv?.Mat) throw new Error('OpenCV.js não está pronto.');
    this.cv = cv;
    this.documentDetector = new DocumentDetector(cv);
    this.perspectiveCorrector = new PerspectiveCorrector(cv);
    this.preprocessor = new Preprocessor(cv);
    this.markDetector = new MarkDetector(cv);
    this.gridReconstructor = new GridReconstructor();
    this.structureSelector = new StructureSelector(this.gridReconstructor);
    this.bubbleAnalyzer = new BubbleAnalyzer();
    this.answerClassifier = new AnswerClassifier();
    this.qualityEstimator = new QualityEstimator();
    this.templateRegistrar = new TemplateRegistrar();
  }

  detectDocument(canvas) {
    if (!canvas?.width || !canvas?.height) {
      throw new Error('Nenhuma imagem foi carregada para detectar a página.');
    }
    return this.documentDetector.detect(canvas);
  }

  async recognize(
    sourceCanvas,
    quadPoints,
    {
      expectedQuestions = 50,
      optionCount = 5,
      optionScheme = 'upper',
      orientation = 'vertical',
      markStyle = 'auto',
      readingOrder = 'columns',
      mode = 'auto',
      documentConfidence = 0.5,
      onStage
    } = {}
  ) {
    const resolvedOptionCount = resolveOptionCount(optionScheme, optionCount);
    const report = async (id, label, detail) => {
      onStage?.({ id, label, detail, progress: STAGE_PROGRESS[id] ?? 0 });
      await nextFrame();
    };

    await report('rectify', 'Corrigindo a perspectiva', 'Aplicando homografia sobre os quatro cantos confirmados.');
    const rectified = this.perspectiveCorrector.rectify(sourceCanvas, quadPoints);
    let preprocessed = null;

    try {
      await report(
        'preprocess',
        'Normalizando luz e contraste',
        'Combinando tons de cinza, CLAHE, iluminação local e mapas adaptativos.'
      );
      preprocessed = this.preprocessor.process(rectified.canvas);

      await report(
        'candidates',
        'Detectando marcas e caracteres',
        'Analisando bolhas, quadrados, células de tabela, parênteses, aspas e opções.'
      );
      const detection = this.markDetector.detect(preprocessed, { markStyle });

      await report(
        'structure',
        orientation === 'horizontal' ? 'Reconstruindo grade horizontal' : 'Reconstruindo linhas e colunas',
        'Validando espaçamentos, alinhamento e recuperando lacunas com evidência estrutural.'
      );

      let structure;
      let effectiveMode = mode;
      let finalOptionCount = resolvedOptionCount;
      let requestedOptionCount = resolvedOptionCount;
      const savedTemplate = mode === 'template' ? this.templateRegistrar.load() : null;

      if (mode === 'template' && savedTemplate) {
        structure = this.templateRegistrar.register(savedTemplate, detection, {
          width: rectified.width,
          height: rectified.height,
          expectedQuestions,
          optionCount: resolvedOptionCount,
          optionScheme
        });
      } else {
        effectiveMode = 'auto';
        const selected = this.structureSelector.select(detection, {
          optionCount: resolvedOptionCount,
          optionScheme,
          orientation,
          markStyle,
          expectedQuestions,
          readingOrder,
          imageWidth: rectified.width,
          imageHeight: rectified.height
        });
        structure = selected.structure;
        finalOptionCount = selected.optionCount;
        requestedOptionCount = selected.requestedOptionCount;
        if (mode === 'template' && !savedTemplate) {
          structure.diagnostics.warnings.unshift(
            'O modelo solicitado não estava disponível; foi usada a detecção automática.'
          );
        }
      }

      await report(
        'fill',
        'Medindo marcações por alternativa',
        'Calibrando linha de base por opção e medindo preenchimento, X e círculo.'
      );
      const fillResult = this.bubbleAnalyzer.analyze(preprocessed, structure);

      await report(
        'classify',
        'Classificando respostas',
        'Comparando as alternativas de cada questão e estimando confiança.'
      );
      const classified = this.answerClassifier.classify(fillResult, structure);

      await report('quality', 'Auditando a leitura', 'Verificando foco, iluminação, geometria e cobertura das opções.');
      const quality = this.qualityEstimator.estimate({
        preprocessed,
        documentConfidence,
        bubbleDetection: detection,
        structure,
        classified
      });

      const sheetConfidence = mean([
        documentConfidence,
        detection.confidence,
        structure.confidence,
        fillResult.confidence,
        classified.confidence
      ]);

      const success =
        structure.diagnostics.detectedRows > 0 && structure.diagnostics.detectedBubbleCount >= finalOptionCount * 2;

      await report(
        'done',
        success ? 'Leitura concluída' : 'Leitura incompleta',
        success ? 'Resultados prontos para revisão.' : 'A estrutura não pôde ser confirmada por completo.'
      );

      try {
        console.groupCollapsed('[OMR v10] diagnóstico da leitura');
        console.log('Configuração', { orientation, optionScheme, finalOptionCount, markStyle, readingOrder });
        console.log('Detector multi-estilo', detection.diagnostics);
        console.log('Estrutura', structure.diagnostics);
        console.log('Calibração', fillResult.calibration);
        console.table(
          classified.questions.map((q) => ({
            questao: q.question,
            classificacao: q.classification,
            resposta: Array.isArray(q.detectedAnswer) ? q.detectedAnswer.join('+') : q.detectedAnswer,
            tipo: q.markType || '-',
            confianca: Number((q.answerConfidence ?? 0).toFixed(3)),
            scores: Object.fromEntries((q.bubbles || []).map((b) => [b.option, Number((b.fillScore ?? 0).toFixed(3))]))
          }))
        );
        console.groupEnd();
      } catch {}

      return {
        version: 3,
        success,
        mode: effectiveMode,
        orientation: structure.orientation || orientation,
        optionScheme,
        optionLabels: getOptionLabels(optionScheme, finalOptionCount),
        markStyle,
        shapeKind: structure.shapeKind || 'bubble',
        optionCount: finalOptionCount,
        requestedOptionCount,
        sheetConfidence,
        pageConfidence: documentConfidence,
        rectified,
        snapshots: preprocessed.snapshots,
        bubbleDetection: detection,
        structure,
        calibration: fillResult.calibration,
        questions: classified.questions,
        quality,
        createdAt: new Date().toISOString()
      };
    } catch (err) {
      rectified.canvas.width ||= 1;
      throw new Error(`Falha na leitura OMR: ${err.message}`, { cause: err });
    } finally {
      preprocessed?.dispose();
    }
  }
}
