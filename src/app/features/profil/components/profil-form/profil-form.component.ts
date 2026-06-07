// components/profil-form/profil-form.component.ts

import { CommonModule } from '@angular/common';

import { Component, effect, input, output } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Profil } from '../../models/profil.model';

@Component({
  selector: 'app-profil-form',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './profil-form.component.html',

  styleUrls: ['./profil-form.component.css'],
})
export class ProfilFormComponent {
  private readonly fb = new FormBuilder();
  private readonly normalizeMenuId = (menuId: unknown): string => String(menuId ?? '');

  readonly profil = input<Profil | null>(null);

  readonly menus = input<any[]>([]);

  readonly isLoading = input(false);

  readonly submitForm = output<any>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    libelle: ['', Validators.required],

    permission: [''],

    menus: [[] as string[]],
  });

  constructor() {
    effect(() => {
      const data = this.profil();

      if (!data) {
        this.form.reset({
          libelle: '',
          permission: '',
          menus: [],
        });

        return;
      }

      this.form.patchValue({
        libelle: data.libelle,

        permission: data.permission ?? '',

        menus: data.profilMenus?.map((menu) => this.normalizeMenuId(menu.id_menu)) ?? [],
      });
    });
  }

  toggleMenu(menuId: string | number): void {
    const normalizedMenuId = this.normalizeMenuId(menuId);
    const current = this.form.value.menus ?? [];

    const exists = current.includes(normalizedMenuId);

    const updated = exists
      ? current.filter((id) => id !== normalizedMenuId)
      : [...current, normalizedMenuId];

    this.form.patchValue({
      menus: updated,
    });
  }

  isChecked(menuId: string | number): boolean {
    return this.form.value.menus?.includes(this.normalizeMenuId(menuId)) ?? false;
  }

  save(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();

    this.submitForm.emit({
      profileRequest: {
        libelle: value.libelle,

        permission: value.permission,
      },

      profileMenuRequest: value.menus.map((menuId) => ({
        menu_id: menuId,
      })),
    });
  }

  close(): void {
    if (this.isLoading()) {
      return;
    }

    this.cancel.emit();
  }
}
