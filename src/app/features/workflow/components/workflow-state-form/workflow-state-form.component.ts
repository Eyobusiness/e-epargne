import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { WorkflowState } from '../../models/workflow-state.model';

@Component({
  selector: 'app-workflow-state-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workflow-state-form.component.html',
  styleUrls: ['./workflow-state-form.component.css'],
})
export class WorkflowStateFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly state = input<WorkflowState | null>(null);

  readonly states = input<WorkflowState[]>([]);

  readonly isLoading = input(false);

  readonly submitForm = output<WorkflowState>();

  readonly cancel = output<void>();



  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],

    beforeStep: [''],

    description: [''],

    parent: ['TONTINEAPP', Validators.required],
  });

  constructor() {
    effect(() => {
      const state = this.state();

      if (!state) {
        this.form.reset({
          name: '',
          beforeStep: '',
          description: '',
          parent: 'TONTINEAPP',
        });

        return;
      }

      this.form.patchValue({
        name: state.name,
        beforeStep: state.beforeStep,
        description: state.description ?? '',
        parent: state.parent ?? 'TONTINEAPP',
      });
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const payload: WorkflowState = {
      ...this.state(),
      ...this.form.getRawValue(),
    };

    this.submitForm.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get f() {
    return this.form.controls;
  }
}
