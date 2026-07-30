export const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
export const lerp = (a, b, t) => a + (b - a) * t;
export const randomBetween = (min, max) => min + Math.random() * (max - min);
export const choose = (items) => items[Math.floor(Math.random() * items.length)];
export const todayKey = () => new Date().toISOString().slice(0, 10);
export const formatTimeAway = (milliseconds) => {
  const minutes = Math.max(0, Math.floor(milliseconds / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
};
export const debounce = (fn, wait = 100) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};
export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export const safeParse = (value, fallback) => {
  try { return JSON.parse(value); } catch { return fallback; }
};
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
