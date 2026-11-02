import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import {
  MedicationResponse,
  MedicationPeriodResponse,
  PeriodResponse,
  UnitResponse,
  UserMedicationResponse,
} from '../core/models/medication-manager';
import { MedicationPeriodsApiService } from '../core/services/medication-periods-api.service';
import {
  MedicationsApiService,
  PeriodsApiService,
  UnitsApiService,
  UserMedicationsApiService,
} from '../core/services/resource-api.service';
import { CurrentUserService } from '../core/services/current-user.service';
import { ErrorService } from '../core/services/error.service';

export function filterCurrentUserPeriods(periods: PeriodResponse[], userId: string | null): PeriodResponse[] {
  return periods.filter((period) => period.userId === userId);
}

export function filterCurrentUserMedications(
  medications: UserMedicationResponse[],
  userId: string | null,
): UserMedicationResponse[] {
  return medications.filter((medication) => medication.userId === userId);
}

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonButton,
  ],
  template: `
    <ion-toolbar>
      <ion-title>Schedule</ion-title>
    </ion-toolbar>
    <ion-content class="ion-padding">
      @if (!currentUserId()) {
        <ion-note>Select a current user to view and create schedules.</ion-note>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <ion-item>
            <ion-label position="stacked">Medication</ion-label>
            <ion-select formControlName="userMedicationId" interface="popover">
              @for (userMedication of currentUserMedications(); track userMedication.id) {
                <ion-select-option [value]="userMedication.id">
                  {{ medicationName(userMedication) }}
                </ion-select-option>
              }
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Period</ion-label>
            <ion-select formControlName="periodId" interface="popover">
              @for (period of currentUserPeriods(); track period.id) {
                <ion-select-option [value]="period.id">{{ period.name }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Quantity per intake</ion-label>
            <ion-input formControlName="quantityValue" type="number" min="0.001" step="any"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Quantity unit</ion-label>
            <ion-select formControlName="quantityUnitId" interface="popover">
              @for (unit of medicationUnits(); track unit.id) {
                <ion-select-option [value]="unit.id">{{ unit.name }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
          <ion-note>Quantity is the amount taken per intake.</ion-note>
          <ion-button expand="block" type="submit" [disabled]="form.invalid">Schedule medication</ion-button>
        </form>

        @for (period of currentUserPeriods(); track period.id) {
          <ion-list>
            <ion-item lines="full">
              <ion-label><h2>{{ period.name }}</h2><p>{{ period.time }}</p></ion-label>
            </ion-item>
            @for (scheduled of scheduledFor(period.id); track scheduled.id) {
              <ion-item>
                <ion-label>
                  {{ medicationNameForScheduled(scheduled) }}
                  · {{ scheduled.quantityValue }} {{ unitAbbreviation(scheduled.quantityUnitId) }}
                </ion-label>
              </ion-item>
            } @empty {
              <ion-item><ion-label>No medications scheduled.</ion-label></ion-item>
            }
          </ion-list>
        } @empty {
          <ion-note>No periods registered for this user.</ion-note>
        }
      }
    </ion-content>
  `,
})
export class SchedulePageComponent {
  private readonly currentUser = inject(CurrentUserService);
  private readonly errorService = inject(ErrorService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly medicationPeriodsApi = inject(MedicationPeriodsApiService);
  private readonly periodsApi = inject(PeriodsApiService);
  private readonly userMedicationsApi = inject(UserMedicationsApiService);
  private readonly medicationsApi = inject(MedicationsApiService);
  private readonly unitsApi = inject(UnitsApiService);

  readonly currentUserId = this.currentUser.selectedUserId;
  readonly periods = signal<PeriodResponse[]>([]);
  readonly userMedications = signal<UserMedicationResponse[]>([]);
  readonly medications = signal<MedicationResponse[]>([]);
  readonly units = signal<UnitResponse[]>([]);
  readonly medicationPeriods = signal<MedicationPeriodResponse[]>([]);
  readonly currentUserPeriods = computed(() => filterCurrentUserPeriods(this.periods(), this.currentUserId()));
  readonly currentUserMedications = computed(() =>
    filterCurrentUserMedications(this.userMedications(), this.currentUserId()),
  );
  readonly medicationUnits = computed(() => this.units().filter((unit) => unit.type === 'MEDICATION'));
  readonly form = this.formBuilder.nonNullable.group({
    userMedicationId: ['', [Validators.required]],
    periodId: ['', [Validators.required]],
    quantityValue: [1, [Validators.required, Validators.min(0.001)]],
    quantityUnitId: ['', [Validators.required]],
  });

  constructor() {
    forkJoin({
      periods: this.periodsApi.list(),
      userMedications: this.userMedicationsApi.list(),
      medications: this.medicationsApi.list(),
      units: this.unitsApi.list(),
      medicationPeriods: this.medicationPeriodsApi.list(),
    }).subscribe({
      next: (data) => {
        this.periods.set(data.periods);
        this.userMedications.set(data.userMedications);
        this.medications.set(data.medications);
        this.units.set(data.units);
        this.medicationPeriods.set(data.medicationPeriods);
        if (!this.form.controls.quantityUnitId.value && data.units.find((unit) => unit.type === 'MEDICATION')) {
          this.form.controls.quantityUnitId.setValue(
            data.units.find((unit) => unit.type === 'MEDICATION')!.id,
          );
        }
      },
      error: (error: unknown) => void this.errorService.show(error),
    });
  }

  scheduledFor(periodId: string): MedicationPeriodResponse[] {
    return this.medicationPeriods().filter((scheduled) => scheduled.periodId === periodId);
  }

  medicationName(userMedication: UserMedicationResponse): string {
    const medication = this.medications().find((item) => item.id === userMedication.medicationId);
    return medication ? this.medicationLabel(medication) : 'Unknown medication';
  }

  medicationNameForScheduled(scheduled: MedicationPeriodResponse): string {
    const userMedication = this.userMedications().find((item) => item.id === scheduled.userMedicationId);
    return userMedication ? this.medicationName(userMedication) : 'Unknown medication';
  }

  unitAbbreviation(unitId: string): string {
    return this.units().find((unit) => unit.id === unitId)?.abbreviation ?? '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.medicationPeriodsApi.create(this.form.getRawValue()).subscribe({
      next: (scheduled) => {
        this.medicationPeriods.update((items) => [...items, scheduled]);
      },
      error: (error: unknown) => void this.errorService.show(error),
    });
  }

  private medicationLabel(medication: MedicationResponse): string {
    return `${medication.name} ${medication.dosageValue} ${this.unitAbbreviation(medication.dosageUnitId)}`;
  }
}
