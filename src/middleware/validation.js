'use strict';

/**
 * Express middleware for validating PAN card API request bodies.
 */

function validatePanRequest(req, res, next) {
  const { pan } = req.body;

  if (!pan) {
    return res.status(400).json({
      success: false,
      error: 'PAN card number is required in the request body.',
    });
  }

  if (typeof pan !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'PAN card number must be a string.',
    });
  }

  if (pan.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'PAN card number cannot be empty.',
    });
  }

  next();
}

function validateBulkPanRequest(req, res, next) {
  const { pans } = req.body;

  if (!pans) {
    return res.status(400).json({
      success: false,
      error: 'An array of PAN card numbers is required under the "pans" key.',
    });
  }

  if (!Array.isArray(pans)) {
    return res.status(400).json({
      success: false,
      error: '"pans" must be an array.',
    });
  }

  if (pans.length === 0) {
    return res.status(400).json({
      success: false,
      error: '"pans" array must not be empty.',
    });
  }

  if (pans.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Bulk verification is limited to 100 PAN numbers per request.',
    });
  }

  next();
}

module.exports = { validatePanRequest, validateBulkPanRequest };
