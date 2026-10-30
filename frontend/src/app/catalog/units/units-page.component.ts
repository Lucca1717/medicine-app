import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
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
import { UnitsCacheService } from '../../core/services/units-cache.service';

addIcons({ addOutline });

@Component({
  selector: 'app-units-page',
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
    IonFab,
    IonFabButton,
    IonIcon,
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
          <ion-item>
            <ion-label>
              <h2>{{ unit.name }} ({{ unit.abbreviation }})</h2>
              <p>{{ unit.type }}</p>
            </ion-label>
          </ion-item>
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
  readonly units = this.cache.units;

  constructor() {
    this.cache.load().pipe(takeUntilDestroyed()).subscribe();
  }
}
