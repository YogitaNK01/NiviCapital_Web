import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Referenceinfo } from './referenceinfo';

describe('Referenceinfo', () => {
  let component: Referenceinfo;
  let fixture: ComponentFixture<Referenceinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Referenceinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Referenceinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
