import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { IntakeRecordResponse, MedicationPeriodResponse, MedicationResponse, PeriodResponse, UnitResponse } from '../core/models/medication-manager';
import { CurrentUserService } from '../core/services/current-user.service';
import { IntakeRecordsApiService, MedicationPeriodsApiService, MedicationsApiService, PeriodsApiService, UnitsApiService, UserMedicationsApiService } from '../core/services/resource-api.service';
import { ResourceActionsService } from '../core/services/resource-actions.service';

addIcons({ addOutline });

interface IntakeRow extends IntakeRecordResponse {
  medicationName: string;
  periodName: string;
  quantityUnitName?: string;
}

interface HistoryDay {
  key: string;
  date: number;
  status: 'taken' | 'partial' | 'missed' | 'empty';
}

@Component({
  selector: 'app-intake-records-page',
  standalone: true,
  imports: [DatePipe, RouterLink, IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonChip, IonFab, IonFabButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption],
  template: `
    <ion-header><ion-toolbar><ion-title>Intake</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <main class="page-shell">
      <section class="history-summary surface-card" aria-labelledby="history-title">
        <div>
          <p class="eyebrow">Histórico e aderência</p>
          <h1 id="history-title" class="section-title">Seu progresso</h1>
        </div>
        <div class="metrics">
          <div><strong>{{ adherencePercent() }}%</strong><span>Aderência</span></div>
          <div><strong>{{ streak() }}</strong><span>Dias seguidos</span></div>
        </div>
      </section>
      @if (!currentUserId()) {
        <ion-item><ion-label>Select a current user to view intake records.</ion-label></ion-item>
      } @else {
        <section class="calendar-card surface-card" aria-labelledby="calendar-title">
          <div class="calendar-heading">
            <h2 id="calendar-title">{{ currentMonth | date: 'MMMM yyyy' }}</h2>
            <span class="muted">Verde: completo · Âmbar: parcial · Vermelho: não tomado</span>
          </div>
          <div class="calendar-grid" role="grid" aria-label="Calendário mensal de aderência">
            @for (day of monthDays(); track day.key) {
              <div class="calendar-day" [class]="day.status" role="gridcell" [attr.aria-label]="day.date + ': ' + day.status">
                <span>{{ day.date }}</span>
                @if (day.status !== 'empty') { <i aria-hidden="true"></i> }
              </div>
            }
          </div>
        </section>
        <ion-list>
          @for (record of records(); track record.id) {
            <ion-item-sliding #sliding>
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
              <ion-button fill="clear" slot="end" (click)="edit(record.id)" aria-label="Edit intake record">Edit</ion-button>
              <ion-button fill="clear" color="danger" slot="end" (click)="remove(record.id, record.medicationName)" aria-label="Delete intake record">Delete</ion-button>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option (click)="edit(record.id); sliding.close()">Edit</ion-item-option>
              <ion-item-option color="danger" (click)="remove(record.id, record.medicationName); sliding.close()">Delete</ion-item-option>
            </ion-item-options>
            </ion-item-sliding>
          } @empty {
            <ion-item><ion-label>No intake records for this user.</ion-label></ion-item>
          }
        </ion-list>
      }
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button routerLink="/intake-records/new" aria-label="Add intake record"><ion-icon name="add-outline"></ion-icon></ion-fab-button>
      </ion-fab>
      </main>
    </ion-content>
  `,
  styles: [`
    .history-summary { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; padding: 1rem; }
    .history-summary h1 { margin-bottom: 0; }
    .metrics { display: flex; gap: 1rem; text-align: center; }
    .metrics strong, .metrics span { display: block; }
    .metrics strong { color: var(--mm-primary-strong); font-size: 1.35rem; }
    .metrics span { color: var(--mm-text-muted); font-size: .7rem; }
    .calendar-card { margin-bottom: 1.25rem; padding: 1rem; }
    .calendar-heading { display: flex; align-items: baseline; justify-content: space-between; gap: .75rem; }
    .calendar-heading h2 { margin: 0 0 .75rem; font-size: 1rem; text-transform: capitalize; }
    .calendar-heading span { font-size: .7rem; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: .35rem; }
    .calendar-day { display: grid; min-height: 2.5rem; place-items: center; border-radius: .6rem; color: var(--mm-text-muted); font-size: .8rem; }
    .calendar-day:not(.empty) { font-weight: 700; }
    .calendar-day i { width: .35rem; height: .35rem; border-radius: 50%; background: currentColor; }
    .calendar-day.taken { color: var(--mm-status-taken); background: var(--mm-status-taken-soft); }
    .calendar-day.partial { color: var(--mm-status-pending); background: var(--mm-status-pending-soft); }
    .calendar-day.missed { color: var(--mm-status-missed); background: var(--mm-status-missed-soft); }
    ion-chip { font-weight: 700; }
    .status-pending { --background: var(--mm-status-pending-soft); --color: var(--mm-status-pending); }
    .status-taken { --background: var(--mm-status-taken-soft); --color: var(--mm-status-taken); }
    .status-skipped, .status-overdue { --background: var(--mm-status-missed-soft); --color: var(--mm-status-missed); }
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
  readonly currentMonth = new Date();
  readonly adherencePercent = computed(() => {
    const records = this.records();
    const completed = records.filter((record) => record.status === 'TAKEN').length;
    return records.length ? Math.round((completed / records.length) * 100) : 0;
  });
  readonly streak = computed(() => {
    const takenDays = new Set(this.records().filter((record) => record.status === 'TAKEN').map((record) => this.dateKey(new Date(record.scheduledAt))));
    let count = 0;
    const cursor = new Date();
    while (takenDays.has(this.dateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  });
  readonly monthDays = computed<HistoryDay[]>(() => {
    const monthStart = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const daysInMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0).getDate();
    const result: HistoryDay[] = Array.from({ length: firstWeekday }, (_, index) => ({ key: `empty-${index}`, date: 0, status: 'empty' }));
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
      const key = this.dateKey(date);
      const statuses = this.records().filter((record) => this.dateKey(new Date(record.scheduledAt)) === key).map((record) => record.status);
      const status: HistoryDay['status'] = statuses.length === 0 ? 'empty' : statuses.every((item) => item === 'TAKEN') ? 'taken' : statuses.every((item) => item !== 'TAKEN') ? 'missed' : 'partial';
      result.push({ key, date: day, status });
    }
    return result;
  });
  private readonly router = inject(Router);
  private readonly actions = inject(ResourceActionsService);

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

  edit(id: string): void {
    void this.router.navigate(['/intake-records', id, 'edit']);
  }

  remove(id: string, label: string): void {
    this.actions.confirmDelete(label).subscribe((confirmed) => {
      if (!confirmed) return;
      this.intakesApi.delete(id).subscribe({
        next: () => {
          this.records.update((items) => items.filter((item) => item.id !== id));
          this.actions.success('Intake record deleted');
        },
        error: (error: unknown) => this.actions.failure(error),
      });
    });
  }

  private dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
