Motion System — Filmique (iOS‑26 style)
======================================

Principles
----------
- Motion should be purposeful, subtle, and fast — confirm an action rather than distract.
- Use depth, parallax, and layered blurs to communicate spatial hierarchy.
- Prefer physics-based timing (spring) for entry/exit; use very short ease‑outs for micro-feedback.
- Respect system accessibility settings (prefers-reduced-motion): provide immediate fallbacks.

Timing & Curves
---------------
Base durations (use these as tokens):
- micro (tap feedback): 90ms
- short (UI micro transitions): 160–200ms
- medium (panel transitions, subtle transforms): 260–320ms
- long (modal, story progression): 400–600ms

Motion curves:
- spring-soft (entering cards): cubic-bezier(0.20, 1.0, 0.35, 1.0) or spring with damping=14, mass=1, stiffness=220
- ease-quick (micro): cubic-bezier(0.25, 0.9, 0.4, 1)
- linear-progress (story bars): linear

Component Patterns
------------------
1. Cards (elevated content)
   - Entry: subtle fade in + translateY(6px) + soft shadow (duration 260ms, spring-soft)
   - Hover/press: scale 0.996 and increase shadow to soft (90–140ms)
   - Dismiss: scale down 0.98 + fade-out (160–200ms)

2. Bottom Sheets / Modals
   - Present: translateY(24px) -> 0, opacity 0 -> 1, shadow grow, duration 320–360ms, spring-soft
   - Dismiss: reverse with slightly quicker timing (260ms)
   - Drag-to-dismiss: map drag distance to translate and opacity; when release, determine threshold.

3. Buttons & Taps
   - Tap interaction: immediate 60–90ms visual feedback (scale 0.98, opacity -8%)
   - Long-press: 150–260ms gentle scale up 1.02 to reveal secondary action.

4. Lists and Reordering
   - Items animate with staggered delays: 18–28ms step between items for natural cascade.
   - Remove/insert: animate height + opacity for smooth reflow.

5. Story / Story Viewer
   - Progress bars: linear 5s default (configurable per content)
   - Pause on interaction: progress transition paused (use CSS transition or JS-controlled animation)
   - Navigation taps: immediate jump to next/previous; long holds pause.

Haptics & Sound
---------------
- Haptics should be used sparingly for confirmation:
  - soft impact for light feedback (e.g., successful photo taken)
  - medium impact for important confirmations (e.g., develop completed)
  - selection changed for scrubbing/tuned controls
- Pair haptics with brief motion for perceived quality.
- Avoid sound unless user explicitly enables subtle camera shutter SFX.

Accessibility
-------------
- Detect prefers-reduced-motion: reduce key-frame animations to fades or no transforms; keep timing at 0 or minimal.
- Respect dynamic type: ensure layout supports larger type without clipping.

Implementation Notes
--------------------
- Prefer CSS transforms (translate, scale) and opacity for GPU-accelerated smoothness.
- Use requestAnimationFrame for JS-driven transitions and cancel properly on unmount.
- For React apps, prefer shared motion library or small util wrappers (framer-motion optional) — but keep the token system first-class (timing / curves) and make CSS variables for durations/curves.

Micro-Interaction Examples
--------------------------
- Camera shutter:
  - Quick flash overlay (white 0.12 alpha), short haptic (soft), subtle vertical bounce of shutter control (90ms).
- Film develop success:
  - Card rise + soft glow edge + confetti stream (sparse) + medium success haptic.
- Story progress scrub:
  - Tiny step haptic on each change; smooth progress bar movement with linear easing.

Motion Tokens (suggested CSS variables)
--------------------------------------
:root {
  --motion-micro: 90ms;
  --motion-short: 180ms;
  --motion-medium: 320ms;
  --motion-long: 520ms;

  --curve-spring-soft: cubic-bezier(0.20, 1.0, 0.35, 1.0);
  --curve-quick: cubic-bezier(0.25, 0.9, 0.4, 1);
  --curve-linear: linear;
}

Final note
----------
- Motion should always enhance clarity: emphasize what changed and why, never what moved.
- Keep an animation inventory: document each animation's token, where it's used, and when it should be disabled for reduced motion.