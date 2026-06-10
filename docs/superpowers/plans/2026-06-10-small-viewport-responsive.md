# Small-Viewport Responsive Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt the URL Builder layout for small viewports (`≤768px`): collapse the header nav into a hamburger that opens a bottom sheet, center the tabs, stack the action buttons full-width, and convert the Saved/History drawer from a right panel to a bottom sheet — leaving desktop unchanged.

**Architecture:** Pure CSS media queries at a single `max-width: 768px` boundary, plus a small amount of state and markup added to the existing `HeaderComponent` (no new component). One new icon path is added to `PhIconComponent`. All overlays on small viewports rise from the bottom for a consistent interaction model.

**Tech Stack:** Angular 17.3 standalone components · Karma/Jasmine · component-scoped CSS with design tokens from `src/styles.css`

**Spec:** `docs/superpowers/specs/2026-06-10-small-viewport-responsive-design.md`

**Commands (run from `/Users/nizinsmi/Desktop/Dev Projects/URL Builder/url-builder`):**
- Scoped test: `npx ng test --include="**/<file>.spec.ts" --watch=false --browsers=ChromeHeadless`
- Full test: `npx ng test --watch=false --browsers=ChromeHeadless`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/app/components/ph-icon/ph-icon.component.ts` | Add `list` glyph to the `PATHS` map |
| Create | `src/app/components/ph-icon/ph-icon.component.spec.ts` | Verify `list` path renders |
| Modify | `src/app/components/header/header.component.ts` | `menuOpen` state, toggle/close, close-then-emit handlers, import `PhIconComponent` |
| Modify | `src/app/components/header/header.component.html` | Hamburger button + bottom-sheet menu markup |
| Modify | `src/app/components/header/header.component.css` | Hide nav / show hamburger / restore title / sheet styles at `≤768px` |
| Create | `src/app/components/header/header.component.spec.ts` | `menuOpen` behavior + item actions |
| Modify | `src/app/components/tab-bar/tab-bar.component.css` | Center tabs at `≤768px` |
| Modify | `src/app/app.component.css` | Stack action buttons full-width at `≤768px` |
| Modify | `src/app/components/drawer/drawer.component.css` | Bottom-sheet layout at `≤768px` |
| Modify | `src/app/components/url-bar/url-bar.component.css` | 16px margins + popover width fit at `≤768px` |

---

## Task 1 — Add `list` icon to PhIconComponent

**Files:**
- Modify: `src/app/components/ph-icon/ph-icon.component.ts`
- Test: `src/app/components/ph-icon/ph-icon.component.spec.ts` (create)

- [ ] **Step 1 — Write the failing test**

```typescript
// src/app/components/ph-icon/ph-icon.component.spec.ts
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
```

- [ ] **Step 2 — Run the test, confirm the `list` test fails**

Run: `npx ng test --include="**/ph-icon.component.spec.ts" --watch=false --browsers=ChromeHeadless`
Expected: the "renders a path for a known icon name" test FAILS (no `M224,128` because `list` is not in `PATHS`); the other two pass.

- [ ] **Step 3 — Add the `list` path to the `PATHS` map**

In `src/app/components/ph-icon/ph-icon.component.ts`, add this entry to the `PATHS` object (e.g. immediately after the `'export'` entry, before the closing `};`). The path is the regular-weight `list` glyph extracted from the installed `@phosphor-icons/core` package:

```typescript
  'list': 'M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z',
