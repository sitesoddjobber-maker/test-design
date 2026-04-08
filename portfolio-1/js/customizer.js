/* ========================================
   O bag Customizer — Portfolio 1
   SVG real-time bag preview
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  const state = {
    step: 1, total: 5,
    sel: { model: null, color: null, handle: null, inner: null, accessories: [] },
    prices: { model: 0, color: 0, handle: 0, inner: 0, accessories: 0 }
  };

  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const progressFill = $('progressFill');
  const steps = $$('.progress-step');
  const panels = $$('.step-panel');
  const prevBtn = $('prevBtn');
  const nextBtn = $('nextBtn');
  const modal = $('completionModal');
  const hint = $('previewHint');

  // SVG elements
  const svgBody = $('svgBody');
  const svgHandle = $('svgHandle');
  const svgInner = $('svgInner');
  const svgAccessory = $('svgAccessory');

  function fmt(n) { return '\u00a5' + n.toLocaleString(); }

  // --- Navigation ---
  function goTo(n) {
    state.step = n;
    progressFill.style.width = `${(n / state.total) * 100}%`;
    steps.forEach((s, i) => {
      s.classList.remove('active', 'completed');
      if (i + 1 === n) s.classList.add('active');
      if (i + 1 < n) s.classList.add('completed');
    });
    panels.forEach((p, i) => p.classList.toggle('active', i + 1 === n));
    prevBtn.disabled = n === 1;

    if (n === state.total) {
      nextBtn.innerHTML = '完了 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else {
      nextBtn.innerHTML = '次へ <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m9 18 6-6-6-6"/></svg>';
    }

    if (window.innerWidth <= 1024) {
      document.querySelector('.options-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  prevBtn.addEventListener('click', () => { if (state.step > 1) goTo(state.step - 1); });
  steps.forEach(s => s.addEventListener('click', () => {
    const t = +s.dataset.step;
    if (t <= state.step) goTo(t);
  }));

  // --- Prices ---
  function updatePrices() {
    const tot = state.prices.model + state.prices.color + state.prices.handle + state.prices.inner + state.prices.accessories;
    pl($('priceModel'), 'モデル', state.sel.model, state.prices.model);
    pl($('priceBody'), 'ボディカラー', state.sel.color, state.prices.color);
    pl($('priceHandle'), 'ハンドル', state.sel.handle, state.prices.handle);
    pl($('priceInner'), 'インナーバッグ', state.sel.inner, state.prices.inner);
    if (state.sel.accessories.length) {
      $('priceAccessory').innerHTML = `<span>アクセサリー (${state.sel.accessories.length})</span><span>${fmt(state.prices.accessories)}</span>`;
      $('priceAccessory').classList.add('active');
    } else {
      $('priceAccessory').innerHTML = '<span>アクセサリー</span><span>&mdash;</span>';
      $('priceAccessory').classList.remove('active');
    }
    $('totalPrice').textContent = fmt(tot);
    const mob = $('mobileTotalPrice');
    if (mob) mob.textContent = fmt(tot);
  }

  function pl(el, label, val, price) {
    if (val) {
      el.innerHTML = `<span>${label}</span><span>${fmt(price)}</span>`;
      el.classList.add('active');
    } else {
      el.innerHTML = `<span>${label}</span><span>&mdash;</span>`;
      el.classList.remove('active');
    }
  }

  // --- SVG Preview Update ---
  function updatePreview() {
    if (state.sel.model) {
      hint.style.display = 'none';
    }
  }

  // --- Model ---
  $$('.model-card').forEach(c => c.addEventListener('click', () => {
    $$('.model-card').forEach(x => x.classList.remove('selected'));
    c.classList.add('selected');
    state.sel.model = c.dataset.model;
    state.prices.model = +c.dataset.price;
    // Reset body color to default
    svgBody.setAttribute('fill', '#c9b99a');
    updatePrices(); updatePreview();
  }));

  // --- Color ---
  $$('.color-swatch').forEach(c => c.addEventListener('click', () => {
    $$('.color-swatch').forEach(x => x.classList.remove('selected'));
    c.classList.add('selected');
    state.sel.color = c.dataset.color;
    state.prices.color = +c.dataset.price;
    // Update SVG body color
    svgBody.setAttribute('fill', c.dataset.hex);
    updatePrices(); updatePreview();
  }));

  // --- Handle ---
  $$('#handleGrid .option-card').forEach(c => c.addEventListener('click', () => {
    $$('#handleGrid .option-card').forEach(x => x.classList.remove('selected'));
    c.classList.add('selected');
    state.sel.handle = c.querySelector('h3').textContent;
    state.prices.handle = +c.dataset.price;
    // Update SVG handle color
    const hColor = c.dataset.handleColor || '#8a7a6a';
    svgHandle.setAttribute('stroke', hColor);
    updatePrices(); updatePreview();
  }));

  // --- Inner ---
  $$('#innerGrid .option-card').forEach(c => c.addEventListener('click', () => {
    $$('#innerGrid .option-card').forEach(x => x.classList.remove('selected'));
    c.classList.add('selected');
    state.sel.inner = c.querySelector('h3').textContent;
    state.prices.inner = +c.dataset.price;
    // Update SVG inner color
    const iColor = c.dataset.innerColor || '#e0d8c8';
    svgInner.setAttribute('fill', iColor);
    updatePrices(); updatePreview();
  }));

  // --- Accessories (multi) ---
  $$('#accessoryGrid .option-card').forEach(c => c.addEventListener('click', () => {
    c.classList.toggle('selected');
    state.sel.accessories = [];
    state.prices.accessories = 0;
    $$('#accessoryGrid .option-card.selected').forEach(s => {
      state.sel.accessories.push(s.querySelector('h3').textContent);
      state.prices.accessories += +s.dataset.price;
    });
    // Show/hide accessory on SVG
    if (state.sel.accessories.length) {
      svgAccessory.setAttribute('fill', '#e8c4c4');
      svgAccessory.setAttribute('opacity', '1');
    } else {
      svgAccessory.setAttribute('opacity', '0');
    }
    updatePrices(); updatePreview();
  }));

  // --- Done ---
  function showDone() {
    const tot = state.prices.model + state.prices.color + state.prices.handle + state.prices.inner + state.prices.accessories;
    let html = '';
    html += sr('モデル', state.sel.model, state.prices.model);
    html += sr('カラー', state.sel.color, state.prices.color);
    html += sr('ハンドル', state.sel.handle, state.prices.handle);
    html += sr('インナー', state.sel.inner, state.prices.inner);
    state.sel.accessories.forEach(a => {
      const card = Array.from($$('#accessoryGrid .option-card')).find(r => r.querySelector('h3').textContent === a);
      html += sr('アクセサリー', a, card ? +card.dataset.price : 0);
    });
    $('modalSummary').innerHTML = html;
    $('modalTotalPrice').textContent = fmt(tot);
    modal.classList.add('active');
  }

  function sr(label, val, price) {
    return `<div class="summary-line"><span>${label}: ${val || '未選択'}</span><span>${fmt(price)}</span></div>`;
  }

  modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.classList.remove('active'));
  $('resetBtn').addEventListener('click', () => {
    state.sel = { model: null, color: null, handle: null, inner: null, accessories: [] };
    state.prices = { model: 0, color: 0, handle: 0, inner: 0, accessories: 0 };
    $$('.selected').forEach(s => s.classList.remove('selected'));
    svgBody.setAttribute('fill', '#c9b99a');
    svgHandle.setAttribute('stroke', '#8a7a6a');
    svgInner.setAttribute('fill', '#e0d8c8');
    svgAccessory.setAttribute('opacity', '0');
    hint.style.display = '';
    updatePrices(); goTo(1);
    modal.classList.remove('active');
  });

  // --- Keyboard ---
  document.addEventListener('keydown', e => {
    if (modal.classList.contains('active')) return;
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
  });

  // --- Shake animation ---
  const style = document.createElement('style');
  style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}';
  document.head.appendChild(style);

  // --- Header scroll ---
  const header = $('header');
  window.addEventListener('scroll', () => { header.classList.toggle('scrolled', window.pageYOffset > 50); });

  goTo(1); updatePrices();
});
