import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartTvComponent } from './smart-tv.component';

describe('SmartTvComponent', () => {
  let component: SmartTvComponent;
  let fixture: ComponentFixture<SmartTvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartTvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartTvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
