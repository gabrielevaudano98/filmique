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
        setIsSticky(entry.intersectionRatio < 1);
      },
      {
        threshold: [1],
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

  const headerClasses = `sticky top-[80px] z-10 py-4 -mx-4 px-4 text-lg font-bold text-black dark:text-white pr-[150px] transition-colors duration-200 border-y ${
    isSticky
      ? 'bg-white/70 dark:bg-neutral-800/60 backdrop-blur-lg border-neutral-200 dark:border-neutral-700/50'
      : 'bg-transparent border-transparent'
  }`;

  return (
    <h3 ref={ref} className={headerClasses}>
      {title}
    </h3>
  );
};

export default StickyGroupHeader;