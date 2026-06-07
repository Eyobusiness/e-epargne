import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  Adherent,
  CreateMemberPayload,
  UpdateMemberPayload,
} from '../../models/adherent.model';
import { MemberDocumentPayload } from '../../models/document.model';
import { getFileExtension, readFileAsBase64 } from '../../utils/member-api.utils';

export interface AdherentFormSubmit {
  payload: CreateMemberPayload | UpdateMemberPayload;
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

  readonly rectoFileName = signal('');
  readonly versoFileName = signal('');
  readonly rectoFile = signal<File | null>(null);
  readonly versoFile = signal<File | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', Validators.required],
    address: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    matricule: ['', Validators.required],
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
          matricule: '',
        });
        this.clearDocumentFiles();
        return;
      }

      this.form.patchValue({
        name: value.name,
        phone: value.phone,
        address: value.address,
        email: value.email,
        password: '',
        matricule: value.matricule ?? '',
      });
      this.clearDocumentFiles();
    });
  }

  onRectoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.rectoFile.set(file);
    this.rectoFileName.set(file?.name ?? '');
  }

  onVersoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.versoFile.set(file);
    this.versoFileName.set(file?.name ?? '');
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (!this.isEditMode() && !raw.password) {
      this.form.get('password')?.setErrors({ required: true });
      this.form.get('password')?.markAsTouched();
      return;
    }

    const documents = await this.buildDocumentsPayload();

    if (!this.isEditMode() && documents.length < 2) {
      return;
    }

    if (this.isEditMode()) {
      const payload: UpdateMemberPayload = {
        name: raw.name,
        phone: raw.phone,
        address: raw.address,
        email: raw.email,
        matricule: raw.matricule,
        ...(raw.password ? { password: raw.password } : {}),
        ...(documents.length ? { documents } : {}),
      };

      this.submitForm.emit({ payload });
      return;
    }

    const payload: CreateMemberPayload = {
      name: raw.name,
      phone: raw.phone,
      address: raw.address,
      email: raw.email,
      password: raw.password,
      matricule: raw.matricule,
      documents,
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
    return !this.isEditMode() && (!this.rectoFile() || !this.versoFile());
  }

  private async buildDocumentsPayload(): Promise<MemberDocumentPayload[]> {
    const docs: MemberDocumentPayload[] = [];

    if (this.rectoFile()) {
      const file = this.rectoFile()!;
      docs.push({
        type: 'RECTO_cni',
        extension: getFileExtension(file.name),
        lien: await readFileAsBase64(file),
        numero: '',
      });
    }

    if (this.versoFile()) {
      const file = this.versoFile()!;
      docs.push({
        type: 'VERSO_cni',
        extension: getFileExtension(file.name),
        lien: await readFileAsBase64(file),
        numero: '',
      });
    }

    return docs;
  }

  private clearDocumentFiles(): void {
    this.rectoFile.set(null);
    this.versoFile.set(null);
    this.rectoFileName.set('');
    this.versoFileName.set('');
  }
}
