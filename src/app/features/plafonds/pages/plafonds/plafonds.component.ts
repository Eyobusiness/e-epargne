import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, forkJoin } from 'rxjs';
import { CollectionService } from '../../../collection/services/collection.service';
import { PlafondService } from '../../services/plafond.service';
import { Plafond, CollectorLimit } from '../../models/plafond.model';
import { User, Profil } from '../../../utilisateurs/models/utilisateur.model';
import { UtilisateurService } from '../../../utilisateurs/services/utilisateur.service';
import { ProfileService } from '../../../profil/services/profil.service';
import { ToastService } from '../../../../core/services/toast.service';
import { NotificationService } from '../../../../core/services/notification.service';

import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { PlafondTableComponent } from '../../components/plafond-table/plafond-table.component';
import { PlafondFormComponent } from '../../components/plafond-form/plafond-form.component';
import { AffectationTableComponent } from '../../components/affectation-table/affectation-table.component';
import { AffectationFormComponent } from '../../components/affectation-form/affectation-form.component';

type PlafondTab = 'limit' | 'affectation';

@Component({
  selector: 'app-plafonds-page',
  standalone: true,
  imports: [
    CommonModule,
    AppPageHeaderComponent,
    AppModalComponent,
    AppConfirmDialogComponent,
    PlafondTableComponent,
    PlafondFormComponent,
    AffectationTableComponent,
    AffectationFormComponent,
  ],
  templateUrl: './plafonds.component.html',
  styleUrls: ['./plafonds.component.css'],
})
export class PlafondsComponent implements OnInit {
  private readonly plafondService = inject(PlafondService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly collectionService = inject(CollectionService);
  private readonly profileService = inject(ProfileService);
  private readonly toastService = inject(ToastService);
  private readonly notifService = inject(NotificationService);

  readonly activeTab = signal<PlafondTab>('limit');
  readonly plafonds = signal<Plafond[]>([]);
  readonly affectations = signal<CollectorLimit[]>([]);
  readonly agents = signal<User[]>([]);
  readonly profiles = signal<Profil[]>([]);

  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly isDeleteLoading = signal(false);

  // Plafond Modal & Delete state
  readonly isPlafondModalOpen = signal(false);
  readonly isDeletePlafondOpen = signal(false);
  readonly selectedPlafond = signal<Plafond | null>(null);

  // Affectation Modal & Delete state
  readonly isAffectationModalOpen = signal(false);
  readonly isDeleteAffectationOpen = signal(false);
  readonly selectedAffectation = signal<CollectorLimit | null>(null);

  // Reset Limit dialog state
  readonly isResetLimitOpen = signal(false);
  readonly isResetLoading = signal(false);
  readonly selectedLimitToReset = signal<CollectorLimit | null>(null);

  ngOnInit(): void {
    this.loadPlafonds();
    this.loadAffectations();
    this.loadAgents();
    this.loadProfiles();
  }

  setTab(tab: PlafondTab): void {
    this.activeTab.set(tab);
  }

  // --- Load Data ---
  loadPlafonds(): void {
    this.isPageLoading.set(true);
    this.plafondService
      .getLimits()
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (data) => this.plafonds.set(data),
        error: (err) => {
          this.plafonds.set([]);
          this.toastService.show(this.extractErrorMessage(err) || 'Erreur chargement des plafonds', 'error');
        },
      });
  }

  loadAffectations(): void {
    forkJoin({
      limits: this.plafondService.getCollectorLimits(),
      collections: this.collectionService.getCollections({ limit: 100000 }),
      agentsResponse: this.utilisateurService.getAll({ limit: 1000, status: '200' })
    }).subscribe({
      next: ({ limits, collections, agentsResponse }) => {
        const collectionsList = collections?.data?.items ?? [];
        const agentsList = agentsResponse?.data?.items ?? [];
        
        const mapped = limits.map(item => {
          let sum = 0;
          if (item.agent_id) {
            sum = collectionsList
              .filter(c => c.agent_id === item.agent_id && c.status !== '300' && c.status !== '400')
              .reduce((acc, c) => acc + (c.amount ?? 0), 0);
          } else if (item.profil_id) {
            const profileAgents = agentsList.filter((a: any) => a.profil_id === item.profil_id);
            const agentIds = profileAgents.map((a: any) => a.id);
            sum = collectionsList
              .filter(c => c.agent_id && agentIds.includes(c.agent_id) && c.status !== '300' && c.status !== '400')
              .reduce((acc, c) => acc + (c.amount ?? 0), 0);
          }

          const agent = item.agent ?? agentsList.find((a: any) => a.id === item.agent_id) ?? null;
          const profil = item.profil ?? this.profiles().find((p: any) => p.id === item.profil_id) ?? null;
          const val = item.montantCollecte !== undefined && item.montantCollecte !== null ? item.montantCollecte : sum;

          return {
            ...item,
            agent,
            profil,
            collected_amount: val,
            current_amount: val,
            total_collecte: val
          };
        });
        
        this.affectations.set(mapped);
      },
      error: (err) => {
        this.affectations.set([]);
        this.toastService.show(this.extractErrorMessage(err) || 'Erreur chargement des affectations', 'error');
      }
    });
  }

  loadAgents(): void {
    this.utilisateurService.getAll({ limit: 1000, status: '200' }).subscribe({
      next: (response) => {
        this.agents.set(response?.data?.items ?? []);
      },
      error: () => this.agents.set([]),
    });
  }

  loadProfiles(): void {
    this.profileService.getAll().subscribe({
      next: (response) => {
        this.profiles.set(response?.data?.items ?? []);
      },
      error: () => this.profiles.set([]),
    });
  }

  // --- Plafond Actions ---
  openCreatePlafond(): void {
    this.selectedPlafond.set(null);
    this.isPlafondModalOpen.set(true);
  }

  openEditPlafond(plafond: Plafond): void {
    this.selectedPlafond.set(plafond);
    this.isPlafondModalOpen.set(true);
  }

  closePlafondModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }
    this.isPlafondModalOpen.set(false);
    this.selectedPlafond.set(null);
  }

  openDeletePlafondDialog(plafond: Plafond): void {
    this.selectedPlafond.set(plafond);
    this.isDeletePlafondOpen.set(true);
  }

  closeDeletePlafondDialog(): void {
    if (this.isDeleteLoading()) {
      return;
    }
    this.isDeletePlafondOpen.set(false);
  }

  savePlafond(payload: Plafond): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);

    const selected = this.selectedPlafond();
    const request$ = selected?.id
      ? this.plafondService.updateLimit(selected.id, payload)
      : this.plafondService.createLimit(payload);

    request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        const isEdit = !!selected?.id;
        this.notifService.add({
          type: 'plafond',
          action: isEdit ? 'update' : 'create',
          title: isEdit ? 'Plafond modifié' : 'Plafond créé',
          message: isEdit
            ? `Le plafond a été modifié avec succès.`
            : `Un nouveau plafond a été créé.`,
        });
        this.loadPlafonds();
        this.closePlafondModal(true);
        this.toastService.show(
          selected?.id ? 'Plafond modifié avec succès' : 'Plafond créé avec succès',
          'success'
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.show(
          this.extractErrorMessage(err) || 'Erreur lors de l\'enregistrement',
          'error'
        );
      },
    });
  }

  deletePlafond(): void {
    const selected = this.selectedPlafond();
    if (!selected?.id || this.isDeleteLoading()) {
      return;
    }
    this.isDeleteLoading.set(true);

    this.plafondService
      .deleteLimit(selected.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.notifService.add({
            type: 'plafond',
            action: 'delete',
            title: 'Plafond supprimé',
            message: 'Le plafond a été supprimé avec succès.',
          });
          this.loadPlafonds();
          this.closeDeletePlafondDialog();
          this.selectedPlafond.set(null);
          this.toastService.show('Plafond supprimé avec succès', 'success');
        },
        error: (err) => {
          this.toastService.show(
            this.extractErrorMessage(err) || 'Erreur lors de la suppression',
            'error'
          );
        },
      });
  }

  togglePlafondStatus(plafond: Plafond): void {
    if (!plafond.id) {
      return;
    }
    const isActivating = plafond.status !== '200';
    const request$ = isActivating
      ? this.plafondService.activateLimit(plafond.id)
      : this.plafondService.deactivateLimit(plafond.id);

    request$.subscribe({
      next: () => {
        this.loadPlafonds();
        this.toastService.show(
          isActivating ? 'Plafond activé avec succès' : 'Plafond désactivé avec succès',
          'success'
        );
      },
      error: (err) => {
        this.toastService.show(
          this.extractErrorMessage(err) || 'Erreur lors du changement de statut',
          'error'
        );
      },
    });
  }

  // --- Affectation Actions ---
  openCreateAffectation(): void {
    this.selectedAffectation.set(null);
    this.isAffectationModalOpen.set(true);
  }

  openEditAffectation(affectation: CollectorLimit): void {
    this.selectedAffectation.set(affectation);
    this.isAffectationModalOpen.set(true);
  }

  closeAffectationModal(force = false): void {
    if (!force && this.isLoading()) {
      return;
    }
    this.isAffectationModalOpen.set(false);
    this.selectedAffectation.set(null);
  }

  openDeleteAffectationDialog(affectation: CollectorLimit): void {
    this.selectedAffectation.set(affectation);
    this.isDeleteAffectationOpen.set(true);
  }

  closeDeleteAffectationDialog(): void {
    if (this.isDeleteLoading()) {
      return;
    }
    this.isDeleteAffectationOpen.set(false);
  }

  saveAffectation(payload: Partial<CollectorLimit>): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);

    const selected = this.selectedAffectation();
    const request$ = selected?.id
      ? this.plafondService.updateCollectorLimit(selected.id, payload)
      : this.plafondService.createCollectorLimit(payload);

    request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        const isEdit = !!selected?.id;
        this.notifService.add({
          type: 'plafond',
          action: isEdit ? 'update' : 'create',
          title: isEdit ? 'Affectation modifiée' : 'Nouvelle affectation',
          message: isEdit ? 'L\'affectation a été mise à jour.' : 'Une affectation de plafond a été créée.',
        });
        this.loadAffectations();
        this.closeAffectationModal(true);
        this.toastService.show(
          selected?.id ? 'Affectation modifiée avec succès' : 'Affectation créée avec succès',
          'success'
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.show(
          this.extractErrorMessage(err) || 'Erreur lors de l\'enregistrement',
          'error'
        );
      },
    });
  }

  deleteAffectation(): void {
    const selected = this.selectedAffectation();
    if (!selected?.id || this.isDeleteLoading()) {
      return;
    }
    this.isDeleteLoading.set(true);

    this.plafondService
      .deleteCollectorLimit(selected.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.notifService.add({
            type: 'plafond',
            action: 'delete',
            title: 'Affectation supprimée',
            message: 'L\'affectation de plafond a été supprimée.',
          });
          this.loadAffectations();
          this.closeDeleteAffectationDialog();
          this.selectedAffectation.set(null);
          this.toastService.show('Affectation supprimée avec succès', 'success');
        },
        error: (err) => {
          this.toastService.show(
            this.extractErrorMessage(err) || 'Erreur lors de la suppression',
            'error'
          );
        },
      });
  }

  openResetLimitDialog(affectation: CollectorLimit): void {
    this.selectedLimitToReset.set(affectation);
    this.isResetLimitOpen.set(true);
  }

  closeResetLimitDialog(): void {
    if (this.isResetLoading()) {
      return;
    }
    this.isResetLimitOpen.set(false);
    this.selectedLimitToReset.set(null);
  }

  resetLimit(): void {
    const selected = this.selectedLimitToReset();
    if (!selected?.id || this.isResetLoading()) {
      return;
    }
    this.isResetLoading.set(true);

    this.plafondService
      .resetCollectorLimit(selected.id)
      .pipe(finalize(() => this.isResetLoading.set(false)))
      .subscribe({
        next: () => {
          this.notifService.add({
            type: 'plafond',
            action: 'reset',
            title: 'Plafond réinitialisé',
            message: 'Un collecteur a été déplafonné avec succès.',
          });
          this.loadAffectations();
          this.closeResetLimitDialog();
          this.toastService.show('Collecteur déplafonné avec succès', 'success');
        },
        error: (err) => {
          this.toastService.show(
            this.extractErrorMessage(err) || 'Erreur lors du déplafonnement',
            'error'
          );
        },
      });
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message && Array.isArray(error.error.message)) {
      return error.error.message
        .map((msg: any) => (typeof msg === 'string' ? msg : msg?.message || JSON.stringify(msg)))
        .join(', ');
    }
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return '';
  }
}
