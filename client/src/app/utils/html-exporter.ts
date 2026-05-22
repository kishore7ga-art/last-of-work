import { CanvasBlock, GlobalStyles } from '../store/builder.models';

export function exportPageToHtml(
  title: string,
  blocks: CanvasBlock[],
  seo?: { metaDescription?: string, ogImage?: string, canonicalUrl?: string },
  globalStyles?: GlobalStyles,
  themeCss?: string
): string {
  const renderedBlocks = blocks.map(block => renderBlockToHtml(block)).join('\n');
  const styles = globalStyles || {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#3b82f6',
    secondaryColor: '#111827',
    accentColor: '#10b981',
    baseFontSize: '16px'
  };

  const blockAnimCSS = generateBlockAnimationCSS(blocks);
  const animStyles = getAnimationsStylesheet() + '\n' + blockAnimCSS;

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
    .video-player-desktop { position: relative; }
    @media (max-width: 767px) {
      .video-player-desktop { display: none !important; }
      .video-fallback-mobile { display: block !important; }
      .video-fallback-desktop { display: none !important; }
    }
    @media (min-width: 768px) {
      .video-fallback-mobile { display: none !important; }
      .video-fallback-desktop { display: none !important; }
    }
${themeCss ? `    ${themeCss.replace(/\n/g, '\n    ')}` : ''}
${animStyles ? `    ${animStyles.replace(/\n/g, '\n    ')}` : ''}
  </style>
</head>
<body class="bg-white min-h-screen">
  <main class="w-full">
    ${renderedBlocks}
  </main>
  <script>
    lucide.createIcons();
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.remove('mb-anim-ready');
          
          const animType = el.getAttribute('data-mb-type');
          if (animType && animType !== 'none') {
            if (animType === 'typewriter') {
              playTypewriter(el);
            } else {
              el.style.animation = 'none';
              void el.offsetWidth;
              el.style.animation = el.getAttribute('data-mb-style') || '';
              el.classList.add('mb-anim-play', 'mb-' + animType);
              
              if (el.getAttribute('data-mb-stagger') === 'true') {
                const delay = parseInt(el.getAttribute('data-mb-stagger-delay') || '100');
                Array.from(el.children).forEach((child, i) => {
                  child.style.opacity = '0';
                  setTimeout(() => {
                    child.style.animation = el.getAttribute('data-mb-style') || '';
                    child.classList.add('mb-anim-play', 'mb-' + animType);
                    child.style.opacity = '';
                  }, i * delay);
                });
              }
            }
          }
          if (el.getAttribute('data-mb-once') !== 'false') observer.unobserve(el);
        } else {
          const el = entry.target;
          if (el.getAttribute('data-mb-once') === 'false') {
            el.style.animation = 'none';
            el.classList.remove('mb-anim-play');
            el.classList.add('mb-anim-ready');
          }
        }
      });
    }, { rootMargin: '0px', threshold: 0.15 });
    
    document.querySelectorAll('.mb-anim-ready').forEach(el => observer.observe(el));

    function playTypewriter(el) {
      const text = el.getAttribute('data-mb-text') || '';
      const speed = parseInt(el.getAttribute('data-mb-tw-speed') || '60');
      const hasCursor = el.getAttribute('data-mb-tw-cursor') === 'true';
      const loop = el.getAttribute('data-mb-tw-loop') === 'true';
      
      const targetEl = el.querySelector('p, h1, h2, h3, h4, h5, h6, span, div, a');
      if (!targetEl) return;
      
      targetEl.innerHTML = '';
      const textSpan = document.createElement('span');
      targetEl.appendChild(textSpan);
      
      let cursorEl = null;
      if (hasCursor) {
        cursorEl = document.createElement('span');
        cursorEl.className = 'mb-tw-cursor';
        cursorEl.textContent = '|';
        targetEl.appendChild(cursorEl);
      }
      
      let i = 0;
      const typeChar = () => {
        if (i < text.length) {
          textSpan.textContent += text[i];
          i++;
          setTimeout(typeChar, speed);
        } else if (loop) {
          setTimeout(() => deleteTypewriter(textSpan, cursorEl, text, speed, loop), 1500);
        }
      };
      
      const deleteTypewriter = (span, cur, original, spd, lp) => {
        const str = span.textContent || '';
        if (str.length > 0) {
          span.textContent = str.slice(0, -1);
          setTimeout(() => deleteTypewriter(span, cur, original, spd, lp), spd / 2);
        } else {
          setTimeout(() => {
            let j = 0;
            const reType = () => {
              if (j < original.length) {
                span.textContent += original[j];
                j++;
                setTimeout(reType, spd);
              } else if (lp) {
                setTimeout(() => deleteTypewriter(span, cur, original, spd, lp), 1500);
              }
            };
            reType();
          }, 300);
        }
      };
      
      setTimeout(typeChar, parseInt(el.getAttribute('data-mb-delay') || '0'));
    }
  </script>
