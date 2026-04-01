import { useMemo } from 'react';

// Expanded negative/angry words and phrases
const ANGER_WORDS = new Set([
  'angry', 'furious', 'mad', 'frustrated', 'annoyed', 'irritated', 'pissed',
  'ridiculous', 'unacceptable', 'terrible', 'horrible', 'awful', 'worst',
  'hate', 'stupid', 'idiot', 'incompetent', 'useless', 'pathetic', 'disgusting',
  'outrageous', 'absurd', 'insane', 'scam', 'fraud', 'liar', 'lying', 'cheat',
  'ripped', 'screwed', 'damn', 'hell', 'crap', 'bullshit', 'shit', 'wtf',
  'sick', 'tired', 'fed', 'done', 'enough', 'never', 'demand', 'sue', 'lawyer',
  'complaint', 'manager', 'supervisor', 'escalate', 'report', 'cancel',
  // Additional negative words for better detection
  'disappointed', 'upset', 'unhappy', 'dissatisfied', 'poor', 'bad', 'wrong',
  'broken', 'failed', 'failure', 'ruined', 'destroyed', 'wasted', 'waste',
  'stolen', 'missing', 'damaged', 'scratched', 'dented', 'delayed', 'late',
  'overcharged', 'expensive', 'rude', 'disrespectful', 'unprofessional',
  'nightmare', 'disaster', 'mess', 'chaos', 'joke', 'laughable', 'shameful',
  'disgrace', 'appalling', 'atrocious', 'dreadful', 'horrendous', 'shocking',
  'unbelievable', 'inexcusable', 'intolerable', 'deplorable', 'contempt',
  'threatening', 'harassed', 'harassment', 'deceived', 'misleading', 'mislead',
  'refund', 'reimburse', 'compensate', 'compensation', 'bbb', 'attorney',
  'negligent', 'negligence', 'liable', 'liability', 'violation', 'illegal',
  'concerned', 'worried', 'anxious', 'nervous', 'uncomfortable', 'confused',
  'unclear', 'problem', 'issue', 'trouble', 'difficult', 'struggling',
]);

// More nuanced positive words — removed generic/ambiguous ones
const POSITIVE_WORDS = new Set([
  'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect',
  'awesome', 'love', 'thank', 'thanks', 'appreciate', 'happy', 'pleased',
  'satisfied', 'helpful', 'nice', 'good', 'best', 'brilliant', 'outstanding',
  'superb', 'terrific', 'delighted', 'glad', 'grateful', 'impressive',
  'beautiful', 'recommend', 'friendly', 'kind', 'professional',
  'exceptional', 'remarkable', 'phenomenal', 'incredible', 'magnificent',
  'thoughtful', 'courteous', 'attentive', 'responsive', 'efficient',
  'smooth', 'seamless', 'comfortable', 'confident', 'reassured',
  'trustworthy', 'reliable', 'dependable', 'organized', 'thorough',
  'patient', 'understanding', 'accommodating', 'generous', 'considerate',
]);

// Intensifiers that amplify the next word's sentiment
const INTENSIFIERS = new Set([
  'very', 'really', 'extremely', 'incredibly', 'absolutely', 'completely',
  'totally', 'utterly', 'thoroughly', 'quite', 'super', 'so',
]);

// Negators that flip the next word's sentiment
const NEGATORS = new Set([
  'not', "n't", 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere',
  'hardly', 'barely', 'scarcely', "don't", "doesn't", "didn't", "won't",
  "wouldn't", "couldn't", "shouldn't", "can't", "isn't", "aren't", "wasn't",
]);

const FILLER_PATTERNS = [
  /\bum+\b/gi,
  /\buh+\b/gi,
  /\bugh+\b/gi,
  /\blike\b/gi,
  /\byou know\b/gi,
  /\bbasically\b/gi,
  /\bactually\b/gi,
  /\bliterally\b/gi,
  /\bi mean\b/gi,
  /\bso+\b/gi,
  /\bwell\b/gi,
  /\bright\?/gi,
  /\bokay so\b/gi,
  /\bkinda\b/gi,
  /\bsorta\b/gi,
];

export type ToneLevel = 'positive' | 'neutral' | 'cautious' | 'negative' | 'angry';

export interface SentimentMetrics {
  /** 0-100 anger score based on negative word density */
  angerScore: number;
  /** Total filler word count */
  fillerCount: number;
  /** Individual filler breakdown */
  fillerBreakdown: Record<string, number>;
  /** Words per minute (requires callDurationSec) */
  wordsPerMinute: number;
  /** Overall tone classification */
  tone: ToneLevel;
  /** Sentiment score: -100 (very negative) to +100 (very positive) */
  sentimentScore: number;
  /** Whether there's been a tone shift (positive→negative or vice versa) */
  toneShift: boolean;
  /** Direction of shift if any */
  toneShiftDirection: 'improving' | 'worsening' | 'stable';
  /** Total word count */
  wordCount: number;
  /** Whether analysis is active (has enough text) */
  isActive: boolean;
}

const DEFAULT_METRICS: SentimentMetrics = {
  angerScore: 0,
  fillerCount: 0,
  fillerBreakdown: {},
  wordsPerMinute: 0,
  tone: 'neutral',
  sentimentScore: 0,
  toneShift: false,
  toneShiftDirection: 'stable',
  wordCount: 0,
  isActive: false,
};

