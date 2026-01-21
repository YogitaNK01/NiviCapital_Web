import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycData } from './kyc-data';

describe('KycData', () => {
  let component: KycData;
  let fixture: ComponentFixture<KycData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
