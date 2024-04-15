import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() { }

  public isNullOrEmpty(val: string): boolean {
    if (val === undefined || val === null || val === '') {
      return true;
    }
    return false;
  };
}
