import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { getApiBaseUrl } from '../config/api.config';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${getApiBaseUrl()}/auth`;
  private currentUser = signal<User | null>(null);

  isLoggedIn = computed(() => !!this.currentUser());
  user = this.currentUser.asReadonly();

  constructor() {
    const storedUser = localStorage.getItem('user');
    const token = this.getToken();

    if (token && storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }

  register(nameOrData: string | { name: string; email: string; password: string }, email?: string, password?: string): Observable<AuthResponse> {
    const body = typeof nameOrData === 'object'
      ? nameOrData
      : { name: nameOrData, email, password };

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body).pipe(
      tap((res) => this.handleAuth(res))
    );
  }

  login(emailOrCredentials: string | { email: string; password: string }, password?: string): Observable<AuthResponse> {
    const body = typeof emailOrCredentials === 'object'
      ? emailOrCredentials
      : { email: emailOrCredentials, password };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
      tap((res) => this.handleAuth(res))
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getMe(): Observable<User> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/me`).pipe(
      map((res) => res.user),
      tap((user) => {
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  loadUserFromStorage(): void {
    if (!this.getToken()) return;
    this.getMe().subscribe({
      error: () => this.logout()
    });
  }

  private handleAuth(res: AuthResponse): void {
    localStorage.setItem('auth_token', res.token);
    localStorage.removeItem('token');
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.router.navigate(['/dashboard']);
  }
}
