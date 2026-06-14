import { ProfileService } from './../../../profil/services/profil.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { WorkflowService } from '../../services/workflow.service';
import { Workflow } from '../../models/workflow.model';
import { WorkflowState } from '../../models/workflow-state.model';
import { WorkflowAction } from '../../models/workflow-action.model';

import { WorkflowStatesComponent } from '../../components/workflow-states/workflow-states.component';
import { WorkflowActionsComponent } from '../../components/workflow-actions/workflow-actions.component';

import { WorkflowStateFormComponent } from '../../components/workflow-state-form/workflow-state-form.component';
import { WorkflowActionFormComponent } from '../../components/workflow-action-form/workflow-action-form.component';

import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';

@Component({
  selector: 'app-workflow-detail',
  standalone: true,
  imports: [
    CommonModule,

    WorkflowStatesComponent,
    WorkflowActionsComponent,

    WorkflowStateFormComponent,
    WorkflowActionFormComponent,

    AppModalComponent,
  ],
  templateUrl: './workflow-detail.component.html',
  styleUrls: ['./workflow-detail.component.css'],
})
export class WorkflowDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly location = inject(Location);

  private readonly router = inject(Router);

  private readonly service = inject(WorkflowService);

  private readonly profilService = inject(ProfileService);

  readonly workflow = signal<Workflow | null>(null);

  readonly states = signal<WorkflowState[]>([]);

  readonly actions = signal<WorkflowAction[]>([]);

  readonly workflows = signal<any[]>([]);

  readonly profiles = signal<any[]>([]);

  readonly selectedState = signal<WorkflowState | null>(null);

  readonly selectedAction = signal<WorkflowAction | null>(null);

  readonly isStateModalOpen = signal(false);

  readonly isActionModalOpen = signal(false);

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.loadWorkflow(id);
  }

  goBack(): void {
    this.router.navigate(['/workflow']);
  }

  loadWorkflow(id: string): void {

    this.service.getWorkflowById(id).subscribe({
      next: (response) => {

        this.workflow.set(response);

        this.actions.set(response.actions ?? []);
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.service.getStates().subscribe({
      next: (response) => {
        this.states.set(response);
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.service.getWorkflows().subscribe({
      next: (response) => {
        this.workflows.set(response);
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.profilService.getAll().subscribe({
      next: (response) => {
        this.profiles.set(response.data.items ?? []);
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.service.getWorkflowActions(id).subscribe({
      next: (response) => {
        this.actions.set(response ?? []);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  // =====================================================
  // STATES
  // =====================================================

  openCreateState(): void {

    this.selectedState.set(null);

    this.isStateModalOpen.set(true);
  }

  openEditState(state: WorkflowState): void {

    this.selectedState.set(state);

    this.isStateModalOpen.set(true);
  }

  closeStateModal(): void {

    this.selectedState.set(null);

    this.isStateModalOpen.set(false);
  }

  saveState(state: WorkflowState): void {

    this.service.createState(state).subscribe({
      next: () => {

        const workflowId =
          this.route.snapshot.paramMap.get('id');

        if (workflowId) {
          this.loadWorkflow(workflowId);
        }

        this.closeStateModal();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteState(state: WorkflowState): void {

    if (!state.id) {
      return;
    }

    this.service.deleteState(state.id).subscribe({
      next: () => {

        const workflowId =
          this.route.snapshot.paramMap.get('id');

        if (workflowId) {
          this.loadWorkflow(workflowId);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  // =====================================================
  // ACTIONS
  // =====================================================

  openCreateAction(): void {

    this.selectedAction.set(null);

    this.isActionModalOpen.set(true);
  }

  openEditAction(action: WorkflowAction): void {

    this.selectedAction.set(action);

    this.isActionModalOpen.set(true);
  }

  closeActionModal(): void {

    this.selectedAction.set(null);

    this.isActionModalOpen.set(false);
  }

  saveAction(action: WorkflowAction): void {

    this.service.createAction(action).subscribe({
      next: () => {

        const workflowId =
          this.route.snapshot.paramMap.get('id');

        if (workflowId) {
          this.loadWorkflow(workflowId);
        }

        this.closeActionModal();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteAction(action: WorkflowAction): void {

    if (!action.id) {
      return;
    }

    this.service.deleteAction(action.id).subscribe({
      next: () => {

        const workflowId =
          this.route.snapshot.paramMap.get('id');

        if (workflowId) {
          this.loadWorkflow(workflowId);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}