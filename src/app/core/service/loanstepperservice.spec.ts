import { TestBed } from '@angular/core/testing';

import { Loanstepperservice } from './loanstepperservice';

describe('Loanstepperservice', () => {
  let service: Loanstepperservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Loanstepperservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
