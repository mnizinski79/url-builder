# URL Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive Angular 17+ URL Builder app where IHG users fill out a structured form to live-generate and copy deep-link URLs, with named save/history via localStorage.

**Architecture:** Standalone Angular 17+ components with Reactive Forms. A `FormStateService` holds per-tab form groups so values survive tab switching. `UrlBuilderService` computes the URL string reactively from form values. `StorageService` handles all localStorage reads/writes.

**Tech Stack:** Angular 17+ (standalone), Angular Reactive Forms, CSS custom properties, localStorage, Karma/Jasmine for tests.

---

## File Structure

```
/Users/nizinsmi/Desktop/Dev Projects/URL Builder/
├── src/
│   ├── styles.css                              # Global design tokens + resets
│   ├── main.ts                                 # Bootstrap AppComponent
│   └── app/
│       ├── app.component.ts                    # Root shell
│       ├── app.component.html
│       ├── app.component.css
│       ├── models/
│       │   └── url-builder.models.ts           # All shared interfaces/types
│       ├── services/
│       │   ├── storage.service.ts              # localStorage CRUD
│       │   ├── storage.service.spec.ts
│       │   ├── url-builder.service.ts          # URL computation
│       │   ├── url-builder.service.spec.ts
│       │   ├── form-state.service.ts           # Per-tab form groups
│       │   └── form-state.service.spec.ts
│       └── components/
│           ├── tooltip/
│           │   ├── tooltip.component.ts
│           │   ├── tooltip.component.html
│           │   └── tooltip.component.css
│           ├── fields/
│           │   ├── text-field/
│           │   │   ├── text-field.component.ts
│           │   │   ├── text-field.component.html
│           │   │   └── text-field.component.css
│           │   ├── select-field/
│           │   │   ├── select-field.component.ts
│           │   │   ├── select-field.component.html
│           │   │   └── select-field.component.css
│           │   ├── toggle-field/
│           │   │   ├── toggle-field.component.ts
│           │   │   ├── toggle-field.component.html
│           │   │   └── toggle-field.component.css
│           │   ├── date-range-field/
│           │   │   ├── date-range-field.component.ts
│           │   │   ├── date-range-field.component.html
│           │   │   └── date-range-field.component.css
│           │   └── number-spinner-field/
│           │       ├── number-spinner-field.component.ts
│           │       ├── number-spinner-field.component.html
│           │       └── number-spinner-field.component.css
│           ├── collapsible-section/
│           │   ├── collapsible-section.component.ts
│           │   ├── collapsible-section.component.html
│           │   └── collapsible-section.component.css
│           ├── header/
│           │   ├── header.component.ts
│           │   ├── header.component.html
│           │   └── header.component.css
│           ├── url-bar/
│           │   ├── url-bar.component.ts
│           │   ├── url-bar.component.html
│           │   └── url-bar.component.css
│           ├── tab-bar/
│           │   ├── tab-bar.component.ts
│           │   ├── tab-bar.component.html
│           │   └── tab-bar.component.css
│           ├── form-container/
│           │   ├── form-container.component.ts
│           │   ├── form-container.component.html
│           │   └── form-container.component.css
│           ├── save-modal/
│           │   ├── save-modal.component.ts
│           │   ├── save-modal.component.html
│           │   └── save-modal.component.css
│           ├── saved-url-card/
│           │   ├── saved-url-card.component.ts
│           │   ├── saved-url-card.component.html
│           │   └── saved-url-card.component.css
│           └── drawer/
│               ├── drawer.component.ts
│               ├── drawer.component.html
│               └── drawer.component.css
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Task 1: Scaffold Angular Project

**Files:**
- Create: all Angular scaffolding files

- [ ] **Step 1: Navigate to parent directory and scaffold**

```bash
cd "/Users/nizinsmi/Desktop/Dev Projects"
npx @angular/cli@17 new url-builder --standalone --routing=false --style=css --skip-git --skip-tests=false
```

Expected output: Angular project created in `url-builder/` folder.

- [ ] **Step 2: Verify it builds**

```bash
cd "/Users/nizinsmi/Desktop/Dev Projects/url-builder"
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Move existing docs into the new project**

```bash
cp -r "/Users/nizinsmi/Desktop/Dev Projects/URL Builder/docs" "/Users/nizinsmi/Desktop/Dev Projects/url-builder/docs"
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm start
```

Expected: App serves at `http://localhost:4200` with default Angular welcome page.

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Angular 17 standalone project"
```

---

## Task 2: Design Tokens & Global Styles

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Replace src/styles.css with design tokens and global resets**

```css
/* src/styles.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-navy: #1B2A4A;
  --color-red: #C41230;
  --color-bg-page: #EFEFEF;
  --color-bg-card: #FFFFFF;
  --color-bg-section-expanded: #F5F5F5;
  --color-border: #D0D0D0;
  --color-border-focus: #1B2A4A;
  --color-border-error: #C41230;
  --color-text-primary: #333333;
  --color-text-muted: #6B7280;
  --color-text-placeholder: #9CA3AF;
  --color-text-on-dark: #FFFFFF;
  --color-text-on-dark-muted: rgba(255,255,255,0.65);
  --color-toggle-on: #C41230;
  --color-toggle-off: #CCCCCC;
  --radius-card: 8px;
  --radius-field: 4px;
  --field-height: 41px;
  --font-stack: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08);
  --transition-base: 200ms ease;
}

html, body {
  height: 100%;
  font-family: var(--font-stack);
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-page);
  -webkit-font-smoothing: antialiased;
}

button {
  font-family: var(--font-stack);
  cursor: pointer;
  border: none;
  background: none;
}

input, select {
  font-family: var(--font-stack);
  font-size: 14px;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles.css
git commit -m "feat: add design tokens and global styles"
```

---

## Task 3: Data Models

**Files:**
- Create: `src/app/models/url-builder.models.ts`

- [ ] **Step 1: Create models file**

```typescript
// src/app/models/url-builder.models.ts

export type TabKey = 'home' | 'search';

export interface SavedUrl {
  id: string;
  name: string;
  url: string;
  tab: TabKey;
  timestamp: string; // ISO string
  isNamed: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  groupLabel: string;
  options: SelectOption[];
}

export interface HomeFormValues {
  brandCode: string;
  language: string;        // composite key e.g. 'us-en'
  pmid: string;
  glat: string;
  rateCode: string;
  domainPersistence: boolean;
  chinaDomain: boolean;
}

export interface SearchFormValues extends HomeFormValues {
  qDest: string;
  qCity: string;
  qCtry: string;
  qChkIn: string;
  qChkOut: string;
  qRms: number;
  qRateCode: string;
  corpNum: string;
  promoCode: string;
  qSort: string;
  qRating: string;
  utmCampaign: string;
  utmSource: string;
  utmMedium: string;
  deepLink: string;
  channel: string;
}

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'us-en', label: 'US English' },
  { value: 'gb-en', label: 'UK English' },
  { value: 'de-de', label: 'German' },
  { value: 'fr-fr', label: 'French' },
  { value: 'es-es', label: 'Spanish' },
  { value: 'cn-zh', label: 'Chinese (Simplified)' },
  { value: 'jp-ja', label: 'Japanese' },
];

export const LANGUAGE_MAP: Record<string, { regionCode: string; localeCode: string }> = {
  'us-en': { regionCode: 'us', localeCode: 'en' },
  'gb-en': { regionCode: 'gb', localeCode: 'en' },
  'de-de': { regionCode: 'de', localeCode: 'de' },
  'fr-fr': { regionCode: 'fr', localeCode: 'fr' },
  'es-es': { regionCode: 'es', localeCode: 'es' },
  'cn-zh': { regionCode: 'cn', localeCode: 'zh' },
  'jp-ja': { regionCode: 'jp', localeCode: 'ja' },
};

export const BRAND_GROUPS: SelectGroup[] = [
  {
    groupLabel: 'Master Brand',
    options: [{ value: '6c', label: 'IHG (All Brands)' }],
  },
  {
    groupLabel: 'Luxury & Lifestyle',
    options: [
      { value: 'sx', label: 'Six Senses' },
      { value: 'rg', label: 'Regent' },
      { value: 'ic', label: 'InterContinental' },
      { value: 'vn', label: 'Vignette Collection' },
      { value: 'ki', label: 'Kimpton' },
      { value: 'in', label: 'Hotel Indigo' },
      { value: 'hl', label: 'HUALUXE' },
    ],
  },
  {
    groupLabel: 'Premium',
    options: [
      { value: 'cp', label: 'Crowne Plaza' },
      { value: 'ev', label: 'EVEN Hotels' },
      { value: 'vc', label: 'voco' },
      { value: 'rb', label: 'Ruby' },
    ],
  },
  {
    groupLabel: 'Essentials',
    options: [
      { value: 'hi', label: 'Holiday Inn' },
      { value: 'ex', label: 'Holiday Inn Express' },
      { value: 'hr', label: 'Holiday Inn Resort' },
      { value: 'hv', label: 'Holiday Inn Club Vacations' },
      { value: 'gn', label: 'Garner' },
      { value: 'av', label: 'avid hotels' },
    ],
  },
  {
    groupLabel: 'Suites',
    options: [
      { value: 'cw', label: 'Candlewood Suites' },
      { value: 'si', label: 'Staybridge Suites' },
      { value: 'as', label: 'Atwell Suites' },
    ],
  },
];

export const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'cn', label: 'China' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
];

export const SPECIAL_RATE_OPTIONS: SelectOption[] = [
  { value: 'aaa', label: 'AAA / CAA' },
  { value: 'senior', label: 'Senior Discount' },
  { value: 'govt', label: 'Government' },
  { value: 'military', label: 'Military' },
  { value: 'corp', label: 'Corporate' },
];

export const SORT_OPTIONS: SelectOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'guest_rating', label: 'Guest Rating' },
];

export const HOTEL_CLASS_OPTIONS: SelectOption[] = [
  { value: '1', label: '1 Star' },
  { value: '2', label: '2 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '5', label: '5 Stars' },
];

export const CHANNEL_OPTIONS: SelectOption[] = [
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push Notification' },
  { value: 'sms', label: 'SMS' },
  { value: 'social', label: 'Social Media' },
  { value: 'display', label: 'Display Ad' },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/app/models/
git commit -m "feat: add shared data models and option constants"
```

---

## Task 4: StorageService

**Files:**
- Create: `src/app/services/storage.service.ts`
- Create: `src/app/services/storage.service.spec.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/app/services/storage.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { SavedUrl } from '../models/url-builder.models';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should return empty arrays when storage is empty', () => {
    expect(service.getSavedUrls()).toEqual([]);
    expect(service.getHistory()).toEqual([]);
  });

  it('should save a URL and retrieve it', () => {
    const url: SavedUrl = {
      id: '1',
      name: 'Test URL',
      url: 'https://www.ihg.com/redirect?path=home',
      tab: 'home',
      timestamp: new Date().toISOString(),
      isNamed: true,
    };
    service.saveUrl(url);
    expect(service.getSavedUrls()).toEqual([url]);
  });

  it('should add to history and cap at 50 entries', () => {
    for (let i = 0; i < 55; i++) {
      service.addToHistory({
        id: String(i),
        name: `Entry ${i}`,
        url: `https://example.com?i=${i}`,
        tab: 'home',
        timestamp: new Date().toISOString(),
        isNamed: false,
      });
    }
    expect(service.getHistory().length).toBe(50);
  });

  it('should delete a saved URL by id', () => {
    const url: SavedUrl = {
      id: 'abc',
      name: 'To delete',
      url: 'https://example.com',
      tab: 'home',
      timestamp: new Date().toISOString(),
      isNamed: true,
    };
    service.saveUrl(url);
    service.deleteSavedUrl('abc');
    expect(service.getSavedUrls()).toEqual([]);
  });

  it('should delete a history entry by id', () => {
    const entry: SavedUrl = {
      id: 'h1',
      name: 'History 1',
      url: 'https://example.com',
      tab: 'search',
      timestamp: new Date().toISOString(),
      isNamed: false,
    };
    service.addToHistory(entry);
    service.deleteHistoryEntry('h1');
    expect(service.getHistory()).toEqual([]);
  });

  it('should generate unique ids', () => {
    const id1 = service.generateId();
    const id2 = service.generateId();
    expect(id1).not.toBe(id2);
  });

  it('should format a timestamp label', () => {
    const iso = '2026-06-09T14:34:00.000Z';
    const label = service.formatTimestampLabel(iso);
    expect(label).toContain('2026');
  });
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npm test -- --include="**/storage.service.spec.ts" --watch=false
```

Expected: FAIL — StorageService not found.

- [ ] **Step 3: Implement StorageService**

```typescript
// src/app/services/storage.service.ts
import { Injectable } from '@angular/core';
import { SavedUrl } from '../models/url-builder.models';

