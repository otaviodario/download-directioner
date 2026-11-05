import { RulesEngine } from '../background/rulesEngine.js';

const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

let rules = [];
let editingRuleId = null;
let currentLang = 'en';
let toastTimeout = null;

const i18n = {
  en: {
    btnNewRule: '+ New Rule',
    btnExport: 'Export',
    btnImport: 'Import',
    formTitleAdd: 'Add Rule',
    formTitleEdit: 'Edit Rule',
    lblRuleName: 'Rule Name *',
    phRuleName: 'e.g., ZPL Labels',
    lblRuleExt: 'File Extension',
    optExtAny: '-- Any Extension --',
    optExtCustom: 'Custom / Other...',
    phRuleExt: 'e.g. .zpl, .pdf, .txt',
    lblRuleMime: 'MIME Type (Optional)',
    phRuleMime: 'e.g. application/pdf',
    lblRuleFilename: 'Filename Condition',
    phRuleFilename: 'e.g. invoice_',
    lblRuleOrigin: 'Origin (Domain or URL)',
    phRuleOrigin: 'e.g., bling.com.br',
    lblRuleMatchMode: 'Condition Logic',
    optMatchAll: 'Match ALL conditions (AND)',
    optMatchAny: 'Match ANY condition (OR)',
    lblRuleDestination: 'Target Folder *',
    phRuleDestination: 'e.g., Labels/ZPL or ZPL',
    btnPickFolder: 'Browse...',
    txtHelperDestination: 'Target folder inside Downloads directory.',
    msgFolderSelected: 'Folder selected:',
    msgFolderPickerUnsupported: 'Please type the folder name manually.',
    btnSaveRule: 'Save Rule',
    btnCancelRule: 'Cancel',
    txtPriorityRules: 'Priority Rules',
    txtEmptyState: 'No routing rules configured yet. Click + New Rule to organize your downloads.',
    txtSandboxSummary: 'Rule Evaluator (Test Bench)',
    phTestFilename: 'Test Filename (e.g. doc.pdf)',
    phTestMime: 'Test MIME (e.g. application/pdf)',
    phTestOrigin: 'Test URL (e.g. https://bling.com.br)',
    btnRunTest: 'Simulate Routing',
    opContains: 'contains',
    opEquals: 'equals',
    opStartsWith: 'starts with',
    opEndsWith: 'ends with',
    opRegex: 'regex',
    helpTitle: 'Filter Guide',
    helpExtTitle: 'Extension:',
    helpExtDesc: 'Filters by ending (.zpl, .pdf, .txt).',
    helpMimeTitle: 'MIME Type:',
    helpMimeDesc: 'Sent by the web server. Useful when files are generated dynamically without extension in the link. (Optional)',
    helpFilenameTitle: 'Filename:',
    helpFilenameDesc: 'Distinguishes files of the same type. E.g., route only files containing "danfe_" or "label_".',
    helpOriginTitle: 'Origin:',
    helpOriginDesc: 'Filters downloads coming from specific domains (e.g. bling.com.br).',
    msgRequiredFields: 'Rule Name and Target Folder are mandatory.',
    msgImportInvalid: 'Invalid rules configuration file.',
    msgImportParseError: 'Unable to parse JSON file.',
    msgImportSuccess: 'Rules imported successfully.',
    testMatched: 'Matched: Rule',
    testDestination: 'Destination:',
    testNoMatch: 'No match: Default downloads directory.',
    ruleSaved: 'Rule saved successfully!'
  },
  pt: {
    btnNewRule: '+ Nova Regra',
    btnExport: 'Exportar',
    btnImport: 'Importar',
    formTitleAdd: 'Nova Regra',
    formTitleEdit: 'Editar Regra',
    lblRuleName: 'Nome da Regra *',
    phRuleName: 'Ex: Etiquetas ZPL',
    lblRuleExt: 'Extensão do Arquivo',
    optExtAny: '-- Qualquer Extensão --',
    optExtCustom: 'Personalizada / Outra...',
    phRuleExt: 'Ex: .zpl, .pdf, .txt',
    lblRuleMime: 'Tipo MIME (Opcional)',
    phRuleMime: 'Ex: application/pdf',
    lblRuleFilename: 'Condição do Nome',
    phRuleFilename: 'Ex: danfe_',
    lblRuleOrigin: 'Origem (Domínio ou URL)',
    phRuleOrigin: 'Ex: bling.com.br',
    lblRuleMatchMode: 'Lógica das Condições',
    optMatchAll: 'Todas as condições (AND)',
    optMatchAny: 'Qualquer condição (OR)',
    lblRuleDestination: 'Pasta de Destino *',
    phRuleDestination: 'Ex: Etiquetas/ZPL ou ZPL',
    btnPickFolder: 'Buscar...',
    txtHelperDestination: 'Pasta criada dentro da sua pasta Downloads.',
    msgFolderSelected: 'Pasta selecionada:',
    msgFolderPickerUnsupported: 'Por favor, digite o nome da pasta manualmente.',
    btnSaveRule: 'Salvar Regra',
    btnCancelRule: 'Cancelar',
    txtPriorityRules: 'Regras por Prioridade',
    txtEmptyState: 'Nenhuma regra configurada. Clique em + Nova Regra para começar.',
    txtSandboxSummary: 'Simulador de Regras (Test Bench)',
    phTestFilename: 'Nome do arquivo de teste (ex: doc.pdf)',
    phTestMime: 'MIME de teste (ex: application/pdf)',
    phTestOrigin: 'URL de teste (ex: https://bling.com.br)',
    btnRunTest: 'Simular Direcionamento',
    opContains: 'contém',
    opEquals: 'é igual a',
    opStartsWith: 'começa com',
    opEndsWith: 'termina com',
    opRegex: 'expressão regular',
    helpTitle: 'Guia de Uso dos Filtros',
    helpExtTitle: 'Extensão:',
    helpExtDesc: 'Filtra pelo final do arquivo (.zpl, .pdf, .txt).',
    helpMimeTitle: 'Tipo MIME:',
    helpMimeDesc: 'Enviado pelo servidor web. Muito útil quando o download é gerado por sistema e não tem .pdf no link, mas o servidor envia application/pdf. (Opcional)',
    helpFilenameTitle: 'Nome do Arquivo:',
    helpFilenameDesc: 'Separa arquivos do mesmo formato. Ex: salvar em pastas diferentes conforme contenha "danfe_" ou "etiqueta_".',
    helpOriginTitle: 'Origem:',
    helpOriginDesc: 'Filtra arquivos vindos de um site ou domínio específico (ex: bling.com.br).',
    msgRequiredFields: 'Nome da Regra e Pasta de Destino são obrigatórios.',
    msgImportInvalid: 'Arquivo de regras com formato inválido.',
    msgImportParseError: 'Não foi possível ler o arquivo JSON.',
    msgImportSuccess: 'Regras importadas com sucesso.',
    testMatched: 'Correspondência: Regra',
    testDestination: 'Destino:',
    testNoMatch: 'Sem correspondência: Pasta padrão de downloads.',
    ruleSaved: 'Regra salva com sucesso!'
  },
  es: {
    btnNewRule: '+ Nueva Regla',
    btnExport: 'Exportar',
    btnImport: 'Importar',
    formTitleAdd: 'Nueva Regla',
    formTitleEdit: 'Editar Regla',
    lblRuleName: 'Nombre de la Regla *',
    phRuleName: 'Ej: Etiquetas ZPL',
    lblRuleExt: 'Extensión del Archivo',
    optExtAny: '-- Cualquier Extensión --',
    optExtCustom: 'Personalizada / Otra...',
    phRuleExt: 'Ej: .zpl, .pdf, .txt',
    lblRuleMime: 'Tipo MIME (Opcional)',
    phRuleMime: 'Ej: application/pdf',
    lblRuleFilename: 'Condición del Nombre',
    phRuleFilename: 'Ej: factura_',
    lblRuleOrigin: 'Origen (Dominio o URL)',
    phRuleOrigin: 'Ej: bling.com.br',
    lblRuleMatchMode: 'Lógica de Condiciones',
    optMatchAll: 'Todas las condiciones (AND)',
    optMatchAny: 'Cualquier condición (OR)',
    lblRuleDestination: 'Carpeta de Destino *',
    phRuleDestination: 'Ej: Etiquetas/ZPL o ZPL',
    btnPickFolder: 'Examinar...',
    txtHelperDestination: 'Carpeta dentro del directorio de Descargas.',
    msgFolderSelected: 'Carpeta seleccionada:',
    msgFolderPickerUnsupported: 'Por favor, ingrese el nombre de la carpeta manualmente.',
    btnSaveRule: 'Guardar Regla',
    btnCancelRule: 'Cancelar',
    txtPriorityRules: 'Regras por Prioridad',
    txtEmptyState: 'No hay reglas configuradas aún. Haga clic en + Nueva Regla para comenzar.',
    txtSandboxSummary: 'Simulador de Reglas (Test Bench)',
    phTestFilename: 'Nombre del archivo de prueba (ej: doc.pdf)',
    phTestMime: 'MIME de prueba (ej: application/pdf)',
    phTestOrigin: 'URL de prueba (ej: https://bling.com.br)',
    btnRunTest: 'Simular Enrutamiento',
    opContains: 'contiene',
    opEquals: 'es igual a',
    opStartsWith: 'comienza con',
    opEndsWith: 'termina con',
    opRegex: 'expresión regular',
    helpTitle: 'Guía de Filtros',
    helpExtTitle: 'Extensión:',
    helpExtDesc: 'Filtra por la terminación del archivo (.zpl, .pdf, .txt).',
    helpMimeTitle: 'Tipo MIME:',
    helpMimeDesc: 'Enviado por el servidor web. Muy útil para descargas generadas dinámicamente sin extensión en el enlace. (Opcional)',
    helpFilenameTitle: 'Nombre del Archivo:',
    helpFilenameDesc: 'Diferencia archivos del mismo formato. Ej: guardar en carpetas distintas según contenga "factura_" o "etiqueta_".',
    helpOriginTitle: 'Origen:',
    helpOriginDesc: 'Filtra archivos procedentes de un sitio web o dominio específico (ej: bling.com.br).',
    msgRequiredFields: 'Nombre de la Regla y Carpeta de Destino son obligatorios.',
    msgImportInvalid: 'Archivo de reglas con formato no válido.',
    msgImportParseError: 'No se pudo leer el archivo JSON.',
    msgImportSuccess: 'Reglas importadas con éxito.',
    testMatched: 'Coincidencia: Regra',
    testDestination: 'Destino:',
    testNoMatch: 'Sin coincidencia: Carpeta predeterminada de descargas.',
    ruleSaved: '¡Regla guardada con éxito!'
  }
};

