import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { WorkflowAction } from '../../models/workflow-action.model';
import { Workflow } from '../../models/workflow.model';
import { WorkflowState } from '../../models/workflow-state.model';
import { Profile } from '../../../profil/models/profil.model';
import { Parametre } from '../../../parametres/models/parametre.models';

@Component({
  selector: 'app-workflow-action-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workflow-action-form.component.html',
})
export class WorkflowActionFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly action = input<WorkflowAction | null>(null);
  readonly workflows = input<Workflow[]>([]);
  readonly states = input<WorkflowState[]>([]);
  readonly profiles = input<Profile[]>([]);
  readonly endpoints = input<Parametre[]>([]);
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

  readonly filteredStates = computed(() => this.states());

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
        parent: action.parent ?? 'TONTINEAPP',
        profileIds: action.profileIds?.length
          ? action.profileIds
          : action.profileId
            ? [action.profileId]
            : [],
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

    this.form.patchValue({ profileIds: ids });
  }

  isChecked(profileId: string): boolean {
    return this.form.controls.profileIds.value.includes(profileId);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const rawValue = this.form.getRawValue();

    this.submitForm.emit({
      ...this.action(),
      ...rawValue,
      profileId: rawValue.profileIds[0] ?? this.action()?.profileId,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
