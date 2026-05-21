import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Basicinfo } from './basicinfo';

describe('Basicinfo', () => {
  let component: Basicinfo;
  let fixture: ComponentFixture<Basicinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Basicinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Basicinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