// UI Elements
const globalToggle = document.getElementById('globalToggle');
const langEN = document.getElementById('langEN');
const langPT = document.getElementById('langPT');
const langES = document.getElementById('langES');
const notificationToast = document.getElementById('notificationToast');

const btnToggleHelp = document.getElementById('btnToggleHelp');
const helpGuidePanel = document.getElementById('helpGuidePanel');
const ruleExtSelect = document.getElementById('ruleExtSelect');
const ruleExt = document.getElementById('ruleExt');

const btnNewRule = document.getElementById('btnNewRule');
const ruleFormContainer = document.getElementById('ruleFormContainer');
const btnSaveRule = document.getElementById('btnSaveRule');
const btnCancelRule = document.getElementById('btnCancelRule');
const rulesList = document.getElementById('rulesList');
const emptyState = document.getElementById('emptyState');
const ruleCount = document.getElementById('ruleCount');

const btnExport = document.getElementById('btnExport');
const btnImport = document.getElementById('btnImport');
const importFileInput = document.getElementById('importFileInput');

const btnPickFolder = document.getElementById('btnPickFolder');
const ruleDestination = document.getElementById('ruleDestination');
const ruleNameInput = document.getElementById('ruleName');

const btnRunTest = document.getElementById('btnRunTest');
const testFilename = document.getElementById('testFilename');
const testMime = document.getElementById('testMime');
const testOrigin = document.getElementById('testOrigin');
const testResult = document.getElementById('testResult');

