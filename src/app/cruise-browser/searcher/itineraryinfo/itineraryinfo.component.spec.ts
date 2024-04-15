import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryinfoComponent } from './itineraryinfo.component';

describe('ItineraryinfoComponent', () => {
  let component: ItineraryinfoComponent;
  let fixture: ComponentFixture<ItineraryinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItineraryinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItineraryinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
