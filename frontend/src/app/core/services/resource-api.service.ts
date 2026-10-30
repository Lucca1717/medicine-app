import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  IntakeRecordRequest,
  IntakeRecordResponse,
  MedicationPeriodRequest,
  MedicationPeriodResponse,
  MedicationRequest,
  MedicationResponse,
  PeriodRequest,
  PeriodResponse,
  UnitRequest,
  UnitResponse,
  UserMedicationRequest,
  UserMedicationResponse,
} from '../models/medication-manager';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
@Injectable({ providedIn: 'root' })
export class UnitsApiService extends ApiBaseService<UnitResponse, UnitRequest> {
  constructor(http: HttpClient) {
    super(http, 'units');
  }
}

@Injectable({ providedIn: 'root' })
export class MedicationsApiService extends ApiBaseService<MedicationResponse, MedicationRequest> {
  constructor(http: HttpClient) {
    super(http, 'medications');
  }
}

@Injectable({ providedIn: 'root' })
export class PeriodsApiService extends ApiBaseService<PeriodResponse, PeriodRequest> {
  constructor(http: HttpClient) {
    super(http, 'periods');
  }
}

@Injectable({ providedIn: 'root' })
export class UserMedicationsApiService extends ApiBaseService<UserMedicationResponse, UserMedicationRequest> {
  constructor(http: HttpClient) {
    super(http, 'user-medications');
  }
}

@Injectable({ providedIn: 'root' })
export class MedicationPeriodsApiService extends ApiBaseService<MedicationPeriodResponse, MedicationPeriodRequest> {
  constructor(http: HttpClient) {
    super(http, 'medication-periods');
  }
}

@Injectable({ providedIn: 'root' })
export class IntakeRecordsApiService extends ApiBaseService<IntakeRecordResponse, IntakeRecordRequest> {
  constructor(http: HttpClient) {
    super(http, 'intake-records');
  }
}
