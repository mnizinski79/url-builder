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
        brandCode: '6c', language: 'us-en', pmid: '', glat: '',
        rateCode: '', domainPersistence: false, chinaDomain: false,
      });
      expect(url).toBe('https://www.ihg.com/redirect?path=home&brandCode=6c&regionCode=us&localeCode=en');
    });

    it('should append optional params when filled', () => {
      const url = service.buildUrl('home', {
        brandCode: 'ic', language: 'us-en', pmid: 'ABCD', glat: 'TEST',
        rateCode: '', domainPersistence: false, chinaDomain: false,
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
      const url = service.buildUrl('search', { ...base, qChkIn: '2026-08-01', qChkOut: '2026-08-05' });
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
      const url = service.buildUrl('search', { ...base, utmCampaign: 'summer', utmSource: 'email', utmMedium: 'cpc' });
      expect(url).toContain('utm_campaign=summer');
      expect(url).toContain('utm_source=email');
      expect(url).toContain('utm_medium=cpc');
    });
  });
});