// Notification System
function showNotification(messageKeyOrText, type = 'warning') {
  const dict = i18n[currentLang];
  const message = dict[messageKeyOrText] || messageKeyOrText;

  notificationToast.textContent = message;
  notificationToast.className = `notification-toast ${type}`;
  notificationToast.classList.remove('hidden');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    notificationToast.classList.add('hidden');
  }, 3200);
}

// Language Switcher
function applyLanguage(lang) {
  currentLang = lang;
  [langEN, langPT, langES].forEach(btn => btn && btn.classList.remove('active'));

  if (lang === 'pt') {
    if (langPT) langPT.classList.add('active');
  } else if (lang === 'es') {
    if (langES) langES.classList.add('active');
  } else {
    if (langEN) langEN.classList.add('active');
  }

  const dict = i18n[currentLang];

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });

  const formTitle = document.getElementById('formTitle');
  if (formTitle) {
    formTitle.textContent = editingRuleId ? dict.formTitleEdit : dict.formTitleAdd;
  }

  browserAPI.storage.local.set({ app_language: currentLang });
}

// Draft Persistence (Anti-Reset)
function saveDraftState() {
  if (ruleFormContainer.classList.contains('hidden')) {
    browserAPI.storage.local.remove('form_draft');
    return;
  }

  const draft = {
    isEditing: true,
    editingRuleId,
    ruleName: ruleNameInput.value,
    ruleExtSelect: ruleExtSelect.value,
    ruleExt: ruleExt.value,
    ruleMime: document.getElementById('ruleMime').value,
    ruleMimeOperator: document.getElementById('ruleMimeOperator').value,
    ruleFilename: document.getElementById('ruleFilename').value,
    ruleFilenameOperator: document.getElementById('ruleFilenameOperator').value,
    ruleOrigin: document.getElementById('ruleOrigin').value,
    ruleMatchMode: document.getElementById('ruleMatchMode').value,
    ruleDestination: ruleDestination.value
  };

  browserAPI.storage.local.set({ form_draft: draft });
}

