// Mock Data for the Logistics Dashboard

export const DESTINATIONS = {
  BALEARES: ['IBZ', 'MAH', 'PMI', 'FOR'],
  CANARIAS: ['ACE', 'FUE', 'LPA', 'SCT', 'SSG', 'HIE', 'SPC']
};

export const INITIAL_STATE = {
  docks: [
    { 
      id: 'M01', 
      containerId: 'CONT-4412', 
      destination: 'PMI', 
      currentWeight: 1250, 
      maxWeight: 15000,
      group: 'BALEARES'
    },
    { 
      id: 'M05', 
      containerId: 'CONT-8890', 
      destination: 'LPA', 
      currentWeight: 8400, 
      maxWeight: 12000,
      group: 'CANARIAS'
    },
    { 
      id: 'M09', 
      containerId: 'CONT-1234', 
      destination: 'IBZ', 
      currentWeight: 200, 
      maxWeight: 10000,
      group: 'BALEARES'
    }
  ],
  expeditions: [
    { id: 'EBCN001', destination: 'PMI', pendingParts: 12, totalParts: 12, totalWeight: 1450 },
    { id: 'EBCN002', destination: 'PMI', pendingParts: 5, totalParts: 8, totalWeight: 920 },
    { id: 'EBCN003', destination: 'IBZ', pendingParts: 20, totalParts: 20, totalWeight: 3100 },
    { id: 'EBCN004', destination: 'LPA', pendingParts: 15, totalParts: 30, totalWeight: 5400 },
    { id: 'EBCN005', destination: 'LPA', pendingParts: 50, totalParts: 50, totalWeight: 12000 },
    { id: 'EBCN006', destination: 'MAH', pendingParts: 8, totalParts: 8, totalWeight: 850 },
    { id: 'EBCN007', destination: 'SCT', pendingParts: 10, totalParts: 10, totalWeight: 1100 },
  ]
};

// Simulation helper: Simulates a scan event
export function simulateScan(state) {
  // Find a partial expedition or any random expedition
  const partials = state.expeditions.filter(e => e.pendingParts > 0);
  if (partials.length === 0) return state;

  const exp = partials[Math.floor(Math.random() * partials.length)];
  
  // Find a dock for that destination
  const dock = state.docks.find(d => d.destination === exp.destination);
  
  if (dock) {
    // Perform "Loading" event
    exp.pendingParts--;
    dock.currentWeight += Math.floor(Math.random() * 200) + 50; // Random weight per item
  }

  return { ...state };
}
