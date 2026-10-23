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

// Helper to determine if an expedition has an antique date (>= 1 day old)
export function isAntigua(dateStr, referenceDate = new Date()) {
  if (!dateStr) return false;
  const expDate = new Date(dateStr);
  if (isNaN(expDate.getTime())) return false;
  const diffMs = referenceDate.getTime() - expDate.getTime();
  // 1 día o más de antigüedad respecto a la fecha actual
  return diffMs >= (24 * 60 * 60 * 1000);
}

// Helper to generate dynamic dates relative to current time for mock data
function getMockDate(daysAgo = 0, hoursAgo = 0) {
  return new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000)).toISOString();
}

// Initial mock states per delegation
const mockStates = {
  BCN: {
    docks: [
      {
        id: 'M01',
        containerId: 'TASU004412',
        destination: 'PMI',
        currentWeight: 1250,
        teus: 2,
        equipmentVolume: 76.0,
        equipmentLength: 13.6,
        longitudInterior: 13.6,
        currentVolume: 24.5,
        currentLinealMeters: 10.2,
        targetWeightPerTeu: 10300,
        tripId: 'VBCN00001',
        status: 'active',
        hasStay: true,
        driverType: 'internal',
        vehiclePlate: '8421-KLS',
        carrierName: '',
        operator: 'Carlos Ruiz'
      },
      {
        id: 'M05',
        containerId: 'TASU008890',
        destination: 'LPA',
        currentWeight: 8400,
        teus: 1,
        equipmentVolume: 38.0,
        equipmentLength: 6.0,
        longitudInterior: 6.0,
        currentVolume: 29.8,
        currentLinealMeters: 5.2,
        targetWeightPerTeu: 10300,
        tripId: 'VBCN00002',
        status: 'active',
        hasStay: true,
        driverType: 'external',
        vehiclePlate: '',
        carrierName: 'Trans. Canarian Express',
        operator: 'Miguel A.'
      },
      {
        id: 'M09',
        containerId: 'TASU001234',
        destination: 'IBZ',
        currentWeight: 200,
        teus: 2,
        equipmentVolume: 76.0,
        equipmentLength: 13.6,
        longitudInterior: 13.6,
        currentVolume: 6.4,
        currentLinealMeters: 2.8,
        targetWeightPerTeu: 8000,
        tripId: 'VBCN00003',
        status: 'active',
        hasStay: true,
        driverType: 'internal',
        vehiclePlate: '3190-MBP',
        carrierName: '',
        operator: 'Lucia G.'
      },
      { 
        id: 'M12', 
        containerId: 'TASU005678', 
        destination: 'BCN', 
        currentWeight: 5200, 
        teus: 2, 
        equipmentVolume: 76.0,
        equipmentLength: 13.6,
        currentVolume: 42.0,
        currentLinealMeters: 11.5,
        targetWeightPerTeu: 0, 
        tripId: 'VMAD99999', 
        status: 'active',
        hasStay: true,
        driverType: 'external',
        vehiclePlate: '',
        carrierName: 'Transportes Marítimos Sur',
        operator: 'Juan P.',
        expeditions: [
          { id: 'EMAD881', origin: 'MAD', destination: 'BCN', pendingParts: 5, totalParts: 8, totalWeight: 1500, volume: 16.0, height: 2.2, isADR: false, pallets: 2, packages: 8, date: getMockDate(0, 3), isDispatched: true },
          { id: 'EMAD882', origin: 'MAD', destination: 'BCN', pendingParts: 3, totalParts: 10, totalWeight: 2000, volume: 22.0, height: 2.4, isADR: true, pallets: 3, packages: 10, date: getMockDate(1, 2), isDispatched: true }
        ]
      },
      { id: 'M15', containerId: 'TASU009999', destination: '', currentWeight: 0, teus: 2, equipmentVolume: 76.0, equipmentLength: 13.6, currentVolume: 0, currentLinealMeters: 0, targetWeightPerTeu: 0, tripId: '', status: 'pending', hasStay: true },
      { id: 'M16', containerId: '', destination: '', currentWeight: 0, teus: 2, equipmentVolume: 76.0, equipmentLength: 13.6, currentVolume: 0, currentLinealMeters: 0, targetWeightPerTeu: 0, tripId: '', status: 'pending', hasStay: false } // Empty muelle without container/stay
    ],
    expeditions: [
      // Baleares: Se muestran todas
      { id: 'EBCN001', origin: 'BCN', destination: 'PMI', pendingParts: 12, totalParts: 12, totalWeight: 1450, volume: 15.6, height: 2.2, isADR: true, pallets: 3, packages: 12, date: getMockDate(2, 4), isDispatched: true },
      { id: 'EBCN002', origin: 'BCN', destination: 'PMI', pendingParts: 5, totalParts: 8, totalWeight: 920, volume: 10.4, height: 2.3, isADR: false, pallets: 2, packages: 8, date: getMockDate(0, 4), isDispatched: true },
      { id: 'EBCN004', origin: 'MAD', destination: 'PMI', pendingParts: 8, totalParts: 8, totalWeight: 1200, volume: 13.2, height: 2.2, isADR: false, pallets: 4, packages: 8, date: getMockDate(1, 5), isDispatched: true },
      { id: 'EBCN006', origin: 'BCN', destination: 'MAH', pendingParts: 8, totalParts: 8, totalWeight: 850, volume: 9.8, height: 2.1, isADR: false, pallets: 2, packages: 8, date: getMockDate(0, 2), isDispatched: true },
      { id: 'EBCN008', origin: 'BCN', destination: 'IBZ', pendingParts: 15, totalParts: 15, totalWeight: 1850, volume: 19.5, height: 2.4, isADR: false, pallets: 5, packages: 15, date: getMockDate(3, 0), isDispatched: true },
      
      // Canarias:
      { id: 'EBCN005', origin: 'BCN', destination: 'LPA', pendingParts: 15, totalParts: 30, totalWeight: 5400, volume: 32.0, height: 2.3, isADR: true, pallets: 6, packages: 30, date: getMockDate(2, 6), isDispatched: true },
      { id: 'EBCN010', origin: 'BCN', destination: 'LPA', pendingParts: 18, totalParts: 18, totalWeight: 2100, volume: 18.0, height: 2.2, isADR: false, pallets: 4, packages: 18, date: getMockDate(0, 5), isDispatched: true },
      { id: 'EBCN011', origin: 'BCN', destination: 'LPA', pendingParts: 14, totalParts: 14, totalWeight: 1600, volume: 14.5, height: 2.2, isADR: false, pallets: 3, packages: 14, date: getMockDate(1, 1), isDispatched: false }, // Retenida DUA (NO despachada)
      { id: 'EBCN012', origin: 'BCN', destination: 'SCT', pendingParts: 22, totalParts: 22, totalWeight: 3100, volume: 24.2, height: 2.4, isADR: false, pallets: 5, packages: 22, date: getMockDate(3, 2), isDispatched: true },
      { id: 'EBCN013', origin: 'BCN', destination: 'SCT', pendingParts: 10, totalParts: 10, totalWeight: 1100, volume: 11.0, height: 2.2, isADR: true, pallets: 2, packages: 10, date: getMockDate(0, 3), isDispatched: false }, // Retenida DUA (NO despachada)
      
      // Península
      { id: 'EBCN007', origin: 'BCN', destination: 'MAD', pendingParts: 3, totalParts: 5, totalWeight: 600, volume: 6.8, height: 2.2, isADR: false, pallets: 1, packages: 5, date: getMockDate(1, 8), isDispatched: true }
    ]
  },
  MAD: {
    docks: [
      {
        id: 'M01',
        containerId: 'TASU004501',
        destination: 'BCN',
        currentWeight: 4500,
        teus: 2,
        equipmentVolume: 76.0,
        equipmentLength: 13.6,
        currentVolume: 35.0,
        currentLinealMeters: 8.5,
        targetWeightPerTeu: 10300,
        tripId: 'VMAD00001',
        status: 'active',
        hasStay: true,
        driverType: 'internal',
        vehiclePlate: '9120-JYT',
        carrierName: '',
        operator: 'Ana V.'
      },
      { 
        id: 'M02', 
        containerId: 'TASU004502', 
        destination: 'MAD', 
        currentWeight: 9800, 
        teus: 2, 
        equipmentVolume: 76.0,
        equipmentLength: 13.6,
        currentVolume: 60.0,
        currentLinealMeters: 12.0,
        targetWeightPerTeu: 0, 
        tripId: 'VBCN77777', 
        status: 'active',
        hasStay: true,
        driverType: 'external',
        vehiclePlate: '',
        carrierName: 'Trans-Iberia Cargo',
        operator: 'Pedro P.',
        expeditions: [
          { id: 'EBCN771', origin: 'BCN', destination: 'MAD', pendingParts: 6, totalParts: 12, totalWeight: 2200, volume: 20.0, height: 2.2, isADR: false, pallets: 3, packages: 12, date: getMockDate(0, 6), isDispatched: true }
        ]
      },
      {
        id: 'M03',
        containerId: 'TASU004503',
        destination: 'VLC',
        currentWeight: 2300,
        teus: 2,
        equipmentVolume: 76.0,
        equipmentLength: 13.6,
        currentVolume: 18.0,
        currentLinealMeters: 4.8,
        targetWeightPerTeu: 9000,
        tripId: 'VMAD00003',
        status: 'active',
        hasStay: true,
        driverType: 'internal',
        vehiclePlate: '4452-LPM',
        carrierName: '',
        operator: 'Maria C.'
      },
      { id: 'M04', containerId: '', destination: '', currentWeight: 0, teus: 1, equipmentVolume: 38.0, equipmentLength: 6.0, currentVolume: 0, currentLinealMeters: 0, targetWeightPerTeu: 0, tripId: '', status: 'pending', hasStay: false }
    ],
    expeditions: [
      { id: 'EMAD001', origin: 'MAD', destination: 'BCN', pendingParts: 20, totalParts: 20, totalWeight: 4500, volume: 38.0, height: 2.4, isADR: true, pallets: 6, packages: 20, date: getMockDate(1, 3), isDispatched: true },
      { id: 'EMAD003', origin: 'MAD', destination: 'PMI', pendingParts: 12, totalParts: 15, totalWeight: 1800, volume: 16.5, height: 2.2, isADR: false, pallets: 4, packages: 15, date: getMockDate(0, 2), isDispatched: true },
      { id: 'EMAD005', origin: 'MAD', destination: 'LPA', pendingParts: 16, totalParts: 16, totalWeight: 2400, volume: 22.0, height: 2.3, isADR: false, pallets: 5, packages: 16, date: getMockDate(2, 1), isDispatched: true },
      { id: 'EMAD006', origin: 'MAD', destination: 'LPA', pendingParts: 10, totalParts: 10, totalWeight: 1300, volume: 12.0, height: 2.2, isADR: false, pallets: 2, packages: 10, date: getMockDate(0, 5), isDispatched: false }
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
        {
          id: 'M01',
          containerId: `CONT-${delegation}1`,
          destination: possibleDests[0] || 'PMI',
          currentWeight: 1000,
          teus: 2,
          equipmentVolume: 76.0,
          equipmentLength: 13.6,
          currentVolume: 12.0,
          currentLinealMeters: 5.2,
          targetWeightPerTeu: 10300,
          tripId: `V${delegation}00001`,
          status: 'active',
          hasStay: true,
          driverType: 'internal',
          vehiclePlate: '1234-BBB',
          carrierName: '',
          operator: 'Operario 1'
        },
        { 
          id: 'M02', 
          containerId: `CONT-${delegation}2`, 
          destination: delegation, 
          currentWeight: 4000, 
          teus: 2, 
          equipmentVolume: 76.0,
          equipmentLength: 13.6,
          currentVolume: 35.0,
          currentLinealMeters: 9.0,
          targetWeightPerTeu: 0, 
          tripId: `V${possibleDests[1] || 'MAD'}00002`, 
          status: 'active',
          hasStay: true,
          driverType: 'external',
          vehiclePlate: '',
          carrierName: 'Logística Exprés S.L.',
          operator: 'Operario 2',
          expeditions: [
            { id: `E${possibleDests[1] || 'MAD'}991`, origin: possibleDests[1] || 'MAD', destination: delegation, pendingParts: 4, totalParts: 8, totalWeight: 1200, volume: 14.0, height: 2.2, isADR: false, pallets: 2, packages: 8, date: getMockDate(0, 4), isDispatched: true },
            { id: `E${possibleDests[1] || 'MAD'}992`, origin: possibleDests[1] || 'MAD', destination: delegation, pendingParts: 2, totalParts: 6, totalWeight: 800, volume: 9.0, height: 2.2, isADR: true, pallets: 1, packages: 6, date: getMockDate(1, 2), isDispatched: true }
          ]
        },
        { id: 'M03', containerId: `CONT-${delegation}3`, destination: '', currentWeight: 0, teus: 2, equipmentVolume: 76.0, equipmentLength: 13.6, currentVolume: 0, currentLinealMeters: 0, targetWeightPerTeu: 0, tripId: '', status: 'pending', hasStay: false },
        { id: 'M04', containerId: '', destination: '', currentWeight: 0, teus: 2, equipmentVolume: 76.0, equipmentLength: 13.6, currentVolume: 0, currentLinealMeters: 0, targetWeightPerTeu: 0, tripId: '', status: 'pending', hasStay: false }
      ],
      expeditions: [
        { id: `E${delegation}001`, origin: delegation, destination: possibleDests[0] || 'PMI', pendingParts: 10, totalParts: 10, totalWeight: 1500, volume: 15.0, height: 2.2, isADR: Math.random() > 0.5, pallets: 3, packages: 10, date: getMockDate(2, 0), isDispatched: true },
        { id: `E${delegation}002`, origin: delegation, destination: possibleDests[1] || 'LPA', pendingParts: 5, totalParts: 8, totalWeight: 900, volume: 10.0, height: 2.2, isADR: Math.random() > 0.5, pallets: 2, packages: 8, date: getMockDate(0, 3), isDispatched: true },
        { id: `E${delegation}003`, origin: delegation, destination: possibleDests[1] || 'LPA', pendingParts: 8, totalParts: 8, totalWeight: 1100, volume: 12.0, height: 2.2, isADR: false, pallets: 3, packages: 8, date: getMockDate(1, 4), isDispatched: false }
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
        dock.containerId = `TASU00${Math.floor(Math.random() * 9000) + 1000}`;
        dock.status = 'pending';
        dock.destination = '';
        dock.tripId = '';
        dock.currentWeight = 0;
        dock.currentVolume = 0;
        dock.currentLinealMeters = 0;
        dock.hasStay = true;
        dock.expeditions = [];
      }
      return;
    }

    // B. Pending container -> 5% chance to get assigned a trip and begin estancia
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
          dock.hasStay = true;
          
          const isInternal = Math.random() < 0.5;
          dock.driverType = isInternal ? 'internal' : 'external';
          dock.vehiclePlate = isInternal ? `${Math.floor(Math.random() * 9000) + 1000}-${['KLS','MBP','LPM','JYT','XTR'][Math.floor(Math.random()*5)]}` : '';
          dock.carrierName = !isInternal ? ['Trans-Iberia Cargo', 'Logística Express', 'Transportes Levante', 'DHL Freight'][Math.floor(Math.random()*4)] : '';

          dock.teus = dock.teus || 2;
          dock.equipmentVolume = dock.teus === 1 ? 38.0 : 76.0;
          dock.equipmentLength = dock.teus === 1 ? 6.0 : 13.6;
          dock.currentVolume = 0;
          dock.currentLinealMeters = 0;
          
          if (['PMI', 'MAH', 'IBZ'].includes(targetDest)) dock.targetWeightPerTeu = 8500;
          else if (['LPA', 'SCT'].includes(targetDest)) dock.targetWeightPerTeu = 10300;
          else dock.targetWeightPerTeu = 9500;
          
          dock.currentWeight = 0;
          dock.status = 'active';
          dock.operator = 'Op. ' + Math.floor(Math.random() * 100);
        } else {
          // Import trip
          dock.destination = activeDelegation;
          dock.tripId = `V${randomOrigin}${Math.floor(Math.random() * 90000) + 10000}`;
          dock.hasStay = true;
          
          const isInternal = Math.random() < 0.5;
          dock.driverType = isInternal ? 'internal' : 'external';
          dock.vehiclePlate = isInternal ? `${Math.floor(Math.random() * 9000) + 1000}-ABC` : '';
          dock.carrierName = !isInternal ? 'Trans. Marítimos Sur' : '';

          dock.teus = dock.teus || 2;
          dock.equipmentVolume = dock.teus === 1 ? 38.0 : 76.0;
          dock.equipmentLength = dock.teus === 1 ? 6.0 : 13.6;
          dock.currentVolume = 35.0;
          dock.currentLinealMeters = 8.5;
          dock.targetWeightPerTeu = 0;
          dock.currentWeight = 4000 + Math.floor(Math.random() * 5000);
          dock.status = 'active';
          dock.operator = 'Op. ' + Math.floor(Math.random() * 100);
          dock.expeditions = [
            { id: `E${randomOrigin}${Math.floor(Math.random() * 900) + 100}`, origin: randomOrigin, destination: activeDelegation, pendingParts: 6, totalParts: 6, totalWeight: 2000, volume: 18.0, height: 2.2, isADR: Math.random() > 0.8 },
            { id: `E${randomOrigin}${Math.floor(Math.random() * 900) + 100}`, origin: randomOrigin, destination: activeDelegation, pendingParts: 4, totalParts: 4, totalWeight: 1500, volume: 12.0, height: 2.2, isADR: Math.random() > 0.8 }
          ];
        }
      }
      return;
    }

    // C. Closed container -> 10% chance to depart (estancia finalizada)
    if (dock.status === 'closed') {
      if (Math.random() < 0.1) {
        dock.containerId = '';
        dock.destination = '';
        dock.tripId = '';
        dock.currentWeight = 0;
        dock.currentVolume = 0;
        dock.currentLinealMeters = 0;
        dock.status = 'pending';
        dock.hasStay = false;
        dock.expeditions = [];
      }
      return;
    }
  });

  // 2. Perform Operational Scans (Loading Export or Unloading Import)
  if (Math.random() < 0.8) {
    if (Math.random() < 0.5) {
      // Export scan
      const activeExports = state.expeditions.filter(e => e.pendingParts > 0 && e.destination !== activeDelegation);
      if (activeExports.length > 0) {
        const exp = activeExports[Math.floor(Math.random() * activeExports.length)];
        const dock = state.docks.find(d => d.destination === exp.destination && d.status === 'active');
        if (dock) {
          exp.pendingParts--;
          dock.currentWeight += Math.floor(Math.random() * 200) + 50;

          // Increment Volume and Linear Meters based on partida's measurements
          const partVolume = (exp.volume || 12.0) / (exp.totalParts || 10);
          const partHeight = exp.height || 2.2;
          const partML = partVolume / partHeight;

          dock.equipmentVolume = dock.equipmentVolume || (dock.teus === 1 ? 38.0 : 76.0);
          dock.equipmentLength = dock.equipmentLength || (dock.teus === 1 ? 6.0 : 13.6);
          dock.currentVolume = Math.min((dock.currentVolume || 0) + partVolume, dock.equipmentVolume);
          dock.currentLinealMeters = Math.min((dock.currentLinealMeters || 0) + partML, dock.equipmentLength);

          const maxVol = dock.equipmentVolume;
          if (dock.currentVolume >= maxVol * 0.95) {
            // 50% chance to close the trip once volume capacity is nearly reached
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
          
          const remainingParts = (dock.expeditions || []).reduce((sum, e) => sum + e.pendingParts, 0);
          if (remainingParts === 0) {
            dock.status = 'closed';
          }
        }
      }
    }
  }

  return { ...state };
}

