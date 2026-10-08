/* ========================================
   O bag Portfolio 2: Customizer Logic
   Enhanced SVG real-time bag preview (Japanese)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  const state = {
    step: 1,
    total: 5,
    sel: { model: null, color: null, handle: null, inner: null, extras: [] },
    prices: { model: 0, color: 0, handle: 0, inner: 0, extras: 0 }
  };

  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const panels = $$('.cust-panel');
  const steps = $$('.cust-step');
  const lines = $$('.cust-step-line');
  const prevBtn = $('custPrev');
  const nextBtn = $('custNext');
  const modal = $('doneModal');
  const hint = $('previewHint');

  // SVG elements
  const svgBody = $('svgBody');
  const svgBodySheen = $('svgBodySheen');
  const svgKnitOverlay = $('svgKnitOverlay');
  const svgReverseLine = $('svgReverseLine');
  const svgHandle = $('svgHandle');
  const svgHandle2 = $('svgHandle2');
  const svgInner = $('svgInner');
  const svgInnerFold = $('svgInnerFold');
  const svgInnerZip = $('svgInnerZip');
  const svgInnerZipPull = $('svgInnerZipPull');
  const svgInnerQuilt = $('svgInnerQuilt');
  const svgShadow = $('svgShadow');
  const bodyClipPath = $('bodyClipPath');
  const reverseStop1 = $('reverseStop1');
  const reverseStop2 = $('reverseStop2');

  // Accessory elements
  const svgAccFlower = $('svgAccFlower');
  const svgAccLetter = $('svgAccLetter');
  const svgAccScarf = $('svgAccScarf');
  const svgAccTrim = $('svgAccTrim');

  function fmt(n) { return '\u00a5' + n.toLocaleString(); }

  // --- Model SVG Definitions ---
  const modelShapes = {
    'O bag': {
      body: 'M60,100 Q60,82 78,82 L222,82 Q240,82 240,100 L240,290 Q240,322 208,322 L92,322 Q60,322 60,290 Z',
      handle: 'M108,100 Q108,48 150,48 Q192,48 192,100',
      handle2: 'M116,100 Q116,58 150,58 Q184,58 184,100',
      inner: 'M72,82 L72,68 Q72,58 82,58 L218,58 Q228,58 228,68 L228,82',
      innerFold: 'M78,82 Q150,92 222,82',
      shadow: { cx: 150, rx: 92 },
      reverseLine: { y: 202 },
    },
    'O bag Mini': {
      body: 'M82,120 Q82,105 97,105 L203,105 Q218,105 218,120 L218,280 Q218,308 198,308 L102,308 Q82,308 82,280 Z',
      handle: 'M118,120 Q118,72 150,72 Q182,72 182,120',
      handle2: 'M126,120 Q126,82 150,82 Q174,82 174,120',
      inner: 'M92,105 L92,93 Q92,85 100,85 L200,85 Q208,85 208,93 L208,105',
      innerFold: 'M98,105 Q150,114 202,105',
      shadow: { cx: 150, rx: 72 },
      reverseLine: { y: 206 },
    },
    'O bag Reverse': {
      body: 'M60,100 Q60,82 78,82 L222,82 Q240,82 240,100 L240,290 Q240,322 208,322 L92,322 Q60,322 60,290 Z',
      handle: 'M108,100 Q108,48 150,48 Q192,48 192,100',
      handle2: 'M116,100 Q116,58 150,58 Q184,58 184,100',
      inner: 'M72,82 L72,68 Q72,58 82,58 L218,58 Q228,58 228,68 L228,82',
      innerFold: 'M78,82 Q150,92 222,82',
      shadow: { cx: 150, rx: 92 },
      isReverse: true,
      reverseLine: { y: 202 },
    },
    'O bag Square': {
      body: 'M68,98 Q68,86 80,86 L220,86 Q232,86 232,98 L232,296 Q232,308 220,308 L80,308 Q68,308 68,296 Z',
      handle: 'M112,98 Q112,50 150,50 Q188,50 188,98',
      handle2: 'M120,98 Q120,60 150,60 Q180,60 180,98',
      inner: 'M78,86 L78,74 Q78,66 86,66 L214,66 Q222,66 222,74 L222,86',
      innerFold: 'M84,86 Q150,94 216,86',
      shadow: { cx: 150, rx: 84 },
      reverseLine: { y: 197 },
    },
    'O bag City': {
      body: 'M48,95 Q48,78 66,78 L234,78 Q252,78 252,95 L252,282 Q252,312 224,312 L76,312 Q48,312 48,282 Z',
      handle: 'M104,95 Q104,40 150,40 Q196,40 196,95',
      handle2: 'M112,95 Q112,52 150,52 Q188,52 188,95',
      inner: 'M60,78 L60,65 Q60,56 70,56 L230,56 Q240,56 240,65 L240,78',
      innerFold: 'M66,78 Q150,88 234,78',
      shadow: { cx: 150, rx: 104 },
      reverseLine: { y: 195 },
    },
    'O bag Knit': {
      body: 'M60,100 Q60,82 78,82 L222,82 Q240,82 240,100 L240,290 Q240,322 208,322 L92,322 Q60,322 60,290 Z',
      handle: 'M108,100 Q108,48 150,48 Q192,48 192,100',
      handle2: 'M116,100 Q116,58 150,58 Q184,58 184,100',
      inner: 'M72,82 L72,68 Q72,58 82,58 L218,58 Q228,58 228,68 L228,82',
      innerFold: 'M78,82 Q150,92 222,82',
      shadow: { cx: 150, rx: 92 },
      isKnit: true,
      reverseLine: { y: 202 },
    },
  };

  // --- Handle definitions ---
  const handleDefs = {
    'ショートフラットハンドル': 'flat',
    'ロングショルダーストラップ': 'long',
    'ロープハンドル': 'rope',
    'チェーンストラップ': 'chain',
    'チューブラーハンドル': 'tube',
  };

  let currentBodyColor = '#c9b99a';
  let currentModel = null;

  // --- Step Navigation ---
  function goTo(n) {
    state.step = n;
    panels.forEach((p, i) => p.classList.toggle('active', i + 1 === n));
    steps.forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i + 1 === n) s.classList.add('active');
      if (i + 1 < n) s.classList.add('done');
    });
    lines.forEach((l, i) => {
      l.classList.toggle('done', i + 1 < n);
    });
    prevBtn.disabled = n === 1;
    nextBtn.textContent = n === state.total ? '完了' : '次へ';

    if (window.innerWidth <= 1024) {
      const opts = document.querySelector('.cust-options');
      if (opts) opts.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function canGo() {
    switch (state.step) {
      case 1: return !!state.sel.model;
      case 2: return !!state.sel.color;
      case 3: return !!state.sel.handle;
      case 4: return !!state.sel.inner;
      case 5: return true;
    }
  }

  nextBtn.addEventListener('click', () => {
    if (state.step === state.total) { showDone(); return; }
    if (!canGo()) {
      nextBtn.style.animation = 'shake 0.35s ease';
      setTimeout(() => nextBtn.style.animation = '', 400);
      return;
    }
    goTo(state.step + 1);
  });

  prevBtn.addEventListener('click', () => {
    if (state.step > 1) goTo(state.step - 1);
  });

  steps.forEach(s => {
    s.addEventListener('click', () => {
      const t = parseInt(s.dataset.step);
      if (t <= state.step) goTo(t);
    });
  });

  // --- Prices ---
  function updatePrices() {
    const tot = state.prices.model + state.prices.color + state.prices.handle + state.prices.inner + state.prices.extras;
    priceLine($('prModel'), 'モデル', state.sel.model, state.prices.model);
    priceLine($('prColor'), 'ボディカラー', state.sel.color, state.prices.color);
    priceLine($('prHandle'), 'ハンドル', state.sel.handle, state.prices.handle);
    priceLine($('prInner'), 'インナーバッグ', state.sel.inner, state.prices.inner);
    if (state.sel.extras.length) {
      $('prExtras').innerHTML = `<span>アクセサリー (${state.sel.extras.length})</span><span>${fmt(state.prices.extras)}</span>`;
      $('prExtras').classList.add('has-value');
    } else {
      $('prExtras').innerHTML = '<span>アクセサリー</span><span>&mdash;</span>';
      $('prExtras').classList.remove('has-value');
    }
    $('totalPrice').textContent = fmt(tot);
    $('mobileTotal').textContent = fmt(tot);
  }

  function priceLine(el, label, val, price) {
    if (val) {
      el.innerHTML = `<span>${label}</span><span>${fmt(price)}</span>`;
      el.classList.add('has-value');
    } else {
      el.innerHTML = `<span>${label}</span><span>&mdash;</span>`;
      el.classList.remove('has-value');
    }
  }

  // --- SVG Shape Helpers ---
  function setPath(el, d) {
    if (el && d) el.setAttribute('d', d);
  }

  function applyModelShape(modelName) {
    const shape = modelShapes[modelName];
    if (!shape) return;
    currentModel = shape;

    setPath(svgBody, shape.body);
    setPath(svgBodySheen, shape.body);
    setPath(bodyClipPath, shape.body);

    // Knit texture
    if (shape.isKnit) {
      setPath(svgKnitOverlay, shape.body);
      svgKnitOverlay.setAttribute('opacity', '1');
    } else {
      svgKnitOverlay.setAttribute('opacity', '0');
    }

    // Reverse mode
    if (shape.isReverse) {
      svgReverseLine.setAttribute('opacity', '1');
      svgReverseLine.setAttribute('y1', shape.reverseLine.y);
      svgReverseLine.setAttribute('y2', shape.reverseLine.y);
    } else {
      svgReverseLine.setAttribute('opacity', '0');
    }

    setPath(svgHandle, shape.handle);
    setPath(svgHandle2, shape.handle2);
    setPath(svgInner, shape.inner);
    setPath(svgInnerFold, shape.innerFold);

    svgShadow.setAttribute('cx', shape.shadow.cx);
    svgShadow.setAttribute('rx', shape.shadow.rx);

    if (state.sel.handle) applyHandleStyle(state.sel.handle);
    if (shape.isReverse && currentBodyColor !== '#c9b99a') {
      applyReverseColor(currentBodyColor);
    }
  }

  function applyHandleStyle(handleName) {
    const type = handleDefs[handleName];
    if (!type || !currentModel) return;

    const baseHandle = currentModel.handle;
    const baseHandle2 = currentModel.handle2;
    const hCard = Array.from($$('#panel3 .opt-row')).find(r => r.querySelector('h3').textContent === handleName);
    const hColor = hCard ? (hCard.dataset.handleColor || '#8a7a6a') : '#8a7a6a';

    switch (type) {
      case 'flat':
        setPath(svgHandle, baseHandle);
        svgHandle.setAttribute('stroke', hColor);
        svgHandle.setAttribute('stroke-width', '5');
        svgHandle.setAttribute('stroke-dasharray', 'none');
        svgHandle2.setAttribute('opacity', '1');
        setPath(svgHandle2, baseHandle2);
        svgHandle2.setAttribute('stroke', hColor);
        svgHandle2.setAttribute('stroke-width', '5');
        svgHandle2.setAttribute('stroke-dasharray', 'none');
        break;
      case 'long':
        setPath(svgHandle, baseHandle);
        svgHandle.setAttribute('stroke', hColor);
        svgHandle.setAttribute('stroke-width', '3');
        svgHandle.setAttribute('stroke-dasharray', 'none');
        svgHandle2.setAttribute('opacity', '0');
        break;
      case 'rope':
        setPath(svgHandle, baseHandle);
        svgHandle.setAttribute('stroke', hColor);
        svgHandle.setAttribute('stroke-width', '6');
        svgHandle.setAttribute('stroke-dasharray', '8,5');
        svgHandle2.setAttribute('opacity', '0');
        break;
      case 'chain':
        setPath(svgHandle, baseHandle);
        svgHandle.setAttribute('stroke', hColor);
        svgHandle.setAttribute('stroke-width', '4');
        svgHandle.setAttribute('stroke-dasharray', '3,6');
        svgHandle2.setAttribute('opacity', '0');
        break;
      case 'tube':
        setPath(svgHandle, baseHandle);
        svgHandle.setAttribute('stroke', hColor);
        svgHandle.setAttribute('stroke-width', '8');
        svgHandle.setAttribute('stroke-dasharray', 'none');
        svgHandle2.setAttribute('opacity', '0');
        break;
    }
  }

  function applyReverseColor(hex) {
    reverseStop1.setAttribute('stop-color', hex);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const darker = '#' + [r, g, b].map(v => Math.round(v * 0.8).toString(16).padStart(2, '0')).join('');
    reverseStop2.setAttribute('stop-color', darker);
    svgBody.setAttribute('fill', 'url(#reverseGrad)');
    svgBodySheen.setAttribute('fill', 'url(#bodySheen)');
  }

  function applyInnerStyle(innerName, innerColor) {
    svgInnerZip.setAttribute('opacity', '0');
    svgInnerZipPull.setAttribute('opacity', '0');
    svgInnerQuilt.setAttribute('opacity', '0');
    svgInner.setAttribute('fill', innerColor);

    if (innerName.includes('ジップ')) {
      svgInnerZip.setAttribute('opacity', '1');
      svgInnerZipPull.setAttribute('opacity', '1');
    } else if (innerName.includes('キルティング')) {
      svgInnerQuilt.setAttribute('opacity', '1');
    }
  }

  function applyAccessories() {
    const accMap = {
      'フラワーチャーム': svgAccFlower,
      'レターチャーム': svgAccLetter,
      'シルクスカーフ': svgAccScarf,
      'デコラティブトリム': svgAccTrim,
    };
    Object.values(accMap).forEach(el => { if (el) el.setAttribute('opacity', '0'); });
    state.sel.extras.forEach(name => {
      const el = accMap[name];
      if (el) el.setAttribute('opacity', '1');
    });
  }

  function updatePreview() {
    if (state.sel.model) hint.style.display = 'none';
  }

  // --- Selections ---
  // Models
  $$('.model-tile').forEach(t => t.addEventListener('click', () => {
    $$('.model-tile').forEach(x => x.classList.remove('selected'));
    t.classList.add('selected');
    state.sel.model = t.dataset.model;
    state.prices.model = +t.dataset.price;

    applyModelShape(t.dataset.model);

    if (currentBodyColor && currentModel) {
      if (currentModel.isReverse) {
        applyReverseColor(currentBodyColor);
      } else {
        svgBody.setAttribute('fill', currentBodyColor);
      }
    }

    updatePrices(); updatePreview();
  }));

  // Colors
  $$('.color-opt').forEach(c => c.addEventListener('click', () => {
    $$('.color-opt').forEach(x => x.classList.remove('selected'));
    c.classList.add('selected');
    state.sel.color = c.dataset.color;
    state.prices.color = +(c.dataset.price || 0);
    currentBodyColor = c.dataset.hex;

    if (currentModel && currentModel.isReverse) {
      applyReverseColor(c.dataset.hex);
    } else {
      svgBody.setAttribute('fill', c.dataset.hex);
    }
    updatePrices(); updatePreview();
  }));

  // Handles
  $$('#panel3 .opt-row').forEach(r => r.addEventListener('click', () => {
    $$('#panel3 .opt-row').forEach(x => x.classList.remove('selected'));
    r.classList.add('selected');
    state.sel.handle = r.querySelector('h3').textContent;
    state.prices.handle = +r.dataset.price;

    applyHandleStyle(state.sel.handle);
    updatePrices(); updatePreview();
  }));

  // Inner
  $$('#panel4 .opt-row').forEach(r => r.addEventListener('click', () => {
    $$('#panel4 .opt-row').forEach(x => x.classList.remove('selected'));
    r.classList.add('selected');
    state.sel.inner = r.querySelector('h3').textContent;
    state.prices.inner = +r.dataset.price;
    const iColor = r.dataset.innerColor || '#e0d8c8';

    applyInnerStyle(state.sel.inner, iColor);
    updatePrices(); updatePreview();
  }));

  // Extras (multi)
  $$('#panel5 .opt-row.multi').forEach(r => r.addEventListener('click', () => {
    r.classList.toggle('selected');
    state.sel.extras = [];
    state.prices.extras = 0;
    $$('#panel5 .opt-row.multi.selected').forEach(s => {
      state.sel.extras.push(s.querySelector('h3').textContent);
      state.prices.extras += +s.dataset.price;
    });

    applyAccessories();
    updatePrices(); updatePreview();
  }));

  // --- Completion ---
  function showDone() {
    const tot = state.prices.model + state.prices.color + state.prices.handle + state.prices.inner + state.prices.extras;
    let html = '';
    html += sumRow('モデル', state.sel.model, state.prices.model);
    html += sumRow('カラー', state.sel.color, state.prices.color);
    html += sumRow('ハンドル', state.sel.handle, state.prices.handle);
    html += sumRow('インナー', state.sel.inner, state.prices.inner);
    state.sel.extras.forEach(e => {
      const card = Array.from($$('#panel5 .opt-row.multi')).find(r => r.querySelector('h3').textContent === e);
      html += sumRow('アクセサリー', e, card ? +card.dataset.price : 0);
    });
    $('doneSummary').innerHTML = html;
    $('doneTotalPrice').textContent = fmt(tot);
    modal.classList.add('active');
  }

  function sumRow(label, val, price) {
    return `<div class="sum-row"><span>${label}: ${val || '未選択'}</span><span>${fmt(price)}</span></div>`;
  }

  modal.querySelector('.done-backdrop').addEventListener('click', () => modal.classList.remove('active'));

  $('doneReset').addEventListener('click', () => {
    state.sel = { model: null, color: null, handle: null, inner: null, extras: [] };
    state.prices = { model: 0, color: 0, handle: 0, inner: 0, extras: 0 };
    currentBodyColor = '#c9b99a';
    currentModel = null;
    $$('.selected').forEach(s => s.classList.remove('selected'));

    const def = modelShapes['O bag'];
    setPath(svgBody, def.body);
    setPath(svgBodySheen, def.body);
    setPath(bodyClipPath, def.body);
    svgBody.setAttribute('fill', '#c9b99a');
    svgKnitOverlay.setAttribute('opacity', '0');
    svgReverseLine.setAttribute('opacity', '0');
    setPath(svgHandle, def.handle);
    svgHandle.setAttribute('stroke', '#8a7a6a');
    svgHandle.setAttribute('stroke-width', '5');
    svgHandle.setAttribute('stroke-dasharray', 'none');
    svgHandle2.setAttribute('opacity', '0');
    setPath(svgInner, def.inner);
    svgInner.setAttribute('fill', '#e0d8c8');
    setPath(svgInnerFold, def.innerFold);
    svgInnerZip.setAttribute('opacity', '0');
    svgInnerZipPull.setAttribute('opacity', '0');
    svgInnerQuilt.setAttribute('opacity', '0');
    svgShadow.setAttribute('cx', '150');
    svgShadow.setAttribute('rx', '90');
    [svgAccFlower, svgAccLetter, svgAccScarf, svgAccTrim].forEach(el => {
      if (el) el.setAttribute('opacity', '0');
    });

    hint.style.display = '';
    updatePrices();
    goTo(1);
    modal.classList.remove('active');
  });

  // --- Keyboard ---
  document.addEventListener('keydown', e => {
    if (modal.classList.contains('active')) return;
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
  });

  // --- Shake ---
  const style = document.createElement('style');
  style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}';
  document.head.appendChild(style);

  goTo(1);
  updatePrices();
});
