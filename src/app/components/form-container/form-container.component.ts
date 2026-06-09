import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TabKey, BRAND_GROUPS, LANGUAGE_OPTIONS, COUNTRY_OPTIONS, SPECIAL_RATE_OPTIONS, SORT_OPTIONS, HOTEL_CLASS_OPTIONS, CHANNEL_OPTIONS } from '../../models/url-builder.models';
import { FormStateService } from '../../services/form-state.service';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';
import { TextFieldComponent } from '../fields/text-field/text-field.component';
import { SelectFieldComponent } from '../fields/select-field/select-field.component';
import { ToggleFieldComponent } from '../fields/toggle-field/toggle-field.component';
import { DateRangeFieldComponent } from '../fields/date-range-field/date-range-field.component';
import { NumberSpinnerFieldComponent } from '../fields/number-spinner-field/number-spinner-field.component';

@Component({
  selector: 'app-form-container',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CollapsibleSectionComponent,
    TextFieldComponent,
    SelectFieldComponent,
    ToggleFieldComponent,
    DateRangeFieldComponent,
    NumberSpinnerFieldComponent,
  ],
  templateUrl: './form-container.component.html',
  styleUrls: ['./form-container.component.css'],
})
export class FormContainerComponent implements OnInit, OnDestroy {
  @Input() activeTab: TabKey = 'home';
  @Output() formChanged = new EventEmitter<void>();

  form!: FormGroup;
  private sub!: Subscription;

  brandGroups = BRAND_GROUPS;
  languageOptions = LANGUAGE_OPTIONS;
  countryOptions = COUNTRY_OPTIONS;
  specialRateOptions = SPECIAL_RATE_OPTIONS;
  sortOptions = SORT_OPTIONS;
  hotelClassOptions = HOTEL_CLASS_OPTIONS;
  channelOptions = CHANNEL_OPTIONS;

  constructor(private formState: FormStateService) {}

  ngOnInit(): void {
    this.form = this.formState.getForm(this.activeTab);
    this.sub = this.form.valueChanges.subscribe(() => this.formChanged.emit());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get c(): { [key: string]: FormControl } {
    return this.form.controls as { [key: string]: FormControl };
  }

  get isSearch(): boolean {
    return this.activeTab === 'search';
  }

  reset(): void {
    this.formState.resetForm(this.activeTab);
  }
}
