(function (App) {
  "use strict";

  const LETTER_CLASS = "\\p{L}";

  function cleanBookText(rawText) {
    if (!rawText) return "";

    let text = String(rawText)
      .replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(new RegExp(`(${LETTER_CLASS})\\|(${LETTER_CLASS})`, "gu"), "$1l$2")
      .replace(/(^|\s)\|(\p{Ll})/gu, "$1l$2")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Rejoin hyphenated line breaks ("inteira-\nmente" -> "inteiramente"),
    // while preserving Portuguese enclitic pronouns ("tirá-\nlos" -> "tirá-los")
    const ptClitics = new Set([
      "lo", "la", "los", "las", "no", "na", "nos", "nas",
      "me", "te", "se", "lhe", "lhes", "vos"
    ]);
    text = text.replace(
      new RegExp(`(${LETTER_CLASS})[\\-‐\\u00AD¬]\\s*\\n\\s*(${LETTER_CLASS}+)`, "gu"),
      (_, prevChar, nextWord) =>
        ptClitics.has(nextWord.toLowerCase()) ? `${prevChar}-${nextWord}` : `${prevChar}${nextWord}`
    );

    const paragraphs = text.split(/\n{2,}/);
    const cleanedParagraphs = paragraphs.map((paragraph) => {
      const lines = paragraph
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length <= 1) return lines.join("");

      const merged = [lines[0]];
      for (let i = 1; i < lines.length; i++) {
        const prev = merged[merged.length - 1];
        const curr = lines[i];

        const startsDialogue = /^[—–\-•*]\s*/.test(curr);
        const isShortHeading =
          prev.length < 48 &&
          !/[.,;:!?…]$/.test(prev) &&
          /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ0-9]/.test(curr) &&
          prev === prev.toUpperCase();
        const looksLikeNewParagraph =
          startsDialogue ||
          isShortHeading ||
          (/[.!?…»"”)]$/.test(prev) &&
            prev.length < 42 &&
            /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ"«“]/.test(curr));

        if (looksLikeNewParagraph) {
          merged.push(curr);
        } else {
          merged[merged.length - 1] = `${prev} ${curr}`;
        }
      }
      return merged.join("\n");
    });

    return cleanedParagraphs
      .join("\n\n")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(new RegExp(`([.!?;:])(${LETTER_CLASS})`, "gu"), "$1 $2")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  function estimateReadingSeconds(text, rate = 1) {
    const trimmed = (text || "").trim();
    if (!trimmed) return 0;
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const wpm = 155 * Math.max(0.5, Number(rate) || 1);
    return Math.max(1, Math.round((words / wpm) * 60));
  }

  function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return "0s";
    if (seconds < 60) return `~${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `~${hrs}h ${remMins}min`;
    }
    return secs >= 15 ? `~${mins}min ${secs}s` : `~${mins}min`;
  }

  App.textCleaner = {
    cleanBookText,
    estimateReadingSeconds,
    formatDuration
  };
})((window.LeitorApp = window.LeitorApp || {}));
