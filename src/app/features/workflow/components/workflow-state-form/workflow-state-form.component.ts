import { CommonModule } from '@angular/common';

import { Component, OnInit, inject, input, output } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { WorkflowState } from '../../models/workflow-state.model';

@Component({
  selector: 'app-workflow-state-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workflow-state-form.component.html',
})
export class WorkflowStateFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly state = input<WorkflowState | null>(null);

  readonly isLoading = input(false);

  readonly submitForm = output<WorkflowState>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],

    beforeStep: ['', Validators.required],

    description: [''],

    parent: ['TONTINEAPP', Validators.required],
  });

  ngOnInit(): void {
    const state = this.state();

    if (!state) {
      return;
    }

    this.form.patchValue({
      name: state.name,
      beforeStep: state.beforeStep,
      description: state.description,
      parent: state.parent,
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitForm.emit({
      ...this.state(),
      ...this.form.getRawValue(),
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
