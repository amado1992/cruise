import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengersNumberComponent } from './passengers-number.component';

describe('PassengersNumberComponent', () => {
  let component: PassengersNumberComponent;
  let fixture: ComponentFixture<PassengersNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassengersNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassengersNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
