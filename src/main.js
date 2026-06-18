import { DESTINATIONS, getDestinationGroup } from './data.js';
import { fetchDashboardData, fetchDelegations, config } from './api.js';

let state = null;
let pollingInterval = null;

// Elements
const gridPending = document.getElementById('grid-pending');
const gridImport = document.getElementById('grid-import');
const gridBaleares = document.getElementById('grid-baleares');
const gridCanarias = document.getElementById('grid-canarias');
const gridPeninsula = document.getElementById('grid-peninsula');
const warehouseContainer = document.getElementById('section-warehouse');
const clockElement = document.getElementById('clock');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('theme-icon-sun');
const moonIcon = document.getElementById('theme-icon-moon');
const statusIndicator = document.getElementById('connection-status');
const statusText = statusIndicator.querySelector('.status-text');

// PIN Modal Elements
const pinModal = document.getElementById('pin-modal');
const closePinModal = document.getElementById('close-pin-modal');
const submitPin = document.getElementById('submit-pin');
const pinInput = document.getElementById('pin-input');
const pinError = document.getElementById('pin-error');

// Settings Modal Elements
const settingsModal = document.getElementById('settings-modal');
const closeModal = document.getElementById('close-modal');
const saveSettings = document.getElementById('save-settings');
const apiModeSelect = document.getElementById('api-mode');
const apiUrlInput = document.getElementById('api-url');
const apiIntervalInput = document.getElementById('api-interval');
const apiDelegationSelect = document.getElementById('api-delegation');
const settingsPinInput = document.getElementById('settings-pin');

// Initialization
async function init() {
  updateClock();
  setInterval(updateClock, 1000);

  // Theme logic
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });

  // Connection Indicator -> Opens PIN Modal first
  statusIndicator.addEventListener('click', () => {
    pinInput.value = '';
    pinError.style.display = 'none';
    pinModal.style.display = 'flex';
    pinInput.focus();
  });

  // PIN Modal Event Handlers
  closePinModal.addEventListener('click', () => {
    pinModal.style.display = 'none';
  });

  submitPin.addEventListener('click', handlePinSubmit);
  pinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handlePinSubmit();
  });

  function handlePinSubmit() {
    if (pinInput.value === config.pin) {
      // Mostrar estado de carga en el botón
      submitPin.disabled = true;
      submitPin.textContent = 'Conectando con ERP...';
      submitPin.style.opacity = '0.7';

      // Load form fields (se preparan en el DOM aunque no se vean aún)
      apiModeSelect.value = config.useRealApi ? 'real' : 'mock';
      apiUrlInput.value = config.baseUrl;
      apiIntervalInput.value = config.refreshInterval;
      settingsPinInput.value = '';
      apiUrlInput.parentElement.style.display = config.useRealApi ? 'flex' : 'none';

      // Usar setTimeout para permitir que el navegador dibuje el botón "Conectando..."
      setTimeout(async () => {
        // Fetch a las delegaciones (puede tardar si la URL no responde)
        await loadDelegationsDropdown();
        
        // Cambiamos de modal
        pinModal.style.display = 'none';
        settingsModal.style.display = 'flex';
        
        // Restaurar estado del botón para la próxima vez
        submitPin.disabled = false;
        submitPin.textContent = 'Acceder';
        submitPin.style.opacity = '1';
      }, 100);
    } else {
      pinError.style.display = 'block';
    }
  }

  // Settings Modal Event Handlers
  apiModeSelect.addEventListener('change', () => {
    apiUrlInput.parentElement.style.display = apiModeSelect.value === 'real' ? 'flex' : 'none';
  });

  closeModal.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  saveSettings.addEventListener('click', () => {
    const useReal = apiModeSelect.value === 'real';
    const url = apiUrlInput.value;
    const interval = parseInt(apiIntervalInput.value);
    const delegation = apiDelegationSelect.value;
    const newPin = settingsPinInput.value.trim();

    localStorage.setItem('erp_use_real', useReal);
    localStorage.setItem('erp_url', url);
    localStorage.setItem('erp_interval', interval);
    localStorage.setItem('erp_delegation', delegation);

    // Update live config
    config.useRealApi = useReal;
    config.baseUrl = url;
    config.refreshInterval = interval;
    config.delegation = delegation;

    if (newPin) {
      localStorage.setItem('erp_pin', newPin);
      config.pin = newPin;
    }

    settingsModal.style.display = 'none';

    // Clear display to force full reload of layout
    clearGrids();

    // Restart polling with new settings
    startPolling();
  });

  // Populate delegations list
  async function loadDelegationsDropdown() {
    try {
      const delegations = await fetchDelegations();
      apiDelegationSelect.innerHTML = '';
      delegations.forEach(del => {
        const option = document.createElement('option');
        option.value = del.code;
        const group = getDestinationGroup(del.code);
        option.textContent = `${del.code} - ${del.name} (${group})`;
        if (del.code === config.delegation) option.selected = true;
        apiDelegationSelect.appendChild(option);
      });
    } catch (e) {
      console.error('Failed to load delegations', e);
    }
  }

  // Clear current HTML nodes (to avoid leftovers on delegation switch)
  function clearGrids() {
    gridPending.innerHTML = '';
    gridImport.innerHTML = '';
    gridBaleares.innerHTML = '';
    gridCanarias.innerHTML = '';
    gridPeninsula.innerHTML = '';
    warehouseContainer.innerHTML = '';
    state = null;
  }

  let pollingTimeout = null;

  async function updateData() {
    try {
      const newData = await fetchDashboardData();
      if (newData) {
        state = newData;
        statusIndicator.classList.remove('offline');
        statusText.textContent = config.useRealApi ? `${config.delegation} - ERP ONLINE` : `${config.delegation} - SIMULACIÓN`;
        render();
      }
    } catch (error) {
      statusIndicator.classList.add('offline');
      statusText.textContent = 'ERP OFFLINE';
    } finally {
      if (pollingTimeout !== false) {
        pollingTimeout = setTimeout(updateData, config.refreshInterval * 1000);
      }
    }
  }

  function startPolling() {
    if (pollingTimeout) clearTimeout(pollingTimeout);
    pollingTimeout = false; // Flag to prevent overlaps
    clearTimeout(pollingTimeout);
    updateData();
  }

  startPolling();
}