const SAVED_KEY = 'ub_saved_urls';
const HISTORY_KEY = 'ub_history';
const MAX_HISTORY = 50;

@Injectable({ providedIn: 'root' })
export class StorageService {

  getSavedUrls(): SavedUrl[] {
    return this.read(SAVED_KEY);
  }

  getHistory(): SavedUrl[] {
    return this.read(HISTORY_KEY);
  }

  saveUrl(entry: SavedUrl): void {
    const saved = this.getSavedUrls();
    saved.unshift(entry);
    this.write(SAVED_KEY, saved);
  }

  addToHistory(entry: SavedUrl): void {
    const history = this.getHistory();
    history.unshift(entry);
    this.write(HISTORY_KEY, history.slice(0, MAX_HISTORY));
  }

  deleteSavedUrl(id: string): void {
    this.write(SAVED_KEY, this.getSavedUrls().filter(u => u.id !== id));
  }

  deleteHistoryEntry(id: string): void {
    this.write(HISTORY_KEY, this.getHistory().filter(u => u.id !== id));
  }

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  formatTimestampLabel(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  private read(key: string): SavedUrl[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private write(key: string, data: SavedUrl[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --include="**/storage.service.spec.ts" --watch=false
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/services/storage.service.ts src/app/services/storage.service.spec.ts
git commit -m "feat: add StorageService with localStorage persistence"
```

---

## Task 5: UrlBuilderService

**Files:**
- Create: `src/app/services/url-builder.service.ts`
- Create: `src/app/services/url-builder.service.spec.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/app/services/url-builder.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { UrlBuilderService } from './url-builder.service';

describe('UrlBuilderService', () => {
  let service: UrlBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlBuilderService);
  });

  describe('Home tab', () => {
    it('should build minimal home URL with required fields only', () => {
      const url = service.buildUrl('home', {
        brandCode: '6c',
        language: 'us-en',
        pmid: '',
        glat: '',
        rateCode: '',
        domainPersistence: false,
        chinaDomain: false,
      });
      expect(url).toBe('https://www.ihg.com/redirect?path=home&brandCode=6c&regionCode=us&localeCode=en');
    });

    it('should append optional params when filled', () => {
      const url = service.buildUrl('home', {
        brandCode: 'ic',
        language: 'us-en',
        pmid: 'ABCD',
        glat: 'TEST',
        rateCode: '',
        domainPersistence: false,
        chinaDomain: false,
      });
      expect(url).toContain('pmid=ABCD');
      expect(url).toContain('glat=TEST');
      expect(url).not.toContain('rateCode');
    });

    it('should append dp=true when domain persistence is on', () => {
      const url = service.buildUrl('home', {
        brandCode: '6c', language: 'us-en', pmid: '', glat: '',
        rateCode: '', domainPersistence: true, chinaDomain: false,
      });
      expect(url).toContain('dp=true');
    });

    it('should append cn=true when china domain is on', () => {
      const url = service.buildUrl('home', {
        brandCode: '6c', language: 'us-en', pmid: '', glat: '',
        rateCode: '', domainPersistence: false, chinaDomain: true,
      });
      expect(url).toContain('cn=true');
    });
  });

  describe('Search tab', () => {
    const base = {
      brandCode: '6c', language: 'us-en', pmid: '', glat: '',
      rateCode: '', domainPersistence: false, chinaDomain: false,
      qDest: '', qCity: '', qCtry: '', qChkIn: '', qChkOut: '',
      qRms: 1, qRateCode: '', corpNum: '', promoCode: '', qSort: '',
      qRating: '', utmCampaign: '', utmSource: '', utmMedium: '',
      deepLink: '', channel: '',
    };

    it('should use search base URL', () => {
      const url = service.buildUrl('search', base);
      expect(url).toContain('https://www.ihg.com/hotels/us/en/find-hotels/hotel-search');
      expect(url).toContain('path=search');
    });

    it('should append destination when filled', () => {
      const url = service.buildUrl('search', { ...base, qDest: 'London' });
      expect(url).toContain('qDest=London');
    });

    it('should append check-in and check-out dates when filled', () => {
      const url = service.buildUrl('search', {
        ...base, qChkIn: '2026-08-01', qChkOut: '2026-08-05'
      });
      expect(url).toContain('qChkIn=2026-08-01');
      expect(url).toContain('qChkOut=2026-08-05');
    });

    it('should append qRms when value > 1', () => {
      const url = service.buildUrl('search', { ...base, qRms: 2 });
      expect(url).toContain('qRms=2');
    });

    it('should not append qRms when value is 1 (default)', () => {
      const url = service.buildUrl('search', { ...base, qRms: 1 });
      expect(url).not.toContain('qRms');
    });

    it('should append UTM params when filled', () => {
      const url = service.buildUrl('search', {
        ...base, utmCampaign: 'summer', utmSource: 'email', utmMedium: 'cpc'
      });
      expect(url).toContain('utm_campaign=summer');
      expect(url).toContain('utm_source=email');
      expect(url).toContain('utm_medium=cpc');
    });
  });
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npm test -- --include="**/url-builder.service.spec.ts" --watch=false
```

Expected: FAIL — UrlBuilderService not found.

- [ ] **Step 3: Implement UrlBuilderService**

```typescript
// src/app/services/url-builder.service.ts
import { Injectable } from '@angular/core';
import { TabKey, HomeFormValues, SearchFormValues, LANGUAGE_MAP } from '../models/url-builder.models';

const BASE_URLS: Record<TabKey, string> = {
  home: 'https://www.ihg.com/redirect',
  search: 'https://www.ihg.com/hotels/us/en/find-hotels/hotel-search',
};

@Injectable({ providedIn: 'root' })
export class UrlBuilderService {

  buildUrl(tab: TabKey, values: HomeFormValues | SearchFormValues): string {
    const base = BASE_URLS[tab];
    const params = new URLSearchParams();

    params.set('path', tab);

    const { regionCode, localeCode } = LANGUAGE_MAP[values.language] ?? { regionCode: 'us', localeCode: 'en' };
    params.set('brandCode', values.brandCode);
    params.set('regionCode', regionCode);
    params.set('localeCode', localeCode);

    this.appendIfFilled(params, 'pmid', values.pmid);
    this.appendIfFilled(params, 'glat', values.glat);
    this.appendIfFilled(params, 'rateCode', values.rateCode);
    if (values.domainPersistence) params.set('dp', 'true');
    if (values.chinaDomain) params.set('cn', 'true');

    if (tab === 'search') {
      const sv = values as SearchFormValues;
      this.appendIfFilled(params, 'qDest', sv.qDest);
      this.appendIfFilled(params, 'qCity', sv.qCity);
      this.appendIfFilled(params, 'qCtry', sv.qCtry);
      this.appendIfFilled(params, 'qChkIn', sv.qChkIn);
      this.appendIfFilled(params, 'qChkOut', sv.qChkOut);
      if (sv.qRms > 1) params.set('qRms', String(sv.qRms));
      this.appendIfFilled(params, 'qRateCode', sv.qRateCode);
      this.appendIfFilled(params, 'corpNum', sv.corpNum);
      this.appendIfFilled(params, 'promoCode', sv.promoCode);
      this.appendIfFilled(params, 'qSort', sv.qSort);
      this.appendIfFilled(params, 'qRating', sv.qRating);
      this.appendIfFilled(params, 'utm_campaign', sv.utmCampaign);
      this.appendIfFilled(params, 'utm_source', sv.utmSource);
      this.appendIfFilled(params, 'utm_medium', sv.utmMedium);
      this.appendIfFilled(params, 'deepLink', sv.deepLink);
      this.appendIfFilled(params, 'channel', sv.channel);
    }

    return `${base}?${params.toString()}`;
  }

  private appendIfFilled(params: URLSearchParams, key: string, value: string | undefined): void {
    if (value && value.trim().length > 0) {
      params.set(key, value.trim());
    }
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --include="**/url-builder.service.spec.ts" --watch=false
```

Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/services/url-builder.service.ts src/app/services/url-builder.service.spec.ts
git commit -m "feat: add UrlBuilderService with tab-aware URL generation"
```

---

## Task 6: FormStateService

**Files:**
- Create: `src/app/services/form-state.service.ts`
- Create: `src/app/services/form-state.service.spec.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/app/services/form-state.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { FormStateService } from './form-state.service';
import { ReactiveFormsModule } from '@angular/forms';

describe('FormStateService', () => {
  let service: FormStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ReactiveFormsModule] });
    service = TestBed.inject(FormStateService);
  });

  it('should provide a home form group', () => {
    const form = service.getForm('home');
    expect(form).toBeTruthy();
    expect(form.get('brandCode')).toBeTruthy();
  });

  it('should provide a search form group', () => {
    const form = service.getForm('search');
    expect(form).toBeTruthy();
    expect(form.get('qDest')).toBeTruthy();
  });

  it('should preserve home form values when switching to search and back', () => {
    service.getForm('home').patchValue({ pmid: 'ABCD' });
    service.getForm('search').patchValue({ qDest: 'Paris' });
    expect(service.getForm('home').value.pmid).toBe('ABCD');
    expect(service.getForm('search').value.qDest).toBe('Paris');
  });

  it('should reset only the specified tab form', () => {
    service.getForm('home').patchValue({ pmid: 'ABCD' });
    service.resetForm('home');
    expect(service.getForm('home').value.pmid).toBe('');
  });

  it('should return default brandCode of 6c', () => {
    expect(service.getForm('home').value.brandCode).toBe('6c');
  });

  it('should return default language of us-en', () => {
    expect(service.getForm('home').value.language).toBe('us-en');
  });
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npm test -- --include="**/form-state.service.spec.ts" --watch=false
```

Expected: FAIL.

- [ ] **Step 3: Implement FormStateService**

```typescript
// src/app/services/form-state.service.ts
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TabKey } from '../models/url-builder.models';

@Injectable({ providedIn: 'root' })
export class FormStateService {
  private forms: Record<TabKey, FormGroup>;

  constructor(private fb: FormBuilder) {
    this.forms = {
      home: this.buildHomeForm(),
      search: this.buildSearchForm(),
    };
  }

  getForm(tab: TabKey): FormGroup {
    return this.forms[tab];
  }

  resetForm(tab: TabKey): void {
    this.forms[tab].reset(this.getDefaults(tab));
  }

  private getDefaults(tab: TabKey) {
    const shared = { brandCode: '6c', language: 'us-en', pmid: '', glat: '', rateCode: '', domainPersistence: false, chinaDomain: false };
    if (tab === 'home') return shared;
    return {
      ...shared,
      qDest: '', qCity: '', qCtry: '', qChkIn: '', qChkOut: '',
      qRms: 1, qRateCode: '', corpNum: '', promoCode: '', qSort: '',
      qRating: '', utmCampaign: '', utmSource: '', utmMedium: '',
      deepLink: '', channel: '',
    };
  }

  private buildHomeForm(): FormGroup {
    return this.fb.group({
      brandCode: ['6c'],
      language: ['us-en'],
      pmid: [''],
      glat: [''],
      rateCode: [''],
      domainPersistence: [false],
      chinaDomain: [false],
    });
  }

  private buildSearchForm(): FormGroup {
    return this.fb.group({
      brandCode: ['6c'],
      language: ['us-en'],
      pmid: [''],
      glat: [''],
      rateCode: [''],
      domainPersistence: [false],
      chinaDomain: [false],
      qDest: [''],
      qCity: [''],
      qCtry: [''],
      qChkIn: [''],
      qChkOut: [''],
      qRms: [1],
      qRateCode: [''],
      corpNum: [''],
      promoCode: [''],
      qSort: [''],
      qRating: [''],
      utmCampaign: [''],
      utmSource: [''],
      utmMedium: [''],
      deepLink: [''],
      channel: [''],
    });
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --include="**/form-state.service.spec.ts" --watch=false
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/services/form-state.service.ts src/app/services/form-state.service.spec.ts
git commit -m "feat: add FormStateService with per-tab reactive form groups"
```

---

## Task 7: TooltipComponent

**Files:**
- Create: `src/app/components/tooltip/tooltip.component.ts`
- Create: `src/app/components/tooltip/tooltip.component.html`
- Create: `src/app/components/tooltip/tooltip.component.css`

- [ ] **Step 1: Create TooltipComponent**

```typescript
// src/app/components/tooltip/tooltip.component.ts
import { Component, Input } from '@angular/core';
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
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  onMouseEnter(): void {
    this.showTimer = setTimeout(() => (this.visible = true), 200);
  }

  onMouseLeave(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
    this.visible = false;
  }
}
```

```html
<!-- src/app/components/tooltip/tooltip.component.html -->
<span class="tooltip-wrapper"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()">
  <button type="button" class="tooltip-trigger" aria-label="More information">?</button>
  <span class="tooltip-bubble" [class.visible]="visible" role="tooltip">
    {{ text }}
  </span>
</span>
```

```css
/* src/app/components/tooltip/tooltip.component.css */
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tooltip-trigger {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-border);
  color: var(--color-text-muted);
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  flex-shrink: 0;
}

.tooltip-bubble {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-navy);
  color: var(--color-text-on-dark);
  font-size: 12px;
  line-height: 1.4;
  padding: 6px 10px;
  border-radius: 4px;
  white-space: nowrap;
  max-width: 260px;
  white-space: normal;
  text-align: center;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: 200;
}

.tooltip-bubble.visible {
  opacity: 1;
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --watch=false
```

Expected: All previous tests still PASS. No new failures.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/tooltip/
git commit -m "feat: add TooltipComponent with 200ms hover delay"
```

---

## Task 8: TextField & SelectField Components

**Files:**
- Create: `src/app/components/fields/text-field/`
- Create: `src/app/components/fields/select-field/`

- [ ] **Step 1: Create TextFieldComponent**

```typescript
// src/app/components/fields/text-field/text-field.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent],
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.css'],
})
export class TextFieldComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() tooltip = '';
  @Input() required = false;
  @Input() control!: FormControl;
}
```

```html
<!-- src/app/components/fields/text-field/text-field.component.html -->
<div class="field">
  <div class="field-label-row">
    <label class="field-label">
      {{ label }}<span *ngIf="required" class="required">*</span>
    </label>
    <app-tooltip *ngIf="tooltip" [text]="tooltip"></app-tooltip>
  </div>
  <input
    type="text"
    class="field-input"
    [class.error]="control?.invalid && control?.touched"
    [formControl]="control"
    [placeholder]="placeholder"
  />
  <span class="field-error" *ngIf="control?.invalid && control?.touched">
    This field is required
  </span>
</div>
```

```css
/* src/app/components/fields/text-field/text-field.component.css */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.required {
  color: var(--color-red);
  margin-left: 1px;
}

.field-input {
  height: var(--field-height);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  padding: 0 12px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  width: 100%;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  outline: none;
}

.field-input::placeholder {
  color: var(--color-text-placeholder);
}

.field-input:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 2px rgba(27, 42, 74, 0.12);
}

.field-input.error {
  border-color: var(--color-border-error);
}

.field-error {
  font-size: 11px;
  color: var(--color-red);
}
```

- [ ] **Step 2: Create SelectFieldComponent**

```typescript
// src/app/components/fields/select-field/select-field.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';
import { SelectOption, SelectGroup } from '../../../models/url-builder.models';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent],
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.css'],
})
export class SelectFieldComponent {
  @Input() label = '';
  @Input() tooltip = '';
  @Input() required = false;
  @Input() control!: FormControl;
  @Input() options: SelectOption[] = [];
  @Input() groups: SelectGroup[] = [];
  @Input() placeholder = 'Select...';
}
```

```html
<!-- src/app/components/fields/select-field/select-field.component.html -->
<div class="field">
  <div class="field-label-row">
    <label class="field-label">
      {{ label }}<span *ngIf="required" class="required">*</span>
    </label>
    <app-tooltip *ngIf="tooltip" [text]="tooltip"></app-tooltip>
  </div>
  <div class="select-wrapper">
    <select class="field-select" [formControl]="control">
      <option value="">{{ placeholder }}</option>
      <ng-container *ngIf="groups.length > 0; else flatOptions">
        <optgroup *ngFor="let group of groups" [label]="group.groupLabel">
          <option *ngFor="let opt of group.options" [value]="opt.value">{{ opt.label }}</option>
        </optgroup>
      </ng-container>
      <ng-template #flatOptions>
        <option *ngFor="let opt of options" [value]="opt.value">{{ opt.label }}</option>
      </ng-template>
    </select>
    <span class="chevron">&#8964;</span>
  </div>
