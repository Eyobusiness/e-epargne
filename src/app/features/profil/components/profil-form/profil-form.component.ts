import { Component, effect, inject, input, output } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Profile } from '../../models/profil.model';
import { Menu } from '../../models/menu.model';

import { ProfileMenuSelectorComponent } from '../profile-menu-selector/profile-menu-selector.component';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfileMenuSelectorComponent],
  templateUrl: './profil-form.component.html',
  styleUrls: ['./profil-form.component.css'],
})
export class ProfileFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly profile = input<Profile | null>(null);

  readonly menus = input<Menu[]>([]);

  readonly isLoading = input(false);

  readonly submitForm = output<any>();

  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    libelle: ['', Validators.required],

    code: [''],

    permission: ['1,2,3,4', Validators.required],
  });

  constructor() {
    effect(() => {
      const profile = this.profile();

      if (!profile) {
        this.form.reset({
          libelle: '',
          code: '',
          permission: '1,2,3,4',
        });

        return;
      }

      this.form.patchValue({
        libelle: profile.libelle ?? '',

        code: profile.code ?? '',

        permission: profile.permission ?? '1,2,3,4',
      });
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const profileMenuRequest: any[] = [];

    this.menus().forEach((menu) => {
      const checkedSubMenus = menu.sousMenus?.filter((sub) => sub.checked) ?? [];

      if (menu.checked || checkedSubMenus.length > 0) {
        profileMenuRequest.push({
          id_menu: menu.id,
          permission: menu.selectedPermission ?? '1',
          sous_menu: checkedSubMenus.map((sub) => ({
            sous_menu_id: sub.id,
            permission: menu.selectedPermission ?? '1',
          })),
        });
      }
    });

    if (profileMenuRequest.length === 0) {
      alert('Veuillez sélectionner au moins un menu');
      return;
    }

    const formValue = this.form.getRawValue();
    const selected = this.profile();

    const payload = {
      id: selected?.id || undefined,
      profileRequest: {
        id: selected?.id || undefined,
        libelle: formValue.libelle,
        code: formValue.code || formValue.libelle.toUpperCase(),
        permission: formValue.permission,
        code_store: 'TONTINEAPP',
      },
      profileMenuRequest: profileMenuRequest,
    };

    console.log('Payload profil :', JSON.stringify(payload, null, 2));
    this.submitForm.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
