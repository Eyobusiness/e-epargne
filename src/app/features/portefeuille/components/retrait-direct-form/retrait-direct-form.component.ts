import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, input } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Operation } from '../../../operations/models/operation.model';
// import { FormatMontantPipe } from '@shared/pipes/pipe.component';

@Component({
  selector: 'app-retrait-direct-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './retrait-direct-form.component.html',
  styleUrls: ['./retrait-direct-form.component.css'],
})
export class RetraitDirectFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly solde = input<number>(0);

  @Output()
  save = new EventEmitter<Operation>();

  @Output()
  cancel = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    montant: [0, [Validators.required, Validators.min(100)]],

    moyen_operation: ['CASH', Validators.required],

    motif: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.getRawValue().montant > this.solde()) {
      alert('Solde insuffisant');
      return;
    }

    this.save.emit({
      montant: this.form.getRawValue().montant,

      moyen_operation: this.form.getRawValue().moyen_operation,

      motif: this.form.getRawValue().motif,

      description: 'Retrait direct portefeuille',

      date_operation: new Date().toISOString().split('T')[0],

      type_operation: 'RETRAIT',

      compte: '',
    });
  }
}
