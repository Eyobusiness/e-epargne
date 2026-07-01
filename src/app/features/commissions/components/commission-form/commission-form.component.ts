import { Component, EventEmitter, Output, effect, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommissionConfig } from '../../models/commission.model';
import { Groupe } from '../../../groupes/models/groupe.model';
import { AppInputComponent } from '../../../../shared/ui/app-input/app-input.component';
import { AppButtonComponent } from '../../../../shared/ui/app-button/app-button.component';
import { AppSelectComponent, SelectOption } from '../../../../shared/ui/app-select/app-select.component';

type CommissionField = 'groupe_cotisation_id' | 'type_operation' | 'mode_commission' | 'valeur' | 'libelle';

@Component({
  selector: 'app-commission-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppInputComponent,
    AppButtonComponent,
    AppSelectComponent,
  ],
  templateUrl: './commission-form.component.html',
  styleUrls: ['./commission-form.component.css'],
})
export class CommissionFormComponent {
  readonly commission = input<CommissionConfig | null>(null);
  readonly groupes = input<Groupe[]>([]);
  readonly isLoading = input<boolean>(false);

  @Output() readonly submitForm = new EventEmitter<any>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly form = signal<any>(this.createFormValue());
  readonly errors = signal<Record<string, string>>({});
  readonly touched = signal<Partial<Record<CommissionField, boolean>>>({});
  readonly hasSubmitted = signal(false);

  private readonly formFields: CommissionField[] = [
    'groupe_cotisation_id',
    'type_operation',
    'mode_commission',
    'valeur',
    'libelle',
  ];

  // Options for selects
  readonly operationOptions = signal<SelectOption[]>([
    { label: 'Dépôt', value: 'DEPOT' },
    { label: 'Retrait', value: 'RETRAIT' },
  ]);

  readonly modeOptions = signal<SelectOption[]>([
    { label: 'Pourcentage (%)', value: 'PERCENT' },
    { label: 'Montant Fixe (FCFA)', value: 'FIXED' },
  ]);

  readonly groupOptions = computed<SelectOption[]>(() => {
    return this.groupes().map((g) => ({
      label: g.name,
      value: g.id || '',
    }));
  });

  // Watch for group selection to display limits
  readonly selectedGroup = computed(() => {
    const groupId = this.form().groupe_cotisation_id;
    return this.groupes().find((g) => g.id === groupId) || null;
  });

  constructor() {
    effect(() => {
      const value = this.commission();
      this.form.set(value ? this.createFormValue(value) : this.createFormValue());
      this.resetValidationState();
    });
  }

  updateField(field: CommissionField, value: any): void {
    this.form.update((current) => ({
      ...current,
      [field]: field === 'valeur' ? (value === '' ? '' : Number(value)) : value,
    }));

    if (this.touched()[field] || this.hasSubmitted()) {
      this.validateField(field);
    }
  }

  markAsTouched(field: CommissionField): void {
    this.touched.update((current) => ({
      ...current,
      [field]: true,
    }));
    this.validateField(field);
  }

  validateField(field: CommissionField): void {
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

  getError(field: CommissionField): string | null {
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

  private createFormValue(value?: CommissionConfig | null): any {
    return {
      groupe_cotisation_id: value?.groupe_cotisation_id ?? '',
      type_operation: value?.type_operation ?? 'DEPOT',
      mode_commission: value?.mode_commission ?? 'PERCENT',
      valeur: value?.valeur ?? null,
      libelle: value?.libelle ?? '',
    };
  }

  private resetValidationState(): void {
    this.errors.set({});
    this.touched.set({});
    this.hasSubmitted.set(false);
  }

  private markAllAsTouched(): void {
    this.touched.set({
      groupe_cotisation_id: true,
      type_operation: true,
      mode_commission: true,
      valeur: true,
      libelle: true,
    });
  }

  private getFieldError(field: CommissionField, value: any): string | null {
    if (field === 'valeur') {
      if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
        return 'Valeur obligatoire';
      }
      if (Number(value) < 0) {
        return 'La valeur doit être positive';
      }
      if (this.form().mode_commission === 'PERCENT' && Number(value) > 100) {
        return 'Le pourcentage ne peut pas dépasser 100%';
      }
      return null;
    }

    if (field === 'libelle' || field === 'groupe_cotisation_id' || field === 'type_operation' || field === 'mode_commission') {
      if (!value || !value.toString().trim()) {
        return 'Champ obligatoire';
      }
    }

    return null;
  }

  private normalizePayload(payload: any): any {
    return {
      groupe_cotisation_id: payload.groupe_cotisation_id,
      type_operation: payload.type_operation,
      mode_commission: payload.mode_commission,
      valeur: Number(payload.valeur),
      libelle: payload.libelle.trim(),
    };
  }
}
