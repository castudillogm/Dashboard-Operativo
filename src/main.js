import { DESTINATIONS, getDestinationGroup } from './data.js';
import { fetchDashboardData, fetchDelegations, config } from './api.js';

let state = null;
let pollingInterval = null;

// Elements
const gridPending = document.getElementById('grid-pending');
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

  async function handlePinSubmit() {
    if (pinInput.value === config.pin) {
      pinModal.style.display = 'none';
      // Load form fields and open settings modal
      apiModeSelect.value = config.useRealApi ? 'real' : 'mock';
      apiUrlInput.value = config.baseUrl;
      apiIntervalInput.value = config.refreshInterval;
      settingsPinInput.value = '';
      apiUrlInput.parentElement.style.display = config.useRealApi ? 'flex' : 'none';
      
      // Load available delegations
      await loadDelegationsDropdown();
      
      settingsModal.style.display = 'flex';
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
    gridBaleares.innerHTML = '';
    gridCanarias.innerHTML = '';
    gridPeninsula.innerHTML = '';
    warehouseContainer.innerHTML = '';
    state = null;
  }

  // Data Fetch Loop
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
    }
  }

  function startPolling() {
    if (pollingInterval) clearInterval(pollingInterval);
    updateData();
    pollingInterval = setInterval(updateData, config.refreshInterval * 1000);
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
  [gridPending, gridBaleares, gridCanarias, gridPeninsula].forEach(grid => {
    Array.from(grid.children).forEach(child => {
      if (!currentDockIds.includes(child.id)) child.remove();
    });
  });

  state.docks.forEach(dock => {
    let card = document.getElementById(`dock-${dock.id}`);
    const isPending = !dock.destination || !dock.tripId;
    const maxWeight = isPending ? 0 : (dock.teus || 2) * (dock.targetWeightPerTeu || 10300);
    const percentage = maxWeight > 0 ? (dock.currentWeight / maxWeight) * 100 : 0;
    
    let statusClass = 'normal';
    if (isPending) statusClass = 'pending';
    else if (percentage >= 95) statusClass = 'critical';
    else if (percentage >= 85) statusClass = 'warning';

    const group = getDestinationGroup(dock.destination);
    const targetGrid = group === 'PENDING'
      ? gridPending
      : (group === 'BALEARES' 
        ? gridBaleares 
        : (group === 'CANARIAS' ? gridCanarias : gridPeninsula));

    if (!card) {
      card = document.createElement('div');
      card.id = `dock-${dock.id}`;
      card.className = `dock-card ${isPending ? 'pending' : ''} fade-in`;
      card.addEventListener('animationend', () => {
        card.classList.remove('fade-in');
      }, { once: true });
      card.innerHTML = `
        <div class="dock-header">
          <div class="dock-ids">
            <span class="container-id">${dock.containerId}</span>
            <span class="muelle-id">MUELLE: ${dock.id}</span>
          </div>
          <span class="destination-badge">${dock.destination || ''}</span>
        </div>
        <div class="weight-info">
          <span><span class="weight-current">0</span> kg <span class="occupancy-text" style="font-size: 0.7rem; color: var(--text-secondary); margin-left: 0.25rem;"></span></span>
          <span class="weight-max">OBJ: ${isPending ? '--' : maxWeight.toLocaleString()} kg (${dock.teus || 2} TEUS)</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar ${statusClass}" style="width: 0%"></div>
        </div>
      `;
      
      targetGrid.appendChild(card);
    } else {
      // If card exists, make sure it is in the correct parent grid
      if (card.parentElement !== targetGrid) {
        targetGrid.appendChild(card);
      }
    }

    // Target specific updates
    const containerIdEl = card.querySelector('.container-id');
    const destBadgeEl = card.querySelector('.destination-badge');
    const weightEl = card.querySelector('.weight-current');
    const maxWeightEl = card.querySelector('.weight-max');
    const barEl = card.querySelector('.progress-bar');
    const textEl = card.querySelector('.occupancy-text');

    if (containerIdEl.textContent !== dock.containerId) {
      containerIdEl.textContent = dock.containerId;
    }
    
    const expectedDest = dock.destination || '';
    if (destBadgeEl.textContent !== expectedDest) {
      destBadgeEl.textContent = expectedDest;
    }

    const expectedCardClass = isPending ? 'dock-card pending' : 'dock-card';
    if (card.className !== expectedCardClass && !card.classList.contains('fade-in')) {
      card.className = expectedCardClass;
    }

    const expectedWeight = dock.currentWeight.toLocaleString();
    if (weightEl.textContent !== expectedWeight) {
      weightEl.textContent = expectedWeight;
    }
    
    const expectedMaxText = `OBJ: ${isPending ? '--' : maxWeight.toLocaleString()} kg (${dock.teus || 2} TEUS)`;
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
  });

  // Toggle visibility of group sections based on grid contents
  const groupPending = document.getElementById('group-pending');
  const groupBaleares = document.getElementById('group-baleares');
  const groupCanarias = document.getElementById('group-canarias');
  const groupPeninsula = document.getElementById('group-peninsula');

  const showPending = gridPending.children.length ? 'flex' : 'none';
  if (groupPending.style.display !== showPending) groupPending.style.display = showPending;

  const showBaleares = gridBaleares.children.length ? 'flex' : 'none';
  if (groupBaleares.style.display !== showBaleares) groupBaleares.style.display = showBaleares;

  const showCanarias = gridCanarias.children.length ? 'flex' : 'none';
  if (groupCanarias.style.display !== showCanarias) groupCanarias.style.display = showCanarias;

  const showPeninsula = gridPeninsula.children.length ? 'flex' : 'none';
  if (groupPeninsula.style.display !== showPeninsula) groupPeninsula.style.display = showPeninsula;
}

