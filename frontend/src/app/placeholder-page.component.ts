import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>{{ title }} is not available yet.</p>
    </ion-content>
  `,
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] as string;
}
