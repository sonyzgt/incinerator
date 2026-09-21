import React, { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export interface SplineSceneProps {
  scene?: string;
  className?: string;
  onLoad?: (splineApp: any) => void;
}

export function SplineScene({
  scene = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',
  className = 'w-full h-full',
  onLoad,
}: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full min-h-[320px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-6 h-6 border-2 border-[#ff5722] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] font-mono text-[#a6a39d] uppercase tracking-wider">
              Loading 3D Bot...
            </span>
          </div>
        </div>
      }
    >
      <Spline scene={scene} className={className} onLoad={onLoad} />
    </Suspense>
  );
}

export default SplineScene;
