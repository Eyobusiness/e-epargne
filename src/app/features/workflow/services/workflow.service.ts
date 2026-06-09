// services/workflow.service.ts

import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";

import { Workflow } from "../models/workflow.model";
import { WorkflowState } from "../models/workflow-state.model";
import { WorkflowAction } from "../models/workflow-action.model";

@Injectable({
  providedIn: "root",
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

  getWorkflowById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createWorkflow(payload: Workflow): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  updateWorkflow(id: string, payload: Workflow): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteWorkflow(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ======================================================
  // STATES
  // ======================================================

  getStates(): Observable<WorkflowState[]> {
    return this.http.get<WorkflowState[]>(`${this.apiUrl}/states`);
  }

  getStateById(stateId: string): Observable<WorkflowState> {
    return this.http.get<WorkflowState>(`${this.apiUrl}/states/${stateId}`);
  }

  createState(payload: WorkflowState): Observable<any> {
    return this.http.post(`${this.apiUrl}/states`, payload);
  }

  deleteState(stateId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/states/${stateId}`);
  }

  // ======================================================
  // ACTIONS
  // ======================================================

  getWorkflowActions(workflowId: string): Observable<WorkflowAction[]> {
    return this.http.get<WorkflowAction[]>(
      `${this.apiUrl}/${workflowId}/actions`
    );
  }

  getActionById(actionId: string): Observable<WorkflowAction> {
    return this.http.get<WorkflowAction>(`${this.apiUrl}/actions/${actionId}`);
  }

  createAction(payload: WorkflowAction): Observable<any> {
    return this.http.post(`${this.apiUrl}/actions`, payload);
  }

  deleteAction(actionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/actions/${actionId}`);
  }
}
