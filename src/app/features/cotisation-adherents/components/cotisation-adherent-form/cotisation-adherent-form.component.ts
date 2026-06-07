import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';
import { Cotisation } from '../../../cotisations/models/cotisation.model';
import { NgSelectComponent } from '@ng-select/ng-select';

import {
  CotisationAdherent,
  CreateCotisationAdherentPayload,
  UpdateCotisationAdherentPayload,
} from '../../models/cotisation-adherent.model';

export type CotisationAdherentFormPayload =
  | CreateCotisationAdherentPayload
  | UpdateCotisationAdherentPayload;

@Component({
  selector: 'app-cotisation-adherent-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    NgSelectComponent],
  templateUrl: './cotisation-adherent-form.component.html',
  styleUrls: ['./cotisation-adherent-form.component.css'],
})
export class CotisationAdherentFormComponent {
  private readonly fb = new FormBuilder();

  readonly cotisationAdherent = input<CotisationAdherent | null>(null);

  readonly adherents = input<Adherent[]>([]);

  readonly cotisations = input<Cotisation[]>([]);

  readonly isLoading = input(false);

  readonly submitForm = output<CotisationAdherentFormPayload>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    montant: [0, [Validators.required, Validators.min(1)]],

    adherent_id: ['', Validators.required],

    cotisation_id: ['', Validators.required],

    status: ['100'],

    date_cotisation: [''],
  });

  readonly isEditMode = computed(() => !!this.cotisationAdherent());

  constructor() {
    effect(() => {
      const data = this.cotisationAdherent();

      if (!data) {
        this.form.reset({
          montant: 0,

          adherent_id: '',

          cotisation_id: '',

          status: '100',

          date_cotisation: '',
        });

        return;
      }

      this.form.patchValue({
        montant: data.montant,

        adherent_id: data.adherent_id,

        cotisation_id: data.cotisation_id,

        status: data.status ?? '100',

        date_cotisation: data.date_cotisation?.split('T')[0] ?? data.date_cotisation ?? '',
      });
    });
  }

  save(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();

      return;
    }

    const raw = this.form.getRawValue();

    this.submitForm.emit({
      adherent_id: raw.adherent_id,

      cotisation_id: raw.cotisation_id,

      montant: Number(raw.montant),

      status: raw.status,

      ...(raw.date_cotisation
        ? {
            date_cotisation: raw.date_cotisation,
          }
        : {}),
    });
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
