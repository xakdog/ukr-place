import React, { useCallback } from "react";

type RangeSelectorProps = {
  value: number;
  onUpdate(value: number): void;
};

const RANGE_MIN = 1;
const RANGE_MAX = 10_000;
const SLIDER_MIN = 1;
const SLIDER_MAX = 3000;

export const RangeSelector: React.FC<RangeSelectorProps> = (props) => {
  const onSliderChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = parseInt(ev.target.value);
      const sliderValue = Math.round(rawValue);
      const realValue = getValueByPosition(sliderValue);

      props.onUpdate(realValue);
    },
    [props.onUpdate]
  );

  return (
    <>
      <input
        type="range"
        min="1"
        max={3000}
        value={isNaN(props.value) ? 0 : getPositionByValue(props.value)}
        onChange={onSliderChange}
        className="range mt-6"
      />

      <div className="w-full h-2 overflow-hidden flex justify-between text-xs px-2 opacity-25">
        {[...Array(12)].map((_, idx) => (
          <span key={idx}>|</span>
        ))}
      </div>
    </>
  );
};

const scaleFn = (n: number) => Math.pow(n, 3);
const unscaleFn = (n: number) => Math.pow(n, 1 / 3);

const getValueByPosition = (position: number) => {
  const scaledMin = unscaleFn(RANGE_MIN);
  const scaledMax = unscaleFn(RANGE_MAX);

  // calculate adjustment factor
  const scale = (scaledMax - scaledMin) / (SLIDER_MAX - SLIDER_MIN);

  return Math.round(scaleFn(scaledMin + scale * (position - SLIDER_MIN)));
};

const getPositionByValue = (value: number) => {
  const scaledMin = unscaleFn(RANGE_MIN);
  const scaledMax = unscaleFn(RANGE_MAX);

  // calculate adjustment factor
  const scale = (scaledMax - scaledMin) / (SLIDER_MAX - SLIDER_MIN);
  const scaledPos = unscaleFn(value);

  return (scaledPos - scaledMin) / scale - SLIDER_MIN;
};
