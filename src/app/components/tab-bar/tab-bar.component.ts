import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabKey } from '../../models/url-builder.models';

interface Tab {
  key: TabKey | null;
  label: string;
  disabled: boolean;
}

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.css'],
})
export class TabBarComponent {
  @Input() activeTab: TabKey = 'home';
  @Output() tabChange = new EventEmitter<TabKey>();

  tabs: Tab[] = [
    { key: 'home', label: 'Home', disabled: false },
    { key: 'search', label: 'Search', disabled: false },
    { key: null, label: 'Hotel Details', disabled: true },
    { key: null, label: 'CRR', disabled: true },
  ];

  selectTab(tab: Tab): void {
    if (!tab.disabled && tab.key) {
      this.tabChange.emit(tab.key);
    }
  }
}
