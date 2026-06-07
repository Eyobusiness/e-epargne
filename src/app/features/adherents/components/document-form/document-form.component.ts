// components/document-form/document-form.component.ts

import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DocumentIdentite } from '../../models/document.model';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css'],
})
export class DocumentFormComponent implements OnChanges {
  private readonly fb = new FormBuilder();

  @Input() document: DocumentIdentite | null = null;

  @Input() parentId: number | null = null;

  @Input() isLoading = false;

  @Output() submitForm = new EventEmitter<FormData>();

  @Output() cancel = new EventEmitter<void>();

  selectedFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    type: ['', Validators.required],

    numero: [''],

    validite: [''],
  });

  get isEditMode(): boolean {
    return !!this.document;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document']) {
      const value: DocumentIdentite | null = changes['document'].currentValue;

      if (!value) {
        this.form.reset({
          type: '',
          numero: '',
          validite: '',
        });

        this.selectedFile = null;

        return;
      }

      this.form.patchValue({
        type: value.type,
        numero: value.numero ?? '',
        validite: value.validite ?? '',
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0] ?? null;

    this.selectedFile = file;
  }

  save(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();

      return;
    }

    if (!this.selectedFile && !this.isEditMode) {
      return;
    }

    const formData = new FormData();

    const raw = this.form.getRawValue();

    formData.append('type', raw.type);

    formData.append('numero', raw.numero || '');

    formData.append('validite', raw.validite || '');

    formData.append('parent_id', String(this.parentId ?? ''));

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.submitForm.emit(formData);
  }

  close(): void {
    if (this.isLoading) {
      return;
    }

    this.cancel.emit();
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);

    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}
