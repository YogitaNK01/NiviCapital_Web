import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Newloan } from './newloan';

describe('Newloan', () => {
  let component: Newloan;
  let fixture: ComponentFixture<Newloan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newloan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Newloan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
