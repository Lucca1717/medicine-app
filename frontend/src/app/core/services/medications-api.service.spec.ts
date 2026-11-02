import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MedicationsApiService } from './resource-api.service';

describe('MedicationsApiService', () => {
  let service: MedicationsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MedicationsApiService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MedicationsApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('creates a medication through the medications endpoint', () => {
    const request = { name: 'Dipyrone', dosageValue: 500, dosageUnitId: 'unit-1' };
    service.create(request).subscribe((result) => expect(result.name).toBe('Dipyrone'));
    http.expectOne({ method: 'POST', url: '/api/medications' }).flush({ id: '1', ...request });
  });
});
