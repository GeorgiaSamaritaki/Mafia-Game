import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AugmentedTableComponent } from './augmented-table.component';

describe('AugmentedTableComponent', () => {
  let component: AugmentedTableComponent;
  let fixture: ComponentFixture<AugmentedTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AugmentedTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AugmentedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
