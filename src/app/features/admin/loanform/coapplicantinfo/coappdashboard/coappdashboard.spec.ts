import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coappdashboard } from './coappdashboard';

describe('Coappdashboard', () => {
  let component: Coappdashboard;
  let fixture: ComponentFixture<Coappdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coappdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coappdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
