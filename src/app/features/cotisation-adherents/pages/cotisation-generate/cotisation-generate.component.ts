import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';
import { GenerateCotisationAdherentPayload } from '../../models/cotisation-adherent.model';
import { AppSearchableSelectComponent, SearchableSelectOption } from '../../../../shared/ui/app-searchable-select/app-searchable-select.component';

@Component({
  selector: 'app-cotisation-generate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppSearchableSelectComponent],
  templateUrl: './cotisation-generate.component.html',
  styleUrls: ['./cotisation-generate.component.css'],
})
export class CotisationGenerateComponent {
  private readonly fb = new FormBuilder();

  readonly adherents = input<Adherent[]>([]);

  readonly isLoading = input(false);

  readonly adherentSelectOptions = computed<SearchableSelectOption[]>(() =>
    this.adherents().map((adh) => ({
      label: adh.name,
      value: String(adh.id ?? ''),
      subtitle: [adh.matricule, adh.phone].filter(Boolean).join(' • '),
    })),
  );

  readonly generate = output<GenerateCotisationAdherentPayload>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    adherentId: [''],

    startDate: ['', Validators.required],

    endDate: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.generate.emit({
      ...(raw.adherentId
        ? {
            adherentId: raw.adherentId,
          }
        : {}),

      startDate: raw.startDate,

      endDate: raw.endDate,
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
