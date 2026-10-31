import { Component, effect, inject, signal } from '@angular/core';
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
import { PeriodResponse } from '../core/models/medication-manager';
import { CurrentUserService } from '../core/services/current-user.service';
import { PeriodsApiService } from '../core/services/resource-api.service';
import { RouterLink } from '@angular/router';

addIcons({ addOutline });

@Component({
  selector: 'app-periods-page',
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
        <ion-title>Schedule</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      @if (!currentUserId()) {
        <div class="empty-state">
          <p>Select a current user to manage scheduled periods.</p>
        </div>
      } @else {
        <ion-list>
          @for (period of periods(); track period.id) {
            <ion-item>
              <ion-label>
                <h2>{{ period.name }}</h2>
                <p>{{ period.time }}</p>
              </ion-label>
            </ion-item>
          } @empty {
            <div class="empty-state">
              <p>No periods registered yet.</p>
            </div>
          }
        </ion-list>
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button routerLink="/periods/new" aria-label="Add period">
            <ion-icon name="add-outline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      }
    </ion-content>
  `,
})
export class PeriodsPageComponent {
  private readonly api = inject(PeriodsApiService);
  private readonly currentUserService = inject(CurrentUserService);

  readonly currentUserId = this.currentUserService.selectedUserId;
  readonly periods = signal<PeriodResponse[]>([]);

  constructor() {
    effect(() => {
      const userId = this.currentUserId();
      this.periods.set([]);
      if (userId) {
        this.api.list({ userId }).subscribe((items) => {
          this.periods.set([...items].sort((a, b) => a.time.localeCompare(b.time)));
        });
      }
    });
  }
}
