import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar } from '@ionic/angular';
import { UsersApiService } from '../core/services/users-api.service';
import { ErrorService } from '../core/services/error.service';

@Component({
  selector: 'app-user-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonItem, IonLabel, IonInput, IonButton],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/users"></ion-back-button></ion-buttons>
      <ion-title>Create user</ion-title>
    </ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <ion-item><ion-label position="stacked">Name</ion-label><ion-input formControlName="name" autocomplete="name"></ion-input></ion-item>
        <ion-item><ion-label position="stacked">Email</ion-label><ion-input type="email" formControlName="email" autocomplete="email"></ion-input></ion-item>
        <ion-item><ion-label position="stacked">Password</ion-label><ion-input type="password" formControlName="password" autocomplete="new-password"></ion-input></ion-item>
        <ion-button expand="block" type="submit" [disabled]="form.invalid">Create user</ion-button>
      </form>
    </ion-content>
  `,
})
export class UserFormPageComponent {
  private readonly api = inject(UsersApiService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);
  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.api.create(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl('/users'),
      error: (error: unknown) => void this.errorService.show(error),
    });
  }
}
