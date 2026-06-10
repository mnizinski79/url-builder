# Mobile Date Picker — Single Month in a Sheet — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** At `≤768px`, render the date-range picker as a single month inside a bottom sheet; keep the two-month floating panel unchanged above `768px`.

**Architecture:** `DateRangePickerComponent` gains a `singleMonth` input that renders one month grid (with both nav arrows) instead of two. `DateRangeFieldComponent` detects the viewport on open via `matchMedia` and, at `≤768px`, presents the picker inside a bottom-sheet wrapper (backdrop + grab-handle + slide-up) consistent with the app's header menu and drawer; above `768px` it keeps the existing floating panel.

**Tech Stack:** Angular 17.3 standalone components · Karma/Jasmine · component-scoped CSS with tokens from `src/styles.css`

**Spec:** `docs/superpowers/specs/2026-06-10-date-picker-mobile-sheet-design.md`

**Commands (run from `/Users/nizinsmi/Desktop/Dev Projects/URL Builder/url-builder`):**
- Scoped test: `npx ng test --include="**/<file>.spec.ts" --watch=false --browsers=ChromeHeadless`
- Full test: `npx ng test --watch=false --browsers=ChromeHeadless`
- Build: `npx ng build --configuration=development`

**Note on pre-existing failures:** the full suite has 2 pre-existing failing specs in `FormStateService` (default brandCode/language) unrelated to this work. They are expected; do not try to fix them here. Success for this plan = all `date-range-picker` and `date-range-field` specs pass and no NEW failures appear.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/app/components/date-range-picker/date-range-picker.component.ts` | Add `singleMonth` input |
| Modify | `src/app/components/date-range-picker/date-range-picker.component.html` | Conditional single- vs two-month layout |
| Modify | `src/app/components/date-range-picker/date-range-picker.component.css` | `.drp-panel` full-width sheet override + center month at ≤768px |
| Modify | `src/app/components/date-range-picker/date-range-picker.component.spec.ts` | single-month rendering tests |
| Modify | `src/app/components/fields/date-range-field/date-range-field.component.ts` | `isMobile` detection on open |
| Modify | `src/app/components/fields/date-range-field/date-range-field.component.html` | Floating (LVP) vs sheet (SVP) presentation |
| Modify | `src/app/components/fields/date-range-field/date-range-field.component.css` | Sheet backdrop/panel/handle styles |
| Modify | `src/app/components/fields/date-range-field/date-range-field.component.spec.ts` | isMobile + sheet-presentation tests |

---

## Task 1 — Single-month mode on DateRangePickerComponent

**Files:**
- Modify: `src/app/components/date-range-picker/date-range-picker.component.ts`
- Modify: `src/app/components/date-range-picker/date-range-picker.component.html`
- Modify: `src/app/components/date-range-picker/date-range-picker.component.css`
- Test: `src/app/components/date-range-picker/date-range-picker.component.spec.ts`

- [ ] **Step 1 — Add the failing tests**

In `date-range-picker.component.spec.ts`, add this nested `describe` block immediately after the existing `it('should create', ...)` block (it reuses the outer `component`/`fixture` and `beforeEach`):

```typescript
  describe('single-month mode', () => {
    it('renders two month grids and a divider by default', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('app-month-grid').length).toBe(2);
      expect(el.querySelector('.drp-divider')).not.toBeNull();
    });

    it('renders exactly one month grid and no divider when singleMonth is true', () => {
      component.singleMonth = true;
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('app-month-grid').length).toBe(1);
      expect(el.querySelector('.drp-divider')).toBeNull();
    });

    it('the single month grid shows both prev and next nav buttons', () => {
      component.singleMonth = true;
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const navBtns = el.querySelectorAll('app-month-grid .drp-nav-btn');
      expect(navBtns.length).toBe(2);
    });

    it('goNext/goPrev still advance the visible month in single-month mode', () => {
      component.singleMonth = true;
      component.leftYear = 2026;
      component.leftMonth = 5;
      component.goNext();
      expect(component.leftMonth).toBe(6);
      component.goPrev();
      expect(component.leftMonth).toBe(5);
    });
  });
```

- [ ] **Step 2 — Run the tests, confirm the singleMonth ones fail**

Run: `npx ng test --include="**/date-range-picker.component.spec.ts" --watch=false --browsers=ChromeHeadless`
Expected: the "default two grids" test passes; the three `singleMonth` tests FAIL (input doesn't exist / template still renders two grids).

- [ ] **Step 3 — Add the `singleMonth` input to the component**

In `date-range-picker.component.ts`, add the input alongside the other `@Input()`s (after `@Input() endDate`):

```typescript
  @Input() singleMonth = false;
