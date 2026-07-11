window.addEventListener('DOMContentLoaded', () => {
  const $ = (s, all = false) => all ? document.querySelectorAll(s) : document.querySelector(s);
  const getV = (el, def) => el && el.value !== '' ? parseFloat(el.value) : def;

  const run = $('#run-btn'), pause = $('#pause-btn'), stop = $('#stop-btn'), debug = $('#debug-btn');
  const save = $('#site-save-action'), addBtn = '#add-sprite-btn', list = $('#sprites-list-container'), canvas = $('#canvas-mock');
  const iName = $('#sprite-name-input'), iX = $('#sprite-x-input'), iY = $('#sprite-y-input'), iSize = $('#sprite-size-input'), iDir = $('#sprite-dir-input');
  const sprite = $('#active-sprite-container'), badge = $('.sprite-name-badge');

  let isPaused = false, activeBlk = null, tx = 0, ty = 0;
  $('.asset-info-bar .info-input', true).forEach(i => { i.removeAttribute('readonly'); i.style.pointerEvents = 'auto'; });

  $('.menu-item', true).forEach(m => {
    if (m.textContent === '編集') m.addEventListener('click', () => $('#streech-workspace').classList.toggle('grid-mode'));
  });
  if (debug) debug.addEventListener('click', () => { debug.classList.toggle('active'); $('#streech-workspace').classList.toggle('debug-mode'); });

  if (iName) iName.addEventListener('input', (e) => {
    if (isPaused) return; const n = e.target.value;
    if (badge) badge.textContent = n; const c = $('.asset-card.active span'); if (c) c.textContent = n;
  });

  const updateStyle = () => {
    if (!sprite || isPaused) return;
    sprite.style.transform = `translate(${getV(iX, 0)}px, ${-getV(iY, 0)}px) scale(${getV(iSize, 100) / 100}) rotate(${getV(iDir, 90) - 90}deg)`;
  };
  [iX, iY, iSize, iDir].forEach(i => i && i.addEventListener('input', updateStyle));

  const resetBtn = () => [run, pause].forEach(b => b && b.classList.remove('active'));
  const triggerRun = () => { if (isPaused) togglePause(); resetBtn(); if (run) run.classList.add('active'); updateStyle(); };

  function togglePause() {
    if (!run || !run.classList.contains('active')) return;
    isPaused = !isPaused; if (pause) pause.classList.toggle('active', isPaused); if (canvas) canvas.classList.toggle('paused-state', isPaused);
    $('.asset-info-bar .info-input', true).forEach(i => i.disabled = isPaused); if (!isPaused) updateStyle();
  }

  if (run) run.addEventListener('click', triggerRun);
  if (pause) pause.addEventListener('click', togglePause);
  if (stop) stop.addEventListener('click', () => {
    if (isPaused) togglePause();
    if ($('.block-workspace .custom-stop-hat')?.nextElementSibling?.classList.contains('custom-flag-trigger')) return triggerRun();
    resetBtn(); [iX, iY].forEach(i => i.value = 0); iSize.value = 100; iDir.value = 90; updateStyle();
  });

  if (save) save.addEventListener('click', () => {
    const ws = $('#streech-workspace'); if (!ws) return;
    const data = Array.from(ws.querySelectorAll('.block-workspace > .streech-block')).map(b => ({ html: b.outerHTML, left: b.style.left, top: b.style.top, val: b.querySelector('.block-input')?.value }));
    localStorage.setItem('streech_blocks', JSON.stringify(data)); localStorage.setItem('streech_name', iName ? iName.value : 'Sprite1');
    const alert = document.createElement('div'); alert.style.cssText = "position:fixed; top:60px; left:50%; transform:translateX(-50%); background:#00d631; color:white; padding:8px 24px; border-radius:20px; font-size:0.8rem; font-weight:bold; z-index:9999;";
    alert.textContent = "プロジェクトを保存しました！"; document.body.appendChild(alert); setTimeout(() => alert.remove(), 1500);
  });

  function loadProject() {
    const ws = $('#streech-workspace'); if (!ws) return;
    const sB = localStorage.getItem('streech_blocks'), sN = localStorage.getItem('streech_name'); ws.innerHTML = '';
    if (sB) {
      JSON.parse(sB).forEach(d => {
        const div = document.createElement('div'); div.innerHTML = d.html; const rb = div.firstChild;
        rb.style.position = 'absolute'; rb.style.left = d.left; rb.style.top = d.top;
        ws.appendChild(rb); attachTouch(rb, false); rb.querySelectorAll('.streech-block').forEach(child => attachTouch(child, false));
      });
    } else {
      const hat = document.createElement('div'); hat.className = 'streech-block block-events hat-block'; hat.style.cssText = 'position:absolute; left:40px; top:40px;';
      hat.innerHTML = `<img src="./flag.svg" style="width:16px; height:16px; margin-right:4px;"><span>が押されたとき</span>`; ws.appendChild(hat); attachTouch(hat, false);
    }
    if (sN && iName) { iName.value = sN; if (badge) badge.textContent = sN; const c = $('.asset-card.active span'); if (c) c.textContent = sN; }
  }

  function attachTouch(block, isPal = false) {
    block.addEventListener('touchstart', (e) => {
      if (e.target.classList.contains('block-input') || isPaused) return; e.stopPropagation();
      const t = e.touches, r = block.getBoundingClientRect(); tx = t.clientX - r.left; ty = t.clientY - r.top;
      if (isPal) {
        // 🛠️ 【機能新設】パレットのブロックをポンとタップするだけで自動生成してエディタに配置！
        const newBlk = block.cloneNode(true); newBlk.style.cssText = `position:absolute; left:80px; top:120px; z-index:5;`;
        $('#streech-workspace').appendChild(newBlk); attachTouch(newBlk, false); triggerRun(); return;
      }
      activeBlk = block; activeBlk.style.zIndex = '1000';
      if (block.parentElement.classList.contains('streech-block') || block.parentNode !== $('#streech-workspace')) {
        const ws = $('#streech-workspace'), wR = ws.getBoundingClientRect();
        activeBlk.style.position = 'absolute'; activeBlk.style.left = `${r.left - wR.left}px`; activeBlk.style.top = `${r.top - wR.top}px`; ws.appendChild(activeBlk);
      }
    }, { passive: true });

    block.addEventListener('touchmove', (e) => { if (activeBlk) { e.preventDefault(); const t = e.touches; activeBlk.style.left = `${t.clientX - tx}px`; activeBlk.style.top = `${t.clientY - ty}px`; } }, { passive: false });

    block.addEventListener('touchend', (e) => {
      if (!activeBlk) return; const ws = $('#streech-workspace'), wR = ws.getBoundingClientRect(), bR = activeBlk.getBoundingClientRect();
      const dX = bR.left - wR.left, dY = bR.top - wR.top;
      if (bR.right > wR.left && bR.left < wR.right && bR.bottom > wR.top && bR.top < wR.top + ws.offsetHeight) {
        activeBlk.style.cssText = `position:absolute; opacity:1; z-index:5; left:${dX}px; top:${dY}px;`; let snap = null, insideWrap = false;
        ws.querySelectorAll('.streech-block').forEach(ex => {
          if (ex === activeBlk || ex.contains(activeBlk)) return;
          const exR = ex.getBoundingClientRect(), exX = exR.left - wR.left, exY = exR.top - wR.top;
          // 🛠️ 【機能新設】「ずっと」ブロックの前面に置くと、自動的にその中の溝（wrap-slot）の中に入るシステム
          if (ex.classList.contains('wrap-block') && dX >= exX && dX <= exX + 165 && dY >= exY && dY <= exY + 40) { snap = ex.querySelector('.wrap-slot'); insideWrap = true; }
          // 🛠️ 【機能新設】通常ブロック同士のマグネット結合（ハット型ブロックは絶対に上から結合できず、強制的に独立配置される）
          else if (!activeBlk.classList.contains('hat-block') && Math.abs(dX - exX) < 35 && Math.abs(dY - (exY + ex.offsetHeight)) < 35) snap = ex;
        });
        if (snap) {
          if (insideWrap) activeBlk.style.cssText = `position: relative; left: 0px; top: 0px; display: flex; z-index: 5; margin-left: 2px;`;
          else activeBlk.style.cssText = `position: relative; left: 0px; top: 2px; display: flex; z-index: 5; margin-top: 2px;`;
          snap.appendChild(activeBlk);
        } else { ws.appendChild(activeBlk); }
      } else { activeBlk.remove(); }
      activeBlk = null;
    });

    // 🛠️ 【機能新設】エディタ内のブロックをタップすると確認アラートを出し、削除しますか？と言われるシステム
    block.addEventListener('click', (e) => {
      if (e.target.classList.contains('block-input') || isPal || isPaused) return; e.stopPropagation();
      if (confirm("ブロックを削除しますか？")) { block.remove(); } else { triggerRun(); }
    });
  }

  const refreshPalette = () => $('.block-palette .streech-block', true).forEach(b => attachTouch(b, true));

  $('.category-sidebar .category-item', true).forEach(item => {
    item.addEventListener('click', () => {
      $('.category-sidebar .category-item', true).forEach(c => c.classList.remove('active')); item.classList.add('active');
      const sel = item.getAttribute('data-category'); $('#palette-title').textContent = item.textContent;
      $('.palette-scroll-container .category-group', true).forEach(g => g.style.display = g.classList.contains(`${sel}-group`) ? 'block' : 'none');
    });
  });

  function bindCard(card) {
    card.addEventListener('click', () => {
      if (isPaused) return; $('.asset-card', true).forEach(c => c.classList.remove('active')); card.classList.add('active');
      const n = card.querySelector('span').textContent; if (iName) iName.value = n; if (badge) badge.textContent = n;
      if (sprite) sprite.className = card.getAttribute('data-sprite-id') === "1" ? 'view-sprite1' : 'view-sprite-custom'; updateStyle();
    });
  }

  if (addBtn && list) $(addBtn).addEventListener('click', () => {
    if (isPaused) return; const id = $('.asset-card', true).length + 1, name = `Sprite${id}`, c = document.createElement('div');
    c.className = 'asset-card'; c.setAttribute('data-sprite-id', id); c.innerHTML = `<div class="asset-icon-placeholder"></div><span>${name}</span>`;
    list.appendChild(c); bindCard(c); c.click();
  });

  $('.asset-card', true).forEach(c => bindCard(c)); refreshPalette(); loadProject();
});
