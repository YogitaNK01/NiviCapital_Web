import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Commontabs } from './commontabs';

describe('Commontabs', () => {
  let component: Commontabs;
  let fixture: ComponentFixture<Commontabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Commontabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Commontabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
