# Google Maps API Setup Guide

## Overview
The location step components now use Google Maps API for better address resolution and reliable map images.

## Setup Instructions

### 1. Get a Google Maps API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Geocoding API** (for address validation)
   - **Maps Static API** (for displaying maps)
4. Create credentials (API Key)
5. Optionally, restrict the API key to your domain for security

### 2. Configure Environment Variables
Create a `.env` file in your project root with:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
```

### 3. API Usage
- **Geocoding API**: Converts addresses to coordinates and provides formatted addresses
- **Static Maps API**: Generates map images showing the validated location

## Features Improved
- ✅ Better address resolution and formatting
- ✅ Reliable map image loading
- ✅ More accurate geocoding results
- ✅ Error handling for failed API calls

## Fallbacks
- If the API key is not configured, the components will use a placeholder
- Map images will be hidden if they fail to load
- Clear error messages for invalid addresses

## Cost Considerations
Google Maps APIs have usage quotas and pricing. Check the [Google Maps Platform Pricing](https://cloud.google.com/maps-platform/pricing) for details. 