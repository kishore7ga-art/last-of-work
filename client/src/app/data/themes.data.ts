export type ThemeCategory = 'minimal' | 'bold' | 'elegant' | 'dark' | 'colorful' | 'corporate' | 'creative';

export interface SiteTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  thumbnail: { primary: string; secondary: string; accent: string; bg: string; };
  colors: {
    primary: string; primaryHover: string; primaryLight: string;
    secondary: string; accent: string;
    background: string; surface: string; surfaceHover: string;
    text: string; textMuted: string; textLight: string;
    border: string; borderLight: string;
    success: string; error: string; warning: string; buttonText: string;
  };
  fonts: {
    heading: string; body: string; mono: string;
    headingWeight: string; bodyWeight: string; baseSize: string; headingScale: number;
  };
  borderRadius: { small: string; medium: string; large: string; full: string; button: string; card: string; };
  shadows: { small: string; medium: string; large: string; button: string; card: string; };
  spacing: { sectionPadding: string; cardPadding: string; blockGap: string; };
}

const defaultFonts = (heading: string, body: string, headingWeight = '700'): SiteTheme['fonts'] => ({
  heading, body, mono: 'ui-monospace, monospace',
  headingWeight, bodyWeight: '400', baseSize: '16px', headingScale: 1.25
});

const defaultRadius = (button = '8px', card = '12px'): SiteTheme['borderRadius'] => ({
  small: '4px', medium: '8px', large: '16px', full: '9999px', button, card
});

const defaultShadows = (card = '0 1px 3px rgba(0,0,0,0.08)'): SiteTheme['shadows'] => ({
  small: '0 1px 2px rgba(0,0,0,0.05)',
  medium: '0 4px 6px rgba(0,0,0,0.07)',
  large: '0 10px 25px rgba(0,0,0,0.1)',
  button: '0 2px 4px rgba(0,0,0,0.15)',
  card
});

const defaultSpacing: SiteTheme['spacing'] = { sectionPadding: '80px 40px', cardPadding: '24px', blockGap: '16px' };

