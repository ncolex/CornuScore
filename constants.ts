
import { ReviewCategory, ReputationLevel } from './types';

export const CATEGORIES: Record<ReviewCategory, { label: string; emoji: string; score: number; color: string }> = {
  [ReviewCategory.Infidelity]: { label: 'Infidelidad', emoji: '💔', score: -3, color: 'bg-red-500' },
  [ReviewCategory.Theft]: { label: 'Robo', emoji: '💰', score: -4, color: 'bg-black' },
  [ReviewCategory.Betrayal]: { label: 'Traición', emoji: '🔪', score: -3, color: 'bg-purple-600' },
  [ReviewCategory.Toxic]: { label: 'Toxicidad', emoji: '☢️', score: -2, color: 'bg-yellow-500' },
  [ReviewCategory.Positive]: { label: 'Positivo', emoji: '💖', score: 2, color: 'bg-green-500' },
};

export const REPUTATION_LEVELS: Record<ReputationLevel, { label: string; color: string; progressColor: string; icon: string }> = {
  [ReputationLevel.Positive]: { label: 'Confiable', color: 'text-green-500', progressColor: 'bg-green-500', icon: 'fa-solid fa-circle-check' },
  [ReputationLevel.Warning]: { label: 'Alerta', color: 'text-yellow-500', progressColor: 'bg-yellow-500', icon: 'fa-solid fa-circle-exclamation' },
  [ReputationLevel.Risk]: { label: 'Riesgo Alto', color: 'text-red-500', progressColor: 'bg-red-500', icon: 'fa-solid fa-circle-xmark' },
  [ReputationLevel.Unknown]: { label: 'Sin Datos', color: 'text-gray-400', progressColor: 'bg-gray-400', icon: 'fa-solid fa-circle-question' },
};
