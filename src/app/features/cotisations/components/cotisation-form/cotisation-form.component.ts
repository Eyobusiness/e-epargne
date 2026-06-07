import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';
import {
  Cotisation,
  CreateCotisationPayload,
  UpdateCotisationPayload,
} from '../../models/cotisation.model';

export type CotisationFormPayload = CreateCotisationPayload | UpdateCotisationPayload;

@Component({
  selector: 'app-cotisation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cotisation-form.component.html',
  styleUrls: ['./cotisation-form.component.css'],
})
export class CotisationFormComponent {
  private readonly fb = new FormBuilder();

  readonly cotisation = input<Cotisation | null>(null);
  readonly adherents = input<Adherent[]>([]);
  readonly isLoading = input(false);
  readonly submitForm = output<CotisationFormPayload>();
  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    periodicite: ['', [Validators.required, Validators.minLength(1)]],
    montant: [0, [Validators.required, Validators.min(1)]],
    date_debut: ['', Validators.required],
    date_fin: ['', Validators.required],
    adherent_id: [''],
  });

readonly periodicites = [
  { value: '1', label: 'Journalière' },
  { value: '2', label: 'Hebdomadaire' },
  { value: '3', label: 'Mensuelle' },
  { value: '4', label: 'Annuelle' }
];


  readonly isEditMode = computed(() => !!this.cotisation());

  constructor() {
    effect(() => {
      const cotisation = this.cotisation();

      if (!cotisation) {
        this.form.reset({
          periodicite: '',
          montant: 0,
          date_debut: '',
          date_fin: '',
          adherent_id: '',
        });

        return;
      }

      this.form.patchValue({
        periodicite: cotisation.periodicite ?? '',
        montant: cotisation.montant,
        date_debut: cotisation.date_debut?.split('T')[0] ?? cotisation.date_debut,
        date_fin: cotisation.date_fin?.split('T')[0] ?? cotisation.date_fin,
        adherent_id: cotisation.adherent_id ?? '',
      });

    });
  }

  save(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const periodicite = String(raw.periodicite ?? '').trim();

    const payload: CotisationFormPayload = {
      periodicite,
      montant: Number(raw.montant),
      date_debut: raw.date_debut,
      date_fin: raw.date_fin,
      ...(raw.adherent_id ? { adherent_id: raw.adherent_id } : {}),
    };


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
