import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loanstepper } from './loanstepper';

describe('Loanstepper', () => {
  let component: Loanstepper;
  let fixture: ComponentFixture<Loanstepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loanstepper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loanstepper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