</div>
```

```css
/* src/app/components/fields/select-field/select-field.component.css */
.field { display: flex; flex-direction: column; gap: 6px; }

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
.required { color: var(--color-red); margin-left: 1px; }

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-select {
  height: var(--field-height);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  padding: 0 32px 0 12px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.field-select:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 2px rgba(27, 42, 74, 0.12);
}

.chevron {
  position: absolute;
  right: 12px;
  font-size: 16px;
  color: var(--color-text-muted);
  pointer-events: none;
}
```

- [ ] **Step 3: Run tests**

```bash
npm test -- --watch=false
```

Expected: All existing tests still PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/fields/text-field/ src/app/components/fields/select-field/
git commit -m "feat: add TextField and SelectField reusable components"
```

---

## Task 9: Toggle, DateRange & NumberSpinner Field Components

**Files:**
- Create: `src/app/components/fields/toggle-field/`
- Create: `src/app/components/fields/date-range-field/`
- Create: `src/app/components/fields/number-spinner-field/`

- [ ] **Step 1: Create ToggleFieldComponent**

```typescript
// src/app/components/fields/toggle-field/toggle-field.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';

@Component({
  selector: 'app-toggle-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent],
  templateUrl: './toggle-field.component.html',
  styleUrls: ['./toggle-field.component.css'],
})
export class ToggleFieldComponent {
  @Input() label = '';
  @Input() description = '';
  @Input() tooltip = '';
  @Input() control!: FormControl;

  toggle(): void {
    this.control.setValue(!this.control.value);
  }
}
```

