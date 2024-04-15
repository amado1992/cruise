import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BtGototopComponent } from './bt-gototop.component';

describe('BtGototopComponent', () => {
  let component: BtGototopComponent;
  let fixture: ComponentFixture<BtGototopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BtGototopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BtGototopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
