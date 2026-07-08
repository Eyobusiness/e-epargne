import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Workflow } from '../../models/workflow.model';
import { WorkflowState } from '../../models/workflow-state.model';
import { WorkflowAction } from '../../models/workflow-action.model';
import { Profile } from '../../../profil/models/profil.model';

import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';

@Component({
  selector: 'app-workflow-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, AppPaginationComponent],
  templateUrl: './workflow-actions.component.html',
  styleUrls: ['./workflow-actions.component.css'],
})
export class WorkflowActionsComponent {
  readonly workflows = input<Workflow[]>([]);
  readonly states = input<WorkflowState[]>([]);
  readonly actions = input<WorkflowAction[]>([]);
  readonly profiles = input<Profile[]>([]);
  readonly create = output<void>();
  readonly edit = output<WorkflowAction>();
  readonly remove = output<string>();
  readonly search = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 10;

  onSearch(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  readonly filteredItems = computed(() => {
    const term = this.search().trim().toLowerCase();

    const data = this.actions().map((action) => ({
      ...action,
      workflowLabel:
        this.workflows().find((workflow) => workflow.id === action.idWorkflow)?.label ?? '-',
      stateLabel: this.states().find((state) => state.id === action.stepId)?.name ?? '-',
      profileLabel: this.resolveProfileLabel(action),
    }));

    if (!term) {
      return data;
    }

    return data.filter(
      (item) =>
        item.workflowLabel.toLowerCase().includes(term) ||
        item.stateLabel.toLowerCase().includes(term) ||
        item.profileLabel.toLowerCase().includes(term) ||
        item.endpoint?.toLowerCase().includes(term),
    );
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize)),
  );

  readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;

    return this.filteredItems().slice(start, end);
  });

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  openCreate(): void {
    this.create.emit();
  }

  onEdit(action: WorkflowAction): void {
    this.edit.emit(action);
  }

  onDelete(id: string): void {
    this.remove.emit(id);
  }

  private resolveProfileLabel(action: WorkflowAction): string {
    if (action.profile?.name) {
      return action.profile.name;
    }

    const ids = action.profileIds?.length
      ? action.profileIds
      : action.profileId
        ? [action.profileId]
        : [];

    if (ids.length === 0) {
      return '-';
    }

    const labels = ids
      .map((id) => this.profiles().find((profile) => profile.id === id)?.libelle)
      .filter((label): label is string => Boolean(label));

    return labels.length > 0 ? labels.join(', ') : '-';
  }
}
