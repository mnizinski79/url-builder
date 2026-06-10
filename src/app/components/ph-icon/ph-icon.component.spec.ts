import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhIconComponent } from './ph-icon.component';

describe('PhIconComponent', () => {
  let component: PhIconComponent;
  let fixture: ComponentFixture<PhIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhIconComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PhIconComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a path for a known icon name', () => {
    component.name = 'list';
    component.ngOnChanges();
    fixture.detectChanges();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.innerHTML).toContain('<path');
    expect(svg.innerHTML).toContain('M224,128');
  });

  it('should render empty for an unknown icon name', () => {
    component.name = 'definitely-not-an-icon';
    component.ngOnChanges();
    fixture.detectChanges();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.innerHTML).not.toContain('<path');
  });
});
