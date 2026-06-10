import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TabKey } from '../models/url-builder.models';

const SHARED_FIELDS = [
  'brandCode', 'language', 'pmid', 'glat', 'rateCode',
  'domainPersistence', 'chinaDomain',
] as const;

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

  /** Copy shared field values from one tab's form into the other, without triggering valueChanges. */
  syncSharedFields(from: TabKey, to: TabKey): void {
    const source = this.forms[from].value;
    const patch: Record<string, unknown> = {};
    for (const field of SHARED_FIELDS) {
      patch[field] = source[field];
    }
    this.forms[to].patchValue(patch, { emitEvent: false });
  }

  resetForm(tab: TabKey): void {
    this.forms[tab].reset(this.getDefaults(tab));
  }

  private getDefaults(tab: TabKey) {
    const shared = { brandCode: '', language: '', pmid: '', glat: '', rateCode: '', domainPersistence: false, chinaDomain: false };
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
      brandCode: [''], language: [''], pmid: [''], glat: [''],
      rateCode: [''], domainPersistence: [false], chinaDomain: [false],
    });
  }

  private buildSearchForm(): FormGroup {
    return this.fb.group({
      brandCode: [''], language: [''], pmid: [''], glat: [''],
      rateCode: [''], domainPersistence: [false], chinaDomain: [false],
      qDest: [''], qCity: [''], qCtry: [''], qChkIn: [''], qChkOut: [''],
      qRms: [1], qRateCode: [''], corpNum: [''], promoCode: [''], qSort: [''],
      qRating: [''], utmCampaign: [''], utmSource: [''], utmMedium: [''],
      deepLink: [''], channel: [''],
    });
  }
}
