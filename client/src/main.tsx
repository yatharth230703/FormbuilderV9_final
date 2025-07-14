import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Ensure every fetch call automatically includes credentials so that the
// browser will send the session cookie to the API even when the frontend and
// backend are served from different sub-domains (required in production).
const originalFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  return originalFetch(input, {
    credentials: 'include',
    ...init,
  });
};

// Create a root and render the app
const root = createRoot(document.getElementById("root")!);

// Render the app with proper provider hierarchy
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster />
  </QueryClientProvider>
);