import { DESTINATIONS, getDestinationGroup } from './data.js';
import { fetchDashboardData, fetchDelegations, config } from './api.js';

let state = null;
let pollingInterval = null;
const canariasDispatchedOnly = {};
let filterOccupiedOnly = false;

// Elements
const sectionDocks = document.getElementById('section-docks');
const warehouseContainer = document.getElementById('section-warehouse');
const clockElement = document.getElementById('clock');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('theme-icon-sun');
const moonIcon = document.getElementById('theme-icon-moon');
const statusIndicator = document.getElementById('connection-status');
const statusText = statusIndicator.querySelector('.status-text');
const btnFilterOccupied = document.getElementById('btn-filter-occupied');

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

  // Filter Occupied Docks Toggle
  if (btnFilterOccupied) {
    btnFilterOccupied.addEventListener('click', () => {
      filterOccupiedOnly = !filterOccupiedOnly;
      btnFilterOccupied.classList.toggle('active', filterOccupiedOnly);
      if (sectionDocks) sectionDocks.innerHTML = '';
      renderDocks();
    });
  }

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
      submitPin.innerHTML = '<span class="spinner"></span> Conectando...';
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
    if (sectionDocks) sectionDocks.innerHTML = '';
    if (warehouseContainer) warehouseContainer.innerHTML = '';
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
  if (!sectionDocks || !state || !state.docks) return;

  // Ordenados en secuencia continua (M01, M02, M03, M04...)
  const allDocks = [...state.docks].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  // Muelles con estancia física aperturada y contenedor presente
  const occupiedDocks = allDocks.filter(dock => {
    if (dock.hasStay === false) return false;
    if (!dock.containerId || dock.containerId.trim() === '') return false;
    return true;
  });

  // Actualizar contador en la barra de control de muelles
  const counterBadge = document.getElementById('docks-counter-badge');
  if (counterBadge) {
    counterBadge.textContent = filterOccupiedOnly
      ? `${occupiedDocks.length} Ocupados`
      : `${occupiedDocks.length} / ${allDocks.length} Ocupados`;
  }

  // Lista según el filtro de "Ocupados"
  const displayedDocks = filterOccupiedOnly ? occupiedDocks : allDocks;
  const displayedDockIds = displayedDocks.map(dock => `dock-${dock.id}`);

  // Limpiar muelles que no correspondan a la vista actual
  Array.from(sectionDocks.children).forEach(child => {
    if (!displayedDockIds.includes(child.id)) child.remove();
  });

  displayedDocks.forEach((dock, index) => {
    let card = document.getElementById(`dock-${dock.id}`);
    const isOccupied = Boolean(dock.hasStay !== false && dock.containerId && dock.containerId.trim() !== '');
    const isClosed = dock.status === 'closed' || dock.tripStatus === 'closed';

    let expectedType = 'empty';
    if (isOccupied) {
      const hasTrip = Boolean((dock.destination && dock.destination.trim() !== '') || (dock.tripId && dock.tripId.trim() !== ''));
      if (hasTrip) {
        const isImport = dock.destination === config.delegation || !!dock.isImport || dock.type === 'unload';
        expectedType = isImport ? 'unload' : 'load';
      } else {
        expectedType = 'pending';
      }
    } else {
      expectedType = 'empty';
    }

    // Chofer interno (Matrícula) vs Transportista externo (Chófer / Transportista) - Sin colores de pill ni iconos
    const isInternal = dock.driverType === 'internal' || (dock.vehiclePlate && !dock.carrierName);
    const driverText = isInternal
      ? `MATRÍCULA: ${dock.vehiclePlate || dock.matricula || dock.tractora || '---'}`
      : `TRANSP.: ${dock.carrierName || dock.transportista || dock.chofer || '---'}`;
    const operatorText = dock.operator ? `OPERADOR: ${dock.operator}` : '';

    const hasRequiredStructure = card &&
      ((expectedType === 'load' && card.querySelector('.dock-driver') && card.querySelector('.dock-operator')) ||
       (expectedType === 'unload' && card.querySelector('.dock-driver') && card.querySelector('.dock-operator') && card.querySelector('.import-expeditions-list')) ||
       (expectedType === 'empty' && card.querySelector('.dock-empty-tag')) ||
       (expectedType === 'pending' && card.querySelector('.container-id')));

    if (!card || card.dataset.type !== expectedType || card.dataset.closed !== String(isClosed) || !hasRequiredStructure) {
      if (!card) {
        card = document.createElement('div');
        card.id = `dock-${dock.id}`;
      }
      card.dataset.type = expectedType;
      card.dataset.closed = String(isClosed);
      card.className = `dock-card ${expectedType} ${isClosed ? 'closed' : ''} fade-in`;
      card.addEventListener('animationend', () => {
        card.classList.remove('fade-in');
      }, { once: true });

      if (expectedType === 'empty') {
        // Muelle Libre / Disponible sin estancia
        card.innerHTML = `
          <div class="dock-header">
            <div class="dock-ids">
              <span class="muelle-id">${dock.id}</span>
            </div>
            <span class="dock-empty-tag">DISPONIBLE</span>
          </div>
          <div class="dock-empty-body">
            <span class="dock-empty-indicator"></span>
            <span class="dock-empty-label">Sin estancia</span>
          </div>
        `;
      } else if (expectedType === 'load') {
        const maxVol = dock.equipmentVolume || (dock.teus === 1 ? 38.0 : 76.0);
        const currentVol = dock.currentVolume != null ? dock.currentVolume : 0;
        const volPct = maxVol > 0 ? (currentVol / maxVol) * 100 : 0;

        const maxML = dock.longitudInterior != null ? dock.longitudInterior : (dock.equipmentLength || (dock.teus === 1 ? 6.0 : 13.6));
        const currentML = dock.currentLinealMeters != null ? dock.currentLinealMeters : 0;
        const mlPct = maxML > 0 ? (currentML / maxML) * 100 : 0;

        const targetWeightVal = (dock.targetWeightPerTeu !== undefined && dock.targetWeightPerTeu !== null && dock.targetWeightPerTeu > 0) ? dock.targetWeightPerTeu : 10300;
        const maxWeight = (dock.teus || 2) * targetWeightVal;
        const weightPct = maxWeight > 0 ? (dock.currentWeight / maxWeight) * 100 : 0;

        card.innerHTML = `
          <div class="dock-header">
            <div class="dock-ids">
              <span class="muelle-id">${dock.id}</span>
              <span class="container-id">${dock.containerId}</span>
            </div>
            <span class="destination-badge">${dock.destination || ''}</span>
          </div>
          <div class="dock-driver">${driverText}</div>
          <div class="dock-operator">${operatorText}</div>
          <div class="dock-metrics">
            <div class="dock-metric-row">
              <span class="metric-label">VOLUMEN: <span class="vol-pct">(${volPct.toFixed(1)}%)</span></span>
              <span class="metric-value"><strong class="vol-current">${currentVol.toFixed(1)}</strong> m³</span>
            </div>
            <div class="dock-metric-row">
              <span class="metric-label">OCUPACIÓN: <span class="ml-pct">(${mlPct.toFixed(1)}%)</span></span>
              <span class="metric-value"><strong class="ml-current">${currentML.toFixed(2)}</strong> m lin.</span>
            </div>
            <div class="dock-metric-row">
              <span class="metric-label">KILOS: <span class="kg-pct">(${weightPct.toFixed(1)}%)</span></span>
              <span class="metric-value"><strong class="kg-current">${dock.currentWeight.toLocaleString()}</strong> kg</span>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar load-bar" style="width: ${Math.min(volPct, 100)}%"></div>
          </div>
          ${isClosed ? '<div class="closed-banner">VIAJE CERRADO</div>' : ''}
        `;
      } else if (expectedType === 'unload') {
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

        card.innerHTML = `
          <div class="dock-header">
            <div class="dock-ids">
              <span class="muelle-id">${dock.id}</span>
              <span class="container-id">${dock.containerId}</span>
            </div>
          </div>
          <div class="dock-driver">${driverText}</div>
          <div class="dock-operator">${operatorText}</div>
          <div class="import-expeditions-list">${expsHtml}</div>
          <div class="weight-info import-parts-info">
            <span class="import-parts-text">PENDIENTE: <span class="import-pending-parts">${pendingImportParts}</span> / <span class="import-total-parts">${totalImportParts}</span> P. <span class="import-unloaded-percentage">(${importPercentage.toFixed(1)}%)</span></span>
          </div>
          <div class="progress-container">
            <div class="progress-bar import-bar ${isClosed ? 'closed' : ''}" style="width: ${Math.min(importPercentage, 100)}%"></div>
          </div>
          ${isClosed ? '<div class="closed-banner">DESCARGA FINALIZADA</div>' : ''}
        `;
      } else {
        // Pending: Estancia aperturada sin viaje asignado (solo Muelle y Contenedor, fondo gris)
        card.innerHTML = `
          <div class="dock-header">
            <div class="dock-ids">
              <span class="muelle-id">${dock.id}</span>
              <span class="container-id">${dock.containerId}</span>
            </div>
          </div>
        `;
      }

      sectionDocks.appendChild(card);
    }

    // Mantener orden en secuencia en el DOM
    if (sectionDocks.children[index] !== card) {
      sectionDocks.insertBefore(card, sectionDocks.children[index] || null);
    }

    // Actualizaciones de contenido reactivo
    if (expectedType === 'empty') {
      const muelleIdEl = card.querySelector('.muelle-id');
      if (muelleIdEl && muelleIdEl.textContent !== dock.id) {
        muelleIdEl.textContent = dock.id;
      }
    } else if (expectedType === 'load') {
      const containerIdEl = card.querySelector('.container-id');
      const muelleIdEl = card.querySelector('.muelle-id');
      const destBadgeEl = card.querySelector('.destination-badge');
      const volCurrentEl = card.querySelector('.vol-current');
      const volPctEl = card.querySelector('.vol-pct');
      const mlCurrentEl = card.querySelector('.ml-current');
      const kgCurrentEl = card.querySelector('.kg-current');
      const kgPctEl = card.querySelector('.kg-pct');
      const barEl = card.querySelector('.progress-bar');
      const driverEl = card.querySelector('.dock-driver');
      const operatorEl = card.querySelector('.dock-operator');

      if (containerIdEl && containerIdEl.textContent !== dock.containerId) {
        containerIdEl.textContent = dock.containerId;
      }
      if (muelleIdEl && muelleIdEl.textContent !== dock.id) {
        muelleIdEl.textContent = dock.id;
      }
      if (destBadgeEl && destBadgeEl.textContent !== (dock.destination || '')) {
        destBadgeEl.textContent = dock.destination || '';
      }
      if (driverEl && driverEl.textContent !== driverText) {
        driverEl.textContent = driverText;
      }
      if (operatorEl && operatorEl.textContent !== operatorText) {
        operatorEl.textContent = operatorText;
      }

      const maxVol = dock.equipmentVolume || (dock.teus === 1 ? 38.0 : 76.0);
      const currentVol = dock.currentVolume != null ? dock.currentVolume : 0;
      const volPct = maxVol > 0 ? (currentVol / maxVol) * 100 : 0;

      const maxML = dock.longitudInterior != null ? dock.longitudInterior : (dock.equipmentLength || (dock.teus === 1 ? 6.0 : 13.6));
      const currentML = dock.currentLinealMeters != null ? dock.currentLinealMeters : 0;
      const mlPct = maxML > 0 ? (currentML / maxML) * 100 : 0;

      const targetWeightVal = (dock.targetWeightPerTeu !== undefined && dock.targetWeightPerTeu !== null && dock.targetWeightPerTeu > 0) ? dock.targetWeightPerTeu : 10300;
      const maxWeight = (dock.teus || 2) * targetWeightVal;
      const weightPct = maxWeight > 0 ? (dock.currentWeight / maxWeight) * 100 : 0;

      if (volCurrentEl && volCurrentEl.textContent !== currentVol.toFixed(1)) {
        volCurrentEl.textContent = currentVol.toFixed(1);
      }
      if (volPctEl && volPctEl.textContent !== `(${volPct.toFixed(1)}%)`) {
        volPctEl.textContent = `(${volPct.toFixed(1)}%)`;
      }
      const mlPctEl = card.querySelector('.ml-pct');
      if (mlPctEl && mlPctEl.textContent !== `(${mlPct.toFixed(1)}%)`) {
        mlPctEl.textContent = `(${mlPct.toFixed(1)}%)`;
      }
      if (mlCurrentEl && mlCurrentEl.textContent !== currentML.toFixed(2)) {
        mlCurrentEl.textContent = currentML.toFixed(2);
      }
      if (kgCurrentEl && kgCurrentEl.textContent !== dock.currentWeight.toLocaleString()) {
        kgCurrentEl.textContent = dock.currentWeight.toLocaleString();
      }
      if (kgPctEl && kgPctEl.textContent !== `(${weightPct.toFixed(1)}%)`) {
        kgPctEl.textContent = `(${weightPct.toFixed(1)}%)`;
      }
      if (barEl) {
        barEl.style.width = `${Math.min(volPct, 100)}%`;
      }
    } else if (expectedType === 'unload') {
      // Unload / Descarga
      const containerIdEl = card.querySelector('.container-id');
      const muelleIdEl = card.querySelector('.muelle-id');
      const listEl = card.querySelector('.import-expeditions-list');
      const pendingEl = card.querySelector('.import-pending-parts');
      const totalEl = card.querySelector('.import-total-parts');
      const pctEl = card.querySelector('.import-unloaded-percentage');
      const barEl = card.querySelector('.import-bar');
      const driverEl = card.querySelector('.dock-driver');
      const operatorEl = card.querySelector('.dock-operator');

      if (containerIdEl && containerIdEl.textContent !== dock.containerId) {
        containerIdEl.textContent = dock.containerId;
      }
      if (muelleIdEl && muelleIdEl.textContent !== dock.id) {
        muelleIdEl.textContent = dock.id;
      }
      if (driverEl && driverEl.textContent !== driverText) {
        driverEl.textContent = driverText;
      }
      if (operatorEl && operatorEl.textContent !== operatorText) {
        operatorEl.textContent = operatorText;
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

      if (listEl && listEl.innerHTML !== expsHtml) {
        listEl.innerHTML = expsHtml;
      }
      if (pendingEl && pendingEl.textContent !== String(pendingImportParts)) {
        pendingEl.textContent = String(pendingImportParts);
      }
      if (totalEl && totalEl.textContent !== String(totalImportParts)) {
        totalEl.textContent = String(totalImportParts);
      }
      if (pctEl && pctEl.textContent !== `(${importPercentage.toFixed(1)}%)`) {
        pctEl.textContent = `(${importPercentage.toFixed(1)}%)`;
      }
      if (barEl) {
        barEl.style.width = `${Math.min(importPercentage, 100)}%`;
      }
    } else {
      // Pending: Estancia sin viaje
      const containerIdEl = card.querySelector('.container-id');
      const muelleIdEl = card.querySelector('.muelle-id');
      if (containerIdEl && containerIdEl.textContent !== dock.containerId) {
        containerIdEl.textContent = dock.containerId;
      }
      if (muelleIdEl && muelleIdEl.textContent !== dock.id) {
        muelleIdEl.textContent = dock.id;
      }
    }
  });
}