```html
<!-- src/app/components/fields/toggle-field/toggle-field.component.html -->
<div class="toggle-field">
  <div class="toggle-content">
    <div class="toggle-label-row">
      <span class="toggle-label">{{ label }}</span>
      <app-tooltip *ngIf="tooltip" [text]="tooltip"></app-tooltip>
    </div>
    <span class="toggle-description">{{ description }}</span>
  </div>
  <div class="toggle-control">
    <button
      type="button"
      class="toggle-track"
      [class.on]="control.value"
      (click)="toggle()"
      [attr.aria-checked]="control.value"
      role="switch"
      [attr.aria-label]="label"
    >
      <span class="toggle-thumb"></span>
    </button>
    <span class="toggle-state-label">{{ control.value ? 'Yes' : 'No' }}</span>
  </div>
</div>
```

```css
/* src/app/components/fields/toggle-field/toggle-field.component.css */
.toggle-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  background: var(--color-bg-card);
  height: var(--field-height);
  min-height: 41px;
  height: auto;
  padding: 10px 12px;
}

.toggle-content { flex: 1; }

.toggle-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.toggle-label { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
.toggle-description { font-size: 11px; color: var(--color-text-muted); }

.toggle-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.toggle-track {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--color-toggle-off);
  position: relative;
  transition: background var(--transition-base);
  flex-shrink: 0;
  cursor: pointer;
}

.toggle-track.on { background: var(--color-toggle-on); }

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  transition: transform var(--transition-base);
}

.toggle-track.on .toggle-thumb { transform: translateX(20px); }

.toggle-state-label { font-size: 12px; color: var(--color-text-muted); min-width: 20px; }
```

- [ ] **Step 2: Create DateRangeFieldComponent**

```typescript
// src/app/components/fields/date-range-field/date-range-field.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';

@Component({
  selector: 'app-date-range-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent],
  templateUrl: './date-range-field.component.html',
  styleUrls: ['./date-range-field.component.css'],
})
export class DateRangeFieldComponent {
  @Input() label = '';
  @Input() tooltip = '';
  @Input() required = false;
  @Input() checkInControl!: FormControl;
  @Input() checkOutControl!: FormControl;
}
```

```html
<!-- src/app/components/fields/date-range-field/date-range-field.component.html -->
<div class="field">
  <div class="field-label-row">
    <label class="field-label">
      {{ label }}<span *ngIf="required" class="required">*</span>
    </label>
    <app-tooltip *ngIf="tooltip" [text]="tooltip"></app-tooltip>
  </div>
  <div class="date-range-wrapper">
    <span class="date-icon">&#128197;</span>
    <input type="date" class="date-input" [formControl]="checkInControl" />
    <span class="date-arrow">→</span>
    <input type="date" class="date-input" [formControl]="checkOutControl" />
  </div>
</div>
```

```css
/* src/app/components/fields/date-range-field/date-range-field.component.css */
.field { display: flex; flex-direction: column; gap: 6px; }

.field-label-row { display: flex; align-items: center; justify-content: space-between; }
.field-label { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
.required { color: var(--color-red); margin-left: 1px; }

.date-range-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  padding: 0 12px;
  height: var(--field-height);
  background: var(--color-bg-card);
}

.date-range-wrapper:focus-within {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 2px rgba(27, 42, 74, 0.12);
}

.date-icon { font-size: 16px; color: var(--color-text-muted); flex-shrink: 0; }
.date-arrow { color: var(--color-text-muted); flex-shrink: 0; }

.date-input {
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--color-text-primary);
  background: transparent;
  flex: 1;
  min-width: 0;
}
```

- [ ] **Step 3: Create NumberSpinnerFieldComponent**

```typescript
// src/app/components/fields/number-spinner-field/number-spinner-field.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';

@Component({
  selector: 'app-number-spinner-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipComponent],
  templateUrl: './number-spinner-field.component.html',
  styleUrls: ['./number-spinner-field.component.css'],
})
export class NumberSpinnerFieldComponent {
  @Input() label = '';
  @Input() tooltip = '';
  @Input() required = false;
  @Input() min = 1;
  @Input() max = 9;
  @Input() control!: FormControl;
  @Input() icon = '🛏';

  increment(): void {
    const current = this.control.value ?? this.min;
    if (current < this.max) this.control.setValue(current + 1);
  }

  decrement(): void {
    const current = this.control.value ?? this.min;
    if (current > this.min) this.control.setValue(current - 1);
  }
}
```

```html
<!-- src/app/components/fields/number-spinner-field/number-spinner-field.component.html -->
<div class="field">
  <div class="field-label-row">
    <label class="field-label">
      {{ label }}<span *ngIf="required" class="required">*</span>
    </label>
    <app-tooltip *ngIf="tooltip" [text]="tooltip"></app-tooltip>
  </div>
  <div class="spinner-wrapper">
    <span class="spinner-icon">{{ icon }}</span>
    <span class="spinner-value">{{ control.value }}</span>
    <div class="spinner-buttons">
      <button type="button" class="spinner-btn" (click)="increment()" [disabled]="control.value >= max">▲</button>
      <button type="button" class="spinner-btn" (click)="decrement()" [disabled]="control.value <= min">▼</button>
    </div>
  </div>
</div>
```

