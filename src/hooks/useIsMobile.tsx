import { useEffect, useState } from "react";

/**
 * Hook to detect if current screen is considered mobile based on a breakpoint.
 * @param breakpoint - max width in pixels considered as mobile (default is 768)
 * @returns boolean indicating if current screen width is mobile
 */
const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile(); // initial check

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