function renderWarehouse() {
  const activeExpeditions = state.expeditions.filter(e => e.pendingParts > 0 && e.destination !== config.delegation);
  const destinations = [...new Set(activeExpeditions.map(e => e.destination))].sort((a, b) => a.localeCompare(b));

  const activeColumnIds = destinations.map(dest => `col-${dest}`);
  Array.from(warehouseContainer.children).forEach(child => {
    if (!activeColumnIds.includes(child.id)) child.remove();
  });

  destinations.forEach((dest, index) => {
    let column = document.getElementById(`col-${dest}`);
    const group = getDestinationGroup(dest);
    const isCanarias = group === 'CANARIAS';
    const isFilteredDispatched = isCanarias && canariasDispatchedOnly[dest] === true;

    // Canarias: total expediciones disponible con check para filtrar solo despachadas
    const rawDestExpeditions = activeExpeditions.filter(e => e.destination === dest);
    const destExpeditions = isFilteredDispatched
      ? rawDestExpeditions.filter(e => e.isDispatched === true || e.despachada === true)
      : rawDestExpeditions;

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
            ${isCanarias ? `
              <label class="canarias-dua-label" title="Filtro DUA">
                <input type="checkbox" id="cb-canarias-${dest}" class="canarias-cb" data-dest="${dest}" ${isFilteredDispatched ? 'checked' : ''}>
                <span class="dua-text">DUA</span>
              </label>
            ` : ''}
          </div>
          <div class="column-stats-container">
            <div class="column-stats main-stats">
              <span class="stat-badge count" title="Total Expediciones">0 EXP</span>
              <span class="stat-badge weight" title="Total Kilos">0 kg</span>
              <span class="stat-badge pallets" title="Total Palets">0 PAL</span>
              <span class="stat-badge packages" title="Total Bultos">0 BLT</span>
            </div>
            <div class="column-stats adr-stats">
              <span class="stat-badge adr-count adr-badge">ADR: 0 EXP</span>
              <span class="stat-badge adr-weight adr-badge">0 kg</span>
            </div>
          </div>
        </div>
        <div class="expedition-list"></div>
      `;

      if (isCanarias) {
        const cb = column.querySelector(`.canarias-cb[data-dest="${dest}"]`);
        if (cb) {
          cb.addEventListener('change', (e) => {
            canariasDispatchedOnly[dest] = e.target.checked;
            renderWarehouse();
          });
        }
      }
    } else {
      // Si ya existe la columna, verificar si el checkbox de Canarias está al lado del nombre de destino
      const destWrapper = column.querySelector('.column-dest-wrapper');
      if (isCanarias && destWrapper) {
        let duaLabel = destWrapper.querySelector('.canarias-dua-label');
        if (!duaLabel) {
          duaLabel = document.createElement('label');
          duaLabel.className = 'canarias-dua-label';
          duaLabel.title = 'Filtro DUA';
          duaLabel.innerHTML = `
            <input type="checkbox" id="cb-canarias-${dest}" class="canarias-cb" data-dest="${dest}" ${isFilteredDispatched ? 'checked' : ''}>
            <span class="dua-text">DUA</span>
          `;
          destWrapper.appendChild(duaLabel);
          const cb = duaLabel.querySelector('.canarias-cb');
          cb.addEventListener('change', (e) => {
            canariasDispatchedOnly[dest] = e.target.checked;
            renderWarehouse();
          });
        } else {
          const cb = duaLabel.querySelector('.canarias-cb');
          if (cb && cb.checked !== isFilteredDispatched) {
            cb.checked = isFilteredDispatched;
          }
        }

        // Eliminar caja antigua si existiese
        const oldFilterBox = column.querySelector('.canarias-filter-box');
        if (oldFilterBox) oldFilterBox.remove();
      }

      // Quitar footer de antiguas si existiese de versiones previas
      const oldAncientFooter = column.querySelector('.ancient-footer');
      if (oldAncientFooter) oldAncientFooter.remove();
    }

    if (warehouseContainer.children[index] !== column) {
      warehouseContainer.insertBefore(column, warehouseContainer.children[index] || null);
    }

    const totalExpCount = destExpeditions.length;
    const totalExpWeight = destExpeditions.reduce((sum, e) => sum + (e.totalWeight || 0), 0);
    const totalPallets = destExpeditions.reduce((sum, e) => sum + (e.pallets || e.palets || 0), 0);
    const totalPackages = destExpeditions.reduce((sum, e) => sum + (e.packages || e.bultos || 0), 0);

    const adrExpeditions = destExpeditions.filter(e => e.isADR);
    const totalAdrCount = adrExpeditions.length;
    const totalAdrWeight = adrExpeditions.reduce((sum, e) => sum + (e.totalWeight || 0), 0);

    const countBadge = column.querySelector('.stat-badge.count');
    const weightBadge = column.querySelector('.stat-badge.weight');
    const palletsBadge = column.querySelector('.stat-badge.pallets');
    const packagesBadge = column.querySelector('.stat-badge.packages');
    const adrCountBadge = column.querySelector('.stat-badge.adr-count');
    const adrWeightBadge = column.querySelector('.stat-badge.adr-weight');

    // Muestra solo la cantidad actual (ej. 2 EXP o 3 EXP, nunca 2/3)
    const countText = `${totalExpCount} EXP`;

    if (countBadge && countBadge.textContent !== countText) {
      countBadge.textContent = countText;
    }
    if (weightBadge) {
      const weightText = `${totalExpWeight.toLocaleString()} kg`;
      if (weightBadge.textContent !== weightText) weightBadge.textContent = weightText;
    }
    if (palletsBadge) {
      const palText = `${totalPallets} PAL`;
      if (palletsBadge.textContent !== palText) palletsBadge.textContent = palText;
    }
    if (packagesBadge) {
      const bultText = `${totalPackages} BLT`;
      if (packagesBadge.textContent !== bultText) packagesBadge.textContent = bultText;
    }
    if (adrCountBadge) {
      const adrCountText = `ADR: ${totalAdrCount} EXP`;
      if (adrCountBadge.textContent !== adrCountText) adrCountBadge.textContent = adrCountText;
    }
    if (adrWeightBadge) {
      const adrWeightText = `${totalAdrWeight.toLocaleString()} kg`;
      if (adrWeightBadge.textContent !== adrWeightText) adrWeightBadge.textContent = adrWeightText;
    }

    const list = column.querySelector('.expedition-list');
    const visibleExpeditions = destExpeditions.filter(e => e.pendingParts < e.totalParts);
    const currentExpIds = visibleExpeditions.map(e => `exp-${e.id}`);
    Array.from(list.children).forEach(child => {
      if (!currentExpIds.includes(child.id)) child.remove();
    });

    visibleExpeditions.forEach((exp, expIndex) => {
      let expCard = document.getElementById(`exp-${exp.id}`);
      if (!expCard) {
        expCard = document.createElement('div');
        expCard.id = `exp-${exp.id}`;
        expCard.className = 'expedition-card partial';
        expCard.innerHTML = `
          <div class="exp-details">
            <span class="exp-id">${exp.id}${exp.isADR ? ' <span class="adr-label">[ADR]</span>' : ''}</span>
            <span class="exp-route">${exp.origin} &rarr; ${exp.destination}</span>
          </div>
          <span class="exp-counter">${exp.pendingParts}/${exp.totalParts} Partidas</span>
        `;
      } else {
        const detailsEl = expCard.querySelector('.exp-details');
        const expectedHtml = `
          <span class="exp-id">${exp.id}${exp.isADR ? ' <span class="adr-label">[ADR]</span>' : ''}</span>
          <span class="exp-route">${exp.origin} &rarr; ${exp.destination}</span>
        `;
        if (detailsEl.innerHTML.trim() !== expectedHtml.trim()) {
          detailsEl.innerHTML = expectedHtml;
        }
      }

      if (list.children[expIndex] !== expCard) {
        list.insertBefore(expCard, list.children[expIndex] || null);
      }

      const counterEl = expCard.querySelector('.exp-counter');
      const counterText = `${exp.pendingParts}/${exp.totalParts} Partidas`;
      if (counterEl && counterEl.textContent !== counterText) {
        counterEl.textContent = counterText;
      }
    });
  });
}

init();
