# Mobile Date Picker — Single Month in a Sheet — Design Spec
**Date:** 2026-06-10
**Status:** Approved

---

## Problem

On small viewports the date-range picker renders its two-month panel as a `position: fixed` floating panel anchored to the trigger. Two months are wider than a phone screen, so the left month overflows off-screen (left edge clipped). The picker needs a mobile-appropriate presentation.

## Solution Overview

At `≤768px` (SVP), the date-range picker shows a **single month** (with both previous and next navigation arrows) and is presented as a **bottom sheet** — consistent with the header menu and Saved/History drawer (dim backdrop, full-width sheet anchored to the bottom, grab-handle, slide-up). Above `768px` (LVP), the picker is **unchanged**: the two-month floating panel anchored to the trigger.

**Breakpoint:** `max-width: 768px`, consistent with the rest of the app.

**No new components, no new npm dependencies.** Changes are confined to `DateRangePickerComponent` (a `singleMonth` mode) and `DateRangeFieldComponent` (sheet presentation + viewport detection), plus their CSS.

---

## 1. Single-month mode — `DateRangePickerComponent`

**Files:** `date-range-picker.component.ts`, `date-range-picker.component.html`, `date-range-picker.component.css`

- Add `@Input() singleMonth = false;` (default `false` → current two-month behavior).
- Template (`date-range-picker.component.html`):
  - When `singleMonth` is `true`: render **one** `app-month-grid` bound to `leftYear`/`leftMonth` with **both** `[showPrev]="true"` and `[showNext]="true"`, wired to `(prev)="goPrev()"` and `(next)="goNext()"`. Do **not** render the `.drp-divider` or the second (`rightYear`/`rightMonth`) grid.
  - When `singleMonth` is `false`: the existing two-month layout (left grid `showPrev`, divider, right grid `showNext`), unchanged.
  - Use `*ngIf="singleMonth"` / `*ngIf="!singleMonth"` (or an equivalent `ng-container`/`ng-template` split) so each layout renders independently.
- No change to the selection state machine: `onDayClick`/`onDayHover`, `goPrev`/`goNext`, `pendingStart`/`pendingEnd`, `phase`, `onApply`/`onCancel` are untouched. In single-month mode the user pages between months with the prev/next arrows to select a start in one month and an end in another; hover preview applies to whichever month is visible.
- The existing `rightYear`/`rightMonth` getters remain (used only in two-month mode); they are harmless when `singleMonth` is true.

**Rationale:** keeping `singleMonth` a property of the picker (not the field) means the picker owns "how many months to show," which is its responsibility; the field owns "how the picker is presented."

---

## 2. Sheet presentation + viewport detection — `DateRangeFieldComponent`

**Files:** `date-range-field.component.ts`, `date-range-field.component.html`, `date-range-field.component.css`

- Add `isMobile = false;` to the component.
- In the method that opens the picker (`togglePicker`, and any keyboard-open path), set `isMobile = window.matchMedia('(max-width: 768px)').matches` at open time. Detection is **on open**; resizing across the breakpoint while the picker is open does not live-swap layouts (accepted minor edge case).
- Pass `[singleMonth]="isMobile"` to `<app-date-range-picker>`.
- Template: render two presentations, chosen by `isMobile`:
  - **LVP (`!isMobile`)** — the existing floating wrapper, unchanged:
    ```html
    <div class="drp-picker-wrap" *ngIf="isOpen && !isMobile"
         [style.top.px]="pickerTop" [style.right.px]="pickerRight">
      <app-date-range-picker ...></app-date-range-picker>
    </div>
    ```
  - **SVP (`isMobile`)** — a bottom-sheet wrapper:
    ```html
    <div class="drp-sheet-backdrop" *ngIf="isOpen && isMobile" (click)="onCancel()">
      <div class="drp-sheet" (click)="$event.stopPropagation()">
        <div class="drp-sheet-handle"></div>
        <app-date-range-picker
          [singleMonth]="true"
          [startDate]="parsedStart" [endDate]="parsedEnd"
          (apply)="onApply($event)" (cancel)="onCancel()"></app-date-range-picker>
      </div>
    </div>
    ```
  - The two `app-date-range-picker` instances carry identical `[startDate]`/`[endDate]`/`(apply)`/`(cancel)` bindings; only `[singleMonth]` and the wrapper differ.
- Positioning code (`pickerTop`/`pickerRight`) only applies to the LVP wrapper; it is not used at SVP.
- Backdrop tap calls `onCancel()` (closes without applying), matching the menu/drawer dismissal model. The picker's own `document:click` outside-close still exists; the sheet's explicit backdrop handler is the primary mobile path.

### CSS
- `.drp-sheet-backdrop` (SVP only): `position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; flex-direction: column; justify-content: flex-end;`
- `.drp-sheet`: `width: 100%; background: var(--color-bg-card); border-radius: 16px 16px 0 0; padding: 8px 0 16px; animation: drpSheetUp 200ms ease; max-height: 90vh; overflow-y: auto;`
- `.drp-sheet-handle`: `width: 36px; height: 4px; background: #d0d0d0; border-radius: 2px; margin: 4px auto 8px;` (matches the other sheets).
- `@keyframes drpSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`
- At `≤768px`, override `.drp-panel` so the picker fills the sheet rather than floating: remove the floating chrome — `border: none; border-radius: 0; box-shadow: none; padding: 16px; display: block; width: 100%;` (scoped to the picker's own CSS via a `@media (max-width: 768px)` block). The single month grid then fits within the full-width sheet.

---

## 3. Consistency with existing sheets

Same `max-width: 768px` breakpoint, same `rgba(0,0,0,0.4)` backdrop, same `36×4 #d0d0d0` grab-handle, same `translateY(100%)→0` 200ms slide-up as the header menu and Saved/History drawer. The drp sheet uses `z-index: 200` (the field's existing picker layer) rather than 400; it is never shown simultaneously with the menu sheet or drawer.

---

## Testing

**Unit (Karma/Jasmine):**
- `DateRangePickerComponent`:
  - With `singleMonth = true`: exactly one `app-month-grid` renders; no `.drp-divider`; the single grid receives `showPrev` and `showNext` both true.
  - With `singleMonth = false` (default): two `app-month-grid`s render with the divider (existing behavior preserved).
  - `goPrev`/`goNext` still advance the visible month in single-month mode (existing nav specs continue to pass).
- `DateRangeFieldComponent`:
  - `isMobile` defaults to `false`.
  - When opened with `matchMedia` matching `≤768px`, the `.drp-sheet-backdrop` renders and `[singleMonth]` is `true`; when not matching, the `.drp-picker-wrap` renders and `[singleMonth]` is `false`. (Stub `window.matchMedia` in the spec to drive both branches.)
  - Backdrop click calls `onCancel()` and closes (`isOpen` false), leaving the controls unchanged.

**Visual verification (375px and 1280px):** extend `scripts/verify-responsive.mjs` (or a sibling) to: open the picker on the Search tab at 375px, assert a single month grid (one `.drp-month-header` / no second grid), assert the sheet is bottom-anchored and full-width with a grab-handle, page next/prev, pick a start and end across two months, Apply, and confirm the field text updates. At 1280px, assert the two-month floating panel is unchanged.

---

## Out of scope

- LVP picker behavior/appearance (unchanged).
- Live layout swap on resize while the picker is open.
- Drag-to-dismiss on the sheet.
- Any change to the selection state machine or date math.
