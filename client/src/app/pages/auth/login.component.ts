import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div class="bg-[#111118] border border-[#2a2a3d] rounded-[14px] shadow-[0_24px_64px_rgba(0,0,0,0.5)] p-10 w-full max-w-[400px]" [class.animate-shake]="error()">
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center font-bold text-2xl text-white mx-auto mb-4">M</div>
          <h1 class="text-2xl font-bold text-white">Welcome back</h1>
          <p class="text-gray-400 mt-2 text-sm">Sign in to continue</p>
        </div>

        <div *ngIf="error()" class="bg-red-500/10 border border-red-500/50 text-red-300 p-3 rounded-lg mb-6 text-sm">
          {{ error() }}
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">


          <label class="block">
            <span class="block text-sm font-medium text-gray-300 mb-1">Password</span>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                required
                class="w-full bg-[#0a0a0f] border border-[#2a2a3d] rounded-lg px-4 py-2.5 pr-16 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Password" />
              <button type="button" (click)="showPassword.update(value => !value)" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-300">
                {{ showPassword() ? 'Hide' : 'Show' }}
              </button>
            </div>
          </label>

          <div class="text-right">
            <a class="text-xs text-blue-300 hover:text-blue-200">Forgot password?</a>
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium rounded-lg transition-colors flex justify-center items-center disabled:opacity-70">
            <span *ngIf="!loading()">Sign In</span>
            <lucide-icon *ngIf="loading()" name="loader-2" class="animate-spin" [size]="20"></lucide-icon>
          </button>
        </form>

        <div class="relative flex py-4 items-center">
          <div class="flex-grow border-t border-[#2a2a3d]"></div>
          <span class="flex-shrink mx-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Or</span>
          <div class="flex-grow border-t border-[#2a2a3d]"></div>
        </div>

        <button
          type="button"
          routerLink="/editor/temp"
          class="w-full h-11 bg-transparent hover:bg-white/5 border border-[#2a2a3d] hover:border-blue-500/50 text-gray-300 hover:text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2">
          <lucide-icon name="arrow-right-circle" class="text-blue-400 animate-pulse" [size]="18"></lucide-icon>
          <span>Bypass straight to Editor</span>
        </button>

        <p class="text-center text-gray-400 text-sm mt-6">
          Don't have an account?
          <a routerLink="/register" class="text-blue-300 hover:text-blue-200">Register</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
    .animate-shake { animation: shake 360ms ease; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);

  password = '';
  showPassword = signal(false);
  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (!this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login('', this.password).subscribe({
      error: (err) => {
        this.error.set(err.error?.message || 'Login failed. Please check your details.');
        this.loading.set(false);
      }
    });
  }
}
