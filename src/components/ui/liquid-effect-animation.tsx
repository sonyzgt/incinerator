import React, { useEffect, useRef } from 'react';

export interface LiquidEffectAnimationProps {
  color?: string;
  metalness?: number;
  roughness?: number;
  displacementScale?: number;
  rain?: boolean;
  rainTimeDelta?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function LiquidEffectAnimation({
  color,
  metalness = 0.85,
  roughness = 0.2,
  displacementScale = 5,
  rain = true,
  rainTimeDelta = 0.25,
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

        // Initialize pure procedural WebGL liquid effect with zero external png textures
        const app = LiquidBackground(canvasRef.current);
        appInstance = app;

        if (app.liquidPlane && app.liquidPlane.material) {
          app.liquidPlane.material.metalness = metalness;
          app.liquidPlane.material.roughness = roughness;
          if (color && app.liquidPlane.material.color && typeof app.liquidPlane.material.color.set === 'function') {
            app.liquidPlane.material.color.set(color);
          }
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
  }, [color, metalness, roughness, displacementScale, rain, rainTimeDelta]);

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
