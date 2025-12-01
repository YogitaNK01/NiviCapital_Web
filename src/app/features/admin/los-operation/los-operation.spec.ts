import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LosOperation } from './los-operation';

describe('LosOperation', () => {
  let component: LosOperation;
  let fixture: ComponentFixture<LosOperation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LosOperation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LosOperation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
