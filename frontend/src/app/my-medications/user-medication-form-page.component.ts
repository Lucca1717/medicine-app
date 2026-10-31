import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem,
  IonLabel, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar,
} from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MedicationResponse, UnitType } from '../core/models/medication-manager';
import { CurrentUserService } from '../core/services/current-user.service';
import { MedicationsApiService } from '../core/services/resource-api.service';
import { UserMedicationsApiService } from '../core/services/user-medications-api.service';
import { UnitsCacheService } from '../core/services/units-cache.service';
import { ErrorService } from '../core/services/error.service';
import { endDateNotBeforeStartDate } from './date-range.validator';

@Component({
  selector: 'app-user-medication-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar],
  template: `
    <ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/my-medications"></ion-back-button></ion-buttons><ion-title>Add medication</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (!currentUserId()) {
        <p class="empty-state">Select a current user before adding a medication.</p>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <ion-item><ion-label position="stacked">Medication</ion-label><ion-select formControlName="medicationId" interface="popover">
            @for (medication of medications(); track medication.id) {
              <ion-select-option [value]="medication.id">{{ medication.name }} ({{ medication.dosageValue }} {{ dosageUnit(medication) }})</ion-select-option>
            }
          </ion-select></ion-item>
          <ion-item><ion-label position="stacked">Current stock</ion-label><ion-input type="number" formControlName="currentStockValue" min="0"></ion-input></ion-item>
          <ion-item><ion-label position="stacked">Stock unit</ion-label><ion-select formControlName="stockUnitId" interface="popover">
            @for (unit of stockUnits(); track unit.id) { <ion-select-option [value]="unit.id">{{ unit.name }} ({{ unit.abbreviation }})</ion-select-option> }
          </ion-select></ion-item>
          <ion-item><ion-label position="stacked">Start date</ion-label><ion-input type="date" formControlName="startDate"></ion-input></ion-item>
          <ion-item><ion-label position="stacked">End date (optional)</ion-label><ion-input type="date" formControlName="endDate"></ion-input></ion-item>
          @if (form.hasError('endDateBeforeStartDate') && form.touched) { <p class="error-message">End date cannot be before start date.</p> }
          <ion-item><ion-label>Active</ion-label><ion-toggle formControlName="active"></ion-toggle></ion-item>
          <ion-button expand="block" type="submit" [disabled]="form.invalid">Save medication</ion-button>
        </form>
      }
    </ion-content>
  `,
})
export class UserMedicationFormPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly currentUser = inject(CurrentUserService);
  private readonly medicationsApi = inject(MedicationsApiService);
  private readonly userMedicationsApi = inject(UserMedicationsApiService);
  private readonly unitsCache = inject(UnitsCacheService);
  private readonly errorService = inject(ErrorService);
  private readonly router = inject(Router);
  readonly currentUserId = this.currentUser.selectedUserId;
  readonly medications = signal<MedicationResponse[]>([]);
  readonly stockUnits = () => this.unitsCache.units().filter((unit) => unit.type === ('MEDICATION' satisfies UnitType));
  readonly form = this.formBuilder.nonNullable.group({
    medicationId: ['', [Validators.required]],
    currentStockValue: [0, [Validators.required, Validators.min(0)]],
    stockUnitId: ['', [Validators.required]],
    startDate: ['', [Validators.required]],
    endDate: [''],
    active: [true],
  }, { validators: endDateNotBeforeStartDate });

  constructor() {
    this.unitsCache.load().pipe(takeUntilDestroyed()).subscribe();
    this.medicationsApi.list().pipe(takeUntilDestroyed()).subscribe((items) => this.medications.set(items));
  }

  dosageUnit(medication: MedicationResponse): string {
    return this.unitsCache.units().find((unit) => unit.id === medication.dosageUnitId)?.abbreviation ?? '';
  }

  submit(): void {
    if (this.form.invalid || !this.currentUserId()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.userMedicationsApi.create({
      userId: this.currentUserId()!,
      medicationId: value.medicationId,
      currentStockValue: value.currentStockValue,
      stockUnitId: value.stockUnitId,
      startDate: value.startDate,
      endDate: value.endDate || null,
      active: value.active,
    }).subscribe({
      next: () => void this.router.navigateByUrl('/my-medications'),
      error: (error: unknown) => void this.errorService.show(error),
    });
  }
}
