import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterPassengerDataComponent } from './enter-passenger-data.component';

describe('EnterPassengerDataComponent', () => {
  let component: EnterPassengerDataComponent;
  let fixture: ComponentFixture<EnterPassengerDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterPassengerDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterPassengerDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
