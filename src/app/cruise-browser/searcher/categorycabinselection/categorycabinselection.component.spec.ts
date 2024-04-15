import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorycabinselectionComponent } from './categorycabinselection.component';

describe('CategorycabinselectionComponent', () => {
  let component: CategorycabinselectionComponent;
  let fixture: ComponentFixture<CategorycabinselectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategorycabinselectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategorycabinselectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
