import { useState, useEffect } from "react";

const DEFAULT_ICONS = [
  "Circle", "Square", "Triangle", "Star", "Heart", "Home", "User", "Settings"
];

/** Return an array of n default icons */
function getDefaultIcons(n: number): string[] {
  return Array.from({ length: n }).map((_, index) => {
    return DEFAULT_ICONS[index % DEFAULT_ICONS.length];
  });
}

export function useIcons(optionTitles: string[]): string[] {
  const [icons, setIcons] = useState<string[]>([]);

  useEffect(() => {
    const count = optionTitles.length;
    if (count === 0) {
      setIcons([]);
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
          setIcons(fetched);
        } else {
          console.warn(
            "useIcons: got invalid array back, falling back to default icons",
            { fetched, expectedLength: optionTitles.length }
          );
          setIcons(getDefaultIcons(count));
        }
      })
      .catch((err) => {
        console.warn(
          "useIcons: failed to fetch from /api/icons, falling back to default icons",
          err
        );
        setIcons(getDefaultIcons(count));
      });
  }, [optionTitles.join("|")]);

  return icons;
}