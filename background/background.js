import { RulesEngine } from './rulesEngine.js';

const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;
const processedDownloads = new Set();

async function getStoredConfiguration() {
  const defaults = { config_enabled: true, directioner_rules: [] };
  return new Promise((resolve) => {
    browserAPI.storage.local.get(defaults, (result) => {
      resolve(result || defaults);
    });
  });
}

// Chromium Adapter: uses downloads.onDeterminingFilename
if (browserAPI.downloads && browserAPI.downloads.onDeterminingFilename) {
  browserAPI.downloads.onDeterminingFilename.addListener((item, suggest) => {
    getStoredConfiguration().then(({ config_enabled, directioner_rules }) => {
      console.log('[Download Directioner] Download detected:', item.filename, 'from:', item.url);

      if (!config_enabled || !directioner_rules || directioner_rules.length === 0) {
        console.log('[Download Directioner] Extension disabled or no rules configured.');
        suggest();
        return;
      }

      const result = RulesEngine.determineTarget(directioner_rules, {
        filename: item.filename,
        mime: item.mime,
        url: item.url,
        finalUrl: item.finalUrl || item.url,
        referrer: item.referrer || ''
      });

      if (result.matched) {
        console.log('[Download Directioner] Matched rule:', result.rule.name, '-> Routing to:', result.targetPath);
        suggest({
          filename: result.targetPath,
          conflictAction: 'uniquify'
        });
      } else {
        console.log('[Download Directioner] No rules matched. Proceeding with default path.');
        suggest();
      }
    }).catch((err) => {
      console.error('[Download Directioner] Error evaluating download:', err);
      suggest();
    });

    return true; // Asynchronous suggestion response flag
  });
} 
// Firefox Adapter: downloads.onDeterminingFilename is unsupported; uses onCreated + download reroute
else if (browserAPI.downloads && browserAPI.downloads.onCreated) {
  browserAPI.downloads.onCreated.addListener(async (item) => {
    if (processedDownloads.has(item.id)) {
      processedDownloads.delete(item.id);
      return;
    }

    const { config_enabled, directioner_rules } = await getStoredConfiguration();
    if (!config_enabled || !directioner_rules || directioner_rules.length === 0) {
      return;
    }

    const result = RulesEngine.determineTarget(directioner_rules, {
      filename: item.filename,
      mime: item.mime,
      url: item.url,
      finalUrl: item.url,
      referrer: item.referrer || ''
    });

    if (result.matched) {
      try {
        await browserAPI.downloads.cancel(item.id);
        await browserAPI.downloads.erase({ id: item.id });
        const newDownloadId = await browserAPI.downloads.download({
          url: item.url,
          filename: result.targetPath,
          conflictAction: 'uniquify',
          saveAs: false
        });
        processedDownloads.add(newDownloadId);
      } catch (err) {
        // Fallback: file proceeds on standard path
      }
    }
  });
}