function updateClock() {
  const now = new Date();
  clockElement.textContent = now.toLocaleTimeString();
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  if (theme === 'light') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

function render() {
  if (!state) return;

  // Update header title dynamically to reflect delegation
  document.querySelector('.dashboard-title').textContent = `Dashboard Operativo - ${config.delegation}`;

  renderDocks();
  renderWarehouse();
}

function renderDocks() {
  const currentDockIds = state.docks.map(dock => `dock-${dock.id}`);

  // Cleanup old docks not present in the current delegation's state
  [gridPending, gridImport, gridBaleares, gridCanarias, gridPeninsula].forEach(grid => {
    Array.from(grid.children).forEach(child => {
      if (!currentDockIds.includes(child.id)) child.remove();
    });
  });

  state.docks.forEach(dock => {
    let card = document.getElementById(`dock-${dock.id}`);
    const isPending = !dock.destination || !dock.tripId;
    const isImport = !isPending && (dock.destination === config.delegation || !!dock.isImport);
    const isClosed = dock.status === 'closed' || dock.tripStatus === 'closed';

    const targetWeightVal = (dock.targetWeightPerTeu !== undefined && dock.targetWeightPerTeu !== null) ? dock.targetWeightPerTeu : 10300;
    const maxWeight = isPending ? 0 : (dock.teus || 2) * targetWeightVal;
    const percentage = maxWeight > 0 ? (dock.currentWeight / maxWeight) * 100 : 0;

    let statusClass = 'normal';
    if (isPending) statusClass = 'pending';
    else if (percentage >= 95) statusClass = 'critical';
    else if (percentage >= 85) statusClass = 'warning';

    const group = getDestinationGroup(dock.destination);
    const targetGrid = isPending
      ? gridPending
      : (isImport
        ? gridImport
        : (group === 'BALEARES'
          ? gridBaleares
          : (group === 'CANARIAS' ? gridCanarias : gridPeninsula)));

    const expectedType = isPending ? 'pending' : (isImport ? 'import' : 'export');

    if (!card || card.dataset.type !== expectedType || card.dataset.closed !== String(isClosed)) {
      if (!card) {
        card = document.createElement('div');
        card.id = `dock-${dock.id}`;
      }
      card.dataset.type = expectedType;
      card.dataset.closed = String(isClosed);
      card.className = `dock-card ${isPending ? 'pending' : ''} ${isImport ? 'import' : ''} ${isClosed ? 'closed' : ''} fade-in`;
      card.addEventListener('animationend', () => {
        card.classList.remove('fade-in');
      }, { once: true });

      if (expectedType === 'pending') {
        card.innerHTML = `
          <div class="dock-header">
            <div class="dock-ids">
              <span class="container-id">${dock.containerId}</span>
              <span class="muelle-id">MUELLE: ${dock.id}</span>
            </div>
            <span class="destination-badge"></span>
          </div>
          <div class="weight-info">
            <div class="weight-left">
              <span><span class="weight-current">0</span> kg</span>
              <span class="occupancy-text"></span>
            </div>
            <span class="weight-max">OBJ: -- kg</span>
          </div>
          <div class="progress-container">
            <div class="progress-bar pending" style="width: 0%"></div>
          </div>
        `;
      } else if (expectedType === 'export') {
        card.innerHTML = `
          <div class="dock-header">
            <div class="dock-ids">
              <span class="container-id">${dock.containerId}</span>
              <span class="muelle-id">MUELLE: ${dock.id}</span>
              <span class="operator-name">${dock.operator ? 'OP: ' + dock.operator : ''}</span>
            </div>
            <span class="destination-badge">${dock.destination}</span>
          </div>
          <div class="weight-info">
            <div class="weight-left">
              <span><span class="weight-current">0</span> kg</span>
              <span class="occupancy-text"></span>
            </div>
            <span class="weight-max">OBJ: ${maxWeight.toLocaleString()} kg</span>
          </div>
          <div class="progress-container">
            <div class="progress-bar ${statusClass}" style="width: 0%"></div>
          </div>
          ${isClosed ? '<div class="closed-banner">VIAJE CERRADO</div>' : ''}
        `;
      } else if (expectedType === 'import') {
        card.innerHTML = `
          <div class="dock-header">
            <div class="dock-ids">
              <span class="container-id">${dock.containerId}</span>
              <span class="muelle-id">MUELLE: ${dock.id}</span>
              <span class="operator-name">${dock.operator ? 'OP: ' + dock.operator : ''}</span>
            </div>
          </div>
          <div class="import-expeditions-list"></div>
          <div class="weight-info import-parts-info">
            <span>PENDIENTE: <span class="import-pending-parts">0</span> / <span class="import-total-parts">0</span> P.</span>
            <span class="import-unloaded-percentage">0%</span>
          </div>
          <div class="progress-container">
            <div class="progress-bar import-bar ${isClosed ? 'closed' : ''}" style="width: 0%"></div>
          </div>
        `;
      }

      targetGrid.appendChild(card);
    } else {
      // If card exists, make sure it is in the correct parent grid
      if (card.parentElement !== targetGrid) {
        targetGrid.appendChild(card);
      }
    }

    // Target specific updates
    if (expectedType === 'pending' || expectedType === 'export') {
      const containerIdEl = card.querySelector('.container-id');
      const destBadgeEl = card.querySelector('.destination-badge');
      const weightEl = card.querySelector('.weight-current');
      const maxWeightEl = card.querySelector('.weight-max');
      const barEl = card.querySelector('.progress-bar');
      const textEl = card.querySelector('.occupancy-text');
      const operatorEl = card.querySelector('.operator-name');

      if (containerIdEl.textContent !== dock.containerId) {
        containerIdEl.textContent = dock.containerId;
      }

      if (operatorEl && dock.operator) {
        const opText = 'OP: ' + dock.operator;
        if (operatorEl.textContent !== opText) operatorEl.textContent = opText;
      } else if (operatorEl) {
        operatorEl.textContent = '';
      }

      const expectedDest = dock.destination || '';
      if (destBadgeEl && destBadgeEl.textContent !== expectedDest) {
        destBadgeEl.textContent = expectedDest;
      }

      const expectedCardClass = `dock-card ${isPending ? 'pending' : ''} ${isClosed ? 'closed' : ''}`;
      if (card.className !== expectedCardClass && !card.classList.contains('fade-in')) {
        card.className = expectedCardClass;
      }

      const expectedWeight = dock.currentWeight.toLocaleString();
      if (weightEl.textContent !== expectedWeight) {
        weightEl.textContent = expectedWeight;
      }

      const expectedMaxText = `OBJ: ${isPending ? '--' : maxWeight.toLocaleString()} kg`;
      if (maxWeightEl.textContent !== expectedMaxText) {
        maxWeightEl.textContent = expectedMaxText;
      }

      const targetWidth = `${Math.min(percentage, 100)}%`;
      if (barEl.style.width !== targetWidth) {
        barEl.style.width = targetWidth;
      }

      const targetClass = `progress-bar ${statusClass}`;
      if (barEl.className !== targetClass) {
        barEl.className = targetClass;
      }

      const targetText = isPending ? '' : `(${percentage.toFixed(1)}%)`;
      if (textEl.textContent !== targetText) {
        textEl.textContent = targetText;
      }
      
      if (!isPending) {
        let color = 'var(--text-secondary)';
        if (percentage < 40) color = 'var(--accent-red)';
        else if (percentage < 100) color = 'var(--accent-orange)';
        else color = 'var(--accent-green)';
        if (textEl.style.color !== color) textEl.style.color = color;
      } else {
        if (textEl.style.color !== 'var(--text-secondary)') textEl.style.color = 'var(--text-secondary)';
      }
    } else if (expectedType === 'import') {
      const containerIdEl = card.querySelector('.container-id');
      const listEl = card.querySelector('.import-expeditions-list');
      const pendingEl = card.querySelector('.import-pending-parts');
      const totalEl = card.querySelector('.import-total-parts');
      const pctEl = card.querySelector('.import-unloaded-percentage');
      const barEl = card.querySelector('.import-bar');
      const operatorEl = card.querySelector('.operator-name');

      if (containerIdEl.textContent !== dock.containerId) {
        containerIdEl.textContent = dock.containerId;
      }

      if (operatorEl && dock.operator) {
        const opText = 'OP: ' + dock.operator;
        if (operatorEl.textContent !== opText) operatorEl.textContent = opText;
      } else if (operatorEl) {
        operatorEl.textContent = '';
      }

      const totalImportParts = (dock.expeditions || []).reduce((sum, e) => sum + e.totalParts, 0);
      const pendingImportParts = (dock.expeditions || []).reduce((sum, e) => sum + e.pendingParts, 0);
      const unloadedImportParts = totalImportParts - pendingImportParts;
      const importPercentage = totalImportParts > 0 ? (unloadedImportParts / totalImportParts) * 100 : 0;

      const visibleExps = (dock.expeditions || []).filter(exp => exp.pendingParts > 0);
      const expsHtml = visibleExps.map(exp => `
        <div class="import-exp-item">
          <span class="import-exp-id">${exp.id}</span>
          <span class="import-exp-route">${exp.origin} &rarr; ${exp.destination}</span>
          <span class="import-exp-counter">${exp.pendingParts}/${exp.totalParts} P.</span>
        </div>
      `).join('');

      if (listEl.innerHTML !== expsHtml) {
        listEl.innerHTML = expsHtml;
      }

      if (pendingEl.textContent !== String(pendingImportParts)) {
        pendingEl.textContent = String(pendingImportParts);
      }

      if (totalEl.textContent !== String(totalImportParts)) {
        totalEl.textContent = String(totalImportParts);
      }

      const expectedPctText = `${importPercentage.toFixed(1)}%`;
      if (pctEl.textContent !== expectedPctText) {
        pctEl.textContent = expectedPctText;
      }

      let pctColor = 'var(--text-secondary)';
      if (importPercentage < 40) pctColor = 'var(--accent-red)';
      else if (importPercentage < 100) pctColor = 'var(--accent-orange)';
      else pctColor = 'var(--accent-green)';
      if (pctEl.style.color !== pctColor) pctEl.style.color = pctColor;

      const targetWidth = `${Math.min(importPercentage, 100)}%`;
      if (barEl.style.width !== targetWidth) {
        barEl.style.width = targetWidth;
      }

      // Dynamic color: red → yellow → green based on unloading progress
      let importBarColor;
      if (importPercentage < 50) {
        // Red to Yellow (0-50%)
        const ratio = importPercentage / 50;
        const r = 239;
        const g = Math.round(68 + (158 - 68) * ratio);
        const b = Math.round(68 + (11 - 68) * ratio);
        importBarColor = `rgb(${r}, ${g}, ${b})`;
      } else {
        // Yellow to Green (50-100%)
        const ratio = (importPercentage - 50) / 50;
        const r = Math.round(245 - (245 - 16) * ratio);
        const g = Math.round(158 + (185 - 158) * ratio);
        const b = Math.round(11 + (129 - 11) * ratio);
        importBarColor = `rgb(${r}, ${g}, ${b})`;
      }
      if (!isClosed && barEl.style.backgroundColor !== importBarColor) {
        barEl.style.backgroundColor = importBarColor;
      }
    }
  });

  // Toggle visibility of group sections based on grid contents
  const groupPending = document.getElementById('group-pending');
  const groupImport = document.getElementById('group-import');
  const groupBaleares = document.getElementById('group-baleares');
  const groupCanarias = document.getElementById('group-canarias');
  const groupPeninsula = document.getElementById('group-peninsula');

  const showPending = gridPending.children.length ? 'flex' : 'none';
  if (groupPending.style.display !== showPending) groupPending.style.display = showPending;

  const showImport = gridImport.children.length ? 'flex' : 'none';
  if (groupImport.style.display !== showImport) groupImport.style.display = showImport;

  const showBaleares = gridBaleares.children.length ? 'flex' : 'none';
  if (groupBaleares.style.display !== showBaleares) groupBaleares.style.display = showBaleares;

  const showCanarias = gridCanarias.children.length ? 'flex' : 'none';
  if (groupCanarias.style.display !== showCanarias) groupCanarias.style.display = showCanarias;

  const showPeninsula = gridPeninsula.children.length ? 'flex' : 'none';
  if (groupPeninsula.style.display !== showPeninsula) groupPeninsula.style.display = showPeninsula;
}

function renderWarehouse() {
  // Find all destinations present in active (non-completed) expeditions, excluding local delivery (reparto)
  const activeExpeditions = state.expeditions.filter(e => e.pendingParts > 0 && e.destination !== config.delegation);

  // Sort destinations alphabetically
  const destinations = [...new Set(activeExpeditions.map(e => e.destination))].sort((a, b) => a.localeCompare(b));

  // Cleanup old columns that are no longer in the destinations list
  const activeColumnIds = destinations.map(dest => `col-${dest}`);
  Array.from(warehouseContainer.children).forEach(child => {
    if (!activeColumnIds.includes(child.id)) child.remove();
  });

  destinations.forEach((dest, index) => {
    let column = document.getElementById(`col-${dest}`);
    const destExpeditions = activeExpeditions.filter(e => e.destination === dest);

    if (!column) {
      column = document.createElement('div');
      column.id = `col-${dest}`;
      column.className = 'warehouse-column fade-in';
      column.addEventListener('animationend', () => {
        column.classList.remove('fade-in');
      }, { once: true });
      column.innerHTML = `
        <div class="column-header">
          <div class="column-dest-wrapper">
            <span class="column-dest">${dest}</span>
          </div>
          <div class="column-stats-container">
            <div class="column-stats main-stats">
              <span class="stat-badge count">0 EXP</span>
              <span class="stat-badge weight">0 kg</span>
            </div>
            <div class="column-stats adr-stats">
              <span class="stat-badge adr-count adr-badge">ADR: 0 EXP</span>
              <span class="stat-badge adr-weight adr-badge">0 kg</span>
            </div>
          </div>
        </div>
        <div class="expedition-list"></div>
      `;
    }

    // Only insert/move if not already in the correct position in the DOM to avoid unnecessary reflows/flicker
    if (warehouseContainer.children[index] !== column) {
      warehouseContainer.insertBefore(column, warehouseContainer.children[index] || null);
    }

    const totalExpCount = destExpeditions.length;
    const totalExpWeight = destExpeditions.reduce((sum, e) => sum + e.totalWeight, 0);

    const adrExpeditions = destExpeditions.filter(e => e.isADR);
    const totalAdrCount = adrExpeditions.length;
    const totalAdrWeight = adrExpeditions.reduce((sum, e) => sum + e.totalWeight, 0);

    const countBadge = column.querySelector('.stat-badge.count');
    const weightBadge = column.querySelector('.stat-badge.weight');
    const adrCountBadge = column.querySelector('.stat-badge.adr-count');
    const adrWeightBadge = column.querySelector('.stat-badge.adr-weight');

    const countText = `${totalExpCount} EXP`;
    if (countBadge.textContent !== countText) {
      countBadge.textContent = countText;
    }

    const weightText = `${totalExpWeight.toLocaleString()} kg`;
    if (weightBadge.textContent !== weightText) {
      weightBadge.textContent = weightText;
    }

    const adrCountText = `ADR: ${totalAdrCount} EXP`;
    if (adrCountBadge.textContent !== adrCountText) {
      adrCountBadge.textContent = adrCountText;
    }

    const adrWeightText = `${totalAdrWeight.toLocaleString()} kg`;
    if (adrWeightBadge.textContent !== adrWeightText) {
      adrWeightBadge.textContent = adrWeightText;
    }

    const list = column.querySelector('.expedition-list');

    // ONLY show partial expeditions (started loading)
    const visibleExpeditions = destExpeditions.filter(e => e.pendingParts < e.totalParts);

    // Cleanup cards in list no longer present in visibleExpeditions
    const currentExpIds = visibleExpeditions.map(e => `exp-${e.id}`);
    Array.from(list.children).forEach(child => {
      if (!currentExpIds.includes(child.id)) child.remove();
    });

    visibleExpeditions.forEach((exp, expIndex) => {
      let expCard = document.getElementById(`exp-${exp.id}`);
      const isPartial = true; // since we only show partials anyway

      if (!expCard) {
        expCard = document.createElement('div');
        expCard.id = `exp-${exp.id}`;
        expCard.className = 'expedition-card';
        expCard.innerHTML = `
          <div class="exp-details">
            <span class="exp-id">${exp.id}${exp.isADR ? ' <span class="adr-label">[ADR]</span>' : ''}</span>
            <span class="exp-route">${exp.origin} &rarr; ${exp.destination}</span>
          </div>
          <span class="exp-counter"></span>
        `;
      }

      if (list.children[expIndex] !== expCard) {
        list.insertBefore(expCard, list.children[expIndex] || null);
      }

      const targetCardClass = `expedition-card ${isPartial ? 'partial' : 'neutral'}`;
      if (expCard.className !== targetCardClass) {
        expCard.className = targetCardClass;
      }

      const counterEl = expCard.querySelector('.exp-counter');
      const counterText = `${exp.pendingParts}/${exp.totalParts} Partidas`;
      if (counterEl.textContent !== counterText) {
        counterEl.textContent = counterText;
      }
    });
  });
}

init();
