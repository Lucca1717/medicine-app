import { Injectable, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Observable, from, switchMap } from 'rxjs';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class ResourceActionsService {
  private readonly alerts = inject(AlertController);
  private readonly toasts = inject(ToastController);
  private readonly errors = inject(ErrorService);

  confirmDelete(label: string): Observable<boolean> {
    return from(
      this.alerts.create({
        header: 'Confirm deletion',
        message: `Delete ${label}? This cannot be undone.`,
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          { text: 'Delete', role: 'destructive', handler: () => true },
        ],
      }),
    ).pipe(
      switchMap(async (alert) => {
        await alert.present();
        const result = await alert.onDidDismiss<boolean>();
        return result.role === 'destructive';
      }),
    );
  }

  success(message: string): void {
    void this.toasts
      .create({ message, duration: 2000, position: 'top', color: 'success' })
      .then((toast) => toast.present());
  }

  failure(error: unknown): void {
    void this.errors.show(error);
  }
}
