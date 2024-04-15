import { TestBed } from '@angular/core/testing';

import { PasajeroDataService } from './pasajero-data.service';

describe('PasajeroDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PasajeroDataService = TestBed.get(PasajeroDataService);
    expect(service).toBeTruthy();
  });
});
