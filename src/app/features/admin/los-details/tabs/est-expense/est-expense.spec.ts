import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstExpense } from './est-expense';

describe('EstExpense', () => {
  let component: EstExpense;
  let fixture: ComponentFixture<EstExpense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstExpense]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstExpense);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
