import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCabinComponent } from './show-cabin.component';

describe('ShowCabinComponent', () => {
  let component: ShowCabinComponent;
  let fixture: ComponentFixture<ShowCabinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowCabinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowCabinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
