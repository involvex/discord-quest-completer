# AGENTS.md - Discord Quest Completer

This file provides comprehensive instructions for AI agents working on the Discord Quest Completer project.

---

## 📋 Project Overview

**Discord Quest Completer** is a Windows desktop application built with Tauri (Rust + Vue.js) that simulates playing verified Discord games without installing the full games. It creates small dummy executables that trigger Discord's Rich Presence detection, allowing users to complete Discord Quests (15-minute gameplay requirements) without downloading massive game files.

### Key Features
- Simulates verified Discord games for Quest completion
- Creates minimal dummy executables (~250KB each) using Win32 API
- Fetches detectable games list from Discord API
- Experimental Discord RPC integration for custom Rich Presence
- Windows-only (Linux/macOS not supported due to Wine/Proton complexity)

---

## 🛠️ Technologies

### Core Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **Rust** | 2021 edition | Backend, Tauri commands, Discord SDK integration |
| **Tauri** | v2 | Desktop app framework (Rust + WebView) |
| **Vue.js** | 3.5+ | Frontend UI (Composition API, `<script setup>`) |
| **Vite** | 6.0+ | Frontend build tool & dev server |
| **Tailwind CSS** | 4.1+ | Utility-first styling |
| **pnpm** | 8.15+ | Package manager (required) |
| **TypeScript** | 5.6+ | Type safety for frontend |

### Key Rust Dependencies
```toml
tauri = { version = "2", features = ["protocol-asset"] }
discord-sdk = "0.4.0"          # Discord Rich Presence SDK
tokio = "1.44"                 # Async runtime
serde = { version = "1", features = ["derive"] }
once_cell = "1.21"             # Thread-safe lazy initialization
tauri-plugin-http = "2"        # HTTP requests to Discord API
tauri-plugin-dialog = "2"      # File dialogs
tauri-plugin-opener = "2"      # Open URLs/files
reqwest = "0.11"               # HTTP client (blocking + async)
```

### Platform-Specific Runner Binaries
| Platform | Source | Output | Size Target |
|----------|--------|--------|-------------|
| Windows | `src-win/` (C++ + Rust) | `src-win.exe` | ~250KB |
| Linux | `src-linux/` (planned) | `src-linux` | ~100KB |
| macOS | `src-darwin/` (planned) | `src-darwin` | ~100KB |

**Windows Runner**: Uses raw Win32 API via C++ (`main.cpp`) with custom entry point (`mainEntryPoint`) to avoid CRT overhead. Compiles with `/O1`, `/GS-`, LTO, and stripped symbols for minimal size.

---

## 📁 Project Structure

```
discord-quest-completer/
├── src/                          # Vue.js frontend source
│   ├── assets/                   # Static assets (gamelist.json)
│   ├── components/               # Vue components
│   ├── composables/              # Vue composables
│   ├── views/                    # Page views
│   ├── App.vue                   # Root component
│   └── main.ts                   # Entry point
├── src-tauri/                    # Tauri/Rust backend
│   ├── src/
│   │   ├── lib.rs                # Main Tauri commands & app logic
│   │   ├── runner.rs             # Activity parsing & Discord SDK wrapper
│   │   ├── rpc.rs                # Discord client creation
│   │   └── main.rs               # Tauri entry point
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # Tauri configuration
│   └── icons/                    # App icons
├── src-win/                      # Windows dummy game runner (C++)
│   ├── src/main.cpp              # Win32 GUI app with system tray
│   ├── build.rs                  # C++ compilation + linker flags
│   └── Cargo.toml
├── src-linux/                    # Linux runner (planned)
├── src-darwin/                   # macOS runner (planned)
├── .github/workflows/            # CI/CD pipelines
│   ├── build-release.yaml        # Release builds (manual trigger)
│   └── rust-check.yml            # PR checks + scheduled builds (every 2 days)
├── package.json                  # Frontend scripts & deps
├── vite.config.ts                # Vite configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## 🚀 Useful Commands

### Development
```bash
# Install frontend dependencies
pnpm install

