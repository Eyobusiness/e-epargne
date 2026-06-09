import { Routes } from '@angular/router';

import { WorkflowsComponent } from '../pages/workflows/workflows.component';
import { WorkflowDetailComponent } from '../pages/workflow-detail/workflow-detail.component';

export const WORKFLOW_ROUTES: Routes = [
  {
    path: '',
    component: WorkflowsComponent,
  },

  {
    path: ':id',
    component: WorkflowDetailComponent,
  },
];