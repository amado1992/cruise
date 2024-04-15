import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StateroomChoiceComponent } from './stateroom-choice.component';

describe('StateroomChoiceComponent', () => {
  let component: StateroomChoiceComponent;
  let fixture: ComponentFixture<StateroomChoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateroomChoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StateroomChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
