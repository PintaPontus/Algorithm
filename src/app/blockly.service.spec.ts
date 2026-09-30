import { TestBed } from '@angular/core/testing';
import { BlocklyService } from './blockly.service';

describe('BlocklyService', () => {
  let service: BlocklyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlocklyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
