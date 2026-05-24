import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { getApiBaseUrl } from '../config/api.config';

export interface CommentReply {
  _id?: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  pageId: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  blockId?: string;
  content: string;
  resolved: boolean;
  resolvedBy?: {
    _id: string;
    name: string;
  };
  resolvedAt?: string;
  replies: CommentReply[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentApiService {
  private http = inject(HttpClient);
  private pageApiUrl = `${getApiBaseUrl()}/pages`;
  private commentApiUrl = `${getApiBaseUrl()}/comments`;

  getComments(pageId: string): Observable<Comment[]> {
    if (!pageId) return of([]);
    return this.http.get<{ success: boolean; comments: Comment[] }>(`${this.pageApiUrl}/${pageId}/comments`).pipe(
      map(res => res?.comments || []),
      catchError(() => of([]))
    );
  }

  addComment(pageId: string, content: string, blockId?: string): Observable<Comment | null> {
    return this.http.post<{ success: boolean; comment: Comment }>(`${this.pageApiUrl}/${pageId}/comments`, { content, blockId }).pipe(
      map(res => res?.comment || null),
      catchError(err => {
        console.warn('Add comment failed:', err);
        return of(null);
      })
    );
  }

  updateComment(commentId: string, content: string): Observable<Comment | null> {
    return this.http.put<{ success: boolean; comment: Comment }>(`${this.commentApiUrl}/${commentId}`, { content }).pipe(
      map(res => res?.comment || null),
      catchError(() => of(null))
    );
  }

  deleteComment(commentId: string): Observable<any> {
    return this.http.delete<{ success: boolean }>(`${this.commentApiUrl}/${commentId}`).pipe(
      catchError(() => of(null))
    );
  }

  resolveComment(commentId: string): Observable<Comment | null> {
    return this.http.post<{ success: boolean; comment: Comment }>(`${this.commentApiUrl}/${commentId}/resolve`, {}).pipe(
      map(res => res?.comment || null),
      catchError(() => of(null))
    );
  }

  addReply(commentId: string, content: string): Observable<Comment | null> {
    return this.http.post<{ success: boolean; comment: Comment }>(`${this.commentApiUrl}/${commentId}/replies`, { content }).pipe(
      map(res => res?.comment || null),
      catchError(() => of(null))
    );
  }
}
