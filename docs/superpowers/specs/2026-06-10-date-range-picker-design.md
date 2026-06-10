# Date Range Picker Design Spec

## Overview

Replace the two separate `<input type="date">` fields in `DateRangeFieldComponent` with a single custom two-month inline calendar. When the user taps the field, a floating panel opens showing the current month and next month side by side. The user clicks a start date, then clicks or hovers toward an end date — the range highlights in real time. An Apply button commits the dates back to the form controls; Cancel discards.

Figma reference: node `2046-2777` in the URL Builder file.

---

## Component Structure

```
DateRangeFieldComponent          ← replaces current two-input field
  └── DateRangePickerComponent   ← the floating calendar panel
        ├── MonthGridComponent   ← renders one month's day grid
        └── (no further sub-components — keep it simple)
```

`DateRangePickerComponent` is instantiated once inside `DateRangeFieldComponent` and shown/hidden via `*ngIf` on a local `isOpen` flag.

---

## Inputs / Outputs

### DateRangeFieldComponent
| Name | Type | Direction | Purpose |
|---|---|---|---|
| `checkInControl` | `FormControl` | Input | Reactive control for check-in date (ISO string `YYYY-MM-DD`) |
| `checkOutControl` | `FormControl` | Input | Reactive control for check-out date (ISO string `YYYY-MM-DD`) |

No change to the public API — callers keep passing the same two `FormControl`s.

### DateRangePickerComponent
| Name | Type | Direction | Purpose |
|---|---|---|---|
| `startDate` | `Date \| null` | Input | Currently confirmed start date |
| `endDate` | `Date \| null` | Input | Currently confirmed end date |
| `apply` | `{ start: Date; end: Date }` | Output | Emitted when user clicks Apply |
| `cancel` | `void` | Output | Emitted when user clicks Cancel |

### MonthGridComponent
| Name | Type | Direction | Purpose |
|---|---|---|---|
| `year` | `number` | Input | Year to render |
| `month` | `number` | Input | Month to render (0-based, JS convention) |
| `startDate` | `Date \| null` | Input | Confirmed start date |
| `endDate` | `Date \| null` | Input | Confirmed end date |
| `hoverDate` | `Date \| null` | Input | Currently hovered date (for live range preview) |
| `dayClick` | `Date` | Output | Emitted when user clicks a non-disabled day |
| `dayHover` | `Date` | Output | Emitted when user hovers a non-disabled day |

---

## Interaction Model

### State machine inside DateRangePickerComponent

```
IDLE → (click day A) → AWAITING_END
AWAITING_END → (hover day B) → preview range A–B
AWAITING_END → (click day B where B > A) → CONFIRMED
AWAITING_END → (click day B where B ≤ A) → restart: AWAITING_END with new A = B
CONFIRMED → (click Apply) → emit apply, close
CONFIRMED or any → (click Cancel) → emit cancel, close
```

Local state: `pendingStart: Date | null`, `pendingEnd: Date | null`, `hoverDate: Date | null`, `phase: 'idle' | 'awaiting-end' | 'confirmed'`.

Apply is enabled only in `CONFIRMED` phase.

### Dismissal
Picker closes on:
- Apply or Cancel button
- Click outside the picker panel (host-listener on `document:click`, compare event target to panel element ref)

---

## Visual Design

### Field trigger (closed state)
```
┌──────────────────────────────────────────────────────┐
│ [📅]  Select date range…                             │  ← placeholder
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ [📅]  Tue, Jun 9, 2026 → Thu, Jul 3, 2026           │  ← dates applied
└──────────────────────────────────────────────────────┘
```
- Calendar icon rendered via `PhIconComponent name="calendar"`, placed in a `#1f4456`-filled left swatch (matches other field icons in the form)
- Date display: `toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })` for both dates, joined with ` → `
- Placeholder text: `"Select date range…"` in `#9CA3AF`

### Picker panel
- White card, `border-radius: 12px`, `box-shadow: 0 8px 24px rgba(0,0,0,.12)`, `border: 1.5px solid #e0e0e2`
- Padding: `20px`
- Two months side by side, separated by a `1px #f0f0f0` vertical divider with `20px` horizontal margin on each side
- Each month column is `224px` wide (`7 × 32px`)

### Month header
```
  ‹   June 2026                July 2026   ›
```
- Left `‹` only on left month; right `›` only on right month
- Title: `13px`, `font-weight: 600`, `color: #222226`
- Nav buttons: `border: 1px solid #e0e0e2`, `border-radius: 4px`, `color: #6b6b6c`

### Day-of-week row
`Su Mo Tu We Th Fr Sa` — `10px`, `font-weight: 600`, `color: #9CA3AF`, `height: 32px`

### Calendar grid
```css
display: grid;
grid-template-columns: repeat(7, 32px);
grid-auto-rows: 32px;
gap: 0;
```
Each cell is exactly 32 × 32px.

### Day cell states

| State | Class | Visual |
|---|---|---|
| Default | `.drp-day` | `12px`, `color: #222226`, hover: light bg `rgba(0,0,0,0.05)` |
| Empty (padding) | `.drp-day.empty` | no cursor, no interaction |
| Start | `.drp-day.start` | navy circle badge, right-half strip behind |
| End | `.drp-day.end` | navy circle badge, left-half strip behind |
| Hover-end | `.drp-day.hover-end` | medium-blue circle badge, left-half strip behind |
| In-range | `.drp-day.in-range` | full-width `#d0e4ee` centered strip |
| Hover-range | `.drp-day.hover-range` | full-width `#e2eff6` centered strip |

