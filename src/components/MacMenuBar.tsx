import { useState, useEffect } from 'react';
import { Wifi, Battery, Sliders, Volume2, VolumeX, Sparkles, CheckSquare, Clock, Palette, Check, FolderDown, Laptop } from 'lucide-react';
import { PomodoroMode, ColorScheme } from '../types.ts';
import { playClickSound, ambientEngine } from '../utils/sound.ts';
import { COLOR_SCHEME_LIST, getColorSchemeConfig } from '../utils/theme.ts';
import { exportProjectZip } from '../utils/exportProject.ts';

interface MacMenuBarProps {
  onOpenControlCenter: () => void;
  onOpenNewTask: () => void;
  onTogglePomodoro: () => void;
  onClearCompleted: () => void;
  onResetTasks: () => void;
  pomoTimeRemaining: number;
  pomoIsRunning: boolean;
  pomoMode: PomodoroMode;
  activeTaskTitle?: string;
  ambientSound: 'none' | 'pinkNoise' | 'rain' | 'lofiChords';
  onSelectAmbient: (ambient: 'none' | 'pinkNoise' | 'rain' | 'lofiChords') => void;
  opacity: number;
  onSetOpacity: (op: number) => void;
  onShowerSakura?: () => void;
  colorScheme?: ColorScheme;
  onSelectColorScheme?: (scheme: ColorScheme) => void;
  onOpenMacAppModal?: () => void;
}

