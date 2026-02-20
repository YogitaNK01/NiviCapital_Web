import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Otpsection } from './otpsection';

describe('Otpsection', () => {
  let component: Otpsection;
  let fixture: ComponentFixture<Otpsection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Otpsection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Otpsection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
