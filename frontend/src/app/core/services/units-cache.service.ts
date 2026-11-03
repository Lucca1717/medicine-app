import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UnitRequest, UnitResponse } from '../models/medication-manager';
import { UnitsApiService } from './resource-api.service';

@Injectable({ providedIn: 'root' })
export class UnitsCacheService {
  private readonly cachedUnits = signal<UnitResponse[]>([]);
  readonly units = this.cachedUnits.asReadonly();

  constructor(private readonly api: UnitsApiService) {}

  load(force = false): Observable<UnitResponse[]> {
    if (!force && this.cachedUnits().length > 0) {
      return new Observable((subscriber) => {
        subscriber.next(this.cachedUnits());
        subscriber.complete();
      });
    }
    return this.api.list().pipe(tap((units) => this.cachedUnits.set(units)));
  }

  create(request: UnitRequest): Observable<UnitResponse> {
    return this.api.create(request).pipe(
      tap((unit) => this.cachedUnits.update((units) => [...units, unit])),
    );
  }

  update(id: string, request: UnitRequest): Observable<UnitResponse> {
    return this.api.update(id, request).pipe(
      tap((unit) => this.cachedUnits.update((units) => units.map((item) => item.id === id ? unit : item))),
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(
      tap(() => this.cachedUnits.update((units) => units.filter((item) => item.id !== id))),
    );
  }

  refresh(): Observable<UnitResponse[]> {
    return this.load(true);
  }
}
