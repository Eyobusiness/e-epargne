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
            sousMenus: menu.sousMenus?.map((sub: any) => ({
              ...sub,
              checked: false
            })) ?? []
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
    const profile = this.selected();
    if (!profile || !profile.id) {
      this.closeDeleteDialog();
      return;
    }

    this.isDeleteLoading.set(true);
    this.profileService.delete(profile.id)
      .pipe(finalize(() => {
        this.isDeleteLoading.set(false);
        this.closeDeleteDialog();
      }))
      .subscribe({
        next: () => {
          this.loadProfiles();
          this.toastService.show('Profil supprimé avec succès', 'success');
        },
        error: (err) => {
          this.toastService.show('Erreur lors de la suppression', 'error');
        }
      });
  }

  private resetMenus(): void {
    this.menus.update((menus) =>
      menus.map((menu) => ({
        ...menu,
        checked: false,
        selectedPermission: '1',
        sousMenus: menu.sousMenus?.map((sub) => ({
          ...sub,
          checked: false
        })) ?? []
      })),
    );
  }

  private prepareMenus(profile: Profile): void {
    const assignedMenus = profile.profilMenus ?? [];

    this.menus.update((menus) =>
      menus.map((menu) => {
        const assignedMenu = assignedMenus.find((p) => p.id_menu === menu.id);
        const hasAssigned = !!assignedMenu;

        const mappedSubMenus = menu.sousMenus?.map((sub) => {
          const hasSubAssigned = assignedMenu?.sous_menu?.some(
            (s: any) => s.sous_menu_id === sub.id
          );
          return {
            ...sub,
            checked: !!hasSubAssigned
          };
        }) ?? [];

        return {
          ...menu,
          checked: hasAssigned,
          selectedPermission: assignedMenu?.permission ?? menu.permission ?? '1',
          sousMenus: mappedSubMenus
        };
      })
    );
  }
}
