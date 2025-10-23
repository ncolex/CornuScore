// Fix: Create type definitions for the application.
export enum ReviewCategory {
  Infidelity = 'INFIDELITY',
  Theft = 'THEFT',
  Betrayal = 'BETRAYAL',
  Toxic = 'TOXIC',
  Positive = 'POSITIVE',
}

export enum ReputationLevel {
  Positive = 'POSITIVE',
  Warning = 'WARNING',
  Risk = 'RISK',
  Unknown = 'UNKNOWN',
}

export interface Review {
  id: string;
  category: ReviewCategory;
  text: string;
  score: number;
  date: string; // ISO 8601 format
  pseudoAuthor: string;
  confirmations: number;
  evidenceUrl?: string;
  personReviewed?: string; // For user profile page
}

export interface PersonProfile {
  id: string;
  identifiers: string[]; // e.g., ['John Doe', '@johndoe', '123456789']
  country: string;
  totalScore: number;
  reputation: ReputationLevel;
  reviews: Review[];
}

export interface UserProfile {
  id: string;
  pseudoUsername: string;
  contributionScore: number;
  reviews: Review[];
}

export interface WebCheckResult {
    id: string;
    source: string; // e.g., 'Google', 'Facebook', 'LinkedIn'
    title: string;
    link: string;
    snippet: string;
    status?: 'found' | 'not_found' | 'info';
}

export interface InstagramSearchResult {
  username: string;
  profilePicUrl: string;
  fullName: string;
}