function renderWarehouse() {
  // Find all destinations present in active (non-completed) expeditions
  const activeExpeditions = state.expeditions.filter(e => e.pendingParts > 0);
  
  // Sort destinations, placing current delegation (reparto) last, then alphabetical
  const destinations = [...new Set(activeExpeditions.map(e => e.destination))].sort((a, b) => {
    if (a === config.delegation) return 1;
    if (b === config.delegation) return -1;
    return a.localeCompare(b);
  });

  // Cleanup old columns that are no longer in the destinations list
  const activeColumnIds = destinations.map(dest => `col-${dest}`);
  Array.from(warehouseContainer.children).forEach(child => {
    if (!activeColumnIds.includes(child.id)) child.remove();
  });

  destinations.forEach((dest, index) => {
    let column = document.getElementById(`col-${dest}`);
    const destExpeditions = activeExpeditions.filter(e => e.destination === dest);
    const isReparto = dest === config.delegation;
    
    if (!column) {
      column = document.createElement('div');
      column.id = `col-${dest}`;
      column.className = `warehouse-column fade-in ${isReparto ? 'reparto-column' : ''}`;
      column.addEventListener('animationend', () => {
        column.classList.remove('fade-in');
      }, { once: true });
      column.innerHTML = `
        <div class="column-header">
          <span class="column-dest">${isReparto ? `REPARTO ${dest}` : dest}</span>
          <div class="column-stats">
            <span class="stat-badge count">0 EXP</span>
            <span class="stat-badge weight">0 kg</span>
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

    const countBadge = column.querySelector('.stat-badge.count');
    const weightBadge = column.querySelector('.stat-badge.weight');

    const countText = `${totalExpCount} EXP`;
    if (countBadge.textContent !== countText) {
      countBadge.textContent = countText;
    }

    const weightText = `${totalExpWeight.toLocaleString()} kg`;
    if (weightBadge.textContent !== weightText) {
      weightBadge.textContent = weightText;
    }

    const list = column.querySelector('.expedition-list');
    
    // Cleanup cards in list no longer present in destExpeditions
    const currentExpIds = destExpeditions.map(e => `exp-${e.id}`);
    Array.from(list.children).forEach(child => {
      if (!currentExpIds.includes(child.id)) child.remove();
    });

    destExpeditions.forEach((exp, expIndex) => {
      let expCard = document.getElementById(`exp-${exp.id}`);
      const isPartial = exp.pendingParts < exp.totalParts;
      
      if (!expCard) {
        expCard = document.createElement('div');
        expCard.id = `exp-${exp.id}`;
        expCard.className = 'expedition-card';
        expCard.innerHTML = `
          <div class="exp-details">
            <span class="exp-id">${exp.id}</span>
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
