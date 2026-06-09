import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedUrl } from '../../models/url-builder.models';
import { StorageService } from '../../services/storage.service';
import { SavedUrlCardComponent } from '../saved-url-card/saved-url-card.component';
import { PhIconComponent } from '../ph-icon/ph-icon.component';

type DrawerTab = 'saved' | 'history';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, SavedUrlCardComponent, PhIconComponent],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.css'],
})
export class DrawerComponent implements OnChanges {
  @Input() open = false;
  @Input() initialTab: DrawerTab = 'saved';
  @Output() closed = new EventEmitter<void>();

  activeTab: DrawerTab = 'saved';
  savedUrls: SavedUrl[] = [];
  history: SavedUrl[] = [];

  constructor(private storage: StorageService) {}

  ngOnChanges(): void {
    if (this.open) {
      this.activeTab = this.initialTab;
      this.load();
    }
  }

  load(): void {
    this.savedUrls = this.storage.getSavedUrls();
    this.history = this.storage.getHistory();
  }

  deleteSaved(id: string): void {
    this.storage.deleteSavedUrl(id);
    this.savedUrls = this.storage.getSavedUrls();
  }

  deleteHistory(id: string): void {
    this.storage.deleteHistoryEntry(id);
    this.history = this.storage.getHistory();
  }

  close(): void {
    this.closed.emit();
  }
}
