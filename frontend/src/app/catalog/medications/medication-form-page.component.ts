import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonSelect,
  IonSelectOption, IonTitle, IonToolbar,
} from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UnitsCacheService } from '../../core/services/units-cache.service';
import { MedicationsCacheService } from '../../core/services/medications-cache.service';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-medication-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonButton,
  ],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/medications"></ion-back-button></ion-buttons>
      <ion-title>Add medication</ion-title>
    </ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <ion-item><ion-label position="stacked">Name</ion-label><ion-input formControlName="name"></ion-input></ion-item>
        <ion-item><ion-label position="stacked">Dosage value</ion-label><ion-input type="number" formControlName="dosageValue"></ion-input></ion-item>
        <ion-item><ion-label position="stacked">Dosage unit</ion-label>
          <ion-select formControlName="dosageUnitId" interface="popover">
            @for (unit of units(); track unit.id) {
              <ion-select-option [value]="unit.id">{{ unit.name }} ({{ unit.abbreviation }})</ion-select-option>
            }
          </ion-select>
        </ion-item>
        <p>Dosage is the strength of the medication, not the amount taken.</p>
        <ion-button expand="block" type="submit" [disabled]="form.invalid">Save medication</ion-button>
      </form>
    </ion-content>
  `,
})
export class MedicationFormPageComponent {
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly unitsCache = inject(UnitsCacheService);
  private readonly medicationsCache = inject(MedicationsCacheService);
  private readonly errorService = inject(ErrorService);
  readonly units = this.unitsCache.units;
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    dosageValue: [0, [Validators.required, Validators.min(0.000001)]],
    dosageUnitId: ['', [Validators.required]],
  });

  constructor() {
    this.unitsCache.load().pipe(takeUntilDestroyed()).subscribe();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.medicationsCache.create(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl('/medications'),
      error: (error: unknown) => void this.errorService.show(error),
    });
  }
}
