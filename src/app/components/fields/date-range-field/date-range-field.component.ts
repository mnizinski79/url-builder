import { Component, ElementRef, HostListener, Input } from '@angular/core';
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
  isMobile = false;
  pickerTop = 0;
  pickerLeft = 0;

  constructor(private el: ElementRef) {}

  get parsedStart(): Date | null {
    const v = this.checkInControl?.value;
    if (!v) return null;
    const d = new Date(v + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  get parsedEnd(): Date | null {
    const v = this.checkOutControl?.value;
    if (!v) return null;
    const d = new Date(v + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  get displayText(): string {
    const start = this.parsedStart;
    const end = this.parsedEnd;
    if (!start || !end) return '';
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    };
    return `${start.toLocaleDateString('en-US', opts)} → ${end.toLocaleDateString('en-US', opts)}`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen) {
      const path = event.composedPath ? event.composedPath() : [];
      const insideField = path.some(el => el === this.el.nativeElement);
      if (!insideField) {
        this.isOpen = false;
      }
    }
  }

  togglePicker(event: Event): void {
    event.stopPropagation();
    if (!this.isOpen) {
      this.isMobile = window.matchMedia('(max-width: 768px)').matches;
    }
    this.isOpen = !this.isOpen;
    if (this.isOpen && !this.isMobile) {
      // Wait a tick for the picker to render, then position it
      setTimeout(() => this.updatePickerPosition(), 0);
    }
  }

  private updatePickerPosition(): void {
    const trigger = this.el.nativeElement.querySelector('.drp-trigger');
    const picker = this.el.nativeElement.querySelector('.drp-picker-wrap');
    if (!trigger || !picker) return;

    const triggerRect = (trigger as HTMLElement).getBoundingClientRect();
    const pickerRect = (picker as HTMLElement).getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default: position below the trigger, aligned to its left edge
    let top = triggerRect.bottom + 4;
    let left = triggerRect.left;

    // If picker overflows the bottom, position it above the trigger
    if (top + pickerRect.height > viewportHeight) {
      top = triggerRect.top - pickerRect.height - 4;
    }

    // If it still goes above the viewport, just pin to top
    if (top < 0) {
      top = 8;
    }

    // If picker overflows the right edge, shift left
    if (left + pickerRect.width > viewportWidth) {
      left = viewportWidth - pickerRect.width - 8;
    }

    // If it goes past the left edge, pin to left
    if (left < 0) {
      left = 8;
    }

    this.pickerTop = top;
    this.pickerLeft = left;
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.togglePicker(event);
    }
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
