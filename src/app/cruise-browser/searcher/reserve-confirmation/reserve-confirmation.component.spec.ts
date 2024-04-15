import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserveConfirmationComponent } from './reserve-confirmation.component';

describe('ReserveConfirmationComponent', () => {
  let component: ReserveConfirmationComponent;
  let fixture: ComponentFixture<ReserveConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReserveConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReserveConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