function restoreDraftState(draft) {
  if (!draft || !draft.isEditing) return;

  editingRuleId = draft.editingRuleId || null;
  ruleFormContainer.classList.remove('hidden');

  const dict = i18n[currentLang];
  document.getElementById('formTitle').textContent = editingRuleId ? dict.formTitleEdit : dict.formTitleAdd;

  ruleNameInput.value = draft.ruleName || '';
  ruleExtSelect.value = draft.ruleExtSelect || '';
  ruleExt.value = draft.ruleExt || '';

  if (draft.ruleExtSelect === 'custom') {
    ruleExt.classList.remove('hidden');
  } else {
    ruleExt.classList.add('hidden');
  }

  document.getElementById('ruleMime').value = draft.ruleMime || '';
  document.getElementById('ruleMimeOperator').value = draft.ruleMimeOperator || 'contains';
  document.getElementById('ruleFilename').value = draft.ruleFilename || '';
  document.getElementById('ruleFilenameOperator').value = draft.ruleFilenameOperator || 'contains';
  document.getElementById('ruleOrigin').value = draft.ruleOrigin || '';
  document.getElementById('ruleMatchMode').value = draft.ruleMatchMode || 'all';
  ruleDestination.value = draft.ruleDestination || '';
}

function clearDraftState() {
  browserAPI.storage.local.remove('form_draft');
}

// Bind auto-save inputs
[
  ruleNameInput,
  ruleExtSelect,
  ruleExt,
  document.getElementById('ruleMime'),
  document.getElementById('ruleMimeOperator'),
  document.getElementById('ruleFilename'),
  document.getElementById('ruleFilenameOperator'),
  document.getElementById('ruleOrigin'),
  document.getElementById('ruleMatchMode'),
  ruleDestination
].forEach((elem) => {
  if (elem) {
    elem.addEventListener('input', saveDraftState);
    elem.addEventListener('change', saveDraftState);
  }
});

// Help guide toggle
if (btnToggleHelp && helpGuidePanel) {
  btnToggleHelp.addEventListener('click', () => {
    helpGuidePanel.classList.toggle('hidden');
  });
}

// Extension selector toggle
if (ruleExtSelect && ruleExt) {
  ruleExtSelect.addEventListener('change', () => {
    if (ruleExtSelect.value === 'custom') {
      ruleExt.classList.remove('hidden');
      ruleExt.focus();
    } else {
      ruleExt.classList.add('hidden');
      ruleExt.value = ruleExtSelect.value;
    }
    saveDraftState();
  });
}

// Directory Picker
if (btnPickFolder && ruleDestination) {
  btnPickFolder.addEventListener('click', async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await window.showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          ruleDestination.value = dirHandle.name;
          ruleDestination.classList.remove('input-error');
          saveDraftState();
          showNotification(`${i18n[currentLang].msgFolderSelected} ${dirHandle.name}`, 'success');
        }
      } else {
        showNotification('msgFolderPickerUnsupported', 'warning');
      }
    } catch {
      // User cancelled picker
    }
  });
}

// Load Data
async function loadData() {
  browserAPI.storage.local.get({
    config_enabled: true,
    directioner_rules: [],
    app_language: 'en',
    form_draft: null
  }, (data) => {
    globalToggle.checked = data.config_enabled;
    rules = data.directioner_rules || [];
    applyLanguage(data.app_language || 'en');
    renderRules();

    if (data.form_draft) {
      restoreDraftState(data.form_draft);
    }
  });
}

// Save Data
function saveData() {
  browserAPI.storage.local.set({
    config_enabled: globalToggle.checked,
    directioner_rules: rules,
    app_language: currentLang
  }, () => {
    renderRules();
  });
}

