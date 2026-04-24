import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Edudetails } from './edudetails';

describe('Edudetails', () => {
  let component: Edudetails;
  let fixture: ComponentFixture<Edudetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Edudetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Edudetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
