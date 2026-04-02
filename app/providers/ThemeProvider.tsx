"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ----------------------------------------------------------
// GET INITIAL THEME (NO FLASH SAFE)
// ----------------------------------------------------------
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "dark";
  }
}

// ----------------------------------------------------------
// APPLY THEME (SINGLE SOURCE OF TRUTH)
// ----------------------------------------------------------
function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  const body = document.body;

  body.classList.remove("dash-theme-light", "dash-theme-dark");
  body.classList.add(
    theme === "dark" ? "dash-theme-dark" : "dash-theme-light"
  );
}

// ----------------------------------------------------------
// PROVIDER
// ----------------------------------------------------------
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  // 🔥 APPLY THEME ASAP (fix flash)
  useEffect(() => {
    applyTheme(theme);

    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  // 🔥 OPTIONAL: sync with system theme (only if no manual choice)
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const saved = localStorage.getItem("theme");
      if (!saved) {
        const systemTheme = media.matches ? "dark" : "light";
        setTheme(systemTheme);
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === "dark", toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ----------------------------------------------------------
// HOOK
// ----------------------------------------------------------
export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}