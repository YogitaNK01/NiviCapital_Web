import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Losproduct } from './losproduct';

describe('Losproduct', () => {
  let component: Losproduct;
  let fixture: ComponentFixture<Losproduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Losproduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Losproduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
