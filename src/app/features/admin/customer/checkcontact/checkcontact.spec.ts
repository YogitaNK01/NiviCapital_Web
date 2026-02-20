import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Checkcontact } from './checkcontact';

describe('Checkcontact', () => {
  let component: Checkcontact;
  let fixture: ComponentFixture<Checkcontact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkcontact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Checkcontact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
