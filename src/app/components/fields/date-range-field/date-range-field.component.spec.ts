import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DateRangeFieldComponent } from './date-range-field.component';

describe('DateRangeFieldComponent', () => {
  let component: DateRangeFieldComponent;
  let fixture: ComponentFixture<DateRangeFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangeFieldComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DateRangeFieldComponent);
    component = fixture.componentInstance;
    component.label = 'Eligible stay dates';
    component.checkInControl = new FormControl('');
    component.checkOutControl = new FormControl('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show placeholder when no dates are set', () => {
    expect(component.displayText).toBe('');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.drp-field-text')?.textContent?.trim()).toContain('Select date range');
  });

  it('should show formatted dates when both controls have values', () => {
    component.checkInControl.setValue('2026-06-09');
    component.checkOutControl.setValue('2026-07-03');
    expect(component.displayText).toContain('Jun 9');
    expect(component.displayText).toContain('Jul 3');
    expect(component.displayText).toContain('→');
  });

  it('parsedStart returns null when control is empty', () => {
    expect(component.parsedStart).toBeNull();
  });

  it('parsedStart returns Date when control has ISO value', () => {
    component.checkInControl.setValue('2026-06-09');
    const d = component.parsedStart;
    expect(d).not.toBeNull();
    expect(d!.getDate()).toBe(9);
    expect(d!.getMonth()).toBe(5);
  });

  it('isOpen is false initially', () => {
    expect(component.isOpen).toBeFalse();
  });

  it('togglePicker opens and closes the picker', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.togglePicker(event);
    expect(component.isOpen).toBeTrue();
    component.togglePicker(event);
    expect(component.isOpen).toBeFalse();
  });

  it('onApply writes ISO strings to both controls and closes picker', () => {
    component.isOpen = true;
    component.onApply({ start: new Date(2026, 5, 9), end: new Date(2026, 6, 3) });
    expect(component.checkInControl.value).toBe('2026-06-09');
    expect(component.checkOutControl.value).toBe('2026-07-03');
    expect(component.isOpen).toBeFalse();
  });

  it('onCancel closes picker without changing controls', () => {
    component.isOpen = true;
    component.onCancel();
    expect(component.isOpen).toBeFalse();
    expect(component.checkInControl.value).toBe('');
  });
});
