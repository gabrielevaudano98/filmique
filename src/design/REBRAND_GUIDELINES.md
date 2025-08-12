Filmique — iOS 26 Rebrand Guidelines
====================================

Overview
--------
This document captures a complete rebrand for Filmique oriented around iOS 26 aesthetics: soft glass, depth, dynamic gradients, tactile micro‑interactions, and a refined typographic hierarchy built for legibility and presence on modern devices (including Dynamic Island and large displays). It is implementation-ready: design tokens, Tailwind/CSS variable suggestions, annotated wireframes for every main view, motion guidelines, and asset specs.

Goals
- Modern, elegant, premium feel that reads both cinematic and tactile.
- Maintain existing functionality; reorganize UI for discoverability and delight.
- Fully accessible: color contrast, dynamic type, reduced-motion support.
- Ready for incremental developer implementation (CSS variables / Tailwind tokens).

1) Visual Identity — Color System
---------------------------------
Design approach: two core gradients (Warm Amber → Apricot, Deep Violet → Indigo) layered as depth lights. Surfaces use soft frosted glass with subtle noise and depth. Provide both Light and Dark adaptions and token names for implementation.

Color Tokens (HEX / sRGB / usage)

Primary gradient
- --brand-primary-1: #EFA15A (239,161,90) — amber warm (light accent)
- --brand-primary-2: #D46A2E (212,106,46) — core brand orange
- Gradient usage: background accents, CTA gradients (linear-gradient(135deg, var(--brand-primary-1), var(--brand-primary-2)))

Secondary gradient
- --brand-alt-1: #8B6AD6 (139,106,214) — violet
- --brand-alt-2: #5B47C9 (91,71,201) — indigo
- Gradient usage: secondary CTAs, surfaced highlights, story rings

Neutrals (Dark Theme)
- --bg-900: #07070a (7,7,10)
- --bg-800: #0f1013 (15,16,19)
- --surface-700: rgba(255,255,255,0.04) (for glass overlays)
- --surface-600: rgba(255,255,255,0.03)
- --muted-500: #9ea3ad (158,163,173)
- --text-100: #ffffff
- --text-200: #e6e7e9

Neutrals (Light Theme)
- --bg-100: #f7f7f8
- --bg-200: #f0f1f2
- --surface-100: rgba(255,255,255,0.8)
- --muted-400: #6b7280
- --text-900: #0b0b0c

Semantic colors
- --success: #34D399 (52,211,153)
- --error: #FB7185 (251,113,133)
- --warning: #FBBF24 (251,191,36)
- --info: #60A5FA (96,165,250)

Glass & depth helpers
- --glass-blur: 18px
- --glass-alpha: 0.18 (dark) / 0.6 (light)
- --elev-1: 0 6px 18px rgba(7,8,11,0.36)
- --elev-2: 0 12px 36px rgba(7,8,11,0.46)

CSS Variable Examples (suggested)
:root {
  --brand-primary-1: #EFA15A;
  --brand-primary-2: #D46A2E;
  --brand-alt-1: #8B6AD6;
  --brand-alt-2: #5B47C9;
  --bg-900: #07070a;
  --bg-800: #0f1013;
  --surface-700: rgba(255,255,255,0.04);
  --glass-blur: 18px;
  --glass-alpha: 0.18;
  --elev-1: 0 6px 18px rgba(7,8,11,0.36);
  --success: #34D399;
  --error: #FB7185;
}

Light mode overrides:
[data-theme="light"] { --bg-900: #f7f7f8; --text-100: #0b0b0c; --glass-alpha: 0.9; }

Tailwind mapping (quick)
- map colors under theme.extend.colors: brand-primary-1/2, brand-alt-1/2, surface-*, bg-*
- add utilities for glass: .glass { backdrop-filter: blur(var(--glass-blur)); background-color: rgba(255,255,255,var(--glass-alpha)); }

2) Typography System
--------------------
Principles: iOS native type (SF Pro Text / Display) for best legibility. Use Dynamic Type scale for responsiveness. Provide web-safe fallbacks. Use variable font where possible for smooth weight transitions.

Font stack
- Primary: "SF Pro Display" / "SF Pro Text" (system default iOS)
- Fallbacks: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif

