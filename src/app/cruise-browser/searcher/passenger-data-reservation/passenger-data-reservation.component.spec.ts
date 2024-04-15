import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerDataReservationComponent } from './passenger-data-reservation.component';

describe('PassengerDataReservationComponent', () => {
  let component: PassengerDataReservationComponent;
  let fixture: ComponentFixture<PassengerDataReservationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassengerDataReservationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassengerDataReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
