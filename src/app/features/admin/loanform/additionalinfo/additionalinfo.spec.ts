import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Additionalinfo } from './additionalinfo';

describe('Additionalinfo', () => {
  let component: Additionalinfo;
  let fixture: ComponentFixture<Additionalinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Additionalinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Additionalinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