Core scale (sizes in pixels for 1x baseline; use rems in CSS)
- Display Large (Hero) — 42–56px, weight 700 — Use for marketing hero (Login page)
- Title 1 — 28px, 600 — Primary view titles (Community, Rolls)
- Title 2 — 22px, 600 — Section headings
- Headline — 18px, 600 — Card headings, strong labels
- Body — 16px, 400 — Primary body copy
- Callout — 15px, 500 — Secondary emphasis (CTA micro-labels)
- Caption — 13px, 400 — Timestamps, helper text
- Footnote — 11–12px, 400 — Tiny UI labels

Line heights & letter spacing example
- Body 16px: line-height 24px (1.5), letter-spacing 0
- Headline 18px: line-height 26px (1.44)
- Caption 13px: line-height 18px, letter-spacing 0.02em

Usage examples
- Screen title: Title 1
- Section heading: Title 2
- Card title: Headline
- Primary button label: Callout or Headline (depending on prominence)
- Metadata (timestamps, small labels): Caption

Accessibility notes
- Respect Dynamic Type; use relative units (rem/em).
- Scale spacing proportionally; ensure components reflow.
- Enforce minimum accessible font-size (14px) for controls if content gets compressed.

3) Iconography
---------------
- Continue using lucide-react but adopt a consistent weight and rounded style: stroke 1.5–2.0 with 10–14% corner radius where possible.
- Create an icon token set: primary (filled/strong) for key actions, outline for secondary.
- Story rings & story highlights: circular gradient ring from brand-primary → alt gradient with 2px white separator.
- Icon sizing token: small 16, medium 20, large 24, hero 28/32.

4) Layout & Component Redesign — Page by page
----------------------------------------------

Global patterns
- Use a top safe-area-aware header with subtle frosted glass and centered brand wordmark (small).
- Main content sits on layered surfaces: base background (gradient), large glass cards (sections) with elevated shadows.
- Spacing: base spacing scale 4,8,12,16,20,24,32,48. Grid: 4 column responsive on tablet, 2–3 on phone.

A. Authentication (LoginView / OtpView)
- Wireframe: Full-bleed gradient background (primary gradient), centered glass card with soft rounded corners (20px), high‑contrast CTA.
- Hierarchy: App mark (circular), Hero title (Display Large reduced on small screens), subtitle. Input fields with pill shape and subtle inset glass.
- Micro-interactions: Input focus raises card elevation, CTA gradient animates left→right subtle sheen on idle (3s loop), OTP input auto-advance, copy/paste support.
- Accessibility: Large touch targets, clear error states (red border + inline message), placeholder ARIA labels.

B. OnboardingView
- Wireframe: multi-step horizontal flow inside glass card. Left column imagery, right column form content on larger screens; stack on small screens.
- Notable UI: Avatar upload with live preview and upload progress micro-interaction. Consent checkbox follows Material-style but iOS aesthetics (rounded).
- Motion: step transitions via horizontal spring animation (duration 400–520ms).

C. TopBar / Navigation
- TopBar: frosted glass, centered brand monogram + small wordmark. Right icon: notification bell with soft orange badge.
- Bottom nav: centered camera button elevated and large, other tabs minimized icons only. Buttons have "press" micro bounce and short haptic tap.

D. RollsView (Main)
- Hero: Current Roll card (prominent, gradient strip showing progress), quick actions.
- Tabs: Developed | Developing segmented control with pill styling and soft shadow.
- Developed grid: cards with large image, title overlay and metadata (shots, date). On hover/tap, a reveal bar with quick actions (share, download, rename).
- Timeline scrubber: vertical, glass track with tactile dots; on drag, content auto-scroll and haptic ticks per year tick (light).
- Accessibility: option to switch to list mode for compactness.

E. CameraView
- Full-bleed camera preview with centrally placed shutter. UI overlays are minimal: top-left back; left film picker; right zoom & switch; bottom pro controls page-up.
- Pro controls: overlay panel that lifts from bottom as a glass surface (like iOS Control Center) with smooth physics (spring).
- Native camera: integrate dynamic island considerations — when active, show a subtle pill-shaped indicator in the top center.
- Micro-interactions: shutter depress (scale), shutter sound option, haptic + visual shutter ripple.

F. Roll Detail / Photo Grid
- Grid with floating action toolbar for download/share/delete. Each photo opens PhotoDetailModal: full-bleed image on black frosted backdrop, meta sheet appears with “download” and “info” with node-like haptics.