function scoreWords(words: string[]): { negativeHits: number; positiveHits: number } {
  let negativeHits = 0;
  let positiveHits = 0;
  
  for (let i = 0; i < words.length; i++) {
    const clean = words[i].replace(/[^a-z']/g, '');
    if (!clean) continue;
    
    // Check for negation in previous 1-2 words
    const hasNegator = (i > 0 && NEGATORS.has(words[i - 1].replace(/[^a-z']/g, ''))) ||
                       (i > 1 && NEGATORS.has(words[i - 2].replace(/[^a-z']/g, '')));
    
    // Check for intensifier in previous word
    const hasIntensifier = i > 0 && INTENSIFIERS.has(words[i - 1].replace(/[^a-z']/g, ''));
    const multiplier = hasIntensifier ? 1.5 : 1;
    
    if (ANGER_WORDS.has(clean)) {
      if (hasNegator) {
        // "not bad" = slightly positive
        positiveHits += 0.3 * multiplier;
      } else {
        negativeHits += 1 * multiplier;
      }
    }
    
    if (POSITIVE_WORDS.has(clean)) {
      if (hasNegator) {
        // "not good" = negative
        negativeHits += 0.5 * multiplier;
      } else {
        positiveHits += 1 * multiplier;
      }
    }
  }
  
  return { negativeHits, positiveHits };
}

export function analyzeSentiment(
  transcript: string,
  callDurationSec: number
): SentimentMetrics {
  if (!transcript || transcript.trim().length < 5) return DEFAULT_METRICS;

  const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount < 3) return { ...DEFAULT_METRICS, wordCount, isActive: false };

  // Context-aware scoring with negation and intensifier handling
  const { negativeHits: baseNeg, positiveHits: basePos } = scoreWords(words);
  let negativeHits = baseNeg;
  let positiveHits = basePos;

  // Check for caps (shouting) — count words that are ALL CAPS and > 2 chars
  const rawWords = transcript.split(/\s+/).filter(Boolean);
  const capsCount = rawWords.filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  negativeHits += capsCount * 0.5;

  // Exclamation marks add to negative intensity (but only if there are already negative signals)
  const exclamations = (transcript.match(/!/g) || []).length;
  if (negativeHits > 0) {
    negativeHits += exclamations * 0.2;
  }

  // Question marks can indicate confusion/frustration in high volume
  const questions = (transcript.match(/\?/g) || []).length;
  if (questions > 3 && negativeHits > positiveHits) {
    negativeHits += questions * 0.1;
  }

  // Repeated punctuation (e.g., "!!!", "???") indicates strong emotion
  const repeatedPunct = (transcript.match(/[!?]{2,}/g) || []).length;
  negativeHits += repeatedPunct * 0.3;

  const negativeDensity = wordCount > 0 ? negativeHits / wordCount : 0;
  const positiveDensity = wordCount > 0 ? positiveHits / wordCount : 0;
  
  // Better anger score calibration — scale more aggressively
  const angerScore = Math.min(100, Math.round(negativeDensity * 400));

  // Sentiment score: -100 to 100 — use a ratio-based approach for better spread
  const totalHits = negativeHits + positiveHits;
  let sentimentScore: number;
  if (totalHits === 0) {
    sentimentScore = 0;
  } else {
    const ratio = (positiveHits - negativeHits) / totalHits;
    sentimentScore = Math.max(-100, Math.min(100, Math.round(ratio * 100)));
  }

  // Filler detection
  const fillerBreakdown: Record<string, number> = {};
  let totalFillers = 0;
  const fillerLabels = ['um', 'uh', 'ugh', 'like', 'you know', 'basically', 'actually', 'literally', 'i mean', 'so', 'well', 'right?', 'okay so', 'kinda', 'sorta'];
  FILLER_PATTERNS.forEach((pattern, i) => {
    const matches = transcript.match(pattern);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      fillerBreakdown[fillerLabels[i]] = count;
      totalFillers += count;
    }
  });

  // Words per minute
  const durationMin = callDurationSec > 0 ? callDurationSec / 60 : 1;
  const wordsPerMinute = Math.round(wordCount / durationMin);

  // Tone classification — more nuanced thresholds
  let tone: ToneLevel;
  if (angerScore >= 40 || sentimentScore <= -60) tone = 'angry';
  else if (sentimentScore <= -25 || angerScore >= 25) tone = 'negative';
  else if (sentimentScore <= -10 || angerScore >= 10) tone = 'cautious';
  else if (sentimentScore >= 15) tone = 'positive';
  else tone = 'neutral';

  // Tone shift detection — compare first third vs last third for better sensitivity
  const thirdPoint = Math.floor(words.length / 3);
  const firstThird = words.slice(0, thirdPoint);
  const lastThird = words.slice(thirdPoint * 2);

  const firstScores = scoreWords(firstThird);
  const lastScores = scoreWords(lastThird);

  const firstSent = firstThird.length > 0
    ? (firstScores.positiveHits - firstScores.negativeHits) / Math.max(firstThird.length, 1)
    : 0;
  const lastSent = lastThird.length > 0
    ? (lastScores.positiveHits - lastScores.negativeHits) / Math.max(lastThird.length, 1)
    : 0;
  const scoreDelta = lastSent - firstSent;

  let toneShift = false;
  let toneShiftDirection: 'improving' | 'worsening' | 'stable' = 'stable';
  if (wordCount >= 15 && Math.abs(scoreDelta) > 0.015) {
    toneShift = true;
    toneShiftDirection = scoreDelta > 0 ? 'improving' : 'worsening';
  }

  return {
    angerScore,
    fillerCount: totalFillers,
    fillerBreakdown,
    wordsPerMinute,
    tone,
    sentimentScore,
    toneShift,
    toneShiftDirection,
    wordCount,
    isActive: true,
  };
}

export function useSentimentAnalysis(
  transcript: string,
  callDurationSec: number,
  isCallActive: boolean
): SentimentMetrics {
  return useMemo(() => {
    if (!isCallActive && !transcript) return DEFAULT_METRICS;
    return analyzeSentiment(transcript, callDurationSec);
  }, [transcript, callDurationSec, isCallActive]);
}
