import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { UsersApiService } from '../core/services/users-api.service';
import { User } from '../core/models/medication-manager';
import { ResourceActionsService } from '../core/services/resource-actions.service';

addIcons({ addOutline });

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption],
  template: `
    <ion-header><ion-toolbar><ion-title>Users</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <ion-list>
        @for (user of users(); track user.id) {
          <ion-item-sliding #sliding>
            <ion-item><ion-label><h2>{{ user.name }}</h2><p>{{ user.email }}</p></ion-label></ion-item>
            <ion-item-options side="end">
              <ion-item-option (click)="edit(user.id); sliding.close()">Edit</ion-item-option>
              <ion-item-option color="danger" (click)="remove(user.id, user.name); sliding.close()">Delete</ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
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
  private readonly router = inject(Router);
  private readonly actions = inject(ResourceActionsService);
  readonly users = signal<User[]>([]);

  constructor() {
    this.api.list().pipe(takeUntilDestroyed()).subscribe((users) => this.users.set(users));
  }

  edit(id: string): void {
    void this.router.navigate(['/users', id, 'edit']);
  }

  remove(id: string, name: string): void {
    this.actions.confirmDelete(name).subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.delete(id).subscribe({
        next: () => {
          this.users.update((items) => items.filter((item) => item.id !== id));
          this.actions.success('User deleted');
        },
        error: (error: unknown) => this.actions.failure(error),
      });
    });
  }
}