# Build Windows runner binary (required before dev/build)
pnpm build:runner:win
pnpm copy:runner:win

# Start Tauri dev server (frontend + backend hot reload)
pnpm tauri dev

# Alternative: Start frontend only (for UI development)
pnpm dev
```

### Building
```bash
# Build frontend for production
pnpm build

# Build complete Tauri app (includes runner binary)
pnpm tauri build

# Build runner binaries for all platforms
pnpm build:runner:win      # Windows
pnpm build:runner:linux    # Linux (when implemented)
pnpm build:runner:darwin   # macOS (when implemented)

# Copy runner binaries to Tauri resources
pnpm copy:runner:win
pnpm copy:runner:linux
pnpm copy:runner:darwin

# Sync all runner binaries
pnpm sync:runner
```

### Code Quality
```bash
# Type-check frontend
pnpm vue-tsc --noEmit

# Check Rust code (run in src-tauri/)
cd src-tauri && cargo check

# Format Rust code
cd src-tauri && cargo fmt

# Lint Rust code
cd src-tauri && cargo clippy

# Run all checks (CI equivalent)
cd src-tauri && cargo check && cargo fmt --check && cargo clippy
```

### Game List Management
```bash
# Fetch detectable games from Discord API (v10)
curl -L -o src/assets/gamelist.json "https://discord.com/api/v10/applications/detectable"

# Or use GitHub mirror (fallback)
curl -L -o src/assets/gamelist.json "https://markterence.github.io/discord-quest-completer/detectable.json"
```

### Testing
```bash
# No formal test suite exists yet
# Manual testing: pnpm tauri dev → test UI flows
# Runner binary: cd src-win && cargo run --release
```

---

## 🔧 Development Workflow

### Prerequisites
1. **Rust** (stable) - via `rustup`
2. **Node.js** 20+ - for frontend
3. **pnpm** 8.15+ - package manager
4. **Tauri prerequisites** - see [Tauri docs](https://tauri.app/start/prerequisites/)
5. **WebView2** - Windows 11 includes it; install manually on Windows 10
6. **Visual Studio Build Tools** - for C++ compilation (Windows runner)

### Initial Setup
```bash
# Clone and install
git clone https://github.com/markterence/discord-quest-completer
cd discord-quest-completer
pnpm install

# Build runner binary
pnpm build:runner:win && pnpm copy:runner:win

# Fetch game list
curl -L -o src/assets/gamelist.json "https://discord.com/api/v10/applications/detectable"

# Start development
pnpm tauri dev
```

### Adding a New Tauri Command
1. Add function in `src-tauri/src/lib.rs` with `#[tauri::command]`
2. Export in `invoke_handler` in `run()` function
3. Add TypeScript types in frontend (`src/types/` or component)
4. Call via `invoke('command_name', args)` from Vue components

### Modifying the Runner Binary
1. Edit `src-win/src/main.cpp` for Windows behavior
2. Adjust `build.rs` for compiler/linker flags
3. Test: `cd src-win && cargo run --release`
4. Rebuild: `pnpm build:runner:win && pnpm copy:runner:win`

---

## 🏗️ Architecture & Key Concepts

### How It Works
1. **Game List**: App fetches Discord's detectable games list (App ID, executable name, install path)
2. **Dummy Creation**: When user selects a game, `create_fake_game` command:
   - Creates `games/{app_id}/{path}/` directory next to app executable
   - Copies `src-win.exe` (runner) as the game's executable
3. **Launch**: `run_background_process` spawns the dummy exe with `--title "Game Name"`
4. **Detection**: Discord sees the process running → triggers Rich Presence → Quest progress
5. **Stop**: `stop_process` kills the dummy process via `taskkill`

### Runner Binary Design (Windows)
- **No CRT**: Uses `/NODEFAULTLIB` + custom `mainEntryPoint` + manual `memset`
- **Minimal deps**: Only `kernel32`, `user32`, `shell32`, `gdi32`
- **GUI subsystem**: `/SUBSYSTEM:WINDOWS` (no console window)
- **System tray**: Shows game name, GitHub link, hide/show/exit
- **Title parsing**: Reads `--title` from command line for window/tray text

