// Phone number lengths by ISO country code (local number, excluding country code)
// Source: ITU-T standards. Countries with variable lengths use [min, max].
const phoneLengths: Record<string, number | [number, number]> = {
  AD: 6, AE: 9, AF: 9, AG: 7, AL: 9, AM: 8, AO: 9, AR: [6, 8],
  AT: [4, 13], AU: 9, AZ: 9, BA: 8, BB: 7, BD: 10, BE: 9, BF: 8,
  BG: [7, 9], BH: 8, BI: 8, BJ: 8, BN: 7, BO: 8, BR: [10, 11], BS: 7,
  BT: 8, BW: 7, BY: 10, BZ: 7, CA: 10, CD: 9, CF: 8, CG: 9,
  CH: 9, CI: 10, CL: 9, CM: 9, CN: 11, CO: 10, CR: 8, CU: 8,
  CV: 7, CY: 8, CZ: 9, DE: [3, 12], DJ: 8, DK: 8, DM: 7, DO: 10,
  DZ: 9, EC: 9, EE: [7, 8], EG: 10, ER: 7, ES: 9, ET: 9, FI: [5, 12],
  FJ: 7, FR: 9, GA: 7, GB: 10, GD: 7, GE: 9, GH: 9, GM: 7,
  GN: 9, GQ: 9, GR: 10, GT: 8, GW: 9, GY: 7, HK: 8, HN: 8,
  HR: 9, HT: 8, HU: 9, ID: [9, 12], IE: [7, 9], IL: 9, IN: 10,
  IQ: 10, IR: 10, IS: 7, IT: [6, 11], JM: 7, JO: 9, JP: 10,
  KE: 10, KG: 9, KH: 9, KI: 8, KM: 7, KN: 7, KP: [6, 8], KR: [9, 11],
  KW: 8, KZ: 10, LA: 10, LB: [7, 8], LC: 7, LI: 7, LK: 9,
  LR: [7, 8], LS: 8, LT: 8, LU: [4, 12], LV: 8, LY: 10, MA: 9,
  MC: 8, MD: 8, ME: 8, MG: 10, MK: 8, ML: 8, MM: [7, 10], MN: 8,
  MO: 8, MR: 8, MT: 8, MU: 8, MV: 7, MW: 9, MX: 10, MY: [9, 10],
  MZ: 9, NA: 10, NE: 8, NG: 10, NI: 8, NL: 9, NO: 8, NP: 10,
  NR: 7, NZ: [8, 10], OM: 8, PA: 8, PE: 9, PG: 8, PH: 10, PK: 10,
  PL: 9, PT: 9, PW: 7, PY: 9, QA: 8, RO: 10, RS: [8, 9], RU: 10,
  RW: 9, SA: 9, SB: 7, SC: 7, SD: 9, SE: [7, 13], SG: 8, SI: 8,
  SK: 9, SL: 8, SM: 10, SN: 9, SO: [7, 8], SR: 7, SS: 9, ST: 7,
  SV: 8, SY: 9, SZ: 8, TD: 8, TG: 8, TH: 9, TJ: 9, TL: [7, 8],
  TM: 8, TN: 8, TO: 7, TR: 10, TT: 7, TV: 6, TW: 9, TZ: 9,
  UA: 9, UG: 9, US: 10, UY: 8, UZ: 9, VA: 10, VC: 7, VE: 10,
  VN: 9, VU: 7, WS: 7, XK: 8, YE: 9, ZA: 9, ZM: 9, ZW: 9,
};

export function getPhoneLength(isoCode: string): { min: number; max: number } {
  const len = phoneLengths[isoCode];
  if (!len) return { min: 4, max: 15 }; // ITU max is 15
  if (Array.isArray(len)) return { min: len[0], max: len[1] };
  return { min: len, max: len };
}
