import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Areacharts } from './areacharts';

describe('Areacharts', () => {
  let component: Areacharts;
  let fixture: ComponentFixture<Areacharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Areacharts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Areacharts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
