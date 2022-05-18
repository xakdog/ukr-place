import React, { useEffect, useRef } from "react";

export const ContentWidthInput: React.FC<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
> = (props) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const onChange = () => {
      const width = Math.max(el.value.length + 1, 2);

      el.style.width = `calc(${width}ch)`;
    };

    onChange();
    el.addEventListener("input", onChange);

    return () => {
      el.removeEventListener("input", onChange);
    };
  }, [ref.current, props.value]);

  return <input ref={ref} {...props} />;
};
