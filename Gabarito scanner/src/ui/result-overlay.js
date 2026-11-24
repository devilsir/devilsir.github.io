import { COLORS } from '../config.js';
import { clamp, ellipseNormDistance } from '../utils/math.js';

function statusColor(question) {
  return question.manuallyReviewed ? COLORS.manual : COLORS[question.status] || COLORS.unkeyed;
}

function answerList(question) {
  const ans = question.finalAnswer;
  return Array.isArray(ans) ? ans : ans ? [ans] : [];
}

function strokeWidthFor(bubble, factor = 0.12) {
  return clamp(Math.min(bubble.radiusX, bubble.radiusY) * factor, 1.6, 7);
}

function isCompactViewport() {
  return typeof window !== 'undefined' && window.matchMedia?.('(max-width: 780px)').matches === true;
}

function hexToRgba(hex, alpha) {
  if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const num = parseInt(hex.slice(1), 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

export class ResultOverlay {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.questions = [];
    this.structure = null;
    this.options = {};
  }

  setSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  render(questions, structure, options = {}) {
    this.questions = questions || [];
    this.structure = structure;
    this.options = {
      debug: false,
      rows: true,
      bubbles: true,
      centers: false,
      scores: false,
      inferred: true,
      selectedQuestion: null,
      ...options
    };

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.options.debug && this.options.rows) {
      this.#drawGridGuides(structure);
    }
    this.questions.forEach((q) => this.#drawQuestion(q));
  }

  hitTest(point, maxNormDist = 2.4) {
    let best = null;
    let bestDist = Infinity;
    for (const q of this.questions) {
      for (const b of q.bubbles || []) {
        const d = ellipseNormDistance(point, b);
        if (d <= maxNormDist && d < bestDist) {
          best = { question: q, bubble: b };
          bestDist = d;
        }
      }
    }
    return best;
  }

  questionBounds(question, pad = 2.2) {
    if (!question?.bubbles?.length) return null;
    const minX = Math.min(...question.bubbles.map((b) => b.centerX - b.radiusX * pad));
    const maxX = Math.max(...question.bubbles.map((b) => b.centerX + b.radiusX * pad));
    const minY = Math.min(...question.bubbles.map((b) => b.centerY - b.radiusY * pad));
    const maxY = Math.max(...question.bubbles.map((b) => b.centerY + b.radiusY * pad));
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  #drawQuestion(question) {
    if (!question.bubbles?.length) return;
    const ctx = this.ctx;
    const selectedAnswers = answerList(question);
    const color = statusColor(question);

    if (this.options.selectedQuestion === question.question) {
      const bounds = this.questionBounds(question, 1.45);
      ctx.save();
      ctx.fillStyle = 'rgba(94, 215, 255, 0.08)';
      ctx.strokeStyle = 'rgba(94, 215, 255, 0.5)';
      ctx.lineWidth = Math.max(1.5, (this.structure?.bubbleDiameter || 12) * 0.06);
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, Math.max(5, Math.min(bounds.width, bounds.height) * 0.12));
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    const compact = isCompactViewport();
    question.bubbles.forEach((bubble) => {
      const isSelected = selectedAnswers.includes(bubble.option);
      const isCorrectKey = question.correctAnswer === bubble.option;
      if (bubble.inferred && !this.options.inferred && !isSelected && !isCorrectKey) return;

      if (this.options.debug && this.options.bubbles) {
        this.#drawMarkShape(bubble, {
          stroke: bubble.inferred ? COLORS.inferred : 'rgba(94, 215, 255, 0.68)',
          width: strokeWidthFor(bubble, 0.08),
          dash: bubble.inferred ? [6, 5] : []
        });
      } else if (!isSelected && !isCorrectKey) {
        this.#drawMarkShape(bubble, {
          stroke: bubble.inferred ? 'rgba(255, 191, 71, 0.34)' : 'rgba(94, 215, 255, 0.16)',
          width: strokeWidthFor(bubble, 0.045),
          dash: bubble.inferred ? [5, 5] : []
        });
      }

      if (isSelected) {
        this.#drawMarkShape(bubble, {
          stroke: compact ? hexToRgba(color, 0.72) : color,
          fill: compact ? hexToRgba(color, 0.085) : `${color}26`,
          width: strokeWidthFor(bubble, compact ? 0.12 : 0.18),
          scale: compact ? 1.07 : 1.15,
          glow: compact ? null : color
        });
      }

      if (isCorrectKey && !isSelected) {
        this.#drawMarkShape(bubble, {
          stroke: compact ? hexToRgba(COLORS.correct, 0.72) : COLORS.correct,
          width: strokeWidthFor(bubble, compact ? 0.08 : 0.1),
          scale: compact ? 1.1 : 1.22,
          dash: [7, 5]
        });
      }

      if (this.options.debug && this.options.centers) {
        const dotR = Math.max(2, Math.min(bubble.radiusX, bubble.radiusY) * 0.13);
        ctx.save();
        ctx.fillStyle = bubble.inferred ? COLORS.inferred : COLORS.row;
        ctx.beginPath();
        ctx.arc(bubble.centerX, bubble.centerY, dotR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (this.options.debug && this.options.scores) {
        this.#drawScoreTag(question, bubble, isSelected);
      }
    });

    if (this.options.debug && (question.classification === 'blank' || question.unresolved)) {
      this.#drawStatusTag(question, question.unresolved ? 'NÃO LOCALIZADA' : 'EM BRANCO', color);
    }
  }

  #drawGridGuides(structure) {
    if (!structure?.blocks) return;
    const ctx = this.ctx;
    const isHorizontal = structure.orientation === 'horizontal';
    ctx.save();
    ctx.lineWidth = Math.max(1, (structure.bubbleDiameter || 10) * 0.035);
    ctx.strokeStyle = 'rgba(94, 215, 255, 0.28)';
    ctx.setLineDash([7, 8]);

    structure.blocks.forEach((block) => {
      const validRows = block.rows.filter((r) => r.bubbles?.length);
      if (!validRows.length) return;
      const optCount = validRows[0].bubbles.length;

      if (isHorizontal) {
        const minX = Math.min(...validRows.map((r) => r.bubbles[0].centerX)) - (structure.bubbleDiameter || 14);
        const maxX = Math.max(...validRows.map((r) => r.bubbles[0].centerX)) + (structure.bubbleDiameter || 14);
        for (let o = 0; o < optCount; o += 1) {
          const ys = validRows.map((r) => r.bubbles[o]?.centerY).filter(Number.isFinite);
          if (!ys.length) continue;
          const medY = ys.sort((a, b) => a - b)[Math.floor(ys.length / 2)];
          ctx.beginPath();
          ctx.moveTo(minX, medY);
          ctx.lineTo(maxX, medY);
          ctx.stroke();
        }
      } else {
        const minY = Math.min(...validRows.map((r) => r.yCenter)) - (structure.bubbleDiameter || 14);
        const maxY = Math.max(...validRows.map((r) => r.yCenter)) + (structure.bubbleDiameter || 14);
        for (let o = 0; o < optCount; o += 1) {
          const xs = validRows.map((r) => r.bubbles[o]?.centerX).filter(Number.isFinite);
          if (!xs.length) continue;
          const medX = xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];
          ctx.beginPath();
          ctx.moveTo(medX, minY);
          ctx.lineTo(medX, maxY);
          ctx.stroke();
        }
      }

      validRows.forEach((row) => {
        const bounds = this.questionBounds(row, 1.25);
        if (!bounds) return;
        ctx.strokeStyle = row.inferred ? 'rgba(255,191,71,.48)' : 'rgba(94,215,255,.25)';
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      });
    });

    ctx.restore();
  }

  #drawMarkShape(bubble, { stroke, fill, width, scale = 1, dash = [], glow } = {}) {
    const ctx = this.ctx;
    const isRect = bubble.shapeKind === 'box' || bubble.shapeKind === 'delimited' || bubble.shapeKind === 'plain';
    ctx.save();
    ctx.translate(bubble.centerX, bubble.centerY);
    ctx.rotate(((bubble.angle || 0) * Math.PI) / 180);
    ctx.beginPath();
    if (isRect) {
      const rw = bubble.radiusX * scale;
      const rh = bubble.radiusY * scale;
      ctx.roundRect(-rw, -rh, rw * 2, rh * 2, Math.min(rw, rh) * (bubble.shapeKind === 'box' ? 0.22 : 0.42));
    } else {
      ctx.ellipse(0, 0, bubble.radiusX * scale, bubble.radiusY * scale, 0, 0, Math.PI * 2);
    }
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width || 2;
      ctx.setLineDash(dash);
      if (glow) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = Math.min(bubble.radiusX, bubble.radiusY) * 0.6;
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  #drawScoreTag(question, bubble, isSelected) {
    const ctx = this.ctx;
    const fontSize = clamp(Math.max(10, Math.min(bubble.radiusX, bubble.radiusY) * 2) * 0.34, 7, 17);
    const label = `Q${question.question} ${bubble.option} · ${(bubble.fillScore ?? 0).toFixed(2)}${isSelected ? ' ✓' : ''}`;
    ctx.save();
    ctx.font = `600 ${fontSize}px DM Mono, monospace`;
    ctx.textBaseline = 'middle';
    const w = ctx.measureText(label).width + fontSize;
    const x = bubble.centerX - w / 2;
    const y = bubble.centerY - bubble.radiusY * 1.75 - fontSize;
    ctx.fillStyle = 'rgba(7, 10, 14, 0.88)';
    ctx.fillRect(x, y, w, fontSize * 1.45);
    ctx.fillStyle = isSelected ? statusColor(question) : '#e5e8e0';
    ctx.fillText(label, x + fontSize / 2, y + fontSize * 0.74);
    ctx.restore();
  }

  #drawStatusTag(question, text, color) {
    const first = question.bubbles[0];
    if (!first) return;
    const fontSize = clamp((this.structure?.bubbleDiameter || 12) * 0.32, 7, 16);
    const ctx = this.ctx;
    ctx.save();
    ctx.font = `600 ${fontSize}px DM Mono, monospace`;
    ctx.textBaseline = 'middle';
    const label = `Q${question.question} · ${text}`;
    const w = ctx.measureText(label).width + fontSize;
    const isHorizontal = question.orientation === 'horizontal';
    const x = isHorizontal ? Math.max(2, first.centerX - w / 2) : Math.max(2, first.centerX - w - first.radiusX * 1.8);
    const y = isHorizontal ? Math.max(2, first.centerY - first.radiusY * 2.2 - fontSize) : first.centerY - fontSize * 0.7;
    ctx.fillStyle = 'rgba(7, 10, 14, 0.88)';
    ctx.fillRect(x, y, w, fontSize * 1.45);
    ctx.fillStyle = color;
    ctx.fillText(label, x + fontSize / 2, y + fontSize * 0.75);
    ctx.restore();
  }
}
