import React, { useRef, useEffect, useState } from 'react';

interface StickyGroupHeaderProps {
  title: string;
}

/**
 * StickyGroupHeader
 *
 * Behavior:
 * - Renders a spacer element (fixed height) so the header's normal position is exactly
 *   where it appears in the flow (directly below the top bar).
 * - Uses a small sentinel (1px) above the header to detect when the header should be
 *   considered "stuck" using an IntersectionObserver. This avoids relying on threshold=1
 *   on the header itself which can be brittle across devices.
 * - Header uses CSS `position: sticky` with an inline `top` that accounts for the
 *   app top bar; visually changes when stuck (backdrop + border) without shifting content.
 *
 * Notes:
 * - If you change the top bar height, update TOPBAR_PX below so the sticky offset remains correct.
 */
const TOPBAR_PX = 80; // height of top bar (adjust if top bar height changes)
const HEADER_HEIGHT_PX = 56; // visual height of the group header (keeps layout stable)

const StickyGroupHeader: React.FC<StickyGroupHeaderProps> = ({ title }) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // When sentinel goes out of view above the top offset, the header becomes stuck.
    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry.isIntersecting === false => sentinel moved out of the root's view (i.e., header reached top offset)
        setIsStuck(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `-${TOPBAR_PX}px 0px 0px 0px`,
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // inline top ensures the sticky offset respects safe-area + topbar.
  const topOffset = `calc(env(safe-area-inset-top, 0px) + ${TOPBAR_PX}px)`;

  return (
    <>
      {/* sentinel sits immediately before the header; once it is scrolled past the top offset
          the header should be considered stuck. */}
      <div ref={sentinelRef} style={{ height: 1, width: '100%' }} />

      {/* spacer preserves the original flow height so the header doesn't jump when it becomes sticky */}
      <div style={{ height: HEADER_HEIGHT_PX }} />

      <h3
        // sticky positioning with computed top
        style={{ top: topOffset }}
        className={`sticky z-30 flex items-center px-4 text-lg font-semibold transition-all duration-200 ${isStuck ? 'bg-neutral-800/70 backdrop-blur-lg border-b border-neutral-700/50 shadow-sm' : 'bg-transparent border-transparent'}`}
      >
        <span className="truncate">{title}</span>
      </h3>
    </>
  );
};

export default StickyGroupHeader;