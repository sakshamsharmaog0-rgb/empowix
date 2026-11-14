import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { resolveAssetUrl } from '../assets/imageRegistry';

interface AssetImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export const AssetImage: React.FC<AssetImageProps> = ({
  src,
  fallbackSrc,
  alt = 'Empowix Product',
  className = '',
  onError,
  ...rest
}) => {
  const resolvedSrc = resolveAssetUrl(src);
  const [currentSrc, setCurrentSrc] = useState<string>(resolvedSrc);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(resolveAssetUrl(src));
    setHasFailed(false);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && currentSrc !== resolveAssetUrl(fallbackSrc)) {
      setCurrentSrc(resolveAssetUrl(fallbackSrc));
    } else {
      setHasFailed(true);
    }
    onError?.(e);
  };

  if (hasFailed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 p-4 text-center ${className}`}
      >
        <ImageOff className="w-6 h-6 mb-1.5 opacity-60" />
        <span className="text-[10px] font-medium text-neutral-500 line-clamp-2 max-w-[140px]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...rest}
    />
  );
};
