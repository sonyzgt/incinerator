import React, { useEffect, useRef } from 'react';

export interface LiquidEffectAnimationProps {
  imageUrl?: string;
  metalness?: number;
  roughness?: number;
  displacementScale?: number;
  rain?: boolean;
  rainTimeDelta?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function LiquidEffectAnimation({
  imageUrl = '/liquid-texture.png',
  metalness = 0.8,
  roughness = 0.22,
  displacementScale = 5,
  rain = true,
  rainTimeDelta = 0.2,
  className = 'absolute inset-0 w-full h-full pointer-events-none',
  style,
}: LiquidEffectAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let appInstance: any = null;
    let isDisposed = false;

    async function init() {
      if (!canvasRef.current) return;

      try {
        // @ts-expect-error no bundled types for liquid1.min.js
        const module = await import('threejs-components/build/backgrounds/liquid1.min.js');
        const LiquidBackground = module.default || module;

        if (isDisposed || !canvasRef.current) return;

        const app = LiquidBackground(canvasRef.current);
        appInstance = app;

        if (imageUrl) {
          try {
            await app.loadImage(imageUrl);
          } catch {
            // Fallback to CDN if local asset fails
            await app.loadImage('https://cdn.21st.dev/assets/mirror/95/95e97d22cb2df434400243c60803fb89a5e25a46dad13c4a6d5cb27246173cf0.png');
          }
        }

        if (app.liquidPlane && app.liquidPlane.material) {
          app.liquidPlane.material.metalness = metalness;
          app.liquidPlane.material.roughness = roughness;
        }

        if (app.liquidPlane && app.liquidPlane.uniforms && app.liquidPlane.uniforms.displacementScale) {
          app.liquidPlane.uniforms.displacementScale.value = displacementScale;
        }

        if (typeof app.setRain === 'function') {
          app.setRain(rain);
        }
        if (typeof app.setRainTime === 'function') {
          app.setRainTime(rainTimeDelta);
        }
      } catch (err) {
        console.error('Failed to initialize LiquidBackground:', err);
      }
    }

    init();

    return () => {
      isDisposed = true;
      if (appInstance && typeof appInstance.dispose === 'function') {
        appInstance.dispose();
      }
    };
  }, [imageUrl, metalness, roughness, displacementScale, rain, rainTimeDelta]);

  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        id="liquid-canvas"
        className="w-full h-full block"
      />
    </div>
  );
}

export default LiquidEffectAnimation;
