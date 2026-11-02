import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBadge,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MedicationResponse,
  UnitResponse,
  UserMedicationResponse,
} from '../core/models/medication-manager';
import { CurrentUserService } from '../core/services/current-user.service';
import { MedicationsApiService } from '../core/services/resource-api.service';
import { UserMedicationsApiService } from '../core/services/user-medications-api.service';
import { UnitsCacheService } from '../core/services/units-cache.service';

addIcons({ addOutline });

@Component({
  selector: 'app-my-medications-page',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonFab, IonFabButton, IonIcon],
  template: `
    <ion-header><ion-toolbar><ion-title>My Medications</ion-title></ion-toolbar></ion-header>
    <ion-content>
      @if (!currentUserId()) {
        <p class="empty-state">Select a current user to view registered medications.</p>
      } @else {
        <ion-list>
          @for (item of items(); track item.id) {
            <ion-item>
              <ion-label>
                <h2>{{ medicationName(item.medicationId) }}</h2>
                <p>{{ medicationDosage(item.medicationId) }} · {{ item.currentStockValue }} {{ unitAbbreviation(item.stockUnitId) }}</p>
                <p>{{ item.startDate }}{{ item.endDate ? ' – ' + item.endDate : '' }}</p>
              </ion-label>
              <ion-badge slot="end" [color]="item.active ? 'success' : 'medium'">
                {{ item.active ? 'Active' : 'Inactive' }}
              </ion-badge>
            </ion-item>
          } @empty {
            <ion-item><ion-label>No medications registered yet.</ion-label></ion-item>
          }
        </ion-list>
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button routerLink="/my-medications/new" aria-label="Add medication">
            <ion-icon name="add-outline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      }
    </ion-content>
  `,
})
export class MyMedicationsPageComponent {
  private readonly currentUser = inject(CurrentUserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userMedicationsApi = inject(UserMedicationsApiService);
  private readonly medicationsApi = inject(MedicationsApiService);
  private readonly unitsCache = inject(UnitsCacheService);
  readonly currentUserId = this.currentUser.selectedUserId;
  readonly items = signal<UserMedicationResponse[]>([]);
  readonly medications = signal<MedicationResponse[]>([]);
  readonly units = this.unitsCache.units;

  constructor() {
    this.unitsCache.load().pipe(takeUntilDestroyed()).subscribe();
    this.medicationsApi.list().pipe(takeUntilDestroyed()).subscribe((items) => this.medications.set(items));
    effect(() => {
      const userId = this.currentUserId();
      this.items.set([]);
      if (userId) {
        this.userMedicationsApi.listForUser(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => this.items.set(items));
      }
    });
  }

  medicationName(id: string): string {
    return this.medications().find((medication) => medication.id === id)?.name ?? 'Unknown medication';
  }

  medicationDosage(id: string): string {
    const medication = this.medications().find((item) => item.id === id);
    if (!medication) return '';
    const unit = this.units().find((item) => item.id === medication.dosageUnitId);
    return `${medication.dosageValue} ${unit?.abbreviation ?? ''}`.trim();
  }

  unitAbbreviation(id: string): string {
    return this.units().find((unit: UnitResponse) => unit.id === id)?.abbreviation ?? '';
  }
}
