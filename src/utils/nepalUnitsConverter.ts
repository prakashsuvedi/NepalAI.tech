/**
 * Nepal Traditional Land & Metric Measurement Calculation Engine
 * High-precision converter for official Land Revenue (मालपोत) and construction in Nepal.
 */

export interface LandUnitResult {
  sqFeet: number;
  sqMeters: number;
  // Hilly / Valley System (रोपनी-आना-पैसा-दाम)
  ropani: number;
  aana: number;
  paisa: number;
  daam: number;
  formattedRopaniSystem: string;
  formattedRopaniSystemNe: string;
  // Terai System (बिघा-कट्ठा-धुर)
  bigha: number;
  kattha: number;
  dhur: number;
  formattedTeraiSystem: string;
  formattedTeraiSystemNe: string;
}

const SQ_FEET_PER_ROPANI = 5476;
const SQ_FEET_PER_AANA = 342.25;
const SQ_FEET_PER_PAISA = 85.5625;
const SQ_FEET_PER_DAAM = 21.390625;

const SQ_FEET_PER_BIGHA = 72900;
const SQ_FEET_PER_KATTHA = 3645;
const SQ_FEET_PER_DHUR = 182.25;

const SQ_METERS_TO_SQ_FEET = 10.7639;

export function convertFromSqFeet(sqFeet: number): LandUnitResult {
  const cleanSqFt = Math.max(0, sqFeet);
  const sqMeters = cleanSqFt / SQ_METERS_TO_SQ_FEET;

  // 1. Ropani - Aana - Paisa - Daam calculation
  let remRopani = cleanSqFt;
  const ropani = Math.floor(remRopani / SQ_FEET_PER_ROPANI);
  remRopani %= SQ_FEET_PER_ROPANI;

  const aana = Math.floor(remRopani / SQ_FEET_PER_AANA);
  remRopani %= SQ_FEET_PER_AANA;

  const paisa = Math.floor(remRopani / SQ_FEET_PER_PAISA);
  remRopani %= SQ_FEET_PER_PAISA;

  const daam = Number((remRopani / SQ_FEET_PER_DAAM).toFixed(2));

  // 2. Bigha - Kattha - Dhur calculation
  let remBigha = cleanSqFt;
  const bigha = Math.floor(remBigha / SQ_FEET_PER_BIGHA);
  remBigha %= SQ_FEET_PER_BIGHA;

  const kattha = Math.floor(remBigha / SQ_FEET_PER_KATTHA);
  remBigha %= SQ_FEET_PER_KATTHA;

  const dhur = Number((remBigha / SQ_FEET_PER_DHUR).toFixed(2));

  const toNeNum = (n: number | string) => {
    const neNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return n.toString().split('').map(d => (d >= '0' && d <= '9' ? neNumerals[parseInt(d, 10)] : d)).join('');
  };

  return {
    sqFeet: Number(cleanSqFt.toFixed(2)),
    sqMeters: Number(sqMeters.toFixed(2)),
    ropani,
    aana,
    paisa,
    daam,
    formattedRopaniSystem: `${ropani}-${aana}-${paisa}-${daam} (Ropani-Aana-Paisa-Daam)`,
    formattedRopaniSystemNe: `${toNeNum(ropani)} रोपनी, ${toNeNum(aana)} आना, ${toNeNum(paisa)} पैसा, ${toNeNum(daam)} दाम`,
    bigha,
    kattha,
    dhur,
    formattedTeraiSystem: `${bigha}-${kattha}-${dhur} (Bigha-Kattha-Dhur)`,
    formattedTeraiSystemNe: `${toNeNum(bigha)} बिघा, ${toNeNum(kattha)} कट्ठा, ${toNeNum(dhur)} धुर`
  };
}

export function convertFromRopaniSystem(ropani: number, aana: number, paisa: number, daam: number): LandUnitResult {
  const totalSqFeet = 
    (ropani * SQ_FEET_PER_ROPANI) +
    (aana * SQ_FEET_PER_AANA) +
    (paisa * SQ_FEET_PER_PAISA) +
    (daam * SQ_FEET_PER_DAAM);
  return convertFromSqFeet(totalSqFeet);
}

export function convertFromBighaSystem(bigha: number, kattha: number, dhur: number): LandUnitResult {
  const totalSqFeet = 
    (bigha * SQ_FEET_PER_BIGHA) +
    (kattha * SQ_FEET_PER_KATTHA) +
    (dhur * SQ_FEET_PER_DHUR);
  return convertFromSqFeet(totalSqFeet);
}

// Traditional Weights & Volumes
export interface TraditionalWeightResult {
  kg: number;
  grams: number;
  dharni: number; // 1 Dharni = 2.5 KG
  pau: number;    // 1 Pau = 200 Grams
  tolaGold: number; // 1 Tola = 11.664 Grams
  formattedNe: string;
}

export function convertWeightKg(kg: number): TraditionalWeightResult {
  const cleanKg = Math.max(0, kg);
  const grams = cleanKg * 1000;
  const dharni = cleanKg / 2.5;
  const pau = grams / 200;
  const tolaGold = grams / 11.664;

  const toNeNum = (n: number | string) => {
    const neNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return n.toString().split('').map(d => (d >= '0' && d <= '9' ? neNumerals[parseInt(d, 10)] : d)).join('');
  };

  return {
    kg: cleanKg,
    grams,
    dharni: Number(dharni.toFixed(2)),
    pau: Number(pau.toFixed(1)),
    tolaGold: Number(tolaGold.toFixed(2)),
    formattedNe: `${toNeNum(cleanKg)} केजी = ${toNeNum(dharni.toFixed(2))} धार्नी (${toNeNum(pau.toFixed(1))} पाउ)`
  };
}