```

- [ ] **Step 4 — Update `date-range-picker.component.html`**

Replace the entire `<div class="drp-months">...</div>` block (the two `app-month-grid`s and the divider) with this conditional version. Leave the surrounding `.drp-panel` and `.drp-footer` unchanged:

```html
  <div class="drp-months">
    <ng-container *ngIf="!singleMonth">
      <app-month-grid
        [year]="leftYear"
        [month]="leftMonth"
        [showPrev]="true"
        [showNext]="false"
        [startDate]="pendingStart"
        [endDate]="pendingEnd"
        [hoverDate]="hoverDate"
        [confirmed]="isConfirmed"
        (dayClick)="onDayClick($event)"
        (dayHover)="onDayHover($event)"
        (prev)="goPrev()"
      ></app-month-grid>

      <div class="drp-divider"></div>

      <app-month-grid
        [year]="rightYear"
        [month]="rightMonth"
        [showPrev]="false"
        [showNext]="true"
        [startDate]="pendingStart"
        [endDate]="pendingEnd"
        [hoverDate]="hoverDate"
        [confirmed]="isConfirmed"
        (dayClick)="onDayClick($event)"
        (dayHover)="onDayHover($event)"
        (next)="goNext()"
      ></app-month-grid>
    </ng-container>

    <app-month-grid
      *ngIf="singleMonth"
      [year]="leftYear"
      [month]="leftMonth"
      [showPrev]="true"
      [showNext]="true"
      [startDate]="pendingStart"
      [endDate]="pendingEnd"
      [hoverDate]="hoverDate"
      [confirmed]="isConfirmed"
      (dayClick)="onDayClick($event)"
      (dayHover)="onDayHover($event)"
      (prev)="goPrev()"
      (next)="goNext()"
    ></app-month-grid>
  </div>
```

- [ ] **Step 5 — Add the mobile CSS override to `date-range-picker.component.css`**

Append at the end of the file:

```css
@media (max-width: 768px) {
  .drp-panel {
    border: none;
    border-radius: 0;
    box-shadow: none;
    padding: 16px;
    display: block;
    width: 100%;
  }
  .drp-months {
    justify-content: center;
  }
}
```

This makes the picker fill its container (the sheet, full-width) instead of floating, and centers the single month. At `≤768px` the picker is only ever rendered inside the field's bottom sheet (Task 2), so this override always applies in-sheet.

- [ ] **Step 6 — Run the tests, confirm all pass**

Run: `npx ng test --include="**/date-range-picker.component.spec.ts" --watch=false --browsers=ChromeHeadless`
Expected: all specs pass (the existing state-machine/nav specs plus the 4 new single-month specs).

- [ ] **Step 7 — Commit**

```bash
git add src/app/components/date-range-picker/
git commit -m "feat: add single-month mode to DateRangePickerComponent"
```

---

## Task 2 — Bottom-sheet presentation on DateRangeFieldComponent

**Files:**
- Modify: `src/app/components/fields/date-range-field/date-range-field.component.ts`
- Modify: `src/app/components/fields/date-range-field/date-range-field.component.html`
- Modify: `src/app/components/fields/date-range-field/date-range-field.component.css`
- Test: `src/app/components/fields/date-range-field/date-range-field.component.spec.ts`

- [ ] **Step 1 — Add the failing tests**

In `date-range-field.component.spec.ts`, add these tests inside the existing `describe('DateRangeFieldComponent', ...)` block, after the existing `togglePicker` test:

```typescript
  it('isMobile is false initially', () => {
    expect(component.isMobile).toBeFalse();
  });

  it('opening at <=768px sets isMobile and renders the sheet with singleMonth', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const event = new MouseEvent('click');
    component.togglePicker(event);
    fixture.detectChanges();
    expect(component.isMobile).toBeTrue();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.drp-sheet-backdrop')).not.toBeNull();
    expect(el.querySelector('.drp-picker-wrap')).toBeNull();
  });

  it('opening above 768px renders the floating panel, not the sheet', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    const event = new MouseEvent('click');
    component.togglePicker(event);
    fixture.detectChanges();
    expect(component.isMobile).toBeFalse();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.drp-picker-wrap')).not.toBeNull();
    expect(el.querySelector('.drp-sheet-backdrop')).toBeNull();
  });

  it('clicking the sheet backdrop cancels and closes', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    component.togglePicker(new MouseEvent('click'));
    fixture.detectChanges();
    const backdrop = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.drp-sheet-backdrop')!;
    backdrop.click();
    expect(component.isOpen).toBeFalse();
    expect(component.checkInControl.value).toBe('');
  });
