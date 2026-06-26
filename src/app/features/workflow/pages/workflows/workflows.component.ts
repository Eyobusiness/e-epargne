import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { WorkflowService } from '../../services/workflow.service';
import { Workflow } from '../../models/workflow.model';
import { WorkflowState } from '../../models/workflow-state.model';
import { WorkflowAction } from '../../models/workflow-action.model';

import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { WorkflowTableComponent } from '../../components/workflow-table/workflow-table.component';
import { WorkflowStatesComponent } from '../../components/workflow-states/workflow-states.component';
import { WorkflowActionsComponent } from '../../components/workflow-actions/workflow-actions.component';
import { WorkflowActionFormComponent } from '../../components/workflow-action-form/workflow-action-form.component';
import { AppModalComponent } from '@shared/ui/app-modal/app-modal.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
import { WorkflowStateFormComponent } from '@features/workflow/components/workflow-state-form/workflow-state-form.component';
import { WorkflowFormComponent } from '@features/workflow/components/workflow-form/workflow-form.component';
import { ProfileService } from '../../../profil/services/profil.service';
import { Profile } from '../../../profil/models/profil.model';
import { ParametreService } from '../../../parametres/services/parametre.service';
import { Parametre } from '../../../parametres/models/parametre.models';
import { ToastService } from '../../../../core/services/toast.service';

type WorkflowTab = 'workflow' | 'state' | 'action';

@Component({
  selector: 'app-workflow-page',
  standalone: true,
  imports: [
    AppPageHeaderComponent,
    WorkflowTableComponent,
    WorkflowStatesComponent,
    WorkflowActionsComponent,
    WorkflowActionFormComponent,
    AppModalComponent,
    AppConfirmDialogComponent,
    WorkflowStateFormComponent,
    WorkflowFormComponent,
  ],
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.css'],
})
export class WorkflowPageComponent implements OnInit {
  private readonly workflowService = inject(WorkflowService);
  private readonly profileService = inject(ProfileService);
  private readonly parametreService = inject(ParametreService);
  private readonly toastService = inject(ToastService);

  readonly activeTab = signal<WorkflowTab>('workflow');
  readonly workflows = signal<Workflow[]>([]);
  readonly states = signal<WorkflowState[]>([]);
  readonly actions = signal<WorkflowAction[]>([]);
  readonly hasLoadedActions = signal(false);
  readonly profiles = signal<Profile[]>([]);
  readonly endpoints = signal<Parametre[]>([]);

  readonly isWorkflowLoading = signal(false);
  readonly isStateLoading = signal(false);
  readonly isActionLoading = signal(false);
  readonly isDeleteWorkflowLoading = signal(false);
  readonly isDeleteStateLoading = signal(false);
  readonly isDeleteLoading = signal(false);

  readonly isStateModalOpen = signal(false);
  readonly isDeleteStateOpen = signal(false);
  readonly selectedState = signal<WorkflowState | null>(null);
  readonly selectedStateId = signal<string | null>(null);

  readonly isWorkflowModalOpen = signal(false);
  readonly isDeleteWorkflowOpen = signal(false);
  readonly selectedWorkflow = signal<Workflow | null>(null);
  readonly selectedWorkflowId = signal<string | null>(null);

