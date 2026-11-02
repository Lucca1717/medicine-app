import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MedicationsCacheService } from '../../core/services/medications-cache.service';
import { UnitsCacheService } from '../../core/services/units-cache.service';

addIcons({ addOutline });

@Component({
  selector: 'app-medications-page',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon],
  template: `
    <ion-header><ion-toolbar><ion-title>Medications</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <ion-list>
        @for (medication of medications(); track medication.id) {
          <ion-item>
            <ion-label>
              <h2>{{ medication.name }}</h2>
              <p>{{ medication.dosageValue }} {{ unitAbbreviation(medication.dosageUnitId) }}</p>
            </ion-label>
          </ion-item>
        } @empty {
          <ion-item><ion-label>No medications registered yet.</ion-label></ion-item>
        }
      </ion-list>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button routerLink="/medications/new" aria-label="Add medication">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})
export class MedicationsPageComponent {
  private readonly medicationCache = inject(MedicationsCacheService);
  private readonly unitsCache = inject(UnitsCacheService);
  readonly medications = this.medicationCache.medications;
  readonly units = this.unitsCache.units;

  constructor() {
    this.unitsCache.load().pipe(takeUntilDestroyed()).subscribe();
    this.medicationCache.load().pipe(takeUntilDestroyed()).subscribe();
  }

  unitAbbreviation(id: string): string {
    return this.units().find((unit) => unit.id === id)?.abbreviation ?? '';
  }
}
