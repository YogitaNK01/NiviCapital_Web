import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductData } from './product-data';

describe('ProductData', () => {
  let component: ProductData;
  let fixture: ComponentFixture<ProductData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
