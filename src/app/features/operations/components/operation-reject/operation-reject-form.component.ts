// import { CommonModule } from '@angular/common';
// import { Component, inject, input, output } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// @Component({
//   selector: 'app-operation-reject-form',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './operation-reject-form.component.html',
// })
// export class OperationRejectFormComponent {
//   private readonly fb = inject(FormBuilder);

//   readonly isLoading = input(false);

//   readonly submitForm = output<{
//     motif: string;
//     description: string;
//   }>();

//   readonly cancel = output<void>();

//   readonly form = this.fb.nonNullable.group({
//     motif: ['', Validators.required],

//     description: ['', Validators.required],
//   });

//   save(): void {
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();

//       return;
//     }

//     this.submitForm.emit(this.form.getRawValue());
//   }

//   onCancel(): void {
//     this.cancel.emit();
//   }
// }
