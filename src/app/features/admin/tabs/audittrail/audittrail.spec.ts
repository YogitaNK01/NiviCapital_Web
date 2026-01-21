import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Audittrail } from './audittrail';

describe('Audittrail', () => {
  let component: Audittrail;
  let fixture: ComponentFixture<Audittrail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Audittrail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Audittrail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
