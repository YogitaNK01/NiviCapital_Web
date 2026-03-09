import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Monthlyexpenditureinfo } from './monthlyexpenditureinfo';

describe('Monthlyexpenditureinfo', () => {
  let component: Monthlyexpenditureinfo;
  let fixture: ComponentFixture<Monthlyexpenditureinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Monthlyexpenditureinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Monthlyexpenditureinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
