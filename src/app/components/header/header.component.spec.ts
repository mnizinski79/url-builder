import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('menuOpen is false initially', () => {
    expect(component.menuOpen).toBeFalse();
  });

  it('toggleMenu flips menuOpen', () => {
    component.toggleMenu();
    expect(component.menuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.menuOpen).toBeFalse();
  });

  it('closeMenu sets menuOpen false', () => {
    component.menuOpen = true;
    component.closeMenu();
    expect(component.menuOpen).toBeFalse();
  });

  it('onSaved emits openSaved and closes the menu', () => {
    const spy = spyOn(component.openSaved, 'emit');
    component.menuOpen = true;
    component.onSaved();
    expect(spy).toHaveBeenCalled();
    expect(component.menuOpen).toBeFalse();
  });

  it('onHistory emits openHistory and closes the menu', () => {
    const spy = spyOn(component.openHistory, 'emit');
    component.menuOpen = true;
    component.onHistory();
    expect(spy).toHaveBeenCalled();
    expect(component.menuOpen).toBeFalse();
  });

  it('renders the hamburger button', () => {
    const btn = (fixture.nativeElement as HTMLElement).querySelector('.header-hamburger');
    expect(btn).not.toBeNull();
  });

  it('does not render the menu sheet when closed', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.menu-sheet')).toBeNull();
  });

  it('renders four menu items when open', () => {
    component.menuOpen = true;
    fixture.detectChanges();
    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('.menu-sheet-item');
    expect(items.length).toBe(4);
  });

  it('clicking the Saved menu item emits openSaved and closes', () => {
    const spy = spyOn(component.openSaved, 'emit');
    component.menuOpen = true;
    fixture.detectChanges();
    const items = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.menu-sheet-item');
    items[0].click(); // Saved
    expect(spy).toHaveBeenCalled();
    expect(component.menuOpen).toBeFalse();
  });
});
