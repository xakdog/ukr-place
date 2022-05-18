import { useCallback, useEffect, useState } from "react";

export const useCollapsingBlock = (isScreenSmall: () => boolean) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = useCallback(
    () => setIsCollapsed(!isCollapsed),
    [isCollapsed, setIsCollapsed]
  );

  useEffect(() => {
    const onWindowResize = () => {
      const isCollapsedAfterResize = isScreenSmall();
      const shouldUpdate = isCollapsed !== isCollapsedAfterResize;

      if (shouldUpdate) setIsCollapsed(isCollapsedAfterResize);
    };

    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, [isScreenSmall, isCollapsed, setIsCollapsed]);

  return { isCollapsed, toggleCollapsed };
};
