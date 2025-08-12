Filmique — Rebrand Wireframes & Implementation Guide
=====================================================

Overview
--------
These wireframes describe the reimagined UI to evoke iOS‑26 premium feel: glass layers, soft depth, large balanced typography, and a warm amber gradient accent. Each screen includes intent, layout breakdown, key components, micro-interactions, and development notes.

Global Layout & Patterns
------------------------
- Safe area aware header (TopBar) with subtle translucent backdrop blur and centered title.
- System dynamic island: allocate top center space for ephemeral camera / story indicators (Layered overlay).
- Primary navigation: compact floating tab bar (center camera button elevated) with large hit targets and subtle shadow.
- Card language: full-bleed soft radius 16px, glass overlay, inner content padding 16–20px, depth shadow (soft).
- Use semantic tokens from src/design/brand.ts for color values and tailwind config for classes.

Key Visuals
-----------
- Dominant gradient: brand.sunglass used for call-to-actions and subtle card accents.
- Glass surfaces: semi-transparent white/black with subtle inner blur and inner stroke.
- Iconography: lucide-react remains fine; treat icons as single-color masks using brand accent or neutral tones.

Screens (page-by-page)
----------------------

1) Launch / Splash
   - Intent: instant brand impression, fast entry into login.
   - Layout: full-bleed gradient (sunglass) blurred into background; centered refined logo (src/assets/app-icon.svg) in circular glass token; subtle shimmer.
   - Motion: 450ms scale in (spring-soft) for logo, then cross-fade to login.
   - Dev notes: pre-warm fonts to avoid layout shift.

2) Login / Email Entry
   - Intent: approachable and calm; clear CTA.
   - Layout: translucent card centered, left: small emblem, right: form stacked with large title, input, CTA button.
   - Typography: largeTitle for "Filmique"; body1 for helper copy.
   - CTA: primary gradient fill (sunglass), rounded 14px, shadow micro.
   - Micro-interactions: button press 90ms scale; input focus shows amber outline (thin).

3) OTP / Verification
   - Intent: fast verification with clear code entry.
   - Layout: large numeric input (font-mono), countdown, resend secondary CTA.
   - Motion: micro fades on code entry and 'success' pulse on verification.
   - Accessibility: large target for numbers; haptics on successful verification.

4) Home / Community Feed
   - Layout: header with stories carousel (rounded-24 avatars with gradient ring), stacked cards below.
   - Cards (RollPostCard):
     - Full-bleed image with soft rounded corners, gradient overlay at bottom with caption and profile.
     - Elevation: soft shadow; on press: scale 0.996 + shadow intensify.
   - Stories:
     - Tappable circular avatars open FullStoryViewer (modal).
     - Tap region large; long-press reveals story preview.
   - Interactions: carousel swipe, story progress bars linear, comment input slide up with keyboard detection.

5) Camera
   - Layout: fullscreen camera view with bottom control rail in translucent frosted glass card.
   - Camera center button: large circular white with amber border; on tap: shutter flash, short haptic, capture animation (micro).
   - "PRO" mode slider rows appear as layered horizontal scrubbing RangeSelector; center marker with small numeric readout.
   - Dynamic island hooks: when recording or significant camera events occur, small transient pill at top center.

6) Rolls (Developed / Developing)
   - Two tabs: developed (grid) and developing (stacked cards).
   - Developed Grid:
     - Card aspect 4/5 with image top, details below; rename button sits on top-right ghost control.
     - Group by month-year with sticky group headings (glass pill).
   - Developing Card:
     - Progress bar with warm gradient fill; CTA 'Develop Now' prominent if user can afford.
     - Cost chip with small tooltip interaction.

7) Roll Detail
   - Grid of thumbnails in a polished masonry; tapping opens PhotoDetailModal (full screen).
   - Modal:
     - Dark translucent backdrop, centered image with subtle drag-to-dismiss and pinch-to-zoom support.
     - Floating action bar with download / share / delete.

8) Profile
   - Large avatar (editable) left, stats centered as horizontally spaced highlight cards.
   - Tabs: posts / feed / badges with animated underline.
   - Bio editing inline with autosave micro-interaction (save spinner and "Saved" micro-toast).

9) Album Detail & Manage Rolls Modal
   - Album header with back control, manage roll CTA.
   - ManageRollsModal: list of developed rolls with selection checkboxes, real-time photo count to enforce album limit.
   - Interaction: selecting a roll animates a subtle pop effect and updates the photo count.

10) Settings & Notifications
   - Settings groups: card sections with clear icons and right chevrons.
   - Notifications: list with unobtrusive avatars, unread indicator small amber dot; 'Mark all as read' produces a tiny success haptic + fade.

Implementation Guidance
-----------------------
- Use CSS variables tied to tokens in src/design/brand.ts for colors/shadows so designers and devs share values.
- Use Tailwind extensions in tailwind.config.js to map semantic tokens to utility classes (done in updated config).
- Build small shared components: GlassCard, AccentButton, CardHeader, AvatarStack — keep them consistent and composable.
- Respect accessibility: dynamic type, alt text for images, sufficient contrast. Implement prefers-reduced-motion fallbacks.

High-fidelity mockup notes
--------------------------
- Imagery: full-bleed photos should be slightly desaturated and warmed by an overlay when used as backgrounds (use filmPresets for consistent look).
- Lighting: each card uses a subtle top gradient highlight (glassTop) to suggest curvature.
- Spacing: 16px base, 20px medium, 24px large. Border radius: 14–18px for primary cards, 10px for small chips.
- Shadows: micro for small elements, soft for cards, depth for primary CTAs.

Developer checklist (first sprint)
---------------------------------
1. Add design tokens to codebase (done: src/design/brand.ts).
2. Update Tailwind config (done).
3. Build core components: GlassCard, AccentButton, FloatingTabBar, StoryRollsCarousel (use the new tokens).
4. Replace TopBar and TabBar visuals with glass + gradient styles.
5. Implement motion primitives (CSS vars + small JS helpers) and respect reduced-motion.
6. Iterate screens using the wireframes above; produce a clickable prototype using Figma or Framer to validate motion.

Assets
------
- App icon and logo included at src/assets/app-icon.svg (simple refined mark, can be exported to required resolutions).
- Use supplied photographic assets as placeholders, replace with high-res user photos in production.

End of wireframes document. Use this as the canonical implementation guide for the iOS‑26 rebrand.