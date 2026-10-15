import { CSSProperties } from 'react';
import { ColorScheme, DesktopSettings } from '../types.ts';

// Wallpapers generated for the app
import wallpaperSakura from '../assets/images/wallpaper_sakura_pink_1790194354209.jpg';
import wallpaperSilk from '../assets/images/wallpaper_rose_silk_1790194361992.jpg';

export interface ColorSchemeConfig {
  id: ColorScheme;
  name: string;
  tagline: string;
  swatchGradient: string;
  primaryHex: string;
  secondaryHex: string;
  glowColor: string;
  ringGrad: {
    id: string;
    from: string;
    to: string;
    glow: string;
  };
  getDesktopBackground: (wallpaper: DesktopSettings['wallpaper']) => {
    style: CSSProperties;
    hasImage?: boolean;
    imageUrl?: string;
  };
  getGlassStyle: (opacity: number, blurStrength: number) => CSSProperties;
  classes: {
    accentText: string;
    accentBg: string;
    accentHoverBg: string;
    accentBorder: string;
    activeRing: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    menuBarBg: string;
    dockBg: string;
    modalBg: string;
    modalBorder: string;
    cardBg: string;
    cardBorder: string;
    cardHover: string;
    inputBg: string;
    secondaryText: string;
    highlightText: string;
  };
  petalPalette: {
    type0: [string, string, string]; // [top, mid, base]
    type1: [string, string, string];
    type2: [string, string, string];
    name: string;
  };
}

