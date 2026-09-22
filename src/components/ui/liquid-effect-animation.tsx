import React, { useEffect, useRef, memo } from 'react';

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

export const LiquidEffectAnimation = memo(function LiquidEffectAnimation({
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
    const canvas = canvasRef.current;

    async function init() {
      if (!canvasRef.current || isDisposed) return;

      try {
        if (appInstance && typeof appInstance.dispose === 'function') {
          appInstance.dispose();
          appInstance = null;
        }

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

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('LiquidEffectAnimation: WebGL context lost. Waiting for restoration...');
    };

    const handleContextRestored = () => {
      console.info('LiquidEffectAnimation: WebGL context restored. Reinitializing...');
      if (!isDisposed) {
        init();
      }
    };

    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);
    }

    init();

    return () => {
      isDisposed = true;
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      }
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
});

export default LiquidEffectAnimation;
