import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  activeUsers = signal<any[]>([]);
  private socket: Socket | null = null;

  private get isVercel(): boolean {
    try {
      return window.location.hostname.includes('vercel.app') ||
             window.location.hostname.includes('last-of-work');
    } catch {
      return true;
    }
  }

  private get isEnabled(): boolean {
    return !this.isVercel &&
           !!environment.socketUrl &&
           environment.socketUrl !== '';
  }

  connect(): void {
    if (!this.isEnabled) {
      if (!environment.production) {
        console.log('Socket disabled');
      }
      return;
    }
    try {
      this.socket = io(environment.socketUrl, {
        transports: ['polling'],
        timeout: 5000,
        reconnection: false
      });
      this.socket.on('connect_error', () => {
        this.socket?.disconnect();
        this.socket = null;
      });
    } catch (e) {
      this.socket = null;
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.activeUsers.set([]);
  }

  // All methods safe when socket is null
  joinPage(id: string): void {
    this.socket?.emit('join-page', id);
  }
  leavePage(id: string): void {
    this.socket?.emit('leave-page', id);
  }
  emitBlockUpdated(p: string, b: any): void {
    this.socket?.emit('block-updated', { p, b });
  }
  emitBlockAdded(p: string, b: any): void {
    this.socket?.emit('block-added', { p, b });
  }
  emitBlockDeleted(p: string, id: string): void {
    this.socket?.emit('block-deleted', { p, id });
  }
  onBlockChanged(cb: (data: any) => void): void {
    this.socket?.on('block-changed', cb);
  }
  onBlockAdded(cb: (data: any) => void): void {
    this.socket?.on('block-added', cb);
  }
  onBlockDeleted(cb: (data: any) => void): void {
    this.socket?.on('block-deleted', cb);
  }
  emitComment(pageId: string, comment: any): void {
    this.socket?.emit('comment-added', { pageId, comment });
  }
  onNewComment(cb: (data: any) => void): void {
    this.socket?.on('new-comment', cb);
  }
}
