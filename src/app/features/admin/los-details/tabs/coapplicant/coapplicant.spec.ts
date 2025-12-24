import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coapplicant } from './coapplicant';

describe('Coapplicant', () => {
  let component: Coapplicant;
  let fixture: ComponentFixture<Coapplicant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coapplicant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coapplicant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
