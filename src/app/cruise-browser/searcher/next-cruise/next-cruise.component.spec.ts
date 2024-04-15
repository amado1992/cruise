import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NextCruiseComponent } from './next-cruise.component';

describe('NextCruiseComponent', () => {
  let component: NextCruiseComponent;
  let fixture: ComponentFixture<NextCruiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NextCruiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NextCruiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
