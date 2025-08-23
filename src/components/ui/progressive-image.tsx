import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  quality?: number;
}

export function ProgressiveImage({
  src,
  alt,
  placeholder,
  className,
  width,
  height,
  loading = 'lazy',
  quality = 85
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState(placeholder || createBlurPlaceholder());

  // Create a blur placeholder if none provided
  function createBlurPlaceholder() {
    // Create a tiny 1x1 transparent image as fallback
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
  }

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Load the actual image when in view
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setIsLoaded(true); // Still mark as "loaded" to stop loading state
    };
    img.src = src;
  }, [isInView, src]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-50',
          !isLoaded && placeholder ? 'blur-sm' : '',
          'w-full h-full object-cover'
        )}
        loading={loading}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="animate-pulse flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Optimized image component with srcset support
export function ResponsiveImage({
  src,
  alt,
  sizes,
  className,
  ...props
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  // Generate srcset for different screen densities
  const generateSrcSet = (baseSrc: string) => {
    const extensions = baseSrc.split('.').pop();
    const baseName = baseSrc.replace(`.${extensions}`, '');
    
    return [
      `${baseName}.${extensions} 1x`,
      `${baseName}@2x.${extensions} 2x`,
      `${baseName}@3x.${extensions} 3x`
    ].join(', ');
  };

  return (
    <img
      src={src}
      srcSet={generateSrcSet(src)}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      alt={alt}
      className={cn('max-w-full h-auto', className)}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}