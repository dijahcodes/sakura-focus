import { useState } from 'react';
import { X, Sliders, Palette, Image as ImageIcon, Clock, Volume2, Sparkles, Target, Check, FolderDown, Download, Laptop } from 'lucide-react';
import { DesktopSettings, PomodoroSettings, GlassTheme, ColorScheme } from '../types.ts';
import { playClickSound } from '../utils/sound.ts';
import { COLOR_SCHEME_LIST, getColorSchemeConfig } from '../utils/theme.ts';
import { exportProjectZip } from '../utils/exportProject.ts';

interface ControlCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  desktopSettings: DesktopSettings;
  onUpdateDesktopSettings: (settings: Partial<DesktopSettings>) => void;
  pomoSettings: PomodoroSettings;
  onUpdatePomoSettings: (settings: Partial<PomodoroSettings>) => void;
  onOpenMacAppModal?: () => void;
}

export default function ControlCenterModal({
  isOpen,
  onClose,
  desktopSettings,
  onUpdateDesktopSettings,
  pomoSettings,
  onUpdatePomoSettings,
  onOpenMacAppModal,
}: ControlCenterModalProps) {
  if (!isOpen) return null;

  const currentTheme = getColorSchemeConfig(desktopSettings.colorScheme);
  const [isExporting, setIsExporting] = useState(false);

  const themes: { id: GlassTheme; label: string; desc: string }[] = [
    { id: 'sakura', label: 'Sakura Blush', desc: 'Warm soft cherry blossom tone' },
    { id: 'candy', label: 'Candy Quartz', desc: 'Vibrant bubblegum pink sheen' },
    { id: 'cyber', label: 'Cyber Orchid', desc: 'Deep luminous magenta glow' },
    { id: 'frost', label: 'Frosted Crystal', desc: 'Translucent ice-pink glaze' },
  ];

  const wallpapers: { id: DesktopSettings['wallpaper']; label: string; preview: string }[] = [
    { id: 'sakura', label: 'Sakura Petals', preview: 'bg-gradient-to-tr from-pink-400 to-rose-300' },
    { id: 'silk', label: 'Rose Silk', preview: 'bg-gradient-to-tr from-rose-500 to-pink-600' },
    { id: 'dunes', label: 'Sunset Dunes', preview: 'bg-gradient-to-tr from-rose-600 to-pink-800' },
    { id: 'cyber', label: 'Cyber Dusk', preview: 'bg-gradient-to-tr from-purple-900 to-pink-700' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl ${currentTheme.classes.modalBg} backdrop-blur-2xl border ${currentTheme.classes.modalBorder} p-6 text-neutral-100 shadow-2xl space-y-6 transition-colors`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${currentTheme.classes.badgeBg} border ${currentTheme.classes.badgeBorder} flex items-center justify-center ${currentTheme.classes.accentText}`}>
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">macOS Preferences</h3>
              <p className="text-[11px] text-neutral-300/70">Background, Colors, Glass & Pomodoro settings</p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. App Color Scheme & Background Setting (Pink, Yellow, Blue, Red, Orange, Green, Black/Grey) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Palette className={`w-3.5 h-3.5 ${currentTheme.classes.accentText}`} />
              <span>Color Scheme & Background Setting</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${currentTheme.classes.badgeBg} ${currentTheme.classes.badgeText} border ${currentTheme.classes.badgeBorder}`}>
              {currentTheme.name} Active
            </span>
          </div>

          <p className="text-[11px] text-neutral-300/70">
            Select your preferred color scheme. The original pink aesthetic is saved as the Pink setting, with Yellow, Blue, Red, Orange, Green, and Black / Grey available.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COLOR_SCHEME_LIST.map((scheme) => {
              const isSelected = (desktopSettings.colorScheme || 'pink') === scheme.id;
              return (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onUpdateDesktopSettings({ colorScheme: scheme.id });
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all relative ${
                    isSelected
                      ? `bg-white/15 ${scheme.classes.accentBorder} ring-2 ${scheme.classes.activeRing} text-white shadow-md`
                      : 'bg-black/25 border-white/10 hover:border-white/20 hover:bg-white/5 text-neutral-300'
                  }`}
                >
                  {/* Color Swatch Circle */}
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-tr ${scheme.swatchGradient} shadow-md shrink-0 flex items-center justify-center mt-0.5 border border-white/30`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-white leading-tight">
                        {scheme.name}
                      </span>
                      {scheme.id === 'pink' && (
                        <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-rose-500/30 text-rose-200 border border-rose-400/30">
                          Original
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-tight mt-0.5 truncate">
                      {scheme.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Wallpaper Picker (Custom wallpapers for Pink, or Theme Ambiance for other colors) */}
        {(desktopSettings.colorScheme === 'pink' || !desktopSettings.colorScheme) ? (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ImageIcon className={`w-3.5 h-3.5 ${currentTheme.classes.accentText}`} />
              <span>Pink Desktop Wallpapers</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {wallpapers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    playClickSound();
                    onUpdateDesktopSettings({ wallpaper: w.id });
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    desktopSettings.wallpaper === w.id
                      ? `${currentTheme.classes.accentBorder} ring-2 ${currentTheme.classes.activeRing} bg-white/15`
                      : 'border-white/10 hover:border-white/20 bg-black/25'
                  }`}
                >
                  <div className={`w-full h-10 rounded-lg ${w.preview} shadow-inner`} />
                  <span className="text-[10px] font-medium text-neutral-200 truncate w-full text-center">
                    {w.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${currentTheme.swatchGradient}`} />
              <div>
                <p className="font-semibold text-white">{currentTheme.name} Desktop Ambiance</p>
                <p className="text-[10px] text-neutral-400">
                  Custom high-resolution macOS desktop wallpaper gradient and matching particle effects active.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Translucency & Glass Section */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Sliders className={`w-3.5 h-3.5 ${currentTheme.classes.accentText}`} />
            <span>Frosted Glass Translucency</span>
          </div>

          {/* Opacity Slider */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-200">Window Opacity</span>
              <span className="font-mono text-white font-semibold">
                {Math.round(desktopSettings.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="0.95"
              step="0.05"
              value={desktopSettings.opacity}
              onChange={(e) => onUpdateDesktopSettings({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Ultra Transparent (40%)</span>
              <span>Balanced (80%)</span>
              <span>Solid Frosted (95%)</span>
            </div>
          </div>

          {/* Blur Strength Slider */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-200">Backdrop Frosting Blur</span>
              <span className="font-mono text-white font-semibold">{desktopSettings.blurStrength}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="36"
              step="2"
              value={desktopSettings.blurStrength}
              onChange={(e) => onUpdateDesktopSettings({ blurStrength: parseInt(e.target.value) })}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Soft Glass (12px)</span>
              <span>Deep Mac Frost (36px)</span>
            </div>
          </div>

          {/* Theme Tint Presets for Pink */}
          {(!desktopSettings.colorScheme || desktopSettings.colorScheme === 'pink') && (
            <div className="space-y-1.5">
              <span className="text-xs text-neutral-300 font-medium">Pink Glass Tint Variation</span>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      playClickSound();
                      onUpdateDesktopSettings({ theme: t.id });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      desktopSettings.theme === t.id
                        ? 'bg-rose-500/25 border-rose-400 text-white shadow-sm ring-1 ring-rose-400'
                        : 'bg-black/25 border-white/10 text-pink-200 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-xs font-semibold">{t.label}</p>
                    <p className="text-[10px] text-pink-300/70 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pomodoro Timer Configuration */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Clock className={`w-3.5 h-3.5 ${currentTheme.classes.accentText}`} />
            <span>Pomodoro Clock Durations</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 space-y-1">
              <label className="text-[10px] text-neutral-300 block">Focus (min)</label>
              <input
                type="number"
                min="10"
                max="60"
                value={pomoSettings.focusDuration}
                onChange={(e) =>
                  onUpdatePomoSettings({ focusDuration: Math.max(5, parseInt(e.target.value) || 25) })
                }
                className="w-full bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono outline-none"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 space-y-1">
              <label className="text-[10px] text-neutral-300 block">Short Break (min)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={pomoSettings.shortBreakDuration}
                onChange={(e) =>
                  onUpdatePomoSettings({ shortBreakDuration: Math.max(1, parseInt(e.target.value) || 5) })
                }
                className="w-full bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono outline-none"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 space-y-1">
              <label className="text-[10px] text-neutral-300 block">Long Break (min)</label>
              <input
                type="number"
                min="5"
                max="45"
                value={pomoSettings.longBreakDuration}
                onChange={(e) =>
                  onUpdatePomoSettings({ longBreakDuration: Math.max(5, parseInt(e.target.value) || 15) })
                }
                className="w-full bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-neutral-200 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={pomoSettings.autoStartBreaks}
              onChange={(e) => onUpdatePomoSettings({ autoStartBreaks: e.target.checked })}
              className="rounded border-white/30 text-rose-500 focus:ring-rose-400 bg-black/40"
            />
            <span>Automatically advance between Focus and Breaks</span>
          </label>
        </div>

        {/* Daily Focus Goal Configuration */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Target className={`w-3.5 h-3.5 ${currentTheme.classes.accentText}`} />
              <span>Daily Focus Goal (Pomodoros)</span>
            </div>
            <span className="font-mono text-white font-semibold">
              {pomoSettings.dailyFocusGoal || 8} 🎯 ({Math.round(((pomoSettings.dailyFocusGoal || 8) * (pomoSettings.focusDuration || 25)) / 60 * 10) / 10} hrs)
            </span>
          </div>

          <p className="text-[11px] text-neutral-300/70">
            Set your target number of completed Pomodoros for each day. This powers the circular progress ring on your main task view.
          </p>

          <div className="p-3.5 rounded-xl bg-black/25 border border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-200">Target Pomodoros / Day</span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const current = pomoSettings.dailyFocusGoal || 8;
                    onUpdatePomoSettings({ dailyFocusGoal: Math.max(1, current - 1) });
                  }}
                  className="w-7 h-7 rounded-lg bg-black/40 hover:bg-white/10 border border-white/15 text-neutral-200 text-sm flex items-center justify-center font-bold active:scale-95"
                  title="Decrease goal"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono font-bold text-sm text-white">
                  {pomoSettings.dailyFocusGoal || 8}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const current = pomoSettings.dailyFocusGoal || 8;
                    onUpdatePomoSettings({ dailyFocusGoal: Math.min(24, current + 1) });
                  }}
                  className="w-7 h-7 rounded-lg bg-black/40 hover:bg-white/10 border border-white/15 text-neutral-200 text-sm flex items-center justify-center font-bold active:scale-95"
                  title="Increase goal"
                >
                  +
                </button>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={pomoSettings.dailyFocusGoal || 8}
              onChange={(e) => onUpdatePomoSettings({ dailyFocusGoal: parseInt(e.target.value) || 8 })}
              className="w-full accent-rose-400 cursor-pointer"
            />

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { count: 4, label: '4 (Light · 2h)' },
                { count: 6, label: '6 (Steady · 3h)' },
                { count: 8, label: '8 (Goal · 4h)' },
                { count: 12, label: '12 (Deep · 6h)' },
              ].map((preset) => (
                <button
                  key={preset.count}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onUpdatePomoSettings({ dailyFocusGoal: preset.count });
                  }}
                  className={`py-1 px-1 rounded-lg border text-[10px] font-medium transition-all ${
                    (pomoSettings.dailyFocusGoal || 8) === preset.count
                      ? `${currentTheme.classes.accentBorder} bg-white/20 text-white shadow-sm font-semibold`
                      : 'border-white/10 bg-black/25 text-neutral-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sound & Audio Effects Volume */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Volume2 className={`w-3.5 h-3.5 ${currentTheme.classes.accentText}`} />
              <span>Effects & Chime Volume</span>
            </div>
            <span className="font-mono text-white font-semibold">
              {Math.round(pomoSettings.soundVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={pomoSettings.soundVolume}
            onChange={(e) => onUpdatePomoSettings({ soundVolume: parseFloat(e.target.value) })}
            className="w-full accent-rose-400 cursor-pointer"
          />
        </div>

        {/* macOS Native Desktop App (.app / .dmg) */}
        <div className="space-y-2 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <div className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-emerald-400" />
              <span>Native macOS Desktop App</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              .DMG / .APP
            </span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            Run SakuraFocus directly on macOS without a web browser. Includes native window frame, system dock badge, frosted glass vibrancy, and notifications.
          </p>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenMacAppModal?.();
            }}
            className="w-full py-2 px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white flex items-center justify-center gap-2 text-xs font-medium transition-all shadow-sm active:scale-[0.99] cursor-pointer"
          >
            <Laptop className="w-4 h-4 text-emerald-300" />
            <span>Build &amp; Install macOS App Guide...</span>
          </button>
        </div>

        {/* Project Code Export to Folder */}
        <div className="space-y-2 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Download className={`w-3.5 h-3.5 ${currentTheme.classes.accentText}`} />
            <span>Export Code to Local Folder</span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            Download the complete project workspace (React 19, Vite, Tailwind v4, Electron macOS config, Lucide icons) packaged as a <code className="px-1 py-0.5 rounded bg-black/40 text-neutral-200 font-mono text-[10px]">.zip</code> archive.
          </p>
          <button
            type="button"
            onClick={async () => {
              playClickSound();
              setIsExporting(true);
              try {
                await exportProjectZip();
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
            className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
              isExporting
                ? 'opacity-60 cursor-not-allowed bg-white/10 border-white/10 text-white'
                : `${currentTheme.classes.accentBorder} bg-white/15 hover:bg-white/25 text-white shadow-sm active:scale-[0.99]`
            }`}
          >
            <FolderDown className="w-4 h-4" />
            <span>{isExporting ? 'Packaging project files...' : 'Download Code (.zip)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
