import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Depense, DepenseDocument, DepensePayload } from '../../models/depense.model';
import { CategorieDepense } from '../../models/categorie-depense.model';
import {
  getFileExtension,
  readFileAsBase64,
  toDateInputValue,
  toIsoDateDepense,
} from '../../utils/depense-api.utils';

export interface DepenseFormSubmit {
  payload: DepensePayload;
}

@Component({
  selector: 'app-depense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './depense-form.component.html',
  styleUrls: ['./depense-form.component.css'],
})
export class DepenseFormComponent {
  private readonly fb = new FormBuilder();

  readonly depense = input<Depense | null>(null);

  readonly categories = input<CategorieDepense[]>([]);

  readonly isLoading = input(false);

  readonly submitForm = output<DepenseFormSubmit>();

  readonly cancel = output<void>();

  readonly selectedFileName = signal('');
  readonly filePreview = signal('');

  readonly selectedFile = signal<File | null>(null);

  readonly existingDocument = signal<DepenseDocument | null>(null);

  readonly documentTypes = ['FACTURE', 'RECU', 'BON', 'AUTRE'];

  readonly form = this.fb.nonNullable.group({
    categorie_depense_id: ['', Validators.required],
    description: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    date_depense: ['', Validators.required],
    document_type: ['FACTURE'],
    document_numero: [''],
    document_validite: [''],
  });

  readonly isEditMode = computed(() => !!this.depense());

  constructor() {
    effect(() => {
      const depense = this.depense();

      if (!depense) {
        this.form.reset({
          categorie_depense_id: '',
          description: '',
          amount: 0,
          date_depense: new Date().toISOString().split('T')[0],
          document_type: 'FACTURE',
          document_numero: '',
          document_validite: '',
        });

        this.selectedFileName.set('');
        this.selectedFile.set(null);
        this.existingDocument.set(null);

        return;
      }

      this.form.patchValue({
        categorie_depense_id: depense.categorie_depense_id ?? depense.categorie?.id ?? '',
        description: depense.description ?? '',
        amount: depense.amount,
        date_depense: toDateInputValue(depense.date_depense),
        document_type: depense.document?.type ?? 'FACTURE',
        document_numero: depense.document?.numero ?? '',
        document_validite: depense.document?.validite
          ? toDateInputValue(depense.document.validite)
          : '',
      });

      this.existingDocument.set(depense.document ?? null);
      this.selectedFileName.set('');
      this.selectedFile.set(null);
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;

    this.selectedFile.set(file);

    this.selectedFileName.set(file?.name ?? '');

    if (!file) {
      this.filePreview.set('');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.filePreview.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();

      return;
    }

    const raw = this.form.getRawValue();
    const file = this.selectedFile();

    let document: DepenseDocument | undefined;

    if (file) {
      const lien = await readFileAsBase64(file);

      document = {
        type: raw.document_type,
        numero: raw.document_numero || undefined,
        validite: raw.document_validite ? toIsoDateDepense(raw.document_validite) : undefined,
        extension: getFileExtension(file.name),
        lien,
        parent_id: this.depense()?.id,
      };
    } else if (this.existingDocument()) {
      const existing = this.existingDocument()!;

      document = {
        ...existing,
        type: raw.document_type,
        numero: raw.document_numero || existing.numero,
        validite: raw.document_validite
          ? toIsoDateDepense(raw.document_validite)
          : existing.validite,
      };
    } else if (!this.isEditMode()) {
      this.form.get('document_type')?.markAsTouched();
      return;
    }

    const payload: DepensePayload = {
      categorie_depense_id: raw.categorie_depense_id,
      description: raw.description,
      amount: Number(raw.amount),
      date_depense: toIsoDateDepense(raw.date_depense),
      ...(document ? { document } : {}),
    };

    this.submitForm.emit({ payload });
  }

  close(): void {
    if (this.isLoading()) {
      return;
    }

    this.cancel.emit();
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);

    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  hasDocumentError(): boolean {
    return !this.isEditMode() && !this.selectedFile() && !this.existingDocument();
  }
}
