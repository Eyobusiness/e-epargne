import { CommonModule } from '@angular/common';

import { Component, computed, effect, inject, input, output } from '@angular/core';

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

  readonly endpoints = input<any[]>([]);

  readonly isLoading = input(false);

  readonly submitForm = output<WorkflowAction>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    endpoint: ['', Validators.required],

    stepId: ['', Validators.required],

    idWorkflow: ['', Validators.required],

    beforeStep: [''],

    stateOrder: ['', Validators.required],

    notification: [''],

    nextField: [''],

    parent: ['TONTINEAPP', Validators.required],

    profileIds: [[] as string[]],
  });

  readonly filteredStates = computed(() => {
    const workflowId = this.form.controls.idWorkflow.value;

    if (!workflowId) {
      return [];
    }

    return this.states().filter(
      (state) => state.workflowId === workflowId || state.parent === workflowId,
    );
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
        beforeStep: action.beforeStep ?? '',
        stateOrder: action.stateOrder ?? '',
        notification: action.notification ?? '',
        nextField: action.nextField ?? '',
        parent: action.parent ?? '',
        profileIds: action.profileIds ?? [],
      });
    });
  }

  toggleProfile(profileId: string, checked: boolean): void {
    const ids = [...this.form.controls.profileIds.value];

    if (checked) {
      if (!ids.includes(profileId)) {
        ids.push(profileId);
      }
    } else {
      const index = ids.indexOf(profileId);

      if (index >= 0) {
        ids.splice(index, 1);
      }
    }

    this.form.patchValue({
      profileIds: ids,
    });
  }

  isChecked(profileId: string): boolean {
    return this.form.controls.profileIds.value.includes(profileId);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.submitForm.emit({
      ...this.form.getRawValue(),
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
