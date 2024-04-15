import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerDataSummaryComponent } from './passenger-data-summary.component';

describe('PassengerDataSummaryComponent', () => {
  let component: PassengerDataSummaryComponent;
  let fixture: ComponentFixture<PassengerDataSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassengerDataSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassengerDataSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