```

(Remember to add a trailing comma to the previous `'export': '...'` line if it does not already have one.)

- [ ] **Step 4 — Run the test, confirm all pass**

Run: `npx ng test --include="**/ph-icon.component.spec.ts" --watch=false --browsers=ChromeHeadless`
Expected: 3 specs, 0 failures.

- [ ] **Step 5 — Commit**

```bash
git add src/app/components/ph-icon/
git commit -m "feat: add list icon to PhIconComponent for mobile hamburger"
```

---

## Task 2 — HeaderComponent menu state + markup

**Files:**
- Modify: `src/app/components/header/header.component.ts`
- Modify: `src/app/components/header/header.component.html`
- Test: `src/app/components/header/header.component.spec.ts` (create)

- [ ] **Step 1 — Write the failing test**

```typescript
// src/app/components/header/header.component.spec.ts
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
```

- [ ] **Step 2 — Run the test, confirm it fails**

Run: `npx ng test --include="**/header.component.spec.ts" --watch=false --browsers=ChromeHeadless`
Expected: failures — `menuOpen`, `toggleMenu`, `onSaved`, `.header-hamburger`, `.menu-sheet-item` do not exist yet.

- [ ] **Step 3 — Replace `header.component.ts`**

```typescript
// src/app/components/header/header.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhIconComponent } from '../ph-icon/ph-icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, PhIconComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Output() openSaved = new EventEmitter<void>();
  @Output() openHistory = new EventEmitter<void>();

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onSaved(): void {
    this.menuOpen = false;
    this.openSaved.emit();
  }

  onHistory(): void {
    this.menuOpen = false;
    this.openHistory.emit();
  }
}
```

- [ ] **Step 4 — Replace `header.component.html`**

```html
<!-- src/app/components/header/header.component.html -->
<header class="header">
  <div class="header-left">
    <div class="logo-area">
      <img src="assets/ihg-logo.svg" alt="IHG Hotels &amp; Resorts" class="ihg-logo" />
      <div class="header-divider"></div>
      <span class="app-title">URL Builder</span>
    </div>
  </div>

  <nav class="header-nav">
    <button type="button" class="nav-btn" (click)="openSaved.emit()">Saved</button>
    <button type="button" class="nav-btn" (click)="openHistory.emit()">History</button>
    <button type="button" class="nav-btn">Field Guide</button>
    <button type="button" class="nav-btn">Templates</button>
  </nav>

  <button
    type="button"
    class="header-hamburger"
    (click)="toggleMenu()"
    aria-label="Open menu"
    [attr.aria-expanded]="menuOpen"
  >
    <ph-icon name="list" [size]="24"></ph-icon>
  </button>
</header>

<div class="menu-sheet-backdrop" *ngIf="menuOpen" (click)="closeMenu()">
  <div class="menu-sheet" (click)="$event.stopPropagation()" role="dialog" aria-label="Menu">
    <div class="menu-sheet-handle"></div>
    <button type="button" class="menu-sheet-item" (click)="onSaved()">Saved</button>
    <button type="button" class="menu-sheet-item" (click)="onHistory()">History</button>
    <button type="button" class="menu-sheet-item" (click)="closeMenu()">Field Guide</button>
    <button type="button" class="menu-sheet-item" (click)="closeMenu()">Templates</button>
  </div>
</div>
```

- [ ] **Step 5 — Run the test, confirm all pass**

Run: `npx ng test --include="**/header.component.spec.ts" --watch=false --browsers=ChromeHeadless`
Expected: 10 specs, 0 failures.

Note: the hamburger and sheet are visually hidden on desktop via CSS added in Task 3, but they exist in the DOM (the `.header-hamburger` button always renders; the sheet renders only when `menuOpen`). The tests above assert DOM presence/behavior, independent of the media-query styling.

- [ ] **Step 6 — Commit**

```bash
git add src/app/components/header/header.component.ts src/app/components/header/header.component.html src/app/components/header/header.component.spec.ts
git commit -m "feat: add hamburger menu state and bottom-sheet markup to header"
```

---

## Task 3 — Header CSS: hamburger + bottom sheet at ≤768px

**Files:**
- Modify: `src/app/components/header/header.component.css`

This task is CSS-only (no unit test — verified visually in Task 7). The current `@media (max-width: 768px)` block hides the title and shrinks the nav buttons; it is replaced so the title shows, the nav row hides, and the hamburger + sheet appear.

- [ ] **Step 1 — Add desktop-default rules to hide the mobile-only elements**

Append these rules to `src/app/components/header/header.component.css` **before** the existing `@media` block (so they are the desktop defaults):

```css
/* Mobile-only elements — hidden on desktop, revealed at ≤768px */
.header-hamburger {
  display: none;
  background: none;
  border: none;
  color: var(--color-text-on-dark);
  cursor: pointer;
  padding: 4px;
  line-height: 0;
}

.menu-sheet-backdrop {
  display: none;
}

.menu-sheet-handle {
  width: 36px;
  height: 4px;
  background: #d0d0d0;
  border-radius: 2px;
  margin: 4px auto 8px;
}

.menu-sheet-item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 500;
  font-family: var(--font-stack);
  color: var(--color-text-primary);
  cursor: pointer;
}

.menu-sheet-item:last-child { border-bottom: none; }
.menu-sheet-item:hover { background: var(--color-bg-section-expanded); }

@keyframes sheetUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

- [ ] **Step 2 — Replace the existing `@media (max-width: 768px)` block**

Replace the current media block (lines that set `.header { padding: 0 16px; }`, `.app-title { display: none; }`, `.nav-btn { ... }`) with:

