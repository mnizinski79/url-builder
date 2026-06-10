import { Component, Input, ElementRef } from '@angular/core';
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
  tooltipStyle: { [key: string]: string } = {};
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private el: ElementRef) {}

  onMouseEnter(): void {
    const trigger = this.el.nativeElement.querySelector(
      '.tooltip-trigger'
    ) as HTMLElement;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      this.tooltipStyle = {
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top - 10}px`,
        transform: 'translate(-50%, -100%)',
      };
    }
    this.showTimer = setTimeout(() => (this.visible = true), 150);
  }

  onMouseLeave(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
    this.visible = false;
  }
}
