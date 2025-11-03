import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Customerdetails } from './customerdetails';

describe('Customerdetails', () => {
  let component: Customerdetails;
  let fixture: ComponentFixture<Customerdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customerdetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Customerdetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
