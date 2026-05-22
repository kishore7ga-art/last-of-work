import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { getApiBaseUrl } from '../config/api.config';

export interface WorkspaceMember {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}

export interface WorkspaceInvite {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  sentAt: string;
  expiresAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  ownerId: string;
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  settings: {
    allowPublicPages: boolean;
    requireApprovalToPublish: boolean;
  };
  plan: 'free' | 'pro' | 'team';
  createdAt: string;
}

export interface WorkspaceActivity {
  _id: string;
  workspaceId: string;
  pageId?: {
    _id: string;
    title: string;
  };
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  details: any;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceApiService {
  private http = inject(HttpClient);
  private apiUrl = `${getApiBaseUrl()}/workspaces`;

  getWorkspaces(): Observable<Workspace[]> {
    return this.http.get<{ success: boolean; workspaces: Workspace[] }>(this.apiUrl).pipe(
      map(res => res.workspaces)
    );
  }

  getWorkspace(id: string): Observable<Workspace> {
    return this.http.get<{ success: boolean; workspace: Workspace }>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.workspace)
    );
  }

  createWorkspace(data: { name: string; description?: string }): Observable<Workspace> {
    return this.http.post<{ success: boolean; workspace: Workspace }>(this.apiUrl, data).pipe(
      map(res => res.workspace)
    );
  }

  updateWorkspace(id: string, data: Partial<Workspace>): Observable<Workspace> {
    return this.http.put<{ success: boolean; workspace: Workspace }>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => res.workspace)
    );
  }

  deleteWorkspace(id: string): Observable<void> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined)
    );
  }

  inviteMember(workspaceId: string, email: string, role: string): Observable<void> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/${workspaceId}/invite`, { email, role }).pipe(
      map(() => undefined)
    );
  }

  removeMember(workspaceId: string, userId: string): Observable<void> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${workspaceId}/members/${userId}`).pipe(
      map(() => undefined)
    );
  }

  changeMemberRole(workspaceId: string, userId: string, role: string): Observable<void> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/${workspaceId}/members/${userId}/role`, { role }).pipe(
      map(() => undefined)
    );
  }

  getMembers(workspaceId: string): Observable<{ members: WorkspaceMember[]; invites: WorkspaceInvite[] }> {
    return this.http.get<{ success: boolean; members: WorkspaceMember[]; invites: WorkspaceInvite[] }>(`${this.apiUrl}/${workspaceId}/members`).pipe(
      map(res => ({ members: res.members, invites: res.invites }))
    );
  }

  getActivity(workspaceId: string): Observable<WorkspaceActivity[]> {
    return this.http.get<{ success: boolean; activities: WorkspaceActivity[] }>(`${this.apiUrl}/${workspaceId}/activity`).pipe(
      map(res => res.activities)
    );
  }

  acceptInvite(token: string): Observable<Workspace> {
    return this.http.get<{ success: boolean; workspace: Workspace }>(`${this.apiUrl}/join?token=${token}`).pipe(
      map(res => res.workspace)
    );
  }
}
