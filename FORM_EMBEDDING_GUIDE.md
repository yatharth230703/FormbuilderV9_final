# Form Embedding Guide

This guide explains how to properly embed your form on any website with automatic height adjustment.

## Quick Start

1. Download the `form-embed-snippet.js` file and include it on your page:

```html
<script src="form-embed-snippet.js"></script>
```

2. Add your form iframe with the `data-form-embed` attribute:

```html
<iframe 
  data-form-embed="true" 
  src="https://your-form-url.com/embed?form=1" 
  frameborder="0" 
  style="width: 100%;">
</iframe>
```

That's it! The iframe will automatically resize to fit the form content.

## Advanced Configuration

You can customize the behavior by modifying the configuration:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // Enable debug mode
  window.FormEmbed.config.debug = true;
  
  // Set minimum height (default: 600px)
  window.FormEmbed.config.minHeight = 500;
  
  // Set height buffer to prevent scrollbars (default: 10px)
  window.FormEmbed.config.heightBuffer = 20;
  
  // Set transition duration for smooth height changes (default: 300ms)
  window.FormEmbed.config.transitionDuration = 200;
});
```

## Manual Integration

If you prefer to implement the resizing yourself, add this code to your page:

```javascript
window.addEventListener('message', function(event) {
  // Verify the origin for security (replace with your form domain)
  // if (event.origin !== 'https://your-form-domain.com') return;
  
  // Check if it's a height update message
  if (event.data && (event.data.type === 'form-resize' || event.data.type === 'heightUpdate')) {
    const iframe = document.getElementById('yourFormIframeId');
    if (iframe) {
      // Add a small buffer (10px) to prevent scrollbars
      const height = event.data.height + 10;
      iframe.style.height = height + 'px';
    }
  }
});
```

## Troubleshooting

### Form isn't resizing properly

1. Make sure you've included the `form-embed-snippet.js` script
2. Check that your iframe has the `data-form-embed` attribute
3. Enable debug mode to see what's happening:
   ```javascript
   window.FormEmbed.config.debug = true;
   ```
4. Check the browser console for error messages

### Scrollbars appear in the iframe

If you still see scrollbars, try increasing the height buffer:

```javascript
window.FormEmbed.config.heightBuffer = 30; // Increase from default 10px
```

### Height changes are jumpy

You can make the transitions smoother by adjusting the transition duration:

```javascript
window.FormEmbed.config.transitionDuration = 500; // Increase from default 300ms
```

## Browser Support

The form embedding script works in all modern browsers:
- Chrome, Firefox, Safari, Edge (latest versions)
- Internet Explorer 11 (with limited animation support)

## Need Help?

If you encounter any issues with embedding the form, please contact our support team.

