import { RulesEngine } from './rulesEngine.js';

const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;
const processedDownloads = new Set();
const LIMITE_DIAS_HISTORICO = 10;
const LIMITE_MILISSEGUNDOS_HISTORICO = LIMITE_DIAS_HISTORICO * 24 * 60 * 60 * 1000;

async function getStoredConfiguration() {
  const defaults = { config_enabled: true, directioner_rules: [] };
  return new Promise((resolve) => {
    browserAPI.storage.local.get(defaults, (result) => {
      resolve(result || defaults);
    });
  });
}

async function registrar_historico_download(dados_registro) {
  return new Promise((resolve) => {
    browserAPI.storage.local.get({ directioner_history: [] }, (data) => {
      const agora = Date.now();
      const historico_atual = Array.isArray(data.directioner_history) ? data.directioner_history : [];

      // Filtra e descarta automaticamente registros com mais de 10 dias
      const historico_filtrado = historico_atual.filter((item) => {
        return (agora - (item.timestamp || 0)) <= LIMITE_MILISSEGUNDOS_HISTORICO;
      });

      const novo_registro = {
        id: `hist_${agora}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: agora,
        originalFilename: dados_registro.originalFilename || '',
        targetPath: dados_registro.targetPath || '',
        matched: Boolean(dados_registro.matched),
        ruleName: dados_registro.ruleName || '',
        matchedCriteria: dados_registro.matchedCriteria || [],
        url: dados_registro.url || ''
      };

      historico_filtrado.unshift(novo_registro);

      browserAPI.storage.local.set({ directioner_history: historico_filtrado }, () => {
        resolve(historico_filtrado);
      });
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
        registrar_historico_download({
          originalFilename: item.filename,
          targetPath: item.filename,
          matched: false,
          ruleName: '',
          matchedCriteria: ['Extension disabled or no rules'],
          url: item.url
        });
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
        processedDownloads.add(item.id);
        registrar_historico_download({
          originalFilename: item.filename,
          targetPath: result.targetPath,
          matched: true,
          ruleName: result.rule.name,
          matchedCriteria: result.matchedCriteria || [],
          url: item.url
        });
        suggest({
          filename: result.targetPath,
          conflictAction: 'uniquify'
        });
      } else {
        console.log('[Download Directioner] No rules matched. Proceeding with default path.');
        registrar_historico_download({
          originalFilename: item.filename,
          targetPath: item.filename,
          matched: false,
          ruleName: '',
          matchedCriteria: ['No rules matched criteria'],
          url: item.url
        });
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
      return;
    }

    const { config_enabled, directioner_rules } = await getStoredConfiguration();
    if (!config_enabled || !directioner_rules || directioner_rules.length === 0) {
      registrar_historico_download({
        originalFilename: item.filename,
        targetPath: item.filename,
        matched: false,
        ruleName: '',
        matchedCriteria: ['Extension disabled or no rules'],
        url: item.url
      });
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
        registrar_historico_download({
          originalFilename: item.filename,
          targetPath: result.targetPath,
          matched: true,
          ruleName: result.rule.name,
          matchedCriteria: result.matchedCriteria || [],
          url: item.url
        });
      } catch (err) {
        // Fallback: file proceeds on standard path
      }
    } else {
      registrar_historico_download({
        originalFilename: item.filename,
        targetPath: item.filename,
        matched: false,
        ruleName: '',
        matchedCriteria: ['No rules matched criteria'],
        url: item.url
      });
    }
  });
}

// Global Download Completion Observer: remove os downloads redirecionados da lista nativa do navegador
if (browserAPI.downloads && browserAPI.downloads.onChanged) {
  browserAPI.downloads.onChanged.addListener((delta) => {
    if (!processedDownloads.has(delta.id)) {
      return;
    }

    const download_completo = delta.state && delta.state.current === 'complete';
    const download_com_falha = delta.error && delta.error.current;

    if (download_completo || download_com_falha) {
      setTimeout(() => {
        try {
          browserAPI.downloads.erase({ id: delta.id }, () => {
            processedDownloads.delete(delta.id);
          });
        } catch (erro_erase) {
          processedDownloads.delete(delta.id);
        }
      }, 500);
    }
  });
}
