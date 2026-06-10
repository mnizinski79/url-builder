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
  @Input() startDate: Date | null = null;
  @Input() endDate: Date | null = null;

  @Output() apply = new EventEmitter<{ start: Date; end: Date }>();
  @Output() cancel = new EventEmitter<void>();

  phase: Phase = 'idle';
  pendingStart: Date | null = null;
  pendingEnd: Date | null = null;
  hoverDate: Date | null = null;

  leftYear!: number;
  leftMonth!: number;

  get rightYear(): number { return this.leftMonth === 11 ? this.leftYear + 1 : this.leftYear; }
  get rightMonth(): number { return this.leftMonth === 11 ? 0 : this.leftMonth + 1; }
  get isConfirmed(): boolean { return this.phase === 'confirmed'; }
  get canApply(): boolean { return this.phase === 'confirmed'; }

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const ref = this.startDate ?? new Date();
    this.leftYear = ref.getFullYear();
    this.leftMonth = ref.getMonth();

    if (this.startDate) {
      this.pendingStart = new Date(this.startDate);
      this.phase = 'awaiting-end';
      if (this.endDate) {
        this.pendingEnd = new Date(this.endDate);
        this.phase = 'confirmed';
      }
    }
  }

  onDayClick(date: Date): void {
    if (this.phase === 'idle' || this.phase === 'confirmed') {
      this.pendingStart = date;
      this.pendingEnd = null;
      this.hoverDate = null;
      this.phase = 'awaiting-end';
      return;
    }
    // awaiting-end
    if (!this.pendingStart || this.toMidnight(date) <= this.toMidnight(this.pendingStart)) {
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

  goNext(): void {
    if (this.leftMonth === 11) { this.leftMonth = 0; this.leftYear++; }
    else { this.leftMonth++; }
  }

  goPrev(): void {
    if (this.leftMonth === 0) { this.leftMonth = 11; this.leftYear--; }
    else { this.leftMonth--; }
  }

  onApply(): void {
    if (!this.canApply || !this.pendingStart || !this.pendingEnd) return;
    this.apply.emit({ start: this.pendingStart, end: this.pendingEnd });
  }

  onCancel(): void {
    this.hoverDate = null;
    this.cancel.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.onCancel(); // single cancel code path
    }
  }

  private toMidnight(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }
}
