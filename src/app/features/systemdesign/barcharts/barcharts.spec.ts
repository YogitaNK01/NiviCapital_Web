import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Barcharts } from './barcharts';

describe('Barcharts', () => {
  let component: Barcharts;
  let fixture: ComponentFixture<Barcharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Barcharts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Barcharts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
