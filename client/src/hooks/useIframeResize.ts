import { useEffect, useCallback, useState } from "react";

// This hook enables dynamic iframe height adjustment and mobile detection.
export function useIframeResize() {
  // Determine if the app is running inside an iframe only once on mount.
  const [isIframe] = useState<boolean>(() => window.self !== window.top);
  // Mobile state can be provided by the parent window or inferred locally.
  const [isMobile, setIsMobile] = useState<boolean>(false);
  // Keep track of window width for additional narrow‐viewport detection.
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  // Helper that computes the tallest document dimension and posts it to the parent.
  const sendHeight = useCallback(() => {
    if (!isIframe) return;

    const height = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight,
      document.body.scrollHeight,
      document.body.offsetHeight,
    );

    window.parent.postMessage({ type: "heightUpdate", height }, "*");
  }, [isIframe]);

  useEffect(() => {
    if (!isIframe) return;

    // Handle messages from the parent window.
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "viewportUpdate") {
        setIsMobile(event.data.isMobile);
      } else if (event.data?.type === "requestHeight") {
        sendHeight();
      }
    };

    // Update width on resize and re-send height.
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      requestAnimationFrame(sendHeight);
    };

    // Initial measurements.
    setWindowWidth(window.innerWidth);
    sendHeight();

    // Observe size changes of the root elements.
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(sendHeight);
    });

    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);

    // Observe DOM mutations that might affect layout.
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(sendHeight);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // Handle orientation changes explicitly (mobile Safari quirk).
    const handleOrientationChange = () => {
      setTimeout(() => {
        setWindowWidth(window.innerWidth);
        sendHeight();
      }, 100);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("message", handleMessage);
    window.addEventListener("resize", handleResize);

    // Clean-up listeners and observers.
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [sendHeight, isIframe]);

  // Also treat very narrow viewports as mobile for UX consistency.
  const isNarrow = windowWidth < 640; // Tailwind "sm" breakpoint.

  return { isIframe, isMobile: isMobile || isNarrow } as const;
} 