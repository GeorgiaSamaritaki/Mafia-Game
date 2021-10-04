import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninTableComponent } from './signin-table.component';

describe('SigninTableComponent', () => {
  let component: SigninTableComponent;
  let fixture: ComponentFixture<SigninTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigninTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigninTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
