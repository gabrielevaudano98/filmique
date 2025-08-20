import React from 'react';

interface StickyGroupHeaderProps {
  title: string;
  controls?: React.ReactNode;
  className?: string;
}

/**
 * StickyGroupHeader
 *
 * A predictable, two-row sticky header used for grouped lists in the Studio.
 * - Row 1: group title (compact)
 * - Row 2: optional controls (search, display options)
 *
 * The header uses a top offset that respects the safe-area inset and the main top bar height,
 * keeping the header visually anchored beneath the app TopBar when it becomes sticky.
 */
const TOPBAR_PX = 64; // adjust if the TopBar height changes
const HEADER_HEIGHT_PX = 52; // height of the sticky container (rows included)

const StickyGroupHeader: React.FC<StickyGroupHeaderProps> = ({ title, controls, className = '' }) => {
  const topOffset = `calc(env(safe-area-inset-top, 0px) + ${TOPBAR_PX}px)`;

  return (
    <div className={`w-full ${className}`}>
      {/* spacer keeps layout stable so content doesn't jump */}
      <div style={{ height: HEADER_HEIGHT_PX }} />

      <div
        className="sticky z-40 w-full left-0 right-0 backdrop-blur-md bg-neutral-900/60 border-b border-neutral-700/50"
        style={{ top: topOffset }}
        aria-hidden={false}
      >
        <div className="px-4 py-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white truncate">{title}</h3>
          {/* reserved area for an optional lightweight action row (kept small) */}
          <div className="flex items-center gap-2">{/* intentionally empty for alignment */}</div>
        </div>

        {controls && (
          <div className="px-4 pb-2 pt-1 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/*
                controls are expected to be compact components that handle their own responsive behavior.
                We wrap in min-w-0 so children using truncation/overflow work correctly within the sticky bar.
              */}
              <div className="min-w-0">{controls}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyGroupHeader;