import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsTitleComponent } from './actions-title.component';

describe('ActionsTitleComponent', () => {
  let component: ActionsTitleComponent;
  let fixture: ComponentFixture<ActionsTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionsTitleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionsTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
