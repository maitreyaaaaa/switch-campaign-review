export function splitCopySentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\r?\n+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}
