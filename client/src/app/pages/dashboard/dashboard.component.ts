import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PageApiService, Page } from '../../services/page-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-screen bg-[#0a0a0f] text-white">
      <header class="border-b border-[#232336] bg-[#0f0f17]/95">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">MyBuilder</p>
            <h1 class="mt-1 text-3xl font-bold">My Pages</h1>
          </div>

          <div class="flex items-center gap-3">
            <button
              (click)="openCreateModal()"
              class="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:translate-y-[-1px]">
              <lucide-icon name="plus" [size]="18"></lucide-icon>
              <span>New Page</span>
            </button>

            <div class="relative">
              <button
                (click)="userMenuOpen.update(open => !open)"
                class="flex h-11 items-center gap-3 rounded-lg border border-[#2a2a3d] bg-[#151520] px-3">
                <span class="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold">
                  {{ userInitials() }}
                </span>
                <span class="hidden text-sm font-medium sm:block">{{ auth.user()?.name || 'User' }}</span>
              </button>

              <div *ngIf="userMenuOpen()" class="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-[#2a2a3d] bg-[#151520] p-1 shadow-2xl">
                <button class="w-full rounded-md px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#202033]">Profile</button>
                <button (click)="logout()" class="w-full rounded-md px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section class="mx-auto max-w-7xl px-5 py-8">
        <div *ngIf="loading()" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div *ngFor="let item of skeletons" class="h-72 animate-pulse rounded-xl border border-[#232336] bg-[#111118]"></div>
        </div>

        <div *ngIf="!loading() && error()" class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {{ error() }}
        </div>

        <div *ngIf="!loading() && !error() && pages().length === 0" class="grid min-h-[56vh] place-items-center rounded-2xl border border-dashed border-[#2a2a3d] bg-[#101018] p-8 text-center">
          <div>
            <div class="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-blue-500/10 text-blue-300">
              <lucide-icon name="file-text" [size]="34"></lucide-icon>
            </div>
            <h2 class="text-2xl font-bold">No pages yet</h2>
            <p class="mt-2 text-sm text-gray-400">Create your first page to get started.</p>
            <button
              (click)="openCreateModal()"
              class="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 text-sm font-semibold">
              <lucide-icon name="plus" [size]="18"></lucide-icon>
              <span>Create Page</span>
            </button>
          </div>
        </div>

        <div *ngIf="!loading() && !error() && pages().length > 0" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article
            *ngFor="let page of pages(); trackBy: trackByPageId"
            (click)="editPage(page._id)"
            class="group relative cursor-pointer overflow-hidden rounded-xl border border-[#232336] bg-[#111118] shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-blue-500/60">
            <div class="relative h-40 overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600">
              <img *ngIf="page.thumbnail" [src]="page.thumbnail" [alt]="page.title" class="h-full w-full object-cover" />
              <div *ngIf="!page.thumbnail" class="grid h-full place-items-center text-5xl font-black text-white/75">
                {{ pageInitials(page.title) }}
              </div>
              <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition group-hover:opacity-100">
                <button (click)="editPage(page._id, $event)" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">Edit</button>
                <button (click)="duplicatePage(page, $event)" class="grid h-9 w-9 place-items-center rounded-lg bg-white/15 hover:bg-white/25" title="Duplicate">
                  <lucide-icon name="copy" [size]="16"></lucide-icon>
                </button>
                <button (click)="deletePage(page._id, $event)" class="grid h-9 w-9 place-items-center rounded-lg bg-red-500/80 hover:bg-red-500" title="Delete">
                  <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                </button>
              </div>
            </div>

            <div class="p-5">
              <div class="flex items-start justify-between gap-3">
                <h3 class="min-w-0 truncate text-lg font-bold">{{ page.title }}</h3>
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold" [ngClass]="page.published ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gray-500/15 text-gray-300'">
                  {{ page.published ? 'Published' : 'Draft' }}
                </span>
              </div>
              <p class="mt-2 line-clamp-2 min-h-10 text-sm text-gray-400">{{ page.description || 'No description yet.' }}</p>
              <p class="mt-4 text-xs text-gray-500">Last edited {{ page.updatedAt | date:'medium' }}</p>
            </div>
          </article>
        </div>
      </section>

      <div *ngIf="createModalOpen()" class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
        <form (ngSubmit)="createNewPage()" class="w-full max-w-md rounded-2xl border border-[#2a2a3d] bg-[#111118] p-6 shadow-2xl">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-xl font-bold">New Page</h2>
            <button type="button" (click)="closeCreateModal()" class="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>

          <label class="block text-sm font-medium text-gray-300">
            Page Title
            <input
              [(ngModel)]="newPageTitle"
              name="title"
              required
              class="mt-2 h-11 w-full rounded-lg border border-[#2a2a3d] bg-[#0a0a0f] px-3 text-white outline-none focus:border-blue-500"
              placeholder="Landing Page" />
          </label>

          <label class="mt-4 block text-sm font-medium text-gray-300">
            Description
            <textarea
              [(ngModel)]="newPageDescription"
              name="description"
              rows="3"
              class="mt-2 w-full resize-none rounded-lg border border-[#2a2a3d] bg-[#0a0a0f] px-3 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Optional page summary"></textarea>
          </label>

          <div *ngIf="modalError()" class="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {{ modalError() }}
          </div>

          <button
            type="submit"
            [disabled]="creating()"
            class="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-sm font-semibold disabled:opacity-60">
            <lucide-icon *ngIf="creating()" name="loader-2" class="animate-spin" [size]="18"></lucide-icon>
            <span>{{ creating() ? 'Creating...' : 'Create Page' }}</span>
          </button>
        </form>
      </div>
    </main>
  `
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private pageApi = inject(PageApiService);
  auth = inject(AuthService);

  pages = signal<Page[]>([]);
  loading = signal(true);
  creating = signal(false);
  error = signal('');
  modalError = signal('');
  createModalOpen = signal(false);
  userMenuOpen = signal(false);
  newPageTitle = '';
  newPageDescription = '';
  skeletons = Array.from({ length: 6 });

  ngOnInit() {
    this.loadPages();
  }

  loadPages() {
    this.loading.set(true);
    this.error.set('');

    this.pageApi.getPages().subscribe({
      next: (pages) => {
        this.pages.set(pages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Could not load pages.');
        this.loading.set(false);
      }
    });
  }

  openCreateModal() {
    this.newPageTitle = '';
    this.newPageDescription = '';
    this.modalError.set('');
    this.createModalOpen.set(true);
  }

  closeCreateModal() {
    if (this.creating()) return;
    this.createModalOpen.set(false);
  }

  createNewPage() {
    const title = this.newPageTitle.trim();

    if (!title) {
      this.modalError.set('Page title is required.');
      return;
    }

    this.creating.set(true);
    this.modalError.set('');

    this.pageApi.createPage({ title, description: this.newPageDescription.trim() }).subscribe({
      next: (page) => {
        this.creating.set(false);
        this.createModalOpen.set(false);
        this.router.navigate(['/editor', page._id]);
      },
      error: (err) => {
        this.modalError.set(err.error?.message || 'Could not create page.');
        this.creating.set(false);
      }
    });
  }

  editPage(id: string, event?: Event) {
    event?.stopPropagation();
    this.router.navigate(['/editor', id]);
  }

  deletePage(id: string, event: Event) {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this page?')) return;

    this.pageApi.deletePage(id).subscribe({
      next: () => this.pages.update(pages => pages.filter(page => page._id !== id)),
      error: (err) => this.error.set(err.error?.message || 'Could not delete page.')
    });
  }

  duplicatePage(page: Page, event: Event) {
    event.stopPropagation();
    this.pageApi.duplicatePage(page._id).subscribe({
      next: (newPage) => this.pages.update(pages => [newPage, ...pages]),
      error: (err) => this.error.set(err.error?.message || 'Could not duplicate page.')
    });
  }

  logout() {
    this.auth.logout();
  }

  userInitials() {
    const name = this.auth.user()?.name || 'User';
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'U';
  }

  pageInitials(title: string) {
    return (title || 'Untitled').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'U';
  }

  trackByPageId(index: number, page: Page) {
    return page._id;
  }
}
