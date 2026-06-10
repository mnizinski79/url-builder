import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from '../../app.component';

/**
 * Full-app integration tests for the date range picker.
 * Mounts AppComponent so real event bubbling, the document:click
 * dismiss listener, and component interplay all run as in production.
 */
describe('Date range picker integration (full app)', () => {
  let fixture: ComponentFixture<AppComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    // This suite validates the desktop two-month picker flow. Force desktop
    // mode so it is independent of the Karma browser window width (which is
    // ~756px and would otherwise trigger the mobile single-month sheet).
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    // Switch to the Search tab where the date range field lives
    (fixture.componentInstance as { onTabChange(tab: string): void }).onTabChange('search');
    fixture.detectChanges();

    // Expand the "Itinerary Details" collapsible section via a real click
    const headers = Array.from(el.querySelectorAll('.section-header')) as HTMLElement[];
    const itinerary = headers.find((h) => h.textContent?.includes('Itinerary Details'));
    expect(itinerary).withContext('Itinerary Details section header should exist').toBeDefined();
    itinerary!.click();
    fixture.detectChanges();
  });

  function openPicker(): void {
    const trigger = el.querySelector('.drp-trigger') as HTMLElement;
    expect(trigger).withContext('date range trigger should exist').not.toBeNull();
    trigger.scrollIntoView({ block: 'center' });
    trigger.click();
    fixture.detectChanges();
  }

  function dayButtons(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('.drp-day:not(.empty)')) as HTMLButtonElement[];
  }

  it('opens the picker when the trigger is clicked', () => {
    openPicker();
    expect(document.querySelector('.drp-panel'))
      .withContext('picker panel should render after trigger click')
      .not.toBeNull();
  });

  it('hit test: a real mouse click at a day cell position would reach the day button', () => {
    openPicker();
    const days = dayButtons();
    expect(days.length).withContext('day buttons should render').toBeGreaterThan(30);
    // Probe a top-row cell (most likely to be inside the viewport)
    const target = days[2];
    const r = target.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    const describeHit = hit
      ? `${hit.tagName}.${(hit as HTMLElement).className}`
      : `null (point ${cx},${cy} outside viewport ${window.innerWidth}x${window.innerHeight})`;
    expect(hit)
      .withContext(`elementFromPoint should return the day button, got: ${describeHit}`)
      .toBe(target);
  });

  it('keeps the picker open and marks the start date when a day is clicked', () => {
    openPicker();
    const target = dayButtons()[14];
    target.click();
    fixture.detectChanges();

    expect(document.querySelector('.drp-panel'))
      .withContext('picker should remain open after clicking a day')
      .not.toBeNull();
    expect(document.querySelector('.drp-day.start'))
      .withContext('clicked day should carry the start class')
      .not.toBeNull();
  });

  it('reuses day button DOM nodes across hover re-renders (required for real mouse clicks)', () => {
    openPicker();
    dayButtons()[14].click(); // select start -> phase becomes awaiting-end
    fixture.detectChanges();

    const before = dayButtons()[19];
    // A real user hovers before clicking the end date; this updates hoverDate
    before.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    const after = dayButtons()[19];

    // If the grid recreates its buttons on every change detection, a real
    // mousedown/mouseup pair lands on two different nodes and the click
    // event fires on the grid container instead of the button.
    expect(after)
      .withContext('day button must be the same DOM node after a hover-triggered re-render')
      .toBe(before);
  });

  it('shows the hover range preview while awaiting the end date', () => {
    openPicker();
    dayButtons()[10].click(); // start date selected -> awaiting end
    fixture.detectChanges();

    const target = dayButtons()[15];
    target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();

    expect(target.classList.contains('hover-end'))
      .withContext('hovered day should carry the hover-end class')
      .toBeTrue();
    expect(document.querySelectorAll('.drp-day.hover-range').length)
      .withContext('days between start and hovered day should carry hover-range')
      .toBeGreaterThan(0);
    expect(document.querySelector('.nights-tip'))
      .withContext('nights tooltip should render on the hovered day')
      .not.toBeNull();
  });

  it('completes the full select-range-and-apply flow', () => {
    openPicker();
    dayButtons()[14].click();
    fixture.detectChanges();

    // Re-query: the grid re-renders after each click
    dayButtons()[19].click();
    fixture.detectChanges();

    const applyBtn = document.querySelector('.drp-btn-apply') as HTMLButtonElement;
    expect(applyBtn.disabled)
      .withContext('Apply should be enabled once a full range is selected')
      .toBeFalse();

    applyBtn.click();
    fixture.detectChanges();

    expect(document.querySelector('.drp-panel'))
      .withContext('picker should close after Apply')
      .toBeNull();
    expect(el.querySelector('.drp-field-text')!.textContent)
      .withContext('field should display the selected range')
      .toContain('→');
  });
});
