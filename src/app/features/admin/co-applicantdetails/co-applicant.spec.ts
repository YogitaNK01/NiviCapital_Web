import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoApplicant } from './co-applicant';

describe('CoApplicant', () => {
  let component: CoApplicant;
  let fixture: ComponentFixture<CoApplicant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoApplicant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoApplicant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
