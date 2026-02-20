import { TestBed } from '@angular/core/testing';

import { Addcustomerservice } from './addcustomerservice';

describe('Addcustomerservice', () => {
  let service: Addcustomerservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Addcustomerservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
