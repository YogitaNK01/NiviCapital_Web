import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Creditscore } from './creditscore';

describe('Creditscore', () => {
  let component: Creditscore;
  let fixture: ComponentFixture<Creditscore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Creditscore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Creditscore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
