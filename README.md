# Download Directioner 📥

> A lightweight, cross-browser WebExtension (Manifest V3) to automatically organize and route downloads into custom subfolders based on rules (file extensions, MIME types, filename patterns, and source domains).

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)
![Compatibility](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Edge%20%7C%20Opera%20%7C%20Firefox-informational.svg)

---

## ✨ Features

- **Automated Routing:** Automatically redirects matching files to custom subfolders inside your Downloads directory.
- **Multi-Condition Filters:** Combine conditions with AND / OR logic:
  - File extension (e.g., `.zpl`, `.pdf`, `.txt`, `.xml`, `.csv`)
  - Filename pattern (Contains, Starts with, Ends with, Regular Expressions)
  - Source domain / Referrer (e.g., `bling.com.br`)
  - MIME types (e.g., `application/pdf`)
- **10-Day Routing Audit History:** Dedicated tab showing real-time routing decisions, winning rules, satisfied filters, and target folders, featuring zero-telemetry local storage with automatic purge of records older than 10 days.
- **Cross-Browser Engine:** Native support for Chromium browsers (`chrome.downloads.onDeterminingFilename`) and Mozilla Firefox fallback architecture.
- **Trilingual UI:** Switch between **English (EN)**, **Portuguese (PT-BR)**, and **Spanish (ES)** in real time.
- **Anti-Reset Draft Saver:** Form data is preserved automatically if the popup loses focus or you switch browser tabs.
- **Rule Evaluator (Sandbox):** Test rules with mock filenames, URLs, and MIME types before executing real downloads.
- **Import / Export:** Backup and restore rules via JSON.
- **Privacy First:** 100% local execution. No telemetry, no external servers, no tracking.

---

## 📂 Project Structure

```
Download Directioner/
├── manifest.json            # MV3 multi-browser manifest
├── icons/
│   └── logo.png             # Official icon
├── background/
│   ├── background.js        # Background Service Worker / event adapter & history recorder
│   └── rulesEngine.js       # Matching engine with detailed criteria reporting
└── popup/
    ├── popup.html           # 380px compact user interface with Rules & History tabs
    ├── popup.css            # Dark/Light responsive design system
    └── popup.js             # Form controllers, history viewer, i18n dictionary, draft manager
```

---

## 🚀 Installation & Local Development

### Chromium-based Browsers (Chrome, Edge, Opera GX, Brave, Vivaldi)
1. Clone or download this repository.
2. Open your browser and navigate to the extensions page:
   - Chrome / Brave: `chrome://extensions`
   - Edge: `edge://extensions`
   - Opera GX: `opera://extensions`
3. Enable **Developer Mode** (top-right toggle).
4. Click **Load unpacked** (*Carregar sem compactação*).
5. Select the root folder of this project.

### Mozilla Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...** (*Carregar extensão temporária...*).
3. Select the `manifest.json` file inside the project directory.

---

## 🔒 Security & Directory Traversal Protection

By design and web platform sandbox constraints, extensions can only create directories and files **relative to the user's default Downloads folder**. The engine includes built-in sanitization to strip dangerous patterns like `../` to prevent path traversal.

---

## 📄 License

This project is open-source and licensed under the MIT License.
