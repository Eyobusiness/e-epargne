// features/auth/pages/change-password/change-password.component.ts

import { CommonModule } from '@angular/common';

import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { finalize } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';

import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-change-password',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './change-password.component.html',

  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);

  private readonly authService = inject(AuthService);

  private readonly toastService = inject(ToastService);

  readonly isLoading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    oldpassword: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    this.authService
      .changePassword(this.form.getRawValue())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.show('Mot de passe modifie', 'success');

          this.form.reset();
        },

        error: () => {
          this.toastService.show('Erreur modification', 'error');
        },
      });
  }
}
