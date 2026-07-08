export interface PlacementState {
  xPercent: number;
  yPercent: number;
  scalePercent: number;
  rotationDeg: number;
}

export interface MaskBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface StageSize {
  width: number;
  height: number;
}

export type InteractionMode = 'drag' | 'resize' | 'rotate';

export interface InteractionSnapshot {
  mode: InteractionMode;
  pointerStartX: number;
  pointerStartY: number;
  startXPercent: number;
  startYPercent: number;
  startScalePercent: number;
  startRotationDeg: number;
  zoneRect: DOMRect;
  logoCenterX: number;
  logoCenterY: number;
  startPointerAngleDeg: number;
}
