import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryElementComponent } from './itinerary-element.component';

describe('ItineraryElementComponent', () => {
  let component: ItineraryElementComponent;
  let fixture: ComponentFixture<ItineraryElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItineraryElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItineraryElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
