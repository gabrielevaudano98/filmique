import React from 'react';
import Image from './Image';

interface AvatarRingProps {
  src?: string | null;
  size?: number;
  alt?: string;
  onClick?: () => void;
}

const AvatarRing: React.FC<AvatarRingProps> = ({ src, size = 48, alt = 'avatar', onClick }) => {
  const style: React.CSSProperties = {
    width: size,
    height: size,
  };

  return (
    <button onClick={onClick} className="avatar-ring" style={{ padding: Math.max(3, Math.round(size * 0.06)) }}>
      <Image src={src} alt={alt} style={style} loading="lazy" decoding="async" className="bg-neutral-800" />
    </button>
  );
};

export default AvatarRing;