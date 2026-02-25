import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Edusection } from './edusection';

describe('Edusection', () => {
  let component: Edusection;
  let fixture: ComponentFixture<Edusection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Edusection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Edusection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
