import React, { useState, useEffect } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const Image: React.FC<ImageProps> = ({ src, alt, className, style, ...props }) => {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  if (hasError) {
    // Render a div with the same classes and style to maintain layout.
    // The background color will be inherited from parent or set by className.
    return <div className={className} style={style} />;
  }

  return <img src={src} alt={alt} className={className} style={style} onError={handleError} {...props} />;
};

export default Image;