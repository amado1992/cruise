import { TestBed } from '@angular/core/testing';

import { SearcherSessionService } from './searcher-session.service';

describe('SearcherSessionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SearcherSessionService = TestBed.get(SearcherSessionService);
    expect(service).toBeTruthy();
  });
});
