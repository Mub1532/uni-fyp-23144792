// hooks/useTheme.ts
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

    if (!currentLocalTheme) {
      setTimeout(() => {
        toast.info(
          `Automatic color scheme set to ${isDark ? "dark" : "light"}`,
        );
        toast.info("Change color scheme by clicking the icon in the top right");
      }, 500);
    }
  }, []);

  function toggleTheme() {
    const oppositeTheme = !theme;
    setTheme(oppositeTheme);
    localStorage.setItem("theme", oppositeTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", oppositeTheme);
  }

  return { theme, toggleTheme };
}
