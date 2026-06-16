import { SessionService } from './../../../../../core/services/session.service';
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
  private readonly SessionService = inject(SessionService);

  private readonly toastService = inject(ToastService);

  readonly isLoading = signal(false);

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
