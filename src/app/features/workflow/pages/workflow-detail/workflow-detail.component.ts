import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

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

  private readonly service = inject(WorkflowService);

  readonly workflow = signal<Workflow | null>(null);

  readonly states = signal<WorkflowState[]>([]);

  readonly actions = signal<WorkflowAction[]>([]);

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

  loadWorkflow(id: string): void {
    this.service.getWorkflowById(id).subscribe({
      next: (response) => {
        this.workflow.set(response);

        this.actions.set(response.actions ?? []);
      },
    });

    this.service.getStates().subscribe({
      next: (response) => {
        this.states.set(response);
      },
    });
  }

  openCreateState(): void {
    this.selectedState.set(null);

    this.isStateModalOpen.set(true);
  }

  openEditState(state: WorkflowState): void {
    this.selectedState.set(state);

    this.isStateModalOpen.set(true);
  }

  openCreateAction(): void {
    this.selectedAction.set(null);

    this.isActionModalOpen.set(true);
  }

  openEditAction(action: WorkflowAction): void {
    this.selectedAction.set(action);

    this.isActionModalOpen.set(true);
  }

  closeStateModal(): void {
    this.isStateModalOpen.set(false);
  }

  closeActionModal(): void {
    this.isActionModalOpen.set(false);
  }
}