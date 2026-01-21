import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Occupation } from './occupation';

describe('Occupation', () => {
  let component: Occupation;
  let fixture: ComponentFixture<Occupation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Occupation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Occupation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
