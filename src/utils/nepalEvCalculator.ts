/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nepal Electric Vehicle (EV), Provincial Road Tax & NEA Energy Cost Engine
 * Conforms to Provincial Finance Acts (Bagmati/Gandaki/Koshi) and NEA Time-of-Day (TOD) Tariffs.
 */

export interface EvTaxParams {
  category: '2wheeler' | 'car' | 'microbus' | 'bus';
  motorKw: number;
  province?: 'bagmati' | 'gandaki' | 'koshi' | 'lumbini';
  expiryMonthsLate?: number; // Delay in months past bluebook renewal date
}

export interface EvTaxResult {
  baseTaxNpr: number;
  finePercent: number;
  fineAmountNpr: number;
  totalTaxDueNpr: number;
  bracketDescription: string;
  renewalChecklist: string[];
}

export interface NeaEvChargingParams {
  batteryKwh: number;
  chargingEfficiency?: number; // e.g. 0.9 (90%)
  timeOfDay: 'peak' | 'normal' | 'off_peak';
  dailyCommuteKm?: number;
  petrolPricePerLiter?: number;
  petrolMileageKmPerLiter?: number;
}

export interface NeaEvChargingResult {
  fullChargeUnitsKwh: number;
  costPerFullChargeNpr: number;
  ratePerUnitNpr: number;
  costPerKmEvNpr: number;
  costPerKmPetrolNpr: number;
  monthlySavingsNpr: number;
  annualSavingsNpr: number;
}

/**
 * Calculates annual provincial vehicle road tax for EVs
 */
export function calculateEvRoadTax(params: EvTaxParams): EvTaxResult {
  const { category, motorKw, province = 'bagmati', expiryMonthsLate = 0 } = params;

  let baseTax = 0;
  let bracketDesc = '';

  if (category === '2wheeler') {
    if (motorKw <= 1) {
      baseTax = 2000;
      bracketDesc = 'EV 2-Wheeler (Up to 1.0 kW / ~125cc equivalent)';
    } else if (motorKw <= 2) {
      baseTax = 2500;
      bracketDesc = 'EV 2-Wheeler (1.1 kW – 2.0 kW / ~150cc equivalent)';
    } else {
      baseTax = 3500;
      bracketDesc = 'EV 2-Wheeler (Above 2.0 kW)';
    }
  } else if (category === 'car') {
    // Standard Private EV Cars / SUVs (Bagmati/Gandaki schedule)
    if (motorKw <= 49) {
      baseTax = 10000;
      bracketDesc = 'Private EV Car (Up to 49 kW - e.g. Tiago EV, Wuling)';
    } else if (motorKw <= 99) {
      baseTax = 15000;
      bracketDesc = 'Private EV Car (50 kW – 99 kW - e.g. Atto 3 100kW, Nexon EV, MG ZS EV)';
    } else if (motorKw <= 199) {
      baseTax = 30000;
      bracketDesc = 'Private EV Car (100 kW – 199 kW - e.g. Seal, Ioniq 5, EV6)';
    } else {
      baseTax = 50000;
      bracketDesc = 'Luxury Performance EV (200 kW and above)';
    }
  } else if (category === 'microbus') {
    // 14-18 Seater EV Vans / HiAce microbuses
    baseTax = 18000;
    bracketDesc = 'Commercial EV Microbus / Van (14–19 seats - e.g. Joylong, Foton, Golden Dragon)';
  } else {
    // Commercial Public EV Buses (25-40 seats)
    baseTax = 25000;
    bracketDesc = 'Commercial Electric Public Bus (Heavy Passenger Vehicle)';
  }

  // Fine percentage calculation as per Motor Vehicle and Transport Management Act
  let finePct = 0;
  if (expiryMonthsLate <= 0) {
    finePct = 0;
  } else if (expiryMonthsLate <= 3) {
    finePct = 5;
  } else if (expiryMonthsLate <= 6) {
    finePct = 10;
  } else if (expiryMonthsLate <= 12) {
    finePct = 20;
  } else if (expiryMonthsLate <= 60) {
    finePct = 32;
  } else {
    finePct = 100; // Over 5 years
  }

  const fineAmt = Math.round((baseTax * finePct) / 100);
  const total = baseTax + fineAmt;

  const checklist = [
    'Original Vehicle Registration Certificate (सवारी दर्ता प्रमाणपत्र / ब्लुबुक)',
    'Valid Third-Party Vehicle Insurance Policy (तेस्रो पक्ष बीमा)',
    'Vehicle Technical Inspection & Fitness Clearance (सवारी परीक्षण प्रमाणपत्र)',
    'Previous Year Tax Clearance Receipt (अघिल्लो वर्षको कर चुक्ता रसिद)',
  ];

  if (category === 'microbus' || category === 'bus') {
    checklist.push('Route Permit Certificate (बाटो इजाजत पत्र / रुट परमिट)');
  }

  return {
    baseTaxNpr: baseTax,
    finePercent: finePct,
    fineAmountNpr: fineAmt,
    totalTaxDueNpr: total,
    bracketDescription: bracketDesc,
    renewalChecklist: checklist,
  };
}

