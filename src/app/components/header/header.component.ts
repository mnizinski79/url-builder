import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhIconComponent } from '../ph-icon/ph-icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, PhIconComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Output() openSaved = new EventEmitter<void>();
  @Output() openHistory = new EventEmitter<void>();

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onSaved(): void {
    this.menuOpen = false;
    this.openSaved.emit();
  }

  onHistory(): void {
    this.menuOpen = false;
    this.openHistory.emit();
  }
}
