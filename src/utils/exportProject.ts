import JSZip from 'jszip';

// Load source code files across the project dynamically via Vite raw import glob
const rawFiles = import.meta.glob<string>(
  [
    '../../**/*.{ts,tsx,js,jsx,cjs,mjs,json,css,html,md,svg,sh}',
    '../**/*.{ts,tsx,js,jsx,cjs,mjs,json,css,html,md,svg,sh}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/dist-mac/**',
    '!**/.aistudio/**',
    '!**/.git/**',
    '!**/bun.lock'
  ],
  { query: '?raw', import: 'default', eager: true }
);

/**
 * Generates and downloads a complete zip archive of all source code in the project
 * fully configured to run and build as a native macOS application (.app / .dmg) via Electron.
 */
export async function exportProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Add source files
  for (const [path, content] of Object.entries(rawFiles)) {
    if (typeof content !== 'string') continue;
    // Clean up relative path prefix (e.g., '../../package.json' -> 'package.json')
    const cleanPath = path
      .replace(/^(\.\.\/)+/, '')
      .replace(/^\.\//, '');

    if (!cleanPath || cleanPath.startsWith('node_modules') || cleanPath.startsWith('.git') || cleanPath.startsWith('dist-mac')) {
      continue;
    }

    zip.file(cleanPath, content);
  }

  // Include detailed macOS Native App guide
  const macOsGuide = `# Running & Building SakuraFocus as a Native macOS App (.app / .dmg)

SakuraFocus is configured with **Electron** and **electron-builder** to run as a real native macOS desktop application — with authentic macOS window styling (\`hiddenInset\` traffic light buttons, frosted glass backdrop translucency, native dock badge, system menu shortcuts, and macOS notifications).

---

## ⚡ Option A: 1-Click Build Script for macOS

Open Terminal on your Mac, navigate into this unzipped directory, and run:

\`\`\`bash
chmod +x build-mac-app.sh
./build-mac-app.sh
\`\`\`

This will:
1. Install all dependencies automatically.
2. Compile and package the native macOS app.
3. Generate \`SakuraFocus.dmg\` and \`SakuraFocus.app\` inside the \`dist-mac/\` folder.
4. Open the folder in Finder so you can drag \`SakuraFocus.app\` into your macOS \`/Applications\` folder!

---

## 💻 Option B: Manual Commands

### 1. Run as a Native macOS Desktop App (Live Development)
\`\`\`bash
npm install
npm run electron:dev
\`\`\`
This opens SakuraFocus in a standalone native macOS window (no browser needed).

### 2. Build the Standalone macOS Installer (.dmg) & Application (.app)
\`\`\`bash
npm run build:mac
\`\`\`
Outputs to \`dist-mac/\`:
- **SakuraFocus-1.0.0.dmg** (Drag-to-install disk image for macOS)
- **SakuraFocus.app** (Double-click runnable macOS desktop application)
- **SakuraFocus-1.0.0-mac.zip**

Both Apple Silicon (M1/M2/M3/M4) and Intel Macs are supported.

---

## 🌸 Native macOS Features Included
- **macOS Window Frame**: Embedded traffic lights (close, minimize, zoom) with native window dragging.
- **Frosted Glass Vibrancy**: Translucent background using native macOS blur filters.
- **Dock Badge**: Live counter in your macOS dock showing remaining focus tasks.
- **Native Notifications**: Chimes and desktop banners when your Pomodoro or break completes.
- **Native Menu Bar Integration**: Full Apple , File, Timer, View, and Window menus with keyboard shortcuts (⌘N for new task, ⌘, for Preferences, Space for timer).
`;

  zip.file('MACOS_NATIVE_APP_GUIDE.md', macOsGuide);

  // General README
  const readmeContent = `# SakuraFocus - macOS Desktop Productivity Suite

A sleek, translucent macOS-native desktop productivity suite combining an intuitive to-do task organizer with a Pomodoro focus timer, ambient audio generator, and 7 customizable glass color schemes (Pink Sakura, Monterey Blue, Honey Amber, Crimson Ruby, Tangerine Sunset, Emerald Forest, Obsidian Slate).

## Quick Start as Native macOS App (.dmg / .app)
Run this command in Terminal on your Mac:
\`\`\`bash
./build-mac-app.sh
\`\`\`
Or manually:
\`\`\`bash
npm install
npm run build:mac
\`\`\`
Your installer \`SakuraFocus.dmg\` will be generated in \`dist-mac/\`!

## Quick Start in Local Dev
\`\`\`bash
npm install
npm run electron:dev   # Opens native desktop window
# or
npm run dev            # Opens local web preview
\`\`\`

Enjoy your focused flow! 🌸
`;

  zip.file('README.md', readmeContent);

  // Generate ZIP blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'sakurafocus-macos-app.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