export const THEMES: SiteTheme[] = [
  // ── MINIMAL ────────────────────────────────────────────────────
  {
    id: 'clean-white',
    name: 'Clean White',
    category: 'minimal',
    thumbnail: { primary: '#2563eb', secondary: '#64748b', accent: '#0ea5e9', bg: '#ffffff' },
    colors: {
      primary: '#2563eb', primaryHover: '#1d4ed8', primaryLight: '#eff6ff',
      secondary: '#64748b', accent: '#0ea5e9',
      background: '#ffffff', surface: '#f8fafc', surfaceHover: '#f1f5f9',
      text: '#0f172a', textMuted: '#64748b', textLight: '#94a3b8',
      border: '#e2e8f0', borderLight: '#f1f5f9',
      success: '#10b981', error: '#ef4444', warning: '#f59e0b', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Inter', 'Inter'),
    borderRadius: defaultRadius('8px', '12px'),
    shadows: defaultShadows(),
    spacing: defaultSpacing
  },
  {
    id: 'pure-minimal',
    name: 'Pure Minimal',
    category: 'minimal',
    thumbnail: { primary: '#000000', secondary: '#666666', accent: '#333333', bg: '#ffffff' },
    colors: {
      primary: '#000000', primaryHover: '#222222', primaryLight: '#f5f5f5',
      secondary: '#444444', accent: '#333333',
      background: '#ffffff', surface: '#fafafa', surfaceHover: '#f5f5f5',
      text: '#111111', textMuted: '#666666', textLight: '#aaaaaa',
      border: '#eeeeee', borderLight: '#f7f7f7',
      success: '#22c55e', error: '#ef4444', warning: '#f59e0b', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Playfair Display', 'Source Sans Pro'),
    borderRadius: defaultRadius('2px', '4px'),
    shadows: defaultShadows('0 1px 4px rgba(0,0,0,0.06)'),
    spacing: defaultSpacing
  },
  {
    id: 'soft-gray',
    name: 'Soft Gray',
    category: 'minimal',
    thumbnail: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#a78bfa', bg: '#fafafa' },
    colors: {
      primary: '#6366f1', primaryHover: '#4f46e5', primaryLight: '#eef2ff',
      secondary: '#8b5cf6', accent: '#a78bfa',
      background: '#fafafa', surface: '#f3f4f6', surfaceHover: '#e5e7eb',
      text: '#1f2937', textMuted: '#6b7280', textLight: '#9ca3af',
      border: '#e5e7eb', borderLight: '#f3f4f6',
      success: '#10b981', error: '#ef4444', warning: '#f59e0b', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Nunito', 'Nunito'),
    borderRadius: defaultRadius('8px', '16px'),
    shadows: defaultShadows(),
    spacing: defaultSpacing
  },

  // ── BOLD ───────────────────────────────────────────────────────
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    category: 'bold',
    thumbnail: { primary: '#2563eb', secondary: '#7c3aed', accent: '#06b6d4', bg: '#ffffff' },
    colors: {
      primary: '#2563eb', primaryHover: '#1d4ed8', primaryLight: '#dbeafe',
      secondary: '#7c3aed', accent: '#06b6d4',
      background: '#ffffff', surface: '#eff6ff', surfaceHover: '#dbeafe',
      text: '#0f172a', textMuted: '#334155', textLight: '#64748b',
      border: '#bfdbfe', borderLight: '#dbeafe',
      success: '#10b981', error: '#ef4444', warning: '#f59e0b', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Poppins', 'Poppins', '800'),
    borderRadius: defaultRadius('4px', '8px'),
    shadows: defaultShadows('0 4px 12px rgba(37,99,235,0.15)'),
    spacing: defaultSpacing
  },
  {
    id: 'purple-power',
    name: 'Purple Power',
    category: 'bold',
    thumbnail: { primary: '#7c3aed', secondary: '#db2777', accent: '#f59e0b', bg: '#ffffff' },
    colors: {
      primary: '#7c3aed', primaryHover: '#6d28d9', primaryLight: '#f5f3ff',
      secondary: '#db2777', accent: '#f59e0b',
      background: '#ffffff', surface: '#faf5ff', surfaceHover: '#ede9fe',
      text: '#1e1b4b', textMuted: '#4c1d95', textLight: '#7c3aed',
      border: '#ddd6fe', borderLight: '#ede9fe',
      success: '#10b981', error: '#ef4444', warning: '#f59e0b', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Montserrat', 'Open Sans', '800'),
    borderRadius: defaultRadius('8px', '16px'),
    shadows: defaultShadows('0 4px 16px rgba(124,58,237,0.2)'),
    spacing: defaultSpacing
  },
  {
    id: 'coral-bold',
    name: 'Coral Bold',
    category: 'bold',
    thumbnail: { primary: '#ef4444', secondary: '#f97316', accent: '#eab308', bg: '#ffffff' },
    colors: {
      primary: '#ef4444', primaryHover: '#dc2626', primaryLight: '#fef2f2',
      secondary: '#f97316', accent: '#eab308',
      background: '#ffffff', surface: '#fff5f5', surfaceHover: '#fee2e2',
      text: '#1c0a00', textMuted: '#7f1d1d', textLight: '#b91c1c',
      border: '#fecaca', borderLight: '#fee2e2',
      success: '#10b981', error: '#dc2626', warning: '#f59e0b', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Raleway', 'Lato', '800'),
    borderRadius: defaultRadius('6px', '12px'),
    shadows: defaultShadows('0 4px 12px rgba(239,68,68,0.15)'),
    spacing: defaultSpacing
  },

  // ── ELEGANT ────────────────────────────────────────────────────
  {
    id: 'gold-luxury',
    name: 'Gold Luxury',
    category: 'elegant',
    thumbnail: { primary: '#b8860b', secondary: '#8b7355', accent: '#daa520', bg: '#fdfdf5' },
    colors: {
      primary: '#b8860b', primaryHover: '#9a7209', primaryLight: '#fef9e7',
      secondary: '#8b7355', accent: '#daa520',
      background: '#fdfdf5', surface: '#faf8f0', surfaceHover: '#f5f0e0',
      text: '#1a1a1a', textMuted: '#6b6b6b', textLight: '#9a9a9a',
      border: '#e8e0d0', borderLight: '#f0ead8',
      success: '#16a34a', error: '#dc2626', warning: '#d97706', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Playfair Display', 'Cormorant Garamond'),
    borderRadius: defaultRadius('2px', '4px'),
    shadows: defaultShadows('0 2px 20px rgba(0,0,0,0.08)'),
    spacing: defaultSpacing
  },
  {
    id: 'rose-elegant',
    name: 'Rose Elegant',
    category: 'elegant',
    thumbnail: { primary: '#be185d', secondary: '#9d174d', accent: '#f43f5e', bg: '#fff1f2' },
    colors: {
      primary: '#be185d', primaryHover: '#9d174d', primaryLight: '#fce7f3',
      secondary: '#9d174d', accent: '#f43f5e',
      background: '#fff1f2', surface: '#ffe4e6', surfaceHover: '#fecdd3',
      text: '#1a0a0f', textMuted: '#881337', textLight: '#be185d',
      border: '#fecdd3', borderLight: '#ffe4e6',
      success: '#16a34a', error: '#dc2626', warning: '#d97706', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Cormorant Garamond', 'Lato'),
    borderRadius: defaultRadius('4px', '8px'),
    shadows: defaultShadows('0 2px 16px rgba(190,24,93,0.1)'),
    spacing: defaultSpacing
  },
  {
    id: 'navy-classic',
    name: 'Navy Classic',
    category: 'elegant',
    thumbnail: { primary: '#1e3a5f', secondary: '#c9a84c', accent: '#4a90d9', bg: '#f8f9fa' },
    colors: {
      primary: '#1e3a5f', primaryHover: '#162d4a', primaryLight: '#e8eef5',
      secondary: '#c9a84c', accent: '#4a90d9',
      background: '#f8f9fa', surface: '#eef2f7', surfaceHover: '#dce4ef',
      text: '#1a2233', textMuted: '#4a5568', textLight: '#718096',
      border: '#c8d6e5', borderLight: '#dce4ef',
      success: '#16a34a', error: '#dc2626', warning: '#d97706', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Merriweather', 'Source Sans Pro'),
    borderRadius: defaultRadius('4px', '6px'),
    shadows: defaultShadows('0 2px 12px rgba(30,58,95,0.1)'),
    spacing: defaultSpacing
  },

  // ── DARK ───────────────────────────────────────────────────────
  {
    id: 'dark-pro',
    name: 'Dark Pro',
    category: 'dark',
    thumbnail: { primary: '#4f6ef7', secondary: '#7c3aed', accent: '#06b6d4', bg: '#0a0a0f' },
    colors: {
      primary: '#4f6ef7', primaryHover: '#3b5bf5', primaryLight: '#1a1f40',
      secondary: '#7c3aed', accent: '#06b6d4',
      background: '#0a0a0f', surface: '#111118', surfaceHover: '#1a1a24',
      text: '#f1f1f3', textMuted: '#8b8ba0', textLight: '#4a4a6a',
      border: '#2a2a3d', borderLight: '#1e1e30',
      success: '#10b981', error: '#ef4444', warning: '#f59e0b', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Inter', 'Inter'),
    borderRadius: defaultRadius('8px', '12px'),
    shadows: defaultShadows('0 4px 24px rgba(0,0,0,0.4)'),
    spacing: defaultSpacing
  },
  {
    id: 'midnight',
    name: 'Midnight',
    category: 'dark',
    thumbnail: { primary: '#818cf8', secondary: '#6366f1', accent: '#a5b4fc', bg: '#0f0f23' },
    colors: {
      primary: '#818cf8', primaryHover: '#6366f1', primaryLight: '#1e1b4b',
      secondary: '#6366f1', accent: '#a5b4fc',
      background: '#0f0f23', surface: '#1a1a3e', surfaceHover: '#252550',
      text: '#e2e8f0', textMuted: '#94a3b8', textLight: '#475569',
      border: '#2d2d5e', borderLight: '#1e1e40',
      success: '#10b981', error: '#f87171', warning: '#fbbf24', buttonText: '#0f0f23'
    },
    fonts: defaultFonts('Space Grotesk', 'Inter'),
    borderRadius: defaultRadius('10px', '16px'),
    shadows: defaultShadows('0 4px 30px rgba(129,140,248,0.15)'),
    spacing: defaultSpacing
  },
  {
    id: 'dark-green',
    name: 'Dark Green',
    category: 'dark',
    thumbnail: { primary: '#10b981', secondary: '#059669', accent: '#34d399', bg: '#0a0f0a' },
    colors: {
      primary: '#10b981', primaryHover: '#059669', primaryLight: '#064e3b',
      secondary: '#059669', accent: '#34d399',
      background: '#0a0f0a', surface: '#111811', surfaceHover: '#1a2e1a',
      text: '#ecfdf5', textMuted: '#6ee7b7', textLight: '#34d399',
      border: '#1a2e1a', borderLight: '#14291a',
      success: '#10b981', error: '#f87171', warning: '#fbbf24', buttonText: '#0a0f0a'
    },
    fonts: defaultFonts('JetBrains Mono', 'Inter'),
    borderRadius: defaultRadius('6px', '10px'),
    shadows: defaultShadows('0 4px 24px rgba(16,185,129,0.15)'),
    spacing: defaultSpacing
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    category: 'dark',
    thumbnail: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', bg: '#1c1c1c' },
    colors: {
      primary: '#f59e0b', primaryHover: '#d97706', primaryLight: '#3d2800',
      secondary: '#d97706', accent: '#fbbf24',
      background: '#1c1c1c', surface: '#2a2a2a', surfaceHover: '#333333',
      text: '#f5f5f5', textMuted: '#a3a3a3', textLight: '#737373',
      border: '#3d3d3d', borderLight: '#2a2a2a',
      success: '#22c55e', error: '#f87171', warning: '#fbbf24', buttonText: '#1c1c1c'
    },
    fonts: defaultFonts('Oswald', 'Roboto', '700'),
    borderRadius: defaultRadius('4px', '8px'),
    shadows: defaultShadows('0 4px 16px rgba(0,0,0,0.5)'),
    spacing: defaultSpacing
  },

  // ── COLORFUL ───────────────────────────────────────────────────
  {
    id: 'sunset',
    name: 'Sunset',
    category: 'colorful',
    thumbnail: { primary: '#f97316', secondary: '#ec4899', accent: '#8b5cf6', bg: '#fff7ed' },
    colors: {
      primary: '#f97316', primaryHover: '#ea6c09', primaryLight: '#ffedd5',
      secondary: '#ec4899', accent: '#8b5cf6',
      background: '#fff7ed', surface: '#ffedd5', surfaceHover: '#fed7aa',
      text: '#1c0a00', textMuted: '#9a3412', textLight: '#c2410c',
      border: '#fed7aa', borderLight: '#ffedd5',
      success: '#10b981', error: '#ef4444', warning: '#f59e0b', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Nunito', 'Nunito', '800'),
    borderRadius: defaultRadius('9999px', '16px'),
    shadows: defaultShadows('0 4px 20px rgba(249,115,22,0.2)'),
    spacing: defaultSpacing
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'colorful',
    thumbnail: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#22d3ee', bg: '#f0f9ff' },
    colors: {
      primary: '#0ea5e9', primaryHover: '#0284c7', primaryLight: '#e0f2fe',
      secondary: '#06b6d4', accent: '#22d3ee',
      background: '#f0f9ff', surface: '#e0f2fe', surfaceHover: '#bae6fd',
      text: '#0c4a6e', textMuted: '#075985', textLight: '#0ea5e9',
      border: '#bae6fd', borderLight: '#e0f2fe',
      success: '#10b981', error: '#ef4444', warning: '#f59e0b', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Poppins', 'Open Sans'),
    borderRadius: defaultRadius('8px', '16px'),
    shadows: defaultShadows('0 4px 20px rgba(14,165,233,0.15)'),
    spacing: defaultSpacing
  },
  {
    id: 'forest',
    name: 'Forest',
    category: 'colorful',
    thumbnail: { primary: '#16a34a', secondary: '#15803d', accent: '#4ade80', bg: '#f0fdf4' },
    colors: {
      primary: '#16a34a', primaryHover: '#15803d', primaryLight: '#dcfce7',
      secondary: '#15803d', accent: '#4ade80',
      background: '#f0fdf4', surface: '#dcfce7', surfaceHover: '#bbf7d0',
      text: '#052e16', textMuted: '#14532d', textLight: '#166534',
      border: '#bbf7d0', borderLight: '#dcfce7',
      success: '#16a34a', error: '#ef4444', warning: '#f59e0b', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Merriweather', 'Source Sans Pro'),
    borderRadius: defaultRadius('8px', '12px'),
    shadows: defaultShadows('0 4px 20px rgba(22,163,74,0.15)'),
    spacing: defaultSpacing
  },

  // ── CORPORATE ──────────────────────────────────────────────────
  {
    id: 'business-blue',
    name: 'Business Blue',
    category: 'corporate',
    thumbnail: { primary: '#1d4ed8', secondary: '#1e40af', accent: '#3b82f6', bg: '#ffffff' },
    colors: {
      primary: '#1d4ed8', primaryHover: '#1e40af', primaryLight: '#eff6ff',
      secondary: '#1e40af', accent: '#3b82f6',
      background: '#ffffff', surface: '#f8faff', surfaceHover: '#eff6ff',
      text: '#1e293b', textMuted: '#475569', textLight: '#94a3b8',
      border: '#cbd5e1', borderLight: '#e2e8f0',
      success: '#16a34a', error: '#dc2626', warning: '#d97706', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Roboto', 'Roboto'),
    borderRadius: defaultRadius('4px', '6px'),
    shadows: defaultShadows('0 1px 4px rgba(0,0,0,0.08)'),
    spacing: defaultSpacing
  },
  {
    id: 'enterprise-gray',
    name: 'Enterprise Gray',
    category: 'corporate',
    thumbnail: { primary: '#374151', secondary: '#1f2937', accent: '#6b7280', bg: '#f9fafb' },
    colors: {
      primary: '#374151', primaryHover: '#1f2937', primaryLight: '#f3f4f6',
      secondary: '#1f2937', accent: '#6b7280',
      background: '#f9fafb', surface: '#f3f4f6', surfaceHover: '#e5e7eb',
      text: '#111827', textMuted: '#6b7280', textLight: '#9ca3af',
      border: '#d1d5db', borderLight: '#e5e7eb',
      success: '#16a34a', error: '#dc2626', warning: '#d97706', buttonText: '#ffffff'
    },
    fonts: defaultFonts('IBM Plex Sans', 'IBM Plex Sans'),
    borderRadius: defaultRadius('4px', '6px'),
    shadows: defaultShadows(),
    spacing: defaultSpacing
  },

  // ── CREATIVE ───────────────────────────────────────────────────
  {
    id: 'neon',
    name: 'Neon',
    category: 'creative',
    thumbnail: { primary: '#a855f7', secondary: '#ec4899', accent: '#06b6d4', bg: '#09090b' },
    colors: {
      primary: '#a855f7', primaryHover: '#9333ea', primaryLight: '#2d1b69',
      secondary: '#ec4899', accent: '#06b6d4',
      background: '#09090b', surface: '#18181b', surfaceHover: '#27272a',
      text: '#fafafa', textMuted: '#a1a1aa', textLight: '#52525b',
      border: '#27272a', borderLight: '#18181b',
      success: '#22c55e', error: '#f87171', warning: '#fbbf24', buttonText: '#ffffff'
    },
    fonts: defaultFonts('Space Grotesk', 'Inter', '800'),
    borderRadius: defaultRadius('9999px', '20px'),
    shadows: { small: '0 0 8px rgba(168,85,247,0.2)', medium: '0 0 16px rgba(168,85,247,0.3)', large: '0 0 32px rgba(168,85,247,0.4)', button: '0 0 20px rgba(168,85,247,0.4)', card: '0 0 30px rgba(168,85,247,0.1)' },
    spacing: defaultSpacing
  },
  {
    id: 'retro',
    name: 'Retro',
    category: 'creative',
    thumbnail: { primary: '#f59e0b', secondary: '#84cc16', accent: '#06b6d4', bg: '#fffbeb' },
    colors: {
      primary: '#f59e0b', primaryHover: '#d97706', primaryLight: '#fef3c7',
      secondary: '#84cc16', accent: '#06b6d4',
      background: '#fffbeb', surface: '#fef3c7', surfaceHover: '#fde68a',
      text: '#1c1917', textMuted: '#57534e', textLight: '#78716c',
      border: '#fde68a', borderLight: '#fef3c7',
      success: '#84cc16', error: '#ef4444', warning: '#f59e0b', buttonText: '#1c1917'
    },
    fonts: defaultFonts('Bebas Neue', 'Courier Prime'),
    borderRadius: defaultRadius('0px', '0px'),
    shadows: defaultShadows('4px 4px 0px rgba(0,0,0,0.8)'),
    spacing: defaultSpacing
  }
];

export const THEME_CATEGORIES: { value: ThemeCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'dark', label: 'Dark' },
  { value: 'colorful', label: 'Colorful' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'creative', label: 'Creative' },
];

export const GOOGLE_FONT_OPTIONS = [
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Playfair Display',
  'Merriweather', 'Lato', 'Open Sans', 'Raleway', 'Nunito', 'Oswald',
  'Source Sans Pro', 'Space Grotesk', 'JetBrains Mono', 'Cormorant Garamond',
  'IBM Plex Sans', 'Bebas Neue', 'Courier Prime', 'Outfit', 'DM Sans',
  'Sora', 'Josefin Sans', 'Cabin', 'Mulish', 'Quicksand',
  'Work Sans', 'Karla', 'Manrope', 'Urbanist', 'Plus Jakarta Sans'
];
