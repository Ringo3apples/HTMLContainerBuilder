/**
 * Generic Raw Binary Extractor Entrypoint
 * @param {Uint8Array} dataBytes - In-memory binary data
 * @param {Object} context - Metadata
 */
export async function render(dataBytes, context) {
  const container = document.getElementById('viewer-root') || document.body;
  container.innerHTML = '';
  container.className = 'raw-viewport';

  container.innerHTML = `
    <div class="raw-card">
      <div class="raw-icon">📦</div>
      <h2 class="raw-title">${escapeHtml(context.fileName)}</h2>
      <p class="raw-meta">ファイルサイズ: ${(dataBytes.byteLength / 1024).toFixed(1)} KB</p>
      <button id="btn-save-payload" class="raw-save-btn">
        💾 元データを取り出して保存
      </button>
    </div>
  `;

  document.getElementById('btn-save-payload').onclick = () => {
    const blob = new Blob([dataBytes]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = context.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
