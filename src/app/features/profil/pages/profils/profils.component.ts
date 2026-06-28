import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { Profile } from '../../models/profil.model';
import { Menu } from '../../models/menu.model';

import { ProfileService } from '../../services/profil.service';
import { MenuService } from '../../services/menu.service';

import { ProfileTableComponent } from '../../components/profil-table/profil-table.component';
import { ProfileFormComponent } from '../../components/profil-form/profil-form.component';
import { ProfileFilterComponent } from '../../components/profile-filter/profile-filter.component';
import { ProfileStatsComponent } from '../../components/profile-stats/profile-stats.component';

import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';
import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';

import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
    CommonModule,
    AppModalComponent,
    AppPageHeaderComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
    AppPaginationComponent,

    ProfileTableComponent,
    ProfileFormComponent,
    ProfileFilterComponent,
    ProfileStatsComponent,
  ],
  templateUrl: './profils.component.html',
  styleUrls: ['./profils.component.css'],
})
export class ProfilesComponent implements OnInit {
  private readonly profileService = inject(ProfileService);

  private readonly menuService = inject(MenuService);

  private readonly toastService = inject(ToastService);

  readonly profiles = signal<Profile[]>([]);

  readonly menus = signal<Menu[]>([]);

  readonly selected = signal<Profile | null>(null);

  readonly search = signal('');

  readonly isLoading = signal(false);

  readonly isDeleteLoading = signal(false);

  readonly isModalOpen = signal(false);

  readonly isDeleteOpen = signal(false);

  readonly currentPage = signal(1);

  readonly itemsPerPage = 5;

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredProfiles().length / this.itemsPerPage))
  );

  readonly paginatedProfiles = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredProfiles().slice(start, start + this.itemsPerPage);
  });

  readonly hasMultiplePages = computed(() => this.filteredProfiles().length > this.itemsPerPage);

  readonly filteredProfiles = computed(() => {
    const keyword = this.search().toLowerCase();

    return this.profiles().filter((profile) => profile.libelle?.toLowerCase().includes(keyword));
  });

  constructor() {
    effect(() => {
      const total = this.totalPages();
      if (this.currentPage() > total) {
        this.currentPage.set(total);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadProfiles();

    this.loadMenus();
  }

  loadProfiles(): void {
    this.profileService.getAll().subscribe({
      next: (response) => {
        this.profiles.set(response?.data?.items ?? []);
      },

      error: () => {
        this.profiles.set([]);
      },
    });
  }

  loadMenus(): void {
    this.menuService.getAll().subscribe({
      next: (response) => {
        const menus = response?.data?.items ?? [];

        this.menus.set(
          menus.map((menu: any) => ({
            ...menu,

            checked: false,

            selectedPermission: menu.permission ?? '1',
          })),
        );
      },

      error: () => {
        this.menus.set([]);
      },
    });
  }

  filter(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
  }

  openCreateModal(): void {
    this.selected.set(null);

    this.resetMenus();

    this.isModalOpen.set(true);
  }

  openEditModal(profile: Profile): void {
    this.selected.set(profile);

    this.prepareMenus(profile);

    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);

    this.selected.set(null);
  }

  save(payload: any): void {
    this.isLoading.set(true);

    const selected = this.selected();

    const request = selected?.id
      ? this.profileService.update(selected.id, payload)
      : this.profileService.create(payload);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this.closeModal();

        this.loadProfiles();

        this.toastService.show('Profil enregistré', 'success');
      },

      error: () => {
        this.toastService.show('Erreur enregistrement', 'error');
      },
    });
  }

  openDeleteDialog(profile: Profile): void {
    this.selected.set(profile);

    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteOpen.set(false);
  }

  delete(): void {
    this.closeDeleteDialog();

    this.toastService.show('Suppression non disponible sur API', 'warning');
  }

  private resetMenus(): void {
    this.menus.update((menus) =>
      menus.map((menu) => ({
        ...menu,
        checked: false,
      })),
    );
  }

  private prepareMenus(profile: Profile): void {
    const assignedMenus = profile.profilMenus ?? [];

    this.menus.update((menus) =>
      menus.map((menu) => ({
        ...menu,

        checked: assignedMenus.some((p) => p.id_menu === menu.id),
      })),
    );
  }
}
