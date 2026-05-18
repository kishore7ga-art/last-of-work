import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CanvasBlock, GlobalStyles, PageVersion } from '../store/builder.models';
import { getApiBaseUrl } from '../config/api.config';

export interface PageSeo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface PageSettings {
  favicon?: string;
  customCss?: string;
  customJs?: string;
}

export interface Page {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  blocks: CanvasBlock[];
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
  globalStyles?: GlobalStyles;
  updatedAt: string;
  createdAt?: string;
}

type OnePageResponse = { success: boolean; page: Page };
type PagesResponse = { success: boolean; count: number; pages: Page[] };
type VersionsResponse = { success: boolean; versions: PageVersion[] };
type ContentResponse = { success?: boolean; content: string };

@Injectable({
  providedIn: 'root'
})
export class PageApiService {
  private http = inject(HttpClient);
  private apiUrl = `${getApiBaseUrl()}/pages`;

  getPages(): Observable<Page[]> {
    return this.http.get<PagesResponse>(this.apiUrl).pipe(map(res => res.pages));
  }

  getPage(id: string): Observable<Page> {
    return this.http.get<OnePageResponse>(`${this.apiUrl}/${id}`).pipe(map(res => res.page));
  }

  createPage(dataOrTitle: Partial<Page> | string, slug?: string): Observable<Page> {
    const body = typeof dataOrTitle === 'string'
      ? { title: dataOrTitle, slug }
      : dataOrTitle;

    return this.http.post<OnePageResponse>(this.apiUrl, body).pipe(map(res => res.page));
  }

  updatePage(id: string, data: Partial<Page>): Observable<Page> {
    return this.http.put<OnePageResponse>(`${this.apiUrl}/${id}`, data).pipe(map(res => res.page));
  }

  deletePage(id: string): Observable<void> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
  }

  publishPage(id: string): Observable<Page> {
    return this.http.post<OnePageResponse & { published: boolean }>(`${this.apiUrl}/${id}/publish`, {}).pipe(map(res => res.page));
  }

  duplicatePage(id: string): Observable<Page> {
    return this.http.post<OnePageResponse>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(map(res => res.page));
  }

  savePage(id: string, blocks: CanvasBlock[]): Observable<Page> {
    return this.updatePage(id, { blocks });
  }

  togglePublish(id: string): Observable<{ published: boolean; page: Page }> {
    return this.http.post<OnePageResponse & { published: boolean }>(`${this.apiUrl}/${id}/publish`, {}).pipe(
      map(res => ({ published: res.published, page: res.page }))
    );
  }

  getVersions(id: string): Observable<PageVersion[]> {
    return this.http.get<VersionsResponse>(`${this.apiUrl}/${id}/versions`).pipe(map(res => res.versions));
  }

  restoreVersion(id: string, versionId: string): Observable<Page> {
    return this.http.post<OnePageResponse>(`${this.apiUrl}/${id}/versions/${versionId}/restore`, {}).pipe(map(res => res.page));
  }

  generateContent(prompt: string, context?: string): Observable<{ content: string }> {
    return this.http.post<ContentResponse>(`${this.apiUrl}/ai/generate`, { prompt, context }).pipe(
      map(res => ({ content: res.content }))
    );
  }

  getPublicPage(slug: string): Observable<Page> {
    return this.http.get<OnePageResponse>(`${this.apiUrl}/public/${slug}`).pipe(map(res => res.page));
  }
}
