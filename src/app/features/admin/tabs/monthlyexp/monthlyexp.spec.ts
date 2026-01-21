import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Monthlyexp } from './monthlyexp';

describe('Monthlyexp', () => {
  let component: Monthlyexp;
  let fixture: ComponentFixture<Monthlyexp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Monthlyexp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Monthlyexp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
