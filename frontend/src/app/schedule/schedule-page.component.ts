import { Router, RouterLink } from '@angular/router';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  IonButton,
  IonFab, IonFabButton, IonIcon, IonItemOption, IonItemOptions, IonItemSliding,
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
import { ResourceActionsService } from '../core/services/resource-actions.service';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';

addIcons({ addOutline });
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    RouterLink,
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
    IonFab, IonFabButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption,
    RouterLink,
  ],
  template: `
    <ion-toolbar>
      <ion-title>Schedule</ion-title>
    </ion-toolbar>
    <ion-content class="ion-padding">
      <main class="page-shell schedule-page">
      @if (!currentUserId()) {
        <ion-note>Select a current user to view and create schedules.</ion-note>
      } @else {
        <section class="schedule-section" aria-labelledby="periods-title">
          <div class="section-heading">
            <div>
              <p class="eyebrow">When</p>
              <h2 id="periods-title">Periods</h2>
            </div>
            <ion-button fill="outline" routerLink="/periods/new">Add period</ion-button>
          </div>
          <ion-list class="surface-card">
            @for (period of currentUserPeriods(); track period.id) {
            <ion-item-sliding #periodSliding>
            <ion-item lines="full">
              <ion-label><h3>{{ period.name }}</h3><p class="period-time">{{ period.time }}</p></ion-label>
              <ion-button fill="clear" slot="end" (click)="editPeriod(period.id)" aria-label="Edit period">Edit</ion-button>
              <ion-button fill="clear" color="danger" slot="end" (click)="removePeriod(period.id, period.name)" aria-label="Delete period">Delete</ion-button>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option (click)="editPeriod(period.id); periodSliding.close()">Edit</ion-item-option>
              <ion-item-option color="danger" (click)="removePeriod(period.id, period.name); periodSliding.close()">Delete</ion-item-option>
            </ion-item-options>
            </ion-item-sliding>
            } @empty {
              <ion-item><ion-label>No periods registered for this user.</ion-label></ion-item>
            }
          </ion-list>
        </section>

        <section class="schedule-section" aria-labelledby="medications-title">
          <div class="section-heading">
            <div>
              <p class="eyebrow">What and how much</p>
              <h2 id="medications-title">Scheduled medications</h2>
            </div>
          </div>
          <form class="surface-card schedule-form" [formGroup]="form" (ngSubmit)="submit()">
            <ion-item>
              <ion-label position="stacked">Medication</ion-label>
              <ion-select formControlName="userMedicationId" interface="popover">
                @for (userMedication of currentUserMedications(); track userMedication.id) {
                  <ion-select-option [value]="userMedication.id">{{ medicationName(userMedication) }}</ion-select-option>
                }
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Period</ion-label>
              <ion-select formControlName="periodId" interface="popover">
                @for (period of currentUserPeriods(); track period.id) {
                  <ion-select-option [value]="period.id">{{ period.name }} · {{ period.time }}</ion-select-option>
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
            <ion-note>Periods define the time. Scheduled medications define what to take at that time.</ion-note>
            <ion-button expand="block" type="submit" [disabled]="form.invalid">
              {{ editingMedicationPeriodId() ? 'Save scheduled medication' : 'Schedule medication' }}
            </ion-button>
            @if (editingMedicationPeriodId()) {
              <ion-button expand="block" fill="outline" type="button" (click)="cancelMedicationPeriodEdit()">Cancel</ion-button>
            }
          </form>
          <ion-list class="surface-card scheduled-list">
            @for (scheduled of medicationPeriods(); track scheduled.id) {
              <ion-item-sliding #scheduledSliding>
                <ion-item>
                  <ion-label>
                    <h3>{{ medicationNameForScheduled(scheduled) }}</h3>
                    <p>{{ periodName(scheduled.periodId) }} · {{ scheduled.quantityValue }} {{ unitAbbreviation(scheduled.quantityUnitId) }}</p>
                  </ion-label>
                  <ion-button fill="clear" slot="end" (click)="editMedicationPeriod(scheduled)" aria-label="Edit scheduled medication">Edit</ion-button>
                  <ion-button fill="clear" color="danger" slot="end" (click)="removeMedicationPeriod(scheduled.id, medicationNameForScheduled(scheduled))" aria-label="Delete scheduled medication">Delete</ion-button>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option (click)="editMedicationPeriod(scheduled); scheduledSliding.close()">Edit</ion-item-option>
                  <ion-item-option color="danger" (click)="removeMedicationPeriod(scheduled.id, medicationNameForScheduled(scheduled)); scheduledSliding.close()">Delete</ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            } @empty {
              <ion-item><ion-label>No medications scheduled yet.</ion-label></ion-item>
            }
          </ion-list>
        </section>
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button routerLink="/periods/new" aria-label="Add period"><ion-icon name="add-outline"></ion-icon></ion-fab-button>
        </ion-fab>
      }
      </main>
    </ion-content>
  `,
  styles: [`
    .schedule-section { margin-bottom: 2rem; }
    .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: .75rem; }
    .section-heading h2 { margin: .2rem 0 0; font-size: 1.25rem; }
    .section-heading ion-button { flex: 0 0 auto; }
    .schedule-form { overflow: hidden; margin-bottom: .75rem; padding: .25rem 0 .75rem; }
    .schedule-form ion-note { display: block; padding: .75rem 1rem; color: var(--mm-text-muted); }
    .scheduled-list { overflow: hidden; }
    .period-time { color: var(--mm-primary-strong); font-size: 1rem; font-weight: 750; }
  `],
})
export class SchedulePageComponent {
  private readonly currentUser = inject(CurrentUserService);
  private readonly errorService = inject(ErrorService);
  private readonly router = inject(Router);
  private readonly actions = inject(ResourceActionsService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly medicationPeriodsApi = inject(MedicationPeriodsApiService);
  private readonly periodsApi = inject(PeriodsApiService);
  private readonly userMedicationsApi = inject(UserMedicationsApiService);
  private readonly medicationsApi = inject(MedicationsApiService);
  private readonly unitsApi = inject(UnitsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUserId = this.currentUser.selectedUserId;
  readonly periods = signal<PeriodResponse[]>([]);
  readonly userMedications = signal<UserMedicationResponse[]>([]);
  readonly medications = signal<MedicationResponse[]>([]);
  readonly units = signal<UnitResponse[]>([]);
  readonly medicationPeriods = signal<MedicationPeriodResponse[]>([]);
  readonly editingMedicationPeriodId = signal<string | null>(null);
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
    effect(() => {
      const userId = this.currentUserId();
      if (!userId) {
        this.periods.set([]);
        this.userMedications.set([]);
        this.medicationPeriods.set([]);
        return;
      }

      forkJoin({
        periods: this.periodsApi.list({ userId }),
        userMedications: this.userMedicationsApi.list({ userId }),
        medications: this.medicationsApi.list(),
        units: this.unitsApi.list(),
        medicationPeriods: this.medicationPeriodsApi.list(),
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
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

  periodName(periodId: string): string {
    const period = this.currentUserPeriods().find((item) => item.id === periodId);
    return period ? `${period.name} · ${period.time}` : 'Unknown period';
  }

  unitAbbreviation(unitId: string): string {
    return this.units().find((unit) => unit.id === unitId)?.abbreviation ?? '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const editingId = this.editingMedicationPeriodId();
    const operation = editingId
      ? this.medicationPeriodsApi.update(editingId, this.form.getRawValue())
      : this.medicationPeriodsApi.create(this.form.getRawValue());
    operation.subscribe({
      next: (scheduled) => {
        this.medicationPeriods.update((items) =>
          editingId ? items.map((item) => item.id === editingId ? scheduled : item) : [...items, scheduled]);
        this.cancelMedicationPeriodEdit();
      },
      error: (error: unknown) => void this.errorService.show(error),
    });
  }

  editPeriod(id: string): void {
    void this.router.navigate(['/periods', id, 'edit']);
  }

  editMedicationPeriod(item: MedicationPeriodResponse): void {
    this.editingMedicationPeriodId.set(item.id);
    this.form.patchValue(item);
  }

  cancelMedicationPeriodEdit(): void {
    this.editingMedicationPeriodId.set(null);
    this.form.reset({
      userMedicationId: '',
      periodId: '',
      quantityValue: 1,
      quantityUnitId: this.units().find((unit) => unit.type === 'MEDICATION')?.id ?? '',
    });
  }

  removeMedicationPeriod(id: string, label: string): void {
    this.actions.confirmDelete(label).subscribe((confirmed) => {
      if (!confirmed) return;
      this.medicationPeriodsApi.delete(id).subscribe({
        next: () => {
          this.medicationPeriods.update((items) => items.filter((item) => item.id !== id));
          this.actions.success('Schedule deleted');
        },
        error: (error: unknown) => this.actions.failure(error),
      });
    });
  }

  removePeriod(id: string, name: string): void {
    this.actions.confirmDelete(name).subscribe((confirmed) => {
      if (!confirmed) return;
      this.periodsApi.delete(id).subscribe({
        next: () => {
          this.periods.update((items) => items.filter((item) => item.id !== id));
          this.actions.success('Period deleted');
        },
        error: (error: unknown) => this.actions.failure(error),
      });
    });
  }

  private medicationLabel(medication: MedicationResponse): string {
    return `${medication.name} ${medication.dosageValue} ${this.unitAbbreviation(medication.dosageUnitId)}`;
  }
}