```css
/* src/app/components/fields/number-spinner-field/number-spinner-field.component.css */
.field { display: flex; flex-direction: column; gap: 6px; }

.field-label-row { display: flex; align-items: center; justify-content: space-between; }
.field-label { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
.required { color: var(--color-red); margin-left: 1px; }

.spinner-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  padding: 0 12px;
  height: var(--field-height);
  background: var(--color-bg-card);
}

.spinner-icon { font-size: 18px; }
.spinner-value { flex: 1; font-size: 14px; color: var(--color-text-primary); }

.spinner-buttons {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.spinner-btn {
  background: none;
  border: none;
  font-size: 8px;
  color: var(--color-text-muted);
  line-height: 1;
  padding: 2px;
  cursor: pointer;
  transition: color var(--transition-base);
}

.spinner-btn:hover:not(:disabled) { color: var(--color-navy); }
.spinner-btn:disabled { opacity: 0.3; cursor: default; }
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --watch=false
```

Expected: All prior tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/fields/
git commit -m "feat: add Toggle, DateRange, and NumberSpinner field components"
```

---

## Task 10: CollapsibleSectionComponent

**Files:**
- Create: `src/app/components/collapsible-section/`

- [ ] **Step 1: Create the component**

```typescript
// src/app/components/collapsible-section/collapsible-section.component.ts
import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collapsible-section.component.html',
  styleUrls: ['./collapsible-section.component.css'],
})
export class CollapsibleSectionComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() expanded = false;

  toggle(): void {
    this.expanded = !this.expanded;
  }
}
```

```html
<!-- src/app/components/collapsible-section/collapsible-section.component.html -->
<div class="section" [class.expanded]="expanded">
  <button type="button" class="section-header" (click)="toggle()" [attr.aria-expanded]="expanded">
    <div class="section-titles">
      <span class="section-title">{{ title }}</span>
      <span class="section-subtitle">{{ subtitle }}</span>
    </div>
    <span class="section-chevron" [class.rotated]="expanded">&#8964;</span>
  </button>
  <div class="section-divider"></div>
  <div class="section-content" [class.open]="expanded">
    <ng-content></ng-content>
  </div>
</div>
```

```css
/* src/app/components/collapsible-section/collapsible-section.component.css */
.section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;
}

.section-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-base);
}

.section.expanded .section-header {
  background: var(--color-bg-section-expanded);
}

.section-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
}

.section-chevron {
  font-size: 18px;
  color: var(--color-text-muted);
  transition: transform var(--transition-base);
  flex-shrink: 0;
}

.section-chevron.rotated { transform: rotate(180deg); }

.section-divider {
  height: 1px;
  background: var(--color-border);
}

.section-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms ease;
}

.section-content.open {
  max-height: 1000px;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/components/collapsible-section/
git commit -m "feat: add CollapsibleSectionComponent with animated expand/collapse"
```

---

## Task 11: HeaderComponent

**Files:**
- Create: `src/app/components/header/`

- [ ] **Step 1: Create HeaderComponent**

```typescript
// src/app/components/header/header.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Output() openSaved = new EventEmitter<void>();
  @Output() openHistory = new EventEmitter<void>();
}
```

```html
<!-- src/app/components/header/header.component.html -->
<header class="header">
  <div class="header-left">
    <div class="logo-area">
      <div class="ihg-logo">
        <span class="logo-text">IHG</span>
        <span class="logo-sub">HOTELS &amp;<br>RESORTS</span>
      </div>
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
</header>
```

```css
/* src/app/components/header/header.component.css */
.header {
  background: var(--color-navy);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 80px;
  flex-shrink: 0;
}

.header-left { display: flex; align-items: center; }

.logo-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ihg-logo {
  display: flex;
  align-items: center;
  gap: 6px;
}

.logo-text {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-text-on-dark);
  letter-spacing: -1px;
}

.logo-sub {
  font-size: 7px;
  font-weight: 600;
  color: var(--color-text-on-dark-muted);
  line-height: 1.3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-divider {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.25);
  margin: 0 4px;
}

.app-title {
  font-size: 20px;
  font-weight: 400;
  color: var(--color-text-on-dark);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--color-text-on-dark);
  background: transparent;
  transition: background var(--transition-base);
  border: none;
  cursor: pointer;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.12);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/components/header/
git commit -m "feat: add HeaderComponent with nav buttons"
```

---

## Task 12: UrlBarComponent

**Files:**
- Create: `src/app/components/url-bar/`

- [ ] **Step 1: Create UrlBarComponent**

```typescript
// src/app/components/url-bar/url-bar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-url-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './url-bar.component.html',
  styleUrls: ['./url-bar.component.css'],
})
export class UrlBarComponent {
  @Input() set fullUrl(val: string) {
    const idx = val.indexOf('?');
    this.baseUrl = idx > -1 ? val.substring(0, idx) : val;
    this.queryString = idx > -1 ? val.substring(idx) : '';
    this.fullUrlValue = val;
  }
  @Output() urlCopied = new EventEmitter<void>();

  baseUrl = '';
  queryString = '';
  fullUrlValue = '';  // public so template can access it

  copied = false;
  showPopover = false;

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.fullUrlValue);
    this.copied = true;
    this.urlCopied.emit();
    setTimeout(() => (this.copied = false), 1800);
  }

  togglePopover(): void {
    this.showPopover = !this.showPopover;
  }

  closePopover(): void {
    this.showPopover = false;
  }
}
```

```html
<!-- src/app/components/url-bar/url-bar.component.html -->
<div class="url-bar">
  <div class="url-content-area">
    <div class="url-display">
      <span class="url-base">{{ baseUrl }}</span><span class="url-query">{{ queryString }}</span>
    </div>
    <div class="url-fade"></div>
  </div>
  <div class="url-actions">
    <button type="button" class="url-action-btn" (click)="copy()" [class.copied]="copied" [attr.aria-label]="copied ? 'Copied!' : 'Copy URL'">
      <span *ngIf="!copied">&#128203;</span>
      <span *ngIf="copied" class="copied-label">✓</span>
    </button>
    <div class="popover-container">
      <button type="button" class="url-action-btn" (click)="togglePopover()" aria-label="More options">
        &#8226;&#8226;&#8226;
      </button>
      <div class="popover" *ngIf="showPopover">
        <div class="popover-header">
          <span>Full URL</span>
          <button type="button" class="popover-close" (click)="closePopover()">✕</button>
        </div>
        <textarea class="popover-url" readonly>{{ fullUrlValue }}</textarea>
      </div>
    </div>
  </div>
</div>
```

```css
/* src/app/components/url-bar/url-bar.component.css */
:host {
  display: block;
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-navy);
  padding: 20px 32px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.url-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1040px;
  margin: 0 auto;
}

.url-content-area {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.url-display {
  display: flex;
  align-items: baseline;
  white-space: nowrap;
  font-size: 13px;
  font-family: 'Menlo', 'Consolas', monospace;
  overflow: hidden;
}

.url-base {
  color: var(--color-text-on-dark);
  flex-shrink: 0;
}

.url-query {
  color: var(--color-text-on-dark-muted);
}

.url-fade {
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 100%;
  background: linear-gradient(to right, transparent, var(--color-navy));
  pointer-events: none;
}

.url-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  position: relative;
}

.url-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-on-dark-muted);
  font-size: 14px;
  transition: background var(--transition-base), color var(--transition-base);
  cursor: pointer;
  background: transparent;
  border: none;
}

.url-action-btn:hover { background: rgba(255,255,255,0.12); color: white; }
.url-action-btn.copied { color: #4ade80; }

.copied-label { font-size: 14px; }

.popover-container { position: relative; }

.popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  width: 420px;
  z-index: 200;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.popover-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 14px;
}

.popover-url {
  width: 100%;
  padding: 10px 14px;
  font-family: monospace;
  font-size: 12px;
  color: var(--color-text-primary);
  border: none;
  resize: none;
  min-height: 80px;
  outline: none;
  line-break: anywhere;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/components/url-bar/
git commit -m "feat: add UrlBarComponent with sticky display, copy, and full-URL popover"
```

---

## Task 13: TabBarComponent

**Files:**
- Create: `src/app/components/tab-bar/`

- [ ] **Step 1: Create TabBarComponent**

```typescript
// src/app/components/tab-bar/tab-bar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabKey } from '../../models/url-builder.models';

interface Tab {
  key: TabKey | null;
  label: string;
  disabled: boolean;
}

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.css'],
})
export class TabBarComponent {
  @Input() activeTab: TabKey = 'home';
  @Output() tabChange = new EventEmitter<TabKey>();

