import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Educationinfo } from './educationinfo';

describe('Educationinfo', () => {
  let component: Educationinfo;
  let fixture: ComponentFixture<Educationinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Educationinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Educationinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
