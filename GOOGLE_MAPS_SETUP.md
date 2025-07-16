# Google Maps API Setup Guide

## Overview
The location step components in the form renderer use the Google Maps API for address resolution, validation, and displaying static map images.

## Setup Instructions

### 1. Enable Required APIs
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.
3.  Enable the following APIs for your project:
    -   **Geocoding API**: Used to convert addresses into geographic coordinates.
    -   **Maps Static API**: Used to generate static map images.
4.  Optionally, but recommended, restrict the API key to your specific domain or IP address for security.

### 2. Configure Environment Variables
Add the Google Maps API key to your `.env` file in the project root. This key is used on the server side.

```env
# This is used by the server to make requests to Google Maps APIs
GOOGLE_MAPS_API_KEY="your_actual_google_maps_api_key_here"
```

**Note:** Unlike some other client-side variables, this key does **not** need the `VITE_` prefix as it is handled exclusively by the backend to protect it.

### 3. API Usage
-   **Geocoding API**: Called by the server to validate and format addresses entered by users in the location step.
-   **Maps Static API**: Used by the server to generate a URL for a static map image, which is then sent to the client.

## Features
-   ✅ Accurate address resolution and formatting.
-   ✅ Reliable static map image loading for location previews.
-   ✅ Server-side validation of addresses.
-   ✅ Graceful error handling for failed API calls or invalid addresses.

## Fallbacks
-   If the `GOOGLE_MAPS_API_KEY` is not configured, the location step will still function but without address validation and map previews.
-   Map images will be hidden if the API call fails.

## Cost Considerations
The Google Maps Platform APIs have a free tier, but usage beyond that is subject to pricing. Please review the [Google Maps Platform Pricing](https://cloud.google.com/maps-platform/pricing) for the most up-to-date details. 