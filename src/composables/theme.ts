import { watch } from "vue";
import { useSettings } from "./settings";

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  const effectiveTheme = theme === "system" ? getSystemTheme() : theme;

  root.classList.remove("light", "dark");
  root.classList.add(effectiveTheme);

  // Also set data-theme attribute for CSS
  root.setAttribute("data-theme", effectiveTheme);
}

export function useTheme() {
  const { settings } = useSettings();

  // Apply on init
  if (typeof window !== "undefined") {
    applyTheme(settings.value.theme);

    // Watch for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (settings.value.theme === "system") {
          applyTheme("system");
        }
      };
      mediaQuery.addEventListener("change", handleChange);
    }
  }

  // Watch for theme changes from settings
  watch(
    () => settings.value.theme,
    (newTheme) => {
      applyTheme(newTheme);
    },
    { immediate: false },
  );

  return {
    getEffectiveTheme: () =>
      settings.value.theme === "system"
        ? getSystemTheme()
        : settings.value.theme,
  };
}

// Initialize theme immediately (before Vue mounts) from localStorage
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("dqc-settings");
    if (stored) {
      const parsed = JSON.parse(stored);
      const theme = parsed.theme || "system";
      applyTheme(theme);
    } else {
      applyTheme("system");
    }
  } catch {
    applyTheme("system");
  }
}