</body>
</html>`;
}

function generateBlockAnimationCSS(blocks: CanvasBlock[]): string {
  return ''; // Replaced by global animations.css
}

function renderBlockToHtml(block: CanvasBlock): string {
  if (block.hidden) return '';
  const p = block.props;
  const anim = block.animation;
  const hasAnim = anim && anim.enabled;
  
  let animAttrs = '';
  let animClasses = 'block-export-wrapper';
  
  if (hasAnim) {
    animClasses += ' mb-anim-ready';
    animAttrs += ` data-mb-type="${anim.type}"`;
    animAttrs += ` data-mb-once="${anim.triggerOnce}"`;
    animAttrs += ` data-mb-threshold="${anim.threshold || 0.15}"`;
    animAttrs += ` data-mb-delay="${anim.delay || 0}"`;
    
    if (anim.type === 'typewriter') {
      animAttrs += ` data-mb-tw-speed="${anim.twSpeed || 60}"`;
      animAttrs += ` data-mb-tw-cursor="${anim.twCursor}"`;
      animAttrs += ` data-mb-tw-loop="${anim.twLoop}"`;
      animAttrs += ` data-mb-text='${(p.content || p.label || '').replace(/'/g, "&apos;")}'`;
    } else {
      const iterCount = anim.repeat === 'once' ? '1' : anim.repeat === 'loop' ? 'infinite' : String(anim.repeat);
      const styleString = `mb-${anim.type} ${anim.duration}ms ${anim.easing} ${anim.delay}ms ${iterCount} ${anim.direction} both`;
      animAttrs += ` data-mb-style="${styleString}"`;
    }
    
    if (anim.stagger) {
      animAttrs += ` data-mb-stagger="true"`;
      animAttrs += ` data-mb-stagger-delay="${anim.staggerMs || 100}"`;
    }
  }

  let htmlContent = '';
  switch (block.type) {
    case 'text': {
      const useTextColors = p['useThemeColors'] !== false;
      const useTextFonts = p['useThemeFonts'] !== false;
      let textColor = p.color || '#1f2937';
      if (useTextColors && (!p.color || p.color === '#111827' || p.color === '#1f2937' || p.color === '#4b5563' || p.color === '#6b7280' || p.color === '#9ca3af')) {
        textColor = 'var(--theme-text)';
      }
      const textFont = useTextFonts ? 'var(--theme-font-body)' : 'inherit';
      htmlContent = `<div class="py-4 px-6" style="text-align: ${p.textAlign || 'left'}; color: ${textColor}; font-family: ${textFont}; font-size: ${p.fontSize || '16px'}; font-weight: ${p.fontWeight || '400'}">${p.content || ''}</div>`;
      break;
    }
      
    case 'heading': {
      const level = p.level || 'h2';
      const headingSizes: Record<string, string> = {
        h1: '32px', h2: '24px', h3: '20px', h4: '18px', h5: '16px', h6: '14px'
      };
      const size = headingSizes[level] || '24px';
      
      const useHeadingColors = p['useThemeColors'] !== false;
      const useHeadingFonts = p['useThemeFonts'] !== false;
      
      let headingColor = p.color || '#111827';
      if (useHeadingColors && (!p.color || p.color === '#111827' || p.color === '#1f2937' || p.color === '#4b5563' || p.color === '#6b7280' || p.color === '#9ca3af')) {
        headingColor = 'var(--theme-text)';
      }
      
      const headingFont = useHeadingFonts ? 'var(--theme-font-heading)' : 'inherit';
      let headingWeight = p.fontWeight || '700';
      if (useHeadingFonts && (!p.fontWeight || p.fontWeight === 'bold' || p.fontWeight === '700' || p.fontWeight === '800')) {
        headingWeight = 'var(--theme-heading-weight)';
      }
      htmlContent = `<div class="py-4 px-6" style="text-align: ${p.textAlign || 'left'}"><${level} style="color: ${headingColor}; font-family: ${headingFont}; font-size: ${size}; font-weight: ${headingWeight}; line-height: 1.25">${p.content || ''}</${level}></div>`;
      break;
    }

    case 'image':
      htmlContent = `<div class="py-4 flex justify-center"><img src="${p.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'}" alt="${p.alt || 'Image'}" style="width: ${p.width || '100%'}; height: ${p.height || 'auto'}; border-radius: ${p.borderRadius || '8px'}; border: ${p.border || 'none'}" class="shadow-sm max-w-full"></div>`;
      break;

    case 'button': {
      const useBtnColors = p['useThemeColors'] !== false;
      const useBtnFonts = p['useThemeFonts'] !== false;
      const useBtnRadius = p['useThemeRadius'] !== false;

      let btnBgColor = p.backgroundColor;
      let btnColor = p.color;

      if (useBtnColors && (!btnBgColor || btnBgColor === '#2563eb' || btnBgColor === '#3b82f6' || btnBgColor === '#4f6ef7' || btnBgColor === '#10b981')) {
        btnBgColor = 'var(--theme-primary)';
        btnColor = 'var(--theme-button-text)';
      } else if (useBtnColors && (!btnColor || btnColor === '#ffffff')) {
        btnColor = 'var(--theme-button-text)';
      }
      
      const btnFont = useBtnFonts ? 'var(--theme-font-body)' : 'inherit';
      let btnRadius = p.borderRadius;
      if (useBtnRadius && (!btnRadius || btnRadius === '6px' || btnRadius === '8px')) {
        btnRadius = 'var(--theme-radius-btn)';
      }
      htmlContent = `<div class="py-4 flex justify-center"><a href="${p.href || '#'}" target="${p.target || '_self'}" class="transition-all inline-block text-center" style="background-color: ${btnBgColor}; color: ${btnColor}; font-family: ${btnFont}; padding: ${p.padding || '10px 20px'}; border-radius: ${btnRadius}; font-size: ${p.fontSize || '14px'}; font-weight: ${p.fontWeight || '500'}">${p.label || 'Click Here'}</a></div>`;
      break;
    }

    case 'divider':
      htmlContent = `<div class="py-4 px-6 flex justify-center"><hr style="border: 0; border-top: ${p.thickness || '1px'} solid ${p.color || '#e5e7eb'}; width: ${p.width || '100%'}"></div>`;
      break;

    case 'spacer':
      htmlContent = `<div style="height: ${p.height || '20px'}"></div>`;
      break;

    case 'video':
      htmlContent = `<div class="py-4 px-6 flex justify-center"><iframe src="${p.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}" style="width: ${p.width || '100%'}; max-width: 800px; height: ${p.height || '450px'}" frameborder="0" allowfullscreen class="rounded-lg shadow"></iframe></div>`;
      break;

    case 'columns': {
      const cols = p.columns || 2;
      const gap = p.gap || '20px';
      const colBlockMarkup = Array.from({ length: cols }).map(() => `<div class="flex-1 min-h-[100px] border border-dashed border-gray-200 rounded p-4 flex flex-col justify-center items-center text-gray-400 text-xs bg-gray-50">Column</div>`).join('\n');
      htmlContent = `<div class="py-4 px-6"><div class="flex" style="gap: ${gap}">${colBlockMarkup}</div></div>`;
      break;
    }

    case 'card': {
      const useCardColors = p['useThemeColors'] !== false;
      const useCardFonts = p['useThemeFonts'] !== false;
      const useCardRadius = p['useThemeRadius'] !== false;

      let cardBg = p.backgroundColor;
      if (useCardColors && (!cardBg || cardBg === '#ffffff' || cardBg === '#f9fafb' || cardBg === '#f8fafc' || cardBg === '#111827' || cardBg === '#0f172a')) {
        cardBg = 'var(--theme-surface)';
      }

      let cardRadius = p.borderRadius;
      if (useCardRadius && (!cardRadius || cardRadius === '0px' || cardRadius === '8px')) {
        cardRadius = 'var(--theme-radius-card)';
      }
      
      let cardBtnRadius = (useCardRadius) ? 'var(--theme-radius-btn)' : '6px';
      
      const cardTitleColor = (useCardColors) ? 'var(--theme-text)' : '#111827';
      const cardTextColor = (useCardColors) ? 'var(--theme-text-muted)' : '#4b5563';
      const cardBtnBg = (useCardColors) ? 'var(--theme-primary)' : '#3b82f6';
      const cardBtnColor = (useCardColors) ? 'var(--theme-button-text)' : '#ffffff';
      
      const cardHeadingFont = (useCardFonts) ? 'var(--theme-font-heading)' : 'inherit';
      const cardBodyFont = (useCardFonts) ? 'var(--theme-font-body)' : 'inherit';
      const cardHeadingWeight = (useCardFonts) ? 'var(--theme-heading-weight)' : '700';

      htmlContent = `<div class="py-4 px-6 flex justify-center">
        <div class="border overflow-hidden transition-shadow flex flex-col" style="background-color: ${cardBg}; border-color: ${useCardColors ? 'var(--theme-border)' : '#e5e7eb'}; border-radius: ${cardRadius}; box-shadow: ${p.shadow || 'var(--theme-shadow-card)'}; width: ${p.width || '100%'}; max-width: 400px; margin: ${p.margin || '0'}">
          ${p.src ? `<img src="${p.src}" alt="Card image" class="h-48 w-full object-cover">` : ''}
          <div style="padding: ${p.padding || '20px'}" class="flex-1 flex flex-col justify-between">
            <div>
              <h4 style="color: ${cardTitleColor}; font-family: ${cardHeadingFont}; font-weight: ${cardHeadingWeight}; font-size: 1.25rem; margin-bottom: 0.5rem">${p.cardTitle || 'Card Title'}</h4>
              <p style="color: ${cardTextColor}; font-family: ${cardBodyFont}; font-size: 0.875rem; margin-bottom: 1rem">${p.cardText || 'Card content description text.'}</p>
            </div>
            <a href="#" class="inline-block text-center text-xs font-semibold py-2 px-4 transition-colors self-start" style="background-color: ${cardBtnBg}; color: ${cardBtnColor}; font-family: ${cardBodyFont}; border-radius: ${cardBtnRadius}">${p.cardButtonText || 'Button'}</a>
          </div>
        </div>
      </div>`;
      break;
    }

    case 'form':
      htmlContent = `<div class="py-4 px-6 flex justify-center" style="width: 100%">
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
      break;

    case 'input':
      htmlContent = `<div class="py-4 px-6"><input type="${p.inputType || 'text'}" placeholder="${p.placeholder || 'Enter text...'}" style="width: ${p.width || '100%'}; padding: ${p.padding || '12px 14px'}; border: ${p.border || '1px solid #d1d5db'}; border-radius: ${p.borderRadius || '8px'}; color: ${p.color || '#111827'}; background: ${p.backgroundColor || '#ffffff'}; margin: ${p.margin || '0'}"></div>`;
      break;

    case 'icon':
      htmlContent = `<div class="py-4 px-6" style="text-align: ${p.textAlign || 'center'}">
        <i data-lucide="${p.iconName || 'heart'}" style="width: ${p.iconSize || 24}px; height: ${p.iconSize || 24}px; color: ${p.color || '#2563eb'}; display: inline-block"></i>
      </div>`;
      break;

    case 'html':
      htmlContent = `<div class="py-4 px-6">${p.htmlContent || '<div>Raw HTML Injection</div>'}</div>`;
      break;

    case 'map': {
      const zoom = p.zoom || 14;
      const addr = encodeURIComponent(p.address || 'New York, NY');
      const mapSrc = `https://maps.google.com/maps?q=${addr}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
      htmlContent = `<div class="py-4 px-6 flex justify-center">
        <iframe src="${mapSrc}" style="width: 100%; max-width: 800px; height: ${p.height || '400px'}" frameborder="0" allowfullscreen class="rounded-lg shadow"></iframe>
      </div>`;
      break;
    }

    case 'section': {
      const childrenMarkup = (block.children || []).map(child => renderBlockToHtml(child)).join('\n');
      
      const useColors = p['useThemeColors'] !== false;
      const useRadius = p['useThemeRadius'] !== false;
      
      let bgColor = p.backgroundColor || '';
      if (useColors && (!bgColor || bgColor === '#ffffff' || bgColor === '#f9fafb' || bgColor === '#f8fafc' || bgColor === '#111827' || bgColor === '#0f172a')) {
        bgColor = 'var(--theme-surface, ' + bgColor + ')';
      }
      
      let radius = p.borderRadius || '';
      if (useRadius && (!radius || radius === '0px' || radius === '8px')) {
        radius = 'var(--theme-radius-card, ' + radius + ')';
      }
      
      let backgroundAttr = '';
      if (p['gradientFrom'] && p['gradientTo']) {
        backgroundAttr = `background: linear-gradient(135deg, ${p['gradientFrom']}, ${p['gradientTo']});`;
      } else if (p.src) {
        backgroundAttr = `background: url(${p.src}) center/cover no-repeat;`;
      } else {
        backgroundAttr = `background-color: ${bgColor};`;
      }

      let videoMarkup = '';
      if (p.videoBackground?.enabled) {
        const vb = p.videoBackground;
        let innerVideo = '';
        
        if (vb.type === 'youtube' && vb.youtubeId) {
          const params = new URLSearchParams({
            autoplay: vb.autoplay ? '1' : '0',
            loop: vb.loop ? '1' : '0',
            mute: vb.muted ? '1' : '0',
            controls: '0',
            showinfo: '0',
 Rel: '0',
            modestbranding: '1',
            playsinline: '1',
            enablejsapi: '1',
            start: vb.startTime ? vb.startTime.toString() : '0',
            playlist: vb.youtubeId
          });
          innerVideo = `
            <div class="video-iframe-wrapper" style="position: absolute; top: 50%; left: 50%; width: 100vw; height: 56.25vw; min-width: 177.77vh; min-height: 100%; transform: translate(-50%, -50%); pointer-events: none; z-index: 0;">
              <iframe src="https://www.youtube.com/embed/${vb.youtubeId}?${params.toString()}" style="width: 100%; height: 100%; border: none;" allow="autoplay; fullscreen"></iframe>
            </div>`;
        } else if (vb.type === 'mp4' && vb.mp4Url) {
          innerVideo = `
            <video style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none;" src="${vb.mp4Url}" ${vb.autoplay ? 'autoplay' : ''} ${vb.loop ? 'loop' : ''} ${vb.muted ? 'muted' : ''} playsinline preload="auto"></video>`;
        }
        
        let overlayMarkup = '';
        if (vb.overlayEnabled) {
          const blurStyle = vb.overlayBlur > 0 ? `backdrop-filter: blur(${vb.overlayBlur}px); -webkit-backdrop-filter: blur(${vb.overlayBlur}px);` : '';
          overlayMarkup = `<div class="video-bg-overlay" style="position: absolute; inset: 0; z-index: 1; pointer-events: none; background-color: ${vb.overlayColor}; opacity: ${vb.overlayOpacity / 100}; ${blurStyle}"></div>`;
        }
        
        const fallbackUrl = vb.mobileFallbackImage || vb.fallbackImage;
        const desktopFallbackUrl = vb.fallbackImage;
        
        let fallbackMarkup = '';
        if (fallbackUrl) {
          fallbackMarkup = `
            <img class="video-fallback-mobile" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none;" src="${fallbackUrl}" alt="background" />`;
        }
        if (desktopFallbackUrl) {
          fallbackMarkup += `
            <img class="video-fallback-desktop" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none; display: none;" src="${desktopFallbackUrl}" alt="background" />`;
        }

        videoMarkup = `
          <div class="video-bg-container" style="position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;">
            <div class="video-player-desktop" style="width: 100%; height: 100%; position: relative;">
              ${innerVideo}
            </div>
            ${fallbackMarkup}
            ${overlayMarkup}
          </div>
        `;
      }
      
      const sectionStyles = `
        position: relative;
        overflow: hidden;
        display: ${p['display'] || 'block'};
        flex-direction: ${p['flexDirection'] || ''};
        align-items: ${p['alignItems'] || ''};
        justify-content: ${p['justifyContent'] || ''};
        grid-template-columns: ${p['gridColumns'] || ''};
        gap: ${p['gap'] || ''};
        box-shadow: ${p['shadow'] || ''};
        border-radius: ${radius};
        padding: ${p.padding || ''};
        min-height: ${p.minHeight || ''};
        width: ${p.width || ''};
        margin: ${p.margin || ''};
        border: ${p.border || ''};
        ${p.videoBackground?.enabled ? 'background-color: transparent;' : backgroundAttr}
      `.trim().replace(/\s+/g, ' ');

      htmlContent = `<div class="w-full" style="${sectionStyles}">${videoMarkup}<div style="position: relative; z-index: 2; width: 100%;">${childrenMarkup}</div></div>`;
      break;
    }

    default:
      htmlContent = '';
      break;
  }
  
  if (!htmlContent) return '';
  return `<div id="block-${block.id}" class="${animClasses}"${animAttrs}>${htmlContent}</div>`;
}

