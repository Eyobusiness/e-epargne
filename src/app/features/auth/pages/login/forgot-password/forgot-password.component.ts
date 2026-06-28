import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly step = signal<'request' | 'verify'>('request');

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly codeForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
  });

  sendCode(): void {
    if (this.emailForm.invalid || this.isLoading()) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const email = this.emailForm.controls.email.value;

    this.authService
      .forgotPassword({ email })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.show('Code de réinitialisation envoyé', 'success');
          this.step.set('verify');
        },
        error: () => {
          this.toastService.show("Erreur lors de l'envoi. Veuillez réessayer.", 'error');
        },
      });
  }

  verifyCodeAndLogin(): void {
    if (this.codeForm.invalid || this.isLoading()) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const email = this.emailForm.controls.email.value;
    const code = this.codeForm.controls.code.value;

    this.authService
      .login({ username: email, password: code })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.show('Connexion réussie. Veuillez modifier votre mot de passe.', 'success');
          this.router.navigate(['/auth/change-password'], {
            state: { email, tempPassword: code },
          });
        },
        error: (error) => {
          if (error.status === 401) {
            this.toastService.show('Code de vérification incorrect.', 'error');
            return;
          }
          this.toastService.show('Erreur de connexion. Veuillez réessayer.', 'error');
        },
      });
  }
}
