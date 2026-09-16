import { useStorage } from "@vueuse/core";

export interface AppSettings {
  autoFetchGameList: boolean;
  minimizeToTray: boolean;
  startMinimized: boolean;
  theme: "light" | "dark" | "system";
  language: string;
  checkUpdatesOnStart: boolean;
  showNotifications: boolean;
  gameWindowTimeout: number;
}

export const defaultSettings: AppSettings = {
  autoFetchGameList: true,
  minimizeToTray: false,
  startMinimized: false,
  theme: "system",
  language: "en",
  checkUpdatesOnStart: true,
  showNotifications: true,
  gameWindowTimeout: 15,
};

export function useSettings() {
  const settings = useStorage<AppSettings>("dqc-settings", defaultSettings);

  function resetSettings() {
    settings.value = { ...defaultSettings };
  }

  function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) {
    settings.value[key] = value;
  }

  return {
    settings,
    resetSettings,
    updateSetting,
  };
}
