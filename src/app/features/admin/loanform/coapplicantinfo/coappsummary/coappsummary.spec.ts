import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coappsummary } from './coappsummary';

describe('Coappsummary', () => {
  let component: Coappsummary;
  let fixture: ComponentFixture<Coappsummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coappsummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coappsummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