  readonly isActionModalOpen = signal(false);
  readonly isDeleteActionOpen = signal(false);
  readonly selectedAction = signal<WorkflowAction | null>(null);
  readonly selectedActionId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadWorkflows();
    this.loadStates();
    this.loadProfiles();
    this.loadEndpoints();
  }

  setTab(tab: WorkflowTab): void {
    this.activeTab.set(tab);

    if (tab === 'action' && !this.hasLoadedActions()) {
      this.loadActions();
    }
  }

  loadWorkflows(): void {
    this.workflowService.getWorkflows().subscribe({
      next: (data) => {
        this.workflows.set(data);
      },
      error: (error) => {
        this.workflows.set([]);
        this.actions.set([]);
        this.hasLoadedActions.set(false);
        this.toastService.show(this.extractErrorMessage(error) || 'Erreur chargement workflows', 'error');
      },
    });
  }

  loadStates(): void {
    this.workflowService.getStates().subscribe({
      next: (data) => this.states.set(data),
      error: (error) => {
        this.states.set([]);
        this.toastService.show(this.extractErrorMessage(error) || 'Erreur chargement etats', 'error');
      },
    });
  }

  loadProfiles(): void {
    this.profileService.getAll().subscribe({
      next: (response) => {
        this.profiles.set(response?.data?.items ?? []);
      },
      error: (error) => {
        this.profiles.set([]);
        this.toastService.show(this.extractErrorMessage(error) || 'Erreur chargement profils', 'error');
      },
    });
  }

  loadEndpoints(): void {
    this.parametreService.getAll().subscribe({
      next: (response) => {
        const items = response?.data?.items ?? [];
        this.endpoints.set(items.filter((item) => item.type?.toUpperCase() === 'ENDPOINT'));
      },
      error: (error) => {
        this.endpoints.set([]);
        this.toastService.show(this.extractErrorMessage(error) || 'Erreur chargement endpoints', 'error');
      },
    });
  }

  openActionModal(): void {
    this.selectedAction.set(null);
    this.isActionModalOpen.set(true);
  }

  openEditActionModal(action: WorkflowAction): void {
    this.selectedAction.set(action);
    this.isActionModalOpen.set(true);
  }

  closeActionModal(force = false): void {
    if (!force && this.isActionLoading()) {
      return;
    }

    this.selectedAction.set(null);
    this.isActionModalOpen.set(false);
  }

  saveAction(payload: WorkflowAction): void {
    const selected = this.selectedAction();

    if (this.isActionLoading()) {
      return;
    }

    this.isActionLoading.set(true);

    const sanitizedPayload = this.normalizeActionPayload(payload);

    const request = selected?.id
      ? this.workflowService.updateAction(selected.id, sanitizedPayload)
      : this.workflowService.createAction(sanitizedPayload);

    request.pipe(finalize(() => this.isActionLoading.set(false))).subscribe({
      next: () => {
        this.loadActions();
        this.closeActionModal(true);
        this.toastService.show('Action enregistree avec succes', 'success');
      },
      error: (error) => {
        this.toastService.show(this.extractErrorMessage(error) || 'Erreur enregistrement action', 'error');
      },
    });
  }

  openDeleteActionDialog(id: string): void {
    this.selectedActionId.set(id);
    this.isDeleteActionOpen.set(true);
  }

  closeDeleteActionDialog(force = false): void {
    if (!force && this.isDeleteLoading()) {
      return;
    }

    this.selectedActionId.set(null);
    this.isDeleteActionOpen.set(false);
  }

  deleteAction(): void {
    const id = this.selectedActionId();

    if (!id) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.workflowService
      .deleteAction(id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.actions.update((actions) => actions.filter((action) => action.id !== id));
          this.hasLoadedActions.set(true);
          this.closeDeleteActionDialog(true);
          this.toastService.show('Action supprimee avec succes', 'success');
        },
        error: (error) => {
          this.toastService.show(this.extractErrorMessage(error) || 'Erreur suppression action', 'error');
        },
      });
  }

  openStateModal(): void {
    this.selectedState.set(null);
    this.isStateModalOpen.set(true);
  }

  openEditStateModal(state: WorkflowState): void {
    this.selectedState.set(state);
    this.isStateModalOpen.set(true);
  }

  closeStateModal(force = false): void {
    if (!force && this.isStateLoading()) {
      return;
    }

    this.selectedState.set(null);
    this.isStateModalOpen.set(false);
  }

  openDeleteStateDialog(id: string): void {
    this.selectedStateId.set(id);
    this.isDeleteStateOpen.set(true);
  }

  closeDeleteStateDialog(force = false): void {
    if (!force && this.isDeleteStateLoading()) {
      return;
    }

    this.selectedStateId.set(null);
    this.isDeleteStateOpen.set(false);
  }

  saveState(payload: WorkflowState): void {
    const selected = this.selectedState();

    if (this.isStateLoading()) {
      return;
    }

    this.isStateLoading.set(true);

    const sanitizedPayload = this.normalizeStatePayload(payload);

    const request = selected?.id
      ? this.workflowService.updateState(selected.id, sanitizedPayload)
      : this.workflowService.createState(sanitizedPayload);

    request.pipe(finalize(() => this.isStateLoading.set(false))).subscribe({
      next: () => {
        this.loadStates();
        this.closeStateModal(true);
        this.toastService.show('Etat enregistre avec succes', 'success');
      },
      error: (error) => {
        this.toastService.show(this.extractErrorMessage(error) || 'Erreur enregistrement etat', 'error');
      },
    });
  }

  deleteState(): void {
    const id = this.selectedStateId();

    if (!id) {
      return;
    }

    this.isDeleteStateLoading.set(true);

    this.workflowService
      .deleteState(id)
      .pipe(finalize(() => this.isDeleteStateLoading.set(false)))
      .subscribe({
        next: () => {
          this.states.update((states) => states.filter((state) => state.id !== id));
          this.closeDeleteStateDialog(true);
          this.toastService.show('Etat supprime avec succes', 'success');
        },
        error: (error) => {
          this.toastService.show(this.extractErrorMessage(error) || 'Erreur suppression etat', 'error');
        },
      });
  }

  openWorkflowModal(): void {
    this.selectedWorkflow.set(null);
    this.isWorkflowModalOpen.set(true);
  }

  openEditWorkflowModal(workflow: Workflow): void {
    this.selectedWorkflow.set(workflow);
    this.isWorkflowModalOpen.set(true);
  }

  saveWorkflow(payload: Workflow): void {
    const selected = this.selectedWorkflow();

    if (this.isWorkflowLoading()) {
      return;
    }

    this.isWorkflowLoading.set(true);

    const sanitizedPayload = this.normalizeWorkflowPayload(payload);

    const request = selected?.id
      ? this.workflowService.updateWorkflow(selected.id, sanitizedPayload)
      : this.workflowService.createWorkflow(sanitizedPayload);

    request.pipe(finalize(() => this.isWorkflowLoading.set(false))).subscribe({
      next: () => {
        this.loadWorkflows();
        this.closeWorkflowModal(true);
        this.toastService.show('Workflow enregistre avec succes', 'success');
      },
      error: (error) => {
        this.toastService.show(this.extractErrorMessage(error) || 'Erreur enregistrement workflow', 'error');
      },
    });
  }

  closeWorkflowModal(force = false): void {
    if (!force && this.isWorkflowLoading()) {
      return;
    }

    this.selectedWorkflow.set(null);
    this.isWorkflowModalOpen.set(false);
  }

  openDeleteWorkflowDialog(id: string): void {
    this.selectedWorkflowId.set(id);
    this.isDeleteWorkflowOpen.set(true);
  }

  closeDeleteWorkflowDialog(force = false): void {
    if (!force && this.isDeleteWorkflowLoading()) {
      return;
    }

    this.selectedWorkflowId.set(null);
    this.isDeleteWorkflowOpen.set(false);
  }

  deleteWorkflow(): void {
    const id = this.selectedWorkflowId();

    if (!id) {
      return;
    }

    this.isDeleteWorkflowLoading.set(true);

    this.workflowService
      .deleteWorkflow(id)
      .pipe(finalize(() => this.isDeleteWorkflowLoading.set(false)))
      .subscribe({
        next: () => {
          this.workflows.update((workflows) => workflows.filter((workflow) => workflow.id !== id));
          this.actions.update((actions) => actions.filter((action) => action.idWorkflow !== id));
          this.hasLoadedActions.set(true);
          this.closeDeleteWorkflowDialog(true);
          this.toastService.show('Workflow supprime avec succes', 'success');
        },
        error: (error) => {
          this.toastService.show(this.extractErrorMessage(error) || 'Erreur suppression workflow', 'error');
        },
      });
  }

  private loadActions(workflows = this.workflows()): void {
    const workflowIds = workflows.map((workflow) => workflow.id).filter((id): id is string => Boolean(id));

    if (workflowIds.length === 0) {
      this.actions.set([]);
      this.hasLoadedActions.set(false);
      return;
    }

    forkJoin(
      workflowIds.map((workflowId) =>
        this.workflowService.getActions(workflowId).pipe(catchError(() => of([]))),
      ),
    ).subscribe({
      next: (collections) => {
        const actions = collections.flat();
        const uniqueActions = Array.from(
          new Map(
            actions.map((action) => [
              action.id ?? `${action.idWorkflow}-${action.stepId}-${action.endpoint}-${action.stateOrder ?? ''}`,
              action,
            ]),
          ).values(),
        );
        this.actions.set(uniqueActions);
        this.hasLoadedActions.set(true);
      },
      error: (error) => {
        this.actions.set([]);
        this.hasLoadedActions.set(false);
        this.toastService.show(this.extractErrorMessage(error) || 'Erreur chargement actions', 'error');
      },
    });
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message && Array.isArray(error.error.message)) {
      return error.error.message.join(', ');
    }

    return error?.error?.message || error?.message || '';
  }

  private normalizeWorkflowPayload(payload: Workflow): Workflow {
    return {
      label: payload.label ?? '',
      endpoint: payload.endpoint ?? '',
      description: payload.description ?? '',
    };
  }

  private normalizeStatePayload(payload: WorkflowState): WorkflowState {
    return {
      name: payload.name ?? '',
      beforeStep: payload.beforeStep ?? '',
      description: payload.description ?? '',
      parent: payload.parent ?? 'TONTINEAPP',
    };
  }

  private normalizeActionPayload(payload: WorkflowAction): WorkflowAction {
    return {
      idWorkflow: payload.idWorkflow ?? '',
      stepId: payload.stepId ?? '',
      endpoint: payload.endpoint ?? '',
      beforeStep: payload.beforeStep ?? '',
      stateOrder: payload.stateOrder ?? '',
      notification: payload.notification ?? '',
      nextField: payload.nextField ?? '',
      parent: payload.parent ?? 'TONTINEAPP',
      profileIds: payload.profileIds ?? [],
    };
  }
}
