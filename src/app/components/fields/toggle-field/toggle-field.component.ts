import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';

@Component({
  selector: 'app-toggle-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent],
  templateUrl: './toggle-field.component.html',
  styleUrls: ['./toggle-field.component.css'],
})
export class ToggleFieldComponent {
  @Input() label = '';
  @Input() description = '';
  @Input() tooltip = '';
  @Input() control!: FormControl;

  toggle(): void {
    this.control.setValue(!this.control.value);
  }
}
