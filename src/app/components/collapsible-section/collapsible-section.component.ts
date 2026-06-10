import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhIconComponent } from '../ph-icon/ph-icon.component';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [CommonModule, PhIconComponent],
  templateUrl: './collapsible-section.component.html',
  styleUrls: ['./collapsible-section.component.css'],
  host: { '[attr.title]': 'null' },
})
export class CollapsibleSectionComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() expanded = false;

  toggle(): void {
    this.expanded = !this.expanded;
  }
}
