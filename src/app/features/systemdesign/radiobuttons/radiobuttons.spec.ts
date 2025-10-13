import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Radiobuttons } from './radiobuttons';

describe('Radiobuttons', () => {
  let component: Radiobuttons;
  let fixture: ComponentFixture<Radiobuttons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Radiobuttons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Radiobuttons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
