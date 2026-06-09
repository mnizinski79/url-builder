import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { SavedUrl } from '../models/url-builder.models';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should return empty arrays when storage is empty', () => {
    expect(service.getSavedUrls()).toEqual([]);
    expect(service.getHistory()).toEqual([]);
  });

  it('should save a URL and retrieve it', () => {
    const url: SavedUrl = {
      id: '1', name: 'Test URL',
      url: 'https://www.ihg.com/redirect?path=home',
      tab: 'home', timestamp: new Date().toISOString(), isNamed: true,
    };
    service.saveUrl(url);
    expect(service.getSavedUrls()).toEqual([url]);
  });

  it('should add to history and cap at 50 entries', () => {
    for (let i = 0; i < 55; i++) {
      service.addToHistory({
        id: String(i), name: `Entry ${i}`,
        url: `https://example.com?i=${i}`, tab: 'home',
        timestamp: new Date().toISOString(), isNamed: false,
      });
    }
    expect(service.getHistory().length).toBe(50);
  });

  it('should delete a saved URL by id', () => {
    const url: SavedUrl = {
      id: 'abc', name: 'To delete', url: 'https://example.com',
      tab: 'home', timestamp: new Date().toISOString(), isNamed: true,
    };
    service.saveUrl(url);
    service.deleteSavedUrl('abc');
    expect(service.getSavedUrls()).toEqual([]);
  });

  it('should delete a history entry by id', () => {
    const entry: SavedUrl = {
      id: 'h1', name: 'History 1', url: 'https://example.com',
      tab: 'search', timestamp: new Date().toISOString(), isNamed: false,
    };
    service.addToHistory(entry);
    service.deleteHistoryEntry('h1');
    expect(service.getHistory()).toEqual([]);
  });

  it('should generate unique ids', () => {
    const id1 = service.generateId();
    const id2 = service.generateId();
    expect(id1).not.toBe(id2);
  });

  it('should format a timestamp label', () => {
    const iso = '2026-06-09T14:34:00.000Z';
    const label = service.formatTimestampLabel(iso);
    expect(label).toContain('2026');
  });
});