  tabs: Tab[] = [
    { key: 'home', label: 'Home', disabled: false },
    { key: 'search', label: 'Search', disabled: false },
    { key: null, label: 'Hotel Details', disabled: true },
    { key: null, label: 'CRR', disabled: true },
  ];

  selectTab(tab: Tab): void {
    if (!tab.disabled && tab.key) {
      this.tabChange.emit(tab.key);
    }
  }
}
```

```html
<!-- src/app/components/tab-bar/tab-bar.component.html -->
<div class="tab-bar-wrapper">
  <div class="tab-bar">
    <button
      *ngFor="let tab of tabs"
      type="button"
      class="tab"
      [class.active]="tab.key === activeTab"
      [class.disabled]="tab.disabled"
      [disabled]="tab.disabled"
      (click)="selectTab(tab)"
    >
      {{ tab.label }}
    </button>
  </div>
</div>
```

```css
/* src/app/components/tab-bar/tab-bar.component.css */
.tab-bar-wrapper {
  background: var(--color-navy);
  padding: 0 120px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.tab-bar {
  display: flex;
  gap: 4px;
}

.tab {
  padding: 10px 18px;
  font-size: 14px;
  color: var(--color-text-on-dark-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color var(--transition-base), border-color var(--transition-base);
  white-space: nowrap;
}

.tab:hover:not(.disabled) {
  color: var(--color-text-on-dark);
}

.tab.active {
  color: var(--color-text-on-dark);
  border-bottom-color: var(--color-text-on-dark);
  font-weight: 500;
}

.tab.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/components/tab-bar/
git commit -m "feat: add TabBarComponent with disabled Hotel Details and CRR tabs"
```

---

## Task 14: FormContainerComponent — Home Tab

**Files:**
- Create: `src/app/components/form-container/form-container.component.ts`
- Create: `src/app/components/form-container/form-container.component.html`
- Create: `src/app/components/form-container/form-container.component.css`

- [ ] **Step 1: Create FormContainerComponent**

```typescript
// src/app/components/form-container/form-container.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TabKey, BRAND_GROUPS, LANGUAGE_OPTIONS, COUNTRY_OPTIONS, SPECIAL_RATE_OPTIONS, SORT_OPTIONS, HOTEL_CLASS_OPTIONS, CHANNEL_OPTIONS } from '../../models/url-builder.models';
import { FormStateService } from '../../services/form-state.service';
import { UrlBuilderService } from '../../services/url-builder.service';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';
import { TextFieldComponent } from '../fields/text-field/text-field.component';
import { SelectFieldComponent } from '../fields/select-field/select-field.component';
import { ToggleFieldComponent } from '../fields/toggle-field/toggle-field.component';
import { DateRangeFieldComponent } from '../fields/date-range-field/date-range-field.component';
import { NumberSpinnerFieldComponent } from '../fields/number-spinner-field/number-spinner-field.component';

@Component({
  selector: 'app-form-container',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CollapsibleSectionComponent, TextFieldComponent,
    SelectFieldComponent, ToggleFieldComponent,
    DateRangeFieldComponent, NumberSpinnerFieldComponent,
  ],
  templateUrl: './form-container.component.html',
  styleUrls: ['./form-container.component.css'],
})
export class FormContainerComponent implements OnInit, OnDestroy {
  @Input() tab: TabKey = 'home';
  @Output() urlChange = new EventEmitter<string>();
  @Output() saveRequested = new EventEmitter<string>();

  form!: FormGroup;
  brandGroups = BRAND_GROUPS;
  languageOptions = LANGUAGE_OPTIONS;
  countryOptions = COUNTRY_OPTIONS;
  specialRateOptions = SPECIAL_RATE_OPTIONS;
  sortOptions = SORT_OPTIONS;
  hotelClassOptions = HOTEL_CLASS_OPTIONS;
  channelOptions = CHANNEL_OPTIONS;

  private sub!: Subscription;

  constructor(
    private formState: FormStateService,
    private urlBuilder: UrlBuilderService,
  ) {}

  ngOnInit(): void {
    this.form = this.formState.getForm(this.tab);
    this.sub = this.form.valueChanges.subscribe(values => {
      this.urlChange.emit(this.urlBuilder.buildUrl(this.tab, values));
    });
    // Emit initial URL
    this.urlChange.emit(this.urlBuilder.buildUrl(this.tab, this.form.value));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ctrl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  clearForm(): void {
    this.formState.resetForm(this.tab);
  }

  saveUrl(): void {
    this.saveRequested.emit(this.urlBuilder.buildUrl(this.tab, this.form.value));
  }
}
```

- [ ] **Step 2: Create the template**

```html
<!-- src/app/components/form-container/form-container.component.html -->
<div class="form-container">

  <!-- Core Environment Setup -->
  <app-collapsible-section
    title="Core Environment Setup"
    subtitle="Define your destination. Set the base domain and protocol"
    [expanded]="true">
    <div class="section-body">
      <div class="field-row">
        <app-select-field
          label="Brand"
          [required]="true"
          [control]="ctrl('brandCode')"
          [groups]="brandGroups"
          tooltip="The IHG brand to target. Each brand has a unique code used to filter content and rates.">
        </app-select-field>
        <app-select-field
          label="Language"
          [required]="true"
          [control]="ctrl('language')"
          [options]="languageOptions"
          tooltip="Locale determines the language and regional content served on the page.">
        </app-select-field>
      </div>
      <div class="field-row field-row-3">
        <app-text-field
          label="PMID"
          [required]="true"
          placeholder="Enter 4 characters to search"
          [control]="ctrl('pmid')"
          tooltip="Paid Media ID — 4-character code identifying the campaign traffic source.">
        </app-text-field>
        <app-text-field
          label="Global Attribution (GLAT)"
          [required]="true"
          placeholder="At least 4 characters long"
          [control]="ctrl('glat')"
          tooltip="Global attribution tracking code, minimum 4 characters. Used for cross-channel attribution.">
        </app-text-field>
        <app-text-field
          label="Rate code"
          [required]="true"
          placeholder="Enter 4 characters to search"
          [control]="ctrl('rateCode')"
          tooltip="Specific rate plan code to pre-select on the landing page.">
        </app-text-field>
      </div>
      <div class="field-row">
        <app-toggle-field
          label="Domain persistence"
          description="Enable to allow the tracking to persist across domains"
          [control]="ctrl('domainPersistence')"
          tooltip="Allows tracking cookies to persist across IHG domains for consistent attribution.">
        </app-toggle-field>
        <app-toggle-field
          label="China domain"
          description="Enable for GC domains"
          [control]="ctrl('chinaDomain')"
          tooltip="Routes traffic through IHG's China-specific domain for GC market campaigns.">
        </app-toggle-field>
      </div>
    </div>
  </app-collapsible-section>

  <!-- Search-only sections -->
  <ng-container *ngIf="tab === 'search'">

    <!-- Itinerary Details -->
    <app-collapsible-section
      title="Itinerary details"
      subtitle="Parameters related to the required stay details"
      [expanded]="true">
      <div class="section-body">
        <div class="field-row field-row-3">
          <app-text-field
            label="Destination"
            [required]="true"
            placeholder="City or region"
            [control]="ctrl('qDest')"
            tooltip="City or region name to pre-populate in the hotel search field.">
          </app-text-field>
          <app-text-field
            label="City"
            [required]="true"
            placeholder="City code"
            [control]="ctrl('qCity')"
            tooltip="Specific city code used to narrow hotel search results.">
          </app-text-field>
          <app-select-field
            label="Country"
            [required]="true"
            [control]="ctrl('qCtry')"
            [options]="countryOptions"
            placeholder="Select country"
            tooltip="Country filter applied to hotel search results.">
          </app-select-field>
        </div>
        <div class="field-row itinerary-row">
          <app-date-range-field
            label="Eligible stay dates"
            [required]="true"
            [checkInControl]="ctrl('qChkIn')"
            [checkOutControl]="ctrl('qChkOut')"
            tooltip="Check-in and check-out dates passed to the search (YYYY-MM-DD format).">
          </app-date-range-field>
          <app-number-spinner-field
            label="Rooms"
            [required]="true"
            [control]="ctrl('qRms')"
            icon="🛏"
            tooltip="Number of rooms required. Minimum value: 1.">
          </app-number-spinner-field>
          <app-select-field
            label="Special rate"
            [required]="true"
            [control]="ctrl('qRateCode')"
            [options]="specialRateOptions"
            placeholder="Select rate"
            tooltip="Pre-selects a special rate category in search results.">
          </app-select-field>
        </div>
      </div>
    </app-collapsible-section>

    <!-- Rate Details -->
    <app-collapsible-section
      title="Rate details"
      subtitle="Special details for rates"
      [expanded]="false">
      <div class="section-body">
        <div class="field-row">
          <app-text-field
            label="Corporate account number"
            placeholder="Enter corporate account number"
            [control]="ctrl('corpNum')"
            tooltip="Corporate account number used to surface negotiated rates.">
          </app-text-field>
          <app-text-field
            label="Promo code"
            placeholder="Enter promo code"
            [control]="ctrl('promoCode')"
            tooltip="Promotional code that applies a discount or special rate to results.">
          </app-text-field>
        </div>
      </div>
    </app-collapsible-section>

    <!-- Sort & Filter -->
    <app-collapsible-section
      title="Sort and filter"
      subtitle="Set up how results should be sorted and filtered"
      [expanded]="false">
      <div class="section-body">
        <div class="field-row">
          <app-select-field
            label="Sort by"
            [control]="ctrl('qSort')"
            [options]="sortOptions"
            placeholder="Select sort order"
            tooltip="Sets the default sort order for search results.">
          </app-select-field>
          <app-select-field
            label="Hotel class"
            [control]="ctrl('qRating')"
            [options]="hotelClassOptions"
            placeholder="Select hotel class"
            tooltip="Filters search results by star rating (1–5 stars).">
          </app-select-field>
        </div>
      </div>
    </app-collapsible-section>

    <!-- Tracking -->
    <app-collapsible-section
      title="Tracking"
      subtitle="Additional parameters related to tracking metrics"
      [expanded]="false">
      <div class="section-body">
        <div class="field-row field-row-3">
          <app-text-field
            label="Campaign ID"
            placeholder="e.g. summer2026"
            [control]="ctrl('utmCampaign')"
            tooltip="UTM campaign name for analytics — identifies the specific marketing campaign.">
          </app-text-field>
          <app-text-field
            label="Source"
            placeholder="e.g. newsletter"
            [control]="ctrl('utmSource')"
            tooltip="UTM source — identifies where traffic originates (e.g. newsletter, google).">
          </app-text-field>
          <app-text-field
            label="Medium"
            placeholder="e.g. email"
            [control]="ctrl('utmMedium')"
            tooltip="UTM medium — the marketing channel type (e.g. email, cpc, social).">
          </app-text-field>
        </div>
      </div>
    </app-collapsible-section>

    <!-- Deep Linking -->
    <app-collapsible-section
      title="Deep linking"
      subtitle="Special parameters needed for deep links within the channels"
      [expanded]="false">
      <div class="section-body">
        <div class="field-row">
          <app-text-field
            label="Deep link path"
            placeholder="e.g. /hotels/login"
            [control]="ctrl('deepLink')"
            tooltip="Internal app path used for channel-specific deep link routing.">
          </app-text-field>
          <app-select-field
            label="Channel"
            [control]="ctrl('channel')"
            [options]="channelOptions"
            placeholder="Select channel"
            tooltip="Specifies the marketing channel for deep link attribution.">
          </app-select-field>
        </div>
      </div>
    </app-collapsible-section>

  </ng-container>

  <!-- Form Actions -->
  <div class="form-actions">
    <button type="button" class="btn-secondary" (click)="clearForm()">
      ✕ &nbsp;CLEAR FORM
    </button>
    <button type="button" class="btn-primary" (click)="saveUrl()">
      ✓ &nbsp;SAVE URL
    </button>
  </div>

</div>
```

```css
/* src/app/components/form-container/form-container.component.css */
.form-container {
  max-width: 1040px;
  margin: 0 auto;
  padding: 24px 0 48px;
}

.section-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field-row-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.itinerary-row {
  grid-template-columns: 2fr 1fr 1fr;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  background: var(--color-red);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-field);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border: none;
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.btn-primary:hover { opacity: 0.9; }

.btn-secondary {
  background: white;
  color: var(--color-text-primary);
  padding: 12px 24px;
  border-radius: var(--radius-field);
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: background var(--transition-base);
}

.btn-secondary:hover { background: var(--color-bg-section-expanded); }

@media (max-width: 1024px) {
  .form-container { padding: 16px; }
  .field-row-3 { grid-template-columns: 1fr 1fr; }
  .itinerary-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .field-row,
  .field-row-3,
  .itinerary-row {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Run tests**

```bash
npm test -- --watch=false
```

Expected: All service tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/form-container/
git commit -m "feat: add FormContainerComponent with Home and Search tab field layouts"
```

---

## Task 15: SaveModalComponent

**Files:**
- Create: `src/app/components/save-modal/`

- [ ] **Step 1: Create SaveModalComponent**

```typescript
// src/app/components/save-modal/save-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-save-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './save-modal.component.html',
  styleUrls: ['./save-modal.component.css'],
})
export class SaveModalComponent {
  @Input() url = '';
  @Output() confirmed = new EventEmitter<string>(); // emits the name
  @Output() cancelled = new EventEmitter<void>();

  name = '';

  confirm(): void {
    this.confirmed.emit(this.name.trim());
    this.name = '';
  }

  cancel(): void {
    this.name = '';
    this.cancelled.emit();
  }
}
```

```html
<!-- src/app/components/save-modal/save-modal.component.html -->
<div class="modal-backdrop" (click)="cancel()"></div>
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-header">
    <h2 id="modal-title" class="modal-title">Save URL</h2>
    <button type="button" class="modal-close" (click)="cancel()">✕</button>
  </div>
  <div class="modal-body">
    <p class="modal-url-preview">{{ url }}</p>
    <div class="modal-field">
      <label class="modal-label">Name (optional)</label>
      <input
        type="text"
        class="modal-input"
        [(ngModel)]="name"
        placeholder="Leave blank to use timestamp"
        maxlength="80"
        autofocus
      />
      <span class="modal-hint">If left blank, the saved entry will be labeled with the current date and time.</span>
    </div>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn-modal-secondary" (click)="cancel()">Cancel</button>
    <button type="button" class="btn-modal-primary" (click)="confirm()">Save</button>
  </div>
</div>
```

```css
/* src/app/components/save-modal/save-modal.component.css */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 300;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: var(--radius-card);
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  width: 480px;
  max-width: calc(100vw - 32px);
  z-index: 301;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title { font-size: 16px; font-weight: 600; color: var(--color-text-primary); }

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 16px;
}

.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }

