import { CanvasBlock, GlobalStyles } from '../store/builder.models';

export function exportPageToHtml(title: string, blocks: CanvasBlock[], seo?: { metaDescription?: string, ogImage?: string, canonicalUrl?: string }, globalStyles?: GlobalStyles): string {
  const renderedBlocks = blocks.map(block => renderBlockToHtml(block)).join('\n');
  const styles = globalStyles || {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#3b82f6',
    secondaryColor: '#111827',
    accentColor: '#10b981',
    baseFontSize: '16px'
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Exported Website'}</title>
  ${seo?.metaDescription ? `<meta name="description" content="${seo.metaDescription}">` : ''}
  ${seo?.ogImage ? `<meta property="og:image" content="${seo.ogImage}">` : ''}
  ${seo?.canonicalUrl ? `<link rel="canonical" href="${seo.canonicalUrl}">` : ''}
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body {
      font-family: ${styles.fontFamily};
      font-size: ${styles.baseFontSize};
      --builder-primary: ${styles.primaryColor};
      --builder-secondary: ${styles.secondaryColor};
      --builder-accent: ${styles.accentColor};
    }
    .builder-animate { opacity: 0; }
    .builder-visible { opacity: 1; transform: translate(0, 0) scale(1) !important; }
  </style>
</head>
<body class="bg-white min-h-screen">
  <main class="w-full">
    ${renderedBlocks}
  </main>
  <script>
    // Initialize Lucide Icons in the standalone page
    lucide.createIcons();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('builder-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.builder-animate').forEach((el) => observer.observe(el));
  </script>
</body>
</html>`;
}

function renderBlockToHtml(block: CanvasBlock): string {
  if (block.hidden) return '';
  const p = block.props;
  const open = animationOpen(p);
  const close = p.animation && p.animation !== 'none' ? '</div>' : '';

  switch (block.type) {
    case 'text':
      return `${open}<div class="py-4 px-6" style="text-align: ${p.textAlign || 'left'}; color: ${p.color || '#1f2937'}; font-size: ${p.fontSize || '16px'}; font-weight: ${p.fontWeight || '400'}">${p.content || ''}</div>${close}`;
      
    case 'heading':
      const level = p.level || 'h2';
      const headingSizes: Record<string, string> = {
        h1: '32px', h2: '24px', h3: '20px', h4: '18px', h5: '16px', h6: '14px'
      };
      const size = headingSizes[level] || '24px';
      return `${open}<div class="py-4 px-6" style="text-align: ${p.textAlign || 'left'}"><${level} style="color: ${p.color || '#111827'}; font-size: ${size}; font-weight: 700; line-height: 1.25">${p.content || ''}</${level}></div>${close}`;

    case 'image':
      return `<div class="py-4 flex justify-center"><img src="${p.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'}" alt="${p.alt || 'Image'}" style="width: ${p.width || '100%'}; height: ${p.height || 'auto'}; border-radius: ${p.borderRadius || '8px'}; border: ${p.border || 'none'}" class="shadow-sm max-w-full"></div>`;

    case 'button':
      return `<div class="py-4 flex justify-center"><a href="${p.href || '#'}" target="${p.target || '_self'}" class="transition-all inline-block text-center" style="background-color: ${p.backgroundColor || '#2563eb'}; color: ${p.color || '#ffffff'}; padding: ${p.padding || '10px 20px'}; border-radius: ${p.borderRadius || '6px'}; font-size: ${p.fontSize || '14px'}; font-weight: 500">${p.label || 'Click Here'}</a></div>`;

    case 'divider':
      return `<div class="py-4 px-6 flex justify-center"><hr style="border: 0; border-top: ${p.thickness || '1px'} solid ${p.color || '#e5e7eb'}; width: ${p.width || '100%'}"></div>`;

    case 'spacer':
      return `<div style="height: ${p.height || '20px'}"></div>`;

    case 'video':
      // Basic embed code
      return `<div class="py-4 px-6 flex justify-center"><iframe src="${p.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}" style="width: ${p.width || '100%'}; max-width: 800px; height: ${p.height || '450px'}" frameborder="0" allowfullscreen class="rounded-lg shadow"></iframe></div>`;

    case 'columns':
      // Multi-column mapping using flex layout
      const cols = p.columns || 2;
      const gap = p.gap || '20px';
      const colBlockMarkup = Array.from({ length: cols }).map(() => `<div class="flex-1 min-h-[100px] border border-dashed border-gray-200 rounded p-4 flex flex-col justify-center items-center text-gray-400 text-xs bg-gray-50">Column</div>`).join('\n');
      return `<div class="py-4 px-6"><div class="flex" style="gap: ${gap}">${colBlockMarkup}</div></div>`;

    case 'card':
      return `<div class="py-4 px-6 flex justify-center">
        <div class="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow max-w-sm flex flex-col" style="background-color: ${p.backgroundColor || '#ffffff'}; width: ${p.width || '100%'}">
          <img src="${p.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'}" alt="Card image" class="h-48 w-full object-cover">
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h4 class="font-bold text-gray-900 text-lg mb-2">${p.cardTitle || 'Card Title'}</h4>
              <p class="text-sm text-gray-600 mb-4">${p.cardText || 'Card content description text.'}</p>
            </div>
            <a href="#" class="inline-block text-center text-xs font-semibold py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors self-start">${p.cardButtonText || 'Button'}</a>
          </div>
        </div>
      </div>`;

    case 'form':
      return `<div class="py-4 px-6 flex justify-center" style="width: 100%">
        <form class="max-w-md w-full border border-gray-200 p-6 rounded-xl shadow-sm" style="background-color: ${p.backgroundColor || '#ffffff'}">
          <div class="mb-4">
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Name</label>
            <input type="text" placeholder="John Doe" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          </div>
          <div class="mb-4">
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Email</label>
            <input type="email" placeholder="john@example.com" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          </div>
          <div class="mb-4">
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Message</label>
            <textarea placeholder="Write your message..." rows="4" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"></textarea>
          </div>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded transition-colors">Submit</button>
        </form>
      </div>`;

    case 'input':
      return `<div class="py-4 px-6"><input type="${p.inputType || 'text'}" placeholder="${p.placeholder || 'Enter text...'}" style="width: ${p.width || '100%'}; padding: ${p.padding || '12px 14px'}; border: ${p.border || '1px solid #d1d5db'}; border-radius: ${p.borderRadius || '8px'}; color: ${p.color || '#111827'}; background: ${p.backgroundColor || '#ffffff'}; margin: ${p.margin || '0'}"></div>`;

    case 'icon':
      return `<div class="py-4 px-6" style="text-align: ${p.textAlign || 'center'}">
        <i data-lucide="${p.iconName || 'heart'}" style="width: ${p.iconSize || 24}px; height: ${p.iconSize || 24}px; color: ${p.color || '#2563eb'}; display: inline-block"></i>
      </div>`;

    case 'html':
      return `<div class="py-4 px-6">${p.htmlContent || '<div>Raw HTML Injection</div>'}</div>`;

    case 'map':
      const zoom = p.zoom || 14;
      const addr = encodeURIComponent(p.address || 'New York, NY');
      const mapSrc = `https://maps.google.com/maps?q=${addr}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
      return `<div class="py-4 px-6 flex justify-center">
        <iframe src="${mapSrc}" style="width: 100%; max-width: 800px; height: ${p.height || '400px'}" frameborder="0" allowfullscreen class="rounded-lg shadow"></iframe>
      </div>`;

    default:
      return '';
  }
}

function animationOpen(p: CanvasBlock['props']): string {
  if (!p.animation || p.animation === 'none') return '';

  const delay = p.animationDelay || 0;
  const duration = p.animationDuration || 600;
  let transform = '';
  if (p.animation === 'slideUp' || p.animation === 'bounce') transform = 'transform: translateY(40px);';
  if (p.animation === 'slideLeft') transform = 'transform: translateX(-40px);';
  if (p.animation === 'zoomIn') transform = 'transform: scale(0.85);';

  return `<div class="builder-animate" style="${transform} transition: opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms;">`;
}
