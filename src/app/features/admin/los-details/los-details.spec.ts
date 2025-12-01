import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LosDetails } from './los-details';

describe('LosDetails', () => {
  let component: LosDetails;
  let fixture: ComponentFixture<LosDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LosDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LosDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
