import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MedicationRequest, MedicationResponse } from '../models/medication-manager';
import { MedicationsApiService } from './resource-api.service';

@Injectable({ providedIn: 'root' })
export class MedicationsCacheService {
  private readonly cachedMedications = signal<MedicationResponse[]>([]);
  readonly medications = this.cachedMedications.asReadonly();

  constructor(private readonly api: MedicationsApiService) {}

  load(force = false): Observable<MedicationResponse[]> {
    if (!force && this.cachedMedications().length > 0) {
      return new Observable((subscriber) => {
        subscriber.next(this.cachedMedications());
        subscriber.complete();
      });
    }
    return this.api.list().pipe(tap((medications) => this.cachedMedications.set(medications)));
  }

  create(request: MedicationRequest): Observable<MedicationResponse> {
    return this.api.create(request).pipe(
      tap((medication) => this.cachedMedications.update((medications) => [...medications, medication])),
    );
  }
}
