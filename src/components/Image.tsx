import React, { useState, useEffect } from 'react';
import { getWebPath } from '../utils/localFileStorage';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  // src can now be a remote URL or a local filesystem URI
}

const Image: React.FC<ImageProps> = ({ src, alt, className, style, ...props }) => {
  const [hasError, setHasError] = useState(!src);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    setHasError(!src);
    if (src) {
      // If it's a remote URL, use it directly.
      // If it's a local file URI (starts with 'capacitor://'), convert it.
      if (src.startsWith('http')) {
        setImageSrc(src);
      } else if (src.startsWith('capacitor://')) {
        setImageSrc(getWebPath(src));
      } else {
        // Fallback for other cases, might be a relative path in public folder
        setImageSrc(src);
      }
    } else {
      setImageSrc(undefined);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  if (hasError || !imageSrc) {
    return <div className={className} style={style} />;
  }

  return <img src={imageSrc} alt={alt} className={className} style={style} onError={handleError} {...props} />;
};

export default Image;