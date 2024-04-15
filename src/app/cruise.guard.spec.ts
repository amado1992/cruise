import { TestBed, async, inject } from '@angular/core/testing';

import { CruiseGuard } from './cruise.guard';

describe('CruiseGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CruiseGuard]
    });
  });

  it('should ...', inject([CruiseGuard], (guard: CruiseGuard) => {
    expect(guard).toBeTruthy();
  }));
});
