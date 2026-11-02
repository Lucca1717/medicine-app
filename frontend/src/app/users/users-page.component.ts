import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { UsersApiService } from '../core/services/users-api.service';
import { User } from '../core/models/medication-manager';

addIcons({ addOutline });

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon],
  template: `
    <ion-header><ion-toolbar><ion-title>Users</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <ion-list>
        @for (user of users(); track user.id) {
          <ion-item><ion-label><h2>{{ user.name }}</h2><p>{{ user.email }}</p></ion-label></ion-item>
        } @empty {
          <ion-item><ion-label>No users registered yet.</ion-label></ion-item>
        }
      </ion-list>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button routerLink="/users/new" aria-label="Create user"><ion-icon name="add-outline"></ion-icon></ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})
export class UsersPageComponent {
  private readonly api = inject(UsersApiService);
  readonly users = signal<User[]>([]);

  constructor() {
    this.api.list().pipe(takeUntilDestroyed()).subscribe((users) => this.users.set(users));
  }
}
