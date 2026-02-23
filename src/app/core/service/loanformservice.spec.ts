import { TestBed } from '@angular/core/testing';

import { Loanformservice } from './loanformservice';

describe('Loanformservice', () => {
  let service: Loanformservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Loanformservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
