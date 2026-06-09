import { CommonModule } from '@angular/common';

import { Component, inject, input, output, effect } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { WorkflowAction } from '../../models/workflow-action.model';


@Component({
  selector: 'app-workflow-action-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workflow-action-form.component.html',
})
export class WorkflowActionFormComponent {

  private readonly fb = inject(FormBuilder);

  readonly action = input<WorkflowAction | null>(null);

  readonly workflows = input<any[]>([]);

  readonly states = input<any[]>([]);

  readonly profiles = input<any[]>([]);

  readonly isLoading = input(false);

  readonly submitForm = output<any>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    endpoint: ['', Validators.required],

    stepId: ['', Validators.required],

    idWorkflow: ['', Validators.required],

    beforeStep: ['', Validators.required],

    stateOrder: ['', Validators.required],

    notification: [''],

    nextField: [''],

    parent: ['TONTINEAPP', Validators.required],

    profileIds: [[] as string[]],
  });

  constructor() {
    effect(() => {
      const action = this.action();

      if (!action) {
        this.form.reset({
          endpoint: '',
          stepId: '',
          idWorkflow: '',
          beforeStep: '',
          stateOrder: '',
          notification: '',
          nextField: '',
          parent: 'TONTINEAPP',
          profileIds: [],
        });
        return;
      }

      this.form.patchValue({
        endpoint: action.endpoint,
        stepId: action.stepId,
        idWorkflow: action.idWorkflow,
        beforeStep: action.beforeStep,
        stateOrder: action.stateOrder,
        notification: action.notification,
        nextField: action.nextField,
        parent: action.parent,
      });
    });
  }


  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitForm.emit(this.form.getRawValue());
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
