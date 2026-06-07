// pages/groupe-detail/groupe-detail.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { finalize } from 'rxjs';

import { Groupe } from '../../models/groupe.model';
import { AffectationAdherent } from '../../models/affectation-adherent.model';
import { SubscriptionGroup } from '../../models/subscription-group.model';

import { GroupeService } from '../../services/groupe.service';
import { SubscriptionGroupService } from '../../services/subscription-group.service';

import { AffectationAdherentService } from '../../services/affectation-adherent.service';

import { Adherent } from '../../../adherents/models/adherent.model';
import { AdherentService } from '../../../adherents/services/adherent.service';

import { GroupeMembersComponent } from '../../components/groupe-members/groupe-members.component';

import { AffectationAdherentFormComponent } from '../../components/affectation-adherent-form/affectation-adherent-form.component';

import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';

import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';

import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';

import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-groupe-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    GroupeMembersComponent,
    AffectationAdherentFormComponent,
    AppModalComponent,
    AppConfirmDialogComponent,
    AppEmptyStateComponent,
  ],
  templateUrl: './groupe-detail.component.html',
  styleUrls: ['./groupe-detail.component.css'],
})
export class GroupeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly groupeService = inject(GroupeService);

  private readonly adherentService = inject(AdherentService);

  private readonly affectationService = inject(AffectationAdherentService);

  private readonly subscriptionGroupService = inject(SubscriptionGroupService);

  private readonly toastService = inject(ToastService);

  readonly groupe = signal<Groupe | null>(null);

  readonly members = signal<AffectationAdherent[]>([]);

  readonly adherents = signal<Adherent[]>([]);

  readonly displayedMembers = computed(() => {
    const adherentMap = new Map(
      this.adherents()
        .filter((adherent): adherent is Adherent & { id: string } => Boolean(adherent.id))
        .map((adherent) => [String(adherent.id), adherent]),
    );

    return this.members().map((member) => {
      if (member.adherent) {
        return member;
      }

      const resolvedAdherent = member.adherent_id
        ? adherentMap.get(String(member.adherent_id))
        : undefined;

      return resolvedAdherent
        ? {
            ...member,
            adherent: resolvedAdherent,
          }
        : member;
    });
  });

  // Subscription groups (groupes de cotisation) pour selectionner le "type" de cotisation
  readonly subscriptionGroups = signal<SubscriptionGroup[]>([]);

  readonly isLoading = signal(false);

  readonly isModalOpen = signal(false);

  readonly isDeleteOpen = signal(false);

  readonly isSaveLoading = signal(false);

  readonly isDeleteLoading = signal(false);

  readonly selectedMember = signal<AffectationAdherent | null>(null);

  readonly totalMembers = computed(() => this.displayedMembers().length);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.loadGroupe(id);

    this.loadMembers(id);

    this.loadAdherents();

    this.loadSubscriptionGroups();

    // IMPORTANT: après suppression des données fictives, on s'assure que le groupe/membres restent cohérents
    // même si le backend renvoie une page vide.
    // (pas de fallback fictif).
  }

  loadGroupe(id: string): void {
    this.isLoading.set(true);

    this.groupeService
      .getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.groupe.set(response);
        },

        error: () => {
          this.groupe.set(null);
        },
      });
  }

  loadMembers(groupeId: string): void {
    this.affectationService.getAll(groupeId, '200').subscribe({
      next: (response) => {
        this.members.set(response.data?.items ?? []);
      },

      error: () => {
        this.members.set([]);
      },
    });
  }

  loadSubscriptionGroups(): void {
    this.subscriptionGroupService.getAll().subscribe({
      next: (response) => {
        this.subscriptionGroups.set(response.data?.items ?? response.data ?? []);
      },
      error: () => {
        this.subscriptionGroups.set([]);
      },
    });
  }

  loadAdherents(): void {
    this.adherentService.getAll(1, 100).subscribe({
      next: (response) => {
        this.adherents.set(response.data?.items ?? []);
      },

      error: () => {
        this.adherents.set([]);
      },
    });
  }

  openCreateModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(force = false): void {
    if (!force && this.isSaveLoading()) {
      return;
    }

    this.isModalOpen.set(false);
  }

  saveAffectation(payload: AffectationAdherent): void {
    const groupe = this.groupe();

    if (!groupe?.id) {
      return;
    }

    const adherentIds = payload.adherent_ids ?? (payload.adherent_id ? [payload.adherent_id] : []);

    if (adherentIds.length === 0) {
      this.toastService.show('Aucun adhérent sélectionné', 'error');
      return;
    }

    this.isSaveLoading.set(true);

    const requests = adherentIds.map((adherentId) =>
      this.affectationService.create({
        groupe_id: groupe.id!,
        adherent_id: adherentId,
      }),
    );

    let completed = 0;

    requests.forEach((req) => {
      req.subscribe({
        next: () => {
          completed += 1;

          if (completed === requests.length) {
            this.closeModal(true);
            this.toastService.show('Membres affectés', 'success');
            this.isSaveLoading.set(false);
            this.loadMembers(groupe.id!);
          }
        },
        error: () => {
          this.toastService.show('Erreur affectation', 'error');
          completed += 1;

          if (completed === requests.length) {
            this.isSaveLoading.set(false);
            this.loadMembers(groupe.id!);
          }
        },
      });
    });
  }

  openDeleteDialog(member: AffectationAdherent): void {
    this.selectedMember.set(member);

    this.isDeleteOpen.set(true);
  }

  closeDeleteDialog(force = false): void {
    if (!force && this.isDeleteLoading()) {
      return;
    }

    this.isDeleteOpen.set(false);
  }

  removeMember(): void {
    const member = this.selectedMember();

    const groupe = this.groupe();

    if (!member?.id || !groupe?.id) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.affectationService
      .delete(member.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.closeDeleteDialog(true);

          this.toastService.show('Membre retire', 'success');

          this.loadMembers(groupe.id!);
        },
        error: () => {
          this.toastService.show('Erreur suppression membre', 'error');
        },
      });
  }
}

