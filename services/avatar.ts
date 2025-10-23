// Helper utilities for avatar URLs

// Deterministic fallback avatar based on username (uses xsgames random users)
export const getDeterministicProfilePic = (username: string): string => {
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gender = hash % 2 === 0 ? 'male' : 'female';
  const avatarId = hash % 70; // ~70 avatars per gender
  return `https://xsgames.co/randomusers/assets/avatars/${gender}/${avatarId}.jpg`;
};

// Prefer public avatar service for Instagram usernames
export const getInstagramAvatarUrl = (username: string): string => {
  // Unavatar fetches public profile pictures without OAuth
  return `https://unavatar.io/instagram/${encodeURIComponent(username)}`;
};

