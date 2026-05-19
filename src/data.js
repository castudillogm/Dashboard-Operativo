// Mock Data for the Logistics Dashboard supporting multiple delegations

export const DESTINATIONS = {
  BALEARES: ['IBZ', 'MAH', 'PMI', 'FOR'],
  CANARIAS: ['ACE', 'FUE', 'LPA', 'SCT', 'SSG', 'HIE', 'SPC'],
  PENINSULA: ['BCN', 'MAD', 'SVQ', 'ALC', 'BIO', 'VGO', 'VLC']
};

export const DELEGATIONS = [
  { code: 'BCN', name: 'Barcelona', group: 'PENINSULA' },
  { code: 'MAD', name: 'Madrid', group: 'PENINSULA' },
  { code: 'SVQ', name: 'Sevilla', group: 'PENINSULA' },
  { code: 'ALC', name: 'Alicante', group: 'PENINSULA' },
  { code: 'BIO', name: 'Bilbao', group: 'PENINSULA' },
  { code: 'VGO', name: 'Vigo', group: 'PENINSULA' },
  { code: 'VLC', name: 'Valencia', group: 'PENINSULA' },
  { code: 'PMI', name: 'Palma de Mallorca', group: 'BALEARES' },
  { code: 'IBZ', name: 'Ibiza', group: 'BALEARES' },
  { code: 'MAH', name: 'Mahón', group: 'BALEARES' },
  { code: 'LPA', name: 'Las Palmas', group: 'CANARIAS' },
  { code: 'SCT', name: 'Santa Cruz de Tenerife', group: 'CANARIAS' }
];

// Helper to determine the group of a destination code
export function getDestinationGroup(code) {
  if (DESTINATIONS.BALEARES.includes(code)) return 'BALEARES';
  if (DESTINATIONS.CANARIAS.includes(code)) return 'CANARIAS';
  if (DESTINATIONS.PENINSULA.includes(code)) return 'PENINSULA';
  return 'PENINSULA'; // Default fallback
}

// Initial mock states per delegation
const mockStates = {
  BCN: {
    docks: [
      { id: 'M01', containerId: 'CONT-4412', destination: 'PMI', currentWeight: 1250, teus: 2, targetWeightPerTeu: 10300, tripId: 'VBCN00001' },
      { id: 'M05', containerId: 'CONT-8890', destination: 'LPA', currentWeight: 8400, teus: 1, targetWeightPerTeu: 10300, tripId: 'VBCN00002' },
      { id: 'M09', containerId: 'CONT-1234', destination: 'IBZ', currentWeight: 200, teus: 2, targetWeightPerTeu: 8000, tripId: 'VBCN00003' },
      { id: 'M12', containerId: 'CONT-5678', destination: 'MAD', currentWeight: 5200, teus: 2, targetWeightPerTeu: 10300, tripId: 'VBCN00004' },
      { id: 'M15', containerId: 'CONT-9999', destination: '', currentWeight: 0, teus: 2, targetWeightPerTeu: 0, tripId: '' } // Pending container
    ],
    expeditions: [
      { id: 'EBCN001', origin: 'BCN', destination: 'PMI', pendingParts: 12, totalParts: 12, totalWeight: 1450 },
      { id: 'EBCN002', origin: 'BCN', destination: 'PMI', pendingParts: 5, totalParts: 8, totalWeight: 920 },
      { id: 'EBCN003', origin: 'MAD', destination: 'BCN', pendingParts: 6, totalParts: 10, totalWeight: 2200 }, // Reparto BCN from MAD
      { id: 'EBCN004', origin: 'MAD', destination: 'PMI', pendingParts: 8, totalParts: 8, totalWeight: 1200 },  // Transit
      { id: 'EBCN005', origin: 'BCN', destination: 'LPA', pendingParts: 15, totalParts: 30, totalWeight: 5400 },
      { id: 'EBCN006', origin: 'BCN', destination: 'MAH', pendingParts: 8, totalParts: 8, totalWeight: 850 },
      { id: 'EBCN007', origin: 'BCN', destination: 'MAD', pendingParts: 3, totalParts: 5, totalWeight: 600 }
    ]
  },
  MAD: {
    docks: [
      { id: 'M01', containerId: 'CONT-MAD1', destination: 'BCN', currentWeight: 4500, teus: 2, targetWeightPerTeu: 10300, tripId: 'VMAD00001' },
      { id: 'M02', containerId: 'CONT-MAD2', destination: 'PMI', currentWeight: 9800, teus: 2, targetWeightPerTeu: 10300, tripId: 'VMAD00002' },
      { id: 'M03', containerId: 'CONT-MAD3', destination: 'VLC', currentWeight: 2300, teus: 2, targetWeightPerTeu: 9000, tripId: 'VMAD00003' },
      { id: 'M04', containerId: 'CONT-MAD4', destination: '', currentWeight: 0, teus: 1, targetWeightPerTeu: 0, tripId: '' } // Pending container
    ],
    expeditions: [
      { id: 'EMAD001', origin: 'MAD', destination: 'BCN', pendingParts: 20, totalParts: 20, totalWeight: 4500 },
      { id: 'EMAD002', origin: 'BCN', destination: 'MAD', pendingParts: 4, totalParts: 6, totalWeight: 1100 }, // Reparto MAD from BCN
      { id: 'EMAD003', origin: 'MAD', destination: 'PMI', pendingParts: 12, totalParts: 15, totalWeight: 1800 },
      { id: 'EMAD004', origin: 'SVQ', destination: 'MAD', pendingParts: 2, totalParts: 2, totalWeight: 300 }   // Reparto MAD from SVQ
    ]
  }
};

