import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, checkmarkCircleOutline, ellipseOutline, timeOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IntakeRecordResponse,
  IntakeStatus,
  MedicationPeriodResponse,
  MedicationResponse,
  PeriodResponse,
  UnitResponse,
  UserMedicationResponse,
} from '../core/models/medication-manager';
import { CurrentUserService } from '../core/services/current-user.service';
import {
  IntakeRecordsApiService,
  MedicationPeriodsApiService,
  MedicationsApiService,
  PeriodsApiService,
} from '../core/services/resource-api.service';
import { UserMedicationsApiService } from '../core/services/user-medications-api.service';
import { UnitsCacheService } from '../core/services/units-cache.service';
import { ResourceActionsService } from '../core/services/resource-actions.service';

addIcons({ addOutline, checkmarkCircleOutline, ellipseOutline, timeOutline });

interface DashboardDose {
  record: IntakeRecordResponse;
  persisted: boolean;
  medicationName: string;
  dosage: string;
  quantity: string;
  periodName: string;
  periodTime: string;
}

interface CalendarDay {
  key: string;
  label: string;
  date: number;
  isToday: boolean;
}

@Component({
  selector: 'app-my-medications-page',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonChip,
    IonIcon,
    IonFab,
    IonFabButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Hoje</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <main class="page-shell">
        <header class="welcome">
          <p class="eyebrow">Plano de hoje</p>
          <h1 class="section-title">{{ today | date: 'EEEE, d MMMM' }}</h1>
          <p class="muted">Acompanhe suas doses com tranquilidade.</p>
        </header>

        <nav class="date-strip" aria-label="Selecionar dia">
          @for (day of weekDays(); track day.key) {
            <button
              type="button"
              class="date-button"
              [class.selected]="day.key === selectedDate()"
              [attr.aria-current]="day.key === selectedDate() ? 'date' : null"
              [attr.aria-label]="day.label + ' ' + day.date"
              (click)="selectedDate.set(day.key)"
            >
              <span>{{ day.label }}</span>
              <strong>{{ day.date }}</strong>
            </button>
          }
        </nav>

        <section class="progress-card surface-card" aria-labelledby="progress-title">
          <div class="progress-ring" [style.--progress]="progressPercent() + '%'">
            <strong>{{ progressPercent() }}%</strong>
            <span>feito</span>
          </div>
          <div>
            <p class="eyebrow">Aderência diária</p>
            <h2 id="progress-title">{{ takenCount() }} de {{ selectedDoses().length }} doses concluídas</h2>
            <p class="muted">Cada registro conta. Você está no caminho certo.</p>
          </div>
        </section>

        @if (!currentUserId()) {
          <section class="empty-state surface-card">
            <ion-icon name="ellipse-outline" aria-hidden="true"></ion-icon>
            <h2>Selecione um usuário</h2>
            <p class="muted">Escolha o usuário atual no topo para carregar o plano.</p>
          </section>
        } @else {
          @for (group of doseGroups(); track group.name) {
            <section class="dose-group" [attr.aria-labelledby]="'group-' + group.name">
              <div class="group-heading">
                <h2 [id]="'group-' + group.name">{{ group.name }}</h2>
                <span class="muted">{{ group.doses.length }} {{ group.doses.length === 1 ? 'dose' : 'doses' }}</span>
              </div>
              @for (dose of group.doses; track dose.record.id) {
                <article class="dose-card surface-card">
                  <div class="dose-icon" aria-hidden="true">
                    <ion-icon name="ellipse-outline"></ion-icon>
                  </div>
                  <div class="dose-content">
                    <div class="dose-topline">
                      <span class="dose-time">{{ dose.periodTime }}</span>
                      <ion-chip [class]="'status-chip status-' + dose.record.status.toLowerCase()">
                        {{ statusLabel(dose.record.status) }}
                      </ion-chip>
                    </div>
                    <h3>{{ dose.medicationName }}</h3>
                    <p class="dose-detail"><strong>{{ dose.dosage }}</strong> · {{ dose.quantity }}</p>
                    <p class="muted">{{ dose.periodName }} · Com água</p>
                    @if (dose.record.status !== 'TAKEN') {
                      <ion-button
                        class="take-button"
                        expand="block"
                        size="default"
                        (click)="takeDose(dose)"
                        [attr.aria-label]="'Marcar ' + dose.medicationName + ' como tomada'"
                      >
                        <ion-icon slot="start" name="checkmark-circle-outline"></ion-icon>
                        Marcar como tomado
                      </ion-button>
                    } @else {
                      <p class="taken-message"><ion-icon name="checkmark-circle-outline"></ion-icon> Tomado</p>
                    }
                  </div>
                </article>
              } @empty {
                <div class="empty-group surface-card">
                  <p class="muted">Nenhuma dose registrada neste período.</p>
                </div>
              }
            </section>
          }

        }
      </main>
      @if (currentUserId()) {
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button routerLink="/my-medications/new" aria-label="Adicionar medicamento">
            <ion-icon name="add-outline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      }
    </ion-content>
  `,
  styles: [`
    .welcome { margin-bottom: 1.25rem; }
    .welcome h1 { text-transform: capitalize; }
    .date-strip { display: flex; gap: .5rem; overflow-x: auto; padding: .25rem 0 1.25rem; scrollbar-width: none; }
    .date-strip::-webkit-scrollbar { display: none; }
    .date-button { min-width: 3.5rem; min-height: 4.25rem; padding: .5rem .35rem; border: 1px solid var(--mm-border); border-radius: .875rem; background: var(--mm-surface); color: var(--mm-text-muted); }
    .date-button span, .date-button strong { display: block; }
    .date-button span { font-size: .75rem; text-transform: uppercase; }
    .date-button strong { margin-top: .35rem; color: var(--mm-text); font-size: 1.25rem; }
    .date-button.selected { border-color: var(--mm-primary); background: var(--mm-primary); color: white; }
    .date-button.selected strong { color: white; }
    .progress-card { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; }
    .progress-card h2 { margin: .25rem 0; font-size: 1rem; }
    .progress-card p { margin: .25rem 0; }
    .progress-ring { --progress: 0%; display: grid; width: 5.25rem; height: 5.25rem; flex: 0 0 auto; place-content: center; border-radius: 50%; background: conic-gradient(var(--mm-status-taken) var(--progress), var(--mm-status-taken-soft) 0); text-align: center; }
    .progress-ring::before { position: absolute; width: 4.25rem; height: 4.25rem; border-radius: 50%; background: white; content: ''; }
    .progress-ring strong, .progress-ring span { position: relative; z-index: 1; display: block; text-align: center; }
    .progress-ring strong { font-size: 1.1rem; }
    .progress-ring span { font-size: .65rem; color: var(--mm-text-muted); }
    .dose-group { margin: 1.25rem 0; }
    .group-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: .6rem; }
    .group-heading h2 { margin: 0; font-size: 1.05rem; }
    .dose-card { display: flex; gap: .75rem; margin-bottom: .75rem; padding: 1rem; }
    .dose-icon { display: grid; width: 2.5rem; height: 2.5rem; flex: 0 0 auto; place-items: center; border-radius: .75rem; background: var(--mm-tag-blue); color: var(--mm-primary-strong); }
    .dose-content { min-width: 0; flex: 1; }
    .dose-topline { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
    .dose-time { color: var(--mm-primary-strong); font-size: 1.1rem; font-weight: 750; }
    .dose-card h3 { margin: .35rem 0; font-size: 1.1rem; }
    .dose-detail, .dose-card .muted { margin: .25rem 0; }
    .status-chip { font-size: .7rem; font-weight: 700; }
    .status-taken { --background: var(--mm-status-taken-soft); --color: var(--mm-status-taken); }
    .status-pending { --background: var(--mm-status-pending-soft); --color: var(--mm-status-pending); }
    .status-overdue, .status-skipped { --background: var(--mm-status-missed-soft); --color: var(--mm-status-missed); }
    .take-button { margin-top: .75rem; }
    .taken-message { display: flex; align-items: center; gap: .35rem; margin: .75rem 0 0; color: var(--mm-status-taken); font-weight: 700; }
    .empty-state, .empty-group { padding: 1.25rem; text-align: center; }
    .empty-state ion-icon { font-size: 2rem; color: var(--mm-primary); }
    .empty-state h2 { margin: .5rem 0 .25rem; font-size: 1.1rem; }
    .registered-section { margin: 2rem 0 4rem; }
    .registered-section ion-list { overflow: hidden; }
  `],
})
export class MyMedicationsPageComponent {
  private readonly currentUser = inject(CurrentUserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userMedicationsApi = inject(UserMedicationsApiService);
  private readonly medicationsApi = inject(MedicationsApiService);
  private readonly periodsApi = inject(PeriodsApiService);
  private readonly medicationPeriodsApi = inject(MedicationPeriodsApiService);
  private readonly intakesApi = inject(IntakeRecordsApiService);
  private readonly unitsCache = inject(UnitsCacheService);
  private readonly router = inject(Router);
  private readonly actions = inject(ResourceActionsService);

  readonly currentUserId = this.currentUser.selectedUserId;
  readonly items = signal<UserMedicationResponse[]>([]);
  readonly medications = signal<MedicationResponse[]>([]);
  readonly periods = signal<PeriodResponse[]>([]);
  readonly medicationPeriods = signal<MedicationPeriodResponse[]>([]);
  readonly records = signal<IntakeRecordResponse[]>([]);
  readonly units = this.unitsCache.units;
  readonly today = new Date();
  readonly selectedDate = signal(this.dateKey(this.today));
  readonly weekDays = computed<CalendarDay[]>(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(this.today);
    date.setDate(this.today.getDate() - 2 + index);
    return { key: this.dateKey(date), label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), date: date.getDate(), isToday: index === 2 };
  }));
  readonly selectedDoses = computed(() => this.records()
    .filter((record) => this.dateKey(new Date(record.scheduledAt)) === this.selectedDate())
    .map((record) => this.toDose(record, true))
    .filter((dose): dose is DashboardDose => dose !== null)
    .concat(this.medicationPeriods()
      .filter((scheduled) => this.items().some((item) => item.id === scheduled.userMedicationId && item.active))
      .map((scheduled) => {
        const period = this.periods().find((item) => item.id === scheduled.periodId);
        if (!period) return null;
        const scheduledAt = this.scheduledAt(this.selectedDate(), period.time);
        const hasRecord = this.records().some((record) =>
          record.medicationPeriodId === scheduled.id && this.dateKey(new Date(record.scheduledAt)) === this.selectedDate());
        return hasRecord ? null : this.toDose({
          id: `pending-${scheduled.id}-${this.selectedDate()}`,
          medicationPeriodId: scheduled.id,
          scheduledAt,
          takenAt: null,
          quantityValue: null,
          quantityUnitId: null,
          status: 'PENDING',
        }, false);
      })
      .filter((dose): dose is DashboardDose => dose !== null))
    .sort((a, b) => a.periodTime.localeCompare(b.periodTime)));
  readonly takenCount = computed(() => this.selectedDoses().filter((dose) => dose.record.status === 'TAKEN').length);
  readonly progressPercent = computed(() => {
    const total = this.selectedDoses().length;
    return total ? Math.round((this.takenCount() / total) * 100) : 0;
  });
  readonly doseGroups = computed(() => {
    const groups = [
      { name: 'Manhã', doses: [] as DashboardDose[] },
      { name: 'Tarde', doses: [] as DashboardDose[] },
      { name: 'Noite', doses: [] as DashboardDose[] },
    ];
    for (const dose of this.selectedDoses()) {
      const hour = Number(dose.periodTime.slice(0, 2));
      const group = hour < 12 ? groups[0] : hour < 18 ? groups[1] : groups[2];
      group.doses.push(dose);
    }
    return groups;
  });

  constructor() {
    this.unitsCache.load().pipe(takeUntilDestroyed()).subscribe();
    this.medicationsApi.list().pipe(takeUntilDestroyed()).subscribe((items) => this.medications.set(items));
    effect(() => this.loadForUser(this.currentUserId()));
  }

  private loadForUser(userId: string | null): void {
    if (!userId) {
      this.items.set([]); this.periods.set([]); this.medicationPeriods.set([]); this.records.set([]);
      return;
    }
    forkJoin({
      items: this.userMedicationsApi.listForUser(userId),
      periods: this.periodsApi.list({ userId }),
      medicationPeriods: this.medicationPeriodsApi.list(),
      records: this.intakesApi.list(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ items, periods, medicationPeriods, records }) => {
      const itemIds = new Set(items.map((item) => item.id));
      const periodIds = new Set(periods.map((period) => period.id));
      const ownedMedicationPeriods = medicationPeriods.filter((item) => itemIds.has(item.userMedicationId) && periodIds.has(item.periodId));
      const ownedMedicationPeriodIds = new Set(ownedMedicationPeriods.map((item) => item.id));
      this.items.set(items);
      this.periods.set(periods);
      this.medicationPeriods.set(ownedMedicationPeriods);
      this.records.set(records.filter((record) => ownedMedicationPeriodIds.has(record.medicationPeriodId)));
    });
  }

  private toDose(record: IntakeRecordResponse, persisted: boolean): DashboardDose | null {
    const medicationPeriod = this.medicationPeriods().find((item) => item.id === record.medicationPeriodId);
    const period = this.periods().find((item) => item.id === medicationPeriod?.periodId);
    const userMedication = this.items().find((item) => item.id === medicationPeriod?.userMedicationId);
    const medication = this.medications().find((item) => item.id === userMedication?.medicationId);
    if (!medicationPeriod || !period || !medication) return null;
    return {
      record,
      persisted,
      medicationName: medication.name,
      dosage: `${medication.dosageValue} ${this.unitAbbreviation(medication.dosageUnitId)}`,
      quantity: `${medicationPeriod.quantityValue} ${this.unitAbbreviation(medicationPeriod.quantityUnitId)}`,
      periodName: period.name,
      periodTime: period.time.slice(0, 5),
    };
  }

  takeDose(dose: DashboardDose): void {
    const previous = dose.record;
    const request = {
      medicationPeriodId: previous.medicationPeriodId,
      scheduledAt: previous.scheduledAt,
      takenAt: new Date().toISOString(),
      quantityValue: dose.record.quantityValue ?? Number(dose.quantity.split(' ')[0]),
      quantityUnitId: dose.record.quantityUnitId ?? this.medicationPeriods().find((item) => item.id === previous.medicationPeriodId)?.quantityUnitId ?? null,
      status: 'TAKEN' as IntakeStatus,
    };
    const operation = dose.persisted
      ? this.intakesApi.update(previous.id, request)
      : this.intakesApi.create(request);
    operation.subscribe({
      next: (updated) => {
        this.records.update((records) => dose.persisted
          ? records.map((record) => record.id === updated.id ? updated : record)
          : [...records, updated]);
        this.actions.undoable(`${dose.medicationName} marcado como tomado`, () => {
          if (dose.persisted) {
            this.intakesApi.update(previous.id, {
              medicationPeriodId: previous.medicationPeriodId,
              scheduledAt: previous.scheduledAt,
              takenAt: previous.takenAt ?? null,
              quantityValue: previous.quantityValue ?? null,
              quantityUnitId: previous.quantityUnitId ?? null,
              status: previous.status,
            }).subscribe({
              next: (restored) => this.records.update((records) => records.map((record) => record.id === restored.id ? restored : record)),
              error: (error: unknown) => this.actions.failure(error),
            });
          } else {
            this.intakesApi.delete(updated.id).subscribe({
              next: () => this.records.update((records) => records.filter((record) => record.id !== updated.id)),
              error: (error: unknown) => this.actions.failure(error),
            });
          }
        });
      },
      error: (error: unknown) => this.actions.failure(error),
    });
  }

  statusLabel(status: IntakeStatus): string {
    return { TAKEN: 'Tomado', PENDING: 'Pendente', SKIPPED: 'Pulado', OVERDUE: 'Atrasado' }[status];
  }

  medicationName(id: string): string {
    return this.medications().find((medication) => medication.id === id)?.name ?? 'Medicamento';
  }

  medicationDosage(id: string): string {
    const medication = this.medications().find((item) => item.id === id);
    return medication ? `${medication.dosageValue} ${this.unitAbbreviation(medication.dosageUnitId)}` : '';
  }

  unitAbbreviation(id: string): string {
    return this.units().find((unit: UnitResponse) => unit.id === id)?.abbreviation ?? '';
  }

  edit(id: string): void {
    void this.router.navigate(['/my-medications', id, 'edit']);
  }

  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private scheduledAt(dateKey: string, time: string): string {
    return new Date(`${dateKey}T${time.slice(0, 5)}:00`).toISOString();
  }
}
