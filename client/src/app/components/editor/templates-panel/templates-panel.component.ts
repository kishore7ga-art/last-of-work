import { Component, computed, inject, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BuilderStore } from '../../../store/builder.store';
import { ToastService } from '../../../services/toast.service';
import { TEMPLATE_GROUPS, SectionTemplate, TemplateCategory } from '../../../data/templates.data';
import { CanvasBlock } from '../../../store/builder.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-templates-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './templates-panel.component.html',
  styleUrls: ['./templates-panel.component.scss']
})
export class TemplatesPanelComponent implements OnInit {
  store = inject(BuilderStore);
  private toast = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  private templateHtmlCache = new Map<string, SafeHtml>();

  // Valid block types that have components
  private readonly VALID_TYPES = new Set([
    'text', 'heading', 'image', 'button',
    'section', 'divider', 'spacer', 'video',
    'columns', 'card', 'form', 'html',
    'icon', 'map'
  ]);

  hoveredId = signal<string | null>(null);

  // Search & Filters
  searchQuery = signal('');
  selectedCategory = signal<string>('all');

  // Favorites & Recents state
  favorites = signal<string[]>([]);
  recentIds = signal<string[]>([]);

  // Category list
  categoriesList = [
    { key: 'all', label: 'All' },
    { key: 'header', label: 'Header' },
    { key: 'footer', label: 'Footer' },
    { key: 'cta', label: 'CTA' },
    { key: 'cards', label: 'Cards' },
    { key: 'forms', label: 'Forms' },
    { key: 'features', label: 'Features' },
    { key: 'testimonials', label: 'Testimonial' },
    { key: 'gallery', label: 'Gallery' }
  ];

  ngOnInit() {
    this.loadFavorites();
    this.loadRecents();
  }

  // Load favorites from local storage
  loadFavorites() {
    try {
      const favs = localStorage.getItem('builder_fav_templates');
      if (favs) {
        this.favorites.set(JSON.parse(favs));
      }
    } catch (e) {
      if (!environment.production) {
        console.error('Error loading favorite templates', e);
      }
    }
  }

  // Load recently used templates from local storage
  loadRecents() {
    try {
      const rec = localStorage.getItem('builder_recent_templates');
      if (rec) {
        this.recentIds.set(JSON.parse(rec));
      }
    } catch (e) {
      if (!environment.production) {
        console.error('Error loading recent templates', e);
      }
    }
  }

  // Toggle favorite status
  toggleFavorite(id: string, event: MouseEvent) {
    event.stopPropagation();
    let current = [...this.favorites()];
    if (current.includes(id)) {
      current = current.filter(item => item !== id);
      this.toast.info('Removed from Favorites');
    } else {
      current.push(id);
      this.toast.success('Added to Favorites');
    }
    this.favorites.set(current);
    localStorage.setItem('builder_fav_templates', JSON.stringify(current));
  }

  // Record recently used template
  trackRecent(id: string) {
    let current = [id, ...this.recentIds().filter(item => item !== id)];
    // Keep max 5 items
    current = current.slice(0, 5);
    this.recentIds.set(current);
    localStorage.setItem('builder_recent_templates', JSON.stringify(current));
  }

  // Compute if a category button should show
  hasFavorites = computed(() => this.favorites().length > 0);

  // Compute all available categories, prepending favorites if present
  pills = computed(() => {
    const list = [...this.categoriesList];
    if (this.hasFavorites()) {
      list.splice(1, 0, { key: 'favorites', label: '❤️ Favorites' });
    }
    return list;
  });

  // Flat list of all templates across categories
  allTemplates = computed(() => {
    const all: SectionTemplate[] = [];
    TEMPLATE_GROUPS.forEach(g => {
      g.templates.forEach(t => {
        all.push(t);
      });
    });
    return all;
  });

  // Filter and compute templates based on category & search query
  filteredTemplates = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    let result = this.allTemplates();

    // 1. Filter by category pill
    if (cat === 'favorites') {
      const favList = this.favorites();
      result = result.filter(t => favList.includes(t.id));
    } else if (cat !== 'all') {
      result = result.filter(t => t.category === cat);
    }

