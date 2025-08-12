import React from 'react';

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
      {src ? <img src={src} alt={alt} style={style} /> : <div style={{ width: size, height: size, background: 'rgba(255,255,255,0.06)', borderRadius: '9999px' }} />}
    </button>
  );
};

export default AvatarRing;