import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Liabilitiesinfo } from './liabilitiesinfo';

describe('Liabilitiesinfo', () => {
  let component: Liabilitiesinfo;
  let fixture: ComponentFixture<Liabilitiesinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Liabilitiesinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Liabilitiesinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
