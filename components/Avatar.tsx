import React, { useEffect, useState } from 'react';
import { getDeterministicProfilePic } from '../services/avatar';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  username: string;
  provider?: string; // e.g., 'instagram'
  src: string; // primary URL to try first
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ username, provider = 'instagram', src, className = '', alt, ...imgProps }) => {
  const cacheKey = `avatar:${provider}:${username}`;
  const [imgSrc, setImgSrc] = useState<string>(() => {
    try {
      const cached = window.sessionStorage.getItem(cacheKey);
      return cached || src;
    } catch {
      return src;
    }
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // If username changes, re-evaluate cached value
    try {
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached) setImgSrc(cached);
      else setImgSrc(src);
    } catch {
      setImgSrc(src);
    }
    setLoaded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, src]);

  const handleLoad = () => {
    setLoaded(true);
    try {
      window.sessionStorage.setItem(cacheKey, imgSrc);
    } catch {
      // ignore
    }
  };

  const handleError = () => {
    const fallback = getDeterministicProfilePic(username);
    setImgSrc(fallback);
    try {
      window.sessionStorage.setItem(cacheKey, fallback);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-full ${className}`.trim()}>
      {/* Skeleton placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        {...imgProps}
        src={imgSrc}
        alt={alt || `Foto de perfil de ${username}`}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={`object-cover w-full h-full transition-all duration-300 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-sm'}`}
      />
    </div>
  );
};

export default Avatar;

