import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.models';

import { Workflow } from '../models/workflow.model';
import { WorkflowState } from '../models/workflow-state.model';
import { WorkflowAction } from '../models/workflow-action.model';

type CollectionResponse<T> = ApiResponse<{ items?: T[]; item?: T }> | T[] | T;

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/workflows`;

  getWorkflows(): Observable<Workflow[]> {
    return this.http
      .get<CollectionResponse<Workflow>>(this.apiUrl)
      .pipe(map((response) => this.unwrapList(response)));
  }

  getWorkflow(id: string): Observable<Workflow> {
    return this.http
      .get<CollectionResponse<Workflow>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  createWorkflow(payload: Workflow): Observable<Workflow> {
    return this.http
      .post<CollectionResponse<Workflow>>(this.apiUrl, payload)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  updateWorkflow(id: string, payload: Partial<Workflow>): Observable<Workflow> {
    return this.http
      .put<CollectionResponse<Workflow>>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  deleteWorkflow(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStates(): Observable<WorkflowState[]> {
    return this.http
      .get<CollectionResponse<WorkflowState>>(`${this.apiUrl}/states`)
      .pipe(map((response) => this.unwrapList(response)));
  }

  getState(id: string): Observable<WorkflowState> {
    return this.http
      .get<CollectionResponse<WorkflowState>>(`${this.apiUrl}/states/${id}`)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  createState(payload: WorkflowState): Observable<WorkflowState> {
    return this.http
      .post<CollectionResponse<WorkflowState>>(`${this.apiUrl}/states`, payload)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  updateState(id: string, payload: Partial<WorkflowState>): Observable<WorkflowState> {
    return this.deleteState(id).pipe(
      switchMap(() => this.createState(payload as WorkflowState))
    );
  }

  deleteState(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/states/${id}`);
  }

  getActions(workflowId: string): Observable<WorkflowAction[]> {
    return this.http
      .get<CollectionResponse<WorkflowAction>>(`${this.apiUrl}/${workflowId}/actions`)
      .pipe(map((response) => this.unwrapList(response)));
  }

  getAction(id: string): Observable<WorkflowAction> {
    return this.http
      .get<CollectionResponse<WorkflowAction>>(`${this.apiUrl}/actions/${id}`)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  createAction(payload: WorkflowAction): Observable<WorkflowAction> {
    return this.http
      .post<CollectionResponse<WorkflowAction>>(`${this.apiUrl}/actions`, payload)
      .pipe(map((response) => this.unwrapItem(response)));
  }

  updateAction(id: string, payload: Partial<WorkflowAction>): Observable<WorkflowAction> {
    return this.deleteAction(id).pipe(
      switchMap(() => this.createAction(payload as WorkflowAction))
    );
  }

  deleteAction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/actions/${id}`);
  }

  private unwrapList<T>(response: CollectionResponse<T>): T[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object') {
      const data = 'data' in response ? response.data : response;

      if (Array.isArray((data as { items?: T[] }).items)) {
        return (data as { items: T[] }).items;
      }
    }

    return [];
  }

  private unwrapItem<T>(response: CollectionResponse<T>): T {
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      const data = 'data' in response ? response.data : response;

      return ((data as { item?: T }).item ?? data) as T;
    }

    return response as T;
  }
}
