import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAgencyComponent } from './select-agency.component';

describe('SelectAgencyComponent', () => {
  let component: SelectAgencyComponent;
  let fixture: ComponentFixture<SelectAgencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectAgencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
