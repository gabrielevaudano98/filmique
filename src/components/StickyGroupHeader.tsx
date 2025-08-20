import React from 'react';

interface StickyGroupHeaderProps {
  title: string;
}

/**
 * Simplified StickyGroupHeader
 *
 * Renders a fixed-height spacer so the header doesn't shift content when it becomes sticky,
 * and uses a single sticky <h3> with a predictable top offset that respects safe-area insets.
 *
 * NOTE: This avoids the sentinel/IntersectionObserver approach which caused rendering glitches
 * across different devices and made the header appear in the wrong place.
 */
const TOPBAR_PX = 64; // height reserved for top bar (adjust if top bar height changes)
const HEADER_HEIGHT_PX = 56; // visual height of the header

const StickyGroupHeader: React.FC<StickyGroupHeaderProps> = ({ title }) => {
  const topOffset = `calc(env(safe-area-inset-top, 0px) + ${TOPBAR_PX}px)`;

  return (
    <div>
      {/* Spacer keeps layout height identical whether header is sticky or not */}
      <div style={{ height: HEADER_HEIGHT_PX }} />

      {/* Sticky header — top offset accounts for safe-area + top bar */}
      <h3
        style={{ top: topOffset }}
        className="sticky z-30 flex items-center px-4 text-lg font-semibold transition-all duration-200"
      >
        <span className="truncate">{title}</span>
      </h3>
    </div>
  );
};

export default StickyGroupHeader;