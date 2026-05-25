import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PageSeo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface PageSettings {
  favicon?: string;
  customCss?: string;
  customJs?: string;
  themeId?: string;
  customTheme?: any;
}

export interface Page {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  blocks: any[];
  thumbnail?: string;
  published: boolean;
  publishedAt?: string;
  seo?: PageSeo;
  settings?: PageSettings;
  viewCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  customDomain?: string;
  globalStyles?: any;
  workspaceId?: string;
  updatedAt: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PageApiService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  
  private cache = new Map<string, any>();

  getPages(): Observable<Page[]> {
    return this.http
      .get<any>(`${this.api}/pages`)
      .pipe(
        map(r => r.pages || []),
        retry(2),
        catchError(err => {
          console.error('getPages:', err)
          return of([])
        })
      );
  }

  getPage(id: string): Observable<Page> {
    return this.http
      .get<any>(`${this.api}/pages/${id}`)
      .pipe(
        map(r => r.page),
        catchError((err) => {
          console.error('Error fetching page:', err);
          throw err;
        })
      );
  }

  createPage(data: Partial<Page>): Observable<Page> {
    this.cache.clear();
    return this.http
      .post<any>(`${this.api}/pages`, data)
      .pipe(map(r => r.page));
  }

  updatePage(id: string, data: any): Observable<Page> {
    this.cache.clear();
    const cleaned = this.cleanPayload(data);
    return this.http
      .put<any>(`${this.api}/pages/${id}`, cleaned)
      .pipe(
        map(r => r.page),
        timeout(10000),
        catchError(err => {
          console.error('Update page failed:', err);
          throw err;
        })
      );
  }

  private cleanPayload(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(i => this.cleanPayload(i));
    }
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== null && v !== undefined)
          .map(([k, v]) => [k, this.cleanPayload(v)])
      );
    }
    return obj;
  }

  deletePage(id: string): Observable<void> {
    this.cache.clear();
    return this.http
      .delete<void>(`${this.api}/pages/${id}`);
  }

  publishPage(id: string): Observable<any> {
    this.cache.clear();
    return this.http.post<any>(
      `${this.api}/pages/${id}/publish`, {}
    );
  }

  togglePublish(id: string): Observable<any> {
    this.cache.clear();
    return this.http.post<any>(
      `${this.api}/pages/${id}/publish`, {}
    );
  }

  duplicatePage(id: string): Observable<Page> {
    this.cache.clear();
    return this.http
      .post<any>(`${this.api}/pages/${id}/duplicate`, {})
      .pipe(map(r => r.page));
  }

  getVersions(id: string): Observable<any[]> {
    return this.http
      .get<any>(`${this.api}/pages/${id}/versions`)
      .pipe(
        map(r => r.versions || []),
        catchError(() => of([]))
      );
  }

  restoreVersion(id: string, versionId: string): Observable<Page> {
    this.cache.clear();
    return this.http
      .post<any>(`${this.api}/pages/${id}/versions/${versionId}/restore`, {})
      .pipe(map(r => r.page));
  }

  generateContent(prompt: string, context?: string): Observable<{ content: string }> {
    return this.http
      .post<any>(`${this.api}/pages/ai/generate`, { prompt, context })
      .pipe(map(r => ({ content: r.content })));
  }

  getPublishedPage(slug: string): Observable<Page> {
    return this.http
      .get<any>(`${this.api}/public/${slug}`)
      .pipe(
        map(r => r.page),
        catchError((err) => {
          console.error('Error fetching published page:', err);
          throw err;
        })
      );
  }
}
