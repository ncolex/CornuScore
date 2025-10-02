const STORAGE_KEY = 'cornuscore-pseudo-user';

const adjectives = ['Chispa', 'Estrella', 'Rosa', 'Fenix', 'Brisa', 'Luna', 'Aura', 'Glow'];
const nouns = ['Valiente', 'Diva', 'Corazon', 'Guerrera', 'Sirena', 'Reina', 'Aliada', 'Amiga'];

const randomFrom = (items: string[]) => items[Math.floor(Math.random() * items.length)];

const generatePseudo = () => {
  const number = Math.floor(Math.random() * 900 + 100);
  return `${randomFrom(adjectives)}${randomFrom(nouns)}${number}`;
};

export const getPseudoUser = (): string => {
  if (typeof window === 'undefined') {
    return 'Invitada';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }

  const pseudo = generatePseudo();
  window.localStorage.setItem(STORAGE_KEY, pseudo);
  return pseudo;
};

export const setPseudoUser = (value: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, value);
};
