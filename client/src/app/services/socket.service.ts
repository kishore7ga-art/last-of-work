import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
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
  
  activeUsers = signal<CollaboratorUser[]>([]);

  connect(): void {
    // NEVER connect on Vercel
    // Vercel does not support WebSockets
    if (this.isVercel()) {
      console.log('⚠️ Socket disabled on Vercel');
      return;
    }

    const token = localStorage.getItem('auth_token') || 'mock-token-123';
    if (this.socket?.connected) return;

    try {
      this.socket = io(environment.socketUrl, {
        auth: { token },
        transports: ['polling'], // NOT websocket
        timeout: 5000,
        reconnection: false, // Don't spam retries
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected');
      });

      this.socket.on('connect_error', (err) => {
        console.warn('⚠️ Socket error:', err.message);
        // Silently fail — app works without it
        this.socket?.disconnect();
        this.socket = null;
      });

    } catch (e) {
      console.warn('Socket init failed:', e);
      this.socket = null;
    }
  }

  private isVercel(): boolean {
    return window.location.hostname.includes('vercel.app') ||
           window.location.hostname.includes('last-of-work');
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  // ALL socket methods — safe when socket is null
  joinPage(pageId: string): void {
    if (!this.socket) return;
    this.socket.emit('join-page', pageId);
    
    this.socket.on('user-joined', (data) => {
      this.activeUsers.update(users => [...users, data]);
    });
    
    this.socket.on('user-left', (data) => {
      this.activeUsers.update(users => users.filter(u => u.userId !== data.userId));
    });
  }

  leavePage(pageId: string): void {
    if (!this.socket) return;
    this.socket.emit('leave-page', pageId);
    this.socket.removeAllListeners('user-joined');
    this.socket.removeAllListeners('user-left');
    this.activeUsers.set([]);
  }

  emitBlockUpdated(pageId: string, block: any): void {
    if (!this.socket) return;
    this.socket.emit('block-updated', { pageId, block });
  }

  emitBlockAdded(pageId: string, block: any): void {
    if (!this.socket) return;
    this.socket.emit('block-added', { pageId, block });
  }

  emitBlockDeleted(pageId: string, blockId: string): void {
    if (!this.socket) return;
    this.socket.emit('block-deleted', { pageId, blockId });
  }

  onBlockChanged(cb: (d: any) => void): void {
    if (!this.socket) return;
    this.socket.on('block-changed', cb);
  }

  onBlockAdded(cb: (d: any) => void): void {
    if (!this.socket) return;
    this.socket.on('block-added', cb);
  }

  onBlockDeleted(cb: (d: any) => void): void {
    if (!this.socket) return;
    this.socket.on('block-deleted', cb);
  }

  emitComment(pageId: string, comment: any): void {
    if (!this.socket) return;
    this.socket.emit('comment-added', { pageId, comment });
  }

  onNewComment(cb: (d: any) => void): void {
    if (!this.socket) return;
    this.socket.on('new-comment', cb);
  }
}
