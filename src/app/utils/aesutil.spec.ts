import { TestBed } from '@angular/core/testing';

import { Aesutil } from './aesutil';

describe('Aesutil', () => {
  let service: Aesutil;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Aesutil);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
