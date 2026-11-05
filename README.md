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
- **Cross-Browser Engine:** Native support for Chromium browsers (`chrome.downloads.onDeterminingFilename`) and Mozilla Firefox fallback architecture.
- **Trilingual UI:** Switch between **English (EN)**, **Portuguese (PT-BR)**, and **Spanish (ES)** in real time.
- **Anti-Reset Draft Saver:** Form data is preserved automatically if the popup loses focus or you switch browser tabs.
- **Rule Evaluator (Sandbox):** Test rules with mock filenames, URLs, and MIME types before executing real downloads.
- **Import / Export:** Backup and restore rules via JSON.
- **Privacy First:** 100% local execution. No telemetry, no external servers, no tracking.

---

## 📂 Project Structure

```text
Download Directioner/
├── manifest.json            # MV3 multi-browser manifest
├── icons/
│   └── logo.png             # Official icon
├── background/
│   ├── background.js        # Background Service Worker / event adapter
│   └── rulesEngine.js       # Standalone matching and path sanitization engine
└── popup/
    ├── popup.html           # 380px compact user interface
    ├── popup.css            # Dark/Light responsive design system
    └── popup.js             # Form controllers, i18n dictionary, draft manager
