import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Incomeinfo } from './incomeinfo';

describe('Incomeinfo', () => {
  let component: Incomeinfo;
  let fixture: ComponentFixture<Incomeinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Incomeinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Incomeinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
