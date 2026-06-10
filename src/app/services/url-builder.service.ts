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

    if (values.brandCode) params.set('brandCode', values.brandCode);
    if (values.language) {
      const { regionCode, localeCode } = LANGUAGE_MAP[values.language] ?? {};
      if (regionCode) params.set('regionCode', regionCode);
      if (localeCode) params.set('localeCode', localeCode);
    }

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
