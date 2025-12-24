import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiData } from './pi-data';

describe('PiData', () => {
  let component: PiData;
  let fixture: ComponentFixture<PiData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
