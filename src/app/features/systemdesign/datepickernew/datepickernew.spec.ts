import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Datepickernew } from './datepickernew';

describe('Datepickernew', () => {
  let component: Datepickernew;
  let fixture: ComponentFixture<Datepickernew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Datepickernew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Datepickernew);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
