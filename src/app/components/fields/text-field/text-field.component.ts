import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent],
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.css'],
})
export class TextFieldComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() tooltip = '';
  @Input() required = false;
  @Input() control!: FormControl;
}
