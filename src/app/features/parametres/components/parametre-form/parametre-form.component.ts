import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Parametre } from '../../models/parametre.models';
import { AppButtonComponent } from '../../../../shared/ui/app-button/app-button.component';
import { AppInputComponent } from '../../../../shared/ui/app-input/app-input.component';
import { AppSelectComponent } from '../../../../shared/ui/app-select/app-select.component';

type ParametreField = 'libelle' | 'nom' | 'type' | 'valeur' | 'parent' | 'status';

@Component({
  selector: 'app-parametre-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AppInputComponent, AppSelectComponent, AppButtonComponent],
  templateUrl: './parametre-form.component.html',
  styleUrls: ['./parametre-form.component.css'],
})
export class ParametreFormComponent {
  readonly parametre = input<Parametre | null>(null);

  readonly isLoading = input<boolean>(false);

  @Output()
  readonly submitForm = new EventEmitter<Parametre>();

  @Output()
  readonly cancel = new EventEmitter<void>();

  readonly form = signal<Parametre>(this.createFormValue());

  readonly errors = signal<Record<string, string>>({});

  readonly touched = signal<Partial<Record<ParametreField, boolean>>>({});

  readonly hasSubmitted = signal(false);

  readonly typeOptions = [
    { label: 'CODE', value: 'CODE' },
    { label: 'CRYP', value: 'CRYP' },
    { label: 'ENDPOINT', value: 'ENDPOINT' },
    { label: 'TONTINE_APP', value: 'TONTINE_APP' },
  ];

  private readonly formFields: ParametreField[] = ['libelle', 'nom', 'type', 'valeur', 'parent'];

  constructor() {
    effect(() => {
      const value = this.parametre();

      this.form.set(value ? this.createFormValue(value) : this.createFormValue());

      this.resetValidationState();
    });
  }

  updateField(field: ParametreField, value: string): void {
    this.form.update((current) => ({
      ...current,
      [field]: value,
    }));

    if (this.touched()[field] || this.hasSubmitted()) {
      this.validateField(field);
    }
  }

  markAsTouched(field: ParametreField): void {
    this.touched.update((current) => ({
      ...current,
      [field]: true,
    }));

    this.validateField(field);
  }

  validateField(field: ParametreField): void {
    const currentErrors = { ...this.errors() };
    const message = this.getFieldError(field, this.form()[field] ?? '');
    if (message) {
      currentErrors[field] = message;
    } else {
      delete currentErrors[field];
    }

    this.errors.set(currentErrors);
  }

  validateForm(): boolean {
    const payload = this.form();
    const errors: Record<string, string> = {};

    for (const field of this.formFields) {
      
    const message = this.getFieldError(field, payload[field] ?? '');

      if (message) {
        errors[field] = message;
      }
    }

    this.errors.set(errors);

    return Object.keys(errors).length === 0;
  }

  getError(field: ParametreField): string | null {
    if (!this.hasSubmitted() && !this.touched()[field]) {
      return null;
    }

    return this.errors()[field] ?? null;
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    this.hasSubmitted.set(true);
    this.markAllAsTouched();

    if (!this.validateForm()) {
      return;
    }

    this.submitForm.emit(this.normalizePayload(this.form()));
  }

  onCancel(): void {
    if (this.isLoading()) {
      return;
    }

    this.cancel.emit();
  }

  private createFormValue(value?: Parametre | null): Parametre {
    return {
      id: value?.id ?? '',
      libelle: value?.libelle ?? '',
      nom: value?.nom ?? '',
      type: value?.type ?? '',
      valeur: value?.valeur ?? '',
      parent: value?.parent ?? 'TONTINE_APP',
    };
  }

  private resetValidationState(): void {
    this.errors.set({});
    this.touched.set({});
    this.hasSubmitted.set(false);
  }

  private markAllAsTouched(): void {
    this.touched.set({
      libelle: true,
      nom: true,
      type: true,
      valeur: true,
      parent: true,
    });
  }

  private getFieldError(field: ParametreField, value: string): string | null {
    if (!value?.trim()) {
      return 'Champ obligatoire';
    }

    return null;
  }

  private normalizePayload(payload: Parametre): any {
    // Ne pas inclure l'id dans le body - il doit rester dans l'URL
    return {
      libelle: payload.libelle.trim(),
      nom: payload.nom.trim(),
      type: payload.type.trim(),
      valeur: payload.valeur.trim(),
      parent: payload.parent.trim(),
    };
  }
}
