import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css'],
})
export class TooltipComponent {
  @Input() text = '';
  visible = false;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  onMouseEnter(): void {
    this.showTimer = setTimeout(() => (this.visible = true), 200);
  }

  onMouseLeave(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
    this.visible = false;
  }
}
