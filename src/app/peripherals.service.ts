import { Service } from '@angular/core';
import {Subject} from 'rxjs';

@Service()
export class PeripheralsService {

  private readonly keyPressedSubject = new Subject<string>();
  readonly keyPressed = this.keyPressedSubject.asObservable();

  emitKey(key: string) {
    this.keyPressedSubject.next(key);
  }
}
