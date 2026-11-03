import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar,
  IonButton, IonItemOption, IonItemOptions, IonItemSliding,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MedicationsCacheService } from '../../core/services/medications-cache.service';
import { UnitsCacheService } from '../../core/services/units-cache.service';
import { ResourceActionsService } from '../../core/services/resource-actions.service';

addIcons({ addOutline });

@Component({
  selector: 'app-medications-page',
  standalone: true,
  imports: [RouterLink, IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption],
  template: `
    <ion-header><ion-toolbar><ion-title>Medications</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <ion-list>
        @for (medication of medications(); track medication.id) {
          <ion-item-sliding #sliding>
          <ion-item>
            <ion-label>
              <h2>{{ medication.name }}</h2>
              <p>{{ medication.dosageValue }} {{ unitAbbreviation(medication.dosageUnitId) }}</p>
            </ion-label>
            <ion-button fill="clear" slot="end" (click)="edit(medication.id)" aria-label="Edit medication">Edit</ion-button>
            <ion-button fill="clear" color="danger" slot="end" (click)="remove(medication.id, medication.name)" aria-label="Delete medication">Delete</ion-button>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option (click)="edit(medication.id); sliding.close()">Edit</ion-item-option>
            <ion-item-option color="danger" (click)="remove(medication.id, medication.name); sliding.close()">Delete</ion-item-option>
          </ion-item-options>
          </ion-item-sliding>
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
  private readonly router = inject(Router);
  private readonly actions = inject(ResourceActionsService);
  readonly medications = this.medicationCache.medications;
  readonly units = this.unitsCache.units;

  constructor() {
    this.unitsCache.load().pipe(takeUntilDestroyed()).subscribe();
    this.medicationCache.load().pipe(takeUntilDestroyed()).subscribe();
  }

  unitAbbreviation(id: string): string {
    return this.units().find((unit) => unit.id === id)?.abbreviation ?? '';
  }

  edit(id: string): void {
    void this.router.navigate(['/medications', id, 'edit']);
  }

  remove(id: string, name: string): void {
    this.actions.confirmDelete(name).subscribe((confirmed) => {
      if (!confirmed) return;
      this.medicationCache.delete(id).subscribe({
        next: () => this.actions.success('Medication deleted'),
        error: (error: unknown) => this.actions.failure(error),
      });
    });
  }
}
