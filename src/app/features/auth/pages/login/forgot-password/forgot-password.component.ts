// features/auth/pages/forgot-password/forgot-password.component.ts

import { CommonModule } from '@angular/common';

import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { finalize } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';

import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './forgot-password.component.html',

  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);

  private readonly authService = inject(AuthService);

  private readonly toastService = inject(ToastService);

  readonly isLoading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    this.authService
      .forgotPassword(this.form.getRawValue())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.show('Lien envoye', 'success');
        },

        error: () => {
          this.toastService.show('Erreur envoi', 'error');
        },
      });
  }
}
