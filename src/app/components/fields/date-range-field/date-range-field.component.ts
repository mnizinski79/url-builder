import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';
import { PhIconComponent } from '../../ph-icon/ph-icon.component';

@Component({
  selector: 'app-date-range-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent, PhIconComponent],
  templateUrl: './date-range-field.component.html',
  styleUrls: ['./date-range-field.component.css'],
})
export class DateRangeFieldComponent {
  @Input() label = '';
  @Input() tooltip = '';
  @Input() required = false;
  @Input() checkInControl!: FormControl;
  @Input() checkOutControl!: FormControl;
}
