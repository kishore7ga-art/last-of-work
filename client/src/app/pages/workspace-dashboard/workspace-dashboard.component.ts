import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { WorkspaceApiService, Workspace, WorkspaceMember, WorkspaceInvite, WorkspaceActivity } from '../../services/workspace-api.service';
import { PageApiService, Page } from '../../services/page-api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-workspace-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex min-h-screen bg-[#0a0a0f] text-white">
      <!-- Workspace Left Sidebar -->
      <aside class="w-64 border-r border-[#232336] bg-[#0f0f17]/95 flex flex-col justify-between">
        <div>
          <!-- Workspace Branding -->
          <div class="p-6 border-b border-[#232336] flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center font-bold text-lg">
              {{ workspaceNameInitials() }}
            </div>
            <div>
              <h2 class="font-bold text-sm truncate max-w-[150px]">{{ workspace()?.name || 'Workspace' }}</h2>
              <span class="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">{{ workspace()?.plan }} Plan</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="p-4 space-y-1">
            <button 
              (click)="activeView.set('pages')" 
              [class.active]="activeView() === 'pages'" 
              class="nav-btn">
              <lucide-icon name="file-text" [size]="18"></lucide-icon>
              <span>Pages</span>
            </button>
            <button 
              (click)="activeView.set('members')" 
              [class.active]="activeView() === 'members'" 
              class="nav-btn">
              <lucide-icon name="users" [size]="18"></lucide-icon>
              <span>Members</span>
            </button>
            <button 
              (click)="activeView.set('activity')" 
              [class.active]="activeView() === 'activity'" 
              class="nav-btn">
              <lucide-icon name="activity" [size]="18"></lucide-icon>
              <span>Activity Feed</span>
            </button>
            <button 
              *ngIf="isOwnerOrAdmin()"
              (click)="activeView.set('settings')" 
              [class.active]="activeView() === 'settings'" 
              class="nav-btn">
              <lucide-icon name="settings" [size]="18"></lucide-icon>
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <!-- Back to Dashboard -->
        <div class="p-4 border-t border-[#232336]">
          <button (click)="goHome()" class="nav-btn text-gray-400 hover:text-white w-full justify-start">
            <lucide-icon name="arrow-left" [size]="18"></lucide-icon>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <section class="flex-1 p-8 overflow-y-auto max-h-screen">
        <header class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold capitalize">{{ activeView() }}</h1>
            <p class="text-sm text-gray-400 mt-1">Manage all collaboration files and workspace members.</p>
          </div>

          <!-- Actions per view -->
          <div [ngSwitch]="activeView()">
            <button 
              *ngSwitchCase="'pages'"
              (click)="openCreateModal()"
              class="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg transition hover:translate-y-[-1px]">
              <lucide-icon name="plus" [size]="18"></lucide-icon>
              <span>New Page</span>
            </button>

            <ng-container *ngSwitchCase="'members'">
              <button 
                *ngIf="isOwnerOrAdmin()"
                (click)="openInviteModal.set(true)"
                class="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg transition hover:translate-y-[-1px]">
                <lucide-icon name="user-plus" [size]="18"></lucide-icon>
                <span>Invite Member</span>
              </button>
            </ng-container>
          </div>
        </header>

        <!-- View Display -->
        <div [ngSwitch]="activeView()">
          <!-- PAGES VIEW -->
          <div *ngSwitchCase="'pages'">
            <div *ngIf="loading()" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div *ngFor="let item of skeletons" class="h-72 animate-pulse rounded-xl border border-[#232336] bg-[#111118]"></div>
            </div>

            <div *ngIf="!loading() && pages().length === 0" class="grid min-h-[45vh] place-items-center rounded-2xl border border-dashed border-[#2a2a3d] bg-[#101018] p-8 text-center">
              <div>
                <lucide-icon name="file-text" [size]="48" class="text-blue-400 mx-auto mb-4"></lucide-icon>
                <h3 class="text-xl font-bold">No pages in this workspace yet</h3>
                <button (click)="openCreateModal()" class="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold">
                  Create Page
                </button>
              </div>
            </div>

            <div *ngIf="!loading() && pages().length > 0" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <article 
                *ngFor="let page of pages()" 
                (click)="editPage(page._id)"
                class="group relative cursor-pointer overflow-hidden rounded-xl border border-[#232336] bg-[#111118] transition hover:-translate-y-1 hover:border-blue-500/60">
                <div class="h-40 bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-4xl font-extrabold">
                  {{ pageInitials(page.title) }}
                </div>
                <div class="p-5">
                  <div class="flex justify-between items-start">
                    <h3 class="font-bold truncate max-w-[150px]">{{ page.title }}</h3>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold" [class.bg-emerald-500-15]="page.published" [class.text-emerald-400]="page.published" [class.bg-gray-800]="!page.published">
                      {{ page.published ? 'Published' : 'Draft' }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-400 mt-2 line-clamp-2">{{ page.description || 'No description yet.' }}</p>
                </div>
              </article>
            </div>
          </div>

          <!-- MEMBERS VIEW -->
          <div *ngSwitchCase="'members'" class="space-y-8">
            <div class="bg-[#111118] border border-[#232336] rounded-xl overflow-hidden">
              <table class="w-full border-collapse text-left text-sm">
                <thead>
                  <tr class="border-b border-[#232336] bg-[#151520] text-gray-400 text-xs font-semibold uppercase">
                    <th class="p-4">Member</th>
                    <th class="p-4">Email</th>
                    <th class="p-4">Role</th>
                    <th class="p-4">Joined</th>
                    <th class="p-4" *ngIf="isOwnerOrAdmin()">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#232336]">
                  <tr *ngFor="let member of members()" class="hover:bg-[#151522]">
                    <td class="p-4 flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
                        {{ member.userId.name ? member.userId.name[0].toUpperCase() : 'M' }}
                      </div>
                      <span class="font-semibold">{{ member.userId.name }}</span>
                    </td>
                    <td class="p-4 text-gray-400">{{ member.userId.email }}</td>
                    <td class="p-4">
                      <span [ngClass]="roleBadgeClass(member.role)" class="px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {{ member.role }}
                      </span>
                    </td>
                    <td class="p-4 text-gray-400 text-xs">{{ member.joinedAt | date }}</td>
                    <td class="p-4" *ngIf="isOwnerOrAdmin()">
                      <!-- Action buttons for admin/owner -->
                      <div class="flex gap-2" *ngIf="member.role !== 'owner'">
                        <select 
                          [ngModel]="member.role" 
                          (ngModelChange)="changeRole(member.userId._id, $event)"
                          class="bg-[#0a0a0f] border border-[#2a2a3d] text-xs rounded px-2 py-1 outline-none">
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button (click)="removeMember(member.userId._id)" class="px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded text-xs">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pending Invites -->
            <div *ngIf="invites().length > 0">
              <h3 class="text-lg font-bold mb-4">Pending Invites</h3>
              <div class="bg-[#111118] border border-[#232336] rounded-xl overflow-hidden">
                <table class="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr class="border-b border-[#232336] bg-[#151520] text-gray-400 text-xs font-semibold uppercase">
                      <th class="p-4">Invited Email</th>
                      <th class="p-4">Role</th>
                      <th class="p-4">Sent At</th>
                      <th class="p-4">Expires At</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#232336]">
                    <tr *ngFor="let invite of invites()" class="hover:bg-[#151522]">
                      <td class="p-4 font-semibold text-gray-300">{{ invite.email }}</td>
                      <td class="p-4">
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-400">
                          {{ invite.role }}
                        </span>
                      </td>
                      <td class="p-4 text-gray-400 text-xs">{{ invite.sentAt | date }}</td>
                      <td class="p-4 text-gray-400 text-xs">{{ invite.expiresAt | date }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ACTIVITY VIEW -->
          <div *ngSwitchCase="'activity'" class="space-y-6 max-w-3xl">
            <div class="relative pl-6 border-l border-[#2a2a3d] space-y-6">
              <div *ngFor="let item of activities()" class="relative">
                <!-- Bullet Dot -->
                <div class="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-[#0a0a0f]"></div>
                
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
                    {{ item.userId.name ? item.userId.name[0].toUpperCase() : 'U' }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold">
                      {{ item.userId.name }} 
                      <span class="text-gray-400 font-normal">
                        {{ formatActivityAction(item.action, item.details) }}
                      </span>
                    </p>
                    <span class="text-xs text-gray-500 mt-1 block">{{ item.createdAt | date:'medium' }}</span>
                  </div>
                </div>
              </div>

              <div *ngIf="activities().length === 0" class="text-center py-12 text-gray-500 text-sm">
                No recent activity.
              </div>
            </div>
          </div>

          <!-- SETTINGS VIEW -->
          <div *ngSwitchCase="'settings'" class="max-w-xl space-y-6">
            <div class="bg-[#111118] border border-[#232336] p-6 rounded-xl space-y-4">
              <h3 class="text-lg font-bold">Workspace Profile</h3>
              
              <label class="block">
                <span class="text-xs font-semibold text-gray-400 uppercase">Workspace Name</span>
                <input 
                  type="text" 
                  [(ngModel)]="workspaceForm.name"
                  class="mt-2 w-full h-11 bg-[#0a0a0f] border border-[#2a2a3d] rounded-lg px-4 text-white outline-none focus:border-blue-500">
              </label>

              <label class="block">
                <span class="text-xs font-semibold text-gray-400 uppercase">Description</span>
                <textarea 
                  [(ngModel)]="workspaceForm.description"
                  rows="3"
                  class="mt-2 w-full bg-[#0a0a0f] border border-[#2a2a3d] rounded-lg p-4 text-white outline-none focus:border-blue-500 resize-none"></textarea>
              </label>

              <button 
                (click)="saveWorkspaceProfile()"
                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold">
                Save Changes
              </button>
            </div>

            <!-- Danger Zone -->
            <div *ngIf="isOwner()" class="border border-red-500/30 bg-red-500/5 p-6 rounded-xl space-y-4">
              <h3 class="text-lg font-bold text-red-400">Danger Zone</h3>
              <p class="text-sm text-gray-400">Permanently delete this workspace and all associated page builders. This cannot be undone.</p>
              <button 
                (click)="deleteWorkspace()"
                class="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold">
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- INVITE MEMBER MODAL -->
      <div *ngIf="openInviteModal()" class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
        <div class="w-full max-w-md rounded-2xl border border-[#2a2a3d] bg-[#111118] p-6 shadow-2xl space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">Invite to Workspace</h2>
            <button (click)="openInviteModal.set(false)" class="p-1 rounded hover:bg-white/10">
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
          </div>

          <label class="block">
            <span class="text-xs font-semibold text-gray-300">Member's Email</span>
            <input 
              type="email" 
              [(ngModel)]="inviteForm.email"
              placeholder="editor@company.com"
              class="mt-2 w-full h-11 bg-[#0a0a0f] border border-[#2a2a3d] rounded-lg px-4 text-white outline-none focus:border-blue-500">
          </label>

          <label class="block">
            <span class="text-xs font-semibold text-gray-300">Permissions Role</span>
            <select 
              [(ngModel)]="inviteForm.role"
              class="mt-2 w-full h-11 bg-[#0a0a0f] border border-[#2a2a3d] rounded-lg px-4 text-white outline-none focus:border-blue-500">
              <option value="admin">Admin (Manage members, pages, settings)</option>
              <option value="editor">Editor (Can edit all pages)</option>
              <option value="viewer">Viewer (Read-only access)</option>
            </select>
          </label>

          <button 
            (click)="sendInvite()"
            class="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm">
            Send Invitation
          </button>
        </div>
      </div>

      <!-- CREATE NEW PAGE MODAL -->
      <div *ngIf="createModalOpen()" class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
        <form (ngSubmit)="createNewPage()" class="w-full max-w-md rounded-2xl border border-[#2a2a3d] bg-[#111118] p-6 shadow-2xl">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-xl font-bold">New Page in Workspace</h2>
            <button type="button" (click)="createModalOpen.set(false)" class="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10">
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
              placeholder="Home Page" />
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

          <button
            type="submit"
            class="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-sm font-semibold">
            <span>Create Page</span>
          </button>
        </form>
      </div>
    </main>
  `,
  styles: [`
    .nav-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      color: #a1a1aa;
      border-radius: 8px;
      transition: 0.2s;
      background: transparent;
      border: none;
      text-align: left;
    }
    .nav-btn:hover {
      color: white;
      background: rgba(255,255,255,0.05);
    }
    .nav-btn.active {
      color: white;
      background: rgba(59, 130, 246, 0.15);
      border-left: 2px solid #3b82f6;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  `]
})
export class WorkspaceDashboardComponent implements OnInit {
  private workspaceApi = inject(WorkspaceApiService);
  private pageApi = inject(PageApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  workspaceId: string | null = null;
  workspace = signal<Workspace | null>(null);
  pages = signal<Page[]>([]);
  members = signal<WorkspaceMember[]>([]);
  invites = signal<WorkspaceInvite[]>([]);
  activities = signal<WorkspaceActivity[]>([]);

  activeView = signal<'pages' | 'members' | 'activity' | 'settings'>('pages');
  loading = signal(true);
  skeletons = Array.from({ length: 6 });

  // Modal forms
  openInviteModal = signal(false);
  createModalOpen = signal(false);
  newPageTitle = '';
  newPageDescription = '';
  inviteForm = { email: '', role: 'editor' };
  workspaceForm = { name: '', description: '' };

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.workspaceId = params.get('id');
      if (this.workspaceId) {
        this.loadWorkspaceData();
      }
    });
  }

  loadWorkspaceData() {
    if (!this.workspaceId) return;
    this.loading.set(true);

    // Get basic workspace details
    this.workspaceApi.getWorkspace(this.workspaceId).subscribe({
      next: (ws) => {
        this.workspace.set(ws);
        this.workspaceForm.name = ws.name;
        this.workspaceForm.description = ws.description || '';
        
        // Members & Invites
        this.members.set(ws.members);
        this.invites.set(ws.invites || []);
        
        // Load Workspace Pages
        // In a real app we filter by workspaceId on the backend, for simplicity we query all and filter on frontend for now
        this.pageApi.getPages().subscribe({
          next: (pages) => {
            this.pages.set(pages.filter(p => p.workspaceId === this.workspaceId));
            this.loading.set(false);
          }
        });

        // Load Activity Log
        this.workspaceApi.getActivity(this.workspaceId!).subscribe({
          next: (acts) => this.activities.set(acts)
        });
      },
      error: () => {
        this.toast.error('Workspace not found or not authorized');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  isOwner() {
    const user = this.auth.user();
    return this.workspace()?.ownerId === user?._id;
  }

  isOwnerOrAdmin() {
    if (this.isOwner()) return true;
    const user = this.auth.user();
    const self = this.members().find(m => m.userId._id === user?._id);
    return self?.role === 'admin';
  }

  workspaceNameInitials() {
    const name = this.workspace()?.name || 'W';
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
  }

  pageInitials(title: string) {
    return (title || 'Untitled').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'U';
  }

  roleBadgeClass(role: string) {
    switch (role) {
      case 'owner': return 'bg-purple-500/15 text-purple-300';
      case 'admin': return 'bg-blue-500/15 text-blue-300';
      case 'editor': return 'bg-emerald-500/15 text-emerald-300';
      default: return 'bg-gray-500/15 text-gray-300';
    }
  }

  formatActivityAction(action: string, details: any) {
    switch (action) {
      case 'page_created': return `created a new page "${details.name || 'Untitled'}"`;
      case 'page_updated': return `edited a page`;
      case 'comment_added': return `added a comment`;
      case 'comment_resolved': return `resolved a comment thread`;
      case 'member_invited': return `invited ${details.email} as ${details.role}`;
      case 'member_joined': return `joined the workspace`;
      case 'member_removed': return `removed a member`;
      case 'role_changed': return `changed a member's role to ${details.newRole}`;
      case 'workspace_created': return `created this workspace`;
      default: return `performed an action`;
    }
  }

  openCreateModal() {
    this.newPageTitle = '';
    this.newPageDescription = '';
    this.createModalOpen.set(true);
  }

  createNewPage() {
    if (!this.newPageTitle.trim() || !this.workspaceId) return;

    this.pageApi.createPage({
      title: this.newPageTitle.trim(),
      description: this.newPageDescription.trim(),
      workspaceId: this.workspaceId!
    }).subscribe({
      next: (page) => {
        this.createModalOpen.set(false);
        this.toast.success('Page created inside workspace');
        this.router.navigate(['/editor', page._id]);
      }
    });
  }

  editPage(id: string) {
    this.router.navigate(['/editor', id]);
  }

  sendInvite() {
    if (!this.inviteForm.email.trim() || !this.workspaceId) return;

    this.workspaceApi.inviteMember(this.workspaceId, this.inviteForm.email.trim(), this.inviteForm.role).subscribe({
      next: () => {
        this.openInviteModal.set(false);
        this.toast.success('Invitation sent successfully!');
        this.loadWorkspaceData();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Could not send invitation.');
      }
    });
  }

  changeRole(userId: string, newRole: string) {
    if (!this.workspaceId) return;
    this.workspaceApi.changeMemberRole(this.workspaceId, userId, newRole).subscribe({
      next: () => {
        this.toast.success('Role updated');
        this.loadWorkspaceData();
      }
    });
  }

  removeMember(userId: string) {
    if (!this.workspaceId || !confirm('Remove this member from the workspace?')) return;
    this.workspaceApi.removeMember(this.workspaceId, userId).subscribe({
      next: () => {
        this.toast.success('Member removed');
        this.loadWorkspaceData();
      }
    });
  }

  saveWorkspaceProfile() {
    if (!this.workspaceId) return;
    this.workspaceApi.updateWorkspace(this.workspaceId, {
      name: this.workspaceForm.name,
      description: this.workspaceForm.description
    } as any).subscribe({
      next: () => {
        this.toast.success('Workspace profile updated');
        this.loadWorkspaceData();
      }
    });
  }

  deleteWorkspace() {
    if (!this.workspaceId || !confirm('Are you absolutely sure you want to delete this workspace permanently?')) return;

    this.workspaceApi.deleteWorkspace(this.workspaceId).subscribe({
      next: () => {
        this.toast.success('Workspace deleted');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
