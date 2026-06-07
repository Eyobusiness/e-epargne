import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CategorieDepense } from '../../models/categorie-depense.model';

@Component({
  selector: 'app-categorie-depense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categorie-depense-form.component.html',
  styleUrls: ['./categorie-depense-form.component.css'],
})
export class CategorieDepenseFormComponent {
  private readonly fb = new FormBuilder();

  readonly categorie = input<CategorieDepense | null>(null);

  readonly isLoading = input<boolean>(false);

  readonly submitForm = output<CategorieDepense>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],

    description: [''],

    code: ['', Validators.required],
  });

  readonly isEditMode = computed(() => !!this.categorie());

  constructor() {
    effect(() => {
      const categorie = this.categorie();

      if (!categorie) {
        this.form.reset({
          name: '',
          description: '',
          code: '',
        });

        return;
      }

      this.form.patchValue({
        name: categorie.name,
        description: categorie.description ?? '',
        code: categorie.code,
      });
    });
  }

  save(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();

      return;
    }

    this.submitForm.emit(this.form.getRawValue());
  }

  close(): void {
    if (this.isLoading()) {
      return;
    }

    this.cancel.emit();
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);

    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
