<div align="center">

# Download Directioner 📥

> A lightweight, cross-browser WebExtension (Manifest V3) to automatically organize and route downloads into custom subfolders based on user-defined rules.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![Compatibility](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Edge%20%7C%20Opera%20%7C%20Firefox-informational.svg)](#-installation--local-development)

<p align="center">
  <a href="#-english">
    <img src="https://img.shields.io/badge/Language-English-blue?style=for-the-badge&logo=google-translate&logoColor=white" alt="English">
  </a>
  <a href="#-português-brasil">
    <img src="https://img.shields.io/badge/Idioma-Portugu%C3%AAs%20Brasil-green?style=for-the-badge&logo=google-translate&logoColor=white" alt="Português">
  </a>
  <a href="#-español">
    <img src="https://img.shields.io/badge/Idioma-Espa%C3%B1ol-orange?style=for-the-badge&logo=google-translate&logoColor=white" alt="Español">
  </a>
</p>

</div>

---

<a name="-english"></a>
## 🌐 English

### ✨ Features
- **Automated Routing:** Automatically redirects matching files to custom subfolders inside your Downloads directory.
- **Clean Browser Download Bar:** Files redirected to subfolders are automatically cleared from the native browser download tray upon completion (`chrome.downloads.erase`), preventing "File not found" false alarms.
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

### 📂 Project Structure
<pre><code>Download Directioner/
├── manifest.json            # MV3 multi-browser manifest
├── icons/
│   └── logo.png             # Official icon
├── background/
│   ├── background.js        # Background Service Worker / event adapter & history recorder
│   └── rulesEngine.js       # Matching engine with detailed criteria reporting
└── popup/
    ├── popup.html           # 380px compact user interface with Rules & History tabs
    ├── popup.css            # Dark/Light responsive design system
    └── popup.js             # Form controllers, history viewer, i18n dictionary, draft manager</code></pre>

### 🚀 Installation & Local Development

#### Chromium-based Browsers (Chrome, Edge, Opera GX, Brave, Vivaldi)
1. Clone or download this repository.
2. Open your browser and navigate to the extensions page:
   - Chrome / Brave: `chrome://extensions`
   - Edge: `edge://extensions`
   - Opera GX: `opera://extensions`
3. Enable **Developer Mode** (top-right toggle).
4. Click **Load unpacked** (*Carregar sem compactação*).
5. Select the root folder of this project.

#### Mozilla Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...** (*Carregar extensão temporária...*).
3. Select the `manifest.json` file inside the project directory.

### 🔒 Security & Directory Traversal Protection
By design and web platform sandbox constraints, extensions can only create directories and files **relative to the user's default Downloads folder**. The engine includes built-in sanitization to strip dangerous patterns like `../` to prevent path traversal.

[Back to top ↑](#download-directioner-)

---

<a name="-português-brasil"></a>
## 🇧🇷 Português (Brasil)

### ✨ Recursos
- **Roteamento Automático:** Redireciona downloads correspondentes para subpastas personalizadas dentro da sua pasta Downloads.
- **Barra de Downloads Nativa Sempre Limpa:** Arquivos movidos para subpastas são apagados automaticamente da lista nativa de downloads do navegador após serem concluídos (`chrome.downloads.erase`), impedindo falsos alertas de "Falha - Nenhum arquivo" ou "Arquivo não encontrado".
- **Filtros Multi-Condicionais:** Combine filtros com lógica E (AND) ou OU (OR):
  - Extensão do arquivo (ex: `.zpl`, `.pdf`, `.txt`, `.xml`, `.csv`)
  - Padrão do nome (Contém, Começa com, Termina com, Expressões Regulares)
  - Domínio de origem / Referrer (ex: `bling.com.br`)
  - Tipos MIME (ex: `application/pdf`)
- **Histórico de Auditoria de 10 Dias:** Guia dedicada com histórico local dos downloads direcionados, regra aplicada, filtros atendidos e subpasta de destino, com purga automática de itens com mais de 10 dias.
- **Compatibilidade Multi-Navegador:** Suporte nativo para navegadores Chromium (`chrome.downloads.onDeterminingFilename`) e arquitetura com fallback para Mozilla Firefox.
- **Interface Trilíngue:** Alterne em tempo real entre **Inglês (EN)**, **Português (PT-BR)** e **Espanhol (ES)**.
- **Salva-Rascunhos Anti-Reset:** Não perde os dados do formulário caso o popup feche acidentalmente durante a digitação de uma nova regra.
- **Simulador de Regras (Sandbox):** Teste suas regras com arquivos simulados antes de realizar downloads reais.
- **Importação / Exportação:** Faça backup e restaure suas regras facilmente via JSON.
- **Privacidade Total:** Execução 100% local no navegador. Sem telemetria, sem servidores externos e sem rastreamento.

### 📂 Estrutura do Projeto
<pre><code>Download Directioner/
├── manifest.json            # Manifesto MV3 para múltiplos navegadores
├── icons/
│   └── lo
