import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collapsible-section.component.html',
  styleUrls: ['./collapsible-section.component.css'],
})
export class CollapsibleSectionComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() expanded = false;

  toggle(): void {
    this.expanded = !this.expanded;
  }
}