.modal-url-preview {
  font-family: monospace;
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-bg-section-expanded);
  padding: 10px 12px;
  border-radius: var(--radius-field);
  word-break: break-all;
  line-height: 1.5;
}

.modal-field { display: flex; flex-direction: column; gap: 6px; }

.modal-label { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }

.modal-input {
  height: var(--field-height);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  width: 100%;
  transition: border-color var(--transition-base);
}

.modal-input:focus { border-color: var(--color-border-focus); }

.modal-hint { font-size: 11px; color: var(--color-text-muted); }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
}

.btn-modal-primary {
  background: var(--color-red);
  color: white;
  padding: 9px 20px;
  border-radius: var(--radius-field);
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-modal-secondary {
  background: white;
  color: var(--color-text-primary);
  padding: 9px 20px;
  border-radius: var(--radius-field);
  font-size: 14px;
  border: 1px solid var(--color-border);
  cursor: pointer;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/components/save-modal/
git commit -m "feat: add SaveModalComponent with optional name input"
```

---

## Task 16: SavedUrlCard & DrawerComponent

**Files:**
- Create: `src/app/components/saved-url-card/`
- Create: `src/app/components/drawer/`

- [ ] **Step 1: Create SavedUrlCardComponent**

```typescript
// src/app/components/saved-url-card/saved-url-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedUrl } from '../../models/url-builder.models';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-saved-url-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-url-card.component.html',
  styleUrls: ['./saved-url-card.component.css'],
})
export class SavedUrlCardComponent {
  @Input() entry!: SavedUrl;
  @Output() deleted = new EventEmitter<void>();

  copied = false;

  constructor(private storage: StorageService) {}

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.entry.url);
    this.copied = true;
    setTimeout(() => (this.copied = false), 1800);
  }

  get label(): string {
    return this.entry.isNamed ? this.entry.name : this.storage.formatTimestampLabel(this.entry.timestamp);
  }
}
```

```html
<!-- src/app/components/saved-url-card/saved-url-card.component.html -->
<div class="card">
  <div class="card-content">
    <span class="card-label">{{ label }}</span>
    <span class="card-tab">{{ entry.tab }}</span>
    <span class="card-url">{{ entry.url }}</span>
  </div>
  <div class="card-actions">
    <button type="button" class="card-btn" (click)="copy()" [attr.aria-label]="copied ? 'Copied!' : 'Copy URL'">
      {{ copied ? '✓' : '📋' }}
    </button>
    <button type="button" class="card-btn delete" (click)="deleted.emit()" aria-label="Delete">✕</button>
  </div>
</div>
```

```css
/* src/app/components/saved-url-card/saved-url-card.component.css */
.card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  background: var(--color-bg-card);
  margin-bottom: 8px;
}

.card-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }

.card-label { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }

.card-tab {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: var(--color-bg-section-expanded);
  border-radius: 2px;
  padding: 1px 5px;
  display: inline-block;
  width: fit-content;
}

.card-url {
  font-family: monospace;
  font-size: 11px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions { display: flex; gap: 4px; flex-shrink: 0; }

.card-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-base);
}

