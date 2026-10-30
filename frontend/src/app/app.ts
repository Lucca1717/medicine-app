import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonRouterOutlet,
  IonSelect,
  IonSelectOption,
  IonTabBar,
  IonTabButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, heartOutline, listOutline, timerOutline } from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrentUserService } from './core/services/current-user.service';
import { UsersApiService } from './core/services/resource-api.service';

addIcons({ calendarOutline, heartOutline, listOutline, timerOutline });

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonApp,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonRouterOutlet,
    RouterLink,
  ],
  template: `
    <ion-app>
      <ion-header>
        <ion-toolbar>
          <ion-title>Medication Manager</ion-title>
          <ion-item slot="end" lines="none">
            <ion-label position="floating">Current user</ion-label>
            <ion-select [value]="currentUserId()" (ionChange)="onUserChange($event.detail.value)">
              <ion-select-option value="">No user selected</ion-select-option>
              @for (user of users(); track user.id) {
                <ion-select-option [value]="user.id">{{ user.name }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-router-outlet></ion-router-outlet>
      </ion-content>

      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="my-medications" routerLink="/my-medications">
          <ion-icon name="heart-outline"></ion-icon>
          <ion-label>My Medications</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="schedule" routerLink="/schedule">
          <ion-icon name="calendar-outline"></ion-icon>
          <ion-label>Schedule</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="intake-records" routerLink="/intake-records">
          <ion-icon name="timer-outline"></ion-icon>
          <ion-label>Intake</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="catalog" routerLink="/medications">
          <ion-icon name="list-outline"></ion-icon>
          <ion-label>Catalog</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-app>
  `,
})
export class App {
  readonly currentUserService = inject(CurrentUserService);
  readonly currentUserId = this.currentUserService.selectedUserId;
  readonly users = signal<any[]>([]);
  protected router = inject(Router);

  constructor(private readonly usersApi: UsersApiService) {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.usersApi
      .list()
      .pipe(takeUntilDestroyed())
      .subscribe((items) => this.users.set(items));
  }

  onUserChange(value: string): void {
    this.currentUserService.setSelectedUserId(value || null);
    if (value) {
      this.router.navigateByUrl('/my-medications');
    }
  }
}
