import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PeriodsApiService } from './resource-api.service';

describe('PeriodsApiService', () => {
  let service: PeriodsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PeriodsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PeriodsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists periods for a user', () => {
    const periods = [{ id: '1', userId: 'user-1', name: 'Morning', time: '08:00:00' }];

    service.list({ userId: 'user-1' }).subscribe((result) => expect(result).toEqual(periods));

    http.expectOne({ method: 'GET', url: '/api/periods?userId=user-1' }).flush(periods);
  });

  it('creates a period', () => {
    const request = { userId: 'user-1', name: 'Morning', time: '08:00' };
    const response = { id: '1', ...request };

    service.create(request).subscribe((result) => expect(result).toEqual(response));

    const req = http.expectOne({ method: 'POST', url: '/api/periods' });
    expect(req.request.body).toEqual(request);
    req.flush(response);
  });
});
