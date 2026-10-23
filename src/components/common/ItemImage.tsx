import React from 'react';
import { CameraOff, ImageOff } from 'lucide-react';

interface ItemImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'card' | 'fill';
  compact?: boolean;
  showPlaceholderIcon?: boolean;
}

export const ItemImage: React.FC<ItemImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'card',
  compact = false,
}) => {
  const hasImage = Boolean(src && typeof src === 'string' && src.trim().length > 0);

  if (hasImage) {
    return (
      <img
        src={src!}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        loading="lazy"
        onError={(e) => {
          // If image fails to load, replace with neutral placeholder rather than showing broken icon or falling back to stock
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent && !parent.querySelector('.fallback-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className =
              'fallback-placeholder w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center';
            placeholder.innerHTML = `<span class="text-xs">Image unavailable</span>`;
            parent.appendChild(placeholder);
          }
        }}
      />
    );
  }

  // Neutral empty state placeholder with subtle camera-off / placeholder icon
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gray-100 text-campus-charcoal/40 select-none p-3 ${className}`}
      title="No photograph provided with this report"
    >
      <div className="w-10 h-10 rounded-full bg-gray-200/80 flex items-center justify-center text-gray-400 mb-1.5">
        <ImageOff className="w-5 h-5 stroke-[1.5]" />
      </div>
      {!compact && (
        <span className="text-[11px] font-medium text-gray-500 text-center tracking-tight">
          No photo provided
        </span>
      )}
    </div>
  );
};
