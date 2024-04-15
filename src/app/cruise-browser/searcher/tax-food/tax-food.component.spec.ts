import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxFoodComponent } from './tax-food.component';

describe('TaxFoodComponent', () => {
  let component: TaxFoodComponent;
  let fixture: ComponentFixture<TaxFoodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxFoodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxFoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
