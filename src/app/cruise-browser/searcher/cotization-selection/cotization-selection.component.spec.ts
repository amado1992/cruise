import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CotizationSelectionComponent } from './cotization-selection.component';

describe('CotizationSelectionComponent', () => {
  let component: CotizationSelectionComponent;
  let fixture: ComponentFixture<CotizationSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CotizationSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CotizationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
