import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

@Injectable()
export class ResizeService {

  get onResize$(): Observable<SCREEN_SIZE> {
    return this.resizeSubject.asObservable().pipe(distinctUntilChanged());
  }

  private resizeSubject: Subject<SCREEN_SIZE>;

  constructor() {
    this.resizeSubject = new Subject();
  }

  onResize(size: SCREEN_SIZE) {
    this.resizeSubject.next(size);
  }

}
export enum SCREEN_SIZE {
    XS,
    SM,
    MD,
    LG,
    XL
  }

  /*export enum SCREEN_SIZE {
    xs,
    sm,
    md,
    lg,
    xl
  }*/