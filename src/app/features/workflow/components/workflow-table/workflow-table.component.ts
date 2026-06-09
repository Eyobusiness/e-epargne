import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Workflow } from '../../models/workflow.model';

@Component({
  selector: 'app-workflow-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-table.component.html',
  styleUrls: ['./workflow-table.component.css'],
})
export class WorkflowTableComponent {
  readonly workflows = input<Workflow[]>([]);

  readonly edit = output<Workflow>();

  readonly delete = output<Workflow>();

  readonly details = output<Workflow>();

  onEdit(item: Workflow): void {
    this.edit.emit(item);
  }

  onDelete(item: Workflow): void {
    this.delete.emit(item);
  }

  onDetails(item: Workflow): void {
    this.details.emit(item);
  }

  trackById(index: number, item: Workflow): string {
    return item.id ?? index.toString();
  }
}
