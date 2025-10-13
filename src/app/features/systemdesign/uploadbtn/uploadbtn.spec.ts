import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Uploadbtn } from './uploadbtn';

describe('Uploadbtn', () => {
  let component: Uploadbtn;
  let fixture: ComponentFixture<Uploadbtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Uploadbtn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Uploadbtn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
