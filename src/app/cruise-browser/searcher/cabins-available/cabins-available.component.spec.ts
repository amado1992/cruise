import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinsAvailableComponent } from './cabins-available.component';

describe('CabinsAvailableComponent', () => {
  let component: CabinsAvailableComponent;
  let fixture: ComponentFixture<CabinsAvailableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CabinsAvailableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CabinsAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
