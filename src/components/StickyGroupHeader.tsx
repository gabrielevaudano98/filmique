import React, { useRef, useEffect, useState } from 'react';

interface StickyGroupHeaderProps {
  title: string;
}

const StickyGroupHeader: React.FC<StickyGroupHeaderProps> = ({ title }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    let safeAreaTopPx = 0;
    // Get the computed value of --safe-area-inset-top
    const rootStyle = getComputedStyle(document.documentElement);
    const safeAreaTop = rootStyle.getPropertyValue('--safe-area-inset-top');
    if (safeAreaTop && safeAreaTop.endsWith('px')) {
      safeAreaTopPx = parseFloat(safeAreaTop);
    }

    // TopBar height is h-20, which is 80px.
    // The total offset for the sticky header is 80px + safeAreaTopPx.
    const stickyOffset = 80 + safeAreaTopPx;

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
        rootMargin: `-${stickyOffset}px 0px 0px 0px`,
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

  const headerClasses = `sticky top-[calc(80px + var(--safe-area-inset-top))] z-10 py-4 px-4 pl-[calc(1rem+var(--safe-area-inset-left))] pr-[calc(1rem+var(--safe-area-inset-right))] text-lg font-bold text-white transition-colors duration-200 border-b ${
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