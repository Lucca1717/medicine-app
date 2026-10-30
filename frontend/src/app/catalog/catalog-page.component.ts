import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Catalog</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item button routerLink="/units">
          <ion-label>
            <h2>Units</h2>
            <p>Manage dosage, stock, and quantity units.</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class CatalogPageComponent {}
