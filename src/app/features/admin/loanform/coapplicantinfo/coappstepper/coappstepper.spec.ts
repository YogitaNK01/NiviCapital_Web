import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coappstepper } from './coappstepper';

describe('Coappstepper', () => {
  let component: Coappstepper;
  let fixture: ComponentFixture<Coappstepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coappstepper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coappstepper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
