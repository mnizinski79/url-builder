import { TestBed } from '@angular/core/testing';
import { FormStateService } from './form-state.service';
import { ReactiveFormsModule } from '@angular/forms';

describe('FormStateService', () => {
  let service: FormStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ReactiveFormsModule] });
    service = TestBed.inject(FormStateService);
  });

  it('should provide a home form group', () => {
    const form = service.getForm('home');
    expect(form).toBeTruthy();
    expect(form.get('brandCode')).toBeTruthy();
  });

  it('should provide a search form group', () => {
    const form = service.getForm('search');
    expect(form).toBeTruthy();
    expect(form.get('qDest')).toBeTruthy();
  });

  it('should preserve home form values when switching to search and back', () => {
    service.getForm('home').patchValue({ pmid: 'ABCD' });
    service.getForm('search').patchValue({ qDest: 'Paris' });
    expect(service.getForm('home').value.pmid).toBe('ABCD');
    expect(service.getForm('search').value.qDest).toBe('Paris');
  });

  it('should reset only the specified tab form', () => {
    service.getForm('home').patchValue({ pmid: 'ABCD' });
    service.resetForm('home');
    expect(service.getForm('home').value.pmid).toBe('');
  });

  it('should return default brandCode of 6c', () => {
    expect(service.getForm('home').value.brandCode).toBe('6c');
  });

  it('should return default language of us-en', () => {
    expect(service.getForm('home').value.language).toBe('us-en');
  });
});
