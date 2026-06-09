import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabKey, SavedUrl } from './models/url-builder.models';
import { FormStateService } from './services/form-state.service';
import { UrlBuilderService } from './services/url-builder.service';
import { StorageService } from './services/storage.service';
import { HeaderComponent } from './components/header/header.component';
import { UrlBarComponent } from './components/url-bar/url-bar.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { FormContainerComponent } from './components/form-container/form-container.component';
import { SaveModalComponent } from './components/save-modal/save-modal.component';
import { DrawerComponent } from './components/drawer/drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    UrlBarComponent,
    TabBarComponent,
    FormContainerComponent,
    SaveModalComponent,
    DrawerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  activeTab: TabKey = 'home';
  currentUrl = '';
  showSaveModal = false;
  drawerOpen = false;
  drawerTab: 'saved' | 'history' = 'saved';

  constructor(
    private formState: FormStateService,
    private urlBuilder: UrlBuilderService,
    private storage: StorageService,
  ) {}

  ngOnInit(): void {
    this.rebuildUrl();
  }

  onTabChange(tab: TabKey): void {
    this.activeTab = tab;
    this.rebuildUrl();
  }

  onFormChanged(): void {
    this.rebuildUrl();
  }

  rebuildUrl(): void {
    const values = this.formState.getForm(this.activeTab).value;
    this.currentUrl = this.urlBuilder.buildUrl(this.activeTab, values);
  }

  onCopy(): void {
    const timestamp = new Date().toISOString();
    const entry: SavedUrl = {
      id: this.storage.generateId(),
      name: this.storage.formatTimestampLabel(timestamp),
      url: this.currentUrl,
      tab: this.activeTab,
      timestamp,
      isNamed: false,
    };
    this.storage.addToHistory(entry);
  }

  openSaveModal(): void {
    this.showSaveModal = true;
  }

  onSaved(name: string | null): void {
    const timestamp = new Date().toISOString();
    const label = name || this.storage.formatTimestampLabel(timestamp);
    const entry: SavedUrl = {
      id: this.storage.generateId(),
      name: label,
      url: this.currentUrl,
      tab: this.activeTab,
      timestamp,
      isNamed: !!name,
    };
    this.storage.saveUrl(entry);
    this.storage.addToHistory({ ...entry, id: this.storage.generateId() });
    this.showSaveModal = false;
  }

  onSaveCancelled(): void {
    this.showSaveModal = false;
  }

  openSaved(): void {
    this.drawerTab = 'saved';
    this.drawerOpen = true;
  }

  openHistory(): void {
    this.drawerTab = 'history';
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
  }
}
