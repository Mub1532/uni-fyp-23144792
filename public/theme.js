// so the page doesnt flash with the tailwind dark theme
// reference: found from https://stackoverflow.com/questions/71277655/prevent-page-flash-in-next-js-12-with-tailwind-css-class-based-dark-mode
(function initTheme() {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (stored === "dark" || (!stored && prefersDark)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
})();
