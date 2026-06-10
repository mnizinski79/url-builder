// src/app/components/date-range-picker/date-range-picker.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateRangePickerComponent } from './date-range-picker.component';

describe('DateRangePickerComponent', () => {
  let component: DateRangePickerComponent;
  let fixture: ComponentFixture<DateRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangePickerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DateRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('single-month mode', () => {
    it('renders two month grids and a divider by default', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('app-month-grid').length).toBe(2);
      expect(el.querySelector('.drp-divider')).not.toBeNull();
    });

    it('renders exactly one month grid and no divider when singleMonth is true', () => {
      component.singleMonth = true;
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('app-month-grid').length).toBe(1);
      expect(el.querySelector('.drp-divider')).toBeNull();
    });

    it('the single month grid shows both prev and next nav buttons', () => {
      component.singleMonth = true;
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const navBtns = el.querySelectorAll('app-month-grid .drp-nav-btn');
      expect(navBtns.length).toBe(2);
    });

    it('goNext/goPrev still advance the visible month in single-month mode', () => {
      component.singleMonth = true;
      component.leftYear = 2026;
      component.leftMonth = 5;
      component.goNext();
      expect(component.leftMonth).toBe(6);
      component.goPrev();
      expect(component.leftMonth).toBe(5);
    });
  });

  describe('state machine', () => {
    it('should be idle on init', () => {
      expect(component.phase).toBe('idle');
    });

    it('IDLE → AWAITING_END on first click', () => {
      component.onDayClick(new Date(2026, 5, 9));
      expect(component.phase).toBe('awaiting-end');
      expect(component.pendingStart?.getDate()).toBe(9);
      expect(component.pendingEnd).toBeNull();
    });

    it('AWAITING_END → CONFIRMED when clicking a date after start', () => {
      component.onDayClick(new Date(2026, 5, 9));
      component.onDayClick(new Date(2026, 5, 15));
      expect(component.phase).toBe('confirmed');
      expect(component.pendingEnd?.getDate()).toBe(15);
    });

    it('AWAITING_END restarts when clicking same day as start', () => {
      component.onDayClick(new Date(2026, 5, 9));
      component.onDayClick(new Date(2026, 5, 9));
      expect(component.phase).toBe('awaiting-end');
      expect(component.pendingEnd).toBeNull();
    });

    it('AWAITING_END restarts when clicking a date before start', () => {
      component.onDayClick(new Date(2026, 5, 9));
      component.onDayClick(new Date(2026, 5, 5));
      expect(component.phase).toBe('awaiting-end');
      expect(component.pendingStart?.getDate()).toBe(5);
      expect(component.pendingEnd).toBeNull();
    });

    it('CONFIRMED → AWAITING_END (restart) when clicking a day', () => {
      component.onDayClick(new Date(2026, 5, 9));
      component.onDayClick(new Date(2026, 5, 15));
      component.onDayClick(new Date(2026, 5, 20));
      expect(component.phase).toBe('awaiting-end');
      expect(component.pendingStart?.getDate()).toBe(20);
    });
  });

  describe('month navigation', () => {
    it('should advance to next month', () => {
      component.leftYear = 2026;
      component.leftMonth = 5;
      component.goNext();
      expect(component.leftMonth).toBe(6);
      expect(component.leftYear).toBe(2026);
    });

    it('should wrap Dec → Jan and increment year', () => {
      component.leftYear = 2026;
      component.leftMonth = 11;
      component.goNext();
      expect(component.leftMonth).toBe(0);
      expect(component.leftYear).toBe(2027);
    });

    it('should go to previous month', () => {
      component.leftYear = 2026;
      component.leftMonth = 6;
      component.goPrev();
      expect(component.leftMonth).toBe(5);
      expect(component.leftYear).toBe(2026);
    });

    it('should wrap Jan → Dec and decrement year', () => {
      component.leftYear = 2026;
      component.leftMonth = 0;
      component.goPrev();
      expect(component.leftMonth).toBe(11);
      expect(component.leftYear).toBe(2025);
    });

    it('should compute right month from left', () => {
      component.leftYear = 2026;
      component.leftMonth = 5;
      expect(component.rightMonth).toBe(6);
      expect(component.rightYear).toBe(2026);
    });

    it('should wrap right month year on December', () => {
      component.leftYear = 2026;
      component.leftMonth = 11;
      expect(component.rightMonth).toBe(0);
      expect(component.rightYear).toBe(2027);
    });
  });

  describe('apply / cancel', () => {
    it('should emit apply with start and end when confirmed', () => {
      const spy = spyOn(component.apply, 'emit');
      component.onDayClick(new Date(2026, 5, 9));
      component.onDayClick(new Date(2026, 5, 15));
      component.onApply();
      expect(spy).toHaveBeenCalledWith({
        start: jasmine.objectContaining({}),
        end: jasmine.objectContaining({}),
      });
      const call = spy.calls.first().args[0] as { start: Date; end: Date };
      expect(call.start.getDate()).toBe(9);
      expect(call.end.getDate()).toBe(15);
    });

    it('should not emit apply when not confirmed', () => {
      const spy = spyOn(component.apply, 'emit');
      component.onDayClick(new Date(2026, 5, 9));
      component.onApply();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should emit cancel', () => {
      const spy = spyOn(component.cancel, 'emit');
      component.onCancel();
      expect(spy).toHaveBeenCalled();
    });
  });
});