.card-btn:hover { color: var(--color-navy); }
.card-btn.delete:hover { color: var(--color-red); border-color: var(--color-red); }
```

- [ ] **Step 2: Create DrawerComponent**

```typescript
// src/app/components/drawer/drawer.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedUrl } from '../../models/url-builder.models';
import { StorageService } from '../../services/storage.service';
import { SavedUrlCardComponent } from '../saved-url-card/saved-url-card.component';

type DrawerTab = 'saved' | 'history';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, SavedUrlCardComponent],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.css'],
})
export class DrawerComponent implements OnInit {
  @Input() initialTab: DrawerTab = 'saved';
  @Output() closed = new EventEmitter<void>();

  activeTab: DrawerTab = 'saved';
  savedUrls: SavedUrl[] = [];
  history: SavedUrl[] = [];

  constructor(private storage: StorageService) {}

  ngOnInit(): void {
    this.activeTab = this.initialTab;
    this.refresh();
  }

  refresh(): void {
    this.savedUrls = this.storage.getSavedUrls();
    this.history = this.storage.getHistory();
  }

  deleteSaved(id: string): void {
    this.storage.deleteSavedUrl(id);
    this.refresh();
  }

  deleteHistory(id: string): void {
    this.storage.deleteHistoryEntry(id);
    this.refresh();
  }

  get activeList(): SavedUrl[] {
    return this.activeTab === 'saved' ? this.savedUrls : this.history;
  }
}
```

```html
<!-- src/app/components/drawer/drawer.component.html -->
<div class="drawer-backdrop" (click)="closed.emit()"></div>
<div class="drawer" role="dialog" aria-label="Saved URLs and History">
  <div class="drawer-header">
    <div class="drawer-tabs">
      <button type="button" class="drawer-tab" [class.active]="activeTab === 'saved'" (click)="activeTab = 'saved'">
        Saved ({{ savedUrls.length }})
      </button>
      <button type="button" class="drawer-tab" [class.active]="activeTab === 'history'" (click)="activeTab = 'history'">
        History ({{ history.length }})
      </button>
    </div>
    <button type="button" class="drawer-close" (click)="closed.emit()">✕</button>
  </div>
  <div class="drawer-body">
    <ng-container *ngIf="activeList.length > 0; else emptyState">
      <app-saved-url-card
        *ngFor="let entry of activeList"
        [entry]="entry"
        (deleted)="activeTab === 'saved' ? deleteSaved(entry.id) : deleteHistory(entry.id)">
      </app-saved-url-card>
    </ng-container>
    <ng-template #emptyState>
      <div class="empty-state">
        <p>No {{ activeTab === 'saved' ? 'saved URLs' : 'history' }} yet.</p>
      </div>
    </ng-template>
  </div>
</div>
```

```css
/* src/app/components/drawer/drawer.component.css */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 150;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  z-index: 151;
  display: flex;
  flex-direction: column;
  animation: slideIn 200ms ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.drawer-tabs { display: flex; gap: 4px; }

.drawer-tab {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-base);
}

.drawer-tab.active {
  color: var(--color-navy);
  background: var(--color-bg-section-expanded);
  border-color: var(--color-border);
}

.drawer-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 16px;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: var(--color-text-muted);
  font-size: 13px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/components/saved-url-card/ src/app/components/drawer/
git commit -m "feat: add SavedUrlCard and DrawerComponent with Saved/History tabs"
```

---

## Task 17: AppComponent — Final Wiring

**Files:**
- Modify: `src/app/app.component.ts`
- Modify: `src/app/app.component.html`
- Modify: `src/app/app.component.css`

- [ ] **Step 1: Implement AppComponent**

```typescript
// src/app/app.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabKey } from './models/url-builder.models';
import { StorageService } from './services/storage.service';
import { HeaderComponent } from './components/header/header.component';
import { UrlBarComponent } from './components/url-bar/url-bar.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { FormContainerComponent } from './components/form-container/form-container.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { SaveModalComponent } from './components/save-modal/save-modal.component';

type DrawerMode = 'saved' | 'history';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent, UrlBarComponent, TabBarComponent,
    FormContainerComponent, DrawerComponent, SaveModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  activeTab: TabKey = 'home';
  currentUrl = '';
  pendingSaveUrl = '';

  drawerOpen = false;
  drawerMode: DrawerMode = 'saved';
  saveModalOpen = false;

  constructor(private storage: StorageService) {}

  onTabChange(tab: TabKey): void {
    this.activeTab = tab;
  }

  onUrlChange(url: string): void {
    this.currentUrl = url;
  }

  onSaveRequested(url: string): void {
    this.pendingSaveUrl = url;
    this.saveModalOpen = true;
  }

  onSaveConfirmed(name: string): void {
    const isNamed = name.length > 0;
    const timestamp = new Date().toISOString();
    const entry = {
      id: this.storage.generateId(),
      name: isNamed ? name : this.storage.formatTimestampLabel(timestamp),
      url: this.pendingSaveUrl,
      tab: this.activeTab,
      timestamp,
      isNamed,
    };
    this.storage.saveUrl(entry);
    this.storage.addToHistory({ ...entry, isNamed: false });
    this.saveModalOpen = false;
    this.pendingSaveUrl = '';
  }

  onSaveCancelled(): void {
    this.saveModalOpen = false;
    this.pendingSaveUrl = '';
  }

  openSaved(): void {
    this.drawerMode = 'saved';
    this.drawerOpen = true;
  }

  openHistory(): void {
    this.drawerMode = 'history';
    this.drawerOpen = true;
  }

  onCopy(): void {
    const timestamp = new Date().toISOString();
    this.storage.addToHistory({
      id: this.storage.generateId(),
      name: this.storage.formatTimestampLabel(timestamp),
      url: this.currentUrl,
      tab: this.activeTab,
      timestamp,
      isNamed: false,
    });
  }
}
```

```html
<!-- src/app/app.component.html -->
<div class="app-shell">
  <app-header
    (openSaved)="openSaved()"
    (openHistory)="openHistory()">
  </app-header>

  <app-url-bar [fullUrl]="currentUrl" (urlCopied)="onCopy()"></app-url-bar>

  <app-tab-bar
    [activeTab]="activeTab"
    (tabChange)="onTabChange($event)">
  </app-tab-bar>

  <main class="app-main">
    <app-form-container
      [tab]="activeTab"
      (urlChange)="onUrlChange($event)"
      (saveRequested)="onSaveRequested($event)">
    </app-form-container>
  </main>

  <app-drawer
    *ngIf="drawerOpen"
    [initialTab]="drawerMode"
    (closed)="drawerOpen = false">
  </app-drawer>

  <app-save-modal
    *ngIf="saveModalOpen"
    [url]="pendingSaveUrl"
    (confirmed)="onSaveConfirmed($event)"
    (cancelled)="onSaveCancelled()">
  </app-save-modal>
</div>
```

```css
/* src/app/app.component.css */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding: 24px 120px;
  background: var(--color-bg-page);
}

@media (max-width: 1024px) {
  .app-main { padding: 16px 24px; }
}

@media (max-width: 768px) {
  .app-main { padding: 12px 16px; }
}
```

- [ ] **Step 2: Update main.ts to bootstrap AppComponent**

```typescript
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [provideAnimations()],
}).catch(err => console.error(err));
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: Build completes with no errors.

- [ ] **Step 4: Run dev server and manually test**

```bash
npm start
```

Open `http://localhost:4200` and verify:
- Header renders with IHG logo and nav buttons
- URL bar is sticky and shows a URL
- Home tab shows Core Environment Setup expanded
- Switching to Search tab shows additional sections
- Filling in fields updates the URL in real time
- Copy button copies to clipboard
- Save URL opens modal, saving works, drawer opens with saved entry
- History nav button opens drawer on History tab
- Clear Form resets fields

- [ ] **Step 5: Commit**

```bash
git add src/app/app.component.ts src/app/app.component.html src/app/app.component.css src/main.ts
git commit -m "feat: wire up AppComponent — full app working end to end"
```

---

## Task 18: Responsive Polish & Final Tests

**Files:**
- Modify: `src/app/components/tab-bar/tab-bar.component.css`
- Modify: `src/app/components/header/header.component.css`

- [ ] **Step 1: Add mobile-friendly header adjustments**

Add to `src/app/components/header/header.component.css`:

```css
@media (max-width: 768px) {
  .header { padding: 0 16px; }
  .app-title { display: none; }
  .nav-btn { padding: 6px 8px; font-size: 12px; }
}
```

- [ ] **Step 2: Add tab bar overflow scroll on mobile**

Add to `src/app/components/tab-bar/tab-bar.component.css`:

```css
@media (max-width: 768px) {
  .tab-bar-wrapper { padding: 0 16px; overflow-x: auto; }
  .tab-bar { flex-wrap: nowrap; }
}
```

- [ ] **Step 3: Run all tests**

```bash
npm test -- --watch=false
```

Expected: All tests PASS.

- [ ] **Step 4: Final build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: responsive polish and final test pass — URL Builder complete"
```
