import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonInput, IonItem, IonLabel, IonNote, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { IntakeStatus, MedicationPeriodResponse, MedicationResponse, PeriodResponse, UserMedicationResponse, UnitResponse } from '../core/models/medication-manager';
import { CurrentUserService } from '../core/services/current-user.service';
import { ErrorService } from '../core/services/error.service';
import { IntakeRecordsApiService, MedicationPeriodsApiService, MedicationsApiService, PeriodsApiService, UnitsApiService, UserMedicationsApiService } from '../core/services/resource-api.service';
import { applyStatusValidators, IntakeForm } from './intake-record.validators';

@Component({
  selector: 'app-intake-record-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonItem, IonLabel, IonNote, IonSelect, IonSelectOption, IonDatetime, IonInput, IonButton],
  template: `
    <ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/intake-records"></ion-back-button></ion-buttons><ion-title>Add intake</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (!currentUserId) {
        <ion-item><ion-label>Select a current user before adding an intake record.</ion-label></ion-item>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <ion-item><ion-label position="stacked">Medication and period</ion-label><ion-select formControlName="medicationPeriodId" interface="popover">
            @for (option of options; track option.period.id) { <ion-select-option [value]="option.medicationPeriod.id">{{ option.medication.name }} · {{ option.period.name }}</ion-select-option> }
          </ion-select></ion-item>
          <ion-item><ion-label position="stacked">Scheduled at</ion-label><ion-datetime formControlName="scheduledAt" presentation="date-time"></ion-datetime></ion-item>
          <ion-item><ion-label position="stacked">Status</ion-label><ion-select formControlName="status" interface="popover">@for (status of statuses; track status) { <ion-select-option [value]="status">{{ status }}</ion-select-option> }</ion-select></ion-item>
          @if (form.controls.status.value !== 'PENDING') {
            <ion-item><ion-label position="stacked">Taken at</ion-label><ion-datetime formControlName="takenAt" presentation="date-time"></ion-datetime></ion-item>
            <ion-item><ion-label position="stacked">Actual quantity</ion-label><ion-input type="number" formControlName="quantityValue"></ion-input></ion-item>
            <ion-item><ion-label position="stacked">Quantity unit</ion-label><ion-select formControlName="quantityUnitId" interface="popover">@for (unit of units; track unit.id) { <ion-select-option [value]="unit.id">{{ unit.name }} ({{ unit.abbreviation }})</ion-select-option> }</ion-select></ion-item>
            <ion-note>Actual quantity may differ from the scheduled quantity.</ion-note>
            @if (form.controls.status.value === 'TAKEN') {
              <ion-note color="danger">Taken status requires taken at, actual quantity, and quantity unit.</ion-note>
            }
          }
          <ion-button expand="block" type="submit" [disabled]="form.invalid">Save intake</ion-button>
        </form>
      }
    </ion-content>
  `,
})
export class IntakeRecordFormPageComponent {
  private readonly builder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly currentUser = inject(CurrentUserService);
  private readonly errorService = inject(ErrorService);
  private readonly api = inject(IntakeRecordsApiService);
  private readonly userMedicationsApi = inject(UserMedicationsApiService);
  private readonly periodsApi = inject(PeriodsApiService);
  private readonly medicationPeriodsApi = inject(MedicationPeriodsApiService);
  private readonly medicationsApi = inject(MedicationsApiService);
  private readonly unitsApi = inject(UnitsApiService);
  private readonly route = inject(ActivatedRoute);
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly currentUserId = this.currentUser.selectedUserId();
  readonly statuses: IntakeStatus[] = ['PENDING', 'TAKEN', 'SKIPPED', 'OVERDUE'];
  readonly units: UnitResponse[] = [];
  readonly options: Array<{ medicationPeriod: MedicationPeriodResponse; medication: MedicationResponse; period: PeriodResponse }> = [];
  readonly form = this.builder.group({
    medicationPeriodId: this.builder.control<string | null>(null, Validators.required),
    scheduledAt: this.builder.nonNullable.control('', Validators.required),
    takenAt: this.builder.control<string | null>(null),
    quantityValue: this.builder.control<number | null>(null),
    quantityUnitId: this.builder.control<string | null>(null),
    status: this.builder.nonNullable.control<IntakeStatus>('PENDING', Validators.required),
  }) as unknown as IntakeForm;

  constructor() {
    this.form.controls.status.valueChanges.subscribe(() => applyStatusValidators(this.form));
    applyStatusValidators(this.form);
    if (this.currentUserId) {
      forkJoin({
        userMedications: this.userMedicationsApi.list({ userId: this.currentUserId }),
        periods: this.periodsApi.list({ userId: this.currentUserId }),
        medicationPeriods: this.medicationPeriodsApi.list(),
        medications: this.medicationsApi.list(),
        units: this.unitsApi.list(),
      }).subscribe(({ userMedications, periods, medicationPeriods, medications, units }) => {
        this.units.push(...units.filter((unit) => unit.type === 'MEDICATION'));
        const ownedUserMedications = userMedications.filter((item) => item.userId === this.currentUserId);
        const ownedPeriods = periods.filter((item) => item.userId === this.currentUserId);
        const userMedicationIds = new Set(ownedUserMedications.map((item) => item.id));
        const periodIds = new Set(ownedPeriods.map((item) => item.id));
        const medicationById = new Map(medications.map((item) => [item.id, item]));
        const periodById = new Map(ownedPeriods.map((item) => [item.id, item]));
        this.options.push(
          ...medicationPeriods
            .filter((item) => userMedicationIds.has(item.userMedicationId) && periodIds.has(item.periodId))
            .map((item) => {
              const userMedication = ownedUserMedications.find((candidate) => candidate.id === item.userMedicationId) as UserMedicationResponse;
              return { medicationPeriod: item, medication: medicationById.get(userMedication.medicationId) as MedicationResponse, period: periodById.get(item.periodId) as PeriodResponse };
            }),
        );
        if (this.id) {
          this.api.get(this.id).subscribe({
            next: (record) => {
              this.form.patchValue(record);
              applyStatusValidators(this.form);
            },
            error: (error: unknown) => void this.errorService.show(error),
          });
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const request = {
      medicationPeriodId: value.medicationPeriodId as string,
      scheduledAt: value.scheduledAt,
      takenAt: value.status === 'PENDING' ? null : value.takenAt,
      quantityValue: value.status === 'PENDING' ? null : value.quantityValue,
      quantityUnitId: value.status === 'PENDING' ? null : value.quantityUnitId,
      status: value.status,
    };
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);
    operation.subscribe({
      next: () => void this.router.navigateByUrl('/intake-records'),
      error: (error: unknown) => void this.errorService.show(error),
    });
  }
}
