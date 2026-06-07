// components/affectation-adherent-form/affectation-adherent-form.component.ts

import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';

import { Groupe } from '../../models/groupe.model';
import { AffectationAdherent } from '../../models/affectation-adherent.model';

@Component({
  selector: 'app-affectation-adherent-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './affectation-adherent-form.component.html',
  styleUrls: ['./affectation-adherent-form.component.css'],
})
export class AffectationAdherentFormComponent {
  private readonly fb = new FormBuilder();

  readonly affectation = input<AffectationAdherent | null>(null);

  readonly adherents = input<Adherent[]>([]);

  readonly groupes = input<Groupe[]>([]);

  readonly isLoading = input(false);

  // Multi-select: on émet un payload AffectationAdherent basé sur le premier choix
  // (tant que GroupeDetailComponent ne gère pas encore l'envoi multi).
  readonly submitForm = output<AffectationAdherent>();



  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    groupe_id: ['', [Validators.required]],

    adherent_ids: [[] as string[], [Validators.required, Validators.minLength(1)]],
  });



  readonly isEditMode = computed(() => !!this.affectation());

  constructor() {
    effect(() => {
      const affectation = this.affectation();

      if (!affectation) {
        this.form.reset({
          groupe_id: '',
          adherent_ids: [] as string[],
        });

        return;
      }

      this.form.patchValue({
        groupe_id: affectation.groupe_id,
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