#### Strip geometry
- Height: **26px**, vertically centered in 32px cell
- Implemented via `::before { position: absolute; top: 3px; bottom: 3px; left: 0; right: 0; z-index: -1 }`
- Requires `isolation: isolate` on each `.drp-day` to contain `z-index: -1` within the cell's own stacking context

#### Circle badge geometry
- Diameter: **26px**, `inset: 3px` on `::after`
- `border-radius: 50%`
- Day number displayed via `content: attr(data-d)` — the span itself carries `[attr.data-d]="day.date.getDate()"`
- Span text color set to `transparent` on start/end/hover-end so only `::after` text is visible

#### Colors
| Token | Value |
|---|---|
| Circle (confirmed start/end) | `#1f4456` (navy) |
| Circle (hover-end) | `#2b6880` |
| Strip (confirmed in-range) | `#d0e4ee` |
| Strip (hover preview) | `#e2eff6` |

#### Start cell strip (right-half only)
```css
.drp-day.start::before { left: 50%; background: <strip-color>; }
```
Color is `#e2eff6` during hover-preview phase, `#d0e4ee` once confirmed (add class `.confirmed` to start cell when phase = CONFIRMED).

#### End cell strip (left-half only)
```css
.drp-day.end::before { right: 50%; background: #d0e4ee; }
.drp-day.hover-end::before { right: 50%; background: #e2eff6; }
```

#### Row-edge handling
In-range strip extends full cell width — no special rounding at row edges. The strip "wraps" visually row-to-row, which is standard behavior for hotel date pickers.

### Nights counter tooltip
- Appears above the currently hovered date when `phase === 'awaiting-end'` and `hoverDate > pendingStart`
- Content: `"X nights"` where `X = Math.round((hoverDate - pendingStart) / 86_400_000)`
- Styled: dark pill `background: #1a1a1a; color: white; font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 6px`
- Positioned `bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%)` relative to the hover-end cell
- CSS caret: `::after { border-top-color: #1a1a1a }` pointing down
- Implemented as an absolutely-positioned child inside the `.hover-end` cell button

### Footer
```
                            [ Cancel ]  [ Apply ]
```
- Right-aligned, `border-top: 1px solid #f0f0f0`, `padding-top: 14px`, `margin-top: 12px`
- Cancel: `border: 1px solid #e0e0e2; border-radius: var(--radius-button); color: #6b6b6c`
- Apply: `background: #1f4456; color: white; border-radius: var(--radius-button); opacity: 0.45` when disabled (phase ≠ CONFIRMED)

---

## Data Flow

```
DateRangeFieldComponent
  reads checkInControl.value / checkOutControl.value on open
  → parses to Date | null → passes as [startDate] [endDate] to picker

  on (apply) event:
    checkInControl.setValue(toISODate(event.start))
    checkOutControl.setValue(toISODate(event.end))
    isOpen = false

  on (cancel) event:
    isOpen = false
```

`toISODate(date: Date): string` — returns `date.toISOString().slice(0, 10)` (e.g. `"2026-06-09"`).

The picker holds its own local `pendingStart`/`pendingEnd` while the user is selecting; it never mutates the `FormControl`s directly — only the parent does on Apply.

---

## Month Navigation

`DateRangePickerComponent` tracks `leftYear` and `leftMonth` (0-based). Right month is always `leftMonth + 1` (with year wrap). Navigation:

- `‹` (prev): `leftMonth -= 1`, wrap December → previous year
- `›` (next): `leftMonth += 1`, wrap November → next year
- Boundary: do not navigate before the current month (disable `‹` if `leftMonth === today.getMonth() && leftYear === today.getFullYear()`)

---

## Accessibility

- Each day button is a `<button>` element (not a `<span>`) so it is keyboard-focusable and announced by screen readers
- `aria-label` on each day: `"June 9"` (or with state: `"June 9, selected"`, `"June 12, in range"`)
- `aria-disabled="true"` on past dates
- Picker panel has `role="dialog"` and `aria-label="Select date range"`
- Apply button has `aria-disabled="true"` when not in CONFIRMED phase

---

## Styling Constraints

- No new npm dependencies
- All new CSS scoped to component (Angular `ViewEncapsulation.Emulated`, default)
- Reuse existing design tokens: `--radius-button`, `--font-stack`, `--color-bg-page`
- Calendar icon color `#6b6b6c` for the icon SVG stroke, field swatch background `#e0e0e2`
- Day cells rendered as `<button>` elements — apply a standard reset (`background: none; border: none; padding: 0; cursor: pointer; font-family: inherit`) so browser defaults don't interfere with the custom cell styling

---

## Files to Create / Modify

| Action | Path |
|---|---|
| **Modify** | `src/app/components/fields/date-range-field/date-range-field.component.ts` |
| **Modify** | `src/app/components/fields/date-range-field/date-range-field.component.html` |
| **Modify** | `src/app/components/fields/date-range-field/date-range-field.component.css` |
| **Create** | `src/app/components/date-range-picker/date-range-picker.component.ts` |
| **Create** | `src/app/components/date-range-picker/date-range-picker.component.html` |
| **Create** | `src/app/components/date-range-picker/date-range-picker.component.css` |
| **Create** | `src/app/components/date-range-picker/month-grid/month-grid.component.ts` |
| **Create** | `src/app/components/date-range-picker/month-grid/month-grid.component.html` |
| **Create** | `src/app/components/date-range-picker/month-grid/month-grid.component.css` |

---

## Out of Scope

- Past-date disabling (nice to have, deferred)
- Minimum / maximum stay validation
- Mobile touch swipe to change months
- Keyboard arrow-key navigation within the grid (deferred)
