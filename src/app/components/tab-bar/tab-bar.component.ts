import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabKey } from '../../models/url-builder.models';

interface Tab {
  key: TabKey;
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
  @Input() showAdded = true;
  @Output() tabChange = new EventEmitter<TabKey>();
  @Output() toggleAdded = new EventEmitter<void>();

  tabs: Tab[] = [
    { key: 'home', label: 'Home', disabled: false },
    { key: 'search', label: 'Search', disabled: false },
    { key: 'hd', label: 'Hotel details', disabled: false },
    { key: 'rates', label: 'CRR', disabled: false },
  ];

  selectTab(tab: Tab): void {
    if (!tab.disabled) {
      this.tabChange.emit(tab.key);
    }
  }

  onToggleAdded(): void {
    this.toggleAdded.emit();
  }
}
