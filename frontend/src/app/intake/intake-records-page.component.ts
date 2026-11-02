import { DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { IntakeRecordResponse, MedicationPeriodResponse, MedicationResponse, PeriodResponse, UnitResponse } from '../core/models/medication-manager';
import { CurrentUserService } from '../core/services/current-user.service';
import { IntakeRecordsApiService, MedicationPeriodsApiService, MedicationsApiService, PeriodsApiService, UnitsApiService, UserMedicationsApiService } from '../core/services/resource-api.service';

addIcons({ addOutline });

interface IntakeRow extends IntakeRecordResponse {
  medicationName: string;
  periodName: string;
  quantityUnitName?: string;
}

@Component({
  selector: 'app-intake-records-page',
  standalone: true,
  imports: [DatePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonChip, IonFab, IonFabButton, IonIcon],
  template: `
    <ion-header><ion-toolbar><ion-title>Intake</ion-title></ion-toolbar></ion-header>
    <ion-content>
      @if (!currentUserId()) {
        <ion-item><ion-label>Select a current user to view intake records.</ion-label></ion-item>
      } @else {
        <ion-list>
          @for (record of records(); track record.id) {
            <ion-item>
              <ion-label>
                <h2>{{ record.medicationName }} · {{ record.periodName }}</h2>
                <p>{{ record.scheduledAt | date: 'medium' }}</p>
                @if (record.quantityValue !== null && record.quantityValue !== undefined) {
                  <p>Actual quantity: {{ record.quantityValue }} {{ record.quantityUnitName ?? '' }}</p>
                } @else {
                  <p>No actual quantity recorded.</p>
                }
              </ion-label>
              <ion-chip [class]="'status-' + record.status.toLowerCase()">{{ record.status }}</ion-chip>
            </ion-item>
          } @empty {
            <ion-item><ion-label>No intake records for this user.</ion-label></ion-item>
          }
        </ion-list>
      }
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button routerLink="/intake-records/new" aria-label="Add intake record"><ion-icon name="add-outline"></ion-icon></ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    ion-chip { color: white; font-weight: 600; }
    .status-pending { --background: #607d8b; }
    .status-taken { --background: #2e7d32; }
    .status-skipped { --background: #ef6c00; }
    .status-overdue { --background: #c62828; }
  `],
})
export class IntakeRecordsPageComponent {
  private readonly currentUser = inject(CurrentUserService);
  private readonly userMedicationsApi = inject(UserMedicationsApiService);
  private readonly periodsApi = inject(PeriodsApiService);
  private readonly medicationPeriodsApi = inject(MedicationPeriodsApiService);
  private readonly medicationsApi = inject(MedicationsApiService);
  private readonly intakesApi = inject(IntakeRecordsApiService);
  private readonly unitsApi = inject(UnitsApiService);
  readonly currentUserId = this.currentUser.selectedUserId;
  readonly records = signal<IntakeRow[]>([]);

  constructor() {
    effect(() => this.load(this.currentUserId()));
  }

  private load(userId: string | null): void {
    if (!userId) {
      this.records.set([]);
      return;
    }
    forkJoin({
      userMedications: this.userMedicationsApi.list({ userId }),
      periods: this.periodsApi.list({ userId }),
      medicationPeriods: this.medicationPeriodsApi.list(),
      medications: this.medicationsApi.list(),
      units: this.unitsApi.list(),
      intakeRecords: this.intakesApi.list(),
    }).subscribe(({ userMedications, periods, medicationPeriods, medications, units, intakeRecords }) => {
      const ownedUserMedications = userMedications.filter((item) => item.userId === userId);
      const ownedPeriods = periods.filter((item) => item.userId === userId);
      const medicationIds = new Set(ownedUserMedications.map((item) => item.id));
      const periodIds = new Set(ownedPeriods.map((item) => item.id));
      const ownedMedicationPeriods = medicationPeriods.filter(
        (item) => medicationIds.has(item.userMedicationId) && periodIds.has(item.periodId),
      );
      const ownedPeriodIds = new Set(ownedMedicationPeriods.map((item) => item.id));
      const periodById = new Map(ownedPeriods.map((item) => [item.id, item]));
      const medicationByUserMedicationId = new Map(
        ownedUserMedications.map((item) => [item.id, item.medicationId]),
      );
      const medicationById = new Map(medications.map((item) => [item.id, item]));
      const unitById = new Map(units.map((item) => [item.id, item]));
      this.records.set(
        intakeRecords
          .filter((record) => ownedPeriodIds.has(record.medicationPeriodId))
          .map((record) => {
            const medicationPeriod = ownedMedicationPeriods.find((item) => item.id === record.medicationPeriodId) as MedicationPeriodResponse;
            const medicationId = medicationByUserMedicationId.get(medicationPeriod.userMedicationId);
            return {
              ...record,
              medicationName: medicationById.get(medicationId ?? '')?.name ?? 'Medication',
              periodName: periodById.get(medicationPeriod.periodId)?.name ?? 'Period',
              quantityUnitName: unitById.get(record.quantityUnitId ?? '')?.abbreviation,
            };
          }),
      );
    });
  }
}
