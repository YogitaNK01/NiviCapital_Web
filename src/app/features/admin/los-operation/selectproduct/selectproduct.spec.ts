import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Selectproduct } from './selectproduct';

describe('Selectproduct', () => {
  let component: Selectproduct;
  let fixture: ComponentFixture<Selectproduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Selectproduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Selectproduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
