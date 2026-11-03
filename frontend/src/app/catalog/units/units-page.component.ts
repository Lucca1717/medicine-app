import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UnitsCacheService } from '../../core/services/units-cache.service';
import { ResourceActionsService } from '../../core/services/resource-actions.service';

addIcons({ addOutline });

@Component({
  selector: 'app-units-page',
  standalone: true,
  imports: [
    RouterLink,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton,
    IonIcon,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Units</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        @for (unit of units(); track unit.id) {
          <ion-item-sliding #sliding>
          <ion-item>
            <ion-label>
              <h2>{{ unit.name }} ({{ unit.abbreviation }})</h2>
              <p>{{ unit.type }}</p>
            </ion-label>
            <ion-button fill="clear" slot="end" (click)="edit(unit.id)" aria-label="Edit unit">Edit</ion-button>
            <ion-button fill="clear" color="danger" slot="end" (click)="remove(unit.id, unit.name)" aria-label="Delete unit">Delete</ion-button>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option (click)="edit(unit.id); sliding.close()">Edit</ion-item-option>
            <ion-item-option color="danger" (click)="remove(unit.id, unit.name); sliding.close()">Delete</ion-item-option>
          </ion-item-options>
          </ion-item-sliding>
        } @empty {
          <ion-item>
            <ion-label>No units registered yet.</ion-label>
          </ion-item>
        }
      </ion-list>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button routerLink="/units/new" aria-label="Add unit">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})
export class UnitsPageComponent {
  private readonly cache = inject(UnitsCacheService);
  private readonly router = inject(Router);
  private readonly actions = inject(ResourceActionsService);
  readonly units = this.cache.units;

  constructor() {
    this.cache.load().pipe(takeUntilDestroyed()).subscribe();
  }

  edit(id: string): void {
    void this.router.navigate(['/units', id, 'edit']);
  }

  remove(id: string, name: string): void {
    this.actions.confirmDelete(name).subscribe((confirmed) => {
      if (!confirmed) return;
      this.cache.delete(id).subscribe({
        next: () => this.actions.success('Unit deleted'),
        error: (error: unknown) => this.actions.failure(error),
      });
    });
  }
}
