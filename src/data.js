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
      { id: 'M01', containerId: 'CONT-4412', destination: 'PMI', currentWeight: 1250, teus: 2, targetWeightPerTeu: 10300, tripId: 'VBCN00001', status: 'active', operator: 'Carlos Ruiz' },
      { id: 'M05', containerId: 'CONT-8890', destination: 'LPA', currentWeight: 8400, teus: 1, targetWeightPerTeu: 10300, tripId: 'VBCN00002', status: 'active', operator: 'Miguel A.' },
      { id: 'M09', containerId: 'CONT-1234', destination: 'IBZ', currentWeight: 200, teus: 2, targetWeightPerTeu: 8000, tripId: 'VBCN00003', status: 'active', operator: 'Lucia G.' },
      { 
        id: 'M12', 
        containerId: 'CONT-5678', 
        destination: 'BCN', 
        currentWeight: 5200, 
        teus: 2, 
        targetWeightPerTeu: 0, 
        tripId: 'VMAD99999', 
        status: 'active',
        operator: 'Juan P.',
        expeditions: [
          { id: 'EMAD881', origin: 'MAD', destination: 'BCN', pendingParts: 5, totalParts: 8, totalWeight: 1500, isADR: false },
          { id: 'EMAD882', origin: 'MAD', destination: 'BCN', pendingParts: 3, totalParts: 10, totalWeight: 2000, isADR: true }
        ]
      },
      { id: 'M15', containerId: 'CONT-9999', destination: '', currentWeight: 0, teus: 2, targetWeightPerTeu: 0, tripId: '', status: 'pending' },
      { id: 'M16', containerId: '', destination: '', currentWeight: 0, teus: 2, targetWeightPerTeu: 0, tripId: '', status: 'pending' } // Empty muelle
    ],
    expeditions: [
      { id: 'EBCN001', origin: 'BCN', destination: 'PMI', pendingParts: 12, totalParts: 12, totalWeight: 1450, isADR: true },
      { id: 'EBCN002', origin: 'BCN', destination: 'PMI', pendingParts: 5, totalParts: 8, totalWeight: 920, isADR: false },
      { id: 'EBCN004', origin: 'MAD', destination: 'PMI', pendingParts: 8, totalParts: 8, totalWeight: 1200, isADR: false },  // Transit
      { id: 'EBCN005', origin: 'BCN', destination: 'LPA', pendingParts: 15, totalParts: 30, totalWeight: 5400, isADR: true },
      { id: 'EBCN006', origin: 'BCN', destination: 'MAH', pendingParts: 8, totalParts: 8, totalWeight: 850, isADR: false },
      { id: 'EBCN007', origin: 'BCN', destination: 'MAD', pendingParts: 3, totalParts: 5, totalWeight: 600, isADR: false }
    ]
  },
  MAD: {
    docks: [
      { id: 'M01', containerId: 'CONT-MAD1', destination: 'BCN', currentWeight: 4500, teus: 2, targetWeightPerTeu: 10300, tripId: 'VMAD00001', status: 'active', operator: 'Ana V.' },
      { 
        id: 'M02', 
        containerId: 'CONT-MAD2', 
        destination: 'MAD', 
        currentWeight: 9800, 
        teus: 2, 
        targetWeightPerTeu: 0, 
        tripId: 'VBCN77777', 
        status: 'active',
        operator: 'Pedro P.',
        expeditions: [
          { id: 'EBCN771', origin: 'BCN', destination: 'MAD', pendingParts: 6, totalParts: 12, totalWeight: 2200, isADR: false }
        ]
      },
      { id: 'M03', containerId: 'CONT-MAD3', destination: 'VLC', currentWeight: 2300, teus: 2, targetWeightPerTeu: 9000, tripId: 'VMAD00003', status: 'active', operator: 'Maria C.' },
      { id: 'M04', containerId: '', destination: '', currentWeight: 0, teus: 1, targetWeightPerTeu: 0, tripId: '', status: 'pending' } // Empty muelle
    ],
    expeditions: [
      { id: 'EMAD001', origin: 'MAD', destination: 'BCN', pendingParts: 20, totalParts: 20, totalWeight: 4500, isADR: true },
      { id: 'EMAD003', origin: 'MAD', destination: 'PMI', pendingParts: 12, totalParts: 15, totalWeight: 1800, isADR: false }
    ]
  }
};

