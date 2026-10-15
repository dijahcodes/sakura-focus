import { useEffect, useRef } from 'react';
import { ColorScheme } from '../types.ts';
import { getColorSchemeConfig } from '../utils/theme.ts';

// Sakura petal interface for animation
interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayOffset: number;
  swayAmplitude: number;
  rotation: number;
  rotationSpeed: number;
  rollAngle: number;
  rollSpeed: number;
  opacity: number;
  maxOpacity: number;
  fadeSpeed: number;
  colorType: number; // 0, 1, or 2 for subtle petal color variations
}

// Global trigger function that components can call from anywhere
type SakuraTriggerListener = (count?: number) => void;
const listeners = new Set<SakuraTriggerListener>();

export function triggerSakuraRain(count = 35) {
  listeners.forEach((fn) => fn(count));
}

// Draw a realistic cherry blossom / nature petal with a subtle notched top
function drawSakuraPetal(
  ctx: CanvasRenderingContext2D,
  size: number,
  colorType: number,
  opacity: number,
  palette?: {
    type0: [string, string, string];
    type1: [string, string, string];
    type2: [string, string, string];
  }
) {
  ctx.save();
  ctx.beginPath();

  // Create gradient from base to lighter soft tip
  const grad = ctx.createLinearGradient(0, -size, 0, size);
  if (palette) {
    const pType = colorType === 0 ? palette.type0 : colorType === 1 ? palette.type1 : palette.type2;
    grad.addColorStop(0, pType[0]);
    grad.addColorStop(0.5, pType[1]);
    grad.addColorStop(1, pType[2]);
  } else {
    if (colorType === 0) {
      grad.addColorStop(0, `rgba(254, 205, 211, ${opacity * 0.95})`); // Soft blush
      grad.addColorStop(0.5, `rgba(251, 113, 133, ${opacity * 0.9})`); // Rose pink
      grad.addColorStop(1, `rgba(244, 63, 94, ${opacity * 0.85})`); // Deep rose base
    } else if (colorType === 1) {
      grad.addColorStop(0, `rgba(255, 228, 230, ${opacity * 0.95})`); // Pale cherry
      grad.addColorStop(0.6, `rgba(244, 114, 182, ${opacity * 0.9})`); // Pink
      grad.addColorStop(1, `rgba(225, 29, 72, ${opacity * 0.85})`);
    } else {
      grad.addColorStop(0, `rgba(253, 242, 248, ${opacity * 0.95})`);
      grad.addColorStop(0.5, `rgba(244, 114, 182, ${opacity * 0.85})`);
      grad.addColorStop(1, `rgba(190, 24, 93, ${opacity * 0.8})`);
    }
  }

  ctx.fillStyle = grad;

  // Sakura petal shape with notched/curved top
  ctx.moveTo(0, size);
  ctx.bezierCurveTo(
    -size * 0.8,
    size * 0.4,
    -size * 0.85,
    -size * 0.6,
    -size * 0.35,
    -size
  );
  // Top notch indentation
  ctx.bezierCurveTo(
    -size * 0.15,
    -size * 0.85,
    0,
    -size * 0.8,
    0,
    -size * 0.78
  );
  ctx.bezierCurveTo(
    0,
    -size * 0.8,
    size * 0.15,
    -size * 0.85,
    size * 0.35,
    -size
  );
  // Right curve
  ctx.bezierCurveTo(
    size * 0.85,
    -size * 0.6,
    size * 0.8,
    size * 0.4,
    0,
    size
  );

  ctx.closePath();
  ctx.fill();

  // Subtle central petal vein
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.35})`;
  ctx.lineWidth = Math.max(0.5, size * 0.05);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.8);
  ctx.quadraticCurveTo(size * 0.05, 0, 0, -size * 0.6);
  ctx.stroke();

  ctx.restore();
}

interface SakuraPetalsCanvasProps {
  colorScheme?: ColorScheme;
}

export default function SakuraPetalsCanvas({ colorScheme = 'pink' }: SakuraPetalsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const colorSchemeRef = useRef(colorScheme);

  useEffect(() => {
    colorSchemeRef.current = colorScheme;
  }, [colorScheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to full window
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const activePetals: Petal[] = [];
      const petals = petalsRef.current;
      const currentThemeConfig = getColorSchemeConfig(colorSchemeRef.current);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Update physics
        p.swayOffset += p.swaySpeed;
        p.x += p.speedX + Math.sin(p.swayOffset) * p.swayAmplitude;
        p.y += p.speedY;

        p.rotation += p.rotationSpeed;
        p.rollAngle += p.rollSpeed;

        // Fade away gradually as it falls past half screen or after duration
        if (p.y > canvas.height * 0.55) {
          p.opacity -= p.fadeSpeed * 1.8;
        } else {
          p.opacity -= p.fadeSpeed * 0.2;
        }

        // Keep if still visible and on-screen
        if (p.opacity > 0.01 && p.y < canvas.height + 40) {
          activePetals.push(p);

          // Draw petal with 3D rotation & roll simulation
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          // Tumbling roll (scale X or Y with cos)
          const rollScale = Math.cos(p.rollAngle);
          ctx.scale(1, Math.max(0.15, Math.abs(rollScale)));

          drawSakuraPetal(
            ctx,
            p.size,
            p.colorType,
            Math.max(0, p.opacity),
            currentThemeConfig.petalPalette
          );
          ctx.restore();
        }
      }

      petalsRef.current = activePetals;

      if (activePetals.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        animFrameRef.current = null;
      }
    };

    // Handler when sakura rain is triggered
    const handleTrigger = (count = 35) => {
      const newPetals: Petal[] = [];
      const width = canvas.width || window.innerWidth;

      for (let i = 0; i < count; i++) {
        const startX = Math.random() * width;
        const startY = -20 - Math.random() * 90;
        const size = 10 + Math.random() * 11;
        const maxOpacity = 0.75 + Math.random() * 0.25;

        newPetals.push({
          x: startX,
          y: startY,
          size,
          speedY: 1.8 + Math.random() * 2.2,
          speedX: -0.4 + Math.random() * 1.0,
          swaySpeed: 0.02 + Math.random() * 0.03,
          swayOffset: Math.random() * Math.PI * 2,
          swayAmplitude: 0.8 + Math.random() * 1.4,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.04,
          rollAngle: Math.random() * Math.PI * 2,
          rollSpeed: 0.02 + Math.random() * 0.04,
          opacity: maxOpacity,
          maxOpacity,
          fadeSpeed: 0.0018 + Math.random() * 0.002,
          colorType: Math.floor(Math.random() * 3),
        });
      }

      petalsRef.current.push(...newPetals);

      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    listeners.add(handleTrigger);

    return () => {
      listeners.delete(handleTrigger);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}
