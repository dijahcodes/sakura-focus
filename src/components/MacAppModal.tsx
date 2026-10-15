import { useState } from 'react';
import { 
  X, 
  Terminal, 
  Download, 
  Check, 
  Copy, 
  FolderDown, 
  Laptop, 
  Sparkles, 
  ShieldCheck, 
  HardDrive
} from 'lucide-react';
import { exportProjectZip } from '../utils/exportProject.ts';
import { playClickSound } from '../utils/sound.ts';
import { ColorScheme } from '../types.ts';
import { getColorSchemeConfig } from '../utils/theme.ts';

interface MacAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorScheme: ColorScheme;
}

export function MacAppModal({ isOpen, onClose, colorScheme }: MacAppModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const currentTheme = getColorSchemeConfig(colorScheme);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    playClickSound();
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = async () => {
    playClickSound();
    setIsExporting(true);
    try {
      await exportProjectZip();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl ${currentTheme.classes.modalBg} border ${currentTheme.classes.modalBorder} backdrop-blur-3xl shadow-2xl text-neutral-100 overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/15 text-lg font-serif shadow-inner`}>
              
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">SakuraFocus for macOS</h2>
                <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Native .app & .dmg
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Run natively on your Mac desktop as an installed application — no browser or web required.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm">
          {/* Highlight Banner */}
          <div className={`p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3.5`}>
            <div className={`p-2 rounded-lg ${currentTheme.classes.accentBg} text-white shrink-0 mt-0.5 shadow-sm`}>
              <Laptop size={18} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
                100% Native macOS Standalone Desktop
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                This app is pre-configured with <strong className="text-white">Electron</strong> and <strong className="text-white">electron-builder</strong>. When built, it runs inside a native macOS window with authentic macOS traffic lights, frosted glass blur, system dock badges, and native notifications.
              </p>
            </div>
          </div>

          {/* Quick Action: 1-Click Code Download */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white flex items-center gap-1.5">
                  <FolderDown size={16} className="text-neutral-300" />
                  Step 1: Download macOS App Source Package
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Includes full Electron main process, packaging scripts, and ready-to-run macOS configuration.
                </p>
              </div>
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 ${currentTheme.classes.accentBg} ${currentTheme.classes.accentHoverBg} text-white shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50`}
              >
                {isExporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Packaging...
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    Download (.zip)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: One-Command Build */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="font-medium text-white flex items-center gap-1.5">
              <Terminal size={16} className="text-neutral-300" />
              Step 2: Build Native macOS .DMG & .APP Bundle
            </h4>
            <p className="text-xs text-neutral-300">
              Open Terminal on your Mac, navigate into the unzipped folder, and run:
            </p>

            {/* Code Box 1 */}
            <div className="relative group">
              <pre className="p-3 bg-black/60 border border-white/10 rounded-lg font-mono text-xs text-emerald-300 overflow-x-auto">
                ./build-mac-app.sh
              </pre>
              <button
                onClick={() => copyToClipboard('./build-mac-app.sh', 1)}
                className="absolute right-2 top-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                title="Copy command"
              >
                {copiedIndex === 1 ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Or manually run:
            </p>

            {/* Code Box 2 */}
            <div className="relative group">
              <pre className="p-3 bg-black/60 border border-white/10 rounded-lg font-mono text-xs text-neutral-200 overflow-x-auto">
                npm install && npm run build:mac
              </pre>
              <button
                onClick={() => copyToClipboard('npm install && npm run build:mac', 2)}
                className="absolute right-2 top-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                title="Copy command"
              >
                {copiedIndex === 2 ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Step 3: Install on Mac */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-medium text-white flex items-center gap-1.5">
              <HardDrive size={16} className="text-neutral-300" />
              Step 3: Install & Launch
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              The build produces <strong className="text-white">dist-mac/SakuraFocus.dmg</strong> and <strong className="text-white">dist-mac/SakuraFocus.app</strong>.
            </p>
            <ul className="text-xs text-neutral-400 list-disc list-inside space-y-1 ml-1">
              <li>Double-click the <strong className="text-neutral-200">.dmg</strong> disk image.</li>
              <li>Drag <strong className="text-neutral-200">SakuraFocus.app</strong> into your <strong className="text-neutral-200">/Applications</strong> folder.</li>
              <li>Launch it from Spotlight (⌘Space), Launchpad, or your Dock anytime!</li>
            </ul>
          </div>

          {/* Native Features Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 font-medium text-white">
                <Sparkles size={14} className="text-pink-400" />
                <span>Native macOS Frame</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Authentic traffic lights with native window dragging and frosted glass under-window vibrancy.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 font-medium text-white">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Offline & Private</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                100% local persistence on your Mac. All tasks, stats, and audio synthesis work completely offline.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 bg-black/20">
          <span>Compatible with Apple Silicon (M1/M2/M3/M4) & Intel Macs</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
