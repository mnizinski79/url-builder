// src/app/components/date-range-picker/month-grid/month-grid.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
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
export class MonthGridComponent implements OnInit, OnChanges {
  @Input() year!: number;
  @Input() month!: number;
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

  ngOnInit(): void {
    this.rebuild();
  }

  ngOnChanges(): void {
    this.rebuild();
  }

  private rebuild(): void {
    if (this.year == null || this.month == null) return;
    this.monthTitle = new Date(this.year, this.month, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    this.dayCells = this.buildCells();
    this.nightsCount = this.computeNights();
  }

  private buildCells(): DayCell[] {
    const cells: DayCell[] = [];
    const firstDow = new Date(this.year, this.month, 1).getDay();
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
