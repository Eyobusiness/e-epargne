// components/affectation-adherent-form/affectation-adherent-form.component.ts

import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';

import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';

import { Groupe } from '../../models/groupe.model';
import { AffectationAdherent } from '../../models/affectation-adherent.model';

import { AppSearchableSelectComponent, SearchableSelectOption } from '../../../../shared/ui/app-searchable-select/app-searchable-select.component';

@Component({
  selector: 'app-affectation-adherent-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AppSearchableSelectComponent],
  templateUrl: './affectation-adherent-form.component.html',
  styleUrls: ['./affectation-adherent-form.component.css'],
})
export class AffectationAdherentFormComponent {
  private readonly fb = new FormBuilder();

  readonly affectation = input<AffectationAdherent | null>(null);

  readonly adherents = input<Adherent[]>([]);

  readonly groupes = input<Groupe[]>([]);

  readonly isLoading = input(false);

  readonly adherentSelectOptions = computed<SearchableSelectOption[]>(() =>
    this.adherents().map((adh) => ({
      label: adh.name,
      value: String(adh.id ?? ''),
      subtitle: [adh.matricule, adh.phone].filter(Boolean).join(' • '),
    })),
  );

  readonly submitForm = output<AffectationAdherent>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    groupe_id: ['', [Validators.required]],

    adherent_ids: [[] as string[], [Validators.required, Validators.minLength(1)]],
  });

  onAdherentSelect(val: string): void {
    this.form.patchValue({
      adherent_ids: val ? [val] : [],
    });
    this.form.get('adherent_ids')?.markAsTouched();
  }



  readonly isEditMode = computed(() => !!this.affectation());

  constructor() {
    effect(() => {
      const affectation = this.affectation();
      const groups = this.groupes();

      if (!affectation) {
        this.form.reset({
          groupe_id: groups.length === 1 ? (groups[0].id ?? '') : '',
          adherent_ids: [] as string[],
        });

        return;
      }

      this.form.patchValue({
        groupe_id: affectation.groupe_id || (groups.length === 1 ? (groups[0].id ?? '') : ''),
        adherent_ids: affectation.adherent_id ? [affectation.adherent_id] : [],
      });
    });

  }

  save(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();

      return;
    }

    const payload: AffectationAdherent = {
      ...this.form.getRawValue(),
    };

    // Multi-select: on envoie le payload avec liste adherent_ids.
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
