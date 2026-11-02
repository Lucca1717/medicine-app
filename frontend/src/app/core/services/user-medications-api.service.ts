import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  UserMedicationRequest,
  UserMedicationResponse,
} from '../models/medication-manager';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class UserMedicationsApiService extends ApiBaseService<
  UserMedicationResponse,
  UserMedicationRequest
> {
  constructor(http: HttpClient) {
    super(http, 'user-medications');
  }

  listForUser(userId: string): Observable<UserMedicationResponse[]> {
    return this.list({ userId });
  }
}
