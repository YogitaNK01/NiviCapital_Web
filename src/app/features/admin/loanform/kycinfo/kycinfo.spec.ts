import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kycinfo } from './kycinfo';

describe('Kycinfo', () => {
  let component: Kycinfo;
  let fixture: ComponentFixture<Kycinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Kycinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Kycinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
