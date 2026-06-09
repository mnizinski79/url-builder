import { Injectable } from '@angular/core';
import { SavedUrl } from '../models/url-builder.models';

const SAVED_KEY = 'ub_saved_urls';
const HISTORY_KEY = 'ub_history';
const MAX_HISTORY = 50;

@Injectable({ providedIn: 'root' })
export class StorageService {

  getSavedUrls(): SavedUrl[] {
    return this.read(SAVED_KEY);
  }

  getHistory(): SavedUrl[] {
    return this.read(HISTORY_KEY);
  }

  saveUrl(entry: SavedUrl): void {
    const saved = this.getSavedUrls();
    saved.unshift(entry);
    this.write(SAVED_KEY, saved);
  }

  addToHistory(entry: SavedUrl): void {
    const history = this.getHistory();
    history.unshift(entry);
    this.write(HISTORY_KEY, history.slice(0, MAX_HISTORY));
  }

  deleteSavedUrl(id: string): void {
    this.write(SAVED_KEY, this.getSavedUrls().filter(u => u.id !== id));
  }

  deleteHistoryEntry(id: string): void {
    this.write(HISTORY_KEY, this.getHistory().filter(u => u.id !== id));
  }

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  formatTimestampLabel(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }

  private read(key: string): SavedUrl[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private write(key: string, data: SavedUrl[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}
