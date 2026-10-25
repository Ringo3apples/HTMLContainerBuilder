import { renderAsync } from 'docx-preview';

/**
 * Word Document (.docx) Viewer Entrypoint
 * @param {Uint8Array} dataBytes - In-memory DOCX binary
 * @param {Object} context - Metadata
 */
export async function render(dataBytes, context) {
  const container = document.getElementById('viewer-root') || document.body;
  container.innerHTML = '';
  container.className = 'docx-viewport';

  // HUD
  const hud = document.createElement('div');
  hud.className = 'docx-hud';
  hud.innerHTML = `
    <div class="docx-hud-title"><span>📝</span><span>${context.fileName}</span></div>
    <div style="font-size:12px; color:#94a3b8;">Word 文書プレビュー (docx-preview)</div>
  `;
  container.appendChild(hud);

  // Document Container
  const docContainer = document.createElement('div');
  docContainer.className = 'docx-content-container';
  container.appendChild(docContainer);

  const loadingMsg = document.createElement('div');
  loadingMsg.style.cssText = 'color:#94a3b8; font-size:13px; margin:20px;';
  loadingMsg.textContent = 'Word 文書をパース・展開中...';
  docContainer.appendChild(loadingMsg);

  try {
    await renderAsync(dataBytes.buffer, docContainer, null, {
      className: 'docx',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      breakPages: true
    });
    loadingMsg.remove();
  } catch (err) {
    console.error('DOCX render error:', err);
    loadingMsg.innerHTML = `<span style="color:#f87171;">⚠️ DOCX展開エラー: ${err.message}</span>`;
  }
}