```

- [ ] **Step 2 — Run the tests, confirm they fail**

Run: `npx ng test --include="**/date-range-field.component.spec.ts" --watch=false --browsers=ChromeHeadless`
Expected: the 4 new tests FAIL (`isMobile` undefined, `.drp-sheet-backdrop` not found).

- [ ] **Step 3 — Update `date-range-field.component.ts`**

Add the `isMobile` property next to `isOpen`:

```typescript
  isOpen = false;
  isMobile = false;
  pickerTop = 0;
  pickerRight = 0;
```

Update `togglePicker` to detect the viewport on open (replace the existing method):

```typescript
  togglePicker(event: Event): void {
    event.stopPropagation();
    if (!this.isOpen) {
      this.isMobile = window.matchMedia('(max-width: 768px)').matches;
      this.updatePickerPosition();
    }
    this.isOpen = !this.isOpen;
  }
```

Leave `updatePickerPosition`, `onApply`, `onCancel`, `onTriggerKeydown`, and the `@HostListener` document-click handler unchanged.

- [ ] **Step 4 — Update `date-range-field.component.html`**

Replace the existing single picker wrapper:

```html
  <div class="drp-picker-wrap" *ngIf="isOpen"
       [style.top.px]="pickerTop"
       [style.right.px]="pickerRight">
    <app-date-range-picker
      [startDate]="parsedStart"
      [endDate]="parsedEnd"
      (apply)="onApply($event)"
      (cancel)="onCancel()"
    ></app-date-range-picker>
  </div>
```

with two presentations (floating for LVP, sheet for SVP):

```html
  <div class="drp-picker-wrap" *ngIf="isOpen && !isMobile"
       [style.top.px]="pickerTop"
       [style.right.px]="pickerRight">
    <app-date-range-picker
      [singleMonth]="false"
      [startDate]="parsedStart"
      [endDate]="parsedEnd"
      (apply)="onApply($event)"
      (cancel)="onCancel()"
    ></app-date-range-picker>
  </div>

  <div class="drp-sheet-backdrop" *ngIf="isOpen && isMobile" (click)="onCancel()">
    <div class="drp-sheet" (click)="$event.stopPropagation()">
      <div class="drp-sheet-handle"></div>
      <app-date-range-picker
        [singleMonth]="true"
        [startDate]="parsedStart"
        [endDate]="parsedEnd"
        (apply)="onApply($event)"
        (cancel)="onCancel()"
      ></app-date-range-picker>
    </div>
  </div>
```

- [ ] **Step 5 — Append the sheet CSS to `date-range-field.component.css`**

```css
.drp-sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.drp-sheet {
  width: 100%;
  background: var(--color-bg-card);
  border-radius: 16px 16px 0 0;
  padding: 8px 0 16px;
  max-height: 90vh;
  overflow-y: auto;
  animation: drpSheetUp 200ms ease;
}

.drp-sheet-handle {
  width: 36px;
  height: 4px;
  background: #d0d0d0;
  border-radius: 2px;
  margin: 4px auto 8px;
}

@keyframes drpSheetUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

These styles only ever render when `isMobile` is true (the `*ngIf` gates them), so no media query is required here.

- [ ] **Step 6 — Run the field tests, confirm all pass**

Run: `npx ng test --include="**/date-range-field.component.spec.ts" --watch=false --browsers=ChromeHeadless`
Expected: all specs pass (existing + 4 new).

- [ ] **Step 7 — Run the full suite to confirm no new breakage**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: only the 2 pre-existing `FormStateService` failures remain; everything else passes.

- [ ] **Step 8 — Commit**

```bash
git add src/app/components/fields/date-range-field/
git commit -m "feat: present date picker as a bottom sheet on small viewports"
```

---

## Task 3 — Visual verification

**Files:**
- Modify: `scripts/verify-responsive.mjs` (append a date-picker verification block)

- [ ] **Step 1 — Append a date-picker check to `scripts/verify-responsive.mjs`**

Add this block inside the `try { ... }` body, after the existing mobile drawer check and before the DESKTOP section (it reuses the `page` already at 375px, `check`, and `log` helpers defined earlier in the file):

