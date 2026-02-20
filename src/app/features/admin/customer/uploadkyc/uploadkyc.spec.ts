import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Uploadkyc } from './uploadkyc';

describe('Uploadkyc', () => {
  let component: Uploadkyc;
  let fixture: ComponentFixture<Uploadkyc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Uploadkyc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Uploadkyc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
