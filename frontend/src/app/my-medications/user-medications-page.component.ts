import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
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
import { addOutline } from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MedicationResponse, UnitResponse, UserMedicationResponse } from '../core/models/medication-manager';
import { CurrentUserService } from '../core/services/current-user.service';
import { MedicationsApiService } from '../core/services/resource-api.service';
import { UserMedicationsApiService } from '../core/services/user-medications-api.service';
import { UnitsCacheService } from '../core/services/units-cache.service';
import { ResourceActionsService } from '../core/services/resource-actions.service';

addIcons({ addOutline });

@Component({
  selector: 'app-user-medications-page',
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
  ],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>My medications</ion-title></ion-toolbar>
    </ion-header>
    <ion-content>
      <main class="page-shell">
        <header class="page-intro">
          <p class="eyebrow">Personal catalogue</p>
          <h1 class="section-title">Medications for this user</h1>
          <p class="muted">Register a medication from the catalogue and manage its usage period and stock.</p>
        </header>

        @if (!currentUserId()) {
          <section class="surface-card empty-state">
            <h2>Select a current user</h2>
            <p class="muted">Choose a user in the header before registering medications.</p>
          </section>
        } @else {
          <ion-list class="surface-card medication-list">
            @for (item of items(); track item.id) {
              <ion-item-sliding #sliding>
                <ion-item lines="full">
                  <ion-label>
                    <h2>{{ medicationName(item.medicationId) }}</h2>
                    <p>{{ medicationDosage(item.medicationId) }}</p>
                    <p>Stock: {{ item.currentStockValue }} {{ unitAbbreviation(item.stockUnitId) }}</p>
                    <p>{{ item.startDate }}{{ item.endDate ? ' – ' + item.endDate : ' · Continuous' }}</p>
                  </ion-label>
                  <ion-badge slot="end" [color]="item.active ? 'success' : 'medium'">
                    {{ item.active ? 'Active' : 'Inactive' }}
                  </ion-badge>
                  <ion-button fill="clear" slot="end" (click)="edit(item.id)" aria-label="Edit registered medication">Edit</ion-button>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option (click)="edit(item.id); sliding.close()">Edit</ion-item-option>
                  <ion-item-option color="danger" (click)="remove(item.id, medicationName(item.medicationId)); sliding.close()">Delete</ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            } @empty {
              <ion-item><ion-label>No medications registered for this user yet.</ion-label></ion-item>
            }
          </ion-list>
          <ion-button expand="block" routerLink="/my-medications/new">Register medication</ion-button>
        }
      </main>
      @if (currentUserId()) {
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button routerLink="/my-medications/new" aria-label="Register medication">
            <ion-icon name="add-outline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      }
    </ion-content>
  `,
  styles: [`
    .page-intro { margin-bottom: 1.25rem; }
    .page-intro h1 { margin-bottom: .5rem; }
    .medication-list { overflow: hidden; margin-bottom: 1rem; }
    .empty-state { padding: 1.25rem; text-align: center; }
    .empty-state h2 { margin: 0 0 .35rem; font-size: 1.1rem; }
  `],
})
export class UserMedicationsPageComponent {
  private readonly currentUser = inject(CurrentUserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userMedicationsApi = inject(UserMedicationsApiService);
  private readonly medicationsApi = inject(MedicationsApiService);
  private readonly unitsCache = inject(UnitsCacheService);
  private readonly router = inject(Router);
  private readonly actions = inject(ResourceActionsService);

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
        this.userMedicationsApi.listForUser(userId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((items) => this.items.set(items));
      }
    });
  }

  medicationName(id: string): string {
    return this.medications().find((medication) => medication.id === id)?.name ?? 'Unknown medication';
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

  remove(id: string, name: string): void {
    this.actions.confirmDelete(name).subscribe((confirmed) => {
      if (!confirmed) return;
      this.userMedicationsApi.delete(id).subscribe({
        next: () => {
          this.items.update((items) => items.filter((item) => item.id !== id));
          this.actions.success('Medication registration deleted');
        },
        error: (error: unknown) => this.actions.failure(error),
      });
    });
  }
}
