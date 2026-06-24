import { CommonModule } from '@angular/common';
import { Component, input, output, inject, effect } from '@angular/core';

import { FormBuilder, ReactiveFormsModule,  Validators } from '@angular/forms';

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

  readonly close = output<void>();

  readonly submitForm = output<Workflow>();

  readonly isLoading = input(false);

  form = this.fb.nonNullable.group({
    label: ['', Validators.required],
    endpoint: ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => {
      const workflow = this.workflow();

      if (!workflow) {
        this.form.reset({
          label: '',
          endpoint: '',
          description: '',
        });

        return;
      }

      this.form.patchValue({
        label: workflow.label,
        endpoint: workflow.endpoint,
        description: workflow.description ?? '',
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitForm.emit({
      ...this.workflow(),
      ...this.form.getRawValue(),
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
