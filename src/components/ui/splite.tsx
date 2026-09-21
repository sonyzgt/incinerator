import React, { Suspense, lazy, useCallback } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export interface SplineSceneProps {
  scene?: string;
  className?: string;
  style?: React.CSSProperties;
  zoom?: number;
  onLoad?: (splineApp: any) => void;
}

export function SplineScene({
  scene = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',
  className = 'w-full h-full',
  style,
  zoom = 1.0,
  onLoad,
}: SplineSceneProps) {
  const handleOnLoad = useCallback(
    (app: any) => {
      try {
        if (zoom && typeof app.setZoom === 'function') {
          app.setZoom(zoom);
        }
      } catch (e) {
        // ignore if not supported by current controls
      }
      if (onLoad) {
        onLoad(app);
      }
    },
    [zoom, onLoad]
  );

  return (
    <Suspense
      fallback={
        <div className="w-full h-full min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-7 h-7 border-2 border-[#ff5722] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] font-mono text-[#a6a39d] uppercase tracking-wider">
              Initializing Autonomous Bot...
            </span>
          </div>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        style={style}
        onLoad={handleOnLoad}
      />
    </Suspense>
  );
}

export default SplineScene;
