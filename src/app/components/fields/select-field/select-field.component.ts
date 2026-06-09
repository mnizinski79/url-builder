import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';
import { SelectOption, SelectGroup } from '../../../models/url-builder.models';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent],
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.css'],
})
export class SelectFieldComponent {
  @Input() label = '';
  @Input() tooltip = '';
  @Input() required = false;
  @Input() control!: FormControl;
  @Input() options: SelectOption[] = [];
  @Input() groups: SelectGroup[] = [];
  @Input() placeholder = 'Select...';
}
