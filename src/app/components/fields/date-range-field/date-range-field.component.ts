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

  togglePicker(event: Event): void {
    event.stopPropagation();
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
