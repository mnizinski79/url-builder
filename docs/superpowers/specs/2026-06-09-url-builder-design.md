# URL Builder — Design Spec
**Date:** 2026-06-09  
**Status:** Approved

---

## Overview

A responsive Angular 17+ web application that lets IHG users construct deep-link URLs by filling out a structured form. As fields are completed, a URL is built and displayed live in a sticky header bar. Users can save named URLs and view history, both persisted in localStorage.

---

## Tech Stack

- **Framework:** Angular 17+ standalone components (no NgModules)
- **Forms:** Angular Reactive Forms
- **Styling:** Component-scoped CSS with CSS custom properties for design tokens
- **Persistence:** localStorage via a shared StorageService
- **No external UI library** — all components hand-built to match Figma design

---

## Component Architecture

```
AppComponent
├── HeaderComponent            — IHG logo, "URL Builder" title, nav buttons
├── UrlBarComponent            — Sticky URL display, copy + "..." buttons
├── TabBarComponent            — Home / Search tabs; Hotel Details + CRR disabled
├── FormContainerComponent     — Scrollable form, owns reactive form per tab
│   ├── CollapsibleSectionComponent  — Reusable expand/collapse wrapper
│   ├── TextFieldComponent           — Text input with label, tooltip, error state
│   ├── SelectFieldComponent         — Dropdown with label, tooltip, option groups
│   ├── ToggleFieldComponent         — Toggle switch with label, tooltip, Yes/No label
│   ├── DateRangeFieldComponent      — Date range picker with tooltip
│   ├── NumberSpinnerFieldComponent  — Integer spinner (rooms) with tooltip
│   └── TooltipComponent             — Shared hover tooltip (200ms delay)
├── DrawerComponent            — Slide-out panel from right (Saved / History tabs)
│   └── SavedUrlCardComponent  — Individual saved/history entry with copy + delete
└── SaveModalComponent         — Modal: optional name input, save confirmation
```

### Services

| Service | Responsibility |
|---|---|
| `UrlBuilderService` | Computes URL string reactively from form values |
| `StorageService` | localStorage CRUD — saved URLs and auto-history |
| `FormStateService` | Holds form values per tab; survives tab switching |

---

## Tabs

| Tab | Status | Base URL |
|---|---|---|
| Home | Active | `https://www.ihg.com/redirect` |
| Search | Active | `https://www.ihg.com/hotels/us/en/find-hotels/hotel-search` |
| Hotel Details | Disabled (UI only) | — |
| CRR | Disabled (UI only) | — |

---

## Fields & URL Mapping

### Shared: Core Environment Setup (both tabs, expanded by default)

| Field | Type | URL Param | Tooltip |
|---|---|---|---|
| Brand | Dropdown (grouped) | `brandCode` | The IHG brand to target. Each brand has a unique code used to filter content and rates. |
| Language | Dropdown | `localeCode` + `regionCode` | Locale determines the language and regional content served on the page. |
| PMID | Text | `pmid` | Paid Media ID — 4-character code identifying the campaign traffic source. |
| Global Attribution (GLAT) | Text | `glat` | Global attribution tracking code, minimum 4 characters. Used for cross-channel attribution. |
| Rate code | Text | `rateCode` | Specific rate plan code to pre-select on the landing page. |
| Domain persistence | Toggle | `dp=true` (when on) | Allows tracking cookies to persist across IHG domains for consistent attribution. |
| China domain | Toggle | `cn=true` (when on) | Routes traffic through IHG's China-specific domain for GC market campaigns. |

### Home Tab — URL Pattern
```
https://www.ihg.com/redirect?path=home&brandCode={brand}&regionCode={region}&localeCode={locale}[&pmid={pmid}][&glat={glat}][&rateCode={rateCode}][&dp=true][&cn=true]
```

### Search Tab — Additional Sections

**Itinerary Details** (expanded by default)

| Field | Type | URL Param | Tooltip |
|---|---|---|---|
| Destination | Text | `qDest` | City or region name to pre-populate in the hotel search field. |
| City | Text | `qCity` | Specific city code used to narrow hotel search results. |
| Country | Dropdown | `qCtry` | Country filter applied to hotel search results. |
| Eligible stay dates | Date Range | `qChkIn` / `qChkOut` | Check-in and check-out dates passed to the search (YYYY-MM-DD format). |
| Rooms | Number Spinner | `qRms` | Number of rooms required. Minimum value: 1. |
| Special rate | Dropdown | `qRateCode` | Pre-selects a special rate category (e.g. AAA, Senior, Government) in search results. |

**Rate Details** (collapsed by default)

| Field | Type | URL Param | Tooltip |
|---|---|---|---|
| Corporate account number | Text | `corpNum` | Corporate account number used to surface negotiated rates. |
| Promo code | Text | `promoCode` | Promotional code that applies a discount or special rate to results. |

**Sort & Filter** (collapsed by default)

| Field | Type | URL Param | Tooltip |
|---|---|---|---|
| Sort by | Dropdown | `qSort` | Sets the default sort order for search results: Relevance, Price Low–High, Guest Rating. |
| Hotel class | Dropdown | `qRating` | Filters search results by star rating (1–5 stars). |

