import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryQuotationComponent } from './summary-quotation.component';

describe('SummaryQuotationComponent', () => {
  let component: SummaryQuotationComponent;
  let fixture: ComponentFixture<SummaryQuotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryQuotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
