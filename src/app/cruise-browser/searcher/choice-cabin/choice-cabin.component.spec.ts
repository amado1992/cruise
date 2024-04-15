import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceCabinComponent } from './choice-cabin.component';

describe('ChoiceCabinComponent', () => {
  let component: ChoiceCabinComponent;
  let fixture: ComponentFixture<ChoiceCabinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChoiceCabinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoiceCabinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
