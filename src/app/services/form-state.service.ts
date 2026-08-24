import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TabKey } from '../models/url-builder.models';

const SHARED_FIELDS = [
  'brandCode', 'language', 'pmid', 'glat', 'rateCode',
  'domainPersistence', 'chinaDomain', 'corpNum', 'groupCode',
] as const;

/** "Added" fields that appear on all tabs when the toggle is on */
const ADDED_FIELDS = {
  utmCampaign: '', utmSource: '', utmMedium: '',
  deepLink: '', channel: '',
};

@Injectable({ providedIn: 'root' })
export class FormStateService {
  private forms: Record<TabKey, FormGroup>;

  constructor(private fb: FormBuilder) {
    this.forms = {
      home: this.buildHomeForm(),
      search: this.buildSearchForm(),
      hd: this.buildHdForm(),
      rates: this.buildRatesForm(),
    };
  }

  getForm(tab: TabKey): FormGroup {
    return this.forms[tab];
  }

  /** Copy shared field values from one tab's form into another, without triggering valueChanges. */
  syncSharedFields(from: TabKey, to: TabKey): void {
    const source = this.forms[from].value;
    const patch: Record<string, unknown> = {};
    for (const field of SHARED_FIELDS) {
      if (source[field] !== undefined) {
        patch[field] = source[field];
      }
    }
    this.forms[to].patchValue(patch, { emitEvent: false });
  }

  resetForm(tab: TabKey): void {
    this.forms[tab].reset(this.getDefaults(tab));
  }

  private getDefaults(tab: TabKey) {
    const shared = {
      brandCode: '', language: '', pmid: '', glat: '', rateCode: '',
      domainPersistence: false, chinaDomain: false,
      corpNum: '', groupCode: '',
      ...ADDED_FIELDS,
    };
    if (tab === 'home') return shared;
    if (tab === 'hd') return {
      ...shared,
      qChkIn: '', qChkOut: '', qRms: 0,
      hotelCode: '', contentTab: '',
    };
    if (tab === 'rates') return {
      ...shared,
      qChkIn: '', qChkOut: '',
      eligibleStayStartDate: '', eligibleStayEndDate: '',
      minBookingWindow: null, minNights: null,
      qRms: 0, hotelCode: '',
    };
    // search
    return {
      ...shared,
      qDest: '', qCity: '', qCtry: '', qChkIn: '', qChkOut: '',
      eligibleStayStartDate: '', eligibleStayEndDate: '',
      minBookingWindow: null, minNights: null,
      qRms: 0, qRateCode: '', promoCode: '',
      hotelCode: '', contentTab: '', qSort: '',
    };
  }

  private buildHomeForm(): FormGroup {
    return this.fb.group({
      brandCode: [''], language: [''], pmid: [''], glat: [''],
      rateCode: [''], domainPersistence: [false], chinaDomain: [false],
      corpNum: [''], groupCode: [''],
      utmCampaign: [''], utmSource: [''], utmMedium: [''],
      deepLink: [''], channel: [''],
    });
  }

  private buildSearchForm(): FormGroup {
    return this.fb.group({
      brandCode: [''], language: [''], pmid: [''], glat: [''],
      rateCode: [''], domainPersistence: [false], chinaDomain: [false],
      corpNum: [''], groupCode: [''],
      qDest: [''], qCity: [''], qCtry: [''], qChkIn: [''], qChkOut: [''],
      eligibleStayStartDate: [''], eligibleStayEndDate: [''],
      minBookingWindow: [null], minNights: [null],
      qRms: [0], qRateCode: [''], promoCode: [''],
      hotelCode: [''], contentTab: [''], qSort: [''],
      utmCampaign: [''], utmSource: [''], utmMedium: [''],
      deepLink: [''], channel: [''],
    });
  }

  private buildHdForm(): FormGroup {
    return this.fb.group({
      brandCode: [''], language: [''], pmid: [''], glat: [''],
      rateCode: [''], domainPersistence: [false], chinaDomain: [false],
      corpNum: [''], groupCode: [''],
      qChkIn: [''], qChkOut: [''], qRms: [0],
      hotelCode: [''], contentTab: [''],
      utmCampaign: [''], utmSource: [''], utmMedium: [''],
      deepLink: [''], channel: [''],
    });
  }

  private buildRatesForm(): FormGroup {
    return this.fb.group({
      brandCode: [''], language: [''], pmid: [''], glat: [''],
      rateCode: [''], domainPersistence: [false], chinaDomain: [false],
      corpNum: [''], groupCode: [''],
      qChkIn: [''], qChkOut: [''],
      eligibleStayStartDate: [''], eligibleStayEndDate: [''],
      minBookingWindow: [null], minNights: [null],
      qRms: [0], hotelCode: [''],
      utmCampaign: [''], utmSource: [''], utmMedium: [''],
      deepLink: [''], channel: [''],
    });
  }
}
