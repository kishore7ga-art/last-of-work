import { Component, Input, ViewChild, ElementRef, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlockProps } from '../../../store/builder.models';
import { BuilderStore } from '../../../store/builder.store';

@Component({
  selector: 'app-text-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div (dblclick)="startEditing($event)" class="relative">
      <ng-container *ngIf="!isEditing()">
        <ng-container *ngIf="!isHeading">
          <p [ngStyle]="getStyles()" class="whitespace-pre-wrap">{{ props.content }}</p>
        </ng-container>
        <ng-container *ngIf="isHeading">
          <h1 *ngIf="props.level === 'h1'" [ngStyle]="getStyles()">{{ props.content }}</h1>
          <h2 *ngIf="props.level === 'h2' || !props.level" [ngStyle]="getStyles()">{{ props.content }}</h2>
          <h3 *ngIf="props.level === 'h3'" [ngStyle]="getStyles()">{{ props.content }}</h3>
          <h4 *ngIf="props.level === 'h4'" [ngStyle]="getStyles()">{{ props.content }}</h4>
          <h5 *ngIf="props.level === 'h5'" [ngStyle]="getStyles()">{{ props.content }}</h5>
          <h6 *ngIf="props.level === 'h6'" [ngStyle]="getStyles()">{{ props.content }}</h6>
        </ng-container>
      </ng-container>
      
      <textarea
        *ngIf="isEditing()"
        #editInput
        [(ngModel)]="editValue"
        (blur)="saveEdit()"
        (keydown)="onKeydown($event)"
        (input)="autoResize($event.target)"
        [ngStyle]="getStyles()"
        class="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded resize-none m-0 p-0 overflow-hidden"
      ></textarea>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TextBlockComponent {
  @Input() props!: BlockProps;
  @Input() blockId!: string;
  @Input() isHeading = false;
  
  @ViewChild('editInput') editInput!: ElementRef<HTMLTextAreaElement>;

  private store = inject(BuilderStore);
  
  isEditing = signal(false);
  editValue = '';

  getStyles() {
    return {
      'font-size': this.props.fontSize,
      'font-weight': this.props.fontWeight,
      'text-align': this.props.textAlign,
      'color': this.props.color,
      'padding': this.props.padding,
      'margin': this.props.margin,
      'line-height': this.props.lineHeight
    };
  }

  startEditing(event: MouseEvent) {
    event.stopPropagation();
    this.editValue = this.props.content || '';
    this.isEditing.set(true);
    
    setTimeout(() => {
      if (this.editInput) {
        this.editInput.nativeElement.focus();
        this.autoResize(this.editInput.nativeElement);
        // Put cursor at end
        this.editInput.nativeElement.setSelectionRange(this.editValue.length, this.editValue.length);
      }
    });
  }

  saveEdit() {
    if (this.isEditing()) {
      this.store.updateBlock(this.blockId, { content: this.editValue });
      this.isEditing.set(false);
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.isEditing.set(false);
    }
  }

  autoResize(element: any) {
    const el = element as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }
}
