import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { getApiBaseUrl } from '../config/api.config';

export interface CollaboratorUser {
  userId: string;
  name?: string;
  color?: string;
  timestamp?: Date;
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private authService = inject(AuthService);
  
  activeUsers = signal<CollaboratorUser[]>([]);

  connect(): void {
    const token = this.authService.getToken();
    if (!token || this.socket?.connected) return;

    const socketUrl = getApiBaseUrl().replace(/\/api$/, '');
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      if (!environment.production) {
        console.log('Socket connected');
      }
    });

    this.socket.on('disconnect', () => {
      if (!environment.production) {
        console.log('Socket disconnected');
      }
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinPage(pageId: string): void {
    this.socket?.emit('join-page', pageId);
    
    this.socket?.on('user-joined', (data) => {
      this.activeUsers.update(users => [...users, data]);
    });
    
    this.socket?.on('user-left', (data) => {
      this.activeUsers.update(users => users.filter(u => u.userId !== data.userId));
    });
  }

  leavePage(pageId: string): void {
    this.socket?.emit('leave-page', pageId);
    this.socket?.removeAllListeners('user-joined');
    this.socket?.removeAllListeners('user-left');
    this.activeUsers.set([]);
  }

  emitBlockUpdated(pageId: string, block: any): void {
    this.socket?.emit('block-updated', { pageId, block });
  }

  emitBlockAdded(pageId: string, block: any): void {
    this.socket?.emit('block-added', { pageId, block });
  }

  emitBlockDeleted(pageId: string, blockId: string): void {
    this.socket?.emit('block-deleted', { pageId, blockId });
  }

  onBlockChanged(callback: (data: any) => void): void {
    this.socket?.on('block-changed', callback);
  }

  onBlockAdded(callback: (data: any) => void): void {
    this.socket?.on('block-added', callback);
  }

  onBlockDeleted(callback: (data: any) => void): void {
    this.socket?.on('block-deleted', callback);
  }

  emitComment(pageId: string, comment: any): void {
    this.socket?.emit('comment-added', { pageId, comment });
  }

  onNewComment(callback: (data: any) => void): void {
    this.socket?.on('new-comment', callback);
  }
}
