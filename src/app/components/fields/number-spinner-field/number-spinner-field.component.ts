import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';

@Component({
  selector: 'app-number-spinner-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent],
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
  @Input() icon = '🛏';

  increment(): void {
    const current = this.control.value ?? this.min;
    if (current < this.max) this.control.setValue(current + 1);
  }

  decrement(): void {
    const current = this.control.value ?? this.min;
    if (current > this.min) this.control.setValue(current - 1);
  }
}
