import { TestBed } from '@angular/core/testing';

import { EnvironmentProduction } from './environment.production';

describe('EnvironmentProduction', () => {
  let service: EnvironmentProduction;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvironmentProduction);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
