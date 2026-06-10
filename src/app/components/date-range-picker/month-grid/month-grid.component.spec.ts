// src/app/components/date-range-picker/month-grid/month-grid.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthGridComponent } from './month-grid.component';

describe('MonthGridComponent', () => {
  let component: MonthGridComponent;
  let fixture: ComponentFixture<MonthGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthGridComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MonthGridComponent);
    component = fixture.componentInstance;
    // June 2026: starts on Monday (index 1) → 1 leading empty cell
    component.year = 2026;
    component.month = 5;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate leading empty cells for the month', () => {
    expect(component.dayCells[0].isEmpty).toBeTrue();
    expect(component.dayCells[1].isEmpty).toBeFalse();
    expect(component.dayCells[1].date.getDate()).toBe(1);
  });

  it('should classify the start date cell', () => {
    component.startDate = new Date(2026, 5, 9);
    component.ngOnChanges();
    const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 9)!;
    expect(cell.isStart).toBeTrue();
    expect(cell.isInRange).toBeFalse();
    expect(cell.isHoverRange).toBeFalse();
  });

  it('should classify in-range cells when confirmed', () => {
    component.startDate = new Date(2026, 5, 9);
    component.endDate = new Date(2026, 5, 15);
    component.confirmed = true;
    component.ngOnChanges();
    [10, 11, 12, 13, 14].forEach(d => {
      const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === d)!;
      expect(cell.isInRange).withContext(`day ${d}`).toBeTrue();
    });
    expect(component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 9)!.isInRange).toBeFalse();
    expect(component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 15)!.isInRange).toBeFalse();
  });

  it('should classify hover-range cells when not confirmed', () => {
    component.startDate = new Date(2026, 5, 9);
    component.hoverDate = new Date(2026, 5, 15);
    component.confirmed = false;
    component.ngOnChanges();
    const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 12)!;
    expect(cell.isHoverRange).toBeTrue();
    expect(cell.isInRange).toBeFalse();
  });

  it('should classify the hover-end cell', () => {
    component.startDate = new Date(2026, 5, 9);
    component.hoverDate = new Date(2026, 5, 18);
    component.confirmed = false;
    component.ngOnChanges();
    const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 18)!;
    expect(cell.isHoverEnd).toBeTrue();
  });

  it('should not mark the start cell as hover-end when hovering it', () => {
    component.startDate = new Date(2026, 5, 9);
    component.hoverDate = new Date(2026, 5, 9);
    component.confirmed = false;
    component.ngOnChanges();
    const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 9)!;
    expect(cell.isStart).toBeTrue();
    expect(cell.isHoverEnd)
      .withContext('start cell must keep its start styling while hovered')
      .toBeFalse();
  });

  it('should compute nightsCount correctly', () => {
    component.startDate = new Date(2026, 5, 9);
    component.hoverDate = new Date(2026, 5, 18);
    component.confirmed = false;
    component.ngOnChanges();
    expect(component.nightsCount).toBe(9);
  });

  it('should set nightsCount to null when confirmed', () => {
    component.startDate = new Date(2026, 5, 9);
    component.endDate = new Date(2026, 5, 18);
    component.hoverDate = new Date(2026, 5, 18);
    component.confirmed = true;
    component.ngOnChanges();
    expect(component.nightsCount).toBeNull();
  });

  it('should set isConfirmedStart when confirmed and isStart', () => {
    component.startDate = new Date(2026, 5, 9);
    component.endDate = new Date(2026, 5, 15);
    component.confirmed = true;
    component.ngOnChanges();
    const cell = component.dayCells.find(c => !c.isEmpty && c.date.getDate() === 9)!;
    expect(cell.isConfirmedStart).toBeTrue();
  });
});
