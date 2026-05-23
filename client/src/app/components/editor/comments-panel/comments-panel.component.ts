import { Component, inject, Input, Output, EventEmitter, signal, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CommentApiService, Comment } from '../../../services/comment-api.service';
import { ToastService } from '../../../services/toast.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-comments-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="comments-panel">
      <!-- Header -->
      <div class="panel-header">
        <div class="flex items-center gap-2">
          <lucide-icon name="message-square" class="text-amber-500" [size]="18"></lucide-icon>
          <h2>Page Comments</h2>
        </div>
        <button class="icon-btn" (click)="close.emit()" title="Close">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          [class.active]="filter() === 'unresolved'" 
          (click)="filter.set('unresolved')">
          Active
        </button>
        <button 
          [class.active]="filter() === 'resolved'" 
          (click)="filter.set('resolved')">
          Resolved
        </button>
        <button 
          [class.active]="filter() === 'all'" 
          (click)="filter.set('all')">
          All
        </button>
      </div>

      <!-- Comment List -->
      <div class="panel-body">
        <ng-container *ngIf="filteredComments().length > 0; else noComments">
          <div class="comment-card" *ngFor="let comment of filteredComments()">
            <div class="card-header">
              <div class="user-info">
                <div class="avatar" [style.background]="'#3b82f6'">
                  {{ comment.userId.name ? comment.userId.name[0].toUpperCase() : 'A' }}
                </div>
                <div>
                  <span class="user-name">{{ comment.userId.name }}</span>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
              </div>

              <!-- Resolve Button -->
              <button 
                *ngIf="!comment.resolved" 
                class="resolve-btn"
                (click)="resolveComment(comment._id)"
                title="Resolve Comment">
                <lucide-icon name="check" [size]="14"></lucide-icon>
              </button>
              <span *ngIf="comment.resolved" class="resolved-badge">
                <lucide-icon name="check-check" [size]="14"></lucide-icon> Resolved
              </span>
            </div>

            <div class="card-body">
              <div *ngIf="comment.blockId" class="block-ref">
                <lucide-icon name="box" [size]="12"></lucide-icon>
                <span>On: {{ comment.blockId }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
            </div>

            <!-- Replies nested -->
            <div class="replies-section" *ngIf="comment.replies && comment.replies.length > 0">
              <div class="reply-card" *ngFor="let reply of comment.replies">
                <div class="reply-header">
                  <div class="user-info">
                    <div class="reply-avatar">
                      {{ reply.userId.name ? reply.userId.name[0].toUpperCase() : 'A' }}
                    </div>
                    <div>
                      <span class="reply-user">{{ reply.userId.name }}</span>
                      <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                    </div>
                  </div>
                </div>
                <p class="reply-text">{{ reply.content }}</p>
              </div>
            </div>

            <!-- Inline Reply Form -->
            <div class="reply-form" *ngIf="!comment.resolved">
              <input 
                type="text" 
                placeholder="Reply..."
                [(ngModel)]="replies[comment._id]"
                (keyup.enter)="addReply(comment._id)">
              <button 
                (click)="addReply(comment._id)" 
                [disabled]="!replies[comment._id]?.trim()">
                Reply
              </button>
            </div>
          </div>
        </ng-container>

        <ng-template #noComments>
          <div class="empty-state">
            <lucide-icon name="message-square" [size]="48" class="text-gray-600 mb-2"></lucide-icon>
            <p>No comments found</p>
            <span class="text-xs text-gray-500">Be the first to start a conversation!</span>
          </div>
        </ng-template>
      </div>

      <!-- Add Comment Form (Bottom) -->
      <div class="panel-footer">
        <textarea 
          placeholder="Add a comment..."
          rows="2"
          [(ngModel)]="newCommentText"></textarea>
        <div class="flex justify-between items-center mt-2">
          <!-- Optional block selection -->
          <div class="text-xs text-gray-500">
            Press Enter or click Send to post.
          </div>
          <button 
            class="send-btn" 
            [disabled]="!newCommentText.trim()"
            (click)="addComment()">
            <lucide-icon name="send" [size]="14"></lucide-icon>
            <span>Send</span>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .comments-panel {
      position: fixed;
      right: 0;
      top: 52px;
      height: calc(100vh - 52px);
      width: 360px;
      background: #111118;
      border-left: 1px solid #2a2a3d;
      z-index: 100;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.4);
      animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid #2a2a3d;
      background: #151520;
    }
    .panel-header h2 {
      font-size: 14px;
      font-weight: 700;
      color: white;
      margin: 0;
    }
    .icon-btn {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      color: #a1a1aa;
      background: transparent;
      transition: 0.2s;
    }
    .icon-btn:hover {
      background: rgba(255,255,255,0.08);
      color: white;
    }
    .filter-tabs {
      display: flex;
      background: #151520;
      border-bottom: 1px solid #2a2a3d;
      padding: 0 10px;
    }
    .filter-tabs button {
      flex: 1;
      padding: 10px 0;
      font-size: 12px;
      font-weight: 600;
      color: #a1a1aa;
      border: none;
      border-bottom: 2px solid transparent;
      background: transparent;
      transition: 0.2s;
    }
    .filter-tabs button:hover {
      color: white;
    }
    .filter-tabs button.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }
    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .comment-card {
      background: #151522;
      border: 1px solid #2a2a3d;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      color: white;
    }
    .user-name {
      font-size: 12px;
      font-weight: 600;
      color: white;
      display: block;
    }
    .comment-time {
      font-size: 9px;
      color: #71717a;
    }
    .resolve-btn {
      color: #71717a;
      background: transparent;
      border: 1px solid #2a2a3d;
      border-radius: 4px;
      width: 22px;
      height: 22px;
      display: grid;
      place-items: center;
      transition: 0.2s;
    }
    .resolve-btn:hover {
      color: #10b981;
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.05);
    }
    .resolved-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: #10b981;
      font-weight: 600;
    }
    .card-body {
      padding-left: 2px;
    }
    .block-ref {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #27273a;
      padding: 2px 6px;
      border-radius: 4px;
      color: #f59e0b;
      font-size: 9px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .comment-text {
      font-size: 12px;
      color: #d1d5db;
      line-height: 1.4;
      margin: 0;
    }
    .replies-section {
      border-left: 2px solid #2a2a3d;
      padding-left: 10px;
      margin-left: 4px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 6px;
    }
    .reply-card {
      background: #1c1c2a;
      border-radius: 6px;
      padding: 8px;
    }
    .reply-header {
      margin-bottom: 4px;
    }
    .reply-avatar {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #6366f1;
      color: white;
      font-size: 8px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .reply-user {
      font-size: 10px;
      font-weight: 600;
      color: white;
    }
    .reply-time {
      font-size: 8px;
      color: #71717a;
      margin-left: 4px;
    }
    .reply-text {
      font-size: 11px;
      color: #cbd5e1;
      margin: 0;
      line-height: 1.4;
    }
    .reply-form {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }
    .reply-form input {
      flex: 1;
      background: #0d0d12;
      border: 1px solid #2a2a3d;
      border-radius: 4px;
      padding: 6px 10px;
      color: white;
      font-size: 11px;
      outline: none;
    }
    .reply-form input:focus {
      border-color: #3b82f6;
    }
    .reply-form button {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0 10px;
      font-size: 11px;
      font-weight: 600;
    }
    .reply-form button:disabled {
      opacity: 0.5;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-align: center;
      padding: 24px;
    }
    .empty-state p {
      font-size: 14px;
      font-weight: 600;
      color: #e4e4e7;
      margin: 8px 0 2px 0;
    }
    .panel-footer {
      padding: 12px 16px;
      border-top: 1px solid #2a2a3d;
      background: #151520;
    }
    .panel-footer textarea {
      width: 100%;
      background: #0d0d12;
      border: 1px solid #2a2a3d;
      border-radius: 6px;
      padding: 8px 12px;
      color: white;
      font-size: 12px;
      resize: none;
      outline: none;
      transition: 0.2s;
    }
    .panel-footer textarea:focus {
      border-color: #3b82f6;
    }
    .send-btn {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: 0.2s;
    }
    .send-btn:hover:not(:disabled) {
      background: #2563eb;
    }
    .send-btn:disabled {
      opacity: 0.5;
    }
  `]
})
export class CommentsPanelComponent implements OnInit {
  private commentApi = inject(CommentApiService);
  private toast = inject(ToastService);
  private socketService = inject(SocketService);

  @Input() pageId: string | null = null;
  @Output() close = new EventEmitter<void>();

  comments = signal<Comment[]>([]);
  filter = signal<'all' | 'unresolved' | 'resolved'>('unresolved');
  newCommentText: string = '';
  replies: { [commentId: string]: string } = {};

  filteredComments = computed(() => {
    const list = this.comments();
    const currentFilter = this.filter();
    
    if (currentFilter === 'unresolved') {
      return list.filter(c => !c.resolved);
    } else if (currentFilter === 'resolved') {
      return list.filter(c => c.resolved);
    }
    return list;
  });

  ngOnInit() {
    this.loadComments();
    
    // Listen for socket events
    this.socketService.onNewComment((data) => {
      this.comments.update(list => [data.comment, ...list]);
    });
  }

  loadComments() {
    if (!this.pageId) return;
    this.commentApi.getComments(this.pageId).subscribe({
      next: (res) => {
        this.comments.set(res);
      }
    });
  }

  addComment() {
    if (!this.pageId || !this.newCommentText.trim()) return;
    
    this.commentApi.addComment(this.pageId, this.newCommentText).subscribe({
      next: (comment) => {
        this.comments.update(list => [comment, ...list]);
        this.socketService.emitComment(this.pageId!, comment);
        this.newCommentText = '';
        this.toast.success('Comment added');
      }
    });
  }

  addReply(commentId: string) {
    const content = this.replies[commentId];
    if (!content || !content.trim()) return;

    this.commentApi.addReply(commentId, content).subscribe({
      next: (updatedComment) => {
        this.comments.update(list => 
          list.map(c => c._id === commentId ? updatedComment : c)
        );
        this.replies[commentId] = '';
        this.toast.success('Reply added');
      }
    });
  }

  resolveComment(commentId: string) {
    this.commentApi.resolveComment(commentId).subscribe({
      next: (updatedComment) => {
        this.comments.update(list => 
          list.map(c => c._id === commentId ? updatedComment : c)
        );
        this.toast.success('Comment resolved');
      }
    });
  }

  formatTime(val: string) {
    if (!val) return '';
    const date = new Date(val);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