```css
@media (max-width: 768px) {
  .header { padding: 0 16px; }

  /* Title stays visible on mobile (matches mockup) */
  .app-title { display: block; }

  /* Collapse the inline nav, reveal the hamburger */
  .header-nav { display: none; }
  .header-hamburger { display: inline-flex; align-items: center; justify-content: center; }

  /* Bottom-sheet menu */
  .menu-sheet-backdrop {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 400;
  }

  .menu-sheet {
    width: 100%;
    background: var(--color-bg-card);
    border-radius: 16px 16px 0 0;
    padding: 8px 0 16px;
    animation: sheetUp 200ms ease;
  }
}
```

- [ ] **Step 3 — Build to confirm no CSS/compile errors**

Run: `npx ng build --configuration=development`
Expected: build succeeds (`Application bundle generation complete`).

- [ ] **Step 4 — Commit**

```bash
git add src/app/components/header/header.component.css
git commit -m "feat: collapse header to hamburger + bottom sheet at <=768px"
```

---

## Task 4 — Tab bar: center at ≤768px

**Files:**
- Modify: `src/app/components/tab-bar/tab-bar.component.css`

- [ ] **Step 1 — Replace the existing `@media (max-width: 768px)` block**

Replace the current block:

```css
@media (max-width: 768px) {
  .tab-bar-wrapper { padding: 0 16px; overflow-x: auto; }
  .tab-bar { flex-wrap: nowrap; }
}
```

with:

```css
@media (max-width: 768px) {
  .tab-bar-wrapper { padding: 0 16px; overflow-x: auto; }
  .tab-bar {
    flex-wrap: nowrap;
    justify-content: center;
    padding: 0;
  }
}
```

This centers the tabs (`justify-content: center`) and drops the desktop `padding: 0 32px` so the wrapper's 16px padding is the only inset. `overflow-x: auto` on the wrapper remains as a fallback for devices too narrow to fit all four tabs.

- [ ] **Step 2 — Build to confirm no errors**

Run: `npx ng build --configuration=development`
Expected: build succeeds.

- [ ] **Step 3 — Commit**

```bash
git add src/app/components/tab-bar/tab-bar.component.css
git commit -m "feat: center tab bar on small viewports"
```

---

## Task 5 — Action buttons: stack full-width at ≤768px

**Files:**
- Modify: `src/app/app.component.css`

- [ ] **Step 1 — Replace the existing `@media (max-width: 768px)` block**

Replace the current block:

```css
@media (max-width: 768px) {
  .save-action-bar { padding: 12px 16px 24px; }
}
```

with:

```css
@media (max-width: 768px) {
  .save-action-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px 24px;
  }
  .btn-save-url,
  .btn-clear-form {
    width: 100%;
    height: 48px;
    justify-content: center;
  }
}
```

The buttons keep their existing labels and colors; only layout changes (full-width, stacked, 48px tall, centered content). Save URL stays on top, Clear Form below, matching DOM order.

- [ ] **Step 2 — Build to confirm no errors**

Run: `npx ng build --configuration=development`
Expected: build succeeds.

- [ ] **Step 3 — Commit**

```bash
git add src/app/app.component.css
git commit -m "feat: stack action buttons full-width on small viewports"
```

---

## Task 6 — Drawer: bottom sheet at ≤768px

**Files:**
- Modify: `src/app/components/drawer/drawer.component.css`

The drawer's DOM and behavior are unchanged; only the container's positioning/size/animation changes at `≤768px`, plus a grab-handle. The DOM has no handle element, so the handle is drawn with a `::before` pseudo-element on `.drawer` (only visible at this breakpoint).

- [ ] **Step 1 — Append a media block to `drawer.component.css`**

Add at the end of `src/app/components/drawer/drawer.component.css`:

