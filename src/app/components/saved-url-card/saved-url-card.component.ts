import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedUrl } from '../../models/url-builder.models';
import { PhIconComponent } from '../ph-icon/ph-icon.component';

@Component({
  selector: 'app-saved-url-card',
  standalone: true,
  imports: [CommonModule, PhIconComponent],
  templateUrl: './saved-url-card.component.html',
  styleUrls: ['./saved-url-card.component.css'],
})
export class SavedUrlCardComponent {
  @Input() entry!: SavedUrl;
  @Output() copyUrl = new EventEmitter<string>();
  @Output() deleteEntry = new EventEmitter<string>();

  copied = false;

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.entry.url);
    this.copyUrl.emit(this.entry.url);
    this.copied = true;
    setTimeout(() => (this.copied = false), 1800);
  }

  delete(): void {
    this.deleteEntry.emit(this.entry.id);
  }
}
