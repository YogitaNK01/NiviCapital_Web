import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sanctionletter } from './sanctionletter';

describe('Sanctionletter', () => {
  let component: Sanctionletter;
  let fixture: ComponentFixture<Sanctionletter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sanctionletter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sanctionletter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
