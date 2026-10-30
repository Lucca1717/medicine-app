import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { UnitType } from '../../core/models/medication-manager';
import { UnitsCacheService } from '../../core/services/units-cache.service';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-unit-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/units"></ion-back-button>
        </ion-buttons>
        <ion-title>Add unit</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <ion-item>
          <ion-label position="stacked">Name</ion-label>
          <ion-input formControlName="name" autocomplete="off"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Abbreviation</ion-label>
          <ion-input formControlName="abbreviation" autocomplete="off"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Type</ion-label>
          <ion-select formControlName="type" interface="popover">
            @for (type of unitTypes; track type) {
              <ion-select-option [value]="type">{{ type }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-button expand="block" type="submit" [disabled]="form.invalid">Save unit</ion-button>
      </form>
    </ion-content>
  `,
})
export class UnitFormPageComponent {
  private readonly router = inject(Router);
  private readonly cache = inject(UnitsCacheService);
  private readonly errorService = inject(ErrorService);
  private readonly formBuilder = inject(FormBuilder);

  readonly unitTypes: UnitType[] = ['MASS', 'VOLUME', 'MEDICATION'];
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    abbreviation: ['', [Validators.required]],
    type: ['MASS' as UnitType, [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cache.create(this.form.getRawValue()).subscribe({
      next: () => {
        void this.router.navigateByUrl('/units');
      },
      error: (error: unknown) => void this.errorService.show(error),
    });
  }
}
