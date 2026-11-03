import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { CurrentUserService } from '../core/services/current-user.service';
import { ErrorService } from '../core/services/error.service';
import { PeriodsApiService } from '../core/services/resource-api.service';

@Component({
  selector: 'app-period-form-page',
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
    IonButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/schedule"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ id ? 'Edit period' : 'Add period' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (!currentUserId()) {
        <div class="empty-state">
          <p>Select a current user before adding a period.</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <ion-item>
            <ion-label position="stacked">Name</ion-label>
            <ion-input formControlName="name" autocomplete="off" placeholder="e.g. Morning"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Time</ion-label>
            <ion-input formControlName="time" type="time" placeholder="08:00"></ion-input>
          </ion-item>
          <ion-button expand="block" type="submit" [disabled]="form.invalid"
            >Save period</ion-button
          >
        </form>
      }
    </ion-content>
  `,
})
export class PeriodFormPageComponent {
  private readonly api = inject(PeriodsApiService);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly errorService = inject(ErrorService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly id = this.route.snapshot.paramMap.get('id');

  readonly currentUserId = this.currentUserService.selectedUserId;
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    time: ['', [Validators.required]],
  });

  submit(): void {
    const userId = this.currentUserId();
    if (!userId || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = { userId, ...this.form.getRawValue() };
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);
    operation.subscribe({
      next: () => void this.router.navigateByUrl('/schedule'),
      error: (error: unknown) => void this.errorService.show(error),
    });
  }

  constructor() {
    if (this.id) {
      this.api.get(this.id).subscribe({
        next: (period) => this.form.patchValue({ name: period.name, time: period.time }),
        error: (error: unknown) => void this.errorService.show(error),
      });
    }
  }
}
