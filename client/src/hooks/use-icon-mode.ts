import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";

export function useIconMode(optionTitles: string[]) {
  const { iconMode } = useFormContext();
  const [lucideIcons, setLucideIcons] = useState<string[]>([]);
  const [emojis, setEmojis] = useState<string[]>([]);

  // Fetch Lucide icons
  useEffect(() => {
    const count = optionTitles.length;
    if (count === 0) {
      setLucideIcons([]);
      return;
    }

    fetch("/api/icons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ options: optionTitles }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then(({ icons: fetched }) => {
        if (
          Array.isArray(fetched) &&
          fetched.length === optionTitles.length &&
          fetched.every((icon) => typeof icon === "string")
        ) {
          setLucideIcons(fetched);
        } else {
          console.warn(
            "useIconMode: got invalid array back for Lucide icons, falling back to default icons",
            { fetched, expectedLength: optionTitles.length }
          );
          setLucideIcons(getDefaultIcons(count));
        }
      })
      .catch((err) => {
        console.warn(
          "useIconMode: failed to fetch from /api/icons, falling back to default icons",
          err
        );
        setLucideIcons(getDefaultIcons(count));
      });
  }, [optionTitles.join("|")]);

  // Fetch emojis
  useEffect(() => {
    const count = optionTitles.length;
    if (count === 0) {
      setEmojis([]);
      return;
    }

    fetch("/api/emojis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ options: optionTitles }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then(({ emojis: fetched }) => {
        if (
          Array.isArray(fetched) &&
          fetched.length === optionTitles.length &&
          fetched.every((e) => typeof e === "string")
        ) {
          setEmojis(fetched);
        } else {
          console.warn(
            "useIconMode: got invalid array back for emojis, falling back to random emojis",
            { fetched, expectedLength: optionTitles.length }
          );
          setEmojis(getRandomEmojis(count));
        }
      })
      .catch((err) => {
        console.warn(
          "useIconMode: failed to fetch from /api/emojis, falling back to random emojis",
          err
        );
        setEmojis(getRandomEmojis(count));
      });
  }, [optionTitles.join("|")]);

  // Return the appropriate icons based on the current mode
  switch (iconMode) {
    case 'lucide':
      return lucideIcons;
    case 'emoji':
      return emojis;
    case 'none':
      return Array(optionTitles.length).fill('');
    default:
      return lucideIcons;
  }
}

// Helper functions
const DEFAULT_ICONS = [
  "Circle", "Square", "Triangle", "Star", "Heart", "Home", "User", "Settings"
];

function getDefaultIcons(n: number): string[] {
  return Array.from({ length: n }).map((_, index) => {
    return DEFAULT_ICONS[index % DEFAULT_ICONS.length];
  });
}

const DEFAULT_EMOJIS = [
  "❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓"
];

function getRandomEmojis(n: number): string[] {
  return Array.from({ length: n }).map(() => {
    const idx = Math.floor(Math.random() * DEFAULT_EMOJIS.length);
    return DEFAULT_EMOJIS[idx];
  });
} 