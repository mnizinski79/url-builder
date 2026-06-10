# Small-Viewport Responsive Adaptation — Design Spec
**Date:** 2026-06-10
**Status:** Approved
**Figma reference:** [Mobile Screen, node 2059-449](https://www.figma.com/design/znL4r7iUzB21MFlrqD02Su/URL-Builder?node-id=2059-449&m=dev)

---

## Overview

Adapt the URL Builder layout for small viewports (phones and portrait tablets). At `≤768px` the desktop header collapses to a hamburger that opens a bottom sheet, the tab bar centers, the Save/Clear action buttons stack full-width, and the Saved/History drawer converts from a right-side panel to a bottom sheet. Desktop (`>768px`) is unchanged.

**Breakpoint:** single boundary at `max-width: 768px`, reusing the breakpoint already present across `header`, `tab-bar`, `form-container`, and `app` styles. No new breakpoints introduced.

**Guiding principle:** on small viewports, every transient overlay rises from the bottom as a sheet — the hamburger menu and the Saved/History drawer alike — so the interaction model is consistent (sheet-up → sheet-up, never sheet-up → slide-sideways).

**No new npm dependencies. No new components.** All changes are CSS media queries plus a small amount of state/markup added to the existing `HeaderComponent`.

---

## 1. Header → hamburger + bottom-sheet menu

**File:** `src/app/components/header/header.component.{ts,html,css}`

### Desktop (`>768px`) — unchanged
Logo + divider + "URL Builder" title on the left; the four nav buttons (`Saved`, `History`, `Field Guide`, `Templates`) inline on the right.

### Small viewport (`≤768px`)
- The `.header-nav` button row is hidden (`display: none`).
- A single hamburger button appears on the right, rendered via the existing `<ph-icon name="list">` component. **The `ph-icon` `PATHS` map does not currently include `list`**, so the plan adds a `list` entry to `src/app/components/ph-icon/ph-icon.component.ts`, sourcing the exact SVG path from the installed `@phosphor-icons/core` package (regular weight) — the same package the other icon paths came from.
- The `URL Builder` title is **restored** at this breakpoint (currently hidden at `≤768px` via `.app-title { display: none }` — that rule is removed/overridden so the title shows, matching the mockup).
- Tapping the hamburger toggles a new `menuOpen` boolean on the component.

### Bottom-sheet menu (rendered behind `*ngIf="menuOpen"`)
- A dimmed backdrop (`position: fixed; inset: 0; background: rgba(0,0,0,0.4)`) covers the screen below the header.
- A white sheet anchored to the bottom slides up (`translateY(100%)` → `0`, 200ms ease), `border-radius: 16px 16px 0 0`, full width.
- A small grab-handle bar sits at the top of the sheet as a visual affordance (not draggable).
- Four full-width rows, top to bottom: **Saved, History, Field Guide, Templates**, each a tappable button with a comfortable touch height (~48px) and a divider between rows.
- **Dismissal:** tapping the backdrop OR tapping any row closes the sheet (`menuOpen = false`). No drag-to-dismiss gesture.
- **Item actions:**
  - `Saved` → set `menuOpen = false`, then `openSaved.emit()`
  - `History` → set `menuOpen = false`, then `openHistory.emit()`
  - `Field Guide`, `Templates` → set `menuOpen = false` only (placeholders, no output, matching current desktop behavior)

### Component surface (`HeaderComponent`)
- Existing: `@Output() openSaved`, `@Output() openHistory` — unchanged.
- New: `menuOpen = false`; methods `toggleMenu()`, `closeMenu()`, `onSaved()`, `onHistory()` (the latter two close then emit). Field Guide/Templates rows call `closeMenu()`.
- No new component is introduced; the sheet lives in the header template because the header already owns these actions and emits these events.

---

## 2. Tab bar — centered on small viewport

**File:** `src/app/components/tab-bar/tab-bar.component.css`

- Desktop: unchanged (`max-width: 1040px`, `margin: 0 auto`, `padding: 0 32px`, left-aligned tabs).
- At `≤768px`: `.tab-bar` gets `justify-content: center`. The existing `overflow-x: auto` on `.tab-bar-wrapper` is retained as a fallback so the narrowest devices (where `Home / Search / Hotel Details / CRR` exceed the viewport width) can still scroll. Tabs center whenever they fit; scroll only engages when they don't.

---

## 3. Action buttons — stacked full-width

**File:** `src/app/app.component.css` (`.save-action-bar`)

- Desktop: unchanged (`flex-direction: row; justify-content: flex-end`).
- At `≤768px`: `.save-action-bar` becomes `flex-direction: column; align-items: stretch`. Both `.btn-save-url` and `.btn-clear-form` go `width: 100%`, content centered (`justify-content: center`), with a taller touch target (`height: 48px`). Save URL renders on top, Clear Form below, matching current DOM order and the mockup.
- **Button label casing is left as-is** (the user has already finalized button styling); this change is layout-only.

---

## 4. Saved/History drawer → bottom sheet on small viewport

**File:** `src/app/components/drawer/drawer.component.css`

The drawer's DOM, tabs, close button, and scrollable card list are layout-agnostic and do **not** change. Only the container's positioning/size/animation changes at `≤768px`, via one media-query block:

- `.drawer-overlay`: `justify-content: flex-end` → `align-items: flex-end` (anchor to the bottom edge instead of the right edge).
- `.drawer`: `width: 100%; height: auto; max-height: 85vh; border-radius: 16px 16px 0 0`. `max-height: 85vh` leaves the top of the screen visible as a tap-to-dismiss zone.
- Animation: the `slideIn` keyframe swaps from `translateX(100%)` to `translateY(100%)` at this breakpoint (a separate `slideUp` keyframe applied within the media query).
- A grab-handle bar is added at the top of the sheet, consistent with the menu sheet.
- The existing `.drawer-content { overflow-y: auto }` already scrolls a long Saved/History list inside the sheet — no change needed.

The Saved/History tabs remain pinned at the top of the sheet; the close (`x`) button still works; backdrop tap-to-close (`(click)="close()"` on `.drawer-overlay`) is unchanged.

---

## Resulting mobile flow

1. User taps the hamburger → menu bottom sheet rises.
2. User taps `Saved` → menu sheet closes, `openSaved` fires → drawer bottom sheet rises (Saved tab active).
3. Both overlays rise from the bottom; dismissal is backdrop-tap or item/close in both.

---

## Testing

**Unit (Karma/Jasmine):**
- `HeaderComponent`:
  - `menuOpen` is `false` initially; `toggleMenu()` flips it; `closeMenu()` sets it false.
  - Tapping the `Saved` row emits `openSaved` AND sets `menuOpen = false`; same for `History`/`openHistory`.
  - `Field Guide`/`Templates` rows set `menuOpen = false` and emit nothing.
- Existing `tab-bar`, `app`, and `drawer` specs continue to pass (CSS-only changes there).

**Visual verification (≤768px, e.g. 375px width):**
- Dev server started via Bash `run_in_background` (preview MCP is sandboxed out of `~/Desktop` — see project memory); verify via `curl` and/or the `scripts/repro-hover.mjs` puppeteer pattern.
- Confirm: hamburger replaces nav buttons and title is visible; menu sheet rises/dismisses; tabs centered; action buttons stacked full-width at 48px; Saved/History opens as a bottom sheet with internal scroll.
- Confirm desktop (`>768px`) is visually identical to before.

---

## Out of scope

- Field Guide / Templates functionality (remain placeholders).
- Any change to desktop layout.
- Drag-to-dismiss gestures on either sheet.
- All-caps button labels / button restyling (already handled by the user).