G. Community / Feed
- Stories carousel: circular avatars with gradient story ring; on tap opens FullStoryViewer modal; swipe left/right to change posts (use swipeable gestures).
- Discover feed: horizontal scroller cards for posts (hero vertical card look), each card uses glass overlay and gradient accents.
- Create Post modal: step flow: select roll → choose cover → caption. Provide inline previews, image selection grid, publish animation (a short pop + confetti micro action).

H. Profile
- Big avatar with layered cards below: stats, bio (editable inline), posts grid.
- Badges: circular tokens with soft shadows and micro-animations when earned (scale + glow pulse).

I. Settings / Notifications
- Lists grouped in frosted containers; toggles use iOS-style rounded switches. “Delete account” emphasized in destructive red with confirm modal (modal with haptic “heavy” on confirm).

Annotated layout notes
- Cards: radius 16–20px, padding 16–24px. Use layered shadows for depth; elevate on interaction.
- Buttons: two primary shapes: pill CTA (gradient background, strong shadow) and ghost (glass, subtle border). Use consistent padding and min-height 44px.
- Forms: text inputs 56px height for tapping comfort, corner radius 12px.
- Counters and microlabels: use rounded small capsules with background surface.

5) Micro-interactions & Motion
------------------------------
Motion principles
- Use motion to clarify state changes and continuity, not decoration. Respect prefers-reduced-motion.
- Easing: iOS native feels: cubic-bezier(0.22, 1, 0.36, 1) for enter; ease-out cubic for subtle fades.
- Durations:
  - Quick micro: 120–180ms (button presses, icon tints)
  - Choreography: 260–420ms (sheet open, cards)
  - Big transitions: 520–700ms (screen-changes, story progression)
- Physics: use spring for tactile components (stiffness medium, damping high).
- Haptics: light for small taps, medium for toggles/actions, heavy for destructive actions (delete).

Interaction patterns
- Button press: scale to 0.985 + shadow increase + 10ms delay to release.
- Modal open: fade+scale with slight upward translation (scale 0.98 → 1.00, translateY 16 → 0).
- List reordering / drag: connected spring with placeholder ghost.
- Story scrubber: tick haptics each 1 year or key frame; visual accent on the center marker.

6) Accessibility & Localization
-------------------------------
- Color contrast: ensure minimum 4.5:1 for body text; 3:1 for large titles. Provide tokens for accessible high-contrast overrides.
- Dynamic type: use rem units; support all iOS text sizes.
- Keyboard & screen reader: ensure semantic HTML/ARIA; label all controls.
- Localize layout for RTL: mirrored paddings and icon order.

7) Branding Assets
------------------
Logo concept
- Wordmark: simplified wordmark "Filmique" using SF Pro Display Heavy for the "Film" and a delicate ligature for "ique" with an accent glyph (small circular aperture).
- Mark: circular aperture monogram — subtle gradient ring (brand-primary → alt) with internal 3-blade aperture silhouette.
- Deliverables: SVG master (layers for ring, aperture, color); PNG export at 2x,3x for splash/app icons.

App icon & splash
- App icon: trim to rounded square, layered gradient ring, slight inner shadow, monogram in the center in white or soft gold.
- Sizes: Provide iOS icon sizes (20@1/2/3, 29, 40, 60, 76, 83.5, 1024) — developer export-ready.
- Splash: animated subtle gradient shift with central mark; short 600ms fade to home.

Micro-branding touches
- Story ring colors correspond to moment type (personal / trending / featured) by shifting gradient hue (amber → violet).
- Use small brand-colored badges (amber) to emphasize XP/credits.

8) Implementation notes for developers
--------------------------------------
Token-first approach
- Create CSS variables (root + [data-theme="light"]) and map into Tailwind theme.
- Keep tokens minimal and composable: colors, spacing, radius, elevation, motion durations.

Suggested repository steps (not executed here)
- Add src/design tokens: src/styles/tokens.css (or a design tokens JSON).
- Update tailwind.config.js theme.extend.colors to reference token values.
- Provide a small UI component library: Button, GlassCard, Chip, Toasts using tokens.

Image handling & performance
- Use responsive srcset for photos; use webp and appropriate compression.
- For heavy filters (applyFilter using canvas), run development on server-side edge functions when scaling; client local processing is OK for small labs.

Accessibility flags
- Maintain prefers-reduced-motion and a high-contrast toggle.
- Include aria-labels and focus-visible states (already in index.css, keep consistent token color).

