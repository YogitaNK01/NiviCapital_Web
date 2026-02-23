import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loanlayout } from './loanlayout';

describe('Loanlayout', () => {
  let component: Loanlayout;
  let fixture: ComponentFixture<Loanlayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loanlayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loanlayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
