import { SessionService } from './../../../../../core/services/session.service';
// features/auth/pages/change-password/change-password.component.ts

import { CommonModule } from '@angular/common';

import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  private readonly SessionService = inject(SessionService);

  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly showOldPassword = signal(false);
  readonly showPassword = signal(false);

  readonly currentUser = this.SessionService.currentUser;

  getInitials(): string {
    const user = this.currentUser();

    const name = user?.name || user?.username || user?.email || 'Utilisateur';

    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    oldpassword: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { email?: string; tempPassword?: string } | undefined;

    if (state?.email) {
      this.form.patchValue({ email: state.email });
    }
    if (state?.tempPassword) {
      this.form.patchValue({ oldpassword: state.tempPassword });
    }

    // Prefill from current user if logged in and not already set by state
    const user = this.SessionService.currentUser();
    if (user?.email && !this.form.controls.email.value) {
      this.form.patchValue({ email: user.email });
    }
  }

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
