import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';
import { AppSearchableSelectComponent, SearchableSelectOption } from '../../../../shared/ui/app-searchable-select/app-searchable-select.component';
import {
  Cotisation,
  CreateCotisationPayload,
  UpdateCotisationPayload,
} from '../../models/cotisation.model';

export type CotisationFormPayload = CreateCotisationPayload | UpdateCotisationPayload;

@Component({
  selector: 'app-cotisation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppSearchableSelectComponent],
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

  readonly adherentSelectOptions = computed<SearchableSelectOption[]>(() =>
    this.adherents().map((adh) => ({
      label: adh.name,
      value: String(adh.id ?? ''),
      subtitle: [adh.matricule, adh.phone].filter(Boolean).join(' • '),
    })),
  );

  readonly form = this.fb.nonNullable.group({
    description: [''],
    periodicite: ['', [Validators.required, Validators.minLength(1)]],
    montant: [0, [Validators.required, Validators.min(1)]],
    date_debut: ['', Validators.required],
    date_fin: ['', Validators.required],
    adherent_id: [''],
    commission_cycle_enabled: [false],
    commission_mode: ['PERCENT'],
    commission_valeur: [0],
    commission_cycle_size: [30],
  });

  readonly periodicites = [
    { value: '1', label: 'Journalière' },
    { value: '2', label: 'Hebdomadaire' },
    { value: '3', label: 'Mensuelle' },
    { value: '4', label: 'Annuelle' }
  ];

  readonly commissionModes = [
    { value: 'PERCENT', label: 'Pourcentage (%)' },
    { value: 'FIXED', label: 'Montant Fixe (FCFA)' }
  ];

  readonly isEditMode = computed(() => !!this.cotisation());

  constructor() {
    effect(() => {
      const cotisation = this.cotisation();

      if (!cotisation) {
        this.form.reset({
          description: '',
          periodicite: '',
          montant: 0,
          date_debut: '',
          date_fin: '',
          adherent_id: '',
          commission_cycle_enabled: false,
          commission_mode: 'PERCENT',
          commission_valeur: 0,
          commission_cycle_size: 30,
        });

        return;
      }

      this.form.patchValue({
        description: cotisation.description ?? '',
        periodicite: cotisation.periodicite ?? '',
        montant: cotisation.montant,
        date_debut: cotisation.date_debut?.split('T')[0] ?? cotisation.date_debut,
        date_fin: cotisation.date_fin?.split('T')[0] ?? cotisation.date_fin,
        adherent_id: cotisation.adherent_id ?? '',
        commission_cycle_enabled: !!cotisation.commission_cycle_enabled,
        commission_mode: cotisation.commission_mode ?? 'PERCENT',
        commission_valeur: cotisation.commission_valeur ?? 0,
        commission_cycle_size: cotisation.commission_cycle_size ?? 30,
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
      description: raw.description,
      periodicite,
      montant: Number(raw.montant),
      date_debut: raw.date_debut,
      date_fin: raw.date_fin,
      commission_cycle_enabled: raw.commission_cycle_enabled,
      commission_mode: raw.commission_mode,
      commission_valeur: Number(raw.commission_valeur),
      commission_cycle_size: Number(raw.commission_cycle_size),
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
