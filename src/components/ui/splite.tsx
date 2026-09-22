import React, { Suspense, lazy, memo } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export interface SplineSceneProps {
  scene?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: (splineApp: any) => void;
}

export const SplineScene = memo(function SplineScene({
  scene = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',
  className = 'w-full h-full',
  style,
  onLoad,
}: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full min-h-[350px] flex items-center justify-center">
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
        onLoad={onLoad}
      />
    </Suspense>
  );
});

export default SplineScene;
