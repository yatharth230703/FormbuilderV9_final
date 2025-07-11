import { useState, useEffect } from "react";

const DEFAULT_EMOJIS = [
  "❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓","❓"
];

/** Return an array of n random emojis from the default list */
function getRandomEmojis(n: number): string[] {
  return Array.from({ length: n }).map(() => {
    const idx = Math.floor(Math.random() * DEFAULT_EMOJIS.length);
    return DEFAULT_EMOJIS[idx];
  });
}

export function useEmojis(optionTitles: string[]): string[] {
  const [emojis, setEmojis] = useState<string[]>([]);

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
            "useEmojis: got invalid array back, falling back to random emojis",
            { fetched, expectedLength: optionTitles.length }
          );
          setEmojis(getRandomEmojis(count));
        }
      })
      .catch((err) => {
        console.warn(
          "useEmojis: failed to fetch from /api/emojis, falling back to random emojis",
          err
        );
        setEmojis(getRandomEmojis(count));
      });
  }, [optionTitles.join("|")]);

  return emojis;
}
