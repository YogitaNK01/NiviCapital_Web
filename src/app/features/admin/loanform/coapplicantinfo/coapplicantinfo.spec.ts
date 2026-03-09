import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coapplicantinfo } from './coapplicantinfo';

describe('Coapplicantinfo', () => {
  let component: Coapplicantinfo;
  let fixture: ComponentFixture<Coapplicantinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coapplicantinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coapplicantinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
