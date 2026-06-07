// components/groupe-form/groupe-form.component.ts

import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Groupe, normalizeGroupe } from '../../models/groupe.model';

@Component({
  selector: 'app-groupe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './groupe-form.component.html',
  styleUrls: ['./groupe-form.component.css'],
})
export class GroupeFormComponent {
  private readonly fb = new FormBuilder();

  readonly groupe = input<Groupe | null>(null);

  readonly isLoading = input(false);

  readonly submitForm = output<Groupe>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],

    description: [''],

    montant_max: [0, [Validators.required, Validators.min(1)]],

    montant_min: [0, [Validators.min(0)]],
  });

  readonly isEditMode = computed(() => !!this.groupe());

  constructor() {
    effect(() => {
      const groupe = this.groupe();

      if (!groupe) {
        this.form.reset({
          name: '',
          description: '',
          montant_max: 0,
          montant_min: 0,
        });

        return;
      }

      this.form.patchValue({
        name: groupe.name,
        description: groupe.description ?? '',
        montant_max: groupe.montant_max,
        montant_min: groupe.montant_min ?? 0,
      });
    });
  }

  save(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();

      return;
    }

    const payload = normalizeGroupe(this.form.getRawValue());

    this.submitForm.emit(payload);
  }

  close(): void {
    if (this.isLoading()) {
      return;
    }

    this.cancel.emit();
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);

    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}
