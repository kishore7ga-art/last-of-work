import {
  Injectable, inject
} from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { environment } from
  '../../environments/environment'

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

@Injectable({ providedIn: 'root' })
export class CommentApiService {
  private http = inject(HttpClient)
  private api = environment.apiUrl

  getComments(pageId: string):
    Observable<any[]> {
    if (!pageId) return of([])
    return this.http.get<any>(
      `${this.api}/pages/${pageId}/comments`
    ).pipe(
      map(r => r?.comments || []),
      catchError(() => of([]))
    )
  }

  addComment(pageId: string, data: any):
    Observable<any> {
    return this.http.post<any>(
      `${this.api}/pages/${pageId}/comments`,
      data
    ).pipe(
      map(r => r?.comment),
      catchError(() => of(null))
    )
  }

  resolveComment(id: string): Observable<any> {
    return this.http.post<any>(
      `${this.api}/comments/${id}/resolve`, {}
    ).pipe(catchError(() => of(null)))
  }

  deleteComment(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.api}/comments/${id}`
    ).pipe(catchError(() => of(null)))
  }

  addReply(id: string, data: any):
    Observable<any> {
    return this.http.post<any>(
      `${this.api}/comments/${id}/replies`, data
    ).pipe(catchError(() => of(null)))
  }
}
