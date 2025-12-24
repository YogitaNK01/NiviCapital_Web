import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loandetails } from './loandetails';

describe('Loandetails', () => {
  let component: Loandetails;
  let fixture: ComponentFixture<Loandetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loandetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loandetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