/**
 * Calculates NEA Domestic/Commercial charging costs and petrol savings
 */
export function calculateNeaChargingCost(params: NeaEvChargingParams): NeaEvChargingResult {
  const {
    batteryKwh,
    chargingEfficiency = 0.9,
    timeOfDay,
    dailyCommuteKm = 35,
    petrolPricePerLiter = 175,
    petrolMileageKmPerLiter = 12,
  } = params;

  // NEA Tariff per Unit (kWh)
  let unitRate = 8.5; // Normal daytime
  if (timeOfDay === 'off_peak') {
    unitRate = 4.3; // Night off-peak 11 PM - 5 AM
  } else if (timeOfDay === 'peak') {
    unitRate = 12.0; // Peak 5 PM - 11 PM
  }

  // Battery requires extra energy due to charging inverter heat/conversion loss
  const totalUnitsRequired = Number((batteryKwh / chargingEfficiency).toFixed(1));
  const fullChargeCost = Math.round(totalUnitsRequired * unitRate);

  // Approximate realistic highway/city range based on battery capacity (avg 6.8 km per kWh)
  const estimatedRangeKm = Math.round(batteryKwh * 6.8);
  const costPerKmEv = Number((fullChargeCost / (estimatedRangeKm || 1)).toFixed(2));

  // Petrol cost per KM
  const costPerKmPetrol = Number((petrolPricePerLiter / petrolMileageKmPerLiter).toFixed(2));

  // Savings
  const monthlyKm = dailyCommuteKm * 30;
  const monthlyEvCost = Math.round(monthlyKm * costPerKmEv);
  const monthlyPetrolCost = Math.round(monthlyKm * costPerKmPetrol);
  const monthlySavings = Math.max(0, monthlyPetrolCost - monthlyEvCost);
  const annualSavings = monthlySavings * 12;

  return {
    fullChargeUnitsKwh: totalUnitsRequired,
    costPerFullChargeNpr: fullChargeCost,
    ratePerUnitNpr: unitRate,
    costPerKmEvNpr: costPerKmEv,
    costPerKmPetrolNpr: costPerKmPetrol,
    monthlySavingsNpr: monthlySavings,
    annualSavingsNpr: annualSavings,
  };
}

/**
 * Simulates major highway trip energy and charging stops
 */
export function simulateHighwayRoute(routeId: 'ktm_pkr' | 'ktm_cht' | 'ktm_sindhuli', batteryKwh: number) {
  const routes = {
    ktm_pkr: {
      name: 'Kathmandu to Pokhara (Prithvi Highway - 200 km)',
      distanceKm: 200,
      elevationGainM: 650,
      recommendedStops: ['Mugling Fast Charger (110 km)', 'Dumre Hub (140 km)'],
      estimatedKwhNeeded: 32,
    },
    ktm_cht: {
      name: 'Kathmandu to Chitwan / Narayangarh (148 km)',
      distanceKm: 148,
      elevationGainM: -900, // Descent from valley
      recommendedStops: ['Kurintar Cable Car DC Station (102 km)'],
      estimatedKwhNeeded: 22,
    },
    ktm_sindhuli: {
      name: 'Kathmandu to Sindhuli (BP Highway - 135 km)',
      distanceKm: 135,
      elevationGainM: 1100, // High mountainous winding curves
      recommendedStops: ['Dhulikhel DC Charger (32 km)', 'Khurkot Station (95 km)'],
      estimatedKwhNeeded: 26,
    },
  };

  const selected = routes[routeId] || routes.ktm_pkr;
  const canMakeWithoutStop = batteryKwh >= selected.estimatedKwhNeeded * 1.25;

  return {
    ...selected,
    canMakeWithoutStop,
    batteryRemainingPercent: Math.max(0, Math.round(((batteryKwh - selected.estimatedKwhNeeded) / batteryKwh) * 100)),
  };
}
