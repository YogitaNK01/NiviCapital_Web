import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Messagebox } from './messagebox';

describe('Messagebox', () => {
  let component: Messagebox;
  let fixture: ComponentFixture<Messagebox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Messagebox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Messagebox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
