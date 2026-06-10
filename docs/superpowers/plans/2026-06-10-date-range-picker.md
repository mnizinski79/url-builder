# Date Range Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two bare `<input type="date">` fields in `DateRangeFieldComponent` with a custom two-month calendar picker that shows a highlighted range in real time and writes ISO date strings back to the existing `FormControl`s on Apply.

**Architecture:** Three Angular 17 standalone components — `MonthGridComponent` renders a single month's day grid, `DateRangePickerComponent` owns the selection state machine and hosts two grids side by side, and the existing `DateRangeFieldComponent` is updated to show a styled field trigger and conditionally render the picker. No new npm dependencies.

**Tech Stack:** Angular 17.3 standalone components · Karma/Jasmine · CSS custom properties from `src/styles.css`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/app/components/date-range-picker/month-grid/month-grid.component.ts` | Day-cell data model + class computation |
| Create | `src/app/components/date-range-picker/month-grid/month-grid.component.html` | Month header + 7-column day grid |
| Create | `src/app/components/date-range-picker/month-grid/month-grid.component.css` | Strip/circle pseudo-element styles |
| Create | `src/app/components/date-range-picker/month-grid/month-grid.component.spec.ts` | Unit tests for cell classification |
| Create | `src/app/components/date-range-picker/date-range-picker.component.ts` | State machine, month nav, apply/cancel |
| Create | `src/app/components/date-range-picker/date-range-picker.component.html` | Two-month panel + footer |
| Create | `src/app/components/date-range-picker/date-range-picker.component.css` | Panel, footer, divider |
| Create | `src/app/components/date-range-picker/date-range-picker.component.spec.ts` | State machine + nav unit tests |
| Modify | `src/app/components/fields/date-range-field/date-range-field.component.ts` | Add `isOpen`, `displayText`, `parsedStart/End`, `onApply/Cancel` |
| Modify | `src/app/components/fields/date-range-field/date-range-field.component.html` | Replace inputs with styled trigger + picker |
| Modify | `src/app/components/fields/date-range-field/date-range-field.component.css` | Trigger styles, picker positioning |

---

## Task 1 — MonthGridComponent

**Files:**
- Create: `src/app/components/date-range-picker/month-grid/month-grid.component.ts`
- Create: `src/app/components/date-range-picker/month-grid/month-grid.component.html`
- Create: `src/app/components/date-range-picker/month-grid/month-grid.component.css`
- Test: `src/app/components/date-range-picker/month-grid/month-grid.component.spec.ts`

- [ ] **Step 1 — Write the failing tests**

```typescript
// src/app/components/date-range-picker/month-grid/month-grid.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthGridComponent } from './month-grid.component';

