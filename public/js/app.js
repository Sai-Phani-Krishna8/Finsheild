/* FinShield – PAN Card Fraud Detection  |  public/js/app.js */
'use strict';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function setLoading(form, loading) {
  const btn     = form.querySelector('[type="submit"]');
  const btnText = btn.querySelector('.btn__text');
  const spinner = btn.querySelector('.btn__spinner');

  btn.disabled       = loading;
  btnText.textContent = loading ? 'Analysing…' : btn.dataset.label || btnText.textContent;
  spinner.hidden     = !loading;
}

function riskClass(riskLevel) {
  return (riskLevel || '').toLowerCase().replace('_', '-');
}

function riskIcon(riskLevel) {
  const icons = {
    'confirmed_fraud': '🚨',
    'high':            '⚠️',
    'medium':          '🔶',
    'low':             '✅',
    'invalid':         '❌',
  };
  return icons[(riskLevel || '').toLowerCase()] || 'ℹ️';
}

function riskLabel(riskLevel) {
  const labels = {
    'confirmed_fraud': 'Confirmed Fraud',
    'high':            'High Risk',
    'medium':          'Medium Risk',
    'low':             'Low Risk',
    'invalid':         'Invalid Format',
  };
  return labels[(riskLevel || '').toLowerCase()] || riskLevel;
}

/* ── Result renderer ─────────────────────────────────────────────────────── */
function renderSingleResult(data, container) {
  const rc = riskClass(data.riskLevel);

  let indicatorsHtml = '';
  if (data.fraudIndicators && data.fraudIndicators.length > 0) {
    const items = data.fraudIndicators.map(i => `<li>${escapeHtml(i)}</li>`).join('');
    indicatorsHtml = `
      <div class="result__indicators">
        <p class="result__indicators-title">⚠ Fraud Indicators Detected</p>
        <ul>${items}</ul>
      </div>`;
  }

  let formatErrorsHtml = '';
  if (data.formatErrors && data.formatErrors.length > 0) {
    const items = data.formatErrors.map(e => `<li>${escapeHtml(e)}</li>`).join('');
    formatErrorsHtml = `
      <div class="result__indicators">
        <p class="result__indicators-title">Format Errors</p>
        <ul>${items}</ul>
      </div>`;
  }

  container.className  = `result result--${rc}`;
  container.innerHTML  = `
    <div class="result__header">
      <span>${riskIcon(data.riskLevel)}</span>
      <span>${riskLabel(data.riskLevel)}</span>
      <span class="badge badge--${rc}">${escapeHtml(data.riskLevel || 'N/A')}</span>
    </div>
    <div class="result__body">
      <div class="result__pan">${escapeHtml(data.pan || '')}</div>

      <div class="result__grid">
        <div class="result__item">
          <span class="result__item-label">Valid Format</span>
          <span class="result__item-value">${data.valid ? '✅ Yes' : '❌ No'}</span>
        </div>
        <div class="result__item">
          <span class="result__item-label">Fraud Detected</span>
          <span class="result__item-value">${data.fraudDetected ? '🚨 Yes' : '✅ No'}</span>
        </div>
        <div class="result__item">
          <span class="result__item-label">Risk Score</span>
          <span class="result__item-value">${data.riskScore != null ? data.riskScore + ' / 100' : 'N/A'}</span>
        </div>
        <div class="result__item">
          <span class="result__item-label">Taxpayer Type</span>
          <span class="result__item-value">${escapeHtml(data.taxpayerType || 'N/A')}</span>
        </div>
      </div>

      <div class="risk-bar-wrap">
        <div class="risk-bar-label">Risk Score</div>
        <div class="risk-bar-track">
          <div class="risk-bar-fill risk-bar-fill--${rc}"
               style="width: ${data.riskScore != null ? data.riskScore : 0}%"></div>
        </div>
      </div>

      ${indicatorsHtml}
      ${formatErrorsHtml}

      <div class="result__recommendation">
        💡 ${escapeHtml(data.recommendation || '')}
      </div>
    </div>`;

  container.hidden = false;
}

