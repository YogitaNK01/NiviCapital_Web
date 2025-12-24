import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiiData } from './pii-data';

describe('PiiData', () => {
  let component: PiiData;
  let fixture: ComponentFixture<PiiData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiiData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiiData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
