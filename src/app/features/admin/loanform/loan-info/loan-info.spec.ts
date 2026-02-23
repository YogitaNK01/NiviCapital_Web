import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanInfo } from './loan-info';

describe('LoanInfo', () => {
  let component: LoanInfo;
  let fixture: ComponentFixture<LoanInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
