import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UnitsCacheService } from './units-cache.service';
import { UnitsApiService } from './resource-api.service';

describe('UnitsCacheService', () => {
  let service: UnitsCacheService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnitsCacheService, UnitsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UnitsCacheService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('caches the unit list until forced to refresh', () => {
    service.load().subscribe();
    http.expectOne('/api/units').flush([
      { id: '1', name: 'Milligram', abbreviation: 'mg', type: 'MASS' },
    ]);

    service.load().subscribe();
    http.verify();
  });
});
