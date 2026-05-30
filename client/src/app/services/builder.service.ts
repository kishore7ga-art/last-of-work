import { Injectable, inject } from '@angular/core';
import { CanvasBlock, PageData } from '../store/builder.models';
import { BuilderStore } from '../store/builder.store';

@Injectable({
  providedIn: 'root'
})
export class BuilderService {
  private store = inject(BuilderStore);

  exportToHTML(blocks: CanvasBlock[]): string {
    const cssRules: string[] = [];
    const mobileCssRules: string[] = [];

    // Helper to map prop names to CSS keys
    const toCssKey = (key: string): string => {
      switch (key) {
        case 'fontSize': return 'font-size';
        case 'fontWeight': return 'font-weight';
        case 'textAlign': return 'text-align';
        case 'lineHeight': return 'line-height';
        case 'letterSpacing': return 'letter-spacing';
        case 'borderRadius': return 'border-radius';
        case 'backgroundColor': return 'background-color';
        case 'shadow': return 'box-shadow';
        case 'minHeight': return 'min-height';
        case 'flexDirection': return 'flex-direction';
        case 'alignItems': return 'align-items';
        case 'justifyContent': return 'justify-content';
        case 'gridColumns': return 'grid-template-columns';
        default: return key.replace(/([A-Z])/g, '-$1').toLowerCase();
      }
    };

    // Helper to generate a rule set for a block
    const buildStyleRule = (block: CanvasBlock, isMobile: boolean): string => {
      const activeProps = isMobile 
        ? { ...block.props, ...(block.mobileProps || {}) }
        : block.props;
      
      const styles: string[] = [];

      const keys = [
        'fontSize', 'fontWeight', 'textAlign', 'color', 'padding', 'margin', 
        'lineHeight', 'letterSpacing', 'width', 'height', 'borderRadius', 
        'backgroundColor', 'border', 'shadow', 'opacity', 'display', 'minHeight',
        'flexDirection', 'alignItems', 'justifyContent', 'gridColumns', 'gap'
      ];

      keys.forEach(k => {
        const val = activeProps[k];
        if (val !== undefined && val !== null && val !== '') {
          styles.push(`${toCssKey(k)}: ${val}`);
        }
      });

      // Gradient background helper
      if (activeProps['gradientFrom'] && activeProps['gradientTo']) {
        styles.push(`background: linear-gradient(135deg, ${activeProps['gradientFrom']}, ${activeProps['gradientTo']})`);
      } else if (activeProps['src'] && block.type === 'section') {
        styles.push(`background: url(${activeProps['src']}) center/cover no-repeat`);
      }

      // Visibility display override
      if (isMobile) {
        if (block.visibility?.mobile === false) {
          styles.push('display: none !important');
        }
        if (block.mobileOrder !== null && block.mobileOrder !== undefined) {
          styles.push(`order: ${block.mobileOrder}`);
        }
      } else {
        if (block.visibility?.desktop === false) {
          styles.push('display: none !important');
        }
      }

      return styles.join('; ');
    };

    // Populate CSS rules
    const collectStyles = (allBlocks: CanvasBlock[]) => {
      allBlocks.forEach(block => {
        const dStyle = buildStyleRule(block, false);
        if (dStyle) {
          cssRules.push(`.block-${block.id} { ${dStyle} }`);
        }
        const mStyle = buildStyleRule(block, true);
        if (mStyle) {
          mobileCssRules.push(`.block-${block.id} { ${mStyle} }`);
        }
        if (block.children && block.children.length > 0) {
          collectStyles(block.children);
        }
      });
    };

    collectStyles(blocks);

    const htmlContent = blocks.map(block => this.renderBlockHTML(block)).join('\n');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Page</title>
  <style>
    body { margin: 0; font-family: sans-serif; background-color: #fafafa; color: #111827; }
    * { box-sizing: border-box; }
    img { max-width: 100%; height: auto; display: block; }
    
    /* Core Desktop Layout Styles */
    ${cssRules.join('\n    ')}
    
    /* Responsive Mobile Layout Overrides */
    @media (max-width: 768px) {
      ${mobileCssRules.join('\n      ')}
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
  }

  private renderBlockHTML(block: CanvasBlock): string {
    const props = block.props;
    switch (block.type) {
      case 'text':
        return `<p class="block-${block.id}">${props['content'] || ''}</p>`;
      case 'heading':
        const level = props['level'] || 'h2';
        return `<${level} class="block-${block.id}">${props['content'] || ''}</${level}>`;
      case 'image':
        return `<img src="${props['src'] || ''}" alt="${props['alt'] || ''}" class="block-${block.id}" />`;
      case 'button':
        return `<a href="${props['href'] || '#'}" target="${props['target'] || '_self'}" class="block-${block.id}" style="text-decoration: none; display: inline-block; text-align: center;">${props['label'] || ''}</a>`;
      case 'divider':
        return `<hr class="block-${block.id}" style="border: none; border-top: 1px solid #e5e7eb;" />`;
      case 'spacer':
        return `<div class="block-${block.id}"></div>`;
      case 'section':
        const childrenHtml = (block.children || []).map(child => this.renderBlockHTML(child)).join('\n');
        return `<div class="block-${block.id}">${childrenHtml}</div>`;
      default:
        return '';
    }
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  validatePage(page: PageData): boolean {
    if (!page.title || page.title.trim() === '') return false;
    if (!page.slug || page.slug.trim() === '') return false;
    return true;
  }
}
// catchError