// Generates dynamic state for other delegations
export function getMockState(delegation) {
  if (!mockStates[delegation]) {
    const possibleDests = DELEGATIONS
      .map(d => d.code)
      .filter(code => code !== delegation);
    
    mockStates[delegation] = {
      docks: [
        { id: 'M01', containerId: `CONT-${delegation}1`, destination: possibleDests[0] || 'PMI', currentWeight: 1000, teus: 2, targetWeightPerTeu: 10300, tripId: `V${delegation}00001`, status: 'active', operator: 'Operario 1' },
        { 
          id: 'M02', 
          containerId: `CONT-${delegation}2`, 
          destination: delegation, 
          currentWeight: 4000, 
          teus: 2, 
          targetWeightPerTeu: 0, 
          tripId: `V${possibleDests[1] || 'MAD'}00002`, 
          status: 'active',
          operator: 'Operario 2',
          expeditions: [
            { id: `E${possibleDests[1] || 'MAD'}991`, origin: possibleDests[1] || 'MAD', destination: delegation, pendingParts: 4, totalParts: 8, totalWeight: 1200, isADR: false },
            { id: `E${possibleDests[1] || 'MAD'}992`, origin: possibleDests[1] || 'MAD', destination: delegation, pendingParts: 2, totalParts: 6, totalWeight: 800, isADR: true }
          ]
        },
        { id: 'M03', containerId: `CONT-${delegation}3`, destination: '', currentWeight: 0, teus: 2, targetWeightPerTeu: 0, tripId: '', status: 'pending' },
        { id: 'M04', containerId: '', destination: '', currentWeight: 0, teus: 2, targetWeightPerTeu: 0, tripId: '', status: 'pending' }
      ],
      expeditions: [
        { id: `E${delegation}001`, origin: delegation, destination: possibleDests[0] || 'PMI', pendingParts: 10, totalParts: 10, totalWeight: 1500, isADR: Math.random() > 0.5 },
        { id: `E${delegation}002`, origin: delegation, destination: possibleDests[1] || 'LPA', pendingParts: 5, totalParts: 8, totalWeight: 900, isADR: Math.random() > 0.5 }
      ]
    };
  }
  return mockStates[delegation];
}

