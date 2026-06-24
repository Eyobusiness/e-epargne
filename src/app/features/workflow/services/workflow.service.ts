import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { Workflow } from '../models/workflow.model';
import { WorkflowState } from '../models/workflow-state.model';
import { WorkflowAction } from '../models/workflow-action.model';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/workflows`;

  // ======================================================
  // WORKFLOWS
  // ======================================================

  getWorkflows(): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(this.apiUrl);
  }

  getWorkflow(id: string): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.apiUrl}/${id}`);
  }

  createWorkflow(payload: Workflow): Observable<Workflow> {
    return this.http.post<Workflow>(this.apiUrl, payload);
  }

  updateWorkflow(id: string, payload: Partial<Workflow>): Observable<Workflow> {
    return this.http.put<Workflow>(`${this.apiUrl}/${id}`, payload);
  }

  deleteWorkflow(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ======================================================
  // STATES
  // ======================================================

  getStates(): Observable<WorkflowState[]> {
    return this.http.get<WorkflowState[]>(`${this.apiUrl}/states`);
  }

  getState(id: string): Observable<WorkflowState> {
    return this.http.get<WorkflowState>(`${this.apiUrl}/states/${id}`);
  }

  createState(payload: WorkflowState): Observable<WorkflowState> {
    return this.http.post<WorkflowState>(`${this.apiUrl}/states`, payload);
  }

  deleteState(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/states/${id}`);
  }

  // ======================================================
  // ACTIONS
  // ======================================================

  getActions(workflowId: string): Observable<WorkflowAction[]> {
    return this.http.get<WorkflowAction[]>(`${this.apiUrl}/${workflowId}/actions`);
  }

  getAction(id: string): Observable<WorkflowAction> {
    return this.http.get<WorkflowAction>(`${this.apiUrl}/actions/${id}`);
  }

  createAction(payload: WorkflowAction): Observable<WorkflowAction> {
    return this.http.post<WorkflowAction>(`${this.apiUrl}/actions`, payload);
  }

  deleteAction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/actions/${id}`);
  }
}
