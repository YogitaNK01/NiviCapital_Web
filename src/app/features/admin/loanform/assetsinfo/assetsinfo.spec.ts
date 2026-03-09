import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Assetsinfo } from './assetsinfo';

describe('Assetsinfo', () => {
  let component: Assetsinfo;
  let fixture: ComponentFixture<Assetsinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Assetsinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Assetsinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
