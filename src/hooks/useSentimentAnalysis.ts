import { useMemo } from 'react';

// Negative/angry words and phrases
const ANGER_WORDS = new Set([
  'angry', 'furious', 'mad', 'frustrated', 'annoyed', 'irritated', 'pissed',
  'ridiculous', 'unacceptable', 'terrible', 'horrible', 'awful', 'worst',
  'hate', 'stupid', 'idiot', 'incompetent', 'useless', 'pathetic', 'disgusting',
  'outrageous', 'absurd', 'insane', 'scam', 'fraud', 'liar', 'lying', 'cheat',
  'ripped', 'screwed', 'damn', 'hell', 'crap', 'bullshit', 'shit', 'wtf',
  'sick', 'tired', 'fed', 'done', 'enough', 'never', 'demand', 'sue', 'lawyer',
  'complaint', 'manager', 'supervisor', 'escalate', 'report', 'cancel',
]);

const POSITIVE_WORDS = new Set([
  'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect',
  'awesome', 'love', 'thank', 'thanks', 'appreciate', 'happy', 'pleased',
  'satisfied', 'helpful', 'nice', 'good', 'best', 'brilliant', 'outstanding',
  'superb', 'terrific', 'delighted', 'glad', 'grateful', 'impressive',
  'beautiful', 'recommend', 'friendly', 'kind', 'professional', 'agree',
  'absolutely', 'definitely', 'sure', 'yes', 'right', 'correct', 'fine',
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

export function analyzeSentiment(
  transcript: string,
  callDurationSec: number
): SentimentMetrics {
  if (!transcript || transcript.trim().length < 5) return DEFAULT_METRICS;

  const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount < 3) return { ...DEFAULT_METRICS, wordCount, isActive: false };

  // Anger/negativity scoring
  let negativeHits = 0;
  let positiveHits = 0;
  words.forEach(w => {
    const clean = w.replace(/[^a-z]/g, '');
    if (ANGER_WORDS.has(clean)) negativeHits++;
    if (POSITIVE_WORDS.has(clean)) positiveHits++;
  });

  // Check for caps (shouting) — count words that are ALL CAPS and > 2 chars
  const rawWords = transcript.split(/\s+/).filter(Boolean);
  const capsCount = rawWords.filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  negativeHits += capsCount * 0.5;

  // Exclamation marks add to negative intensity
  const exclamations = (transcript.match(/!/g) || []).length;
  negativeHits += exclamations * 0.3;

  const negativeDensity = wordCount > 0 ? negativeHits / wordCount : 0;
  const positiveDensity = wordCount > 0 ? positiveHits / wordCount : 0;
  const angerScore = Math.min(100, Math.round(negativeDensity * 500));

  // Sentiment score: -100 to 100
  const rawSentiment = (positiveDensity - negativeDensity) * 250;
  const sentimentScore = Math.max(-100, Math.min(100, Math.round(rawSentiment)));

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

  // Tone classification
  let tone: ToneLevel;
  if (angerScore >= 50) tone = 'angry';
  else if (sentimentScore <= -30) tone = 'negative';
  else if (sentimentScore <= -10 || angerScore >= 20) tone = 'cautious';
  else if (sentimentScore >= 20) tone = 'positive';
  else tone = 'neutral';

  // Tone shift detection — compare first half vs second half
  const midpoint = Math.floor(words.length / 2);
  const firstHalf = words.slice(0, midpoint);
  const secondHalf = words.slice(midpoint);

  const firstNeg = firstHalf.filter(w => ANGER_WORDS.has(w.replace(/[^a-z]/g, ''))).length;
  const firstPos = firstHalf.filter(w => POSITIVE_WORDS.has(w.replace(/[^a-z]/g, ''))).length;
  const secondNeg = secondHalf.filter(w => ANGER_WORDS.has(w.replace(/[^a-z]/g, ''))).length;
  const secondPos = secondHalf.filter(w => POSITIVE_WORDS.has(w.replace(/[^a-z]/g, ''))).length;

  const firstScore = (firstPos - firstNeg) / Math.max(firstHalf.length, 1);
  const secondScore = (secondPos - secondNeg) / Math.max(secondHalf.length, 1);
  const scoreDelta = secondScore - firstScore;

  let toneShift = false;
  let toneShiftDirection: 'improving' | 'worsening' | 'stable' = 'stable';
  if (wordCount >= 20 && Math.abs(scoreDelta) > 0.02) {
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
