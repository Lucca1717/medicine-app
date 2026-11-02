import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MedicationPeriodRequest, MedicationPeriodResponse } from '../models/medication-manager';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class MedicationPeriodsApiService extends ApiBaseService<
  MedicationPeriodResponse,
  MedicationPeriodRequest
> {
  constructor(http: HttpClient) {
    super(http, 'medication-periods');
  }
}
