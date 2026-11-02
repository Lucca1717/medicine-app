import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MedicationPeriodsApiService } from './medication-periods-api.service';

describe('MedicationPeriodsApiService', () => {
  let service: MedicationPeriodsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MedicationPeriodsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MedicationPeriodsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates a medication period through the medication-periods endpoint', () => {
    const request = {
      userMedicationId: 'um-1',
      periodId: 'period-1',
      quantityValue: 2,
      quantityUnitId: 'tablet',
    };

    service.create(request).subscribe();

    const call = http.expectOne({ method: 'POST', url: '/api/medication-periods' });
    expect(call.request.body).toEqual(request);
    call.flush({ id: 'mp-1', ...request });
  });
});
