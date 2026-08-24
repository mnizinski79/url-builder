export interface FieldGuideEntry {
  label: string;
  param: string;
  visibility: string;
  description: string;
  added?: boolean;
}

export const FIELD_GUIDE: FieldGuideEntry[] = [
  // Core environment setup (all tabs)
  { label: 'Brand', param: 'brandCode', visibility: 'All tabs', description: 'Sets the IHG brand code to target in the URL (e.g. CP for Crowne Plaza).' },
  { label: 'Language', param: 'regionCode & localeCode', visibility: 'All tabs', description: 'Splits into regionCode and localeCode params to set the page language and region.' },
  { label: 'PMID', param: '_PMID', visibility: 'All tabs', description: 'Performance Marketing ID — identifies the campaign traffic source.' },
  { label: 'Global attribution (GLAT)', param: 'glat', visibility: 'All tabs', description: 'Global attribution tracking code for cross-channel attribution.' },
  { label: 'Rate code', param: 'rateCode', visibility: 'All tabs', description: 'Pre-selects a specific rate plan code on the landing page.' },
  { label: 'Domain persistence', param: 'dp', visibility: 'All tabs', description: 'When enabled, adds dp=true to allow tracking cookies across IHG domains.' },
  { label: 'China domain', param: 'cn', visibility: 'All tabs', description: 'When enabled, adds cn=true to route traffic through IHG\'s China-specific domain.' },

  // Rate details (all tabs)
  { label: 'Corporate number', param: 'corporateNumber', visibility: 'All tabs', description: 'Corporate account ID used to surface negotiated rates.' },
  { label: 'Group code', param: 'GPC', visibility: 'All tabs', description: 'Group booking code for accessing group rates.' },

  // Itinerary — Search only
  { label: 'Destination', param: 'destination', visibility: 'Search', description: 'Pre-populates the destination field in hotel search results.' },
  { label: 'City', param: 'city', visibility: 'Search', description: 'City code used to narrow hotel search results.' },
  { label: 'Country', param: 'countryCode', visibility: 'Search', description: 'Country filter code applied to hotel search results.' },

  // Dates — Search, Hotel Detail, CRR
  { label: 'Check-in / Check-out', param: 'checkInMonthYear, checkInDate, checkOutMonthYear, checkOutDate', visibility: 'Search, Hotel Detail, CRR', description: 'Dates split into zero-indexed month+year (MMYYYY) and day params for check-in and check-out.' },
  { label: 'Eligible stay dates', param: 'eligibleStayStartDate, eligibleStayEndDate', visibility: 'Search, CRR', description: 'Defines the promotion stay window start and end dates.' },
  { label: 'Min booking window', param: 'minBookingWindow', visibility: 'Search, CRR', description: 'Minimum number of days in advance the booking must be made.' },
  { label: 'Min nights', param: 'minNights', visibility: 'Search, CRR', description: 'Minimum length of stay required for the promotion.' },

  // Rooms & occupancy
  { label: 'Rooms', param: 'numberOfRooms', visibility: 'Search, Hotel Detail, CRR', description: 'Number of rooms. Drives room occupancy cards below.' },
  { label: 'Adults (per room)', param: 'numberOfAdults', visibility: 'Search, Hotel Detail, CRR', description: 'Comma-separated adults per room (e.g. 1,2 for 2 rooms).' },
  { label: 'Children (per room)', param: 'numberOfChildren', visibility: 'Search, Hotel Detail, CRR', description: 'Comma-separated children per room (e.g. 0,1 for 2 rooms).' },
  { label: 'Child ages', param: 'agesOfChildren', visibility: 'Search, Hotel Detail, CRR', description: 'Dot-separated ages within a room, comma-separated between rooms. Empty segment for rooms with no children (e.g. ,4.6).' },

  // Sort & filter
  { label: 'Hotel code', param: 'hotelCode', visibility: 'Search, Hotel Detail, CRR', description: 'Target hotel property code to filter results to a specific hotel.' },
  { label: 'Content tab', param: '(modifies path)', visibility: 'Hotel Detail', description: 'Changes the path value (e.g. path=hd-amenities) instead of adding a query param.' },

  // Added fields
  { label: 'Special rate', param: 'rateCode', visibility: 'Search', description: 'Pre-selects a special rate category (AAA, Senior, Government, etc.).', added: true },
  { label: 'Promo code', param: 'promoCode', visibility: 'Search', description: 'Promotional code that applies a discount or special rate to results.', added: true },
  { label: 'Sort by', param: 'qSort', visibility: 'Search', description: 'Sets the default sort order for search results.', added: true },
  { label: 'Campaign ID', param: 'utm_campaign', visibility: 'All tabs', description: 'UTM campaign name — identifies the specific marketing campaign.', added: true },
  { label: 'Source', param: 'utm_source', visibility: 'All tabs', description: 'UTM source — identifies where traffic originates (e.g. newsletter, google).', added: true },
  { label: 'Medium', param: 'utm_medium', visibility: 'All tabs', description: 'UTM medium — the marketing channel type (e.g. email, cpc, social).', added: true },
  { label: 'Deep link path', param: 'deepLink', visibility: 'All tabs', description: 'Internal app path used for channel-specific deep link routing.', added: true },
  { label: 'Channel', param: 'channel', visibility: 'All tabs', description: 'Marketing channel for deep link attribution (e.g. email, push, sms).', added: true },
];
