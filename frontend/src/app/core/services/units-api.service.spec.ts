import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UnitsApiService } from './resource-api.service';

describe('UnitsApiService', () => {
  let service: UnitsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnitsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UnitsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists units through the units endpoint', () => {
    const units = [{ id: '1', name: 'Tablet', abbreviation: 'tab', type: 'MEDICATION' as const }];

    service.list().subscribe((result) => expect(result).toEqual(units));

    http.expectOne({ method: 'GET', url: '/api/units' }).flush(units);
  });
});
