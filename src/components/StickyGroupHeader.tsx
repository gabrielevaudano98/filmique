import React from 'react';

interface StickyGroupHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

/**
 * StickyGroupHeader
 *
 * Renders a fixed-height spacer so the header doesn't shift content when it becomes sticky,
 * and shows a single sticky row with a left-aligned title and right-aligned actions.
 *
 * This keeps layout stable and makes it easy to place compact search/filter buttons next to the date.
 */
const TOPBAR_PX = 64; // height reserved for top bar (adjust if top bar height changes)
const HEADER_HEIGHT_PX = 56; // visual height of the header

const StickyGroupHeader: React.FC<StickyGroupHeaderProps> = ({ title, actions }) => {
  const topOffset = `calc(env(safe-area-inset-top, 0px) + ${TOPBAR_PX}px)`;

  return (
    <div className="mb-2">
      {/* Spacer keeps layout height identical whether header is sticky or not */}
      <div style={{ height: HEADER_HEIGHT_PX }} />

      {/* Sticky header — top offset accounts for safe-area + top bar */}
      <div
        style={{ top: topOffset }}
        className="sticky z-30 px-4"
      >
        <div className="flex items-center justify-between h-[56px]">
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
          {actions ? (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StickyGroupHeader;