describe('MonthGridComponent', () => {
  let component: MonthGridComponent;
  let fixture: ComponentFixture<MonthGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthGridComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MonthGridComponent);
    component = fixture.componentInstance;
    // June 2026: starts on Monday (index 1) → 1 leading empty cell
    component.year = 2026;
    component.month = 5;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate leading empty cells for the month', () => {
    // June 2026 starts on Monday → 1 leading empty cell
    expect(component.dayCells[0].isEmpty).toBeTrue();
    expect(component.dayCells[1].isEmpty).toBeFalse();
    expect(component.dayCells[1].date.getDate()).toBe(1);
  });

  it('should classify the start date cell', () => {
    component.startDate = new Date(2026, 5, 9);
    component.ngOnChanges();
    const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 9)!;
    expect(cell.isStart).toBeTrue();
    expect(cell.isInRange).toBeFalse();
    expect(cell.isHoverRange).toBeFalse();
  });

  it('should classify in-range cells when confirmed', () => {
    component.startDate = new Date(2026, 5, 9);
    component.endDate = new Date(2026, 5, 15);
    component.confirmed = true;
    component.ngOnChanges();
    [10, 11, 12, 13, 14].forEach(d => {
      const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === d)!;
      expect(cell.isInRange).withContext(`day ${d}`).toBeTrue();
    });
    // start and end not in-range themselves
    expect(component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 9)!.isInRange).toBeFalse();
    expect(component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 15)!.isInRange).toBeFalse();
  });

  it('should classify hover-range cells when not confirmed', () => {
    component.startDate = new Date(2026, 5, 9);
    component.hoverDate = new Date(2026, 5, 15);
    component.confirmed = false;
    component.ngOnChanges();
    const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 12)!;
    expect(cell.isHoverRange).toBeTrue();
    expect(cell.isInRange).toBeFalse();
  });

  it('should classify the hover-end cell', () => {
    component.startDate = new Date(2026, 5, 9);
    component.hoverDate = new Date(2026, 5, 18);
    component.confirmed = false;
    component.ngOnChanges();
    const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 18)!;
    expect(cell.isHoverEnd).toBeTrue();
  });

  it('should compute nightsCount correctly', () => {
    component.startDate = new Date(2026, 5, 9);
    component.hoverDate = new Date(2026, 5, 18);
    component.confirmed = false;
    component.ngOnChanges();
    expect(component.nightsCount).toBe(9);
  });

  it('should set nightsCount to null when confirmed', () => {
    component.startDate = new Date(2026, 5, 9);
    component.endDate = new Date(2026, 5, 18);
    component.hoverDate = new Date(2026, 5, 18);
    component.confirmed = true;
    component.ngOnChanges();
    expect(component.nightsCount).toBeNull();
  });

  it('should set isConfirmedStart when confirmed and isStart', () => {
    component.startDate = new Date(2026, 5, 9);
    component.endDate = new Date(2026, 5, 15);
    component.confirmed = true;
    component.ngOnChanges();
    const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 9)!;
    expect(cell.isConfirmedStart).toBeTrue();
  });
});
```

- [ ] **Step 2 — Run tests to confirm they fail**

```bash
cd "/Users/nizinsmi/Desktop/Dev Projects/url-builder"
npx ng test --include="**/month-grid.component.spec.ts" --watch=false --browsers=ChromeHeadless
```

Expected: multiple failures like `Cannot find module './month-grid.component'`.

- [ ] **Step 3 — Create `month-grid.component.ts`**

```typescript
// src/app/components/date-range-picker/month-grid/month-grid.component.ts
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DayCell {
  date: Date;
  isEmpty: boolean;
  isStart: boolean;
  isConfirmedStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isHoverRange: boolean;
  isHoverEnd: boolean;
  ariaLabel: string;
}

@Component({
  selector: 'app-month-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './month-grid.component.html',
  styleUrls: ['./month-grid.component.css'],
})
export class MonthGridComponent implements OnChanges {
  @Input() year!: number;
  @Input() month!: number;           // 0-based (0=Jan … 11=Dec)
  @Input() showPrev = false;
  @Input() showNext = false;
  @Input() startDate: Date | null = null;
  @Input() endDate: Date | null = null;
  @Input() hoverDate: Date | null = null;
  @Input() confirmed = false;

  @Output() dayClick = new EventEmitter<Date>();
  @Output() dayHover = new EventEmitter<Date>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  readonly DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  dayCells: DayCell[] = [];
  monthTitle = '';
  nightsCount: number | null = null;

