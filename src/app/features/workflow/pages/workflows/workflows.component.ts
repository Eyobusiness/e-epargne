import { Component, OnInit, inject, input, signal } from '@angular/core';

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
// import { AppToastComponent } from '../../../../shared/ui/app-toast/app-toast.component';

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
    // AppToastComponent,
  ],
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.css'],
})
export class WorkflowPageComponent implements OnInit {
  private readonly workflowService = inject(WorkflowService);

  activeTab = signal<WorkflowTab>('workflow');

  workflows = signal<Workflow[]>([]);

  states = signal<WorkflowState[]>([]);

  actions = signal<WorkflowAction[]>([]);

  profiles = signal<any[]>([]);

  endpoints = signal<any[]>([]);

 

  readonly isStateModalOpen = signal(false);

  readonly isDeleteStateOpen = signal(false);

  readonly selectedState = signal<WorkflowState | null>(null);

  readonly selectedStateId = signal<string | null>(null);

  readonly isWorkflowModalOpen = signal(false);

  readonly isDeleteWorkflowOpen = signal(false);

  readonly selectedWorkflow = signal<Workflow | null>(null);

  readonly selectedWorkflowId = signal<string | null>(null);

  readonly isDeleteWorkflowLoading = signal(false);

  readonly isDeleteStateLoading = signal(false);

  readonly isActionModalOpen = signal(false);

  readonly isDeleteActionOpen = signal(false);

  readonly selectedAction = signal<WorkflowAction | null>(null);

  readonly selectedActionId = signal<string | null>(null);

  readonly isDeleteLoading = signal(false);

  ngOnInit(): void {
    this.loadWorkflows();

    this.loadStates();

    // this.loadActions();

    // this.loadProfiles();

    // this.loadEndpoints();
  }

  setTab(tab: WorkflowTab): void {
    this.activeTab.set(tab);
  }

  loadWorkflows(): void {
    this.workflowService.getWorkflows().subscribe({
      next: (data) => this.workflows.set(data),
    });
  }

  loadStates(): void {
    this.workflowService.getStates().subscribe({
      next: (data) => this.states.set(data),
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

  closeActionModal(): void {
    this.selectedAction.set(null);

    this.isActionModalOpen.set(false);
  }

  saveAction(payload: WorkflowAction): void {
    console.log('ACTION', payload);

    this.closeActionModal();
  }

  openDeleteActionDialog(id: string): void {
    this.selectedActionId.set(id);

    this.isDeleteActionOpen.set(true);
  }

  closeDeleteActionDialog(): void {
    this.selectedActionId.set(null);

    this.isDeleteActionOpen.set(false);
  }

  deleteAction(): void {
    const id = this.selectedActionId();

    if (!id) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.workflowService.deleteAction(id).subscribe({
      next: () => {
        this.actions.update((actions) => actions.filter((action) => action.id !== id));

        this.closeDeleteActionDialog();

        this.isDeleteLoading.set(false);
      },

      error: () => {
        this.isDeleteLoading.set(false);
      },
    });
  }

  openEditStateModal(state: WorkflowState): void {
    this.selectedState.set(state);

    this.isStateModalOpen.set(true);
  }

  closeStateModal(): void {
    this.selectedState.set(null);

    this.isStateModalOpen.set(false);
  }
  openDeleteStateDialog(id: string): void {
    this.selectedStateId.set(id);

    this.isDeleteStateOpen.set(true);
  }

  closeDeleteStateDialog(): void {
    this.selectedStateId.set(null);

    this.isDeleteStateOpen.set(false);
  }

  saveState(payload: WorkflowState): void {
    console.log(payload);

    this.closeStateModal();
  }

  deleteState(): void {
    const id = this.selectedStateId();

    if (!id) {
      return;
    }

    console.log('DELETE STATE', id);

    this.closeDeleteStateDialog();
  }
  openStateModal(): void {
    this.selectedState.set(null);

    this.isStateModalOpen.set(true);
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
    console.log(payload);

    this.closeWorkflowModal();
  }

  closeWorkflowModal(): void {
    this.selectedWorkflow.set(null);

    this.isWorkflowModalOpen.set(false);
  }

  openDeleteWorkflowDialog(id: string): void {
    this.selectedWorkflowId.set(id);

    this.isDeleteWorkflowOpen.set(true);
  }

  closeDeleteWorkflowDialog(): void {
    this.selectedWorkflowId.set(null);

    this.isDeleteWorkflowOpen.set(false);
  }
  deleteWorkflow(): void {
    const id = this.selectedWorkflowId();

    if (!id) {
      return;
    }

    console.log('DELETE WORKFLOW', id);

    this.closeDeleteWorkflowDialog();
  }
}

