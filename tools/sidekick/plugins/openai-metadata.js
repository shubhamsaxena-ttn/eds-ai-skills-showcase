(function openAIMetadataPlugin() {
  const STORAGE_KEY = 'eds-openai-api-key';
  const OPENAI_MODEL = 'gpt-4o-mini';
  const METADATA_FIELDS = ['Title', 'Description', 'keywords'];

  function showToast(message, isError = false) {
    const existing = document.getElementById('eds-toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'eds-toast-notification';
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 1000000;
      background: ${isError ? '#ea4335' : '#0f9d58'}; color: #ffffff;
      padding: 12px 24px; border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: edsFadeInUp 0.3s ease-out;
    `;
    toast.textContent = message;

    if (!document.getElementById('eds-animation-styles')) {
      const style = document.createElement('div');
      style.id = 'eds-animation-styles';
      style.innerHTML = `<style>
        @keyframes edsFadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>`;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  function normalizeMetadataKey(value) {
    return value.trim().toLowerCase();
  }

  /**
   * Extracts visible main content for the OpenAI prompt, excluding metadata and chrome.
   * @returns {{ heading: string, bodyExcerpt: string, pageUrl: string }}
   */
  function extractPageContent() {
    const main = document.querySelector('main');
    if (!main) {
      return { heading: '', bodyExcerpt: '', pageUrl: window.location.href };
    }

    const clone = main.cloneNode(true);
    clone.querySelectorAll(
      '.metadata, .section-metadata, header, footer, nav, script, style, noscript',
    ).forEach((node) => node.remove());

    const heading = clone.querySelector('h1')?.textContent.trim()
      || document.querySelector('main h1')?.textContent.trim()
      || document.title.trim();

    const textParts = [];
    clone.querySelectorAll('h2, h3, h4, p, li').forEach((node) => {
      const text = node.textContent.replace(/\s+/g, ' ').trim();
      if (text.length > 0) textParts.push(text);
    });

    return {
      heading,
      bodyExcerpt: textParts.slice(0, 20).join('\n\n').slice(0, 4000),
      pageUrl: window.location.href,
    };
  }

  function findMetadataBlock() {
    return document.querySelector('main .metadata.block')
      || document.querySelector('main .metadata');
  }

  function getMetadataRows(metadataBlock) {
    const table = metadataBlock.querySelector(':scope > table');
    if (table) {
      return [...table.querySelectorAll('tr')].filter((row) => {
        const cells = row.querySelectorAll(':scope > td, :scope > th');
        if (cells.length < 2) return false;
        const headerCell = cells[0];
        return !headerCell.hasAttribute('colspan');
      });
    }

    return [...metadataBlock.children].filter((row) => {
      if (row.tagName !== 'DIV') return false;
      const cells = row.querySelectorAll(':scope > div');
      return cells.length >= 2;
    });
  }

  function getRowLabel(row) {
    if (row.tagName === 'TR') {
      return row.cells[0]?.textContent.trim() || '';
    }
    return row.querySelector(':scope > div')?.textContent.trim() || '';
  }

  function getRowValueCell(row) {
    if (row.tagName === 'TR') {
      return row.cells[1] || null;
    }
    const cells = row.querySelectorAll(':scope > div');
    return cells[1] || null;
  }

  function findMetadataRow(metadataBlock, fieldKey) {
    const targetKey = normalizeMetadataKey(fieldKey);
    return getMetadataRows(metadataBlock).find(
      (row) => normalizeMetadataKey(getRowLabel(row)) === targetKey,
    ) || null;
  }

  function setRowValue(valueCell, value) {
    valueCell.replaceChildren();
    valueCell.textContent = value;
  }

  function createMetadataRow(metadataBlock, fieldKey, value) {
    const row = document.createElement('div');
    const keyCell = document.createElement('div');
    const valueCell = document.createElement('div');
    keyCell.textContent = fieldKey;
    valueCell.textContent = value;
    row.append(keyCell, valueCell);
    metadataBlock.append(row);
  }

  /**
   * Updates Title, Description, and keywords rows in the metadata block.
   * Creates missing rows using the requested field labels.
   * @param {{ Title: string, Description: string, keywords: string }} metadata
   */
  function updateMetadataBlock(metadata) {
    const metadataBlock = findMetadataBlock();
    if (!metadataBlock) {
      throw new Error('No metadata block found on this page. Add a Metadata block to the page first.');
    }

    METADATA_FIELDS.forEach((fieldKey) => {
      const value = metadata[fieldKey];
      if (!value) return;

      const existingRow = findMetadataRow(metadataBlock, fieldKey);
      if (existingRow) {
        const valueCell = getRowValueCell(existingRow);
        if (!valueCell) return;
        setRowValue(valueCell, value);
        return;
      }

      createMetadataRow(metadataBlock, fieldKey, value);
    });
  }

  function getApiKey() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function saveApiKey(key) {
    if (key && key.trim().startsWith('sk-')) {
      localStorage.setItem(STORAGE_KEY, key.trim());
      return true;
    }
    return false;
  }

  function renderApiKeyModal(onSuccessCallback) {
    const backdropId = 'eds-api-key-backdrop';
    let backdrop = document.getElementById(backdropId);
    if (backdrop) backdrop.remove();

    backdrop = document.createElement('div');
    backdrop.id = backdropId;
    backdrop.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(4px);
      z-index: 999998; display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: #ffffff; border-radius: 16px; padding: 32px;
      width: 440px; max-width: 90%; box-shadow: 0 12px 36px rgba(0,0,0,0.2);
    `;

    dialog.innerHTML = `
      <h3 style="margin: 0 0 12px 0; font-size: 20px; color: #1e1e1e; font-weight: 600;">Configure OpenAI Key</h3>
      <p style="margin: 0 0 20px 0; font-size: 13px; color: #5f6368; line-height: 1.5;">
        Your key is stored locally in your browser and is sent directly to OpenAI.
      </p>
      <div style="margin-bottom: 24px;">
        <label for="eds-api-input" style="display: block; font-size: 12px; font-weight: 600; color: #3c4043; margin-bottom: 8px;">OPENAI API KEY</label>
        <input type="password" id="eds-api-input" placeholder="sk-..." style="width: 100%; padding: 10px 14px; border: 1px solid #dadce0; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;"/>
      </div>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="eds-api-cancel" style="background: transparent; border: 1px solid #dadce0; color: #3c4043; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Cancel</button>
        <button id="eds-api-save" style="background: #1a73e8; border: none; color: #ffffff; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Save Settings</button>
      </div>
    `;

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    const input = document.getElementById('eds-api-input');
    input.focus();

    document.getElementById('eds-api-cancel').onclick = () => backdrop.remove();
    document.getElementById('eds-api-save').onclick = () => {
      if (saveApiKey(input.value)) {
        backdrop.remove();
        showToast('OpenAI key updated successfully.');
        if (onSuccessCallback) onSuccessCallback();
      } else {
        showToast('Please enter a valid key starting with sk-.', true);
      }
    };
  }

  function parseMetadataResponse(raw) {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const metadata = {
      Title: (parsed.Title || parsed.title || '').trim(),
      Description: (parsed.Description || parsed.description || '').trim(),
      keywords: (parsed.keywords || parsed.Keywords || '').trim(),
    };

    const missing = METADATA_FIELDS.filter((field) => !metadata[field]);
    if (missing.length) {
      throw new Error(`OpenAI response missing required fields: ${missing.join(', ')}`);
    }

    return metadata;
  }

  async function callOpenAIMetadataAPI(apiKey, content) {
    const systemPrompt = `You are an SEO metadata assistant for Adobe Edge Delivery Services pages.
Analyze the provided page content and return a JSON object with exactly these three string fields:
{
  "Title": "SEO page title, max 60 characters",
  "Description": "Meta description, max 155 characters",
  "keywords": "4-6 comma-separated keywords relevant to the page"
}
Use the exact field names Title, Description, and keywords (lowercase k on keywords).
Return JSON only.`;

    const userPrompt = `Page URL: ${content.pageUrl}
Primary heading: ${content.heading || '(none detected)'}

Main content:
${content.bodyExcerpt || '(no body content detected)'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errPayload = await response.json().catch(() => ({}));
      throw new Error(errPayload.error?.message || `HTTP Status ${response.status}`);
    }

    const payload = await response.json();
    return parseMetadataResponse(payload.choices[0].message.content);
  }

  function renderResultsModal(metadata) {
    const backdropId = 'eds-results-backdrop';
    let backdrop = document.getElementById(backdropId);
    if (backdrop) backdrop.remove();

    backdrop = document.createElement('div');
    backdrop.id = backdropId;
    backdrop.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(4px);
      z-index: 999998; display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: #ffffff; border-radius: 16px; padding: 28px;
      width: 580px; max-width: 95%; box-shadow: 0 12px 36px rgba(0,0,0,0.2);
    `;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 18px; color: #1e1e1e; font-weight: 600;">Metadata Updated</h3>
        <button id="eds-results-settings" style="background: none; border: none; color: #5f6368; cursor: pointer;">Settings</button>
      </div>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #5f6368;">
        Title, Description, and keywords rows were updated in the page metadata block.
      </p>
      <div style="background: #f8f9fa; border: 1px solid #dadce0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.6;">
        <div style="margin-bottom: 12px;"><strong style="color: #3c4043; display: block;">Title</strong><span>${metadata.Title}</span></div>
        <div style="margin-bottom: 12px;"><strong style="color: #3c4043; display: block;">Description</strong><span>${metadata.Description}</span></div>
        <div><strong style="color: #3c4043; display: block;">keywords</strong><span>${metadata.keywords}</span></div>
      </div>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="eds-results-close" style="background: transparent; border: 1px solid #dadce0; color: #3c4043; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Close</button>
      </div>
    `;

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    document.getElementById('eds-results-close').onclick = () => backdrop.remove();
    document.getElementById('eds-results-settings').onclick = () => {
      renderApiKeyModal(() => backdrop.remove());
    };
  }

  async function handleMetadataGenerate() {
    const key = getApiKey();
    if (!key) {
      renderApiKeyModal(() => showToast('API key configured. Click "AI Metadata" again to run.'));
      return;
    }

    showToast('Generating metadata...');

    try {
      if (!findMetadataBlock()) {
        throw new Error('No metadata block found on this page. Add a Metadata block to the page first.');
      }

      const content = extractPageContent();
      if (!content.heading && !content.bodyExcerpt) {
        showToast('Limited page content detected. Results may be generic.', true);
      }

      const metadata = await callOpenAIMetadataAPI(key, content);
      updateMetadataBlock(metadata);
      renderResultsModal(metadata);
      showToast('Metadata block updated with AI-generated values.');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Metadata generation failed:', error);
      if (error.message && error.message.toLowerCase().includes('api key')) {
        showToast('Authentication failed. Please reset your API key.', true);
        renderApiKeyModal();
      } else {
        showToast(error.message || 'Metadata generation failed.', true);
      }
    }
  }

  const bindSidekickEvent = () => {
    const sidekick = document.querySelector('aem-sidekick, helix-sidekick');
    if (!sidekick || sidekick.dataset.edsOpenaiMetadataBound) return;

    sidekick.dataset.edsOpenaiMetadataBound = 'true';
    sidekick.addEventListener('custom:openai-metadata', handleMetadataGenerate);
  };

  if (document.querySelector('aem-sidekick, helix-sidekick')) {
    bindSidekickEvent();
  } else {
    document.addEventListener('sidekick-ready', bindSidekickEvent, { once: true });
  }
}());
