const key = 'citolab3d.slide.v1';
const tissueIds = ['bee', 'epithelial', 'connective', 'muscle', 'nervous', 'bacteria'];
const stainIds = ['historesin', 'he', 'pas', 'masson', 'gram', 'fresh'];

function valid(slide) {
  return slide && tissueIds.includes(slide.tissue) && stainIds.includes(slide.stain) &&
    Number.isFinite(slide.thickness) && slide.thickness >= 1 && slide.thickness <= 12;
}

function read() {
  try {
    const slide = JSON.parse(localStorage.getItem(key));
    return valid(slide) ? Object.freeze(slide) : null;
  } catch {
    return null;
  }
}

export const state = {
  slide: read(),
  draft: null,
  saveSlide(slide) {
    if (!valid(slide)) return;
    this.slide = Object.freeze({ ...slide });
    try { localStorage.setItem(key, JSON.stringify(this.slide)); } catch {}
  }
};