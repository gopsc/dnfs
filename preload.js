const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('dnfsDesktop', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  }
});

function confineLegacyEffects() {
  const frames = document.querySelectorAll('body > iframe.sp-effect-frame');

  frames.forEach((frame) => {
    const source = frame.srcdoc || '';
    if (/<!--\s*fullscreen\s*-->/.test(source)) {
      frame.tabIndex = -1;
      frame.inert = true;
      return;
    }

    const card = Array.from(document.querySelectorAll('.recommend-list .card')).find((candidate) => {
      const code = candidate.querySelector('.sp-code');
      return code && code.textContent === source && !candidate.querySelector('.sp-effect-frame');
    });

    if (!card) {
      frame.remove();
      return;
    }

    frame.style.cssText = 'position:relative;display:block;width:100%;height:420px;border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;background:transparent;';
    const code = card.querySelector('.sp-code');
    const container = code && code.parentElement;
    if (container) container.appendChild(frame);
    const status = card.querySelector('.sp-run');
    if (status) status.textContent = '已载入';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const successAlertPatch = document.createElement('script');
  successAlertPatch.textContent = `
    (() => {
      const originalAlert = window.alert.bind(window);
      window.alert = (message) => {
        if (message === '添加节点成功' || message === '修改成功') return;
        originalAlert(message);
      };
    })();
  `;
  document.documentElement.appendChild(successAlertPatch);
  successAlertPatch.remove();

  const editorProtection = document.createElement('style');
  editorProtection.textContent = `
    .node-form {
      position: relative !important;
      z-index: 2147483647 !important;
      isolation: isolate !important;
      pointer-events: auto !important;
      visibility: visible !important;
    }
    .node-form::before,
    .node-form::after {
      pointer-events: none !important;
    }
    .node-form #input-note-title,
    .node-form #input-note-content,
    .node-form #sp-type,
    .node-form #sp-file,
    .node-form .form-actions button {
      position: relative !important;
      z-index: 1 !important;
      pointer-events: auto !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .node-form #input-note-title,
    .node-form #input-note-content {
      cursor: text !important;
      user-select: text !important;
      -webkit-user-select: text !important;
    }
    .node-form #input-note-title,
    .node-form:not(.dnfs-file-mode) #input-note-content {
      display: block !important;
    }
  `;
  document.head.appendChild(editorProtection);

  const restoreEditor = () => {
    const form = document.querySelector('.node-form');
    const type = document.getElementById('sp-type');
    const title = document.getElementById('input-note-title');
    const content = document.getElementById('input-note-content');
    if (!form || !title || !content) return;

    form.inert = false;
    form.classList.toggle('dnfs-file-mode', Boolean(type && type.value === 'file'));
    [title, content].forEach((field) => {
      field.disabled = false;
      field.readOnly = false;
      field.removeAttribute('inert');
    });
  };

  const type = document.getElementById('sp-type');
  if (type) type.addEventListener('change', restoreEditor);

  new MutationObserver((records) => {
    if (records.some((record) => Array.from(record.addedNodes).some((node) =>
      node.nodeType === Node.ELEMENT_NODE && node.classList.contains('sp-injected-style')
    ))) {
      document.head.appendChild(editorProtection);
    }
  }).observe(document.head, { childList: true });

  restoreEditor();
  confineLegacyEffects();
  new MutationObserver(() => {
    restoreEditor();
    confineLegacyEffects();
  }).observe(document.body, {
    childList: true,
    subtree: true
  });
});