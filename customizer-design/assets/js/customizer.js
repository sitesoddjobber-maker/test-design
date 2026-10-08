(function () {
  const root = document.querySelector('[data-cz]');
  if (!root) return;

  const PARTS = window.OBAG_PARTS || {};
  const PART_KEYS = ['body', 'handle', 'organizer', 'strap'];
  const LABELS = { body: '本体', handle: 'ハンドル', organizer: 'オーガナイザー', strap: 'ストラップ' };
  const MIN_REQUIRED = 2;

  const BASE_PRICE = 18000;
  const ADD_ON = { handle: 2500, organizer: 3800, strap: 3200 };

  const state = { body: null, handle: null, organizer: null, strap: null };
  const itemMap = {};
  PART_KEYS.forEach((g) => {
    itemMap[g] = {};
    ((PARTS[g] && PARTS[g].items) || []).forEach((it) => { itemMap[g][it.id] = it; });
  });

  const LAYER_MAP = {
    body:      [{ selector: '[data-layer="body.z10"]',      key: 'z10' }],
    handle:    [{ selector: '[data-layer="handle.back"]',   key: 'back' },
                { selector: '[data-layer="handle.front"]',  key: 'front' }],
    organizer: [{ selector: '[data-layer="organizer.z14"]', key: 'z14' }],
    strap:     [{ selector: '[data-layer="strap.z12"]',     key: 'z12' },
                { selector: '[data-layer="strap.z16"]',     key: 'z16' }],
  };

  function escape(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function buildGrid(group) {
    const container = root.querySelector(`[data-cz-grid="${group}"]`);
    if (!container) return;
    const items = (PARTS[group] && PARTS[group].items) || [];
    container.innerHTML = items.map((it) => `
      <button type="button" class="cz__sw" data-group="${group}" data-id="${it.id}" title="${escape(it.name)}">
        <span class="cz__sw-img"><img src="${it.main}" alt="${escape(it.name)}" loading="lazy"></span>
        <span class="cz__sw-name">${escape(it.name)}</span>
      </button>`).join('');
  }
  PART_KEYS.forEach(buildGrid);

  function renderStage() {
    PART_KEYS.forEach((g) => {
      const item = state[g] ? itemMap[g][state[g]] : null;
      LAYER_MAP[g].forEach((m) => {
        const el = root.querySelector(m.selector);
        if (!el) return;
        if (item && item.config && item.config[m.key]) {
          if (el.getAttribute('src') !== item.config[m.key]) el.src = item.config[m.key];
          el.classList.add('is-visible');
        } else {
          el.classList.remove('is-visible');
        }
      });
    });
    root.classList.toggle('is-empty', !state.body);
  }

  function chosenCount() {
    return PART_KEYS.filter((k) => state[k]).length;
  }

  function totalYen() {
    let total = BASE_PRICE;
    PART_KEYS.forEach((k) => {
      if (k === 'body') return;
      if (state[k] && ADD_ON[k]) total += ADD_ON[k];
    });
    return total;
  }

  function yen(n) { return '¥' + Math.round(n).toLocaleString('ja-JP'); }

  function animatePrice(target) {
    const el = root.querySelector('[data-cz-price]');
    if (!el) return;
    const current = parseInt(el.dataset.value || String(BASE_PRICE), 10);
    if (current === target) { el.textContent = yen(target); return; }
    const duration = 320;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(current + (target - current) * eased);
      el.textContent = yen(v);
      if (t < 1) requestAnimationFrame(step);
      else el.dataset.value = String(target);
    };
    requestAnimationFrame(step);
  }

  function renderUI() {
    root.querySelectorAll('[data-group][data-id]').forEach((el) => {
      el.classList.toggle('is-selected', state[el.dataset.group] === el.dataset.id);
    });

    root.querySelectorAll('[data-cz-tab]').forEach((tab) => {
      const idx = parseInt(tab.dataset.czTab, 10);
      const key = PART_KEYS[idx];
      if (key) tab.classList.toggle('is-done', !!state[key]);
    });

    PART_KEYS.forEach((k) => {
      const el = root.querySelector(`[data-cz-summary="${k}"]`);
      if (!el) return;
      if (state[k]) {
        const item = itemMap[k][state[k]];
        el.textContent = item ? item.name : '';
        el.classList.remove('is-empty');
      } else {
        el.textContent = '未選択';
        el.classList.add('is-empty');
      }
    });

    const cn = root.querySelector('[data-cz-caption-name]');
    const cc = root.querySelector('[data-cz-caption-code]');
    if (cn) {
      cn.textContent = state.body && itemMap.body[state.body]
        ? `O bag · ${itemMap.body[state.body].name}`
        : 'Your O bag';
    }
    if (cc) {
      cc.textContent = 'OB-2026 ' + PART_KEYS.map((k) => state[k] ? `· ${state[k]}` : '· —').join(' ');
    }

    const today = new Date();
    const start = new Date(today); start.setDate(today.getDate() + 11);
    const end = new Date(today); end.setDate(today.getDate() + 18);
    const fmtD = (d) => `${d.getMonth() + 1}月${d.getDate()}日`;
    const deliveryEl = root.querySelector('[data-cz-delivery]');
    if (deliveryEl) deliveryEl.textContent = `${fmtD(start)} — ${fmtD(end)}`;

    const remaining = Math.max(0, MIN_REQUIRED - chosenCount());
    const statusEl = root.querySelector('[data-cz-status]');
    if (statusEl) {
      if (remaining > 0) {
        statusEl.textContent = `構成を完了するには、あと ${remaining} 要素を選択してください`;
        statusEl.classList.remove('is-complete');
      } else {
        statusEl.textContent = '構成完成 — カートに追加できます';
        statusEl.classList.add('is-complete');
      }
    }

    animatePrice(totalYen());

    const btnAdd = root.querySelector('[data-cz-add]');
    const ctaLabel = root.querySelector('[data-cz-cta-label]');
    if (btnAdd) btnAdd.disabled = !state.body || chosenCount() < MIN_REQUIRED;
    if (ctaLabel) ctaLabel.textContent = `カートに追加 — ${yen(totalYen())}`;
  }

  function activateTab(idx) {
    root.querySelectorAll('[data-cz-tab]').forEach((t, i) => t.classList.toggle('is-active', i === idx));
    root.querySelectorAll('[data-cz-pane]').forEach((p, i) => p.classList.toggle('is-active', i === idx));
  }

  root.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-group][data-id]');
    if (opt) {
      const g = opt.dataset.group;
      const id = opt.dataset.id;
      state[g] = state[g] === id ? null : id;
      renderStage();
      renderUI();
      const idx = PART_KEYS.indexOf(g);
      if (idx >= 0 && idx < PART_KEYS.length - 1 && state[g]) {
        setTimeout(() => activateTab(idx + 1), 320);
      }
      return;
    }
    const tab = e.target.closest('[data-cz-tab]');
    if (tab) activateTab(parseInt(tab.dataset.czTab, 10));
  });

  const btnShare = root.querySelector('[data-cz-share]');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      const params = new URLSearchParams();
      PART_KEYS.forEach((k) => { if (state[k]) params.set(k, state[k]); });
      const url = window.location.origin + window.location.pathname + '?' + params.toString();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          const orig = btnShare.textContent;
          btnShare.textContent = 'リンクをコピーしました ✓';
          setTimeout(() => { btnShare.textContent = orig; }, 2000);
        });
      } else {
        prompt('構成リンク:', url);
      }
    });
  }

  const btnAdd = root.querySelector('[data-cz-add]');
  if (btnAdd) {
    btnAdd.addEventListener('click', (e) => {
      e.preventDefault();
      if (btnAdd.disabled) return;
      const summary = PART_KEYS
        .filter((k) => state[k])
        .map((k) => `${LABELS[k]}: ${itemMap[k][state[k]].name}`)
        .join('\n');
      alert('（デモ）以下の構成でカートに追加されます：\n\n' + summary + '\n\n合計: ' + yen(totalYen()));
    });
  }

  const params = new URLSearchParams(window.location.search);
  PART_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v && itemMap[k][v]) state[k] = v;
  });

  const priceEl = root.querySelector('[data-cz-price]');
  if (priceEl) priceEl.dataset.value = String(BASE_PRICE);

  renderStage();
  renderUI();
  activateTab(0);
})();
