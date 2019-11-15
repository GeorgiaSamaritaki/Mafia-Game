import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveWallComponent } from './interactive-wall.component';

describe('InteractiveWallComponent', () => {
  let component: InteractiveWallComponent;
  let fixture: ComponentFixture<InteractiveWallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractiveWallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveWallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
