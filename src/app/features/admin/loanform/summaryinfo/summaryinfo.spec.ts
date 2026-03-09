import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Summaryinfo } from './summaryinfo';

describe('Summaryinfo', () => {
  let component: Summaryinfo;
  let fixture: ComponentFixture<Summaryinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Summaryinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Summaryinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