**Tracking** (collapsed by default)

| Field | Type | URL Param | Tooltip |
|---|---|---|---|
| Campaign ID | Text | `utm_campaign` | UTM campaign name for analytics — identifies the specific marketing campaign. |
| Source | Text | `utm_source` | UTM source — identifies where traffic originates (e.g. newsletter, google). |
| Medium | Text | `utm_medium` | UTM medium — the marketing channel type (e.g. email, cpc, social). |

**Deep Linking** (collapsed by default)

| Field | Type | URL Param | Tooltip |
|---|---|---|---|
| Deep link path | Text | `deepLink` | Internal app path used for channel-specific deep link routing. |
| Channel | Dropdown | `channel` | Specifies the marketing channel for deep link attribution (e.g. email, push, sms). |

### Search Tab — URL Pattern
```
https://www.ihg.com/hotels/us/en/find-hotels/hotel-search?path=search&brandCode={brand}&regionCode={region}&localeCode={locale}[&pmid=...][&glat=...][&qDest=...][&qChkIn=...][&qChkOut=...][&qRms=...][&utm_campaign=...]...
```

**Rule:** Only non-empty field values are appended to the URL.

---

## Brand Dropdown — Grouped Options

| Group | Brand | Code |
|---|---|---|
| Master Brand | IHG (All Brands) | `6c` |
| Luxury & Lifestyle | Six Senses | `sx` |
| | Regent | `rg` |
| | InterContinental | `ic` |
| | Vignette Collection | `vn` |
| | Kimpton | `ki` |
| | Hotel Indigo | `in` |
| | HUALUXE | `hl` |
| Premium | Crowne Plaza | `cp` |
| | EVEN Hotels | `ev` |
| | voco | `vc` |
| | Ruby | `rb` |
| Essentials | Holiday Inn | `hi` |
| | Holiday Inn Express | `ex` |
| | Holiday Inn Resort | `hr` |
| | Holiday Inn Club Vacations | `hv` |
| | Garner | `gn` |
| | avid hotels | `av` |
| Suites | Candlewood Suites | `cw` |
| | Staybridge Suites | `si` |
| | Atwell Suites | `as` |

---

## Save / History Flow

- **History:** Auto-logged every time user copies the URL or clicks Save URL. Stored with ISO timestamp. Max 50 entries (oldest pruned).
- **Save URL:** Opens `SaveModalComponent` — optional name text input. If blank, defaults to timestamp label (e.g. "Jun 9, 2026 2:34 PM"). Writes to `saved` collection in localStorage.
- **Drawer:** Slides in from right (400px wide), backdrop overlay. Two internal tabs: Saved / History.
- **SavedUrlCardComponent:** Shows name/label, truncated URL, copy button, delete button.

---

## Sticky URL Bar

- `position: sticky; top: 0; z-index: 100`
- Single line; if URL overflows, fade out with a CSS gradient mask on the right
- Full URL always copyable via the copy button regardless of truncation
- "..." button: opens a small popover with the full URL in a text area for manual selection
- Part 1 (base URL): white text
- Part 2 (query params): lighter/muted color
- Background: dark navy matching header

---

## Collapsible Sections

- Click anywhere on the section header row to toggle
- Chevron icon rotates 180° when expanded (CSS transition)
- Section header background: `#F5F5F5` when expanded, transparent when collapsed
- Content height animates open/closed
- "Core Environment Setup" expanded by default on both tabs
- "Itinerary Details" expanded by default on Search tab
- All other sections collapsed by default

---

## Form State Persistence (Tab Switching)

- `FormStateService` holds a form group per tab key (`home`, `search`)
- Switching tabs does not reset form values
- Clearing form resets only the active tab's values

---

## Design Tokens

```css
--color-navy: #1B2A4A;
--color-red: #C41230;
--color-bg-page: #F0F0F0;
--color-bg-card: #FFFFFF;
--color-bg-section-expanded: #F5F5F5;
--color-border: #D0D0D0;
--color-border-focus: #1B2A4A;
--color-border-error: #C41230;
--color-text-primary: #333333;
--color-text-muted: #666666;
--color-text-placeholder: #999999;
--color-text-on-dark: #FFFFFF;
--color-toggle-on: #C41230;
--color-toggle-off: #CCCCCC;
--radius-card: 8px;
--radius-field: 4px;
--field-height: 41px;
--font-stack: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

---

## Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop (>1024px) | 2–3 column CSS grid per field row, as designed |
| Tablet (768–1024px) | 2 column grid |
| Mobile (<768px) | Single column, full width |

---

## Field States

| State | Visual |
|---|---|
| Default | `--color-border` border, white background |
| Focus | `--color-border-focus` (navy) border, subtle box-shadow |
| Error | `--color-border-error` (red) border, red helper text below |
| Disabled | Gray background, 50% opacity |
| Filled | Normal border, dark text |

---

## Actions

- **Save URL** — red primary button, opens SaveModal
- **Clear Form** — outlined secondary button, resets active tab's form values
- **Copy** (URL bar) — copies full URL to clipboard, brief "Copied!" tooltip feedback
- **"..."** (URL bar) — opens popover with selectable full URL text
