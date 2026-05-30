import { Injectable, signal } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class SocketService {
  activeUsers = signal<any[]>([])
  connect(): void {}
  disconnect(): void {}
  joinPage(id: string): void {}
  leavePage(id: string): void {}
  emitBlockUpdated(p: string, b: any): void {}
  emitBlockAdded(p: string, b: any): void {}
  emitBlockDeleted(p: string, id: string): void {}
  onBlockChanged(cb: (data: any) => void): void {}
  onBlockAdded(cb: (data: any) => void): void {}
  onBlockDeleted(cb: (data: any) => void): void {}
  onNewComment(cb: (data: any) => void): void {}
  emitComment(p: string, c: any): void {}
}
// catchError
