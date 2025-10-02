import { ReviewCategory, ReputationLevel } from '../types';
import { CATEGORIES } from '../constants';

export const getScoreFromCategory = (category: ReviewCategory): number => {
  return CATEGORIES[category]?.score ?? 0;
};

export const calculateReputationLevel = (
  score: number,
  totalReviews: number,
): ReputationLevel => {
  if (totalReviews === 0) return ReputationLevel.Unknown;
  if (score > 0) return ReputationLevel.Positive;
  if (score >= -5) return ReputationLevel.Warning;
  return ReputationLevel.Risk;
};
