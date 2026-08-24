import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TabKey, BRAND_GROUPS, LANGUAGE_OPTIONS, COUNTRY_OPTIONS, SPECIAL_RATE_OPTIONS, SORT_OPTIONS, CHANNEL_OPTIONS, CONTENT_TAB_OPTIONS } from '../../models/url-builder.models';
import { FormStateService } from '../../services/form-state.service';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';
import { TextFieldComponent } from '../fields/text-field/text-field.component';
import { SelectFieldComponent } from '../fields/select-field/select-field.component';
import { ToggleFieldComponent } from '../fields/toggle-field/toggle-field.component';
import { DateRangeFieldComponent } from '../fields/date-range-field/date-range-field.component';
import { NumberSpinnerFieldComponent } from '../fields/number-spinner-field/number-spinner-field.component';
import { RoomOccupancyComponent, RoomConfig } from '../room-occupancy/room-occupancy.component';

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
    RoomOccupancyComponent,
  ],
  templateUrl: './form-container.component.html',
  styleUrls: ['./form-container.component.css'],
})
export class FormContainerComponent implements OnChanges, OnDestroy {
  @Input() activeTab: TabKey = 'home';
  @Input() showAdded = true;
  @Output() formChanged = new EventEmitter<void>();
  @Output() roomConfigsChanged = new EventEmitter<RoomConfig[]>();

  form!: FormGroup;
  private sub!: Subscription;
  roomConfigs: RoomConfig[] = [];

  brandGroups = BRAND_GROUPS;
  languageOptions = LANGUAGE_OPTIONS;
  countryOptions = COUNTRY_OPTIONS;
  specialRateOptions = SPECIAL_RATE_OPTIONS;
  sortOptions = SORT_OPTIONS;
  channelOptions = CHANNEL_OPTIONS;
  contentTabOptions = CONTENT_TAB_OPTIONS;

  constructor(private formState: FormStateService) {}

  ngOnChanges(): void {
    this.sub?.unsubscribe();
    this.form = this.formState.getForm(this.activeTab);
    this.sub = this.form.valueChanges.subscribe(() => this.formChanged.emit());
    this.formChanged.emit();
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

  get showItinerary(): boolean {
    return this.activeTab !== 'home';
  }

  get showSortFilter(): boolean {
    return this.activeTab !== 'home';
  }

  get rateDetailsSubtitle(): string {
    if (this.activeTab === 'home') return 'Corporate and group codes';
    return 'Corporate, group, and promotional rates';
  }

  get itinerarySubtitle(): string {
    if (this.activeTab === 'search') return 'Destination, dates, and room count';
    if (this.activeTab === 'hd') return 'Dates, rooms, and hotel property';
    return 'Dates, rooms, and stay requirements';
  }

  /** Check if the current tab's form has a given field */
  hasField(name: string): boolean {
    return this.form.contains(name);
  }

  get roomCount(): number {
    if (!this.hasField('qRms')) return 0;
    const val = this.c['qRms']?.value;
    return typeof val === 'number' ? val : 0;
  }

  onRoomsChange(configs: RoomConfig[]): void {
    this.roomConfigs = configs;
    this.roomConfigsChanged.emit(configs);
    this.formChanged.emit();
  }

  onRoomRemoved(newCount: number): void {
    this.c['qRms'].setValue(newCount);
  }

  reset(): void {
    this.formState.resetForm(this.activeTab);
    this.roomConfigs = [];
  }
}
