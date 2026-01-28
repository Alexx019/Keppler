import { TestBed } from '@angular/core/testing';

import { Satellites } from './satellites';

describe('Satellites', () => {
  let service: Satellites;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Satellites);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
