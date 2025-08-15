import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderSrc?: string;
  containerClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, placeholderSrc, className, containerClassName, alt, ...rest }) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'); // transparent pixel
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    const currentImageRef = imageRef.current;

    if (currentImageRef) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src || '');
              observer.unobserve(currentImageRef);
            }
          });
        },
        { rootMargin: '200px' } // Load images 200px before they enter the viewport
      );
      observer.observe(currentImageRef);
    }

    return () => {
      if (observer && currentImageRef) {
        observer.unobserve(currentImageRef);
      }
    };
  }, [src]);

  return (
    <div className={`relative ${containerClassName || ''} ${isLoading ? 'bg-neutral-800' : ''}`}>
      <img
        ref={imageRef}
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className || ''}`}
        onLoad={() => setIsLoading(false)}
        {...rest}
      />
    </div>
  );
};

export default LazyImage;