import { TestBed } from '@angular/core/testing';

import { CruceroService } from './crucero.service';

describe('CruceroService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CruceroService = TestBed.get(CruceroService);
    expect(service).toBeTruthy();
  });
});
