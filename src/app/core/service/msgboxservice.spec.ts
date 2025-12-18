import { TestBed } from '@angular/core/testing';

import { Msgboxservice } from './msgboxservice';

describe('Msgboxservice', () => {
  let service: Msgboxservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Msgboxservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
