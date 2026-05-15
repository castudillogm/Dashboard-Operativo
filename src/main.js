import { DESTINATIONS } from './data.js';
import { fetchDashboardData, config } from './api.js';

let state = null;
let pollingInterval = null;

// Elements
const gridBaleares = document.getElementById('grid-baleares');
const gridCanarias = document.getElementById('grid-canarias');
const warehouseContainer = document.getElementById('section-warehouse');
const clockElement = document.getElementById('clock');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('theme-icon-sun');
const moonIcon = document.getElementById('theme-icon-moon');
const statusIndicator = document.getElementById('connection-status');
const statusText = statusIndicator.querySelector('.status-text');

// Modal Elements
const settingsModal = document.getElementById('settings-modal');
const closeModal = document.getElementById('close-modal');
const saveSettings = document.getElementById('save-settings');
const apiModeSelect = document.getElementById('api-mode');
const apiUrlInput = document.getElementById('api-url');
const apiIntervalInput = document.getElementById('api-interval');

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

  // Settings Modal Logic
  statusIndicator.addEventListener('click', () => {
    apiModeSelect.value = config.useRealApi ? 'real' : 'mock';
    apiUrlInput.value = config.baseUrl;
    apiIntervalInput.value = config.refreshInterval;
    apiUrlInput.parentElement.style.display = config.useRealApi ? 'flex' : 'none';
    settingsModal.style.display = 'flex';
  });

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

    localStorage.setItem('erp_use_real', useReal);
    localStorage.setItem('erp_url', url);
    localStorage.setItem('erp_interval', interval);

    // Update live config
    config.useRealApi = useReal;
    config.baseUrl = url;
    config.refreshInterval = interval;

    settingsModal.style.display = 'none';
    
    // Restart polling with new interval
    startPolling();
  });

  // Data Fetch Loop
  async function updateData() {
    try {
      const newData = await fetchDashboardData();
      if (newData) {
        state = newData;
        statusIndicator.classList.remove('offline');
        statusText.textContent = config.useRealApi ? 'ERP ONLINE' : 'SIMULACIÓN';
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
  renderDocks();
  renderWarehouse();
}

function renderDocks() {
  state.docks.forEach(dock => {
    let card = document.getElementById(`dock-${dock.id}`);
    const percentage = (dock.currentWeight / dock.maxWeight) * 100;
    
    let statusClass = 'normal';
    if (percentage >= 95) statusClass = 'critical';
    else if (percentage >= 85) statusClass = 'warning';

    if (!card) {
      card = document.createElement('div');
      card.id = `dock-${dock.id}`;
      card.className = 'dock-card fade-in';
      card.innerHTML = `
        <div class="dock-header">
          <div class="dock-ids">
            <span class="container-id">${dock.containerId}</span>
            <span class="muelle-id">MUELLE: ${dock.id}</span>
          </div>
          <span class="destination-badge">${dock.destination}</span>
        </div>
        <div class="weight-info">
          <span><span class="weight-current">0</span> kg</span>
          <span class="weight-max">OBJ: ${dock.maxWeight.toLocaleString()} kg</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar ${statusClass}" style="width: 0%"></div>
        </div>
        <div class="occupancy-text" style="font-size: 0.75rem; text-align: right; color: var(--text-secondary);">
          0% OCUPACIÓN
        </div>
      `;
      const targetGrid = dock.group === 'BALEARES' ? gridBaleares : gridCanarias;
      targetGrid.appendChild(card);
    }

    // Target specific updates
    const weightEl = card.querySelector('.weight-current');
    const barEl = card.querySelector('.progress-bar');
    const textEl = card.querySelector('.occupancy-text');

    weightEl.textContent = dock.currentWeight.toLocaleString();
    barEl.style.width = `${Math.min(percentage, 100)}%`;
    barEl.className = `progress-bar ${statusClass}`;
    textEl.textContent = `${percentage.toFixed(1)}% OCUPACIÓN`;
  });

  document.getElementById('group-baleares').style.display = gridBaleares.children.length ? 'flex' : 'none';
  document.getElementById('group-canarias').style.display = gridCanarias.children.length ? 'flex' : 'none';
}

function renderWarehouse() {
  const delegations = [...new Set(state.expeditions.map(e => e.destination))].sort();

  delegations.forEach(dest => {
    let column = document.getElementById(`col-${dest}`);
    const destExpeditions = state.expeditions.filter(e => e.destination === dest && e.pendingParts > 0);
    
    if (destExpeditions.length === 0) {
      if (column) column.remove();
      return;
    }

    if (!column) {
      column = document.createElement('div');
      column.id = `col-${dest}`;
      column.className = 'warehouse-column fade-in';
      column.innerHTML = `
        <div class="column-header">
          <span class="column-dest">${dest}</span>
          <div class="column-stats">
            <span class="stat-badge count">0 EXP</span>
            <span class="stat-badge weight">0 kg</span>
          </div>
        </div>
        <div class="expedition-list"></div>
      `;
      warehouseContainer.appendChild(column);
    }

    const totalExpCount = destExpeditions.length;
    const totalExpWeight = destExpeditions.reduce((sum, e) => sum + e.totalWeight, 0);

    column.querySelector('.stat-badge.count').textContent = `${totalExpCount} EXP`;
    column.querySelector('.stat-badge.weight').textContent = `${totalExpWeight.toLocaleString()} kg`;

    const list = column.querySelector('.expedition-list');
    
    destExpeditions.forEach(exp => {
      let expCard = document.getElementById(`exp-${exp.id}`);
      const isPartial = exp.pendingParts < exp.totalParts;
      
      if (!expCard) {
        expCard = document.createElement('div');
        expCard.id = `exp-${exp.id}`;
        expCard.className = 'expedition-card';
        expCard.innerHTML = `<span class="exp-id">${exp.id}</span><span class="exp-counter"></span>`;
        list.appendChild(expCard);
      }

      expCard.className = `expedition-card ${isPartial ? 'partial' : 'neutral'}`;
      expCard.querySelector('.exp-counter').textContent = `${exp.pendingParts}/${exp.totalParts} Partidas`;
    });

    const currentExpIds = destExpeditions.map(e => `exp-${e.id}`);
    Array.from(list.children).forEach(child => {
      if (!currentExpIds.includes(child.id)) child.remove();
    });
  });
}

init();
