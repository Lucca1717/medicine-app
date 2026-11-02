import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IntakeRecordResponse } from '../models/medication-manager';
import { IntakeRecordsApiService } from './resource-api.service';

describe('IntakeRecordsApiService', () => {
  let service: IntakeRecordsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntakeRecordsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IntakeRecordsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists intake records through the intake-records endpoint', () => {
    const records: IntakeRecordResponse[] = [{
      id: 'record-1',
      medicationPeriodId: 'period-1',
      scheduledAt: '2026-01-01T08:00:00Z',
      takenAt: null,
      quantityValue: null,
      quantityUnitId: null,
      status: 'PENDING',
    }];

    service.list().subscribe((result) => expect(result).toEqual(records));

    http.expectOne({ method: 'GET', url: '/api/intake-records' }).flush(records);
  });
});
