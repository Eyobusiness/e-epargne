import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { WorkflowAction } from '../../models/workflow-action.model';

@Component({
  selector: 'app-workflow-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-actions.component.html',
  styleUrls: ['./workflow-actions.component.css'],
})
export class WorkflowActionsComponent {
  readonly actions = input<WorkflowAction[]>([]);

  readonly edit = output<WorkflowAction>();

  readonly delete = output<WorkflowAction>();

  onEdit(item: WorkflowAction): void {
    this.edit.emit(item);
  }

  onDelete(item: WorkflowAction): void {
    this.delete.emit(item);
  }

  trackById(index: number, item: WorkflowAction): string {
    return item.id ?? index.toString();
  }
}
