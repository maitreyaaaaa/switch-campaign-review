import { copyTextSchema } from './review.mjs';
import { splitCopySentences } from './copy-analysis.mjs';

const STE_LIMITS = Object.freeze({ descriptive: 25, procedural: 20 });
const wordSegmenter = new Intl.Segmenter('en', { granularity: 'word' });

function countWords(sentence) {
  return [...wordSegmenter.segment(sentence)].filter((part) => part.isWordLike).length;
}

export function assessSte100Subset(copyText, styleType = 'descriptive') {
  const text = copyTextSchema.parse(copyText);
  if (!Object.hasOwn(STE_LIMITS, styleType)) throw new Error('Choose descriptive or procedural text.');

  const sentenceLimit = STE_LIMITS[styleType];
  const sentences = splitCopySentences(text).map((sentence, offset) => {
    const wordCount = countWords(sentence);
    return {
      index: offset + 1,
      wordCount,
      withinLimit: wordCount <= sentenceLimit,
    };
  });
  const passingSentences = sentences.filter((sentence) => sentence.withinLimit).length;
  const scorePercent = sentences.length === 0
    ? 0
    : Math.round((passingSentences / sentences.length) * 1000) / 10;

  return {
    basis: 'ASD-STE100 Issue 9 sentence-length subset',
    styleType,
    sentenceLimit,
    sentenceCount: sentences.length,
    passingSentences,
    scorePercent,
    targetPercent: 80,
    meetsTarget: sentences.length > 0 && passingSentences * 100 >= sentences.length * 80,
    sentences,
    limitation: 'This checks sentence length only. It does not check the controlled dictionary, grammar, meaning, or full ASD-STE100 compliance.',
  };
}