// Simulation helper: Simulates container lifecycles and scan events
export function simulateScan(state, activeDelegation) {
  const possibleOrigins = DELEGATIONS.map(d => d.code).filter(c => c !== activeDelegation);
  const randomOrigin = possibleOrigins[Math.floor(Math.random() * possibleOrigins.length)] || 'MAD';

  // 1. Process Docks Lifecycles (Transitions between states)
  state.docks.forEach(dock => {
    // A. Empty muelle -> 5% chance to couple a new empty container
    if (!dock.containerId) {
      if (Math.random() < 0.05) {
        dock.containerId = `CONT-${Math.floor(Math.random() * 9000) + 1000}`;
        dock.status = 'pending';
        dock.destination = '';
        dock.tripId = '';
        dock.currentWeight = 0;
        dock.expeditions = [];
      }
      return;
    }

    // B. Pending container -> 5% chance to get assigned a trip
    if (dock.status === 'pending') {
      if (Math.random() < 0.05) {
        // 60% chance Export trip, 40% chance Import trip
        if (Math.random() < 0.6) {
          const activeDockDests = state.docks.map(d => d.destination).filter(Boolean);
          const openDests = state.expeditions
            .map(e => e.destination)
            .filter(dest => dest !== activeDelegation && !activeDockDests.includes(dest));
          
          const targetDest = openDests.length > 0 
            ? openDests[Math.floor(Math.random() * openDests.length)]
            : (possibleOrigins[Math.floor(Math.random() * possibleOrigins.length)] || 'PMI');

          dock.destination = targetDest;
          dock.tripId = `V${activeDelegation}${Math.floor(Math.random() * 90000) + 10000}`;
          
          // Simular la lógica de la tabla del ERP: Almacen -> Plaza Destino
          if (['PMI', 'MAH', 'IBZ'].includes(targetDest)) dock.targetWeightPerTeu = 8500;
          else if (['LPA', 'SCT'].includes(targetDest)) dock.targetWeightPerTeu = 10300;
          else dock.targetWeightPerTeu = 9500; // Península
          
          dock.currentWeight = 0;
          dock.status = 'active';
          dock.operator = 'Op. ' + Math.floor(Math.random() * 100);
        } else {
          // Import trip
          dock.destination = activeDelegation;
          dock.tripId = `V${randomOrigin}${Math.floor(Math.random() * 90000) + 10000}`;
          dock.targetWeightPerTeu = 0;
          dock.currentWeight = 4000 + Math.floor(Math.random() * 5000);
          dock.status = 'active';
          dock.operator = 'Op. ' + Math.floor(Math.random() * 100);
          dock.expeditions = [
            { id: `E${randomOrigin}${Math.floor(Math.random() * 900) + 100}`, origin: randomOrigin, destination: activeDelegation, pendingParts: 6, totalParts: 6, totalWeight: 2000, isADR: Math.random() > 0.8 },
            { id: `E${randomOrigin}${Math.floor(Math.random() * 900) + 100}`, origin: randomOrigin, destination: activeDelegation, pendingParts: 4, totalParts: 4, totalWeight: 1500, isADR: Math.random() > 0.8 }
          ];
        }
      }
      return;
    }

    // C. Closed container -> 10% chance to depart (estancia finalizada)
    if (dock.status === 'closed') {
      if (Math.random() < 0.1) {
        // Estancia finalizada: container physically leaves the muelle, muelle becomes empty!
        dock.containerId = '';
        dock.destination = '';
        dock.tripId = '';
        dock.currentWeight = 0;
        dock.status = 'pending';
        dock.expeditions = [];
      }
      return;
    }
  });

  // 2. Perform Operational Scans (Loading Export or Unloading Import)
  if (Math.random() < 0.8) {
    // 50% load export, 50% unload import
    if (Math.random() < 0.5) {
      // Export scan
      const activeExports = state.expeditions.filter(e => e.pendingParts > 0 && e.destination !== activeDelegation);
      if (activeExports.length > 0) {
        const exp = activeExports[Math.floor(Math.random() * activeExports.length)];
        const dock = state.docks.find(d => d.destination === exp.destination && d.status === 'active');
        if (dock) {
          exp.pendingParts--;
          dock.currentWeight += Math.floor(Math.random() * 200) + 50;
          const targetWeightVal = (dock.targetWeightPerTeu !== undefined && dock.targetWeightPerTeu !== null) ? dock.targetWeightPerTeu : 10300;
          const maxWeight = (dock.teus || 2) * targetWeightVal;
          if (dock.currentWeight >= maxWeight) {
            dock.currentWeight = maxWeight;
            // 50% chance to close the trip once weight goal is reached
            if (Math.random() < 0.5) {
              dock.status = 'closed';
            }
          }
        }
      }
    } else {
      // Import scan (Unloading container)
      const activeImports = state.docks.filter(d => d.destination === activeDelegation && d.status === 'active');
      if (activeImports.length > 0) {
        const dock = activeImports[Math.floor(Math.random() * activeImports.length)];
        const activeExps = (dock.expeditions || []).filter(e => e.pendingParts > 0);
        if (activeExps.length > 0) {
          const exp = activeExps[Math.floor(Math.random() * activeExps.length)];
          exp.pendingParts--;
          
          // Check if unloading completed
          const remainingParts = (dock.expeditions || []).reduce((sum, e) => sum + e.pendingParts, 0);
          if (remainingParts === 0) {
            dock.status = 'closed'; // Completed / Closed trip
          }
        }
      }
    }
  }

  return { ...state };
}

