import { Component, EventEmitter, Output, effect, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Plafond } from '../../models/plafond.model';
import { AppInputComponent } from '../../../../shared/ui/app-input/app-input.component';
import { AppButtonComponent } from '../../../../shared/ui/app-button/app-button.component';
import { AppTextareaComponent } from '../../../../shared/ui/app-textarea/app-textarea.component';

type PlafondField = 'name' | 'amount' | 'description';

@Component({
  selector: 'app-plafond-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AppInputComponent, AppButtonComponent, AppTextareaComponent],
  templateUrl: './plafond-form.component.html',
  styleUrls: ['./plafond-form.component.css'],
})
export class PlafondFormComponent {
  readonly plafond = input<Plafond | null>(null);
  readonly isLoading = input<boolean>(false);

  @Output() readonly submitForm = new EventEmitter<Plafond>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly form = signal<Plafond>(this.createFormValue());
  readonly errors = signal<Record<string, string>>({});
  readonly touched = signal<Partial<Record<PlafondField, boolean>>>({});
  readonly hasSubmitted = signal(false);

  private readonly formFields: PlafondField[] = ['name', 'amount', 'description'];

  constructor() {
    effect(() => {
      const value = this.plafond();
      this.form.set(value ? this.createFormValue(value) : this.createFormValue());
      this.resetValidationState();
    });
  }

  updateField(field: PlafondField, value: any): void {
    this.form.update((current) => ({
      ...current,
      [field]: field === 'amount' ? (value === '' ? '' : Number(value)) : value,
    }));

    if (this.touched()[field] || this.hasSubmitted()) {
      this.validateField(field);
    }
  }

  markAsTouched(field: PlafondField): void {
    this.touched.update((current) => ({
      ...current,
      [field]: true,
    }));
    this.validateField(field);
  }

  validateField(field: PlafondField): void {
    const currentErrors = { ...this.errors() };
    const value = this.form()[field];
    const message = this.getFieldError(field, value);
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
      const message = this.getFieldError(field, payload[field]);
      if (message) {
        errors[field] = message;
      }
    }

    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  getError(field: PlafondField): string | null {
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

  private createFormValue(value?: Plafond | null): Plafond {
    return {
      id: value?.id ?? '',
      name: value?.name ?? '',
      amount: value?.amount ?? null,
      description: value?.description ?? '',
    };
  }

  private resetValidationState(): void {
    this.errors.set({});
    this.touched.set({});
    this.hasSubmitted.set(false);
  }

  private markAllAsTouched(): void {
    this.touched.set({
      name: true,
      amount: true,
      description: true,
    });
  }

  private getFieldError(field: PlafondField, value: any): string | null {
    if (field === 'amount') {
      if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
        return 'Montant obligatoire';
      }
      if (Number(value) <= 0) {
        return 'Le montant doit être supérieur à 0';
      }
      return null;
    }

    if (field === 'name') {
      if (!value?.trim()) {
        return 'Champ obligatoire';
      }
    }

    return null;
  }

  private normalizePayload(payload: Plafond): Plafond {
    return {
      name: payload.name.trim(),
      amount: Number(payload.amount),
      description: payload.description?.trim() ?? '',
    };
  }
}