/* ── Bulk result renderer ────────────────────────────────────────────────── */
function renderBulkResult(dataArr, container) {
  const rows = dataArr.map((d, i) => {
    const rc = riskClass(d.riskLevel);
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(d.pan || '')}</td>
        <td>${d.valid ? '✅' : '❌'}</td>
        <td>${d.fraudDetected ? '🚨 Yes' : '✅ No'}</td>
        <td><span class="badge badge--${rc}">${escapeHtml(d.riskLevel || '')}</span></td>
        <td>${d.riskScore != null ? d.riskScore : 'N/A'}</td>
        <td>${escapeHtml(d.taxpayerType || 'N/A')}</td>
      </tr>`;
  }).join('');

  const fraudCount = dataArr.filter(d => d.fraudDetected).length;

  container.className = 'result';
  container.innerHTML = `
    <div class="result__header" style="background:var(--clr-bg); border-bottom:1px solid var(--clr-border);">
      <span>📊</span>
      <span>Bulk Analysis Complete – ${dataArr.length} PANs processed, <strong>${fraudCount}</strong> flagged</span>
    </div>
    <div class="result__body">
      <div class="bulk-table-wrap">
        <table class="bulk-table">
          <thead>
            <tr>
              <th>#</th>
              <th>PAN</th>
              <th>Valid</th>
              <th>Fraud?</th>
              <th>Risk Level</th>
              <th>Score</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;

  container.hidden = false;
}

/* ── XSS protection ──────────────────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Single form ─────────────────────────────────────────────────────────── */
const singleForm   = $('#single-form');
const singleResult = $('#single-result');

singleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pan        = $('#pan-input').value.trim().toUpperCase();
  const holderName = $('#name-input').value.trim();

  if (!pan) {
    showError(singleResult, 'Please enter a PAN card number.');
    return;
  }

  setLoading(singleForm, true);
  singleResult.hidden = true;

  try {
    const res  = await fetch('/api/pan/verify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ pan, holderName: holderName || undefined }),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      showError(singleResult, json.error || 'Verification failed. Please try again.');
      return;
    }

    renderSingleResult(json.data, singleResult);
  } catch {
    showError(singleResult, 'Network error – please check your connection and try again.');
  } finally {
    setLoading(singleForm, false);
  }
});

/* ── Bulk form ───────────────────────────────────────────────────────────── */
const bulkForm   = $('#bulk-form');
const bulkResult = $('#bulk-result');

bulkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = $('#bulk-input').value.trim();

  if (!raw) {
    showError(bulkResult, 'Please enter at least one PAN card number.');
    return;
  }

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const pans  = lines.map(line => {
    const [panPart, ...nameParts] = line.split(',');
    const pan        = (panPart || '').trim().toUpperCase();
    const holderName = nameParts.join(',').trim();
    return holderName ? { pan, holderName } : pan;
  });

  if (pans.length > 100) {
    showError(bulkResult, 'Bulk verification is limited to 100 PAN numbers per request.');
    return;
  }

  setLoading(bulkForm, true);
  bulkResult.hidden = true;

  try {
    const res  = await fetch('/api/pan/bulk-verify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ pans }),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      showError(bulkResult, json.error || 'Bulk verification failed. Please try again.');
      return;
    }

    renderBulkResult(json.data, bulkResult);
  } catch {
    showError(bulkResult, 'Network error – please check your connection and try again.');
  } finally {
    setLoading(bulkForm, false);
  }
});

/* ── Error helper ────────────────────────────────────────────────────────── */
function showError(container, message) {
  container.className  = 'result';
  container.innerHTML  = `<div class="error-msg">❌ ${escapeHtml(message)}</div>`;
  container.hidden     = false;
}

/* ── Load taxpayer types ─────────────────────────────────────────────────── */
async function loadTaxpayerTypes() {
  const grid = $('#taxpayer-types');
  if (!grid) return;

  try {
    const res  = await fetch('/api/pan/taxpayer-types');
    const json = await res.json();

    if (!json.success) return;

    grid.innerHTML = json.data
      .map(t => `
        <div class="type-item">
          <span class="type-code">${escapeHtml(t.code)}</span>
          <span>${escapeHtml(t.description)}</span>
        </div>`)
      .join('');
  } catch {
    /* silently ignore – not critical */
  }
}

loadTaxpayerTypes();