export const COLOR_SCHEMES: Record<ColorScheme, ColorSchemeConfig> = {
  pink: {
    id: 'pink',
    name: 'Pink',
    tagline: 'Sakura Rose (Original)',
    swatchGradient: 'from-pink-400 via-rose-400 to-pink-600',
    primaryHex: '#f43f5e',
    secondaryHex: '#fb7185',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    ringGrad: {
      id: 'ringGradPink',
      from: '#fb7185',
      to: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.5)',
    },
    getDesktopBackground: (wallpaper) => {
      if (wallpaper === 'sakura') {
        return {
          style: {
            backgroundImage: `url(${wallpaperSakura})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          },
          hasImage: true,
          imageUrl: wallpaperSakura,
        };
      }
      if (wallpaper === 'silk') {
        return {
          style: {
            backgroundImage: `url(${wallpaperSilk})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          },
          hasImage: true,
          imageUrl: wallpaperSilk,
        };
      }
      if (wallpaper === 'cyber') {
        return {
          style: {
            background:
              'radial-gradient(ellipse at 80% 20%, rgba(244,114,182,0.8), rgba(131,24,67,0.85) 45%, rgba(25,10,25,0.98) 100%)',
          },
        };
      }
      // 'dunes' default pink
      return {
        style: {
          background:
            'linear-gradient(135deg, #fb7185 0%, #e11d48 35%, #9f1239 70%, #4c0519 100%)',
        },
      };
    },
    getGlassStyle: (opacity, blur) => ({
      backgroundColor: `rgba(50, 15, 30, ${opacity})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderColor: 'rgba(251, 113, 133, 0.3)',
    }),
    classes: {
      accentText: 'text-rose-400',
      accentBg: 'bg-rose-500',
      accentHoverBg: 'hover:bg-rose-600',
      accentBorder: 'border-rose-400/40',
      activeRing: 'ring-rose-400/50',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-300',
      badgeBorder: 'border-rose-400/30',
      menuBarBg: 'bg-pink-950/40 border-pink-300/20 text-pink-100/90',
      dockBg: 'bg-pink-950/40 border-pink-300/30',
      modalBg: 'bg-pink-950/90',
      modalBorder: 'border-pink-300/30',
      cardBg: 'bg-pink-900/25',
      cardBorder: 'border-pink-300/15',
      cardHover: 'hover:bg-pink-900/35',
      inputBg: 'bg-pink-950/60 border-pink-300/20 text-pink-100',
      secondaryText: 'text-pink-300/70',
      highlightText: 'text-pink-200',
    },
    petalPalette: {
      name: 'Cherry Blossom Petals',
      type0: ['rgba(254, 205, 211, 0.95)', 'rgba(251, 113, 133, 0.9)', 'rgba(244, 63, 94, 0.85)'],
      type1: ['rgba(255, 228, 230, 0.95)', 'rgba(244, 114, 182, 0.9)', 'rgba(225, 29, 72, 0.85)'],
      type2: ['rgba(253, 242, 248, 0.95)', 'rgba(244, 114, 182, 0.85)', 'rgba(190, 24, 93, 0.8)'],
    },
  },

  yellow: {
    id: 'yellow',
    name: 'Yellow',
    tagline: 'Sunlit Amber & Honey',
    swatchGradient: 'from-amber-300 via-yellow-400 to-amber-600',
    primaryHex: '#f59e0b',
    secondaryHex: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    ringGrad: {
      id: 'ringGradYellow',
      from: '#fde047',
      to: '#d97706',
      glow: 'rgba(245, 158, 11, 0.55)',
    },
    getDesktopBackground: () => ({
      style: {
        background:
          'radial-gradient(ellipse at 75% 20%, rgba(251, 191, 36, 0.9) 0%, rgba(217, 119, 6, 0.85) 35%, rgba(120, 53, 15, 0.9) 65%, rgba(41, 20, 4, 0.98) 100%)',
      },
    }),
    getGlassStyle: (opacity, blur) => ({
      backgroundColor: `rgba(45, 30, 10, ${opacity})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderColor: 'rgba(251, 191, 36, 0.35)',
    }),
    classes: {
      accentText: 'text-amber-400',
      accentBg: 'bg-amber-500',
      accentHoverBg: 'hover:bg-amber-600',
      accentBorder: 'border-amber-400/40',
      activeRing: 'ring-amber-400/50',
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-400/30',
      menuBarBg: 'bg-amber-950/40 border-amber-300/20 text-amber-100/90',
      dockBg: 'bg-amber-950/40 border-amber-300/30',
      modalBg: 'bg-amber-950/92',
      modalBorder: 'border-amber-300/30',
      cardBg: 'bg-amber-900/25',
      cardBorder: 'border-amber-300/15',
      cardHover: 'hover:bg-amber-900/35',
      inputBg: 'bg-amber-950/60 border-amber-300/20 text-amber-100',
      secondaryText: 'text-amber-300/70',
      highlightText: 'text-amber-200',
    },
    petalPalette: {
      name: 'Sunlit Golden Leaves',
      type0: ['rgba(254, 240, 138, 0.95)', 'rgba(251, 191, 36, 0.9)', 'rgba(217, 119, 6, 0.85)'],
      type1: ['rgba(253, 230, 138, 0.95)', 'rgba(245, 158, 11, 0.9)', 'rgba(180, 83, 9, 0.85)'],
      type2: ['rgba(254, 252, 232, 0.95)', 'rgba(252, 211, 77, 0.85)', 'rgba(202, 138, 4, 0.8)'],
    },
  },

  blue: {
    id: 'blue',
    name: 'Blue',
    tagline: 'Monterey Azure & Ocean',
    swatchGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    primaryHex: '#0284c7',
    secondaryHex: '#38bdf8',
    glowColor: 'rgba(2, 132, 199, 0.45)',
    ringGrad: {
      id: 'ringGradBlue',
      from: '#7dd3fc',
      to: '#0284c7',
      glow: 'rgba(2, 132, 199, 0.55)',
    },
    getDesktopBackground: () => ({
      style: {
        background:
          'radial-gradient(ellipse at 80% 20%, rgba(56, 189, 248, 0.85) 0%, rgba(2, 132, 199, 0.8) 35%, rgba(14, 55, 100, 0.9) 65%, rgba(4, 15, 30, 0.98) 100%)',
      },
    }),
    getGlassStyle: (opacity, blur) => ({
      backgroundColor: `rgba(12, 26, 48, ${opacity})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderColor: 'rgba(56, 189, 248, 0.35)',
    }),
    classes: {
      accentText: 'text-sky-400',
      accentBg: 'bg-sky-500',
      accentHoverBg: 'hover:bg-sky-600',
      accentBorder: 'border-sky-400/40',
      activeRing: 'ring-sky-400/50',
      badgeBg: 'bg-sky-500/20',
      badgeText: 'text-sky-300',
      badgeBorder: 'border-sky-400/30',
      menuBarBg: 'bg-slate-950/40 border-sky-300/20 text-sky-100/90',
      dockBg: 'bg-slate-950/40 border-sky-300/30',
      modalBg: 'bg-slate-950/92',
      modalBorder: 'border-sky-300/30',
      cardBg: 'bg-slate-900/40',
      cardBorder: 'border-sky-300/15',
      cardHover: 'hover:bg-slate-900/60',
      inputBg: 'bg-slate-950/60 border-sky-300/20 text-sky-100',
      secondaryText: 'text-sky-300/70',
      highlightText: 'text-sky-200',
    },
    petalPalette: {
      name: 'Azure Ocean Stardust',
      type0: ['rgba(224, 242, 254, 0.95)', 'rgba(125, 211, 252, 0.9)', 'rgba(2, 132, 199, 0.85)'],
      type1: ['rgba(186, 230, 253, 0.95)', 'rgba(56, 189, 248, 0.9)', 'rgba(3, 105, 161, 0.85)'],
      type2: ['rgba(240, 249, 255, 0.95)', 'rgba(147, 197, 253, 0.85)', 'rgba(29, 78, 216, 0.8)'],
    },
  },

  red: {
    id: 'red',
    name: 'Red',
    tagline: 'Crimson Ruby & Scarlet',
    swatchGradient: 'from-rose-400 via-red-500 to-red-800',
    primaryHex: '#dc2626',
    secondaryHex: '#f87171',
    glowColor: 'rgba(220, 38, 38, 0.45)',
    ringGrad: {
      id: 'ringGradRed',
      from: '#fca5a5',
      to: '#dc2626',
      glow: 'rgba(220, 38, 38, 0.55)',
    },
    getDesktopBackground: () => ({
      style: {
        background:
          'radial-gradient(ellipse at 75% 20%, rgba(248, 113, 113, 0.85) 0%, rgba(220, 38, 38, 0.8) 35%, rgba(127, 29, 29, 0.9) 65%, rgba(45, 8, 10, 0.98) 100%)',
      },
    }),
    getGlassStyle: (opacity, blur) => ({
      backgroundColor: `rgba(48, 12, 16, ${opacity})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderColor: 'rgba(248, 113, 113, 0.35)',
    }),
    classes: {
      accentText: 'text-red-400',
      accentBg: 'bg-red-500',
      accentHoverBg: 'hover:bg-red-600',
      accentBorder: 'border-red-400/40',
      activeRing: 'ring-red-400/50',
      badgeBg: 'bg-red-500/20',
      badgeText: 'text-red-300',
      badgeBorder: 'border-red-400/30',
      menuBarBg: 'bg-neutral-950/40 border-red-300/20 text-red-100/90',
      dockBg: 'bg-neutral-950/40 border-red-300/30',
      modalBg: 'bg-neutral-950/92',
      modalBorder: 'border-red-300/30',
      cardBg: 'bg-red-950/30',
      cardBorder: 'border-red-300/15',
      cardHover: 'hover:bg-red-950/50',
      inputBg: 'bg-red-950/60 border-red-300/20 text-red-100',
      secondaryText: 'text-red-300/70',
      highlightText: 'text-red-200',
    },
    petalPalette: {
      name: 'Crimson Autumn Leaves',
      type0: ['rgba(254, 202, 202, 0.95)', 'rgba(248, 113, 113, 0.9)', 'rgba(220, 38, 38, 0.85)'],
      type1: ['rgba(254, 226, 226, 0.95)', 'rgba(239, 68, 68, 0.9)', 'rgba(185, 28, 28, 0.85)'],
      type2: ['rgba(255, 241, 242, 0.95)', 'rgba(251, 113, 133, 0.85)', 'rgba(159, 18, 57, 0.8)'],
    },
  },

  orange: {
    id: 'orange',
    name: 'Orange',
    tagline: 'Tangerine Sunset & Apricot',
    swatchGradient: 'from-amber-400 via-orange-500 to-orange-700',
    primaryHex: '#ea580c',
    secondaryHex: '#fb923c',
    glowColor: 'rgba(234, 88, 12, 0.45)',
    ringGrad: {
      id: 'ringGradOrange',
      from: '#fdba74',
      to: '#ea580c',
      glow: 'rgba(234, 88, 12, 0.55)',
    },
    getDesktopBackground: () => ({
      style: {
        background:
          'radial-gradient(ellipse at 80% 20%, rgba(251, 146, 60, 0.9) 0%, rgba(234, 88, 12, 0.85) 35%, rgba(124, 45, 18, 0.9) 65%, rgba(43, 15, 6, 0.98) 100%)',
      },
    }),
    getGlassStyle: (opacity, blur) => ({
      backgroundColor: `rgba(45, 20, 10, ${opacity})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderColor: 'rgba(251, 146, 60, 0.35)',
    }),
    classes: {
      accentText: 'text-orange-400',
      accentBg: 'bg-orange-500',
      accentHoverBg: 'hover:bg-orange-600',
      accentBorder: 'border-orange-400/40',
      activeRing: 'ring-orange-400/50',
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-300',
      badgeBorder: 'border-orange-400/30',
      menuBarBg: 'bg-amber-950/40 border-orange-300/20 text-orange-100/90',
      dockBg: 'bg-amber-950/40 border-orange-300/30',
      modalBg: 'bg-stone-950/92',
      modalBorder: 'border-orange-300/30',
      cardBg: 'bg-orange-950/30',
      cardBorder: 'border-orange-300/15',
      cardHover: 'hover:bg-orange-950/50',
      inputBg: 'bg-orange-950/60 border-orange-300/20 text-orange-100',
      secondaryText: 'text-orange-300/70',
      highlightText: 'text-orange-200',
    },
    petalPalette: {
      name: 'Sunset Apricot Petals',
      type0: ['rgba(254, 215, 170, 0.95)', 'rgba(251, 146, 60, 0.9)', 'rgba(234, 88, 12, 0.85)'],
      type1: ['rgba(255, 237, 213, 0.95)', 'rgba(249, 115, 22, 0.9)', 'rgba(194, 65, 12, 0.85)'],
      type2: ['rgba(255, 247, 237, 0.95)', 'rgba(253, 186, 116, 0.85)', 'rgba(154, 52, 18, 0.8)'],
    },
  },

  green: {
    id: 'green',
    name: 'Green',
    tagline: 'Emerald Forest & Alpine',
    swatchGradient: 'from-emerald-300 via-emerald-500 to-teal-800',
    primaryHex: '#059669',
    secondaryHex: '#34d399',
    glowColor: 'rgba(5, 150, 105, 0.45)',
    ringGrad: {
      id: 'ringGradGreen',
      from: '#6ee7b7',
      to: '#059669',
      glow: 'rgba(5, 150, 105, 0.55)',
    },
    getDesktopBackground: () => ({
      style: {
        background:
          'radial-gradient(ellipse at 80% 20%, rgba(52, 211, 153, 0.85) 0%, rgba(5, 150, 105, 0.85) 35%, rgba(6, 78, 59, 0.9) 65%, rgba(2, 35, 28, 0.98) 100%)',
      },
    }),
    getGlassStyle: (opacity, blur) => ({
      backgroundColor: `rgba(10, 36, 26, ${opacity})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderColor: 'rgba(52, 211, 153, 0.35)',
    }),
    classes: {
      accentText: 'text-emerald-400',
      accentBg: 'bg-emerald-500',
      accentHoverBg: 'hover:bg-emerald-600',
      accentBorder: 'border-emerald-400/40',
      activeRing: 'ring-emerald-400/50',
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-400/30',
      menuBarBg: 'bg-emerald-950/40 border-emerald-300/20 text-emerald-100/90',
      dockBg: 'bg-emerald-950/40 border-emerald-300/30',
      modalBg: 'bg-emerald-950/92',
      modalBorder: 'border-emerald-300/30',
      cardBg: 'bg-emerald-950/30',
      cardBorder: 'border-emerald-300/15',
      cardHover: 'hover:bg-emerald-950/50',
      inputBg: 'bg-emerald-950/60 border-emerald-300/20 text-emerald-100',
      secondaryText: 'text-emerald-300/70',
      highlightText: 'text-emerald-200',
    },
    petalPalette: {
      name: 'Lush Botanical Leaves',
      type0: ['rgba(209, 250, 229, 0.95)', 'rgba(52, 211, 153, 0.9)', 'rgba(5, 150, 105, 0.85)'],
      type1: ['rgba(236, 253, 245, 0.95)', 'rgba(16, 185, 129, 0.9)', 'rgba(4, 120, 87, 0.85)'],
      type2: ['rgba(240, 253, 244, 0.95)', 'rgba(110, 231, 183, 0.85)', 'rgba(6, 95, 70, 0.8)'],
    },
  },

  blackGrey: {
    id: 'blackGrey',
    name: 'Black / Grey',
    tagline: 'Space Gray & Dark Titanium',
    swatchGradient: 'from-slate-400 via-neutral-600 to-neutral-900',
    primaryHex: '#64748b',
    secondaryHex: '#cbd5e1',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    ringGrad: {
      id: 'ringGradBlackGrey',
      from: '#e2e8f0',
      to: '#64748b',
      glow: 'rgba(148, 163, 184, 0.5)',
    },
    getDesktopBackground: () => ({
      style: {
        background:
          'radial-gradient(ellipse at 50% 25%, rgba(100, 116, 139, 0.5) 0%, rgba(30, 41, 59, 0.85) 45%, rgba(15, 23, 42, 0.95) 75%, rgba(2, 6, 23, 0.98) 100%)',
      },
    }),
    getGlassStyle: (opacity, blur) => ({
      backgroundColor: `rgba(20, 25, 35, ${opacity})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderColor: 'rgba(148, 163, 184, 0.3)',
    }),
    classes: {
      accentText: 'text-slate-300',
      accentBg: 'bg-slate-600',
      accentHoverBg: 'hover:bg-slate-500',
      accentBorder: 'border-slate-400/40',
      activeRing: 'ring-slate-400/50',
      badgeBg: 'bg-slate-500/20',
      badgeText: 'text-slate-200',
      badgeBorder: 'border-slate-400/30',
      menuBarBg: 'bg-neutral-950/50 border-neutral-700/30 text-neutral-100/90',
      dockBg: 'bg-neutral-950/50 border-neutral-700/30',
      modalBg: 'bg-neutral-950/92',
      modalBorder: 'border-neutral-700/40',
      cardBg: 'bg-neutral-900/40',
      cardBorder: 'border-neutral-700/25',
      cardHover: 'hover:bg-neutral-900/60',
      inputBg: 'bg-neutral-950/70 border-neutral-700/30 text-neutral-100',
      secondaryText: 'text-neutral-400',
      highlightText: 'text-neutral-200',
    },
    petalPalette: {
      name: 'Monochrome Silver Stardust',
      type0: ['rgba(241, 245, 249, 0.95)', 'rgba(203, 213, 225, 0.9)', 'rgba(100, 116, 139, 0.85)'],
      type1: ['rgba(248, 250, 252, 0.95)', 'rgba(148, 163, 184, 0.9)', 'rgba(71, 85, 105, 0.85)'],
      type2: ['rgba(255, 255, 255, 0.95)', 'rgba(226, 232, 240, 0.85)', 'rgba(51, 65, 85, 0.8)'],
    },
  },
};

export const COLOR_SCHEME_LIST: ColorSchemeConfig[] = [
  COLOR_SCHEMES.pink,
  COLOR_SCHEMES.yellow,
  COLOR_SCHEMES.blue,
  COLOR_SCHEMES.red,
  COLOR_SCHEMES.orange,
  COLOR_SCHEMES.green,
  COLOR_SCHEMES.blackGrey,
];

export function getColorSchemeConfig(scheme?: ColorScheme): ColorSchemeConfig {
  if (scheme && COLOR_SCHEMES[scheme]) {
    return COLOR_SCHEMES[scheme];
  }
  return COLOR_SCHEMES.pink;
}
