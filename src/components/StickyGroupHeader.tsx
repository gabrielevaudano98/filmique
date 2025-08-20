import React, { useRef, useEffect, useState } from 'react';

interface StickyGroupHeaderProps {
  title: string;
}

const StickyGroupHeader: React.FC<StickyGroupHeaderProps> = ({ title }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the header's intersection ratio is less than 1, it means it has
        // hit the top of the viewport and is now in its "sticky" state.
        setIsSticky(entry.intersectionRatio < 1);
      },
      {
        threshold: [1],
        // The root margin is set to the same offset as the sticky position.
        // This makes the observer trigger precisely when the element sticks.
        rootMargin: '-80px 0px 0px 0px',
      }
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

  const headerClasses = `sticky top-[80px] z-10 py-4 -mx-4 px-4 text-lg font-bold text-white pr-[150px] transition-colors duration-200 border-y ${
    isSticky
      ? 'bg-neutral-800/60 backdrop-blur-lg border-neutral-700/50'
      : 'bg-transparent border-transparent'
  }`;

  return (
    <h3 ref={ref} className={headerClasses}>
      {title}
    </h3>
  );
};

export default StickyGroupHeader;