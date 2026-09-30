import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockWorkspace } from './block-workspace';

describe('BlockWorkspaceComponent', () => {
  let component: BlockWorkspace;
  let fixture: ComponentFixture<BlockWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockWorkspace],
    }).compileComponents();

    fixture = TestBed.createComponent(BlockWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
