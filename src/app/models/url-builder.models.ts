export type TabKey = 'home' | 'search' | 'hd' | 'rates';

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
  corpNum: string;
  groupCode: string;
}

export interface SearchFormValues extends HomeFormValues {
  qDest: string;
  qCity: string;
  qCtry: string;
  qChkIn: string;
  qChkOut: string;
  eligibleStayStartDate: string;
  eligibleStayEndDate: string;
  minBookingWindow: number | null;
  minNights: number | null;
  qRms: number;
  qRateCode: string;
  promoCode: string;
  hotelCode: string;
  contentTab: string;
  qSort: string;
  utmCampaign: string;
  utmSource: string;
  utmMedium: string;
  deepLink: string;
  channel: string;
}

export interface HdFormValues extends HomeFormValues {
  qChkIn: string;
  qChkOut: string;
  qRms: number;
  hotelCode: string;
  contentTab: string;
}

export interface RatesFormValues extends HomeFormValues {
  qChkIn: string;
  qChkOut: string;
  eligibleStayStartDate: string;
  eligibleStayEndDate: string;
  minBookingWindow: number | null;
  minNights: number | null;
  qRms: number;
  hotelCode: string;
}

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'ar', label: 'Arabic' },
  { value: 'de', label: 'German' },
  { value: 'gb', label: 'Queens English' },
  { value: 'en', label: 'US English' },
  { value: 'es-eu', label: 'Castilian Spanish' },
  { value: 'es-la', label: 'Spanish Latin America' },
  { value: 'fr', label: 'French' },
  { value: 'id', label: 'Indonesian' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'nl', label: 'Dutch' },
  { value: 'pl', label: 'Polish' },
  { value: 'pt-br', label: 'Brazilian Portuguese' },
  { value: 'pt-pt', label: 'Portugal Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'th', label: 'Thai' },
  { value: 'tr', label: 'Turkish' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'cn', label: 'Simplified Chinese' },
  { value: 'tw', label: 'Traditional Chinese' },
];

export const LANGUAGE_MAP: Record<string, { regionCode: string; localeCode: string }> = {
  'ar': { regionCode: '2', localeCode: 'ar' },
  'de': { regionCode: '6', localeCode: 'de' },
  'gb': { regionCode: '3', localeCode: 'gb' },
  'en': { regionCode: '1', localeCode: 'en' },
  'es-eu': { regionCode: '6', localeCode: 'es' },
  'es-la': { regionCode: '1', localeCode: 'es' },
  'fr': { regionCode: '6', localeCode: 'fr' },
  'id': { regionCode: '2', localeCode: 'id' },
  'it': { regionCode: '6', localeCode: 'it' },
  'ja': { regionCode: '2', localeCode: 'ja' },
  'ko': { regionCode: '2', localeCode: 'ko' },
  'nl': { regionCode: '6', localeCode: 'nl' },
  'pl': { regionCode: '6', localeCode: 'pl' },
  'pt-br': { regionCode: '1', localeCode: 'pt' },
  'pt-pt': { regionCode: '6', localeCode: 'pt' },
  'ru': { regionCode: '6', localeCode: 'ru' },
  'th': { regionCode: '2', localeCode: 'th' },
  'tr': { regionCode: '2', localeCode: 'tr' },
  'vi': { regionCode: '2', localeCode: 'vi' },
  'cn': { regionCode: '2', localeCode: 'cn' },
  'tw': { regionCode: '2', localeCode: 'tw' },
};

export const BRAND_GROUPS: SelectGroup[] = [
  {
    groupLabel: 'Master brand',
    options: [{ value: '6C', label: 'InterContinental Group (All Brands)' }],
  },
  {
    groupLabel: 'Luxury & lifestyle',
    options: [
      { value: 'SX', label: 'Six Senses' },
      { value: 'RE', label: 'Regent Hotels' },
      { value: 'IC', label: 'InterContinental' },
      { value: 'LX', label: 'Vignette Collection' },
      { value: 'FA', label: 'Noted Collection' },
      { value: 'KI', label: 'Kimpton' },
      { value: 'KD', label: 'Kimpton Club' },
      { value: 'IN', label: 'Hotel Indigo' },
      { value: 'UL', label: 'HUALUXE' },
    ],
  },
  {
    groupLabel: 'Premium',
    options: [
      { value: 'CP', label: 'Crowne Plaza' },
      { value: 'VN', label: 'EVEN Hotels' },
      { value: 'vx', label: 'Voco' },
      { value: 'GE', label: 'Ruby' },
      { value: 'NU', label: 'Holidayinn the niu' },
    ],
  },
  {
    groupLabel: 'Essentials',
    options: [
      { value: 'HI', label: 'Holiday Inn' },
      { value: 'EX', label: 'Holiday Inn Express' },
      { value: 'RS', label: 'Holiday Inn Resort' },
      { value: 'CV', label: 'Holiday Inn Club Vacations' },
      { value: 'RN', label: 'Garner' },
      { value: 'va', label: 'Avid Hotels' },
      { value: 'ND', label: 'ND Brand' },
    ],
  },
  {
    groupLabel: 'Suites',
    options: [
      { value: 'CW', label: 'Candlewood Suites' },
      { value: 'SB', label: 'Staybridge Suites' },
      { value: 'WE', label: 'Atwell Suites' },
    ],
  },
  {
    groupLabel: 'Iberostar',
    options: [
      { value: 'SN', label: 'Iberostar' },
      { value: 'IB', label: 'Iberostar Beachfront Resorts' },
      { value: 'GR', label: 'Iberostar Grand' },
      { value: 'SE', label: 'Iberostar Selection' },
      { value: 'CO', label: 'Iberostar Coral' },
    ],
  },
  {
    groupLabel: 'Other',
    options: [
      { value: 'MA', label: 'Army Hotels' },
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

export const CONTENT_TAB_OPTIONS: SelectOption[] = [
  { value: 'hd', label: 'Hotel Detail' },
  { value: 'amenities', label: 'Amenities' },
];
