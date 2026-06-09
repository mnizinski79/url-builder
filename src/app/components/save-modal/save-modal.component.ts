import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhIconComponent } from '../ph-icon/ph-icon.component';

@Component({
  selector: 'app-save-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PhIconComponent],
  templateUrl: './save-modal.component.html',
  styleUrls: ['./save-modal.component.css'],
})
export class SaveModalComponent {
  @Input() url = '';
  @Output() saved = new EventEmitter<string | null>();
  @Output() cancelled = new EventEmitter<void>();

  nameValue = '';

  save(): void {
    this.saved.emit(this.nameValue.trim() || null);
    this.nameValue = '';
  }

  cancel(): void {
    this.nameValue = '';
    this.cancelled.emit();
  }
}
