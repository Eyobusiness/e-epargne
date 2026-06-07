import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';
import { Operation } from '../../models/operation.model';

import { CotisationAdherentService } from '../../../cotisation-adherents/services/cotisation-adherent.service';

@Component({
  selector: 'app-operation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.css'],
})
export class OperationFormComponent {
  private readonly fb = new FormBuilder();

  private readonly cotisationAdherentService =
    inject(CotisationAdherentService);

  readonly operation = input<Operation | null>(null);

  readonly adherents = input<Adherent[]>([]);

  readonly isLoading = input(false);

  readonly submitForm = output<Operation>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    description: [''],

    moyen_operation: ['CASH', Validators.required],

    montant: [0, [Validators.required, Validators.min(1)]],

    adherent_id: [''],

    cotisation_adherent_id: [''],

    date_operation: ['', Validators.required],

    status: ['200'],

    type_operation: ['DEPOT', Validators.required],

    motif: [''],
  });

  readonly isEditMode = computed(() => !!this.operation());

  constructor() {
    effect(() => {
      const data = this.operation();

      if (!data) {
        this.form.reset({
          description: '',
          moyen_operation: 'CASH',
          montant: 0,
          adherent_id: '',
          cotisation_adherent_id: '',
          date_operation: new Date().toISOString().split('T')[0],
          status: '200',
          type_operation: 'DEPOT',
          motif: '',
        });

        return;
      }

      this.form.patchValue({
        description: data.description ?? '',
        moyen_operation: data.moyen_operation,
        montant: data.montant,
        adherent_id: data.adherent_id ?? '',
        cotisation_adherent_id:
          data.cotisation_adherent_id ?? '',
        date_operation:
          data.date_operation?.split('T')[0] ??
          data.date_operation,
        status: '200',
        type_operation: data.type_operation,
        motif: data.motif ?? '',
      });
    });
  }

  onAdherentChange(adherentId: string): void {
    if (!adherentId) {
      this.form.patchValue({
        montant: 0,
        cotisation_adherent_id: '',
      });

      return;
    }

    this.cotisationAdherentService
      .getAll({
        adherentId,
        status: '100',
        page: 1,
        limit: 1,
      })
      .subscribe({
        next: (response) => {
          const cotisation =
            response.data?.items?.[0];

          if (!cotisation) {
            this.form.patchValue({
              montant: 0,
              cotisation_adherent_id: '',
            });

            return;
          }

          this.form.patchValue({
            montant: cotisation.montant,
            cotisation_adherent_id:
              cotisation.id,
          });
        },
      });
  }

  save(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Operation = {
      ...this.form.getRawValue(),
      status: '200',
    };

    this.submitForm.emit(payload);
  }

  close(): void {
    if (this.isLoading()) {
      return;
    }

    this.cancel.emit();
  }
}