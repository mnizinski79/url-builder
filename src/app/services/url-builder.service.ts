import { Injectable } from '@angular/core';
import { TabKey, HomeFormValues, SearchFormValues, HdFormValues, RatesFormValues, LANGUAGE_MAP } from '../models/url-builder.models';
import { RoomConfig } from '../components/room-occupancy/room-occupancy.component';

const PATH_VALUES: Record<TabKey, string> = {
  home: 'home',
  search: 'hotelsearchresults',
  hd: 'hd',
  rates: 'rates',
};

const BASE_URL = 'https://www.ihg.com/redirect';

type AnyFormValues = HomeFormValues | SearchFormValues | HdFormValues | RatesFormValues;

@Injectable({ providedIn: 'root' })
export class UrlBuilderService {

  buildUrl(tab: TabKey, values: AnyFormValues, roomConfigs: RoomConfig[] = []): string {
    const params = new URLSearchParams();

    // Build path — contentTab modifies the path for hd tab
    let path = PATH_VALUES[tab];
    if (tab === 'hd') {
      const hv = values as HdFormValues;
      if (hv.contentTab && hv.contentTab !== 'hd') {
        path = `hd-${hv.contentTab}`;
      }
    }
    params.set('path', path);

    // Shared fields (all tabs)
    if (values.brandCode) params.set('brandCode', values.brandCode);
    if (values.language) {
      const mapped = LANGUAGE_MAP[values.language];
      if (mapped) {
        params.set('regionCode', mapped.regionCode);
        params.set('localeCode', mapped.localeCode);
      }
    }

    this.appendIfFilled(params, '_PMID', values.pmid);
    this.appendIfFilled(params, 'glat', values.glat);
    this.appendIfFilled(params, 'rateCode', values.rateCode);
    if (values.domainPersistence) params.set('dp', 'true');
    if (values.chinaDomain) params.set('cn', 'true');
    this.appendIfFilled(params, 'corporateNumber', values.corpNum);
    this.appendIfFilled(params, 'GPC', values.groupCode);

    // "Added" fields (all tabs — UTM tracking & deep linking)
    this.appendIfFilled(params, 'utm_campaign', (values as any).utmCampaign);
    this.appendIfFilled(params, 'utm_source', (values as any).utmSource);
    this.appendIfFilled(params, 'utm_medium', (values as any).utmMedium);
    this.appendIfFilled(params, 'deepLink', (values as any).deepLink);
    this.appendIfFilled(params, 'channel', (values as any).channel);

    // Tab-specific fields
    if (tab === 'search') {
      const sv = values as SearchFormValues;
      this.appendIfFilled(params, 'destination', sv.qDest);
      this.appendIfFilled(params, 'city', sv.qCity);
      this.appendIfFilled(params, 'countryCode', sv.qCtry);
      this.appendDateParams(params, sv.qChkIn, sv.qChkOut);
      this.appendIfFilled(params, 'eligibleStayStartDate', sv.eligibleStayStartDate);
      this.appendIfFilled(params, 'eligibleStayEndDate', sv.eligibleStayEndDate);
      if (sv.minBookingWindow != null && sv.minBookingWindow > 0) params.set('minBookingWindow', String(sv.minBookingWindow));
      if (sv.minNights != null && sv.minNights > 1) params.set('minNights', String(sv.minNights));
      this.appendIfFilled(params, 'rateCode', sv.qRateCode);
      this.appendIfFilled(params, 'promoCode', sv.promoCode);
      this.appendIfFilled(params, 'hotelCode', sv.hotelCode);
      this.appendIfFilled(params, 'qSort', sv.qSort);
    }

    if (tab === 'hd') {
      const hv = values as HdFormValues;
      this.appendDateParams(params, hv.qChkIn, hv.qChkOut);
      this.appendIfFilled(params, 'hotelCode', hv.hotelCode);
    }

    if (tab === 'rates') {
      const rv = values as RatesFormValues;
      this.appendDateParams(params, rv.qChkIn, rv.qChkOut);
      this.appendIfFilled(params, 'eligibleStayStartDate', rv.eligibleStayStartDate);
      this.appendIfFilled(params, 'eligibleStayEndDate', rv.eligibleStayEndDate);
      if (rv.minBookingWindow != null && rv.minBookingWindow > 0) params.set('minBookingWindow', String(rv.minBookingWindow));
      if (rv.minNights != null && rv.minNights > 1) params.set('minNights', String(rv.minNights));
      this.appendIfFilled(params, 'hotelCode', rv.hotelCode);
    }

    // Room occupancy (all tabs that have rooms)
    const roomCount = (values as any).qRms ?? 0;
    if (tab !== 'home' && roomCount > 0 && roomConfigs.length > 0) {
      params.set('numberOfRooms', String(roomCount));
      const adults = roomConfigs.map(r => r.adults).join(',');
      const children = roomConfigs.map(r => r.children).join(',');
      params.set('numberOfAdults', adults);
      params.set('numberOfChildren', children);

      // Child ages: comma-separated between rooms, dot-separated within a room
      // Empty segment for rooms with no children (e.g. ",4" means room 1 has none, room 2 has age 4)
      const hasAnyChildren = roomConfigs.some(r => r.children > 0);
      if (hasAnyChildren) {
        const ageSegments = roomConfigs.map(r =>
          r.childAges.map(a => String(a)).join('.')
        );
        params.set('agesOfChildren', ageSegments.join(','));
      }
    }

    // Build final URL, then unescape commas and dots that URLSearchParams encodes
    return `${BASE_URL}?${params.toString().replace(/%2C/g, ',').replace(/%2E/g, '.')}`;
  }

  /**
   * Append IHG date params: checkInMonthYear, checkInDate, checkOutMonthYear, checkOutDate.
   * Month is zero-indexed (January = 00), zero-padded. Format: MMYYYY for monthYear, DD for date.
   */
  private appendDateParams(params: URLSearchParams, checkIn: string | undefined, checkOut: string | undefined): void {
    if (checkIn && checkIn.trim()) {
      const inDate = new Date(checkIn + 'T00:00:00');
      if (!isNaN(inDate.getTime())) {
        const inMonth = String(inDate.getMonth()).padStart(2, '0'); // zero-indexed
        const inYear = String(inDate.getFullYear());
        const inDay = String(inDate.getDate());
        params.set('checkInMonthYear', inMonth + inYear);
        params.set('checkInDate', inDay);
      }
    }
    if (checkOut && checkOut.trim()) {
      const outDate = new Date(checkOut + 'T00:00:00');
      if (!isNaN(outDate.getTime())) {
        const outMonth = String(outDate.getMonth()).padStart(2, '0'); // zero-indexed
        const outYear = String(outDate.getFullYear());
        const outDay = String(outDate.getDate());
        params.set('checkOutMonthYear', outMonth + outYear);
        params.set('checkOutDate', outDay);
      }
    }
  }

  private appendIfFilled(params: URLSearchParams, key: string, value: string | undefined): void {
    if (value && value.trim().length > 0) {
      params.set(key, value.trim());
    }
  }
}
