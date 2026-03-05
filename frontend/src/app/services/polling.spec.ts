import { TestBed } from '@angular/core/testing';

import { Polling } from './polling';

describe('Polling', () => {
  let service: Polling;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Polling);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