// Generates dynamic state for other delegations
export function getMockState(delegation) {
  if (!mockStates[delegation]) {
    // Generate default docks & expeditions for the requested delegation
    const possibleDests = DELEGATIONS
      .map(d => d.code)
      .filter(code => code !== delegation);
    
    mockStates[delegation] = {
      docks: [
        { id: 'M01', containerId: `CONT-${delegation}1`, destination: possibleDests[0] || 'PMI', currentWeight: 1000, teus: 2, targetWeightPerTeu: 10300, tripId: `V${delegation}00001` },
        { id: 'M02', containerId: `CONT-${delegation}2`, destination: possibleDests[1] || 'LPA', currentWeight: 3000, teus: 1, targetWeightPerTeu: 10300, tripId: `V${delegation}00002` },
        { id: 'M03', containerId: `CONT-${delegation}3`, destination: '', currentWeight: 0, teus: 2, targetWeightPerTeu: 0, tripId: '' }
      ],
      expeditions: [
        { id: `E${delegation}001`, origin: delegation, destination: possibleDests[0] || 'PMI', pendingParts: 10, totalParts: 10, totalWeight: 1500 },
        { id: `E${delegation}002`, origin: delegation, destination: possibleDests[1] || 'LPA', pendingParts: 5, totalParts: 8, totalWeight: 900 },
        { id: `E${delegation}003`, origin: possibleDests[2] || 'MAD', destination: delegation, pendingParts: 4, totalParts: 4, totalWeight: 600 } // Reparto
      ]
    };
  }
  return mockStates[delegation];
}

// Simulation helper: Simulates a scan event
export function simulateScan(state, activeDelegation) {
  // 1. 5% chance to assign destination (plazaDestino/Viaje Export) to a pending container
  if (Math.random() < 0.05) {
    const pendingDock = state.docks.find(d => !d.destination);
    if (pendingDock) {
      const activeDockDests = state.docks.map(d => d.destination).filter(Boolean);
      const openDests = state.expeditions
        .map(e => e.destination)
        .filter(dest => dest !== activeDelegation && !activeDockDests.includes(dest));
      
      if (openDests.length > 0) {
        pendingDock.destination = openDests[Math.floor(Math.random() * openDests.length)];
        pendingDock.tripId = `V${activeDelegation}${Math.floor(Math.random() * 90000) + 10000}`;
        pendingDock.targetWeightPerTeu = 10300;
        pendingDock.currentWeight = 0;
      }
    }
  }

  // 2. Find a partial expedition or any random expedition
  const partials = state.expeditions.filter(e => e.pendingParts > 0);
  if (partials.length === 0) return state;

  const exp = partials[Math.floor(Math.random() * partials.length)];
  
  // Find a dock for that destination
  const dock = state.docks.find(d => d.destination === exp.destination);
  
  if (dock) {
    // Perform "Loading" event (container loading)
    exp.pendingParts--;
    dock.currentWeight += Math.floor(Math.random() * 200) + 50; // Random weight per item
    const targetWeightVal = (dock.targetWeightPerTeu !== undefined && dock.targetWeightPerTeu !== null) ? dock.targetWeightPerTeu : 10300;
    const maxWeight = (dock.teus || 2) * targetWeightVal;
    if (dock.currentWeight > maxWeight) dock.currentWeight = maxWeight;
  } else if (exp.destination === activeDelegation) {
    // Reparto expedition: load/associate to Route Sheet (Hoja de Ruta)
    exp.pendingParts--;
  }

  return { ...state };
}