function getAnimationsStylesheet(): string {
  return `
/* FADE ANIMATIONS */
@keyframes mb-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes mb-fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
@keyframes mb-fadeInDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
@keyframes mb-fadeInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
@keyframes mb-fadeInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }

/* SLIDE ANIMATIONS */
@keyframes mb-slideUp { from { opacity: 0; transform: translateY(80px); } to { opacity: 1; transform: translateY(0); } }
@keyframes mb-slideDown { from { opacity: 0; transform: translateY(-80px); } to { opacity: 1; transform: translateY(0); } }
@keyframes mb-slideLeft { from { opacity: 0; transform: translateX(-100px); } to { opacity: 1; transform: translateX(0); } }
@keyframes mb-slideRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }

/* ZOOM ANIMATIONS */
@keyframes mb-zoomIn { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
@keyframes mb-zoomOut { from { opacity: 0; transform: scale(1.4); } to { opacity: 1; transform: scale(1); } }
@keyframes mb-zoomInUp { from { opacity: 0; transform: scale(0.6) translateY(60px); } to { opacity: 1; transform: scale(1) translateY(0); } }

/* BOUNCE ANIMATIONS */
@keyframes mb-bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.08); } 70% { transform: scale(0.95); } 100% { transform: scale(1); } }
@keyframes mb-bounceInUp { 0% { opacity: 0; transform: translateY(100px); } 55% { opacity: 1; transform: translateY(-20px); } 75% { transform: translateY(8px); } 90% { transform: translateY(-4px); } 100% { transform: translateY(0); } }
@keyframes mb-bounceInDown { 0% { opacity: 0; transform: translateY(-100px); } 55% { opacity: 1; transform: translateY(20px); } 75% { transform: translateY(-8px); } 90% { transform: translateY(4px); } 100% { transform: translateY(0); } }
@keyframes mb-bounceInLeft { 0% { opacity: 0; transform: translateX(-100px); } 55% { opacity: 1; transform: translateX(20px); } 75% { transform: translateX(-8px); } 100% { transform: translateX(0); } }
@keyframes mb-bounceInRight { 0% { opacity: 0; transform: translateX(100px); } 55% { opacity: 1; transform: translateX(-20px); } 75% { transform: translateX(8px); } 100% { transform: translateX(0); } }
@keyframes mb-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes mb-bounce { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-24px); } 60% { transform: translateY(-12px); } }

/* FLIP ANIMATIONS */
@keyframes mb-flipInX { from { opacity: 0; transform: perspective(600px) rotateX(-90deg); } to { opacity: 1; transform: perspective(600px) rotateX(0deg); } }
@keyframes mb-flipInY { from { opacity: 0; transform: perspective(600px) rotateY(-90deg); } to { opacity: 1; transform: perspective(600px) rotateY(0deg); } }
@keyframes mb-rotateIn { from { opacity: 0; transform: rotate(-180deg); } to { opacity: 1; transform: rotate(0); } }

/* SHAKE & ATTENTION */
@keyframes mb-shake { 0%,100% { transform: translateX(0); } 15% { transform: translateX(-8px); } 30% { transform: translateX(8px); } 45% { transform: translateX(-6px); } 60% { transform: translateX(6px); } 75% { transform: translateX(-3px); } 90% { transform: translateX(3px); } }
@keyframes mb-wobble { 0% { transform: none; } 15% { transform: translateX(-20px) rotate(-5deg); } 30% { transform: translateX(15px) rotate(3deg); } 45% { transform: translateX(-10px) rotate(-3deg); } 60% { transform: translateX(6px) rotate(2deg); } 75% { transform: translateX(-3px) rotate(-1deg); } 100% { transform: none; } }
@keyframes mb-wiggle { 0%,100% { transform: rotate(0); } 20% { transform: rotate(-8deg); } 40% { transform: rotate(8deg); } 60% { transform: rotate(-4deg); } 80% { transform: rotate(4deg); } }
@keyframes mb-jello { 0%,100% { transform: none; } 30% { transform: skewX(-10deg) skewY(-10deg); } 40% { transform: skewX(8deg) skewY(8deg); } 55% { transform: skewX(-4deg) skewY(-4deg); } 70% { transform: skewX(2deg) skewY(2deg); } 85% { transform: skewX(-1deg) skewY(-1deg); } }
@keyframes mb-heartBeat { 0%,100% { transform: scale(1); } 14% { transform: scale(1.2); } 28% { transform: scale(1); } 42% { transform: scale(1.2); } 70% { transform: scale(1); } }
@keyframes mb-flash { 0%,50%,100% { opacity: 1; } 25%,75% { opacity: 0; } }
@keyframes mb-rubberBand { 0% { transform: scale(1,1); } 30% { transform: scale(1.3,0.7); } 40% { transform: scale(0.75,1.25); } 50% { transform: scale(1.15,0.85); } 65% { transform: scale(0.95,1.05); } 75% { transform: scale(1.05,0.95); } 100% { transform: scale(1,1); } }

/* SPECIAL ANIMATIONS */
@keyframes mb-blurIn { from { opacity: 0; filter: blur(20px); } to { opacity: 1; filter: blur(0); } }
@keyframes mb-glitch { 0% { clip-path: inset(0 0 95% 0); transform: translateX(-4px); } 10% { clip-path: inset(30% 0 50% 0); transform: translateX(4px); } 20% { clip-path: inset(60% 0 20% 0); transform: translateX(-3px); } 30% { clip-path: inset(0 0 70% 0); transform: translateX(3px); } 40% { clip-path: inset(50% 0 0 0); transform: translateX(-2px); } 50% { clip-path: inset(20% 0 60% 0); transform: translateX(2px); } 100% { clip-path: inset(0 0 0 0); transform: translateX(0); opacity: 1; } }
@keyframes mb-cursor-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

/* Base classes */
.mb-anim-ready { opacity: 0 !important; }
.mb-anim-play { opacity: 1 !important; animation-fill-mode: both !important; }
.mb-tw-cursor { display: inline-block; animation: mb-cursor-blink 0.7s step-end infinite; margin-left: 1px; font-weight: 300; }

@media (prefers-reduced-motion: reduce) {
  .mb-anim-ready { opacity: 1 !important; }
  .mb-anim-play  { animation: none !important; }
}
`;
}
