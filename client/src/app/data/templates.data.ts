import { CanvasBlock, BlockType } from '../store/builder.models';

export type TemplateCategory =
  | 'header'
  | 'footer'
  | 'cta'
  | 'cards'
  | 'forms'
  | 'features'
  | 'testimonials'
  | 'gallery';

export interface SectionTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  thumbnail: string; // CSS gradient string for preview
  blocks: CanvasBlock[]; // array of ready canvas blocks
}

export interface TemplateGroup {
  category: TemplateCategory;
  label: string;
  icon: string; // lucide icon name
  templates: SectionTemplate[];
}

export const TEMPLATE_GROUPS: TemplateGroup[] = [
  {
    category: 'header',
    label: 'Headers & Heroes',
    icon: 'layout',
    templates: [
      {
        id: 'h-modern-nav',
        name: 'Modern Navbar',
        category: 'header',
        thumbnail: 'linear-gradient(to right, #ffffff 0%, #f3f4f6 100%)',
        blocks: [
          {
            id: 'tpl-h1-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '16px 40px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '70px',
              borderBottom: '1px solid #e5e7eb',
              position: 'sticky',
              top: '0',
              zIndex: '100'
            },
            children: [
              {
                id: 'tpl-h1-child-1',
                type: 'heading',
                props: {
                  content: 'ApexStudio',
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#111827',
                  level: 'h3'
                }
              },
              {
                id: 'tpl-h1-child-2',
                type: 'text',
                props: {
                  content: 'Products    Features    Solutions    Pricing',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#4b5563',
                  letterSpacing: '0.05em'
                }
              },
              {
                id: 'tpl-h1-child-3',
                type: 'button',
                props: {
                  label: 'Get Started',
                  backgroundColor: '#4f6ef7',
                  color: '#ffffff',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'h-dark-nav',
        name: 'Dark Navbar',
        category: 'header',
        thumbnail: 'linear-gradient(to right, #0f172a 0%, #1e293b 100%)',
        blocks: [
          {
            id: 'tpl-h2-1',
            type: 'section',
            props: {
              backgroundColor: '#0f172a',
              padding: '16px 40px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '70px',
              borderBottom: '1px solid #1e293b',
              position: 'sticky',
              top: '0',
              zIndex: '100'
            },
            children: [
              {
                id: 'tpl-h2-child-1',
                type: 'heading',
                props: {
                  content: 'Novasphere',
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#ffffff',
                  level: 'h3'
                }
              },
              {
                id: 'tpl-h2-child-2',
                type: 'text',
                props: {
                  content: 'Overview    Docs    Guides    Support',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#94a3b8',
                  letterSpacing: '0.05em'
                }
              },
              {
                id: 'tpl-h2-child-3',
                type: 'button',
                props: {
                  label: 'Launch App',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'h-bold-hero',
        name: 'Hero Section - Bold',
        category: 'header',
        thumbnail: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        blocks: [
          {
            id: 'tpl-h3-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '100px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-h3-c1',
                type: 'heading',
                props: {
                  content: 'Build Something Amazing',
                  fontSize: '64px',
                  fontWeight: '800',
                  color: '#111827',
                  lineHeight: '1.1',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-h3-c2',
                type: 'text',
                props: {
                  content: 'Start your journey with our powerful, intuitive website builder. Everything you need to launch beautiful responsive websites faster than ever.',
                  fontSize: '20px',
                  color: '#6b7280',
                  margin: '20px 0px 30px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-h3-c3',
                type: 'button',
                props: {
                  label: 'Get Started Free',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'h-gradient-hero',
        name: 'Hero Section - Gradient',
        category: 'header',
        thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        blocks: [
          {
            id: 'tpl-h4-1',
            type: 'section',
            props: {
              gradientFrom: '#667eea',
              gradientTo: '#764ba2',
              padding: '120px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-h4-c1',
                type: 'heading',
                props: {
                  content: 'The Future of Visual Web Development',
                  fontSize: '56px',
                  fontWeight: '800',
                  color: '#ffffff',
                  lineHeight: '1.2',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-h4-c2',
                type: 'text',
                props: {
                  content: 'Streamline your collaborative workflows with cinematic visual components, ultra-clean code generation, and instant responsive web deployment.',
                  fontSize: '18px',
                  color: '#e2e8f0',
                  margin: '24px 0px 36px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-h4-c3',
                type: 'button',
                props: {
                  label: 'Start Trial Now',
                  backgroundColor: '#ffffff',
                  color: '#764ba2',
                  padding: '14px 32px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: '700'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'h-video-hero-dark',
        name: 'Video Hero - Dark Overlay',
        category: 'header',
        thumbnail: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
        blocks: [
          {
            id: 'tpl-v1-sec',
            type: 'section',
            props: {
              backgroundColor: '#111827',
              padding: '140px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              minHeight: '80vh',
              videoBackground: {
                enabled: true,
                type: 'youtube',
                youtubeUrl: 'https://www.youtube.com/watch?v=Ke1Y36Z-fD4',
                youtubeId: 'Ke1Y36Z-fD4',
                mp4Url: '',
                autoplay: true,
                loop: true,
                muted: true,
                startTime: 0,
                playbackSpeed: 1,
                overlayEnabled: true,
                overlayColor: '#000000',
                overlayOpacity: 65,
                overlayBlur: 0,
                fallbackImage: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200',
                mobileFallbackImage: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800'
              }
            },
            children: [
              {
                id: 'tpl-v1-c1',
                type: 'heading',
                props: {
                  content: 'A New Dimension of Web Design',
                  fontSize: '56px',
                  fontWeight: '800',
                  color: '#ffffff',
                  lineHeight: '1.2',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-v1-c2',
                type: 'text',
                props: {
                  content: 'Experience fully interactive cinematic page builds with high-performance YouTube and HTML5 local video backdrops.',
                  fontSize: '20px',
                  color: '#e2e8f0',
                  margin: '24px 0px 36px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-v1-c3',
                type: 'button',
                props: {
                  label: 'Explore Now',
                  backgroundColor: '#a855f7',
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: '700'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'h-video-cta-blur',
        name: 'Video CTA - Blur Overlay',
        category: 'header',
        thumbnail: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
        blocks: [
          {
            id: 'tpl-v2-sec',
            type: 'section',
            props: {
              backgroundColor: '#0f172a',
              padding: '100px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              videoBackground: {
                enabled: true,
                type: 'youtube',
                youtubeUrl: 'https://www.youtube.com/watch?v=Ke1Y36Z-fD4',
                youtubeId: 'Ke1Y36Z-fD4',
                mp4Url: '',
                autoplay: true,
                loop: true,
                muted: true,
                startTime: 0,
                playbackSpeed: 1,
                overlayEnabled: true,
                overlayColor: '#1e1b4b',
                overlayOpacity: 55,
                overlayBlur: 10,
                fallbackImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
                mobileFallbackImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
              }
            },
            children: [
              {
                id: 'tpl-v2-c1',
                type: 'heading',
                props: {
                  content: 'Ready to elevate your experience?',
                  fontSize: '44px',
                  fontWeight: '800',
                  color: '#ffffff',
                  lineHeight: '1.2',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-v2-c2',
                type: 'text',
                props: {
                  content: 'Join thousands of builders today and craft immersive cinematic environments in a couple of clicks.',
                  fontSize: '18px',
                  color: '#cbd5e1',
                  margin: '20px 0px 30px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-v2-c3',
                type: 'button',
                props: {
                  label: 'Get Started Free',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'h-video-feature',
        name: 'Video Feature Section',
        category: 'header',
        thumbnail: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        blocks: [
          {
            id: 'tpl-v3-sec',
            type: 'section',
            props: {
              backgroundColor: '#111827',
              padding: '100px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              videoBackground: {
                enabled: true,
                type: 'mp4',
                youtubeUrl: '',
                youtubeId: '',
                mp4Url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
                autoplay: true,
                loop: true,
                muted: true,
                startTime: 0,
                playbackSpeed: 1,
                overlayEnabled: true,
                overlayColor: '#111827',
                overlayOpacity: 70,
                overlayBlur: 5,
                fallbackImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
                mobileFallbackImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
              }
            },
            children: [
              {
                id: 'tpl-v3-c1',
                type: 'heading',
                props: {
                  content: 'Interactive Space Vibe',
                  fontSize: '48px',
                  fontWeight: '800',
                  color: '#10b981',
                  lineHeight: '1.2',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-v3-c2',
                type: 'text',
                props: {
                  content: 'High-performance video layers, fully responsive to screen size. Falling back strictly to image textures on mobile screens to save massive bandwidth.',
                  fontSize: '18px',
                  color: '#94a3b8',
                  margin: '20px 0px 30px',
                  textAlign: 'center'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'h-split-hero',
        name: 'Hero - Split Layout',
        category: 'header',
        thumbnail: 'linear-gradient(to right, #3b82f6 50%, #f3f4f6 50%)',
        blocks: [
          {
            id: 'tpl-h5-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'grid',
              gridColumns: '1fr 1fr',
              gap: '40px',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-h5-c1',
                type: 'heading',
                props: {
                  content: 'Enterprise Workspace Control',
                  fontSize: '48px',
                  fontWeight: '800',
                  color: '#111827'
                }
              },
              {
                id: 'tpl-h5-c2',
                type: 'text',
                props: {
                  content: 'Empower your teams to design, test, and publish production-grade landing sites. Integrate custom APIs, monitor activities in real-time, and scale dynamically.',
                  fontSize: '18px',
                  color: '#4b5563'
                }
              },
              {
                id: 'tpl-h5-c3',
                type: 'image',
                props: {
                  src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80',
                  alt: 'Dashboard Mockup',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'h-minimal-header',
        name: 'Minimal Header',
        category: 'header',
        thumbnail: 'linear-gradient(to right, #ffffff 0%, #ffffff 100%)',
        blocks: [
          {
            id: 'tpl-h6-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '20px 40px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid #f3f4f6'
            },
            children: [
              {
                id: 'tpl-h6-c1',
                type: 'heading',
                props: {
                  content: 'M I N I M A L',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  textAlign: 'center',
                  letterSpacing: '0.3em'
                }
              }
            ]
          }
        ]
      }
    ,
      {
        id: 'h-glassmorphism',
        name: 'Glassmorphism Header',
        category: 'header',
        thumbnail: 'rgba(255,255,255,0.1)',
        blocks: [
          {
            id: 'tpl-h-glassmorphism-1',
            type: 'section',
            props: {
          "backgroundColor": "rgba(255,255,255,0.1)",
          "padding": "20px",
          "borderBottom": "1px solid rgba(255,255,255,0.2)"
},
            children: [
          {
                    "id": "c-bikzni",
                    "type": "heading",
                    "props": {
                              "content": "Glass",
                              "fontSize": "24px",
                              "fontWeight": "800",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 'h-split',
        name: 'Split Hero',
        category: 'header',
        thumbnail: 'linear-gradient(45deg, #eee, #ddd)',
        blocks: [
          {
            id: 'tpl-h-split-1',
            type: 'section',
            props: {
          "display": "grid",
          "gridColumns": "60% 40%",
          "padding": "100px"
},
            children: [
          {
                    "id": "c-6i0zex",
                    "type": "heading",
                    "props": {
                              "content": "Split",
                              "fontSize": "48px",
                              "fontWeight": "800",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'h-anim-grad',
        name: 'Animated Gradient Hero',
        category: 'header',
        thumbnail: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb)',
        blocks: [
          {
            id: 'tpl-h-anim-grad-1',
            type: 'section',
            props: {
          "gradientFrom": "#667eea",
          "gradientTo": "#f093fb",
          "padding": "120px",
          "textAlign": "center"
},
            children: [
          {
                    "id": "c-mr4txb",
                    "type": "heading",
                    "props": {
                              "content": "Animated Gradient",
                              "fontSize": "56px",
                              "fontWeight": "800",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 'h-dark-tech',
        name: 'Dark Tech Header',
        category: 'header',
        thumbnail: '#050510',
        blocks: [
          {
            id: 'tpl-h-dark-tech-1',
            type: 'section',
            props: {
          "backgroundColor": "#050510",
          "padding": "80px",
          "textAlign": "center"
},
            children: [
          {
                    "id": "c-l8vvh2",
                    "type": "heading",
                    "props": {
                              "content": "Dark Tech",
                              "fontSize": "40px",
                              "fontWeight": "800",
                              "color": "#4f6ef7"
                    }
          }
]
          }
        ]
      },
      {
        id: 'h-minimal',
        name: 'Minimal Centered',
        category: 'header',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-h-minimal-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "100px",
          "textAlign": "center"
},
            children: [
          {
                    "id": "c-qg4igg",
                    "type": "heading",
                    "props": {
                              "content": "Minimal",
                              "fontSize": "80px",
                              "fontWeight": "800",
                              "color": "#000"
                    }
          }
]
          }
        ]
      }
    ]
  },
  {
    category: 'footer',
    label: 'Footers',
    icon: 'layout',
    templates: [
      {
        id: 'f-simple',
        name: 'Simple Footer',
        category: 'footer',
        thumbnail: '#111827',
        blocks: [
          {
            id: 'tpl-f1-1',
            type: 'section',
            props: {
              backgroundColor: '#111827',
              padding: '60px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-f1-c1',
                type: 'heading',
                props: {
                  content: 'ApexStudio',
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#ffffff',
                  level: 'h4'
                }
              },
              {
                id: 'tpl-f1-c2',
                type: 'text',
                props: {
                  content: 'Innovative visual software solutions for digital creatives.',
                  fontSize: '14px',
                  color: '#9ca3af',
                  margin: '10px 0px 20px'
                }
              },
              {
                id: 'tpl-f1-c3',
                type: 'text',
                props: {
                  content: '© 2026 ApexStudio Inc. All rights reserved. Privacy Policy  •  Terms of Service',
                  fontSize: '12px',
                  color: '#6b7280'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'f-columns',
        name: 'Footer with Columns',
        category: 'footer',
        thumbnail: '#1f2937',
        blocks: [
          {
            id: 'tpl-f2-1',
            type: 'section',
            props: {
              backgroundColor: '#111827',
              padding: '80px 40px 40px',
              width: '100%',
              display: 'grid',
              gridColumns: '2fr 1fr 1fr 1fr',
              gap: '40px'
            },
            children: [
              {
                id: 'tpl-f2-c1',
                type: 'heading',
                props: {
                  content: 'Novasphere',
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#ffffff'
                }
              },
              {
                id: 'tpl-f2-c2',
                type: 'text',
                props: {
                  content: 'Building the foundational block layer of the decentralized visual web.',
                  fontSize: '14px',
                  color: '#9ca3af'
                }
              },
              {
                id: 'tpl-f2-c3',
                type: 'text',
                props: {
                  content: 'PRODUCTS\nWeb Builder\nAnalytics\nCMS Cloud\nAPI Hub',
                  fontSize: '14px',
                  color: '#d1d5db',
                  lineHeight: '2.0'
                }
              },
              {
                id: 'tpl-f2-c4',
                type: 'text',
                props: {
                  content: 'COMPANY\nAbout Us\nCareers\nPress Kit\nContact Sales',
                  fontSize: '14px',
                  color: '#d1d5db',
                  lineHeight: '2.0'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'f-gradient',
        name: 'Gradient Footer',
        category: 'footer',
        thumbnail: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        blocks: [
          {
            id: 'tpl-f3-1',
            type: 'section',
            props: {
              gradientFrom: '#1e1b4b',
              gradientTo: '#312e81',
              padding: '60px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-f3-c1',
                type: 'heading',
                props: {
                  content: 'Unlock Your Visual Superpowers',
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#ffffff'
                }
              },
              {
                id: 'tpl-f3-c2',
                type: 'text',
                props: {
                  content: 'Get weekly tips on website layout, high-converting UX designs, and clean code architectures.',
                  fontSize: '14px',
                  color: '#c7d2fe',
                  margin: '12px 0px 20px'
                }
              },
              {
                id: 'tpl-f3-c3',
                type: 'button',
                props: {
                  label: 'Subscribe to Newsletter',
                  backgroundColor: '#818cf8',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '20px'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'f-minimal',
        name: 'Minimal Footer',
        category: 'footer',
        thumbnail: '#f9fafb',
        blocks: [
          {
            id: 'tpl-f4-1',
            type: 'section',
            props: {
              backgroundColor: '#f9fafb',
              padding: '30px 40px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #e5e7eb'
            },
            children: [
              {
                id: 'tpl-f4-c1',
                type: 'text',
                props: {
                  content: '© 2026 MyBrand Corp.',
                  fontSize: '14px',
                  color: '#9ca3af'
                }
              },
              {
                id: 'tpl-f4-c2',
                type: 'text',
                props: {
                  content: 'Support  •  Privacy  •  Status',
                  fontSize: '14px',
                  color: '#6b7280'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'f-newsletter',
        name: 'Footer with Newsletter',
        category: 'footer',
        thumbnail: '#0f172a',
        blocks: [
          {
            id: 'tpl-f5-1',
            type: 'section',
            props: {
              backgroundColor: '#0f172a',
              padding: '80px 40px 40px',
              width: '100%'
            },
            children: [
              {
                id: 'tpl-f5-c1',
                type: 'heading',
                props: {
                  content: 'Stay connected for exclusive insights',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ffffff',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-f5-c2',
                type: 'text',
                props: {
                  content: 'Subscribe to get release updates, security briefs, and community workshops.',
                  fontSize: '14px',
                  color: '#94a3b8',
                  textAlign: 'center',
                  margin: '10px 0px 30px'
                }
              }
            ]
          }
        ]
      }
    ,
      {
        id: 'f-mega',
        name: 'Mega Footer',
        category: 'footer',
        thumbnail: '#111827',
        blocks: [
          {
            id: 'tpl-f-mega-1',
            type: 'section',
            props: {
          "backgroundColor": "#111827",
          "padding": "60px",
          "display": "grid",
          "gridColumns": "1fr 1fr 1fr 1fr 1fr"
},
            children: [
          {
                    "id": "c-kdo96f",
                    "type": "heading",
                    "props": {
                              "content": "Mega Footer",
                              "fontSize": "20px",
                              "fontWeight": "700",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 'f-grad',
        name: 'Gradient Footer',
        category: 'footer',
        thumbnail: 'linear-gradient(135deg, #667eea, #764ba2)',
        blocks: [
          {
            id: 'tpl-f-grad-1',
            type: 'section',
            props: {
          "gradientFrom": "#667eea",
          "gradientTo": "#764ba2",
          "padding": "40px",
          "display": "grid",
          "gridColumns": "1fr 1fr 1fr"
},
            children: [
          {
                    "id": "c-gfotyi",
                    "type": "heading",
                    "props": {
                              "content": "Gradient Footer",
                              "fontSize": "20px",
                              "fontWeight": "700",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 'f-min-light',
        name: 'Minimal Light Footer',
        category: 'footer',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-f-min-light-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "borderTop": "1px solid #e5e7eb",
          "padding": "20px"
},
            children: [
          {
                    "id": "c-1gjb6h",
                    "type": "text",
                    "props": {
                              "content": "Minimal Footer",
                              "fontSize": "14px",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'f-app',
        name: 'App Footer',
        category: 'footer',
        thumbnail: '#0f172a',
        blocks: [
          {
            id: 'tpl-f-app-1',
            type: 'section',
            props: {
          "backgroundColor": "#0f172a",
          "padding": "40px",
          "textAlign": "center"
},
            children: [
          {
                    "id": "c-mcxkd8",
                    "type": "heading",
                    "props": {
                              "content": "App Footer",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 'f-map',
        name: 'Footer with Map',
        category: 'footer',
        thumbnail: '#f9fafb',
        blocks: [
          {
            id: 'tpl-f-map-1',
            type: 'section',
            props: {
          "backgroundColor": "#f9fafb",
          "padding": "60px",
          "display": "grid",
          "gridColumns": "1fr 1fr"
},
            children: [
          {
                    "id": "c-0k005i",
                    "type": "heading",
                    "props": {
                              "content": "Footer with Map",
                              "fontSize": "20px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      }
    ]
  },
  {
    category: 'cta',
    label: 'Call to Actions',
    icon: 'mouse-pointer-click',
    templates: [
      {
        id: 'cta-simple',
        name: 'Simple CTA',
        category: 'cta',
        thumbnail: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        blocks: [
          {
            id: 'tpl-cta1-1',
            type: 'section',
            props: {
              backgroundColor: '#f8faff',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-cta1-c1',
                type: 'heading',
                props: {
                  content: 'Ready to Get Started?',
                  fontSize: '42px',
                  fontWeight: '800',
                  color: '#1e3a8a',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cta1-c2',
                type: 'text',
                props: {
                  content: 'Join thousands of professional developers and designers already building high-performance responsive web products with ApexStudio.',
                  fontSize: '16px',
                  color: '#4b5563',
                  margin: '15px 0px 24px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cta1-c3',
                type: 'button',
                props: {
                  label: 'Start Free Trial Now',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: '700'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cta-dark-banner',
        name: 'Dark CTA Banner',
        category: 'cta',
        thumbnail: '#1e1b4b',
        blocks: [
          {
            id: 'tpl-cta2-1',
            type: 'section',
            props: {
              backgroundColor: '#1e1b4b',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-cta2-c1',
                type: 'heading',
                props: {
                  content: 'Accelerate Your Visual Pipeline',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#ffffff',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cta2-c2',
                type: 'text',
                props: {
                  content: 'Design layouts, export production-grade code bundles, and deploy immediately without server configuration overhead.',
                  fontSize: '16px',
                  color: '#c7d2fe',
                  margin: '16px 0px 24px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cta2-c3',
                type: 'button',
                props: {
                  label: 'Schedule a Demo',
                  backgroundColor: '#a78bfa',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cta-gradient',
        name: 'Gradient CTA',
        category: 'cta',
        thumbnail: 'linear-gradient(135deg, #4f6ef7 0%, #7c3aed 100%)',
        blocks: [
          {
            id: 'tpl-cta3-1',
            type: 'section',
            props: {
              gradientFrom: '#4f6ef7',
              gradientTo: '#7c3aed',
              padding: '100px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-cta3-c1',
                type: 'heading',
                props: {
                  content: 'Start Building Cinematic Experiences',
                  fontSize: '44px',
                  fontWeight: '800',
                  color: '#ffffff',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cta3-c2',
                type: 'text',
                props: {
                  content: 'Experience smooth interactions, premium glassmorphism themes, and lightning-fast loading speeds.',
                  fontSize: '16px',
                  color: '#f3e8ff',
                  margin: '16px 0px 30px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cta3-c3',
                type: 'button',
                props: {
                  label: 'Launch Free Builder',
                  backgroundColor: '#ffffff',
                  color: '#4f6ef7',
                  padding: '14px 32px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: '700'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cta-email-input',
        name: 'CTA with Email Input',
        category: 'cta',
        thumbnail: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        blocks: [
          {
            id: 'tpl-cta4-1',
            type: 'section',
            props: {
              backgroundColor: '#f0fdf4',
              padding: '60px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-cta4-c1',
                type: 'heading',
                props: {
                  content: 'Get the Latest Updates First',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#14532d',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cta4-c2',
                type: 'text',
                props: {
                  content: 'No spam. Unsubscribe at any time. Get a free interactive template book when you subscribe today.',
                  fontSize: '15px',
                  color: '#166534',
                  margin: '12px 0px 24px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cta4-c3',
                type: 'button',
                props: {
                  label: 'Join 50K+ Readers',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '8px'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cta-split',
        name: 'Split CTA',
        category: 'cta',
        thumbnail: 'linear-gradient(to right, #fafafa 50%, #ffffff 50%)',
        blocks: [
          {
            id: 'tpl-cta5-1',
            type: 'section',
            props: {
              backgroundColor: '#fafafa',
              padding: '80px 40px',
              width: '100%',
              display: 'grid',
              gridColumns: '1.5fr 1fr',
              gap: '40px',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-cta5-c1',
                type: 'heading',
                props: {
                  content: 'Ready to integrate visual control in your business?',
                  fontSize: '38px',
                  fontWeight: '800',
                  color: '#111827'
                }
              },
              {
                id: 'tpl-cta5-c2',
                type: 'text',
                props: {
                  content: 'Talk to our visual architecture engineering team to build custom blocks suited directly for your organization’s design standards.',
                  fontSize: '16px',
                  color: '#4b5563'
                }
              },
              {
                id: 'tpl-cta5-c3',
                type: 'button',
                props: {
                  label: 'Contact Enterprise Sales',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '8px'
                }
              }
            ]
          }
        ]
      }
    ,
      {
        id: 'cta-grad',
        name: 'Gradient CTA Banner',
        category: 'cta',
        thumbnail: 'linear-gradient(90deg, #4f6ef7, #7c3aed)',
        blocks: [
          {
            id: 'tpl-cta-grad-1',
            type: 'section',
            props: {
          "gradientFrom": "#4f6ef7",
          "gradientTo": "#7c3aed",
          "padding": "60px",
          "display": "flex",
          "justifyContent": "space-between"
},
            children: [
          {
                    "id": "c-6r23tj",
                    "type": "heading",
                    "props": {
                              "content": "Gradient CTA",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 'cta-float',
        name: 'Floating CTA Card',
        category: 'cta',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-cta-float-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "60px 80px",
          "borderRadius": "24px",
          "margin": "40px",
          "textAlign": "center"
},
            children: [
          {
                    "id": "c-kiz1wl",
                    "type": "heading",
                    "props": {
                              "content": "Floating CTA",
                              "fontSize": "36px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'cta-dark-urg',
        name: 'Dark Urgency CTA',
        category: 'cta',
        thumbnail: '#0f172a',
        blocks: [
          {
            id: 'tpl-cta-dark-urg-1',
            type: 'section',
            props: {
          "backgroundColor": "#0f172a",
          "padding": "60px",
          "textAlign": "center"
},
            children: [
          {
                    "id": "c-armqeb",
                    "type": "heading",
                    "props": {
                              "content": "Urgency CTA",
                              "fontSize": "40px",
                              "fontWeight": "800",
                              "color": "#ef4444"
                    }
          }
]
          }
        ]
      },
      {
        id: 'cta-two-col',
        name: 'Two Column CTA',
        category: 'cta',
        thumbnail: '#f8faff',
        blocks: [
          {
            id: 'tpl-cta-two-col-1',
            type: 'section',
            props: {
          "backgroundColor": "#f8faff",
          "padding": "80px",
          "display": "grid",
          "gridColumns": "1fr 1fr"
},
            children: [
          {
                    "id": "c-bwxba2",
                    "type": "heading",
                    "props": {
                              "content": "Two Column CTA",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'cta-vid',
        name: 'Video CTA',
        category: 'cta',
        thumbnail: '#111',
        blocks: [
          {
            id: 'tpl-cta-vid-1',
            type: 'section',
            props: {
          "backgroundColor": "#111",
          "padding": "100px",
          "textAlign": "center"
},
            children: [
          {
                    "id": "c-uw3d4q",
                    "type": "heading",
                    "props": {
                              "content": "Watch how it works",
                              "fontSize": "40px",
                              "fontWeight": "800",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      }
    ]
  },
  {
    category: 'cards',
    label: 'Cards & Pricing',
    icon: 'credit-card',
    templates: [
      {
        id: 'cards-features-3col',
        name: 'Feature Cards - 3 Col',
        category: 'cards',
        thumbnail: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
        blocks: [
          {
            id: 'tpl-cards1-1',
            type: 'section',
            props: {
              backgroundColor: '#f8fafc',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-cards1-c1',
                type: 'heading',
                props: {
                  content: 'Crafted for Scalability & Velocity',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cards1-c2',
                type: 'text',
                props: {
                  content: 'Experience visual development built directly on cutting-edge engineering primitives.',
                  fontSize: '16px',
                  color: '#4b5563',
                  margin: '10px 0px 40px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cards1-c3',
                type: 'card',
                props: {
                  cardTitle: 'Lightning Fast CDN Delivery',
                  cardText: 'All websites are fully compiled, optimized, and delivered via global high-velocity edge node pipelines with instant cache invalidation.',
                  cardButtonText: 'Learn More'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cards-pricing-3plans',
        name: 'Pricing Cards - 3 Plans',
        category: 'cards',
        thumbnail: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        blocks: [
          {
            id: 'tpl-cards2-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '100px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-cards2-c1',
                type: 'heading',
                props: {
                  content: 'Simple, Transparent Pricing Plans',
                  fontSize: '38px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cards2-c2',
                type: 'text',
                props: {
                  content: 'Choose the visual engineering plan that matches your current development scope.',
                  fontSize: '16px',
                  color: '#4b5563',
                  margin: '10px 0px 50px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cards2-c3',
                type: 'card',
                props: {
                  cardTitle: 'Pro Plan — $29/mo',
                  cardText: 'Access unlimited responsive pages, collaborative visual workspaces, custom domains, 24/7 priority support, and advanced site compilation exports.',
                  cardButtonText: 'Choose Pro Plan',
                  border: '2px solid #3b82f6',
                  shadow: '0 20px 25px -5px rgba(59, 130, 246, 0.15)'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cards-team',
        name: 'Team Cards',
        category: 'cards',
        thumbnail: '#f3f4f6',
        blocks: [
          {
            id: 'tpl-cards3-1',
            type: 'section',
            props: {
              backgroundColor: '#f9fafb',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-cards3-c1',
                type: 'heading',
                props: {
                  content: 'Meet the Visual Architects',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cards3-c2',
                type: 'text',
                props: {
                  content: 'The digital thinkers and creators pushing the envelope of visual code generation.',
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '10px 0px 40px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cards3-c3',
                type: 'card',
                props: {
                  cardTitle: 'Kishore, Founder & Architect',
                  cardText: 'Leading product vision, real-time collaboration engines, and compiling core layout strategies for high-performance visual development systems.',
                  cardButtonText: 'View Portfolio'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cards-testimonials',
        name: 'Testimonial Cards',
        category: 'cards',
        thumbnail: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
        blocks: [
          {
            id: 'tpl-cards4-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-cards4-c1',
                type: 'heading',
                props: {
                  content: 'Trusted by High-Velocity Creators',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cards4-c2',
                type: 'text',
                props: {
                  content: 'See how digital agencies are delivering client work 5x faster using our builder framework.',
                  fontSize: '16px',
                  color: '#4b5563',
                  margin: '10px 0px 40px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cards4-c3',
                type: 'card',
                props: {
                  cardTitle: '★★★★★ "Game Changing UX"',
                  cardText: 'The real-time collaboration with Socket.io makes workspace editing smooth. The custom glassmorphism design presets saved us weeks of custom styling.',
                  cardButtonText: 'Read Full Story'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cards-blog-posts',
        name: 'Blog Post Cards',
        category: 'cards',
        thumbnail: 'linear-gradient(to bottom, #f1f5f9, #ffffff)',
        blocks: [
          {
            id: 'tpl-cards5-1',
            type: 'section',
            props: {
              backgroundColor: '#f8fafc',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-cards5-c1',
                type: 'heading',
                props: {
                  content: 'Latest Visual Engineering Design Logs',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cards5-c2',
                type: 'card',
                props: {
                  cardTitle: 'Responsive Layout Tips',
                  cardText: 'Mastering flex layouts, CSS variables, and layout compilations to build websites that look cinematic on mobile and 4K displays alike.',
                  cardButtonText: 'Read Design Log'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'cards-stats',
        name: 'Stats Cards',
        category: 'cards',
        thumbnail: 'linear-gradient(to right, #4f6ef7 0%, #10b981 100%)',
        blocks: [
          {
            id: 'tpl-cards6-1',
            type: 'section',
            props: {
              backgroundColor: '#0f172a',
              padding: '60px 40px',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-cards6-c1',
                type: 'heading',
                props: {
                  content: '99.9%',
                  fontSize: '48px',
                  fontWeight: '800',
                  color: '#10b981',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-cards6-c2',
                type: 'text',
                props: {
                  content: 'Uptime SLA Guarantee',
                  fontSize: '14px',
                  color: '#94a3b8',
                  textAlign: 'center'
                }
              }
            ]
          }
        ]
      }
    ,
      {
        id: 'c-glass',
        name: 'Glassmorphism Cards',
        category: 'cards',
        thumbnail: 'rgba(255,255,255,0.1)',
        blocks: [
          {
            id: 'tpl-c-glass-1',
            type: 'section',
            props: {
          "backgroundColor": "rgba(255,255,255,0.1)",
          "padding": "40px",
          "display": "grid",
          "gridColumns": "1fr 1fr 1fr"
},
            children: [
          {
                    "id": "c-ij9vl0",
                    "type": "heading",
                    "props": {
                              "content": "Glass Cards",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 'c-horiz',
        name: 'Horizontal Feature Cards',
        category: 'cards',
        thumbnail: '#f9fafb',
        blocks: [
          {
            id: 'tpl-c-horiz-1',
            type: 'section',
            props: {
          "backgroundColor": "#f9fafb",
          "padding": "40px",
          "display": "flex",
          "flexDirection": "column"
},
            children: [
          {
                    "id": "c-vy1g6x",
                    "type": "heading",
                    "props": {
                              "content": "Horizontal Cards",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'c-num',
        name: 'Numbered Steps Cards',
        category: 'cards',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-c-num-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "40px",
          "display": "grid",
          "gridColumns": "1fr 1fr 1fr 1fr"
},
            children: [
          {
                    "id": "c-9oucca",
                    "type": "heading",
                    "props": {
                              "content": "Steps Cards",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'c-comp',
        name: 'Comparison Table Card',
        category: 'cards',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-c-comp-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "40px",
          "display": "grid",
          "gridColumns": "1fr 1fr"
},
            children: [
          {
                    "id": "c-s7fxzl",
                    "type": "heading",
                    "props": {
                              "content": "Comparison Cards",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'c-img-grid',
        name: 'Image Cards Grid',
        category: 'cards',
        thumbnail: '#f3f4f6',
        blocks: [
          {
            id: 'tpl-c-img-grid-1',
            type: 'section',
            props: {
          "backgroundColor": "#f3f4f6",
          "padding": "40px",
          "display": "grid",
          "gridColumns": "1fr 1fr 1fr"
},
            children: [
          {
                    "id": "c-6e4bwd",
                    "type": "heading",
                    "props": {
                              "content": "Image Grid",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      }
    ]
  },
  {
    category: 'forms',
    label: 'Forms & Input',
    icon: 'form-input',
    templates: [
      {
        id: 'forms-contact-simple',
        name: 'Simple Contact Form',
        category: 'forms',
        thumbnail: '#ffffff',
        blocks: [
          {
            id: 'tpl-forms1-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-forms1-c1',
                type: 'heading',
                props: {
                  content: 'Get in Touch',
                  fontSize: '38px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-forms1-c2',
                type: 'text',
                props: {
                  content: 'Our visual design and integration team usually responds within 2-4 business hours.',
                  fontSize: '16px',
                  color: '#4b5563',
                  margin: '10px 0px 40px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-forms1-c3',
                type: 'form',
                props: {
                  cardTitle: 'Send a Message',
                  cardText: 'Submit details and we will schedule an onboarding layout tutorial.',
                  cardButtonText: 'Send Email'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'forms-contact-info',
        name: 'Contact with Info',
        category: 'forms',
        thumbnail: 'linear-gradient(to right, #f3f4f6 50%, #ffffff 50%)',
        blocks: [
          {
            id: 'tpl-forms2-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'grid',
              gridColumns: '1fr 1.2fr',
              gap: '40px',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-forms2-c1',
                type: 'heading',
                props: {
                  content: 'How Can We Support You?',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#111827'
                }
              },
              {
                id: 'tpl-forms2-c2',
                type: 'text',
                props: {
                  content: '📍 HQ Address: 246 Visual Boulevard, Suite 500, California\n📞 Phone: +1 (555) 234-5678\n✉️ Email: support@apexstudio.io',
                  fontSize: '15px',
                  color: '#4b5563',
                  lineHeight: '2.0'
                }
              },
              {
                id: 'tpl-forms2-c3',
                type: 'form',
                props: {
                  cardTitle: 'Contact Our Visual Helpdesk',
                  cardButtonText: 'Submit Query'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'forms-newsletter-signup',
        name: 'Newsletter Signup',
        category: 'forms',
        thumbnail: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        blocks: [
          {
            id: 'tpl-forms3-1',
            type: 'section',
            props: {
              backgroundColor: '#f8fafc',
              padding: '60px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-forms3-c1',
                type: 'heading',
                props: {
                  content: 'Stay in the Loop',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#1e293b',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-forms3-c2',
                type: 'text',
                props: {
                  content: 'No spam. Unsubscribe at any time. Get a free interactive template book when you subscribe today.',
                  fontSize: '15px',
                  color: '#475569',
                  margin: '10px 0px 20px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-forms3-c3',
                type: 'input',
                props: {
                  placeholder: 'your.name@company.com',
                  width: '320px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'forms-full-page',
        name: 'Full Contact Page',
        category: 'forms',
        thumbnail: 'linear-gradient(to bottom, #ffffff, #f1f5f9)',
        blocks: [
          {
            id: 'tpl-forms4-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-forms4-c1',
                type: 'heading',
                props: {
                  content: 'Locate & Contact Us',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-forms4-c2',
                type: 'map',
                props: {
                  address: 'San Francisco, CA',
                  zoom: 13,
                  width: '100%',
                  height: '300px',
                  borderRadius: '12px',
                  margin: '20px 0px 30px'
                }
              },
              {
                id: 'tpl-forms4-c3',
                type: 'form',
                props: {
                  cardTitle: 'Send a Message directly to our HQ Support Team',
                  cardButtonText: 'Send Location Request'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'forms-minimal-sub',
        name: 'Minimal Subscribe',
        category: 'forms',
        thumbnail: '#ffffff',
        blocks: [
          {
            id: 'tpl-forms5-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '30px 40px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #e5e7eb',
              borderBottom: '1px solid #e5e7eb'
            },
            children: [
              {
                id: 'tpl-forms5-c1',
                type: 'heading',
                props: {
                  content: 'Subscribe to updates',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827'
                }
              },
              {
                id: 'tpl-forms5-c2',
                type: 'input',
                props: {
                  placeholder: 'email@domain.com',
                  width: '260px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }
              }
            ]
          }
        ]
      }
    ,
      {
        id: 'fm-multi',
        name: 'Multi-Step Form',
        category: 'forms',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-fm-multi-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "40px"
},
            children: [
          {
                    "id": "c-hcaivb",
                    "type": "heading",
                    "props": {
                              "content": "Multi-Step Form",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'fm-login',
        name: 'Login Form Card',
        category: 'forms',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-fm-login-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "40px",
          "textAlign": "center"
},
            children: [
          {
                    "id": "c-72sw4p",
                    "type": "heading",
                    "props": {
                              "content": "Login Form",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'fm-survey',
        name: 'Survey Form',
        category: 'forms',
        thumbnail: '#f9fafb',
        blocks: [
          {
            id: 'tpl-fm-survey-1',
            type: 'section',
            props: {
          "backgroundColor": "#f9fafb",
          "padding": "40px"
},
            children: [
          {
                    "id": "c-7rlslt",
                    "type": "heading",
                    "props": {
                              "content": "Survey Form",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'fm-book',
        name: 'Booking Form',
        category: 'forms',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-fm-book-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "40px"
},
            children: [
          {
                    "id": "c-e3nhbq",
                    "type": "heading",
                    "props": {
                              "content": "Booking Form",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'fm-feed',
        name: 'Feedback Form',
        category: 'forms',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-fm-feed-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "40px"
},
            children: [
          {
                    "id": "c-suw4pa",
                    "type": "heading",
                    "props": {
                              "content": "Feedback Form",
                              "fontSize": "24px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      }
    ]
  },
  {
    category: 'features',
    label: 'Features & About',
    icon: 'smile',
    templates: [
      {
        id: 'feat-grid',
        name: 'Features Grid',
        category: 'features',
        thumbnail: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
        blocks: [
          {
            id: 'tpl-feat1-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-feat1-c1',
                type: 'heading',
                props: {
                  content: 'Engineered for Performance',
                  fontSize: '38px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-feat1-c2',
                type: 'text',
                props: {
                  content: 'ApexStudio combines robust design systems with cinematic UI options to build stunning modern websites.',
                  fontSize: '16px',
                  color: '#4b5563',
                  margin: '10px 0px 50px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-feat1-c3',
                type: 'card',
                props: {
                  cardTitle: '100% Core Signal Engine',
                  cardText: 'Powered by highly optimized state management, ensuring lightning-fast layout render speeds and zero compilation lag.',
                  cardButtonText: 'Explore Signals Technology'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'feat-about-split',
        name: 'About Split',
        category: 'features',
        thumbnail: 'linear-gradient(to right, #f1f5f9 50%, #ffffff 50%)',
        blocks: [
          {
            id: 'tpl-feat2-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'grid',
              gridColumns: '1fr 1.2fr',
              gap: '40px',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-feat2-c1',
                type: 'image',
                props: {
                  src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
                  alt: 'Team Collaboration',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }
              },
              {
                id: 'tpl-feat2-c2',
                type: 'heading',
                props: {
                  content: 'Our Core Visual Design Philosophy',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#111827'
                }
              },
              {
                id: 'tpl-feat2-c3',
                type: 'text',
                props: {
                  content: 'We believe that visual website development should be simple, collaborative, and incredibly premium. We design tokens, themes, and layouts that prioritize visual layout clarity above all else.',
                  fontSize: '16px',
                  color: '#4b5563'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'feat-how-works',
        name: 'How It Works',
        category: 'features',
        thumbnail: '#ffffff',
        blocks: [
          {
            id: 'tpl-feat3-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-feat3-c1',
                type: 'heading',
                props: {
                  content: 'Three Steps to Launch',
                  fontSize: '38px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-feat3-c2',
                type: 'text',
                props: {
                  content: '1. Select pre-built visual templates  •  2. Edit styles dynamically in the sidebars  •  3. Deploy code with a single click.',
                  fontSize: '16px',
                  color: '#4b5563',
                  margin: '12px 0px 30px',
                  textAlign: 'center'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'feat-alternating',
        name: 'Features - Alternating',
        category: 'features',
        thumbnail: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)',
        blocks: [
          {
            id: 'tpl-feat4-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '60px 40px',
              width: '100%',
              display: 'grid',
              gridColumns: '1fr 1fr',
              gap: '40px',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-feat4-c1',
                type: 'heading',
                props: {
                  content: 'Dynamic State Editing',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827'
                }
              },
              {
                id: 'tpl-feat4-c2',
                type: 'text',
                props: {
                  content: 'Easily track component selections, adjust spacing tokens, and preview high-end glassmorphism styling presets in real time.',
                  fontSize: '16px',
                  color: '#4b5563'
                }
              },
              {
                id: 'tpl-feat4-c3',
                type: 'image',
                props: {
                  src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
                  alt: 'Analytics Mockup',
                  borderRadius: '12px'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'feat-social-proof',
        name: 'Stats / Social Proof',
        category: 'features',
        thumbnail: '#111827',
        blocks: [
          {
            id: 'tpl-feat5-1',
            type: 'section',
            props: {
              backgroundColor: '#111827',
              padding: '60px 40px',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-feat5-c1',
                type: 'heading',
                props: {
                  content: '500+ Clients',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#ffffff',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-feat5-c2',
                type: 'heading',
                props: {
                  content: '99.9% Uptime',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#60a5fa',
                  textAlign: 'center'
                }
              }
            ]
          }
        ]
      }
    ,
      {
        id: 'ft-bento',
        name: 'Bento Grid Features',
        category: 'features',
        thumbnail: '#0f172a',
        blocks: [
          {
            id: 'tpl-ft-bento-1',
            type: 'section',
            props: {
          "backgroundColor": "#0f172a",
          "padding": "40px",
          "display": "grid"
},
            children: [
          {
                    "id": "c-12ksxd",
                    "type": "heading",
                    "props": {
                              "content": "Bento Grid",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 'ft-shot',
        name: 'Feature with Screenshot',
        category: 'features',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-ft-shot-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "60px",
          "display": "grid",
          "gridColumns": "1fr 1fr"
},
            children: [
          {
                    "id": "c-c08xcq",
                    "type": "heading",
                    "props": {
                              "content": "Screenshot Feature",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'ft-row',
        name: 'Icon Feature Row',
        category: 'features',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-ft-row-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "60px",
          "display": "flex"
},
            children: [
          {
                    "id": "c-5a3grg",
                    "type": "heading",
                    "props": {
                              "content": "Icon Row",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'ft-comp',
        name: 'Feature Comparison',
        category: 'features',
        thumbnail: '#f9fafb',
        blocks: [
          {
            id: 'tpl-ft-comp-1',
            type: 'section',
            props: {
          "backgroundColor": "#f9fafb",
          "padding": "60px"
},
            children: [
          {
                    "id": "c-t55dbj",
                    "type": "heading",
                    "props": {
                              "content": "Comparison Feature",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'ft-time',
        name: 'Timeline Features',
        category: 'features',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-ft-time-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "60px",
          "display": "flex",
          "flexDirection": "column"
},
            children: [
          {
                    "id": "c-318s31",
                    "type": "heading",
                    "props": {
                              "content": "Timeline Feature",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      }
    ]
  },
  {
    category: 'testimonials',
    label: 'Testimonials',
    icon: 'smile',
    templates: [
      {
        id: 'test-quote-slider',
        name: 'Quote Slider Style',
        category: 'testimonials',
        thumbnail: '#f8fafc',
        blocks: [
          {
            id: 'tpl-test1-1',
            type: 'section',
            props: {
              backgroundColor: '#f8fafc',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-test1-c1',
                type: 'heading',
                props: {
                  content: '“ The absolute best visual code generator we have ever tested. Outstanding design preset capabilities! ”',
                  fontSize: '26px',
                  fontWeight: '600',
                  color: '#1e293b',
                  textAlign: 'center',
                  lineHeight: '1.4'
                }
              },
              {
                id: 'tpl-test1-c2',
                type: 'text',
                props: {
                  content: 'Sarah Jenkins, Creative Director at Novasphere Studio',
                  fontSize: '15px',
                  color: '#64748b',
                  margin: '16px 0px 0px',
                  textAlign: 'center'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'test-grid',
        name: 'Testimonial Grid',
        category: 'testimonials',
        thumbnail: 'linear-gradient(to bottom, #ffffff, #f1f5f9)',
        blocks: [
          {
            id: 'tpl-test2-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-test2-c1',
                type: 'heading',
                props: {
                  content: 'Highly Rated by Digital Teams',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-test2-c2',
                type: 'card',
                props: {
                  cardTitle: '★★★★★ "Excellent Real-time Engine"',
                  cardText: 'Creating page layouts with pre-built section presets saves our agency over 40 hours of frontend styling every week. Highly recommended!',
                  cardButtonText: 'Read Full Customer Log'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'test-logo-wall',
        name: 'Logo Wall',
        category: 'testimonials',
        thumbnail: '#ffffff',
        blocks: [
          {
            id: 'tpl-test3-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '40px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderTop: '1px solid #f3f4f6',
              borderBottom: '1px solid #f3f4f6'
            },
            children: [
              {
                id: 'tpl-test3-c1',
                type: 'text',
                props: {
                  content: 'TRUSTED BY LEADERS AT:    GOOGLE  •  VERCEL  •  MICROSOFT  •  NETFLIX',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#9ca3af',
                  letterSpacing: '0.2em',
                  textAlign: 'center'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'test-video',
        name: 'Video Testimonials',
        category: 'testimonials',
        thumbnail: '#1e293b',
        blocks: [
          {
            id: 'tpl-test4-1',
            type: 'section',
            props: {
              backgroundColor: '#0f172a',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-test4-c1',
                type: 'heading',
                props: {
                  content: 'Watch Our Customer Journey Logs',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#ffffff',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-test4-c2',
                type: 'video',
                props: {
                  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                  width: '640px',
                  height: '360px',
                  borderRadius: '12px',
                  margin: '20px 0px 0px'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'test-full-width',
        name: 'Full Width Quote',
        category: 'testimonials',
        thumbnail: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        blocks: [
          {
            id: 'tpl-test5-1',
            type: 'section',
            props: {
              backgroundColor: '#111827',
              padding: '100px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-test5-c1',
                type: 'heading',
                props: {
                  content: '“ We scaled our collaborative landing site deployments globally in under 24 hours. The visual builder compiles pristine CSS structures. ”',
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#ffffff',
                  textAlign: 'center',
                  lineHeight: '1.4'
                }
              },
              {
                id: 'tpl-test5-c2',
                type: 'text',
                props: {
                  content: 'Marc Anderson, Head of Web at DevSphere Cloud',
                  fontSize: '14px',
                  color: '#9ca3af',
                  margin: '16px 0px 0px',
                  textAlign: 'center'
                }
              }
            ]
          }
        ]
      }
    ,
      {
        id: 't-vid',
        name: 'Video Testimonials Grid',
        category: 'testimonials',
        thumbnail: '#111',
        blocks: [
          {
            id: 'tpl-t-vid-1',
            type: 'section',
            props: {
          "backgroundColor": "#111",
          "padding": "60px",
          "display": "grid",
          "gridColumns": "1fr 1fr 1fr"
},
            children: [
          {
                    "id": "c-eiixje",
                    "type": "heading",
                    "props": {
                              "content": "Video Testimonials",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 't-tweet',
        name: 'Tweet-style Testimonials',
        category: 'testimonials',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-t-tweet-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "60px",
          "display": "grid",
          "gridColumns": "1fr 1fr 1fr"
},
            children: [
          {
                    "id": "c-gb8usm",
                    "type": "heading",
                    "props": {
                              "content": "Tweet Testimonials",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 't-quote',
        name: 'Large Quote Feature',
        category: 'testimonials',
        thumbnail: 'linear-gradient(135deg, #a855f7, #7c3aed)',
        blocks: [
          {
            id: 'tpl-t-quote-1',
            type: 'section',
            props: {
          "gradientFrom": "#a855f7",
          "gradientTo": "#7c3aed",
          "padding": "100px",
          "textAlign": "center"
},
            children: [
          {
                    "id": "c-rs1skb",
                    "type": "heading",
                    "props": {
                              "content": "Large Quote",
                              "fontSize": "40px",
                              "fontWeight": "700",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 't-scroll',
        name: 'Scrolling Testimonial Row',
        category: 'testimonials',
        thumbnail: '#f9fafb',
        blocks: [
          {
            id: 'tpl-t-scroll-1',
            type: 'section',
            props: {
          "backgroundColor": "#f9fafb",
          "padding": "60px"
},
            children: [
          {
                    "id": "c-lvap90",
                    "type": "heading",
                    "props": {
                              "content": "Scrolling Row",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 't-case',
        name: 'Case Study Card',
        category: 'testimonials',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-t-case-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "60px"
},
            children: [
          {
                    "id": "c-ygk7hw",
                    "type": "heading",
                    "props": {
                              "content": "Case Study",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      }
    ]
  },
  {
    category: 'gallery',
    label: 'Gallery & Portfolio',
    icon: 'smile',
    templates: [
      {
        id: 'gal-grid',
        name: 'Image Grid',
        category: 'gallery',
        thumbnail: 'linear-gradient(135deg, #111827 0%, #030712 100%)',
        blocks: [
          {
            id: 'tpl-gal1-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-gal1-c1',
                type: 'heading',
                props: {
                  content: 'Our Visual Showcase Portfolio',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-gal1-c2',
                type: 'image',
                props: {
                  src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
                  alt: 'Interactive Portfolio Showcase',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  margin: '20px 0px 0px'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'gal-portfolio',
        name: 'Portfolio Cards',
        category: 'gallery',
        thumbnail: '#f8fafc',
        blocks: [
          {
            id: 'tpl-gal2-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-gal2-c1',
                type: 'heading',
                props: {
                  content: 'Featured Creative Projects',
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-gal2-c2',
                type: 'card',
                props: {
                  cardTitle: 'Visual Builder Architecture v3',
                  cardText: 'Discover how we built high-velocity real-time systems using Angular signals, dynamic content trees, and secure express auth modules.',
                  cardButtonText: 'Explore Project Case Study'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'gal-before-after',
        name: 'Before/After',
        category: 'gallery',
        thumbnail: 'linear-gradient(to right, #e2e8f0 50%, #cbd5e1 50%)',
        blocks: [
          {
            id: 'tpl-gal3-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '80px 40px',
              width: '100%',
              display: 'grid',
              gridColumns: '1fr 1fr',
              gap: '20px',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-gal3-c1',
                type: 'image',
                props: {
                  src: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80',
                  alt: 'Legacy Layout Design (Before)',
                  borderRadius: '12px'
                }
              },
              {
                id: 'tpl-gal3-c2',
                type: 'image',
                props: {
                  src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
                  alt: 'ApexStudio Cinematic Layout (After)',
                  borderRadius: '12px',
                  border: '2px solid #3b82f6'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'gal-filtered',
        name: 'Gallery with Filter',
        category: 'gallery',
        thumbnail: '#ffffff',
        blocks: [
          {
            id: 'tpl-gal4-1',
            type: 'section',
            props: {
              backgroundColor: '#ffffff',
              padding: '60px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            },
            children: [
              {
                id: 'tpl-gal4-c1',
                type: 'heading',
                props: {
                  content: 'Filtered Visual Design Index',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#111827',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-gal4-c2',
                type: 'text',
                props: {
                  content: 'All Projects    •    Web Builder Designs    •    Visual CMS Presets',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#3b82f6',
                  margin: '10px 0px 30px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-gal4-c3',
                type: 'image',
                props: {
                  src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
                  alt: 'Visual Analytics Project',
                  borderRadius: '8px'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'gal-featured',
        name: 'Featured Project',
        category: 'gallery',
        thumbnail: 'linear-gradient(135deg, #4f6ef7 0%, #10b981 100%)',
        blocks: [
          {
            id: 'tpl-gal5-1',
            type: 'section',
            props: {
              gradientFrom: '#4f6ef7',
              gradientTo: '#10b981',
              padding: '100px 40px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'tpl-gal5-c1',
                type: 'heading',
                props: {
                  content: 'ApexStudio Cinematic Visual Framework v5',
                  fontSize: '40px',
                  fontWeight: '800',
                  color: '#ffffff',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-gal5-c2',
                type: 'text',
                props: {
                  content: 'The definitive creative industry standard for building glassmorphic dynamic web models.',
                  fontSize: '16px',
                  color: '#e0f2fe',
                  margin: '12px 0px 24px',
                  textAlign: 'center'
                }
              },
              {
                id: 'tpl-gal5-c3',
                type: 'button',
                props: {
                  label: 'Launch Full Product Experience',
                  backgroundColor: '#ffffff',
                  color: '#4f6ef7',
                  padding: '14px 28px',
                  borderRadius: '30px'
                }
              }
            ]
          }
        ]
      }
    ,
      {
        id: 'g-mason',
        name: 'Masonry Gallery',
        category: 'gallery',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-g-mason-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "40px"
},
            children: [
          {
                    "id": "c-dhlk93",
                    "type": "heading",
                    "props": {
                              "content": "Masonry Gallery",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'g-port',
        name: 'Portfolio Showcase',
        category: 'gallery',
        thumbnail: '#111827',
        blocks: [
          {
            id: 'tpl-g-port-1',
            type: 'section',
            props: {
          "backgroundColor": "#111827",
          "padding": "60px"
},
            children: [
          {
                    "id": "c-ufntnd",
                    "type": "heading",
                    "props": {
                              "content": "Portfolio Showcase",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#fff"
                    }
          }
]
          }
        ]
      },
      {
        id: 'g-ba',
        name: 'Before After Slider',
        category: 'gallery',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-g-ba-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "60px"
},
            children: [
          {
                    "id": "c-75f1te",
                    "type": "heading",
                    "props": {
                              "content": "Before After",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'g-insta',
        name: 'Instagram-style Grid',
        category: 'gallery',
        thumbnail: '#fff',
        blocks: [
          {
            id: 'tpl-g-insta-1',
            type: 'section',
            props: {
          "backgroundColor": "#fff",
          "padding": "40px",
          "display": "grid",
          "gridColumns": "1fr 1fr 1fr"
},
            children: [
          {
                    "id": "c-iy8n4u",
                    "type": "heading",
                    "props": {
                              "content": "Insta Grid",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      },
      {
        id: 'g-prod',
        name: 'Product Gallery',
        category: 'gallery',
        thumbnail: '#f9fafb',
        blocks: [
          {
            id: 'tpl-g-prod-1',
            type: 'section',
            props: {
          "backgroundColor": "#f9fafb",
          "padding": "60px"
},
            children: [
          {
                    "id": "c-itj9t7",
                    "type": "heading",
                    "props": {
                              "content": "Product Gallery",
                              "fontSize": "32px",
                              "fontWeight": "700",
                              "color": "#000"
                    }
          }
]
          }
        ]
      }
    ]
  }
];
