import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StateroomRateComponent } from './stateroom-rate.component';

describe('StateroomRateComponent', () => {
  let component: StateroomRateComponent;
  let fixture: ComponentFixture<StateroomRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateroomRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StateroomRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
