import { DELEGATIONS, getMockState, simulateScan } from './data.js';

// Central configuration
export const config = {
  useRealApi: localStorage.getItem('erp_use_real') === 'true',
  baseUrl: localStorage.getItem('erp_url') || 'http://192.168.1.100:8080/api/v1',
  refreshInterval: parseInt(localStorage.getItem('erp_interval')) || 3,
  delegation: localStorage.getItem('erp_delegation') || 'BCN',
  pin: localStorage.getItem('erp_pin') || '2026'
};

// Internal states cache for simulation mode
const statesCache = {};

/**
 * Fetch the latest state from the ERP or simulation for a specific delegation
 */
export async function fetchDashboardData() {
  if (config.useRealApi) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(`${config.baseUrl}/warehouse/status?delegation=${config.delegation}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('ERP Connection Failed');
      return await response.json();
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  } else {
    // Simulation mode
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!statesCache[config.delegation]) {
          statesCache[config.delegation] = JSON.parse(JSON.stringify(getMockState(config.delegation)));
        }
        statesCache[config.delegation] = simulateScan(statesCache[config.delegation], config.delegation);
        resolve(JSON.parse(JSON.stringify(statesCache[config.delegation])));
      }, 100);
    });
  }
}

/**
 * Fetch available delegations/zones
 */
export async function fetchDelegations() {
  if (config.useRealApi) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${config.baseUrl}/logistics/zones`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Could not fetch real zones, falling back to mock list');
    }
  }
  
  // Simulation or fallback mode
  return new Promise((resolve) => {
    resolve(DELEGATIONS);
  });
}

/**
 * Optional: WebSocket listener for instant "Push" updates
 */
export function subscribeToUpdates(callback) {
  if (!config.useRealApi) return;

  const socket = new WebSocket(`ws://your-erp-server.com/ws?delegation=${config.delegation}`);
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };

  socket.onclose = () => {
    console.warn('WebSocket closed. Reconnecting...');
    setTimeout(() => subscribeToUpdates(callback), 5000);
  };
}

