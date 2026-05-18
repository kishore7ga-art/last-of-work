import { Injectable, inject } from '@angular/core';
import { CanvasBlock, PageData } from '../store/builder.models';
import { BuilderStore } from '../store/builder.store';

@Injectable({
  providedIn: 'root'
})
export class BuilderService {
  private store = inject(BuilderStore);

  exportToHTML(blocks: CanvasBlock[]): string {
    const htmlContent = blocks.map(block => this.renderBlockHTML(block)).join('\n');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Page</title>
  <style>
    body { margin: 0; font-family: sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
  }

  private renderBlockHTML(block: CanvasBlock): string {
    const props = block.props;
    const styleObj: any = {};
    
    if (props.fontSize) styleObj['font-size'] = props.fontSize;
    if (props.fontWeight) styleObj['font-weight'] = props.fontWeight;
    if (props.textAlign) styleObj['text-align'] = props.textAlign;
    if (props.color) styleObj['color'] = props.color;
    if (props.padding) styleObj['padding'] = props.padding;
    if (props.margin) styleObj['margin'] = props.margin;
    if (props.lineHeight) styleObj['line-height'] = props.lineHeight;
    if (props.width) styleObj['width'] = props.width;
    if (props.height) styleObj['height'] = props.height;
    if (props.objectFit) styleObj['object-fit'] = props.objectFit;
    if (props.borderRadius) styleObj['border-radius'] = props.borderRadius;
    if (props.backgroundColor) styleObj['background-color'] = props.backgroundColor;
    if (props.border) styleObj['border'] = props.border;
    if (props.shadow) styleObj['box-shadow'] = props.shadow;
    if (props.opacity !== undefined) styleObj['opacity'] = props.opacity;
    if (props.display) styleObj['display'] = props.display;
    if (props.minHeight) styleObj['min-height'] = props.minHeight;

    const styleString = Object.keys(styleObj)
      .map(key => `${key}: ${styleObj[key]}`)
      .join('; ');

    switch (block.type) {
      case 'text':
        return `<p style="${styleString}">${props.content || ''}</p>`;
      case 'heading':
        return `<h2 style="${styleString}">${props.content || ''}</h2>`;
      case 'image':
        return `<img src="${props.src || ''}" alt="${props.alt || ''}" style="${styleString}" />`;
      case 'button':
        return `<a href="${props.href || '#'}" target="${props.target || '_self'}" style="text-decoration: none; display: inline-block; ${styleString}">${props.label || ''}</a>`;
      case 'section':
        return `<div style="${styleString}"></div>`;
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
