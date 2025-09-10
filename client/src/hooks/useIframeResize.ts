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

    // Find the form container element
    const formContainer = document.querySelector('[data-testid="embed-form-container"]');
    
    // Calculate height based on the form container or fallback to document dimensions
    const height = formContainer 
      ? formContainer.getBoundingClientRect().height
      : Math.max(
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight,
          document.documentElement.clientHeight,
          document.body.scrollHeight,
          document.body.offsetHeight,
        );

    // Add a small buffer to prevent any potential scrolling
    const heightWithBuffer = Math.ceil(height) + 5;
    
    // Log height for debugging
    console.debug(`[useIframeResize] Sending height: ${heightWithBuffer}px`);
    
    window.parent.postMessage({ type: "heightUpdate", height: heightWithBuffer }, "*");
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

    // Observe size changes of the root elements and form container.
    const resizeObserver = new ResizeObserver((entries) => {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        // Log resize events for debugging
        console.debug(`[useIframeResize] Resize detected: ${entries.length} entries`);
        sendHeight();
      });
    });

    // Observe the document body and html element
    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);
    
    // Also observe the form container element if it exists
    const formContainer = document.querySelector('[data-testid="embed-form-container"]');
    if (formContainer) {
      resizeObserver.observe(formContainer);
      
      // Also observe each direct child of the form container
      formContainer.childNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          resizeObserver.observe(node);
        }
      });
    }

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