```css
@media (max-width: 768px) {
  .drawer-overlay {
    justify-content: stretch;
    align-items: flex-end;
  }

  .drawer {
    width: 100%;
    height: auto;
    max-height: 85vh;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
    animation: slideUp 200ms ease;
    padding-top: 8px;
  }

  /* Grab-handle, consistent with the header menu sheet */
  .drawer::before {
    content: '';
    display: block;
    width: 36px;
    height: 4px;
    background: #d0d0d0;
    border-radius: 2px;
    margin: 0 auto 4px;
    flex-shrink: 0;
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

Notes:
- `.drawer-overlay` currently uses `justify-content: flex-end` (right-anchored). Overriding to `align-items: flex-end` anchors the panel to the bottom; `justify-content: stretch` makes it span full width.
- `.drawer` is `display: flex; flex-direction: column`, so the `::before` handle sits above the header, and `.drawer-content { overflow-y: auto }` continues to scroll a long list inside the capped-height sheet.

- [ ] **Step 2 — Build to confirm no errors**

Run: `npx ng build --configuration=development`
Expected: build succeeds.

- [ ] **Step 3 — Commit**

```bash
git add src/app/components/drawer/drawer.component.css
git commit -m "feat: render Saved/History drawer as bottom sheet on small viewports"
```

---

## Task 7 — URL bar: align margins + fit popover at ≤768px

**Files:**
- Modify: `src/app/components/url-bar/url-bar.component.css`

The URL bar has no mobile rules today: its `:host` padding is `20px 32px` (32px sides — inconsistent with the 16px margins used elsewhere), and the `.popover` is a fixed `width: 420px` that overflows narrow screens.

- [ ] **Step 1 — Append a media block to `url-bar.component.css`**

Add at the end of `src/app/components/url-bar/url-bar.component.css`:

```css
@media (max-width: 768px) {
  :host { padding: 16px; }
  .popover {
    width: calc(100vw - 32px);
    max-width: 420px;
  }
}
```

This brings the URL bar's horizontal inset to 16px (matching the form, action bar, tabs, and header) and constrains the "full URL" popover so it never exceeds the viewport, while keeping its desktop width.

- [ ] **Step 2 — Build to confirm no errors**

Run: `npx ng build --configuration=development`
Expected: build succeeds.

- [ ] **Step 3 — Commit**

```bash
git add src/app/components/url-bar/url-bar.component.css
git commit -m "feat: align URL bar margins and fit popover on small viewports"
```

---

## Task 8 — Full verification

**Files:** none (verification only)

- [ ] **Step 1 — Run the full test suite**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: all specs pass (including the new `ph-icon` and `header` specs and all pre-existing specs).

- [ ] **Step 2 — Start the dev server (preview MCP is sandboxed out of `~/Desktop`; use Bash)**

Run in background:
```bash
node_modules/.bin/ng serve --configuration=development --port=4200 > /tmp/ng-serve.log 2>&1
```
Then poll until serving:
```bash
for i in $(seq 1 40); do c=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200/); [ "$c" = "200" ] && echo "UP" && break; sleep 2; done
```
Expected: `UP`.

- [ ] **Step 3 — Visual verification at a 375px viewport**

Use `scripts/repro-hover.mjs` as a template (puppeteer-core) or a similar headless script to load `http://localhost:4200/` at `viewport: { width: 375, height: 812 }` and screenshot. Confirm against the spec:
1. Header shows logo + "URL Builder" title + a hamburger icon (no inline nav buttons).
2. Clicking the hamburger raises a bottom sheet with four rows: Saved, History, Field Guide, Templates.
3. Tapping the backdrop or any row closes the sheet; tapping Saved/History opens the drawer.
4. Tabs are centered.
5. Save URL / Clear Form are stacked, full-width, 48px tall.
6. Opening Saved/History shows the drawer as a bottom sheet (rounded top, grab-handle, slides up) with internal scroll.
7. The URL bar sits with 16px side margins (flush with the cards below); the "..." popover fits within the screen width.

- [ ] **Step 4 — Confirm desktop is unchanged**

Reload at `viewport: { width: 1280, height: 800 }`. Confirm the header shows all four inline nav buttons (no hamburger), tabs are left-aligned, action buttons are right-aligned in a row, and the drawer slides in from the right.

- [ ] **Step 5 — Final summary commit (if any verification tweaks were needed)**

If Steps 3–4 surfaced fixes, make them, re-run the relevant scoped test/build, and commit with a descriptive message. Otherwise this task adds no commit.

---

## Notes for the implementer

- **Breakpoint:** every change is gated at `max-width: 768px`. Do not introduce other breakpoints.
- **Design tokens:** use the existing CSS custom properties (`--color-text-on-dark`, `--color-bg-card`, `--color-border`, `--color-text-primary`, `--color-bg-section-expanded`, `--font-stack`, `--radius-button`) — all defined in `src/styles.css`. Do not hardcode equivalents.
- **No new components, no new npm dependencies.**
- **Real-click caveat (project memory):** when verifying clicks, prefer real-pointer checks over synthetic `.click()` — past date-picker work hid a DOM-churn bug because synthetic clicks bypass the press/release-on-same-node requirement. The menu/sheet here use static markup (no `*ngFor` over fresh-array getters), so this is low-risk, but keep it in mind during Step 3.
