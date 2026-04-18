// hooks/useTheme.ts
import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(false);

  useEffect(() => {
    const currentLocalTheme = localStorage.getItem("theme");

    const preferDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const isDark =
      currentLocalTheme === "dark" || (!currentLocalTheme && preferDark);
    setTheme(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleTheme() {
    const oppositeTheme = !theme;
    setTheme(oppositeTheme);
    localStorage.setItem("theme", oppositeTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", oppositeTheme);
  }

  return { theme, toggleTheme };
}
