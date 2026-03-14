'use strict';

/**
 * PAN Card Fraud Detection Service
 *
 * PAN Card format: AAAAA9999A
 *  - Characters 1-3: Series code (uppercase letters)
 *  - Character 4:    Taxpayer type (P/C/H/F/A/T/B/L/J/G)
 *  - Character 5:    First letter of the holder's surname (uppercase letter)
 *  - Characters 6-9: Sequential number (digits 0001–9999)
 *  - Character 10:   Alphabetic check digit (uppercase letter)
 */

const VALID_PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const TAXPAYER_TYPES = {
  P: 'Individual (Person)',
  C: 'Company',
  H: 'Hindu Undivided Family (HUF)',
  F: 'Firm / Partnership',
  A: 'Association of Persons (AOP)',
  T: 'Trust',
  B: 'Body of Individuals (BOI)',
  L: 'Local Authority',
  J: 'Artificial Juridical Person',
  G: 'Government',
};

/**
 * Known fraudulent PAN patterns – placeholder list.
 * In production this would come from a database or external feed.
 */
const KNOWN_FRAUDULENT_PANS = new Set([
  'AAAAA0000A',
  'AAAAA9999A',
  'ABCDE1234F',
  'PPPPP1111P',
]);

/**
 * Validates the structural format of a PAN card number.
 * @param {string} pan
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateFormat(pan) {
  const errors = [];

  if (!pan || typeof pan !== 'string') {
    return { valid: false, errors: ['PAN card number is required and must be a string.'] };
  }

  if (pan.length !== 10) {
    errors.push(`PAN must be exactly 10 characters long (got ${pan.length}).`);
  }

  if (!VALID_PAN_REGEX.test(pan)) {
    errors.push('PAN format must be AAAAA9999A (5 uppercase letters, 4 digits, 1 uppercase letter).');
  }

  if (pan.length === 10) {
    const fourthChar = pan[3];
    if (!Object.prototype.hasOwnProperty.call(TAXPAYER_TYPES, fourthChar)) {
      errors.push(
        `4th character "${fourthChar}" is not a valid taxpayer type. ` +
          `Valid types: ${Object.keys(TAXPAYER_TYPES).join(', ')}.`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Checks whether the sequential part (digits 6–9) looks suspicious.
 * Returns true if the digits are all identical (e.g. 0000, 1111, 9999).
 * @param {string} digits  4-character digit portion
 * @returns {boolean}
 */
function hasRepetitiveDigits(digits) {
  return new Set(digits.split('')).size === 1;
}

/**
 * Checks whether the letter portion (chars 1–5 and 10) looks suspicious.
 * Returns true if all 5 leading letters are identical (e.g. AAAAA).
 * @param {string} letterPrefix  First 5 characters
 * @returns {boolean}
 */
function hasRepetitiveLetters(letterPrefix) {
  return new Set(letterPrefix.split('')).size === 1;
}

/**
 * Checks whether the digits are in a simple ascending sequence
 * (e.g. 1234, 2345, 3456 …).
 * @param {string} digits
 * @returns {boolean}
 */
function hasSequentialDigits(digits) {
  for (let i = 0; i < digits.length - 1; i++) {
    if (parseInt(digits[i + 1]) - parseInt(digits[i]) !== 1) return false;
  }
  return true;
}

/**
 * Detects fraud indicators in a structurally valid PAN.
 * @param {string} pan  Normalised (uppercase, trimmed) PAN
 * @returns {{ indicators: string[], riskScore: number }}
 *   riskScore: 0 = low risk, 100 = confirmed fraud
 */
