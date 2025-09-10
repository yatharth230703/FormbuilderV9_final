/**
 * Form Embed Resizer
 * 
 * This script handles dynamic resizing of embedded forms.
 * Include this script on any page where you embed the form iframe.
 */

(function() {
  // Configuration
  const config = {
    // Default minimum height for the iframe (px)
    minHeight: 600,
    
    // Add a small buffer to prevent scrollbars (px)
    heightBuffer: 10,
    
    // Transition duration for smooth height changes (ms)
    transitionDuration: 300,
    
    // Debug mode - logs messages to console
    debug: false
  };
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initializeFormIframes();
  });
  
  /**
   * Initialize all form iframes on the page
   */
  function initializeFormIframes() {
    // Find all iframes with data-form-embed attribute
    const formIframes = document.querySelectorAll('iframe[data-form-embed]');
    
    formIframes.forEach(function(iframe) {
      setupIframeResizing(iframe);
    });
    
    // Also look for iframes with specific URLs
    document.querySelectorAll('iframe').forEach(function(iframe) {
      const src = iframe.getAttribute('src') || '';
      if (src.includes('/embed') && !iframe.hasAttribute('data-form-embed')) {
        iframe.setAttribute('data-form-embed', 'true');
        setupIframeResizing(iframe);
      }
    });
    
    log('Initialized ' + formIframes.length + ' form iframes');
  }
  
  /**
   * Set up resizing for a specific iframe
   */
  function setupIframeResizing(iframe) {
    // Set initial styles
    iframe.style.width = '100%';
    iframe.style.overflow = 'hidden';
    iframe.setAttribute('scrolling', 'no');
    iframe.style.transition = `height ${config.transitionDuration}ms ease`;
    
    // Set initial height
    if (!iframe.style.height) {
      iframe.style.height = config.minHeight + 'px';
    }
    
    // Add a unique ID if it doesn't have one
    if (!iframe.id) {
      iframe.id = 'form-iframe-' + Math.floor(Math.random() * 1000000);
    }
    
    log('Set up iframe: ' + iframe.id);
    
    // Request initial height from iframe
    setTimeout(function() {
      try {
        iframe.contentWindow.postMessage({ type: 'requestHeight' }, '*');
      } catch (e) {
        log('Error requesting height: ' + e.message);
      }
    }, 500);
  }
  
  /**
   * Handle messages from the iframe
   */
  window.addEventListener('message', function(event) {
    // Skip if no data
    if (!event.data) return;
    
    // Check if it's a height update message (support multiple formats)
    if (event.data.type === 'form-resize' || event.data.type === 'heightUpdate') {
      const height = event.data.height;
      
      // Find the iframe that sent this message
      let targetIframe = null;
      
      document.querySelectorAll('iframe[data-form-embed]').forEach(function(iframe) {
        if (iframe.contentWindow === event.source) {
          targetIframe = iframe;
        }
      });
      
      // If we couldn't find by data attribute, try all iframes
      if (!targetIframe) {
        document.querySelectorAll('iframe').forEach(function(iframe) {
          if (iframe.contentWindow === event.source) {
            targetIframe = iframe;
          }
        });
      }
      
      // Update the iframe height if we found it
      if (targetIframe) {
        const newHeight = Math.max(config.minHeight, height + config.heightBuffer);
        log(`Resizing iframe ${targetIframe.id} to height: ${newHeight}px`);
        targetIframe.style.height = newHeight + 'px';
      }
    }
  });
  
  /**
   * Log debug messages if debug mode is enabled
   */
  function log(message) {
    if (config.debug) {
      console.log('[FormEmbed] ' + message);
    }
  }
  
  // Export public API
  window.FormEmbed = {
    initialize: initializeFormIframes,
    config: config
  };
})();

