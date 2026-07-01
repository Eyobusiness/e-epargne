import { Component, EventEmitter, Output, effect, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommissionConfig } from '../../models/commission.model';
import { AppInputComponent } from '../../../../shared/ui/app-input/app-input.component';
import { AppButtonComponent } from '../../../../shared/ui/app-button/app-button.component';
import { AppSelectComponent, SelectOption } from '../../../../shared/ui/app-select/app-select.component';

type CommissionField = 'type_operation' | 'mode_commission' | 'valeur' | 'libelle' | 'montant_min' | 'montant_max';

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
  readonly isLoading = input<boolean>(false);

  @Output() readonly submitForm = new EventEmitter<any>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly form = signal<any>(this.createFormValue());
  readonly errors = signal<Record<string, string>>({});
  readonly touched = signal<Partial<Record<CommissionField, boolean>>>({});
  readonly hasSubmitted = signal(false);

  private readonly formFields: CommissionField[] = [
    'type_operation',
    'mode_commission',
    'valeur',
    'libelle',
    'montant_min',
    'montant_max',
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

  readonly showIntervalInput = signal(false);

  readonly isIntervalVisible = computed(() => {
    return this.form().mode_commission === 'PERCENT' || this.showIntervalInput();
  });

  constructor() {
    effect(() => {
      const value = this.commission();
      this.form.set(value ? this.createFormValue(value) : this.createFormValue());
      
      const hasValueInterval = value && (
        (value.montant_min !== null && value.montant_min !== undefined) ||
        (value.montant_max !== null && value.montant_max !== undefined)
      );
      this.showIntervalInput.set(!!hasValueInterval);
      
      this.resetValidationState();
    });
  }

  updateField(field: CommissionField, value: any): void {
    this.form.update((current) => ({
      ...current,
      [field]: (field === 'valeur' || field === 'montant_min' || field === 'montant_max')
        ? (value === '' || value === null || value === undefined ? null : Number(value))
        : value,
    }));

    if (field === 'mode_commission') {
      this.validateField('montant_min');
      this.validateField('montant_max');
    }

    if (this.touched()[field] || this.hasSubmitted()) {
      this.validateField(field);
    }

    if (field === 'montant_min' || field === 'montant_max') {
      this.validateField('montant_min');
      this.validateField('montant_max');
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
    
    const checkAndSet = (f: CommissionField) => {
      const val = this.form()[f];
      const msg = this.getFieldError(f, val);
      if (msg) {
        currentErrors[f] = msg;
      } else {
        delete currentErrors[f];
      }
    };

    checkAndSet(field);

    if (field === 'montant_min') {
      checkAndSet('montant_max');
    } else if (field === 'montant_max') {
      checkAndSet('montant_min');
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

  toggleInterval(event: any): void {
    const checked = event.target.checked;
    this.showIntervalInput.set(checked);
    if (!checked) {
      this.updateField('montant_min', null);
      this.updateField('montant_max', null);
    }
  }

  private createFormValue(value?: CommissionConfig | null): any {
    return {
      type_operation: value?.type_operation ?? 'DEPOT',
      mode_commission: value?.mode_commission ?? 'PERCENT',
      valeur: value?.valeur ?? null,
      libelle: value?.libelle ?? '',
      montant_min: value?.montant_min ?? null,
      montant_max: value?.montant_max ?? null,
    };
  }

  private resetValidationState(): void {
    this.errors.set({});
    this.touched.set({});
    this.hasSubmitted.set(false);
  }

  private markAllAsTouched(): void {
    this.touched.set({
      type_operation: true,
      mode_commission: true,
      valeur: true,
      libelle: true,
      montant_min: true,
      montant_max: true,
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

    if (field === 'montant_min') {
      if (!this.isIntervalVisible()) {
        return null;
      }
      const mode = this.form().mode_commission;
      if (mode === 'PERCENT') {
        if (value === null || value === undefined || value === '') {
          return 'Montant minimum obligatoire';
        }
      }
      if (value !== null && value !== undefined && value !== '') {
        if (isNaN(Number(value)) || Number(value) < 0) {
          return 'Le montant doit être positif';
        }
      }
      return null;
    }

    if (field === 'montant_max') {
      if (!this.isIntervalVisible()) {
        return null;
      }
      const mode = this.form().mode_commission;
      const minVal = this.form().montant_min;
      if (mode === 'PERCENT') {
        if (value === null || value === undefined || value === '') {
          return 'Montant maximum obligatoire';
        }
      }
      if (value !== null && value !== undefined && value !== '') {
        if (isNaN(Number(value)) || Number(value) < 0) {
          return 'Le montant doit être positif';
        }
        if (minVal !== null && minVal !== undefined && minVal !== '' && Number(value) < Number(minVal)) {
          return 'Le montant maximum doit être supérieur ou égal au montant minimum';
        }
      }
      return null;
    }

    if (field === 'type_operation' || field === 'mode_commission') {
      if (!value || !value.toString().trim()) {
        return 'Champ obligatoire';
      }
    }

    return null;
  }

  private normalizePayload(payload: any): any {
    const res: any = {
      type_operation: payload.type_operation,
      mode_commission: payload.mode_commission,
      valeur: Number(payload.valeur),
    };
    
    if (payload.libelle?.trim()) {
      res.libelle = payload.libelle.trim();
    }
    
    const showInterval = this.isIntervalVisible();
    
    if (showInterval && payload.montant_min !== null && payload.montant_min !== undefined && payload.montant_min !== '') {
      res.montant_min = Number(payload.montant_min);
    }
    
    if (showInterval && payload.montant_max !== null && payload.montant_max !== undefined && payload.montant_max !== '') {
      res.montant_max = Number(payload.montant_max);
    }
    
    return res;
  }
}
