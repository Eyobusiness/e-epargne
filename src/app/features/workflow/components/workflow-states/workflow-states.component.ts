import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { WorkflowState } from '../../models/workflow-state.model';

@Component({
  selector: 'app-workflow-states',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-states.component.html',
  styleUrls: ['./workflow-states.component.css'],
})
export class WorkflowStatesComponent {
  readonly states = input<WorkflowState[]>([]);

  readonly edit = output<WorkflowState>();

  readonly delete = output<WorkflowState>();

  trackById(index: number, item: WorkflowState): string {
    return item.id ?? index.toString();
  }

  onEdit(item: WorkflowState): void {
    this.edit.emit(item);
  }

  onDelete(item: WorkflowState): void {
    this.delete.emit(item);
  }
}
