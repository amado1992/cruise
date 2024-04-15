import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMiniComponent } from './search-mini.component';

describe('SearchMiniComponent', () => {
  let component: SearchMiniComponent;
  let fixture: ComponentFixture<SearchMiniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchMiniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
