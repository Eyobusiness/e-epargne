import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../../models/utilisateur.model';

@Component({
  selector: 'app-utilisateur-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './utilisateur-form.component.html',
  styleUrls: ['./utilisateur-form.component.css'],
})
export class UtilisateurFormComponent {
  private readonly fb = new FormBuilder();

  readonly utilisateur = input<User | null>(null);

  readonly profils = input<any[]>([]);

  readonly isLoading = input(false);

  readonly submitForm = output<any>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: [''],
    code: ['40', Validators.required],
    profil_id: [''],
    status: ['200', Validators.required],
  });

  readonly isEditMode = computed(() => !!this.utilisateur());

  constructor() {
    effect(() => {
      const data = this.utilisateur();

      if (!data) {
        this.form.reset({
          name: '',
          email: '',
          phone: '',
          password: '',
          code: '40',
          profil_id: '',
        status: '200',
      });

        return;
      }

      this.form.patchValue({
        name: data.name,
        email: data.email,
        phone: data.phone,
        code: data.code,
        profil_id: data.profil_id ?? '',
        status: data.status ?? '200',
      });
    });
  }

  save(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.isEditMode() && !this.form.value.password) {
      return;
    }

    this.submitForm.emit(this.form.getRawValue());
  }

  close(): void {
    if (this.isLoading()) {
      return;
    }

    this.cancel.emit();
  }
}
