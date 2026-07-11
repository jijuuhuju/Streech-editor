window.addEventListener('DOMContentLoaded', () => {
  const $ = (s, a = false) => a ? document.querySelectorAll(s) : document.querySelector(s), getV = (e, d) => e && e.value !== '' ? parseFloat(e.value) : d;
  const [run, pause, stop, debug, save, list, canvas, sprite, badge] = ['#run-btn', '#pause-btn', '#stop-btn', '#debug-btn', '#site-save-action', '#sprites-list-container', '#canvas-mock', '#active-sprite-container', '.sprite-name-badge'].map(id => $(id));
  const [iName, iX, iY, iSize, iDir] = ['#sprite-name-input', '#sprite-x-input', '#sprite-y-input', '#sprite-size-input', '#sprite-dir-input'].map(id => $(id)), addSpriteBtn = $('#add-sprite-btn');
  let isPaused = false;

  const updateStyle = () => { if (!sprite || isPaused) return; sprite.style.transform = `translate(${getV(iX, 0)}px, ${-getV(iY, 0)}px) scale(${getV(iSize, 100) / 100}) rotate(${getV(iDir, 90) - 90}deg)`; };
  [iX, iY, iSize, iDir].forEach(i => i && i.addEventListener('input', updateStyle)); if (iName) iName.addEventListener('input', e => { if (badge) badge.textContent = e.target.value; const c = $('.asset-card.active span'); if (c) c.textContent = e.target.value; });
  $('.menu-item', true).forEach(m => m.textContent === '編集' && m.addEventListener('click', () => $('#streech-workspace').classList.toggle('grid-mode')));
  if (debug) debug.addEventListener('click', () => alert("開発中なのでありません"));
  
  const clearBtn = $('#clear-all-blocks-btn');
  if (clearBtn) clearBtn.addEventListener('click', () => { if (confirm("本当に全てのブロックを消去しますか？")) { const ws = $('#streech-workspace'); if (ws) ws.innerHTML = ''; } });

  const resetBtn = () => [run, pause].forEach(b => b && b.classList.remove('active')), togglePause = () => { if (!run || !run.classList.contains('active')) return; isPaused = !isPaused; if (pause) pause.classList.toggle('active', isPaused); if (canvas) canvas.classList.toggle('paused-state', isPaused); $('.asset-info-bar .info-input', true).forEach(i => i.disabled = isPaused); if (!isPaused) updateStyle(); };
  if (run) run.addEventListener('click', () => { if (isPaused) togglePause(); resetBtn(); run.classList.add('active'); if (stop) { stop.style.opacity = "1"; stop.style.pointerEvents = "auto"; } updateStyle(); }); if (pause) pause.addEventListener('click', togglePause);
  if (stop) { stop.addEventListener('click', () => { if (isPaused) togglePause(); resetBtn(); [iX, iY].forEach(i => i.value = 0); iSize.value = 100; iDir.value = 90; updateStyle(); stop.style.opacity = "0.4"; stop.style.pointerEvents = "none"; }); stop.style.opacity = "0.4"; stop.style.pointerEvents = "none"; }

  // 🛠️ 【タップ＆整列＆削除システム】ドラッグ用の古いプログラムを1文字残さず全消去し、完全にタップ操作だけに統一しました！
  const setupPaletteBlock = (b) => {
    b.addEventListener('click', (e) => {
      if (e.target.classList.contains('block-input') || isPaused) return; e.stopPropagation();
      const ws = $('#streech-workspace'); if (!ws) return;
      const clone = b.cloneNode(true);
      clone.style.cssText = `position: relative; left: 0px; top: 0px; opacity: 1; z-index: 5; margin-top: 4px; display: flex; flex-direction: column;`;
      
      const wrapSlot = ws.querySelector('.wrap-slot');
      if (wrapSlot) { wrapSlot.appendChild(clone); } else { ws.appendChild(clone); }
      
      clone.addEventListener('click', (ev) => {
        if (!ev.target.classList.contains('block-input') && !isPaused) {
          ev.stopPropagation();
          if (confirm("このブロックを削除しますか？")) { clone.remove(); } [e.g. 5]
        }
      });
    });
  };

  const refresh = () => $('.block-palette .streech-block', true).forEach(b => setupPaletteBlock(b));
  
  const bindCard = (c) => c.addEventListener('click', () => { if (isPaused) return; $('.asset-card', true).forEach(card => card.classList.remove('active')); c.classList.add('active'); const n = c.querySelector('span').textContent; if (iName) iName.value = n; if (badge) badge.textContent = n; if (sprite) sprite.className = c.getAttribute('data-sprite-id') === "1" ? 'view-sprite1' : 'view-sprite-custom'; updateStyle(); });
  $('.category-sidebar .category-item', true).forEach(item => item.addEventListener('click', () => { $('.category-sidebar .category-item', true).forEach(c => c.classList.remove('active')); item.classList.add('active'); const sel = item.getAttribute('data-category'); $('#palette-title').textContent = item.textContent; $('.palette-scroll-container .category-group', true).forEach(g => g.style.display = g.classList.contains(`${sel}-group`) ? 'block' : 'none'); }));
  if (addSpriteBtn && list) addSpriteBtn.addEventListener('click', () => { if (isPaused) return; const id = $('.asset-card', true).length + 1, name = `Sprite${id}`, c = document.createElement('div'); c.className = 'asset-card'; c.setAttribute('data-sprite-id', id); c.innerHTML = `<div class="asset-icon-placeholder"></div><span>${name}</span>`; list.appendChild(c); bindCard(c); c.click(); });
  $('.asset-card', true).forEach(c => bindCard(c));

  const ws = $('#streech-workspace'); if (ws) {
    const sB = localStorage.getItem('streech_blocks'), sN = localStorage.getItem('streech_name'); ws.innerHTML = '';
    if (sB) {
      JSON.parse(sB).forEach(d => {
        const div = document.createElement('div'); div.innerHTML = d.html; const rb = div.firstChild;
        rb.style.cssText = `position: relative; left: 0px; top: 0px; opacity: 1; z-index: 5; margin-top: 4px; display: flex; flex-direction: column;`;
        ws.appendChild(rb); rb.addEventListener('click', (ev) => { if (!ev.target.classList.contains('block-input') && !isPaused) { ev.stopPropagation(); if (confirm("このブロックを削除しますか？")) { rb.remove(); } } }); [e.g. 5]
      });
    } else {
      const hat = document.createElement('div'); hat.className = 'streech-block block-events hat-block';
      hat.style.cssText = 'position: relative; left: 0px; top: 0px; margin-top: 4px;'; hat.innerHTML = `<img src="./flag.svg" style="width:16px; height:16px; margin-right:4px;"><span>が押されたとき</span>`; ws.appendChild(hat);
    }
    if (sN && iName) { iName.value = sN; if (badge) badge.textContent = sN; const c = $('.asset-card.active span'); if (c) c.textContent = sN; }
  }
  refresh();
});
