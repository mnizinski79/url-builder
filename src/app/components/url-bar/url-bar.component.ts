import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhIconComponent } from '../ph-icon/ph-icon.component';

@Component({
  selector: 'app-url-bar',
  standalone: true,
  imports: [CommonModule, PhIconComponent],
  templateUrl: './url-bar.component.html',
  styleUrls: ['./url-bar.component.css'],
})
export class UrlBarComponent {
  @Input() set fullUrl(val: string) {
    const idx = val.indexOf('?');
    this.baseUrl = idx > -1 ? val.substring(0, idx) : val;
    this.queryString = idx > -1 ? val.substring(idx) : '';
    this.fullUrlValue = val;
  }
  @Output() urlCopied = new EventEmitter<void>();

  baseUrl = '';
  queryString = '';
  fullUrlValue = '';

  copied = false;
  showPopover = false;

  get canShare(): boolean {
    return 'share' in navigator;
  }

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.fullUrlValue);
    this.copied = true;
    this.urlCopied.emit();
    setTimeout(() => (this.copied = false), 1800);
  }

  togglePopover(): void {
    this.showPopover = !this.showPopover;
  }

  closePopover(): void {
    this.showPopover = false;
  }

  visit(): void {
    window.open(this.fullUrlValue, '_blank', 'noopener,noreferrer');
  }

  async share(): Promise<void> {
    try {
      await navigator.share({ url: this.fullUrlValue, title: 'IHG URL' });
    } catch {
      // User cancelled or API unavailable — no-op
    }
  }
}
