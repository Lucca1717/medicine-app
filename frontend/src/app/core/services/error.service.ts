import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ProblemDetail } from '../models/medication-manager';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  constructor(private readonly toastController: ToastController) {}

  async show(error: unknown, fallback = 'Something went wrong'): Promise<void> {
    const message = this.message(error, fallback);
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger',
    });
    await toast.present();
  }

  message(error: unknown, fallback = 'Something went wrong'): string {
    const problem = (error as { error?: ProblemDetail })?.error;
    if (problem?.detail) {
      return problem.detail;
    }
    return (error as { message?: string })?.message ?? fallback;
  }
}
