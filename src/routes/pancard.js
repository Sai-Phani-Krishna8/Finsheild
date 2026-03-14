'use strict';

const express = require('express');
const router = express.Router();
const { validatePanRequest, validateBulkPanRequest } = require('../middleware/validation');
const { detectPanCardFraud, validateFormat, TAXPAYER_TYPES } = require('../services/fraudDetection');

/**
 * POST /api/pan/verify
 * Verify a single PAN card for fraud.
 * Body: { pan: string, holderName?: string }
 */
router.post('/verify', validatePanRequest, (req, res) => {
  const { pan, holderName } = req.body;

  try {
    const result = detectPanCardFraud(pan, holderName);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error during fraud detection.' });
  }
});

/**
 * POST /api/pan/bulk-verify
 * Verify multiple PAN cards in a single request.
 * Body: { pans: Array<{ pan: string, holderName?: string }> }
 */
router.post('/bulk-verify', validateBulkPanRequest, (req, res) => {
  const { pans } = req.body;

  try {
    const results = pans.map((entry) => {
      if (typeof entry === 'string') {
        return detectPanCardFraud(entry);
      }
      return detectPanCardFraud(entry.pan, entry.holderName);
    });
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error during bulk fraud detection.' });
  }
});

/**
 * GET /api/pan/validate/:pan
 * Quick format-validation check for a PAN (no fraud analysis).
 */
router.get('/validate/:pan', (req, res) => {
  const pan = req.params.pan.trim().toUpperCase();

  try {
    const result = validateFormat(pan);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error during format validation.' });
  }
});

/**
 * GET /api/pan/taxpayer-types
 * Returns the list of valid taxpayer type codes and their descriptions.
 */
router.get('/taxpayer-types', (_req, res) => {
  const types = Object.entries(TAXPAYER_TYPES).map(([code, description]) => ({ code, description }));
  return res.status(200).json({ success: true, data: types });
});

module.exports = router;
