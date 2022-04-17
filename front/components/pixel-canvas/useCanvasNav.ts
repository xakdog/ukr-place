import {Vector} from "vecti";
import {useSetRecoilState} from "recoil";
import {MutableRefObject, useCallback, useEffect, useMemo} from "react";
import {createUseGesture, dragAction, pinchAction, wheelAction} from "@use-gesture/react";

import {canvasPosState} from "../../state/canvas-pos.atom";

type canvasNavArgs = {
  onClick(): void;
  container: MutableRefObject<HTMLDivElement | null>;
}

const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 912;

const scaleBounds = (val: number) => Math.min(80, Math.max(val, 0.2));
const isSameVectors = (a: Vector, b: Vector) => a.subtract(b).length() === 0;
const useGesture = createUseGesture([dragAction, pinchAction, wheelAction]);

const documentBody = typeof document !== 'undefined' ? document.body : undefined;
const screenCenter = typeof window === 'undefined' ?
  new Vector(0, 0) :
  new Vector(window.innerWidth / 2, window.innerHeight / 2);

export const useCanvasNav = ({ container, onClick }: canvasNavArgs) => {
  const state = useMemo(() => ({
    scale: 0.5,
    canvas: new Vector(IMAGE_WIDTH / 2, IMAGE_HEIGHT / 2),
    offset: screenCenter,
    mouse: screenCenter,
    startOffset: new Vector(0, 0),
  }), []);

  const setGlobalPos = useSetRecoilState(canvasPosState);
  const updateGlobalPos = useCallback((pos: Vector) => {
    const intPos = new Vector(
      Math.floor(pos.x),
      Math.floor(pos.y),
    );

    setGlobalPos(state => isSameVectors(state.vector, intPos) ? state : {
      vector: intPos,
      outOfBounds:
        intPos.x < 0 || intPos.x > IMAGE_WIDTH ||
        intPos.y < 0 || intPos.y > IMAGE_HEIGHT,
    });
  }, [setGlobalPos]);

  const updateValues = useCallback(() => {
    const target = container.current;

    if (!target)
      return;

    const real = state.offset.subtract(state.canvas.multiply(state.scale));

    target.style.opacity = '1';
    target.style.transformOrigin = '0 0';
    target.style.transform = `translate(${real.x}px, ${real.y}px) scale(${state.scale})`;

    updateGlobalPos(state.canvas);
  }, [container, setGlobalPos, state, updateGlobalPos]);

  useEffect(() => {
    const target = container.current;

    if (!target) return;

    target.style.width = IMAGE_WIDTH + 'px';
    target.style.height = IMAGE_HEIGHT + 'px';

    updateValues();
  }, [container, updateValues])

  useGesture({
    onDrag: ({ delta: [dx, dy] }) => {
      const delta = new Vector(dx, dy);
      state.canvas = state.canvas.subtract(delta.multiply(1 / state.scale));

      updateValues();
    },
    onDragStart: ({ offset: [ox, oy] }) => {
      state.startOffset = new Vector(ox, oy);
    },
    onDragEnd: ({ offset: [ox, oy], target }) => {
      const offset = new Vector(ox, oy);
      const delta = state.startOffset.subtract(offset);

      if (target !== container.current?.parentNode)
        return;

      if (delta.length() > 1)
        return;

      onClick();
    },
    onPinch: ({ offset: [dScale, _rotation] }) => {
      state.scale = scaleBounds(dScale);
      updateValues();
    },
    onWheel: ({ delta: [_dX, dY] }) => {
      state.scale = scaleBounds(state.scale - state.scale * dY / 80);
      updateValues();
    },
  }, {
    target: documentBody,
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';

    const onWindowResize = () => {
      state.offset = new Vector(window.innerWidth / 2, window.innerHeight / 2);
      updateValues();
    };

    // TODO: use mouse position to aim
    // TODO: introduce boundaries
    const onMouseMove = (ev: MouseEvent) => {
      state.mouse = new Vector(ev.offsetX, ev.offsetY);
    };

    const preventDefault = (e: Event) => e.preventDefault();

    window?.addEventListener('resize', onWindowResize);
    window?.addEventListener('mousemove', onMouseMove);
    document.addEventListener('gesturestart', preventDefault);
    document.addEventListener('gesturechange', preventDefault);

    return () => {
      window?.removeEventListener('resize', onWindowResize);
      window?.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('gesturestart', preventDefault);
      document.removeEventListener('gesturechange', preventDefault);
    }
  }, []);
};
