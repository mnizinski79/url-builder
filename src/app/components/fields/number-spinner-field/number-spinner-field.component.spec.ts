import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { NumberSpinnerFieldComponent } from './number-spinner-field.component';

describe('NumberSpinnerFieldComponent', () => {
  let component: NumberSpinnerFieldComponent;
  let fixture: ComponentFixture<NumberSpinnerFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberSpinnerFieldComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(NumberSpinnerFieldComponent);
    component = fixture.componentInstance;
    component.label = 'Rooms';
    component.min = 1;
    component.max = 9;
    component.control = new FormControl(1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('increments up to max and no further', () => {
    component.control.setValue(8);
    component.increment();
    expect(component.control.value).toBe(9);
    component.increment();
    expect(component.control.value).toBe(9);
  });

  it('decrements down to min and no further', () => {
    component.control.setValue(2);
    component.decrement();
    expect(component.control.value).toBe(1);
    component.decrement();
    expect(component.control.value).toBe(1);
  });

  it('current coerces empty/null to min', () => {
    component.control.setValue(null);
    expect(component.current).toBe(1);
  });

  it('onBlur clamps an over-max value to max', () => {
    component.control.setValue(50);
    component.onBlur();
    expect(component.control.value).toBe(9);
  });

  it('onBlur clamps a below-min value to min', () => {
    component.control.setValue(0);
    component.onBlur();
    expect(component.control.value).toBe(1);
  });

  it('onBlur coerces empty to min', () => {
    component.control.setValue(null);
    component.onBlur();
    expect(component.control.value).toBe(1);
  });

  it('renders an editable number input inside the bed icon box frame', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('input.spinner-input[type="number"]')).not.toBeNull();
    expect(el.querySelector('.spinner-icon-box')).not.toBeNull();
  });

  it('renders increment and decrement buttons', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.spinner-btn').length).toBe(2);
  });
});
