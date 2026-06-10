# Tooltip Viewport Clamp — Design Spec
**Date:** 2026-06-10
**Status:** Approved

---

## Problem

`TooltipComponent` positions its 280px `position: fixed` bubble centered horizontally over the `?` trigger (`left = triggerCenterX; transform: translate(-50%, -100%)`), with a down-arrow fixed at the bubble's center. On small viewports the `?` icons sit near the right edge of the field rows, so a centered 280px bubble overflows ~100px past the right edge and the text is clipped.

## Solution

Clamp the bubble's horizontal position to stay within the viewport, and move the arrow so it still points at the trigger. No breakpoint needed — the clamp is a no-op on desktop (triggers aren't near edges, so the bubble stays centered exactly as today) and resolves to a right-anchored bubble with a right-side arrow on mobile (where the trigger is near the right edge).

### TooltipComponent.onMouseEnter (TS)

Replace the centered positioning with edge-anchored, clamped positioning:

- `bubbleWidth = 280`, `margin = 12` (px viewport gutter).
- `triggerCenterX = rect.left + rect.width / 2`.
- `clampedLeft = clamp(margin, triggerCenterX − bubbleWidth/2, window.innerWidth − bubbleWidth − margin)`.
- `tooltipStyle = { left: clampedLeft px, top: rect.top − 10 px, transform: 'translateY(-100%)' }` (note: `translateY` only — the bubble is now anchored by its left edge, not centered).
- Arrow offset within the bubble: `arrowLeft = clamp(14, triggerCenterX − clampedLeft, bubbleWidth − 14)` (14px keeps the arrow off the rounded corners). Set it as a CSS custom property directly on the bubble element via `bubble.style.setProperty('--tip-arrow-left', arrowLeft px)` (queried with `.tooltip-bubble`), which is more reliable than passing a `--` key through `ngStyle`.

### CSS

- `.tooltip-bubble::after` arrow: change `left: 50%` → `left: var(--tip-arrow-left, 50%)` (the `50%` fallback preserves the centered arrow when the variable isn't set). The existing `transform: translateX(-50%)` still centers the arrow glyph on that point.

## Behavior

- **Desktop:** triggers are not near edges → `clampedLeft` equals the centered ideal, `arrowLeft` ≈ 140 (center). Visually identical to today.
- **Mobile:** trigger near the right edge → bubble shifts left until its right edge hits the 12px margin (right-anchored), and the arrow lands on the right side of the bubble, pointing at the `?`.

## Out of scope

- Vertical positioning (bubble stays above the trigger, unchanged).
- Responsive bubble width (fixed 280px; fits phones ≥ ~320px with margins).
- Hover/focus behavior, show delay (unchanged).

## Verification

- Existing tests continue to pass (logic-only positioning change; no DOM/API change).
- Visual at 375px: hover a right-side `?` (e.g., Language); the bubble is fully on-screen, right edge ~12px from the viewport edge, arrow on the right pointing at the `?`.
- Visual at 1280px: a tooltip is centered over its trigger with a centered arrow (unchanged).
