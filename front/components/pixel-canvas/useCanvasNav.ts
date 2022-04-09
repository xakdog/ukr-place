import {Vector} from "vecti";
import {MutableRefObject, useCallback, useEffect, useMemo} from "react";
import {createUseGesture, dragAction, pinchAction, wheelAction} from "@use-gesture/react";

const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 912;

const scaleBounds = (val: number) => Math.min(80, Math.max(val, 0.2));
const useGesture = createUseGesture([dragAction, pinchAction, wheelAction]);

export const useCanvasNav = (container: MutableRefObject<HTMLElement | undefined>) => {
  if (typeof window === 'undefined') {
    return;
  }

  const state = useMemo(() => ({
    scale: 0.5,
    canvas: new Vector(IMAGE_WIDTH / 2, IMAGE_HEIGHT / 2),
    offset: new Vector(window.innerWidth / 2, window.innerHeight / 2),
    mouse: new Vector(window.innerWidth / 2, window.innerHeight / 2),
  }), []);

  const updateValues = useCallback(() => {
    const target = container.current;

    if (!target)
      return;

    const real = state.offset.subtract(state.canvas.multiply(state.scale));

    target.style.opacity = '1';
    target.style.transformOrigin = '0 0';
    target.style.transform = `translate(${real.x}px, ${real.y}px) scale(${state.scale})`;
  }, [container, state]);

  useEffect(() => {
    const target = container.current;

    if (!target) return;

    target.style.width = IMAGE_WIDTH + 'px';
    target.style.height = IMAGE_HEIGHT + 'px';

    updateValues();
  }, [container.current])

  useGesture({
    onDrag: ({ delta: [dx, dy] }) => {
      const delta = new Vector(dx, dy);
      state.canvas = state.canvas.subtract(delta.multiply(1 / state.scale));

      updateValues();
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
    target: document.body,
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

    const preventDefault = e => e.preventDefault();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('gesturestart', preventDefault);
    document.addEventListener('gesturechange', preventDefault);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('gesturestart', preventDefault);
      document.removeEventListener('gesturechange', preventDefault);
    }
  }, []);
};
