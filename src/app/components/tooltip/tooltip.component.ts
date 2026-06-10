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
      const bubbleWidth = 280;
      const margin = 12;
      const triggerCenterX = rect.left + rect.width / 2;
      // Clamp the bubble's left edge so it never crosses the viewport margin.
      const maxLeft = window.innerWidth - bubbleWidth - margin;
      const clampedLeft = Math.max(
        margin,
        Math.min(triggerCenterX - bubbleWidth / 2, maxLeft)
      );
      this.tooltipStyle = {
        left: `${clampedLeft}px`,
        top: `${rect.top - 10}px`,
        transform: 'translateY(-100%)',
      };
      // Keep the arrow pointing at the trigger, clamped within the bubble.
      const bubble = this.el.nativeElement.querySelector(
        '.tooltip-bubble'
      ) as HTMLElement | null;
      if (bubble) {
        const arrowLeft = Math.max(
          14,
          Math.min(triggerCenterX - clampedLeft, bubbleWidth - 14)
        );
        bubble.style.setProperty('--tip-arrow-left', `${arrowLeft}px`);
      }
    }
    this.showTimer = setTimeout(() => (this.visible = true), 150);
  }

  onMouseLeave(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
    this.visible = false;
  }
}
