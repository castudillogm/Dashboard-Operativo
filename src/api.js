import { INITIAL_STATE, simulateScan } from './data.js';

// Central configuration
export const config = {
  useRealApi: localStorage.getItem('erp_use_real') === 'true',
  baseUrl: localStorage.getItem('erp_url') || 'http://192.168.1.100:8080/api/v1',
  refreshInterval: parseInt(localStorage.getItem('erp_interval')) || 3
};

let internalState = { ...INITIAL_STATE };

/**
 * Fetch the latest state from the ERP or simulation
 */
export async function fetchDashboardData() {
  if (config.useRealApi) {
    const response = await fetch(`${config.baseUrl}/warehouse/status`);
    if (!response.ok) throw new Error('ERP Connection Failed');
    return await response.json();
  } else {
    // Simulation mode
    return new Promise((resolve) => {
      setTimeout(() => {
        internalState = simulateScan(internalState);
        resolve({ ...internalState });
      }, 100);
    });
  }
}

/**
 * Optional: WebSocket listener for instant "Push" updates
 */
export function subscribeToUpdates(callback) {
  if (!USE_REAL_API) return;

  const socket = new WebSocket('ws://your-erp-server.com/ws');
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };

  socket.onclose = () => {
    console.warn('WebSocket closed. Reconnecting...');
    setTimeout(() => subscribeToUpdates(callback), 5000);
  };
}
