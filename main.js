window.addEventListener('DOMContentLoaded', () => {
  const $ = (s, a = false) => a ? document.querySelectorAll(s) : document.querySelector(s), getV = (e, d) => e && e.value !== '' ? parseFloat(e.value) : d;
  const [run, pause, stop, debug, save, list, canvas, sprite, badge] = ['#run-btn', '#pause-btn', '#stop-btn', '#debug-btn', '#site-save-action', '#sprites-list-container', '#canvas-mock', '#active-sprite-container', '.sprite-name-badge'].map(id => $(id));
  const [iName, iX, iY, iSize, iDir] = ['#sprite-name-input', '#sprite-x-input', '#sprite-y-input', '#sprite-size-input', '#sprite-dir-input'].map(id => $(id)), addSpriteBtn = $('#add-sprite-btn');
  let isPaused = false;

  const updateStyle = () => { if (!sprite || isPaused) return; sprite.style.transform = `translate(${getV(iX, 0)}px, ${-getV(iY, 0)}px) scale(${getV(iSize, 100) / 100}) rotate(${getV(iDir, 90) - 90}deg)`; };
  [iX, iY, iSize, iDir].forEach(i => i && i.addEventListener('input', updateStyle)); if (iName) iName.addEventListener('input', e => { if (badge) badge.textContent = e.target.value; const c = $('.asset-card.active span'); if (c) c.textContent = e.target.value; });
  $('.menu-item', true).forEach(m => m.textContent === '編集' && m.addEventListener('click', () => $('#streech-workspace').classList.toggle('grid-mode')));
  if (debug) debug.addEventListener('click', () => alert("開発中なのでありません"));
  const clearBtn = $('#clear-all-blocks-btn'); if (clearBtn) clearBtn.addEventListener('click', () => { if (confirm("本当に全てのブロックを消去しますか？")) { const ws = $('#streech-workspace'); if (ws) ws.innerHTML = ''; } });

  const resetBtn = () => [run, pause].forEach(b => b && b.classList.remove('active')), togglePause = () => { if (!run || !run.classList.contains('active')) return; isPaused = !isPaused; if (pause) pause.classList.toggle('active', isPaused); if (canvas) canvas.classList.toggle('paused-state', isPaused); $('.asset-info-bar .info-input', true).forEach(i => i.disabled = isPaused); if (!isPaused) updateStyle(); };
  if (run) run.addEventListener('click', () => { if (isPaused) togglePause(); resetBtn(); run.classList.add('active'); if (stop) { stop.style.opacity = "1"; stop.style.pointerEvents = "auto"; } updateStyle(); }); if (pause) pause.addEventListener('click', togglePause);
  if (stop) { stop.addEventListener('click', () => { if (isPaused) togglePause(); resetBtn(); [iX, iY].forEach(i => i.value = 0); iSize.value = 100; iDir.value = 90; updateStyle(); stop.style.opacity = "0.4"; stop.style.pointerEvents = "none"; }); stop.style.opacity = "0.4"; stop.style.pointerEvents = "none"; }

  // 🛠️ 【実行エンジンの文字判定完全修正】あなたのHTMLパレットの文字（「歩動かす」「度回す」「どこかの場所へ行く」）と1文字のズレもなく完全直結させました！
  const exec = (b) => { if (!b || isPaused) return; const t = b.textContent || "", inp = b.querySelector('.block-input'), v = inp ? parseFloat(inp.value) || 0 : 0; if (t.includes("歩動かす")) { const r = (getV(iDir, 90) * Math.PI) / 180; if (iX) iX.value = Math.round(getV(iX, 0) + v * Math.cos(r)); if (iY) iY.value = Math.round(getV(iY, 0) + v * Math.sin(r)); } else if (t.includes("度回す")) { if (iDir) iDir.value = (getV(iDir, 90) + (b.querySelector('img')?.style.transform.includes('scaleX(-1)') === false ? v : -v)) % 360; } else if (t.includes("どこかの場所へ行く")) { if (iX) iX.value = Math.floor(Math.random() * 300) - 150; if (iY) iY.value = Math.floor(Math.random() * 200) - 100; } else if (t.includes("x座標")) { if (iX) iX.value = v; } updateStyle(); };
  if (save) save.addEventListener('click', () => { const ws = $('#streech-workspace'); if (ws) { const data = Array.from(ws.querySelectorAll('.streech-block')).map(b => ({ text: b.textContent, val: b.querySelector('.block-input')?.value || '', isWrap: b.classList.contains('wrap-block'), isHat: b.classList.contains('hat-block') })); localStorage.setItem('streech_blocks', JSON.stringify(data)); localStorage.setItem('streech_name', iName ? iName.value : 'Sprite1'); } const a = document.createElement('div'); a.style.cssText = "position:fixed; top:60px; left:50%; transform:translateX(-50%); background:#00d631; color:white; padding:8px 24px; border-radius:20px; font-size:0.8rem; font-weight:bold; z-index:9999;"; a.textContent = "プロジェクトを保存しました！"; document.body.appendChild(a); setTimeout(() => a.remove(), 1500); });

  const setupPaletteBlock = (b) => {
    b.addEventListener('click', (e) => {
      if (e.target.classList.contains('block-input') || isPaused) return; e.stopPropagation(); const ws = $('#streech-workspace'); if (!ws) return; const clone = b.cloneNode(true); clone.style.cssText = `position: relative; left: 0px; top: 0px; opacity: 1; z-index: 5; margin-top: 4px; display: flex; flex-direction: column;`;
      const wrapSlot = ws.querySelector('.wrap-slot'); if (wrapSlot) { wrapSlot.appendChild(clone); } else { ws.appendChild(clone); }
      clone.addEventListener('click', (ev) => { if (!ev.target.classList.contains('block-input') && !isPaused) { ev.stopPropagation(); exec(clone); } });
    });
  };
  const refresh = () => $('.block-palette .streech-block', true).forEach(b => setupPaletteBlock(b));

  const bindCard = (c) => c.addEventListener('click', () => { if (isPaused) return; $('.asset-card', true).forEach(card => card.classList.remove('active')); c.classList.add('active'); const n = c.querySelector('span').textContent; if (iName) iName.value = n; if (badge) badge.textContent = n; if (sprite) sprite.className = c.getAttribute('data-sprite-id') === "1" ? 'view-sprite1' : 'view-sprite-custom'; updateStyle(); });
  $('.category-sidebar .category-item', true).forEach(item => item.addEventListener('click', () => { $('.category-sidebar .category-item', true).forEach(c => c.classList.remove('active')); item.classList.add('active'); const sel = item.getAttribute('data-category'); $('#palette-title').textContent = item.textContent; $('.palette-scroll-container .category-group', true).forEach(g => g.style.display = g.classList.contains(`${sel}-group`) ? 'block' : 'none'); }));
  if (addSpriteBtn && list) addSpriteBtn.addEventListener('click', () => { if (isPaused) return; const id = $('.asset-card', true).length + 1, name = `Sprite${id}`, c = document.createElement('div'); c.className = 'asset-card'; c.setAttribute('data-sprite-id', id); c.innerHTML = `<div class="asset-icon-placeholder"></div><span>${name}</span>`; list.appendChild(c); bindCard(c); c.click(); }); $('.asset-card', true).forEach(c => bindCard(c));

  const ws = $('#streech-workspace'); if (ws) {
    const sB = localStorage.getItem('streech_blocks'), sN = localStorage.getItem('streech_name'); ws.innerHTML = '';
    if (sB) {
      JSON.parse(sB).forEach(d => {
        const targetBlock = Array.from(document.querySelectorAll('.block-palette .streech-block')).find(b => b.textContent === d.text); if (!targetBlock) return;
        const rb = targetBlock.cloneNode(true); rb.style.cssText = `position: relative; left: 0px; top: 0px; opacity: 1; z-index: 5; margin-top: 4px; display: flex; flex-direction: column;`;
        const inp = rb.querySelector('.block-input'); if (inp && d.val !== '') inp.value = d.val;
        const wrapSlot = ws.querySelector('.wrap-slot'); if (wrapSlot && !d.isHat) { wrapSlot.appendChild(rb); } else { ws.appendChild(rb); }
        rb.addEventListener('click', (ev) => { if (!ev.target.classList.contains('block-input') && !isPaused) { ev.stopPropagation(); exec(rb); } });
      });
    } else {
      const hat = document.createElement('div'); hat.className = 'streech-block block-events hat-block'; hat.style.cssText = 'position: relative; left: 0px; top: 0px; margin-top: 4px;'; hat.innerHTML = `<img src="./flag.svg" style="width:16px; height:16px; margin-right:4px;"><span>が押されたとき</span>`; ws.appendChild(hat);
    }
    if (sN && iName) { iName.value = sN; if (badge) badge.textContent = sN; const c = $('.asset-card.active span'); if (c) c.textContent = sN; }
  }
  refresh();
});
