import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Adherent, CreateMemberPayload, UpdateMemberPayload } from '../../models/adherent.model';

import { MemberDocumentPayload } from '../../models/document.model';

import { getFileExtension, readFileAsBase64 } from '../../utils/member-api.utils';

export interface AdherentFormSubmit {
  payload: CreateMemberPayload | UpdateMemberPayload;
}

interface DocumentUploadItem {
  file: File;

  preview: string;

  extension: string;

  type: string;

  numero: string;

  validite: string;
}

@Component({
  selector: 'app-adherent-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adherent-form.component.html',
  styleUrls: ['./adherent-form.component.css'],
})
export class AdherentFormComponent {
  private readonly fb = new FormBuilder();

  readonly adherent = input<Adherent | null>(null);

  readonly isLoading = input(false);

  readonly submitForm = output<AdherentFormSubmit>();

  readonly cancel = output<void>();

  readonly documentTypes = ['CNI', 'PASSEPORT', 'PERMIS', 'CARTE_CONSULAIRE'];

  readonly documents = signal<DocumentUploadItem[]>([]);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],

    phone: ['', Validators.required],

    address: ['', Validators.required],

    email: ['', [Validators.required, Validators.email]],

    password: [''],

    autoMatricule: [true],

    matricule: [''],
  });

  readonly isEditMode = computed(() => !!this.adherent());

  constructor() {
    effect(() => {
      const value = this.adherent();

      if (!value) {
        this.form.reset({
          name: '',
          phone: '',
          address: '',
          email: '',
          password: '',
          autoMatricule: true,
          matricule: '',
        });

        this.documents.set([]);

        return;
      }

      this.form.patchValue({
        name: value.name,
        phone: value.phone,
        address: value.address,
        email: value.email,
        password: '',
        autoMatricule: false,
        matricule: value.matricule ?? '',
      });

      this.documents.set([]);
    });
  }


  hasError(field: string): boolean {
    const control = this.form.get(field);

    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  close(): void {
    if (this.isLoading()) {
      return;
    }

    this.cancel.emit();
  }



  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    const files = Array.from(event.dataTransfer?.files ?? []);

    this.processFiles(files);
  }

  onFileSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);

    this.processFiles(files);
  }

  private processFiles(files: File[]): void {
    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        this.documents.update((items) => [
          ...items,
          {
            file,
            preview: reader.result as string,
            extension: getFileExtension(file.name),
            type: 'CNI',
            numero: '',
            validite: '',
          },
        ]);
      };

      reader.readAsDataURL(file);
    });
  }

  removeDocument(index: number): void {
    this.documents.update((items) => items.filter((_, i) => i !== index));
  }

  updateDocumentType(index: number, value: string): void {
    this.documents.update((items) => {
      items[index].type = value;

      return [...items];
    });
  }

  updateDocumentNumero(index: number, value: string): void {
    this.documents.update((items) => {
      items[index].numero = value;

      return [...items];
    });
  }

  updateDocumentValidite(index: number, value: string): void {
    this.documents.update((items) => {
      items[index].validite = value;

      return [...items];
    });
  }

  private async buildDocumentsPayload(): Promise<MemberDocumentPayload[]> {
    const docs: MemberDocumentPayload[] = [];

    for (const document of this.documents()) {
      docs.push({
        extension: document.extension,

        numero: document.numero,

        type: document.type,

        validite: document.validite,

        lien: await readFileAsBase64(document.file),
      });
    }

    return docs;
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();

      return;
    }

    const raw = this.form.getRawValue();

    if (!this.isEditMode() && !raw.password) {
      this.form.get('password')?.setErrors({
        required: true,
      });

      return;
    }

    const documents = await this.buildDocumentsPayload();

    const matricule = raw.autoMatricule ? '' : raw.matricule;

    if (this.isEditMode()) {
      const payload: UpdateMemberPayload = {
        name: raw.name,

        phone: raw.phone,

        address: raw.address,

        email: raw.email,

        matricule,

        ...(raw.password
          ? {
              password: raw.password,
            }
          : {}),

        ...(documents.length ? { documents } : {}),
      };

      this.submitForm.emit({
        payload,
      });

      return;
    }

    const payload: CreateMemberPayload = {
      name: raw.name,

      phone: raw.phone,

      address: raw.address,

      email: raw.email,

      password: raw.password,

      matricule,

      documents,
    };

    this.submitForm.emit({
      payload,
    });
  }
}
