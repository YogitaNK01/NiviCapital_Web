import { TestBed } from '@angular/core/testing';

import { EditMode } from './edit-mode';

describe('EditMode', () => {
  let service: EditMode;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditMode);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
