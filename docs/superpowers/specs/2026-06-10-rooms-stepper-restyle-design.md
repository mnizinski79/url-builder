# Rooms Stepper Restyle + Type-able — Design Spec
**Date:** 2026-06-10
**Status:** Approved
**Figma reference:** [Rooms field, node 2046-2798](https://www.figma.com/design/znL4r7iUzB21MFlrqD02Su/URL-Builder?node-id=2046-2798&m=dev)

---

## Problem

The `NumberSpinnerFieldComponent` (Rooms) doesn't match the other form fields: the bed icon floats inline (no icon box), the frame sizing differs, and the value is a read-only `<span>` — the user can only step it with the carets, not type a number.

## Solution

Restyle the field to match the Figma and the existing date field, and make the value an editable numeric input. Affects only `NumberSpinnerFieldComponent` (`.ts/.html/.css`) plus a new spec.

### Frame & icon (mirror the date field, per Figma)

- `.spinner-wrapper`: `display: flex; align-items: center; border: 1.5px solid var(--color-border); border-radius: var(--radius-field); overflow: hidden; background: var(--color-bg-card);` plus a `:focus-within` ring (`border-color: var(--color-border-focus); box-shadow: 0 0 0 2px rgba(27,42,74,0.12)`) — identical framing to `.drp-trigger`, so the field is the same height as the text/select/date fields.
- `.spinner-icon-box`: grey icon box on the left — `background: #e0e0e2; padding: 10px; display: flex; align-items: center; flex-shrink: 0; color: #6b6b6c;` — containing `<ph-icon name="bed" [size]="18">`. This is the calendar-style icon treatment.
- Carets stay stacked on the right inside `.spinner-buttons` with `padding-right: 8px`.

The icon-box padding (10px) and input padding (`10px 12px`, 13px font) match the date field, so the rendered height matches (~38px) and the Rooms field lines up with its neighbors.

### Type-able value

- Replace the `<span class="spinner-value">` with:
  `<input type="number" class="spinner-input" [formControl]="control" (blur)="onBlur()" [attr.min]="min" [attr.max]="max" inputmode="numeric" [attr.aria-label]="label" />`
- Angular's built-in `NumberValueAccessor` (active for `type="number"`) keeps the control value numeric (`number | null`).
- Native browser spin buttons are hidden via CSS (we use the custom carets):
  `.spinner-input::-webkit-outer-spin-button, ::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }` and `.spinner-input { appearance: textfield; -moz-appearance: textfield; }`.
- `inputmode="numeric"` surfaces the numeric keypad on mobile.

### Component logic

- Remove the unused `@Input() icon` (template hardcodes the bed icon; no parent passes `icon`).
- `get current(): number` — `parseInt(control.value, 10)`, coerced to `min` when `NaN`/empty.
- `increment()` / `decrement()` — `control.setValue(clamp(current ± 1))`.
- `onBlur()` — `control.setValue(clamp(current))`, so empty/invalid/out-of-range typed values resolve to a valid value on blur (empty → `min`).
- `private clamp(n)` — `Math.min(max, Math.max(min, n))`.
- Caret disabled states use `current >= max` / `current <= min`.

### Clamping behavior (confirmed)

- Empty input on blur → `min` (1).
- Typed values are clamped **on blur**, not per keystroke, so multi-digit entry isn't fought; the control always ends valid. (For Rooms, `max` is 9, but the component stays generic.)

## Out of scope

- Other form fields (unchanged).
- The `qRms` URL mapping (`UrlBuilderService` already appends `qRms` only when `> 1`; unaffected — the control stays numeric).

## Verification

- New unit spec: increment/decrement clamp at bounds; `current` coerces empty→min; `onBlur` clamps over-max→max, below-min→min, empty→min; the editable `input[type=number]`, icon box, and two caret buttons render.
- Visual at desktop + 375px: the Rooms field matches the other fields' height and the date field's grey icon-box treatment; typing a number works; carets work and disable at 1 and 9.
