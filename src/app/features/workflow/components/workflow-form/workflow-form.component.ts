import { CommonModule } from '@angular/common';

import { Component, inject, input, output, effect } from '@angular/core';


import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';


import { Workflow } from '../../models/workflow.model';

@Component({
  selector: 'app-workflow-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workflow-form.component.html',
  styleUrls: ['./workflow-form.component.css'],
})
export class WorkflowFormComponent {
  private readonly fb = inject(FormBuilder);


  readonly workflow = input<Workflow | null>(null);

  readonly isLoading = input(false);

  readonly submitForm = output<Workflow>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    endpoint: ['', Validators.required],

    label: ['', Validators.required],

    description: [''],

    parent: ['TONTINEAPP', Validators.required],

    status: ['200', Validators.required],
  });

  constructor() {
    effect(() => {
      const workflow = this.workflow();

      if (!workflow) {
        this.form.reset({
          endpoint: '',
          label: '',
          description: '',
          parent: 'TONTINEAPP',
          status: '200',
        });
        return;
      }

      this.form.patchValue({
        endpoint: workflow.endpoint,
        label: workflow.label,
        description: workflow.description,
        parent: workflow.parent,
        status: workflow.status,
      });
    });
  }


  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitForm.emit({
      ...this.workflow(),
      ...this.form.getRawValue(),
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
