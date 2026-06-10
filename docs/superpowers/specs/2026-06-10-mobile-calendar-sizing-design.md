# Mobile Calendar Sizing — Design Spec
**Date:** 2026-06-10
**Status:** Approved

---

## Problem

In the mobile single-month date sheet, the month grid is a fixed 224px (7×32px cells) centered in the full-width sheet, leaving large empty margins. The weekday headers (10px) and date numbers (12px) look small in the available space.

## Solution

Scale the month grid to fill the sheet width with larger text, **at `≤768px` only**. All changes live in a `@media (max-width: 768px)` block in `month-grid.component.css`. Because the month grid only renders inside the mobile sheet at `≤768px` (the two-month desktop panel renders above 768px), these overrides affect the mobile single-month calendar exclusively; the desktop two-month grid is unchanged.

### Changes (SVP only)

- **Grid fills width, cells stay square:**
  - `.drp-grid`: `grid-template-columns: repeat(7, 1fr); width: 100%;` (was `repeat(7, 32px)` / `width: 224px`).
  - `.drp-day`: drop fixed `width`/`height: 32px`; use `aspect-ratio: 1` (square cell ⇒ round selection circle, grows with the column to ~49px on a 375px phone).
  - `.drp-dow`: drop fixed `height: 32px`; use `aspect-ratio: 1`.
  - `.drp-month-header`: `width: 100%;` (was `224px`) so the `‹ ›` nav arrows sit at the grid edges.
- **Larger text:**
  - `.drp-dow` (weekday headers): `font-size: 13px` (was 10px).
  - `.drp-day` (date numbers): `font-size: 16px` (was 12px).
  - `.drp-day.start::after` / `.end::after` / `.hover-end::after` (selected-date circle number): `font-size: 16px` (was 12px).
  - `.drp-month-title`: `font-size: 15px` (was 13px).
- **Proportional selection visuals:** the range strip `::before` (`top`/`bottom`) and the circle `::after` (`inset`) go from `3px` → `6px`, keeping the circle ~37px inside the ~49px cell rather than ballooning to fill it.

### Sheet height

No explicit change. `.drp-sheet` is content-height with `max-height: 90vh; overflow-y: auto`, so the taller grid grows the sheet naturally and scrolls if it ever exceeds 90vh.

## Out of scope

- Desktop two-month grid (unchanged — these overrides are SVP-only).
- Any logic, DOM, or component-API change. The month grid's inputs/outputs and the selection state machine are untouched.

## Verification

- Existing `month-grid`, `date-range-picker`, and `date-range-picker.integration` specs continue to pass (CSS-only, SVP-scoped; no logic/DOM change). The integration test is pinned to desktop mode, so it exercises the unchanged two-month grid.
- Visual at 375px: cells fill the sheet width, weekday/number text is larger, selection circles remain round, the range highlight aligns, and the sheet grows to fit. Tune the exact px values if the result looks off.
- Visual at 1280px: desktop two-month picker unchanged.