9) Page-by-page wireframe thumbnails (annotated)
------------------------------------------------
Below are short annotated wireframes for each main screen describing major regions and interactions. These are intended to be converted into Figma/Sketch artboards.

- Login / OTP
  - Full gradient background
  - Center glass card: logo, hero title, email input, CTA (primary pill)
  - Micro: button shimmer, OTP auto-focus

- Onboarding
  - Stepper top
  - Avatar tile left, form right
  - Consent checkbox, privacy CTA
  - Micro: avatar upload progress bar

- RollsView
  - Header (glass)
  - Current Roll card (hero)
  - Tabs segmented
  - Card grid with sticky month/year headers
  - Timeline scrubber floating right on wide screens

- Camera
  - Full viewport preview
  - Top controls (back, small indicator)
  - Center shutter
  - Bottom pro sliding panel
  - Film selector modal (sheet)

- Roll Detail
  - Title + meta row
  - Grid gallery
  - Floating action toolbar (download/share/delete)
  - Detail modal with download and info

- Community
  - Stories carousel
  - Filter pills
  - Horizontal feed scroller (RollPostCard)
  - Create Post flow modal steps

- Profile
  - Avatar & Stats header
  - Bio editable inline
  - Tabs: Posts / Feed / Badges with content
  - Badges grid with tooltip

- Settings
  - Grouped list
  - Destructive actions clear and confirmed
  - Logout & account deletion flows

10) Motion / Animation Guidelines (practical)
---------------------------------------------
- Use CSS transitions for simple changes (color/opacity).
- Use requestAnimationFrame–based libraries (e.g., Framer Motion) for complex gestures and physics.
- Use small motion libraries with declarative spring parameters for consistent feeling across components.
- Respect prefers-reduced-motion: fallback transitions to fades or no motion.

11) Example UI tokens & mapping (quick reference)
-------------------------------------------------
Spacing
- gap-1: 4px, gap-2: 8px, gap-3: 12px, gap-4: 16px, gap-5: 20px, gap-6: 24px, gap-8: 32px

Radii
- r-sm: 8px; r-md: 12px; r-lg: 18px; r-pill: 9999px

Shadow/elevation
- elev-1: 0 6px 18px rgba(7,8,11,0.36)
- elev-2: 0 12px 36px rgba(7,8,11,0.46)

Button tokens
- btn-primary: background: linear-gradient(135deg,var(--brand-primary-1),var(--brand-primary-2)); color: var(--text-900)
- btn-ghost: background: transparent; border: 1px solid rgba(255,255,255,0.06)

12) Suggested new design files for the team (deliverables)
-----------------------------------------------------------
- Figma/Sketch file: "Filmique – iOS26 System" (pages: Tokens, Icons, Components, Screens, Motion)
- Export folder: /assets/brand/ (SVG master, app icons @2x/3x, logo variations, splash animation frames)
- Storybook: implement core components and tokens for rapid QA.

13) Next steps & recommended rollout
------------------------------------
1. Create token file (CSS variables + token JSON).
2. Implement base tokens into tailwind.config.js (theme.extend).
3. Replace global index.css tokens (or add new CSS tokens file).
4. Build small component library: GlassCard, PrimaryButton, TopBar, BottomNav, Modal.
5. Iterate pages in Figma then implement in code incrementally (start with Login, RollsView, Camera).
6. Add motion using a small animation library (Framer Motion) or CSS + prefers-reduced-motion fallback.
7. Deliver accessibility QA and visual regression tests.

Appendix — quick color palette snapshot
---------------------------------------
Dark mode primary gradient: #EFA15A → #D46A2E  
Accent gradient: #8B6AD6 → #5B47C9  
Dark surface: #07070a, #0f1013  
Light surface: #f7f7f8, #f0f1f2  
Semantic: success #34D399, error #FB7185, warn #FBBF24

Closing
-------
This design system balances cinematic warmth and modern iOS minimalism. It is built to be implemented piece-by-piece with tokens, so developers can start by adding variables and mapping to Tailwind, then replace components incrementally.

If you want, I can:
- generate the token file (CSS and/or JSON) and add an initial Tailwind mapping,
- create a small component set (Button, GlassCard, TopBar) in the codebase as React + Tailwind components for a live preview,
- produce Figma-ready SVG assets (logo/app icon) drafts.

Request which of the above you want implemented next and I will create the files and code snippets accordingly.