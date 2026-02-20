import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Successbox } from './successbox';

describe('Successbox', () => {
  let component: Successbox;
  let fixture: ComponentFixture<Successbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Successbox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Successbox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
