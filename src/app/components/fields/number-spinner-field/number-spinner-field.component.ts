import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';
import { PhIconComponent } from '../../ph-icon/ph-icon.component';

@Component({
  selector: 'app-number-spinner-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent, PhIconComponent],
  templateUrl: './number-spinner-field.component.html',
  styleUrls: ['./number-spinner-field.component.css'],
})
export class NumberSpinnerFieldComponent {
  @Input() label = '';
  @Input() tooltip = '';
  @Input() required = false;
  @Input() min = 1;
  @Input() max = 9;
  @Input() control!: FormControl;

  /** Current value coerced to a number; empty/invalid resolves to `min`. */
  get current(): number {
    const n = parseInt(this.control.value, 10);
    return isNaN(n) ? this.min : n;
  }

  increment(): void {
    this.control.setValue(this.clamp(this.current + 1));
  }

  decrement(): void {
    this.control.setValue(this.clamp(this.current - 1));
  }

  /** Clamp/coerce a typed value on blur so the control always ends valid. */
  onBlur(): void {
    this.control.setValue(this.clamp(this.current));
  }

  private clamp(n: number): number {
    return Math.min(this.max, Math.max(this.min, n));
  }
}
