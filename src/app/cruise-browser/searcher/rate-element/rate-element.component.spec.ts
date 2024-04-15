import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RateElementComponent } from './rate-element.component';

describe('RateElementComponent', () => {
  let component: RateElementComponent;
  let fixture: ComponentFixture<RateElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RateElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RateElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
