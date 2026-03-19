import { TestBed } from '@angular/core/testing';

import { GestionCvService } from './gestion-cv.service';

describe('GestionCvService', () => {
  let service: GestionCvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionCvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
