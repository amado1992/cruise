import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMiniOfferComponent } from './search-mini-offer.component';

describe('SearchMiniOfferComponent', () => {
  let component: SearchMiniOfferComponent;
  let fixture: ComponentFixture<SearchMiniOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchMiniOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchMiniOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