```javascript
  console.log('\n=== MOBILE — date picker single month in a sheet ===');
  // Reload to a clean state, switch to Search, expand Itinerary Details
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('.tab')].find((x) => x.textContent.trim().toLowerCase().includes('search'));
    t.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.section-header')].find((x) => x.textContent.includes('Itinerary Details'));
    h.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  const trig = await (await page.$('.drp-trigger')).boundingBox();
  await page.mouse.click(trig.x + trig.width / 2, trig.y + trig.height / 2);
  await new Promise((r) => setTimeout(r, 350));
  const pickerSheet = await page.evaluate(() => {
    const sheet = document.querySelector('.drp-sheet');
    const r = sheet ? sheet.getBoundingClientRect() : null;
    return {
      sheetPresent: !!sheet,
      monthGrids: document.querySelectorAll('app-month-grid').length,
      dividerPresent: !!document.querySelector('.drp-divider'),
      handlePresent: !!document.querySelector('.drp-sheet-handle'),
      bottomAnchored: r ? Math.round(r.bottom) === window.innerHeight : null,
      withinViewport: r ? r.left >= 0 && Math.round(r.right) <= window.innerWidth : null,
      navButtons: document.querySelectorAll('app-month-grid .drp-nav-btn').length,
    };
  });
  log('date picker sheet', pickerSheet);
  check('picker sheet present', pickerSheet.sheetPresent);
  check('single month grid', pickerSheet.monthGrids === 1);
  check('no divider (single month)', pickerSheet.dividerPresent === false);
  check('sheet grab-handle present', pickerSheet.handlePresent);
  check('sheet bottom-anchored', pickerSheet.bottomAnchored === true);
  check('picker within viewport (no overflow)', pickerSheet.withinViewport === true);
  check('single month has both nav arrows', pickerSheet.navButtons === 2);
  await page.screenshot({ path: `${OUT}/resp-5-mobile-datepicker.png` });
```

Add this block to the DESKTOP section (after the existing desktop checks, before the final summary log), to confirm LVP still shows two months:

```javascript
  console.log('\n=== DESKTOP — date picker still two months ===');
  await page2.evaluate(() => {
    const t = [...document.querySelectorAll('.tab')].find((x) => x.textContent.trim().toLowerCase().includes('search'));
    t.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  await page2.evaluate(() => {
    const h = [...document.querySelectorAll('.section-header')].find((x) => x.textContent.includes('Itinerary Details'));
    h.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  const dtrig = await (await page2.$('.drp-trigger')).boundingBox();
  await page2.mouse.click(dtrig.x + dtrig.width / 2, dtrig.y + dtrig.height / 2);
  await new Promise((r) => setTimeout(r, 350));
  const deskPicker = await page2.evaluate(() => ({
    floatingPanel: !!document.querySelector('.drp-picker-wrap'),
    sheetAbsent: !document.querySelector('.drp-sheet'),
    monthGrids: document.querySelectorAll('app-month-grid').length,
    dividerPresent: !!document.querySelector('.drp-divider'),
  }));
  log('desktop date picker', deskPicker);
  check('desktop floating panel', deskPicker.floatingPanel === true);
  check('desktop no sheet', deskPicker.sheetAbsent === true);
  check('desktop two month grids', deskPicker.monthGrids === 2);
  check('desktop divider present', deskPicker.dividerPresent === true);
  await page2.screenshot({ path: `${OUT}/resp-6-desktop-datepicker.png` });
```

- [ ] **Step 2 — Ensure the dev server is running**

The dev server should already be running on port 4200 (started earlier via Bash). If not, start it:
```bash
node_modules/.bin/ng serve --configuration=development --port=4200 > /tmp/ng-serve.log 2>&1 &
```
Confirm: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4200/` returns `200`.

- [ ] **Step 3 — Run the verification script**

Run: `node scripts/verify-responsive.mjs`
Expected: `==== ALL CHECKS PASSED ====` (including the new date-picker checks at 375px and 1280px). Review `/tmp/resp-5-mobile-datepicker.png` (single month in a sheet, within the viewport) and `/tmp/resp-6-desktop-datepicker.png` (two-month floating panel).

- [ ] **Step 4 — Run the full test suite once more**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: only the 2 pre-existing `FormStateService` failures; all date-picker/date-field specs pass.

- [ ] **Step 5 — Commit**

```bash
git add scripts/verify-responsive.mjs
git commit -m "test: verify mobile date picker single-month sheet and desktop two-month"
```

---

## Notes for the implementer

- **Breakpoint:** everything is gated at `max-width: 768px` (CSS) or `matchMedia('(max-width: 768px)')` (TS). Do not introduce other breakpoints.
- **Design tokens:** use `--color-bg-card`, `--font-stack`, etc. from `src/styles.css`. The `#d0d0d0` grab-handle and `rgba(0,0,0,0.4)` backdrop are intentional literals matching the app's other sheets (header menu, drawer).
- **No new components, no new npm dependencies.**
- **Selection state machine is untouched** — `onDayClick`, `goPrev`/`goNext`, `phase`, `onApply`/`onCancel` work identically; single-month mode only changes how many grids render.
- **Real-click caveat (project memory):** the picker had a past bug where day buttons churned in the DOM and real clicks missed. The month grid markup is unchanged here, so this is low-risk, but the Task 3 script uses real hit-tested `page.mouse.click` (not synthetic `.click()`) when opening the picker, consistent with that lesson.
