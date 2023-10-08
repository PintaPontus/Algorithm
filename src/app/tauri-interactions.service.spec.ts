import {TestBed} from '@angular/core/testing';

import {TauriInteractionsService} from './tauri-interactions.service';

describe('TauriInteractionsService', () => {
    let service: TauriInteractionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TauriInteractionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