export default function MacMenuBar({
  onOpenControlCenter,
  onOpenNewTask,
  onTogglePomodoro,
  onClearCompleted,
  onResetTasks,
  pomoTimeRemaining,
  pomoIsRunning,
  pomoMode,
  activeTaskTitle,
  ambientSound,
  onSelectAmbient,
  opacity,
  onSetOpacity,
  onShowerSakura,
  colorScheme = 'pink',
  onSelectColorScheme,
  onOpenMacAppModal,
}: MacMenuBarProps) {
  const [timeStr, setTimeStr] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);

  const currentTheme = getColorSchemeConfig(colorScheme);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'short' });
      const month = now.toLocaleDateString('en-US', { month: 'short' });
      const date = now.getDate();
      const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      setTimeStr(`${day} ${month} ${date}  ${time}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format timer MM:SS
  const mins = Math.floor(pomoTimeRemaining / 60);
  const secs = pomoTimeRemaining % 60;
  const formattedTimer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const closeMenus = () => {
    setActiveMenu(null);
    setShowAmbientMenu(false);
  };

  useEffect(() => {
    const handleGlobalClick = () => closeMenus();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 h-7 z-50 flex items-center justify-between px-3 text-xs select-none backdrop-blur-xl ${currentTheme.classes.menuBarBg} shadow-sm transition-colors`}>
      {/* Left Menu Items */}
      <div className="flex items-center gap-1">
        {/* Apple Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              setActiveMenu(activeMenu === 'apple' ? null : 'apple');
            }}
            className="px-2 py-0.5 rounded hover:bg-white/10 active:bg-white/20 transition-colors flex items-center font-serif text-sm text-neutral-100"
          >
            
          </button>
          {activeMenu === 'apple' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-0 top-7 w-60 py-1.5 ${currentTheme.classes.modalBg} backdrop-blur-2xl border ${currentTheme.classes.modalBorder} rounded-lg shadow-2xl text-neutral-100 z-50 text-xs`}
            >
              <div className="px-3 py-1 font-semibold text-white border-b border-white/10 mb-1 flex items-center justify-between">
                <span>SakuraFocus macOS</span>
                <span className="text-[10px] text-emerald-400 font-mono">v1.3 Native</span>
              </div>
              <button
                onClick={() => {
                  onOpenMacAppModal?.();
                  closeMenus();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between font-medium text-emerald-300"
              >
                <span className="flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Build macOS App (.dmg)...</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-1 py-0.5 rounded text-emerald-300 border border-emerald-500/30">.app</span>
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  onOpenControlCenter();
                  closeMenus();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between"
              >
                <span>System Preferences...</span>
                <span className="text-[10px] text-neutral-400">⌘,</span>
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  onResetTasks();
                  closeMenus();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-neutral-300"
              >
                Restore Default Sample Tasks
              </button>
            </div>
          )}
        </div>

        {/* App Name */}
        <span className="font-semibold text-white px-2 py-0.5 tracking-wide">SakuraFocus</span>

        {/* File Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              setActiveMenu(activeMenu === 'file' ? null : 'file');
            }}
            className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-0 top-7 w-60 py-1.5 ${currentTheme.classes.modalBg} backdrop-blur-2xl border ${currentTheme.classes.modalBorder} rounded-lg shadow-2xl text-neutral-100 z-50 text-xs`}
            >
              <button
                onClick={() => {
                  onOpenNewTask();
                  closeMenus();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between"
              >
                <span>New Task</span>
                <span className="text-[10px] text-neutral-400">⌘N</span>
              </button>
              <button
                onClick={() => {
                  onTogglePomodoro();
                  closeMenus();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between"
              >
                <span>Toggle Pomodoro Clock</span>
                <span className="text-[10px] text-neutral-400">⌘P</span>
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  onOpenMacAppModal?.();
                  closeMenus();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between text-emerald-300 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Build macOS App (.dmg)...</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-1 rounded text-emerald-300">macOS</span>
              </button>
              <button
                onClick={async () => {
                  closeMenus();
                  playClickSound();
                  await exportProjectZip();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between text-neutral-100 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <FolderDown className="w-3.5 h-3.5 text-rose-300" />
                  <span>Export Code to Folder (ZIP)...</span>
                </span>
                <span className="text-[10px] text-neutral-400">⌘E</span>
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  onClearCompleted();
                  closeMenus();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/10"
              >
                Clear Completed Tasks
              </button>
            </div>
          )}
        </div>

        {/* Theme Menu (Pink, Yellow, Blue, Red, Orange, Green, Black/Grey) */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              setActiveMenu(activeMenu === 'theme' ? null : 'theme');
            }}
            className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1.5"
          >
            <span
              className={`w-2 h-2 rounded-full bg-gradient-to-tr ${currentTheme.swatchGradient} ring-1 ring-white/40`}
            />
            <span>Theme</span>
          </button>
          {activeMenu === 'theme' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-0 top-7 w-56 py-1.5 ${currentTheme.classes.modalBg} backdrop-blur-2xl border ${currentTheme.classes.modalBorder} rounded-lg shadow-2xl text-neutral-100 z-50 text-xs`}
            >
              <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Color Scheme & Background
              </div>
              {COLOR_SCHEME_LIST.map((scheme) => {
                const isSelected = colorScheme === scheme.id;
                return (
                  <button
                    key={scheme.id}
                    onClick={() => {
                      playClickSound();
                      if (onSelectColorScheme) onSelectColorScheme(scheme.id);
                      closeMenus();
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between ${
                      isSelected ? 'font-semibold text-white bg-white/10' : 'text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${scheme.swatchGradient} border border-white/30`}
                      />
                      <span>{scheme.name}</span>
                      {scheme.id === 'pink' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30">
                          Original
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  onOpenControlCenter();
                  closeMenus();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-neutral-300 flex items-center justify-between"
              >
                <span>Theme Preferences...</span>
                <span className="text-[10px] text-neutral-400">⌘,</span>
              </button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              setActiveMenu(activeMenu === 'view' ? null : 'view');
            }}
            className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-0 top-7 w-52 py-1.5 ${currentTheme.classes.modalBg} backdrop-blur-2xl border ${currentTheme.classes.modalBorder} rounded-lg shadow-2xl text-neutral-100 z-50 text-xs`}
            >
              <div className="px-3 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Glass Transparency
              </div>
              <button
                onClick={() => {
                  onSetOpacity(0.55);
                  closeMenus();
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between ${opacity === 0.55 ? 'text-white font-semibold' : ''}`}
              >
                <span>Ultra Translucent</span>
                <span>55%</span>
              </button>
              <button
                onClick={() => {
                  onSetOpacity(0.8);
                  closeMenus();
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between ${opacity === 0.8 ? 'text-white font-semibold' : ''}`}
              >
                <span>Standard Glass</span>
                <span>80%</span>
              </button>
              <button
                onClick={() => {
                  onSetOpacity(0.95);
                  closeMenus();
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between ${opacity === 0.95 ? 'text-white font-semibold' : ''}`}
              >
                <span>Solid Frosted Glass</span>
                <span>95%</span>
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  closeMenus();
                  if (onShowerSakura) onShowerSakura();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-neutral-200 flex items-center justify-between"
              >
                <span>Shower Nature Petals</span>
                <span>✨</span>
              </button>
            </div>
          )}
        </div>

        {/* Clock Menu */}
        <div className="relative">
          <button
            onClick={() => onTogglePomodoro()}
            className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
          >
            Pomodoro
          </button>
        </div>
      </div>

      {/* Right Menu Tray */}
      <div className="flex items-center gap-3">
        {/* Live Active Pomodoro Status in Menu Bar */}
        <button
          onClick={() => onTogglePomodoro()}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all text-[11px] ${
            pomoIsRunning
              ? `${currentTheme.classes.badgeBg} ${currentTheme.classes.badgeText} border ${currentTheme.classes.badgeBorder} shadow-sm`
              : 'hover:bg-white/10 text-neutral-200'
          }`}
          title={activeTaskTitle ? `Focusing on: ${activeTaskTitle}` : 'Pomodoro Status'}
        >
          <span className={`w-2 h-2 rounded-full ${pomoIsRunning ? `${currentTheme.classes.accentBg} animate-pulse` : 'bg-neutral-400'}`} />
          <span className="font-mono tabular-nums font-medium">{formattedTimer}</span>
          <span className="text-[10px] text-neutral-300/80">
            {pomoMode === 'focus' ? 'Focus' : pomoMode === 'shortBreak' ? 'Break' : 'Long Break'}
          </span>
        </button>

        {/* Ambient Sound Selector */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              setShowAmbientMenu(!showAmbientMenu);
            }}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${
              ambientSound !== 'none' ? currentTheme.classes.accentText : 'text-neutral-300/70'
            }`}
            title="Ambient Focus Audio"
          >
            {ambientSound === 'none' ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
          </button>

          {showAmbientMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute right-0 top-7 w-48 py-1.5 ${currentTheme.classes.modalBg} backdrop-blur-2xl border ${currentTheme.classes.modalBorder} rounded-lg shadow-2xl text-neutral-100 z-50 text-xs`}
            >
              <div className="px-3 py-1 font-semibold text-white border-b border-white/10 mb-1">
                Ambient Focus Audio
              </div>
              <button
                onClick={() => {
                  onSelectAmbient('none');
                  setShowAmbientMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between ${
                  ambientSound === 'none' ? 'text-white font-semibold' : 'text-neutral-300'
                }`}
              >
                <span>Muted (Off)</span>
                {ambientSound === 'none' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onSelectAmbient('pinkNoise');
                  setShowAmbientMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between ${
                  ambientSound === 'pinkNoise' ? 'text-white font-semibold' : 'text-neutral-300'
                }`}
              >
                <span>Pink Noise (Calm)</span>
                {ambientSound === 'pinkNoise' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onSelectAmbient('rain');
                  setShowAmbientMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between ${
                  ambientSound === 'rain' ? 'text-white font-semibold' : 'text-neutral-300'
                }`}
              >
                <span>Gentle Rain</span>
                {ambientSound === 'rain' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onSelectAmbient('lofiChords');
                  setShowAmbientMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between ${
                  ambientSound === 'lofiChords' ? 'text-white font-semibold' : 'text-neutral-300'
                }`}
              >
                <span>Warm Lofi Chords</span>
                {ambientSound === 'lofiChords' && <span>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Mac Control Center Toggle */}
        <button
          onClick={() => {
            playClickSound();
            onOpenControlCenter();
          }}
          className="p-1 rounded hover:bg-white/10 transition-colors text-neutral-200"
          title="Control Center & Appearance"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Standard macOS system indicators */}
        <div className="flex items-center gap-2 text-neutral-300">
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1 text-[11px]">
            <span>100%</span>
            <Battery className="w-4 h-4 text-emerald-300" />
          </div>
        </div>

        {/* Current Date Time */}
        <span className="text-white font-medium tracking-tight text-[11px] whitespace-nowrap pl-1">
          {timeStr}
        </span>
      </div>
    </header>
  );
}
