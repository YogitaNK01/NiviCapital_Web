import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Estimateexpense } from './estimateexpense';

describe('Estimateexpense', () => {
  let component: Estimateexpense;
  let fixture: ComponentFixture<Estimateexpense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Estimateexpense]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Estimateexpense);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