    // 2. Filter by search query
    if (query) {
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    return result;
  });

  // Recents templates to display at the top (last 3 used)
  recentTemplates = computed(() => {
    const recIds = this.recentIds().slice(0, 3);
    return this.allTemplates().filter(t => recIds.includes(t.id));
  });

  // Check if a template is favorited
  isFav(id: string): boolean {
    return this.favorites().includes(id);
  }

  addTemplate(template: SectionTemplate): void {
    if (!template) {
      console.error('No template provided');
      return;
    }

    if (!template.blocks?.length) {
      console.error('Template has no blocks:', template.name);
      this.toast.show('Template is empty', 'error');
      return;
    }

    const timestamp = Date.now();
    let blockIndex = 0;

    const cloneBlock = (originalBlock: any): CanvasBlock => {
      blockIndex++;
      const uniqueId =
        `tpl-${timestamp}-${blockIndex}-` +
        `${Math.random()
          .toString(36)
          .substring(2, 7)}`;

      return {
        id: uniqueId,
        type: originalBlock.type,
        props: {
          ...(originalBlock.props || {})
        },
        animation: originalBlock.animation
          ? { ...originalBlock.animation }
          : undefined,
        visibility: {
          desktop: true,
          mobile: true,
          tablet: true
        },
        mobileProps: originalBlock.mobileProps
          ? { ...originalBlock.mobileProps }
          : null,
        locked: false,
        hidden: false,
        children: Array.isArray(originalBlock.children)
          ? originalBlock.children.map(cloneBlock)
          : []
      };
    };

    // Clone all blocks with new IDs
    const clonedBlocks = template.blocks.map(cloneBlock);

    // Filter to valid types only
    const validBlocks = clonedBlocks.filter(b => {
      const isValid = this.VALID_TYPES.has(b.type);
      if (!isValid) {
        console.warn(
          `Template "${template.name}": ` +
          `skipping unknown type "${b.type}". ` +
          `Valid types: ` +
          `${[...this.VALID_TYPES].join(', ')}`
        );
      }
      return isValid;
    });

    if (!validBlocks.length) {
      const types = clonedBlocks.map(b => b.type).join(', ');
      console.error(`All blocks invalid. Types: ${types}`);
      this.toast.show(`Fix template block types: ${types}`, 'error');
      return;
    }

    console.log(
      `Adding ${validBlocks.length} blocks`,
      'from template:', template.name,
      'types:', validBlocks.map(b => b.type)
    );

    // Add to store — triggers canvas re-render
    this.store.addMultipleBlocks(validBlocks);
    this.trackRecent(template.id);

    // Show success
    this.toast.show(
      `✓ ${template.name} — ` +
      `${validBlocks.length} blocks added`,
      'success'
    );

    // Scroll to first block after render
    setTimeout(() => {
      const firstEl = document.getElementById('block-' + validBlocks[0].id);

      if (firstEl) {
        firstEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Flash to show where blocks are
        firstEl.style.outline = '3px solid #4f6ef7';
        setTimeout(() => {
          firstEl.style.outline = '';
        }, 2000);
      } else {
        console.warn(
          'Block not in DOM:',
          'block-' + validBlocks[0].id,
          '\nAll DOM blocks:',
          document.querySelectorAll('[id^="block-"]').length
        );
      }
    }, 300);
  }

  // Clear search bar
  clearSearch() {
    this.searchQuery.set('');
  }

  // Group filtered templates by category
  groupedTemplates = computed(() => {
    const templates = this.filteredTemplates();
    const groups: { category: string; label: string; templates: SectionTemplate[] }[] = [];

    TEMPLATE_GROUPS.forEach(g => {
      const matched = templates.filter(t => t.category === g.category);
      if (matched.length > 0) {
        groups.push({
          category: g.category,
          label: g.label,
          templates: matched
        });
      }
    });

    return groups;
  });

  trackByTpl(index: number, item: SectionTemplate) {
    return item.id;
  }

  getTemplateHTML(template: SectionTemplate): SafeHtml {
    const cached = this.templateHtmlCache.get(template.id);
    if (cached) return cached;

    let html = '<div style="font-family:Inter,sans-serif;width:100%;overflow:hidden;">';
    template.blocks.forEach(block => {
      html += this.renderBlockPreview(block);
    });
    html += '</div>';

    const safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    this.templateHtmlCache.set(template.id, safeHtml);
    return safeHtml;
  }

  renderBlockPreview(block: CanvasBlock): string {
    const p = block.props || {}
    
    switch(block.type) {
      case 'section':
        const bg = p.backgroundColor || '#f8fafc'
        const padding = p.padding || '20px'
        let content = ''
        if (block.children?.length) {
          content = block.children
            .map(c => this.renderBlockPreview(c))
            .join('')
        }
        return `<div style="
          background:${bg};
          padding:${padding};
          width:100%;
          box-sizing:border-box;
          ${p['backgroundImage'] ? 'background-image:'+p['backgroundImage']+';background-size:cover;' : ''}
        ">${content}</div>`
      
      case 'heading':
        return `<h2 style="
          color:${p.color || '#111827'};
          text-align:${p.textAlign || 'left'};
          padding:${p.padding || '8px 0'};
          margin:0;
          line-height:1.2;
        ">${p.content || 'Heading'}</h2>`
      
      case 'text':
        return `<p style="
          font-size:${p.fontSize || '14px'};
          color:${p.color || '#374151'};
          text-align:${p.textAlign || 'left'};
          padding:${p.padding || '4px 0'};
          margin:0;
          line-height:1.5;
        ">${p.content || 'Text'}</p>`
      
      case 'button':
        return `<div style="
          padding:8px 0;
          text-align:${p.textAlign || 'left'};
        ">
          <span style="
            display:inline-block;
            background:${p.backgroundColor || '#4f6ef7'};
            color:${p.color || '#ffffff'};
            padding:${p.padding || '8px 20px'};
            border-radius:${p.borderRadius || '6px'};
            font-size:${p.fontSize || '14px'};
            font-weight:${p.fontWeight || '600'};
          ">${p.label || 'Button'}</span>
        </div>`
      
      case 'image':
        return `<div style="
          width:${p.width || '100%'};
          height:120px;
          background:linear-gradient(135deg, #e2e8f0, #cbd5e1);
          border-radius:${p.borderRadius || '0'};
          display:flex;
          align-items:center;
          justify-content:center;
          color:#94a3b8;
          font-size:12px;
        ">📷 Image</div>`
      
      case 'divider':
        return `<hr style="
          border:none;
          
          margin:${p.margin || '8px 0'};
        "/>`
      
      case 'columns':
        const cols = p.columns || 2
        const colContent = Array(cols).fill(0)
          .map((_, i) => `
            <div style="
              flex:1;
              background:#f1f5f9;
              border-radius:4px;
              padding:8px;
              font-size:11px;
              color:#94a3b8;
              text-align:center;
            ">Column ${i+1}</div>
          `).join('')
        return `<div style="
          display:flex;
          gap:8px;
          padding:4px 0;
        ">${colContent}</div>`
      
      case 'card':
        return `<div style="
          background:#ffffff;
          border:1px solid #e5e7eb;
          border-radius:8px;
          padding:16px;
          margin:4px 0;
        ">
          <div style="
            height:60px;
            background:linear-gradient(135deg,#e0e7ff,#c7d2fe);
            border-radius:4px;
            margin-bottom:8px;
          "></div>
          <div style="
            height:12px;
            background:#111827;
            border-radius:2px;
            margin-bottom:6px;
            width:70%;
          "></div>
          <div style="
            height:8px;
            background:#e5e7eb;
            border-radius:2px;
            width:90%;
          "></div>
        </div>`
      
      case 'form':
        return `<div style="padding:4px 0;">
          <div style="
            height:28px;
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:4px;
            margin-bottom:6px;
          "></div>
          <div style="
            height:28px;
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:4px;
            margin-bottom:6px;
          "></div>
          <div style="
            height:32px;
            background:#4f6ef7;
            border-radius:4px;
            width:100%;
          "></div>
        </div>`
      
      default:
        return `<div style="
          height:40px;
          background:#f1f5f9;
          border-radius:4px;
          margin:4px 0;
        "></div>`
    }
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      header: '#4f6ef7',
      footer: '#6b7280',
      cta: '#f59e0b',
      cards: '#10b981',
      forms: '#8b5cf6',
      features: '#06b6d4',
      testimonials: '#ec4899',
      gallery: '#f97316'
    }
    return colors[category] || '#6b7280'
  }
}
