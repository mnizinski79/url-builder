export type TabKey = 'home' | 'search';

export interface SavedUrl {
  id: string;
  name: string;
  url: string;
  tab: TabKey;
  timestamp: string;
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
  language: string;
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
  { value: 'cn-zh', label: 'Chinese (simplified)' },
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
    groupLabel: 'Master brand',
    options: [{ value: '6c', label: 'IHG (all brands)' }],
  },
  {
    groupLabel: 'Luxury & lifestyle',
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
  { value: 'senior', label: 'Senior discount' },
  { value: 'govt', label: 'Government' },
  { value: 'military', label: 'Military' },
  { value: 'corp', label: 'Corporate' },
];

export const SORT_OPTIONS: SelectOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'guest_rating', label: 'Guest rating' },
];

export const HOTEL_CLASS_OPTIONS: SelectOption[] = [
  { value: '1', label: '1 star' },
  { value: '2', label: '2 stars' },
  { value: '3', label: '3 stars' },
  { value: '4', label: '4 stars' },
  { value: '5', label: '5 stars' },
];

export const CHANNEL_OPTIONS: SelectOption[] = [
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push notification' },
  { value: 'sms', label: 'SMS' },
  { value: 'social', label: 'Social media' },
  { value: 'display', label: 'Display ad' },
];
