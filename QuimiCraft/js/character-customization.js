(function (global) {
  "use strict";

  const DEFAULT_LABELS = Object.freeze({
    skin: "Tom de pele",
    hair: "Cor do cabelo",
    coat: "Cor do uniforme",
    accent: "Cor dos detalhes",
    pants: "Cor da calça"
  });

  function clampIndex(value, collection, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed >= 0 && parsed < collection.length
      ? parsed
      : fallback;
  }

  function createCharacterCustomizer(config) {
    const {
      options,
      initialStyle,
      controlsElement,
      previewElement,
      storageKey = "qc_character",
      labels = DEFAULT_LABELS,
      onChange = function () {}
    } = config;

    if (!options || !controlsElement || !previewElement) {
      throw new Error("Character customizer: configuração incompleta.");
    }

    const defaults = {
      skin: 2,
      hair: 1,
      coat: 0,
      accent: 0,
      pants: 0,
      hairStyle: 0
    };

    const style = { ...defaults, ...(initialStyle || {}) };

    function normalize() {
      for (const key of Object.keys(labels)) {
        style[key] = clampIndex(style[key], options[key], defaults[key]);
      }
      style.hairStyle = clampIndex(
        style.hairStyle,
        options.hairStyle,
        defaults.hairStyle
      );
    }

    function persist() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(style));
      } catch (error) {
        console.warn("Não foi possível salvar a personalização.", error);
      }
    }

    function updatePreview() {
      previewElement.style.setProperty("--skin", options.skin[style.skin]);
      previewElement.style.setProperty("--hair", options.hair[style.hair]);
      previewElement.style.setProperty("--coat", options.coat[style.coat]);
      previewElement.style.setProperty("--accent", options.accent[style.accent]);
      previewElement.style.setProperty("--pants", options.pants[style.pants]);
      controlsElement.style.setProperty("--hair-preview", options.hair[style.hair]);
      previewElement.dataset.hairStyle = String(style.hairStyle);
    }

    function apply({ save = true, notify = true } = {}) {
      normalize();
      updatePreview();
      if (save) persist();
      if (notify) onChange({ ...style });
    }

    function renderColorGroup(key) {
      const swatches = options[key]
        .map(
          (color, index) =>
            `<button class="swatch ${style[key] === index ? "active" : ""}" ` +
            `type="button" data-custom="${key}" data-value="${index}" ` +
            `style="--sw:${color}" aria-label="${labels[key]} ${index + 1}" ` +
            `aria-pressed="${style[key] === index}"></button>`
        )
        .join("");

      return `<div class="custom-group"><label>${labels[key]}</label><div class="swatches">${swatches}</div></div>`;
    }

    function renderHairStyles() {
      const buttons = options.hairStyle
        .map(
          (name, index) =>
            `<button class="style-option ${style.hairStyle === index ? "active" : ""}" ` +
            `type="button" data-custom="hairStyle" data-value="${index}" ` +
            `aria-pressed="${style.hairStyle === index}">` +
            `<span class="hair-style-icon" data-style="${index}" aria-hidden="true"><i></i><i></i><i></i></span>` +
            `<span>${name}</span></button>`
        )
        .join("");

      return `<div class="custom-group"><label>Estilo do cabelo</label><div class="style-options">${buttons}</div></div>`;
    }

    function render() {
      normalize();
      controlsElement.innerHTML =
        Object.keys(labels).map(renderColorGroup).join("") + renderHairStyles();
      updatePreview();
    }

    function handleClick(event) {
      const button = event.target.closest("[data-custom]");
      if (!button || !controlsElement.contains(button)) return;

      const key = button.dataset.custom;
      const value = Number.parseInt(button.dataset.value, 10);
      if (!(key in style) || !Number.isInteger(value)) return;

      style[key] = value;
      apply();
      render();
    }

    controlsElement.addEventListener("click", handleClick);
    apply({ save: false });

    return Object.freeze({
      render,
      apply,
      getStyle: () => ({ ...style }),
      setStyle(nextStyle) {
        Object.assign(style, nextStyle || {});
        apply();
        render();
      },
      destroy() {
        controlsElement.removeEventListener("click", handleClick);
      }
    });
  }

  global.QuimiCharacterCustomizer = Object.freeze({ createCharacterCustomizer });
})(window);
