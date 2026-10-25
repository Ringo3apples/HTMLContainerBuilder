/**
 * Table & Text Viewer Entrypoint
 * @param {Uint8Array} dataBytes - In-memory text/CSV binary
 * @param {Object} context - Metadata
 */
export async function render(dataBytes, context) {
  const container = document.getElementById('viewer-root') || document.body;
  container.innerHTML = '';
  container.className = 'table-viewport';

  const ext = (context.fileName || '').split('.').pop().toLowerCase();
  const text = new TextDecoder('utf-8').decode(dataBytes);

  if (ext === 'csv' || ext === 'tsv') {
    const delimiter = ext === 'tsv' ? '\t' : ',';
    const lines = text.trim().split(/\r?\n/).map(l => l.split(delimiter));
    const header = lines[0] || [];
    const rows = lines.slice(1);

    container.innerHTML = `
      <div class="table-header-bar">
        <h2 class="table-title">📄 ${context.fileName} (${rows.length} 件のレコード)</h2>
      </div>
      <div class="table-scroll-container">
        <table class="data-table">
          <thead>
            <tr>
              ${header.map(h => `<th>${escapeHtml(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                ${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // JSON or plain text
    let display = text;
    if (ext === 'json') {
      try {
        const obj = JSON.parse(text);
        display = JSON.stringify(obj, null, 2);
      } catch (e) {}
    }

    container.innerHTML = `
      <div class="table-header-bar">
        <h2 class="table-title">📄 ${context.fileName} (${(dataBytes.byteLength / 1024).toFixed(1)} KB)</h2>
      </div>
      <div class="table-scroll-container">
        <pre class="text-viewer-pre">${escapeHtml(display)}</pre>
      </div>
    `;
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