### Discord RPC Integration (Experimental)
- Uses `discord-sdk` crate (official Discord Game SDK)
- Connects to Discord's local IPC gateway
- Sets custom activity (details, state, timestamps, assets)
- **Warning**: Uses other apps' Client IDs - may violate Discord ToS

---

## ✅ Best Practices & Guidelines

### Rust Backend
1. **Error Handling**: Return `Result<String, String>` from Tauri commands; use `?` operator
2. **Async**: Use `tauri::async_runtime::spawn` for background tasks; avoid blocking
3. **State**: Use `OnceCell<Mutex<Option<T>>>` for global singleton state (Discord client)
4. **Paths**: Always resolve relative to `env::current_exe()` for portable execution
5. **Platform Gates**: Use `#[cfg(target_os = "...")]` for OS-specific code
6. **Permissions**: Tauri capabilities in `src-tauri/capabilities/default.json`

### Frontend (Vue 3 + TypeScript)
1. **Composition API**: Use `<script setup lang="ts">` exclusively
2. **Types**: Define interfaces for all Tauri command payloads/responses
3. **State**: Use `@vueuse/core` composables (`useStorage`, `useLocalStorage`)
4. **Search**: Use `fuse.js` for fuzzy game search
5. **Styling**: Tailwind CSS v4 utility classes; avoid custom CSS

### Build & Release
1. **Versioning**: Date-based (`YYYY.MM.DD`) via GitHub Actions
2. **Runner Binary**: Must be rebuilt and copied before every Tauri build
3. **Game List**: Fetched fresh in CI; committed to `src/assets/gamelist.json`
4. **Artifacts**: Release includes `.exe`, `data/`, `resources/`, and installer bundles

### Security
1. **CSP**: Configured in `tauri.conf.json` - restrictive by default
2. **Asset Protocol**: Enabled for local resource loading
3. **No eval/unsafe-inline**: Except for Tailwind JIT in dev
4. **External URLs**: Only GitHub (repo) and Discord API allowed

### Git & CI
1. **Branches**: `main` only; PRs for changes
2. **Checks**: `rust-check.yml` runs on PR + every 2 days
3. **Release**: Manual workflow dispatch → creates draft pre-release
4. **Commits**: Conventional commits preferred; no commit message enforcement

---

## ⚠️ Known Limitations & Gotchas

| Issue | Description | Workaround |
|-------|-------------|------------|
| **Runner size** | C++ runner ~250KB; C# would be 7KB but needs .NET | Accept current size; explore `windows-rs` crate |
| **Stop button** | Doesn't work if process killed externally | Manually kill via Task Manager |
| **Game persistence** | Added games reset on app restart | Not yet implemented |
| **Linux/macOS** | Not supported; Wine/Proton complexity | Windows only for now |
| **Discord RPC** | Uses others' App IDs; ToS gray area | Use at own risk; disabled by default |
| **WebView2** | Required on Windows 10; preinstalled on 11 | Document in README/installer |

---

## 🔗 Key References

- **Tauri v2 Docs**: https://tauri.app/v2/
- **Discord Game SDK**: https://github.com/discord/discord-game-sdk
- **Discord Detectable API**: `GET /api/v10/applications/detectable`
- **Project Repo**: https://github.com/markterence/discord-quest-completer
- **Releases**: https://github.com/markterence/discord-quest-completer/releases

---

## 📝 Agent Instructions

When working on this project:

1. **Always use `pnpm`** - never `npm` or `yarn`
2. **Build runner first** - Tauri build fails without `src-tauri/resources/src-win.exe`
3. **Test on Windows** - Primary target; no CI for Linux/macOS
4. **Keep runner minimal** - Size is critical; avoid adding dependencies
5. **Respect Discord ToS** - Document any RPC usage risks
6. **Update game list** - Run fetch command before testing game detection
7. **Use PowerShell-compatible commands** - This is a Windows project

---

*Generated from project analysis. Update this file when architecture or workflows change.*