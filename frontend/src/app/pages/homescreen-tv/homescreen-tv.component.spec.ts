import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomescreenTvComponent } from './homescreen-tv.component';

describe('HomescreenTvComponent', () => {
  let component: HomescreenTvComponent;
  let fixture: ComponentFixture<HomescreenTvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomescreenTvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomescreenTvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