// Render Rule Items
function renderRules() {
  rulesList.innerHTML = '';
  ruleCount.textContent = rules.length;

  if (rules.length === 0) {
    emptyState.classList.remove('hidden');
    rulesList.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  rulesList.classList.remove('hidden');

  rules.forEach((rule, index) => {
    const li = document.createElement('li');
    li.className = 'rule-item';

    const info = document.createElement('div');
    info.className = 'rule-info';
    info.innerHTML = `
      <span class="rule-title">${rule.name}</span>
      <span class="rule-path">${rule.destination}</span>
    `;

    const controls = document.createElement('div');
    controls.className = 'rule-controls';

    if (index > 0) {
      const upBtn = document.createElement('button');
      upBtn.className = 'icon-btn';
      upBtn.innerHTML = '▲';
      upBtn.title = currentLang === 'pt' ? 'Aumentar prioridade' : (currentLang === 'es' ? 'Aumentar prioridad' : 'Increase priority');
      upBtn.onclick = () => movePriority(index, -1);
      controls.appendChild(upBtn);
    }

    if (index < rules.length - 1) {
      const downBtn = document.createElement('button');
      downBtn.className = 'icon-btn';
      downBtn.innerHTML = '▼';
      downBtn.title = currentLang === 'pt' ? 'Diminuir prioridade' : (currentLang === 'es' ? 'Disminuir prioridad' : 'Decrease priority');
      downBtn.onclick = () => movePriority(index, 1);
      controls.appendChild(downBtn);
    }

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = rule.enabled !== false;
    toggle.title = currentLang === 'pt' ? 'Ativar / Desativar regra' : (currentLang === 'es' ? 'Activar / Desactivar regla' : 'Enable / Disable rule');
    toggle.onchange = () => {
      rule.enabled = toggle.checked;
      saveData();
    };
    controls.appendChild(toggle);

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerHTML = '✎';
    editBtn.title = currentLang === 'pt' ? 'Editar regra' : (currentLang === 'es' ? 'Editar regla' : 'Edit rule');
    editBtn.onclick = () => openEditForm(rule.id);
    controls.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.innerHTML = '🗑';
    delBtn.title = currentLang === 'pt' ? 'Excluir regra' : (currentLang === 'es' ? 'Eliminar regla' : 'Delete rule');
    delBtn.onclick = () => deleteRule(rule.id);
    controls.appendChild(delBtn);

    li.appendChild(info);
    li.appendChild(controls);
    rulesList.appendChild(li);
  });
}

function movePriority(index, direction) {
  const targetIndex = index + direction;
  const temp = rules[index];
  rules[index] = rules[targetIndex];
  rules[targetIndex] = temp;
  saveData();
}

function openEditForm(ruleId = null) {
  editingRuleId = ruleId;
  ruleFormContainer.classList.remove('hidden');
  const dict = i18n[currentLang];

  if (helpGuidePanel) helpGuidePanel.classList.add('hidden');

  if (ruleId) {
    const r = rules.find((item) => item.id === ruleId);
    if (!r) return;
    document.getElementById('formTitle').textContent = dict.formTitleEdit;
    ruleNameInput.value = r.name || '';
    
    const currentExt = (r.extension || '').toLowerCase();
    const standardOptions = Array.from(ruleExtSelect.options).map(o => o.value);
    if (standardOptions.includes(currentExt)) {
      ruleExtSelect.value = currentExt;
      ruleExt.value = currentExt;
      ruleExt.classList.add('hidden');
    } else if (currentExt === '') {
      ruleExtSelect.value = '';
      ruleExt.value = '';
      ruleExt.classList.add('hidden');
    } else {
      ruleExtSelect.value = 'custom';
      ruleExt.value = currentExt;
      ruleExt.classList.remove('hidden');
    }

    document.getElementById('ruleMime').value = r.mime || '';
    document.getElementById('ruleMimeOperator').value = r.mimeOperator || 'contains';
    document.getElementById('ruleFilename').value = r.filenamePattern || '';
    document.getElementById('ruleFilenameOperator').value = r.filenameOperator || 'contains';
    document.getElementById('ruleOrigin').value = r.origin || '';
    document.getElementById('ruleMatchMode').value = r.matchMode || 'all';
    ruleDestination.value = r.destination || '';
  } else {
    document.getElementById('formTitle').textContent = dict.formTitleAdd;
    ruleNameInput.value = '';
    ruleExtSelect.value = '';
    ruleExt.value = '';
    ruleExt.classList.add('hidden');
    document.getElementById('ruleMime').value = '';
    document.getElementById('ruleFilename').value = '';
    document.getElementById('ruleOrigin').value = '';
    ruleDestination.value = '';
  }

  saveDraftState();
}

function closeForm() {
  ruleFormContainer.classList.add('hidden');
  editingRuleId = null;
  ruleNameInput.classList.remove('input-error');
  ruleDestination.classList.remove('input-error');
}

function deleteRule(ruleId) {
  rules = rules.filter((r) => r.id !== ruleId);
  saveData();
}

// Event Listeners
langEN.addEventListener('click', () => applyLanguage('en'));
langPT.addEventListener('click', () => applyLanguage('pt'));
if (langES) langES.addEventListener('click', () => applyLanguage('es'));

btnNewRule.addEventListener('click', () => {
  openEditForm(null);
});

btnCancelRule.addEventListener('click', () => {
  clearDraftState();
  closeForm();
});

btnSaveRule.addEventListener('click', () => {
  const name = ruleNameInput.value.trim();
  let destination = ruleDestination.value.trim();

  ruleNameInput.classList.remove('input-error');
  ruleDestination.classList.remove('input-error');

  // Intelligent fallback: rule name as folder if destination empty
  if (!destination && name) {
    destination = RulesEngine.sanitizeSubfolder(name);
    ruleDestination.value = destination;
  }

  let hasError = false;
  if (!name) {
    ruleNameInput.classList.add('input-error');
    hasError = true;
  }
  if (!destination) {
    ruleDestination.classList.add('input-error');
    hasError = true;
  }

  if (hasError) {
    showNotification('msgRequiredFields', 'warning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  let selectedExtension = ruleExtSelect.value === 'custom' 
    ? ruleExt.value.trim() 
    : ruleExtSelect.value;

  if (selectedExtension && !selectedExtension.startsWith('.')) {
    selectedExtension = '.' + selectedExtension;
  }

  const rulePayload = {
    id: editingRuleId || `rule_${Date.now()}`,
    name,
    enabled: true,
    extension: selectedExtension,
    mime: document.getElementById('ruleMime').value.trim(),
    mimeOperator: document.getElementById('ruleMimeOperator').value,
    filenamePattern: document.getElementById('ruleFilename').value.trim(),
    filenameOperator: document.getElementById('ruleFilenameOperator').value,
    origin: document.getElementById('ruleOrigin').value.trim(),
    matchMode: document.getElementById('ruleMatchMode').value,
    destination: RulesEngine.sanitizeSubfolder(destination)
  };

  if (editingRuleId) {
    const idx = rules.findIndex((r) => r.id === editingRuleId);
    if (idx !== -1) rules[idx] = rulePayload;
  } else {
    rules.push(rulePayload);
  }

  saveData();
  clearDraftState();
  closeForm();
  showNotification(i18n[currentLang].ruleSaved, 'success');
});

globalToggle.addEventListener('change', saveData);

// Export Rules to JSON
btnExport.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'download_directioner_rules.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Import Rules from JSON
btnImport.addEventListener('click', () => importFileInput.click());

importFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        rules = imported;
        saveData();
        showNotification('msgImportSuccess', 'success');
      } else {
        showNotification('msgImportInvalid', 'error');
      }
    } catch {
      showNotification('msgImportParseError', 'error');
    }
  };
  reader.readAsText(file);
});

// Live Test Bench
btnRunTest.addEventListener('click', () => {
  const dict = i18n[currentLang];
  const testItem = {
    filename: testFilename.value.trim() || 'example_file.pdf',
    mime: testMime.value.trim() || 'application/pdf',
    url: testOrigin.value.trim() || 'https://bling.com.br'
  };

  const evalResult = RulesEngine.determineTarget(rules, testItem);
  testResult.style.display = 'block';

  if (evalResult.matched) {
    testResult.style.backgroundColor = '#dcfce7';
    testResult.style.color = '#166534';
    testResult.innerHTML = `<strong>${dict.testMatched}:</strong> "${evalResult.rule.name}"<br><strong>${dict.testDestination}</strong> ${evalResult.targetPath}`;
  } else {
    testResult.style.backgroundColor = '#fee2e2';
    testResult.style.color = '#991b1b';
    testResult.innerHTML = `<strong>${dict.testNoMatch}</strong>`;
  }
});

document.addEventListener('DOMContentLoaded', loadData);