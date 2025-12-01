import { TestBed } from '@angular/core/testing';

import { Main } from './main';

describe('Main', () => {
  let service: Main;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Main);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
