import { TestBed } from '@angular/core/testing';

import { TableData } from './table-data';

describe('TableData', () => {
  let service: TableData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