function detectFraudIndicators(pan) {
  const indicators = [];
  let riskScore = 0;

  const letterPrefix = pan.slice(0, 5);
  const digits = pan.slice(5, 9);

  // Known fraudulent PAN
  if (KNOWN_FRAUDULENT_PANS.has(pan)) {
    indicators.push('PAN is in the known fraudulent PAN database.');
    riskScore = 100;
    return { indicators, riskScore };
  }

  // Repetitive letters
  if (hasRepetitiveLetters(letterPrefix)) {
    indicators.push('First 5 characters are all identical – a common fake PAN pattern.');
    riskScore += 40;
  }

  // Repetitive digits
  if (hasRepetitiveDigits(digits)) {
    indicators.push('Sequential digits (6–9) are all identical – suspicious pattern.');
    riskScore += 30;
  }

  // Sequential digits
  if (hasSequentialDigits(digits)) {
    indicators.push('Sequential digits (6–9) form a simple ascending sequence.');
    riskScore += 20;
  }

  // Digits all zeros
  if (digits === '0000') {
    indicators.push('Sequential digits are 0000 – invalid PAN number range.');
    riskScore += 40;
  }

  // Cap at 99 for detected-but-not-confirmed fraud
  riskScore = Math.min(riskScore, 99);

  return { indicators, riskScore };
}

/**
 * Main fraud-detection function.
 * @param {string} pan        Raw PAN input from the user.
 * @param {string} [holderName]  Optional holder name for cross-validation.
 * @returns {object}  Detailed fraud detection result.
 */
function detectPanCardFraud(pan, holderName) {
  const normalized = typeof pan === 'string' ? pan.trim().toUpperCase() : '';

  // --- Step 1: Format validation ---
  const formatResult = validateFormat(normalized);
  if (!formatResult.valid) {
    return {
      pan: normalized,
      valid: false,
      fraudDetected: false,
      riskScore: 0,
      riskLevel: 'INVALID',
      taxpayerType: null,
      formatErrors: formatResult.errors,
      fraudIndicators: [],
      recommendation: 'Reject – PAN format is invalid.',
    };
  }

  // --- Step 2: Fraud indicator analysis ---
  const { indicators, riskScore } = detectFraudIndicators(normalized);

  // --- Step 3: Name cross-validation (optional) ---
  const nameWarnings = [];
  if (holderName && typeof holderName === 'string') {
    const nameParts = holderName.trim().toUpperCase().split(/\s+/);
    const surname = nameParts[nameParts.length - 1];
    if (surname && surname[0] !== normalized[4]) {
      nameWarnings.push(
        `5th character of PAN ("${normalized[4]}") does not match the ` +
          `first letter of the provided surname "${surname}".`
      );
    }
  }

  const allIndicators = [...indicators, ...nameWarnings];

  // Bump risk score slightly when a name mismatch is found, then derive all
  // derived fields from the single finalRiskScore to keep logic consistent.
  const finalRiskScore = nameWarnings.length > 0 ? Math.min(riskScore + 15, 99) : riskScore;

  let finalRiskLevel;
  if (finalRiskScore >= 100) {
    finalRiskLevel = 'CONFIRMED_FRAUD';
  } else if (finalRiskScore >= 60) {
    finalRiskLevel = 'HIGH';
  } else if (finalRiskScore >= 30) {
    finalRiskLevel = 'MEDIUM';
  } else {
    finalRiskLevel = 'LOW';
  }

  // A PAN is considered fraud-detected only when the risk score is high enough
  // to warrant action (≥ 60) or when it matches a confirmed-fraud entry (100).
  const fraudDetected = finalRiskScore >= 60;

  const recommendation =
    finalRiskScore >= 100
      ? 'Reject – PAN is confirmed fraudulent.'
      : finalRiskScore >= 60
        ? 'Flag for manual review – high fraud risk.'
        : finalRiskScore >= 30
          ? 'Proceed with caution – medium fraud risk.'
          : 'Likely genuine – low fraud risk.';

  return {
    pan: normalized,
    valid: true,
    fraudDetected,
    riskScore: finalRiskScore,
    riskLevel: finalRiskLevel,
    taxpayerType: TAXPAYER_TYPES[normalized[3]],
    formatErrors: [],
    fraudIndicators: allIndicators,
    recommendation,
  };
}

module.exports = {
  validateFormat,
  detectFraudIndicators,
  detectPanCardFraud,
  TAXPAYER_TYPES,
  KNOWN_FRAUDULENT_PANS,
};
