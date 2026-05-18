import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div class="bg-[#111118] border border-[#2a2a3d] rounded-[14px] shadow-[0_24px_64px_rgba(0,0,0,0.5)] p-10 w-full max-w-[400px]" [class.animate-shake]="error()">
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center font-bold text-2xl text-white mx-auto mb-4">M</div>
          <h1 class="text-2xl font-bold text-white">Create an account</h1>
          <p class="text-gray-400 mt-2 text-sm">Start building with MyBuilder</p>
        </div>

        <div *ngIf="error()" class="bg-red-500/10 border border-red-500/50 text-red-300 p-3 rounded-lg mb-6 text-sm">
          {{ error() }}
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <label class="block">
            <span class="block text-sm font-medium text-gray-300 mb-1">Name</span>
            <input type="text" [(ngModel)]="name" name="name" required class="auth-input" placeholder="John Doe" />
          </label>

          <label class="block">
            <span class="block text-sm font-medium text-gray-300 mb-1">Email</span>
            <input type="email" [(ngModel)]="email" name="email" required class="auth-input" placeholder="you@example.com" />
          </label>

          <label class="block">
            <span class="block text-sm font-medium text-gray-300 mb-1">Password</span>
            <input type="password" [(ngModel)]="password" name="password" required class="auth-input" placeholder="Password" />
          </label>

          <label class="block">
            <span class="block text-sm font-medium text-gray-300 mb-1">Confirm Password</span>
            <input
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              class="auth-input"
              [class.border-red-500]="confirmPassword && password !== confirmPassword"
              placeholder="Confirm password" />
            <p *ngIf="confirmPassword && password !== confirmPassword" class="mt-1 text-xs text-red-300">Passwords do not match.</p>
          </label>

          <button
            type="submit"
            [disabled]="loading() || password !== confirmPassword"
            class="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium rounded-lg transition-colors flex justify-center items-center disabled:opacity-70">
            <span *ngIf="!loading()">Register</span>
            <lucide-icon *ngIf="loading()" name="loader-2" class="animate-spin" [size]="20"></lucide-icon>
          </button>
        </form>

        <p class="text-center text-gray-400 text-sm mt-6">
          Already have an account?
          <a routerLink="/login" class="text-blue-300 hover:text-blue-200">Login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-input { width: 100%; background: #0a0a0f; border: 1px solid #2a2a3d; border-radius: 8px; padding: 10px 16px; color: white; outline: none; transition: border-color 150ms ease; }
    .auth-input:focus { border-color: #3b82f6; }
    @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
    .animate-shake { animation: shake 360ms ease; }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (!this.email || !this.password || !this.name) return;
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.register(this.name, this.email, this.password).subscribe({
      error: (err) => {
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
