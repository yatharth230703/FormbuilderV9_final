import { useState, useEffect } from "react";

// Detects if the current device is mobile (user-agent OR narrow viewport)
// and whether the app is rendered inside an iframe.
export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isIframe, setIsIframe] = useState<boolean>(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 640);
    };

    const checkIfIframe = () => {
      setIsIframe(window.self !== window.top);
    };

    // Initial detection
    checkIfMobile();
    checkIfIframe();

    const onResize = () => {
      checkIfMobile();
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return { isMobile, isIframe } as const;
}; 