import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Adherent } from '../../../adherents/models/adherent.model';
import { GenerateCotisationAdherentPayload } from '../../models/cotisation-adherent.model';

@Component({
  selector: 'app-cotisation-generate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cotisation-generate.component.html',
  styleUrls: ['./cotisation-generate.component.css'],
})
export class CotisationGenerateComponent {
  private readonly fb = new FormBuilder();

  readonly adherents = input<Adherent[]>([]);

  readonly isLoading = input(false);

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
