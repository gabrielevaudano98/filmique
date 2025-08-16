import React, { useState, useEffect, useRef } from 'react';

interface StickyGroupHeaderProps {
  children: React.ReactNode;
}

const StickyGroupHeader: React.FC<StickyGroupHeaderProps> = ({ children }) => {
  const [isSticky, setIsSticky] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the element is not fully intersecting at the top margin, it's considered "stuck".
        const isStuck = entry.intersectionRatio < 1;
        setIsSticky(isStuck);
      },
      { threshold: [1], rootMargin: "-140px 0px 0px 0px" } // Matches the `top-[140px]` style
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <h3
      ref={ref}
      className={`sticky top-[140px] z-20 py-2 -mx-4 px-4 text-lg font-bold text-white mb-3 border-y transition-colors duration-300
        ${isSticky 
          ? 'bg-neutral-900/20 backdrop-blur-lg border-neutral-700/50' 
          : 'bg-transparent border-transparent'
        }`}
    >
      {children}
    </h3>
  );
};

export default StickyGroupHeader;