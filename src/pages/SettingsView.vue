<script setup lang="ts">
import { useSettings } from '@/composables/settings';
import { useGlobalState } from '@/composables/app-state';
import { invoke } from '@tauri-apps/api/core';

const { settings, resetSettings, updateSetting } = useSettings();
const { addLog } = useGlobalState();

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

async function fetchGameList() {
  try {
    addLog('Fetching game list...');
    await invoke('fetch_gamelist_gh_mirror');
    addLog('Game list fetched successfully');
  } catch (error) {
    addLog('error', 'Failed to fetch game list: ' + String(error));
  }
}

function openGameFolder() {
  invoke('opener_open', { path: 'games' }).catch(() => {
    addLog('error', 'Could not open games folder');
  });
}

function openConfigFolder() {
  invoke('opener_open', { path: '.' }).catch(() => {
    addLog('error', 'Could not open config folder');
  });
}
</script>

<template>
  <div class="p-4 container mx-auto max-w-3xl">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

    <!-- Application Settings -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Application</h2>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Auto-fetch game list on startup</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Automatically check for game list updates when the app starts</p>
          </div>
          <input
            type="checkbox"
            v-model="settings.autoFetchGameList"
            @change="updateSetting('autoFetchGameList', settings.autoFetchGameList)"
            class="w-11 h-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Minimize to tray</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Minimize the app to system tray instead of taskbar</p>
          </div>
          <input
            type="checkbox"
            v-model="settings.minimizeToTray"
            @change="updateSetting('minimizeToTray', settings.minimizeToTray)"
            class="w-11 h-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Start minimized</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Launch the app minimized to tray</p>
          </div>
          <input
            type="checkbox"
            v-model="settings.startMinimized"
            @change="updateSetting('startMinimized', settings.startMinimized)"
            class="w-11 h-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Show notifications</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Display toast notifications for game actions</p>
          </div>
          <input
            type="checkbox"
            v-model="settings.showNotifications"
            @change="updateSetting('showNotifications', settings.showNotifications)"
            class="w-11 h-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Check for updates on start</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Check for application updates on startup</p>
          </div>
          <input
            type="checkbox"
            v-model="settings.checkUpdatesOnStart"
            @change="updateSetting('checkUpdatesOnStart', settings.checkUpdatesOnStart)"
            class="w-11 h-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Theme</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Choose the application color theme</p>
          </div>
          <select
            v-model="settings.theme"
            @change="updateSetting('theme', settings.theme)"
            class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option v-for="opt in themeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Language</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Select the application language</p>
          </div>
          <select
            v-model="settings.language"
            @change="updateSetting('language', settings.language)"
            class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option v-for="opt in languageOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Game window timeout (minutes)</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Time before game window auto-closes (Discord Quest requirement: 15 min)</p>
          </div>
          <input
            type="number"
            v-model.number="settings.gameWindowTimeout"
            @change="updateSetting('gameWindowTimeout', settings.gameWindowTimeout)"
            min="5"
            max="60"
            step="5"
            class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>

    <!-- Game Management -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Game Management</h2>
      
      <div class="space-y-3">
        <button
          @click="fetchGameList"
          class="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
        >
          Fetch Latest Game List
        </button>
        
        <button
          @click="openGameFolder"
          class="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md transition-colors"
        >
          Open Games Folder
        </button>

        <button
          @click="openConfigFolder"
          class="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md transition-colors"
        >
          Open Config Folder
        </button>
      </div>
    </div>

    <!-- Reset & Danger Zone -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 border border-red-200 dark:border-red-800">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-red-600 dark:text-red-400">Danger Zone</h2>
      
      <div class="space-y-3">
        <button
          @click="resetSettings"
          class="w-full py-2 px-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md transition-colors border border-red-200 dark:border-red-800"
        >
          Reset All Settings to Defaults
        </button>
      </div>
      
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-4">
        This will reset all settings to their default values. Your selected games list will not be affected.
      </p>
    </div>

    <!-- About -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
      <div class="text-gray-500 dark:text-gray-400 space-y-2">
        <p>Discord Quest Completer</p>
        <p class="text-sm">Simulates verified Discord games for Quest completion.</p>
        <p class="text-sm">Version: 25.10.7</p>
        <p class="text-sm">
          <a 
            href="https://github.com/markterence/discord-quest-completer" 
            target="_blank" 
            class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 underline"
          >
            GitHub Repository
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Settings page styles */
</style>