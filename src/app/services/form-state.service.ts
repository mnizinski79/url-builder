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
      brandCode: ['6c'], language: ['us-en'], pmid: [''], glat: [''],
      rateCode: [''], domainPersistence: [false], chinaDomain: [false],
    });
  }

  private buildSearchForm(): FormGroup {
    return this.fb.group({
      brandCode: ['6c'], language: ['us-en'], pmid: [''], glat: [''],
      rateCode: [''], domainPersistence: [false], chinaDomain: [false],
      qDest: [''], qCity: [''], qCtry: [''], qChkIn: [''], qChkOut: [''],
      qRms: [1], qRateCode: [''], corpNum: [''], promoCode: [''], qSort: [''],
      qRating: [''], utmCampaign: [''], utmSource: [''], utmMedium: [''],
      deepLink: [''], channel: [''],
    });
  }
}
