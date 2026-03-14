'use strict';

const {
  validateFormat,
  detectFraudIndicators,
  detectPanCardFraud,
  TAXPAYER_TYPES,
} = require('../src/services/fraudDetection');

/* ── validateFormat ─────────────────────────────────────────────────────── */
describe('validateFormat', () => {
  test('accepts a valid individual PAN', () => {
    const result = validateFormat('ABCPE1234F');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('accepts all valid taxpayer type codes', () => {
    const types = Object.keys(TAXPAYER_TYPES); // P C H F A T B L J G
    types.forEach(type => {
      const pan = `ABC${type}E1234F`;
      const result = validateFormat(pan);
      expect(result.valid).toBe(true);
    });
  });

  test('rejects an empty string', () => {
    const result = validateFormat('');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('rejects a non-string value', () => {
    const result = validateFormat(null);
    expect(result.valid).toBe(false);
  });

  test('rejects PAN shorter than 10 characters', () => {
    const result = validateFormat('ABCPE123');
    expect(result.valid).toBe(false);
  });

  test('rejects PAN longer than 10 characters', () => {
    const result = validateFormat('ABCPE1234FX');
    expect(result.valid).toBe(false);
  });

  test('rejects lowercase PAN (wrong format)', () => {
    const result = validateFormat('abcpe1234f');
    expect(result.valid).toBe(false);
  });

  test('rejects PAN with invalid taxpayer type character', () => {
    // 4th char 'X' is not a valid taxpayer type
    const result = validateFormat('ABCXE1234F');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('taxpayer type'))).toBe(true);
  });

  test('rejects PAN where letters and digits are transposed', () => {
    const result = validateFormat('1234ABCDEF');
    expect(result.valid).toBe(false);
  });

  test('is case-sensitive and rejects lowercase input', () => {
    // validateFormat expects normalised uppercase input; lowercase fails the regex
    const raw = validateFormat('abcpe1234f');
    expect(raw.valid).toBe(false);
  });
});

/* ── detectFraudIndicators ──────────────────────────────────────────────── */
describe('detectFraudIndicators', () => {
  test('returns no indicators for a genuine-looking PAN', () => {
    const { indicators, riskScore } = detectFraudIndicators('ABCPE7391F');
    expect(indicators).toHaveLength(0);
    expect(riskScore).toBe(0);
  });

  test('flags a known fraudulent PAN with score 100', () => {
    const { indicators, riskScore } = detectFraudIndicators('AAAAA0000A');
    expect(riskScore).toBe(100);
    expect(indicators.some(i => i.toLowerCase().includes('known fraudulent'))).toBe(true);
  });

  test('flags repetitive letters in prefix', () => {
    const { indicators } = detectFraudIndicators('AAAAPE1234F');
    // Not all 5 letters identical here – only the first 5 need to be same
    const result = detectFraudIndicators('AAAAAP1234F');
    expect(result.indicators.some(i => i.toLowerCase().includes('identical'))).toBe(true);
  });

  test('flags repetitive digits (e.g. 1111)', () => {
    const { indicators } = detectFraudIndicators('ABCPE1111F');
    expect(indicators.some(i => i.toLowerCase().includes('identical'))).toBe(true);
  });

  test('flags sequential digits (e.g. 1234)', () => {
    const { indicators } = detectFraudIndicators('ABCPE1234F');
    expect(indicators.some(i => i.toLowerCase().includes('ascending'))).toBe(true);
  });

  test('flags all-zero digits (0000)', () => {
    const { indicators } = detectFraudIndicators('ABCPE0000F');
    expect(indicators.some(i => i.toLowerCase().includes('0000'))).toBe(true);
  });

  test('risk score is capped at 99 for detected (not confirmed) fraud', () => {
    // AAAAAP1111F would trigger multiple flags
    const { riskScore } = detectFraudIndicators('AAAAAP1111F');
    expect(riskScore).toBeLessThanOrEqual(99);
  });
});

/* ── detectPanCardFraud ─────────────────────────────────────────────────── */
describe('detectPanCardFraud', () => {
  test('returns INVALID for a badly formatted PAN', () => {
    const result = detectPanCardFraud('BAD');
    expect(result.valid).toBe(false);
    expect(result.riskLevel).toBe('INVALID');
    expect(result.taxpayerType).toBeNull();
  });

  test('returns LOW risk for a clean PAN with no indicators', () => {
    const result = detectPanCardFraud('ABCPE7391K');
    expect(result.valid).toBe(true);
    expect(result.riskLevel).toBe('LOW');
    expect(result.fraudDetected).toBe(false);
  });

  test('normalises lowercase input before processing', () => {
    const result = detectPanCardFraud('abcpe5678k');
    // After normalisation ABCPE5678K is valid
    expect(result.valid).toBe(true);
  });

  test('returns taxpayer type for valid PAN', () => {
    const result = detectPanCardFraud('ABCPE5678K');
    expect(result.taxpayerType).toBe('Individual (Person)');
  });

  test('returns CONFIRMED_FRAUD for a known fraudulent PAN', () => {
    const result = detectPanCardFraud('AAAAA0000A');
    expect(result.riskLevel).toBe('CONFIRMED_FRAUD');
    expect(result.riskScore).toBe(100);
    expect(result.fraudDetected).toBe(true);
  });

  test('adds name mismatch warning when surname initial does not match 5th char', () => {
    // PAN 5th char = P, but surname starts with K
    const result = detectPanCardFraud('ABCPP5678K', 'Rajesh Kumar');
    // 5th char is P, surname Kumar starts with K → mismatch
    expect(result.fraudIndicators.some(i => i.toLowerCase().includes('surname'))).toBe(true);
  });

  test('does NOT add name mismatch warning when surname matches 5th char', () => {
    // PAN 5th char = K (ABCPK...), holder surname = Kumar (K)
    const result = detectPanCardFraud('ABCPK5678K', 'Rajesh Kumar');
    expect(result.fraudIndicators.filter(i => i.toLowerCase().includes('surname'))).toHaveLength(0);
  });

  test('recommendation is set for each risk level', () => {
    const low     = detectPanCardFraud('ABCPE5678K');
    const invalid = detectPanCardFraud('INVALID');
    expect(low.recommendation).toBeTruthy();
    expect(invalid.recommendation).toBeTruthy();
  });

  test('formatErrors is empty for valid PAN', () => {
    const result = detectPanCardFraud('ABCPE5678K');
    expect(result.formatErrors).toHaveLength(0);
  });

  test('formatErrors is populated for invalid PAN', () => {
    const result = detectPanCardFraud('TOOSHORT');
    expect(result.formatErrors.length).toBeGreaterThan(0);
  });
});