  ngOnChanges(): void {
    this.monthTitle = new Date(this.year, this.month, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    this.dayCells = this.buildCells();
    this.nightsCount = this.computeNights();
  }

  private buildCells(): DayCell[] {
    const cells: DayCell[] = [];
    const firstDow = new Date(this.year, this.month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

    for (let i = 0; i < firstDow; i++) {
      cells.push({
        date: new Date(0), isEmpty: true,
        isStart: false, isConfirmedStart: false, isEnd: false,
        isInRange: false, isHoverRange: false, isHoverEnd: false, ariaLabel: '',
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(this.classifyCell(new Date(this.year, this.month, d)));
    }
    return cells;
  }

  private classifyCell(date: Date): DayCell {
    const isStart = this.isSameDay(date, this.startDate);
    const isEnd = this.isSameDay(date, this.endDate);
    const isHoverEnd = !this.confirmed && !isEnd && this.isSameDay(date, this.hoverDate);
    const isInRange = !isStart && !isEnd && this.confirmed
      && this.between(date, this.startDate, this.endDate);
    const isHoverRange = !isStart && !isHoverEnd && !this.confirmed
      && !!this.hoverDate && this.hoverDate > (this.startDate ?? new Date(0))
      && this.between(date, this.startDate, this.hoverDate);

    return {
      date, isEmpty: false,
      isStart,
      isConfirmedStart: isStart && this.confirmed,
      isEnd,
      isInRange,
      isHoverRange,
      isHoverEnd,
      ariaLabel: this.buildAriaLabel(date, isStart, isEnd, isInRange),
    };
  }

  private isSameDay(a: Date, b: Date | null): boolean {
    if (!b) return false;
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  /** True if date is strictly between start and end (order-insensitive). */
  private between(date: Date, start: Date | null, end: Date | null): boolean {
    if (!start || !end) return false;
    const t = date.getTime(), s = start.getTime(), e = end.getTime();
    return s < e ? t > s && t < e : t > e && t < s;
  }

  private buildAriaLabel(date: Date, isStart: boolean, isEnd: boolean, isInRange: boolean): string {
    const base = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    if (isStart) return `${base}, check-in`;
    if (isEnd) return `${base}, check-out`;
    if (isInRange) return `${base}, in range`;
    return base;
  }

  private computeNights(): number | null {
    if (!this.startDate || !this.hoverDate || this.confirmed) return null;
    const diff = this.hoverDate.getTime() - this.startDate.getTime();
    return diff > 0 ? Math.round(diff / 86_400_000) : null;
  }
}
```

- [ ] **Step 4 — Create `month-grid.component.html`**

```html
<!-- src/app/components/date-range-picker/month-grid/month-grid.component.html -->
<div class="drp-month-header">
  <button class="drp-nav-btn" *ngIf="showPrev" (click)="prev.emit()" aria-label="Previous month">‹</button>
  <span class="drp-nav-spacer" *ngIf="!showPrev"></span>
  <span class="drp-month-title">{{ monthTitle }}</span>
  <button class="drp-nav-btn" *ngIf="showNext" (click)="next.emit()" aria-label="Next month">›</button>
  <span class="drp-nav-spacer" *ngIf="!showNext"></span>
</div>

<div class="drp-grid" role="grid">
  <span class="drp-dow" *ngFor="let d of DOW_LABELS" role="columnheader">{{ d }}</span>

  <button
    *ngFor="let cell of dayCells"
    class="drp-day"
    [class.empty]="cell.isEmpty"
    [class.start]="cell.isStart"
    [class.confirmed]="cell.isConfirmedStart"
    [class.end]="cell.isEnd"
    [class.in-range]="cell.isInRange"
    [class.hover-range]="cell.isHoverRange"
    [class.hover-end]="cell.isHoverEnd"
    [attr.data-d]="cell.isEmpty ? null : cell.date.getDate()"
    [attr.aria-label]="cell.ariaLabel || null"
    [attr.aria-disabled]="cell.isEmpty ? 'true' : null"
    [disabled]="cell.isEmpty"
    (click)="!cell.isEmpty && dayClick.emit(cell.date)"
    (mouseenter)="!cell.isEmpty && dayHover.emit(cell.date)"
    role="gridcell"
  >
    <span
      class="nights-tip"
      *ngIf="cell.isHoverEnd && nightsCount !== null"
      aria-hidden="true"
    >{{ nightsCount }} nights</span>
    {{ cell.isEmpty ? '' : cell.date.getDate() }}
  </button>
</div>
```

- [ ] **Step 5 — Create `month-grid.component.css`**

```css
/* src/app/components/date-range-picker/month-grid/month-grid.component.css */

/* ── Header ── */
.drp-month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  width: 224px;
}
.drp-month-title { font-size: 13px; font-weight: 600; color: #222226; }
.drp-nav-btn {
  background: none;
  border: 1px solid #e0e0e2;
  border-radius: 4px;
  color: #6b6b6c;
  font-size: 14px;
  line-height: 1;
  padding: 2px 8px;
  cursor: pointer;
  font-family: var(--font-stack);
}
.drp-nav-btn:hover { background: rgba(0,0,0,0.04); }
.drp-nav-spacer { width: 32px; }

/* ── Grid: 7 × 32px fixed squares ── */
.drp-grid {
  display: grid;
  grid-template-columns: repeat(7, 32px);
  grid-auto-rows: 32px;
  gap: 0;
  width: 224px;
}

.drp-dow {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: #9CA3AF;
  height: 32px;
}

/* ── Day cell base ──
   position:relative + z-index:0 creates a stacking context so
   ::before { z-index:-1 } stays behind text within this cell only.
*/
.drp-day {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #222226;
  cursor: pointer;
  position: relative;
  z-index: 0;
  /* button reset */
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-stack);
  outline: none;
}
.drp-day:not(.empty):not(.start):not(.end):not(.hover-end):hover {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}
.drp-day.empty { cursor: default; pointer-events: none; }

/* ── Range strip via ::before (26px tall, 3px top/bottom inset) ── */
.drp-day.in-range::before,
.drp-day.hover-range::before,
.drp-day.start::before,
.drp-day.end::before,
.drp-day.hover-end::before {
  content: '';
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 0;
  right: 0;
  z-index: -1; /* behind text, within cell's stacking context */
}

.drp-day.in-range::before    { background: #d0e4ee; }
.drp-day.hover-range::before { background: #e2eff6; }

/* Start: right half only. confirmed modifier swaps hover→confirmed color */
.drp-day.start::before              { left: 50%; background: #e2eff6; }
.drp-day.start.confirmed::before    { background: #d0e4ee; }

/* End: left half only */
.drp-day.end::before      { right: 50%; background: #d0e4ee; }

/* Hover-end: left half only (hover color) */
.drp-day.hover-end::before { right: 50%; background: #e2eff6; }

/* ── Circle badge via ::after (26px diameter, same 3px inset) ── */
.drp-day.start::after,
.drp-day.end::after,
.drp-day.hover-end::after {
  content: attr(data-d);
  position: absolute;
  inset: 3px; /* 26 × 26 px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  z-index: 1; /* above strip and text */
}
.drp-day.start::after, .drp-day.end::after { background: #1f4456; color: white; }
.drp-day.hover-end::after { background: #2b6880; color: white; }

/* Hide the button's own text on cells that show the number via ::after */
.drp-day.start,
.drp-day.end,
.drp-day.hover-end { color: transparent; }

/* Hover-end cell must paint above siblings so the tooltip overflows */
.drp-day.hover-end { z-index: 2; }

/* ── Nights counter tooltip ── */
.nights-tip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  color: white;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  padding: 5px 10px;
  border-radius: 6px;
  z-index: 10;
  pointer-events: none;
  font-family: var(--font-stack);
}
.nights-tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1a1a1a;
}
```

- [ ] **Step 6 — Run tests, confirm they pass**

```bash
npx ng test --include="**/month-grid.component.spec.ts" --watch=false --browsers=ChromeHeadless
```

Expected: 8 specs, 0 failures.

- [ ] **Step 7 — Commit**

```bash
git add src/app/components/date-range-picker/
git commit -m "feat: add MonthGridComponent with range cell classification"
```

---

## Task 2 — DateRangePickerComponent

**Files:**
- Create: `src/app/components/date-range-picker/date-range-picker.component.ts`
- Create: `src/app/components/date-range-picker/date-range-picker.component.html`
- Create: `src/app/components/date-range-picker/date-range-picker.component.css`
- Test: `src/app/components/date-range-picker/date-range-picker.component.spec.ts`

- [ ] **Step 1 — Write the failing tests**

```typescript
// src/app/components/date-range-picker/date-range-picker.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateRangePickerComponent } from './date-range-picker.component';

describe('DateRangePickerComponent', () => {
  let component: DateRangePickerComponent;
  let fixture: ComponentFixture<DateRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangePickerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DateRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('state machine', () => {
    it('should be idle on init', () => {
      expect(component.phase).toBe('idle');
    });

    it('IDLE → AWAITING_END on first click', () => {
      component.onDayClick(new Date(2026, 5, 9));
      expect(component.phase).toBe('awaiting-end');
      expect(component.pendingStart?.getDate()).toBe(9);
      expect(component.pendingEnd).toBeNull();
    });

    it('AWAITING_END → CONFIRMED when clicking a date after start', () => {
      component.onDayClick(new Date(2026, 5, 9));
      component.onDayClick(new Date(2026, 5, 15));
      expect(component.phase).toBe('confirmed');
      expect(component.pendingEnd?.getDate()).toBe(15);
    });

    it('AWAITING_END restarts when clicking same day as start', () => {
      component.onDayClick(new Date(2026, 5, 9));
      component.onDayClick(new Date(2026, 5, 9));
      expect(component.phase).toBe('awaiting-end');
      expect(component.pendingEnd).toBeNull();
    });

    it('AWAITING_END restarts when clicking a date before start', () => {
      component.onDayClick(new Date(2026, 5, 9));
      component.onDayClick(new Date(2026, 5, 5));
      expect(component.phase).toBe('awaiting-end');
      expect(component.pendingStart?.getDate()).toBe(5);
      expect(component.pendingEnd).toBeNull();
    });

    it('CONFIRMED → AWAITING_END (restart) when clicking a day', () => {
      component.onDayClick(new Date(2026, 5, 9));
      component.onDayClick(new Date(2026, 5, 15));
      component.onDayClick(new Date(2026, 5, 20));
      expect(component.phase).toBe('awaiting-end');
      expect(component.pendingStart?.getDate()).toBe(20);
    });
  });

  describe('month navigation', () => {
    it('should advance to next month', () => {
      component.leftYear = 2026;
      component.leftMonth = 5; // June
      component.goNext();
      expect(component.leftMonth).toBe(6);
      expect(component.leftYear).toBe(2026);
    });

    it('should wrap Dec → Jan and increment year', () => {
      component.leftYear = 2026;
      component.leftMonth = 11;
      component.goNext();
      expect(component.leftMonth).toBe(0);
      expect(component.leftYear).toBe(2027);
    });

    it('should go to previous month', () => {
      component.leftYear = 2026;
      component.leftMonth = 6;
      component.goPrev();
      expect(component.leftMonth).toBe(5);
      expect(component.leftYear).toBe(2026);
    });

    it('should wrap Jan → Dec and decrement year', () => {
      component.leftYear = 2026;
      component.leftMonth = 0;
      component.goPrev();
      expect(component.leftMonth).toBe(11);
      expect(component.leftYear).toBe(2025);
    });

    it('should compute right month from left', () => {
      component.leftYear = 2026;
      component.leftMonth = 5;
      expect(component.rightMonth).toBe(6);
      expect(component.rightYear).toBe(2026);
    });

    it('should wrap right month year on December', () => {
      component.leftYear = 2026;
      component.leftMonth = 11;
      expect(component.rightMonth).toBe(0);
      expect(component.rightYear).toBe(2027);
    });
  });

  describe('apply / cancel', () => {
    it('should emit apply with start and end when confirmed', () => {
      const spy = spyOn(component.apply, 'emit');
      component.onDayClick(new Date(2026, 5, 9));
      component.onDayClick(new Date(2026, 5, 15));
      component.onApply();
      expect(spy).toHaveBeenCalledWith({
        start: jasmine.objectContaining({ }),
        end: jasmine.objectContaining({ }),
      });
      const call = spy.calls.first().args[0];
      expect(call.start.getDate()).toBe(9);
      expect(call.end.getDate()).toBe(15);
    });

    it('should not emit apply when not confirmed', () => {
      const spy = spyOn(component.apply, 'emit');
      component.onDayClick(new Date(2026, 5, 9)); // only start — phase=awaiting-end
      component.onApply();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should emit cancel', () => {
      const spy = spyOn(component.cancel, 'emit');
      component.onCancel();
      expect(spy).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2 — Run tests to confirm they fail**

```bash
npx ng test --include="**/date-range-picker.component.spec.ts" --watch=false --browsers=ChromeHeadless
```

Expected: failures — `Cannot find module './date-range-picker.component'`.

- [ ] **Step 3 — Create `date-range-picker.component.ts`**

```typescript
// src/app/components/date-range-picker/date-range-picker.component.ts
import {
  Component, Input, Output, EventEmitter, OnInit,
  ElementRef, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthGridComponent } from './month-grid/month-grid.component';

export type Phase = 'idle' | 'awaiting-end' | 'confirmed';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, MonthGridComponent],
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.css'],
})
export class DateRangePickerComponent implements OnInit {
  /** Pre-populated from the field's existing FormControl values. */
  @Input() startDate: Date | null = null;
  @Input() endDate: Date | null = null;

  @Output() apply = new EventEmitter<{ start: Date; end: Date }>();
  @Output() cancel = new EventEmitter<void>();

  // State machine
  phase: Phase = 'idle';
  pendingStart: Date | null = null;
  pendingEnd: Date | null = null;
  hoverDate: Date | null = null;

  // Month navigation
  leftYear!: number;
  leftMonth!: number;

  get rightYear(): number { return this.leftMonth === 11 ? this.leftYear + 1 : this.leftYear; }
  get rightMonth(): number { return this.leftMonth === 11 ? 0 : this.leftMonth + 1; }

  get isConfirmed(): boolean { return this.phase === 'confirmed'; }
  get canApply(): boolean { return this.phase === 'confirmed'; }

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // Start showing the month of the existing start date (or today)
    const ref = this.startDate ?? new Date();
    this.leftYear = ref.getFullYear();
    this.leftMonth = ref.getMonth();

    // Pre-populate state from passed-in dates
    if (this.startDate) {
      this.pendingStart = new Date(this.startDate);
      this.phase = 'awaiting-end';
      if (this.endDate) {
        this.pendingEnd = new Date(this.endDate);
        this.phase = 'confirmed';
      }
    }
  }

  // ── State machine ──────────────────────────────────────────────

  onDayClick(date: Date): void {
    if (this.phase === 'idle' || this.phase === 'confirmed') {
      // Start a new selection
      this.pendingStart = date;
      this.pendingEnd = null;
      this.hoverDate = null;
      this.phase = 'awaiting-end';
      return;
    }
    // phase === 'awaiting-end'
    if (!this.pendingStart || date <= this.pendingStart) {
      // Restart with this date as new start
      this.pendingStart = date;
      this.pendingEnd = null;
      this.hoverDate = null;
      return;
    }
    this.pendingEnd = date;
    this.hoverDate = null;
    this.phase = 'confirmed';
  }

  onDayHover(date: Date): void {
    if (this.phase === 'awaiting-end') {
      this.hoverDate = date;
    }
  }

  // ── Navigation ─────────────────────────────────────────────────

  goNext(): void {
    if (this.leftMonth === 11) { this.leftMonth = 0; this.leftYear++; }
    else { this.leftMonth++; }
  }

  goPrev(): void {
    if (this.leftMonth === 0) { this.leftMonth = 11; this.leftYear--; }
    else { this.leftMonth--; }
  }

  // ── Apply / Cancel ─────────────────────────────────────────────

  onApply(): void {
    if (!this.canApply || !this.pendingStart || !this.pendingEnd) return;
    this.apply.emit({ start: this.pendingStart, end: this.pendingEnd });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // ── Outside-click dismissal ────────────────────────────────────
  // stopPropagation() on the field trigger prevents this from firing
  // immediately when the picker is first opened.

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.cancel.emit();
    }
  }
}
```

- [ ] **Step 4 — Create `date-range-picker.component.html`**

```html
<!-- src/app/components/date-range-picker/date-range-picker.component.html -->
<div class="drp-panel" role="dialog" aria-label="Select date range">
  <div class="drp-months">

    <!-- Left month -->
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

    <!-- Right month -->
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

  </div>

  <div class="drp-footer">
    <button class="drp-btn-cancel" type="button" (click)="onCancel()">Cancel</button>
    <button
      class="drp-btn-apply"
      type="button"
      [attr.aria-disabled]="!canApply"
      (click)="onApply()"
    >Apply</button>
  </div>
</div>
```

- [ ] **Step 5 — Create `date-range-picker.component.css`**

```css
/* src/app/components/date-range-picker/date-range-picker.component.css */
.drp-panel {
  background: white;
  border: 1.5px solid #e0e0e2;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 20px;
  display: inline-block;
  user-select: none;
}

.drp-months {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.drp-divider {
  width: 1px;
  background: #f0f0f0;
  align-self: stretch;
  margin: 0 20px;
  flex-shrink: 0;
}

/* ── Footer ── */
.drp-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding-top: 14px;
  margin-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.drp-btn-cancel,
.drp-btn-apply {
  border-radius: var(--radius-button);
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-stack);
  padding: 7px 16px;
  cursor: pointer;
  transition: opacity 150ms ease, background 150ms ease;
}

.drp-btn-cancel {
  background: none;
  border: 1px solid #e0e0e2;
  color: #6b6b6c;
}
.drp-btn-cancel:hover { background: rgba(0, 0, 0, 0.04); }

.drp-btn-apply {
  background: #1f4456;
  color: white;
  border: none;
}
.drp-btn-apply:hover { opacity: 0.88; }
.drp-btn-apply[aria-disabled='true'] {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}
```

- [ ] **Step 6 — Run tests, confirm they pass**

```bash
npx ng test --include="**/date-range-picker.component.spec.ts" --watch=false --browsers=ChromeHeadless
```

Expected: 14 specs, 0 failures.

- [ ] **Step 7 — Commit**

```bash
git add src/app/components/date-range-picker/
git commit -m "feat: add DateRangePickerComponent with state machine and month navigation"
```

---

## Task 3 — Update DateRangeFieldComponent

**Files:**
- Modify: `src/app/components/fields/date-range-field/date-range-field.component.ts`
- Modify: `src/app/components/fields/date-range-field/date-range-field.component.html`
- Modify: `src/app/components/fields/date-range-field/date-range-field.component.css`
- Test: `src/app/components/fields/date-range-field/date-range-field.component.spec.ts` (create)

- [ ] **Step 1 — Write the failing tests**

```typescript
// src/app/components/fields/date-range-field/date-range-field.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DateRangeFieldComponent } from './date-range-field.component';

describe('DateRangeFieldComponent', () => {
  let component: DateRangeFieldComponent;
  let fixture: ComponentFixture<DateRangeFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangeFieldComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DateRangeFieldComponent);
    component = fixture.componentInstance;
    component.label = 'Eligible stay dates';
    component.checkInControl = new FormControl('');
    component.checkOutControl = new FormControl('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show placeholder when no dates are set', () => {
    expect(component.displayText).toBe('');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.drp-field-text')?.textContent?.trim()).toContain('Select date range');
  });

  it('should show formatted dates when both controls have values', () => {
    component.checkInControl.setValue('2026-06-09');
    component.checkOutControl.setValue('2026-07-03');
    expect(component.displayText).toContain('Jun 9');
    expect(component.displayText).toContain('Jul 3');
    expect(component.displayText).toContain('→');
  });

  it('parsedStart returns null when control is empty', () => {
    expect(component.parsedStart).toBeNull();
  });

  it('parsedStart returns Date when control has ISO value', () => {
    component.checkInControl.setValue('2026-06-09');
    const d = component.parsedStart;
    expect(d).not.toBeNull();
    expect(d!.getDate()).toBe(9);
    expect(d!.getMonth()).toBe(5); // June
  });

  it('isOpen is false initially', () => {
    expect(component.isOpen).toBeFalse();
  });

  it('togglePicker opens and closes the picker', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.togglePicker(event);
    expect(component.isOpen).toBeTrue();
    component.togglePicker(event);
    expect(component.isOpen).toBeFalse();
  });

  it('onApply writes ISO strings to both controls and closes picker', () => {
    component.isOpen = true;
    component.onApply({ start: new Date(2026, 5, 9), end: new Date(2026, 6, 3) });
    expect(component.checkInControl.value).toBe('2026-06-09');
    expect(component.checkOutControl.value).toBe('2026-07-03');
    expect(component.isOpen).toBeFalse();
  });

  it('onCancel closes picker without changing controls', () => {
    component.isOpen = true;
    component.onCancel();
    expect(component.isOpen).toBeFalse();
    expect(component.checkInControl.value).toBe('');
  });
});
```

- [ ] **Step 2 — Run tests to confirm they fail**

```bash
npx ng test --include="**/date-range-field.component.spec.ts" --watch=false --browsers=ChromeHeadless
```

Expected: failures because the component hasn't been updated yet.

- [ ] **Step 3 — Replace `date-range-field.component.ts`**

```typescript
// src/app/components/fields/date-range-field/date-range-field.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';
import { PhIconComponent } from '../../ph-icon/ph-icon.component';
import { DateRangePickerComponent } from '../../date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-date-range-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent, PhIconComponent, DateRangePickerComponent],
  templateUrl: './date-range-field.component.html',
  styleUrls: ['./date-range-field.component.css'],
})
export class DateRangeFieldComponent {
  @Input() label = '';
  @Input() tooltip = '';
  @Input() required = false;
  @Input() checkInControl!: FormControl;
  @Input() checkOutControl!: FormControl;

  isOpen = false;

  get parsedStart(): Date | null {
    const v = this.checkInControl?.value;
    return v ? new Date(v + 'T00:00:00') : null;
  }

  get parsedEnd(): Date | null {
    const v = this.checkOutControl?.value;
    return v ? new Date(v + 'T00:00:00') : null;
  }

  get displayText(): string {
    const ci = this.checkInControl?.value;
    const co = this.checkOutControl?.value;
    if (!ci || !co) return '';
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    };
    const start = new Date(ci + 'T00:00:00');
    const end = new Date(co + 'T00:00:00');
    return `${start.toLocaleDateString('en-US', opts)} → ${end.toLocaleDateString('en-US', opts)}`;
  }

  togglePicker(event: MouseEvent): void {
    event.stopPropagation(); // prevent document:click on DateRangePickerComponent from firing
    this.isOpen = !this.isOpen;
  }

  onApply(event: { start: Date; end: Date }): void {
    this.checkInControl.setValue(this.toISODate(event.start));
    this.checkOutControl.setValue(this.toISODate(event.end));
    this.isOpen = false;
  }

  onCancel(): void {
    this.isOpen = false;
  }

  private toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
```

- [ ] **Step 4 — Replace `date-range-field.component.html`**

```html
<!-- src/app/components/fields/date-range-field/date-range-field.component.html -->
<div class="field">
  <div class="field-label-row">
    <label class="field-label">
      {{ label }}<span *ngIf="required" class="required"> *</span>
    </label>
    <app-tooltip *ngIf="tooltip" [text]="tooltip"></app-tooltip>
  </div>

  <!-- Field trigger -->
  <div class="drp-trigger" (click)="togglePicker($event)" role="button" tabindex="0">
    <div class="drp-trigger-icon">
      <ph-icon name="calendar-blank" [size]="16"></ph-icon>
    </div>
    <span class="drp-field-text" [class.placeholder]="!displayText">
      {{ displayText || 'Select date range…' }}
    </span>
  </div>

  <!-- Floating picker panel -->
  <div class="drp-picker-wrap" *ngIf="isOpen">
    <app-date-range-picker
      [startDate]="parsedStart"
      [endDate]="parsedEnd"
      (apply)="onApply($event)"
      (cancel)="onCancel()"
    ></app-date-range-picker>
  </div>
</div>
```

- [ ] **Step 5 — Replace `date-range-field.component.css`**

```css
/* src/app/components/fields/date-range-field/date-range-field.component.css */
.field { display: flex; flex-direction: column; gap: 6px; position: relative; }

.field-label-row { display: flex; align-items: center; justify-content: space-between; }
.field-label { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
.required { color: var(--color-red); }

/* ── Field trigger ── */
.drp-trigger {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-field);
  overflow: hidden;
  background: var(--color-bg-card);
  cursor: pointer;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.drp-trigger:hover {
  border-color: var(--color-border-focus);
}
.drp-trigger:focus-within {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 2px rgba(27, 42, 74, 0.12);
  outline: none;
}

.drp-trigger-icon {
  background: #e0e0e2;
  padding: 10px 10px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: #6b6b6c;
}

.drp-field-text {
  padding: 10px 12px;
  font-size: 13px;
  color: var(--color-text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.drp-field-text.placeholder {
  color: var(--color-text-placeholder);
}

/* ── Picker panel positioning ── */
.drp-picker-wrap {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 200;
}
```

- [ ] **Step 6 — Run all tests**

```bash
npx ng test --include="**/date-range-field.component.spec.ts" --watch=false --browsers=ChromeHeadless
```

Expected: 9 specs, 0 failures.

- [ ] **Step 7 — Run all project tests to confirm nothing broke**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```

Expected: all specs pass.

- [ ] **Step 8 — Smoke-test in the browser**

```bash
npx ng serve --configuration=development
```

Open http://localhost:4200, go to the Search tab, find the "Eligible stay dates" field. Verify:
1. Field shows "Select date range…" placeholder with calendar icon
2. Clicking the field opens the two-month picker
3. Clicking a start date darkens its circle
4. Hovering toward an end date highlights the range in light blue and shows the nights tooltip
5. Clicking an end date confirms the selection
6. Apply closes the picker and writes the dates to the field in `Day, Mon D, YYYY → Day, Mon D, YYYY` format
7. Cancel closes without writing
8. Clicking outside the picker closes it

- [ ] **Step 9 — Commit**

```bash
git add src/app/components/fields/date-range-field/
git commit -m "feat: wire DateRangeFieldComponent to custom date range picker"
```
