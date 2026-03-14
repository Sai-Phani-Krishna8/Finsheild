# FinShield – PAN Card Fraud Detection

A lightweight Node.js + Express web application that validates Indian PAN card numbers and detects potential fraud using rule-based risk analysis.

---

## Features

- **Format validation** – enforces the `AAAAA9999A` PAN structure (5 letters · 4 digits · 1 letter)
- **Taxpayer type check** – verifies the 4th character is a valid CBDT type code (P / C / H / F / A / T / B / L / J / G)
- **Fraud pattern detection** – flags repetitive letters/digits, sequential digit runs, all-zero sequences, and known fraudulent PAN numbers
- **Name cross-validation** – optionally cross-checks the 5th character against the holder's surname initial
- **Risk scoring** – assigns a 0–100 risk score and classifies results as LOW / MEDIUM / HIGH / CONFIRMED_FRAUD
- **Bulk verification** – analyse up to 100 PAN numbers in a single API call
- **Clean web UI** – single-page interface with live results, a risk-score bar, and a format guide

---

## Project Structure

```
Finsheild/
├── src/
│   ├── app.js                     # Express app (middleware + routes)
│   ├── server.js                  # HTTP server entry point
│   ├── routes/
│   │   └── pancard.js             # API route handlers
│   ├── services/
│   │   └── fraudDetection.js      # Core fraud-detection logic
│   └── middleware/
│       └── validation.js          # Request validation middleware
├── public/
│   ├── index.html                 # Web UI
│   ├── css/styles.css
│   └── js/app.js
├── tests/
│   ├── fraudDetection.test.js     # Unit tests (service layer)
│   └── api.test.js                # Integration tests (HTTP layer)
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
git clone https://github.com/Sai-Phani-Krishna8/Finsheild.git
cd Finsheild
npm install
```

### Running the server

```bash
npm start          # production
npm run dev        # development (auto-restarts on file changes, Node 18+)
```

Open <http://localhost:3000> in your browser.

### Running tests

```bash
npm test
```

---

## API Reference

### `POST /api/pan/verify`

Verify a single PAN card.

**Request body**

```json
{
  "pan": "ABCPE7391K",
  "holderName": "Rajesh Kumar"   // optional
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "pan": "ABCPE7391K",
    "valid": true,
    "fraudDetected": false,
    "riskScore": 0,
    "riskLevel": "LOW",
    "taxpayerType": "Individual (Person)",
    "formatErrors": [],
    "fraudIndicators": [],
    "recommendation": "Likely genuine – low fraud risk."
  }
}
```

---

### `POST /api/pan/bulk-verify`

Verify up to 100 PAN numbers in one request.

**Request body**

```json
{
  "pans": [
    "ABCPE7391K",
    { "pan": "XYZPK5432M", "holderName": "Priya Kumar" }
  ]
}
```

**Response** – array of the same result objects as single verify.

---

### `GET /api/pan/validate/:pan`

Quick format-only validation (no fraud analysis).

---

### `GET /api/pan/taxpayer-types`

Returns all valid taxpayer type codes and their descriptions.

---

### `GET /api/health`

Health-check endpoint.

---

## PAN Card Format

```
 A  B  C  P  E  7  3  9  1  K
 ──────  ─  ─  ────────  ─
  1–3    4  5    6–9      10
Series  Type Sur  Seq   Check
```

| Position | Content | Example |
|----------|---------|---------|
| 1–3 | Series code (any letters) | `ABC` |
| 4 | Taxpayer type | `P` = Individual |
| 5 | First letter of surname | `E` |
| 6–9 | Sequential number (0001–9999) | `7391` |
| 10 | Alphabetic check digit | `K` |

### Taxpayer Type Codes

| Code | Type |
|------|------|
| P | Individual (Person) |
| C | Company |
| H | Hindu Undivided Family (HUF) |
| F | Firm / Partnership |
| A | Association of Persons (AOP) |
| T | Trust |
| B | Body of Individuals (BOI) |
| L | Local Authority |
| J | Artificial Juridical Person |
| G | Government |

---

## Fraud Detection Rules

| Rule | Risk Added |
|------|-----------|
| PAN found in known-fraud database | 100 (confirmed) |
| All 5 leading letters identical (e.g. `AAAAA…`) | +40 |
| All 4 sequential digits identical (e.g. `…1111…`) | +30 |
| Sequential digits form ascending run (e.g. `…1234…`) | +20 |
| Sequential digits are `0000` | +40 |
| Surname initial ≠ 5th PAN character | +15 |

Risk scores above 99 are capped at 100 (confirmed fraud). Scores are capped at 99 for pattern-detected fraud.

---

## License

ISC
