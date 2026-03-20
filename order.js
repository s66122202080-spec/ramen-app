// ===== STATE =====
let cart = {};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  buildTableSelect();
  lockTableFromURL();
  buildMenuGrid();
  renderCart();
});

// ===== ล็อคโต๊ะจาก URL ?table=1 =====
function lockTableFromURL() {
  const params = new URLSearchParams(window.location.search);
  const tableNum = params.get('table');
  if (tableNum) {
    const sel = document.getElementById('table-select');
    sel.value = tableNum;
    sel.disabled = true;
    sel.style.opacity = '0.7';
    sel.style.cursor = 'not-allowed';
    const group = sel.closest('.form-group');
    if (group) {
      const lockBadge = document.createElement('span');
      lockBadge.textContent = ` 🔒 โต๊ะ ${tableNum}`;
      lockBadge.style.cssText = 'color:#E84545;font-size:13px;font-weight:700;margin-left:6px;';
      group.querySelector('label').appendChild(lockBadge);
    }
  }
}

// ===== TABLE SELECT =====
function buildTableSelect() {
  const sel = document.getElementById('table-select');
  for (let i = 1; i <= 26; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `โต๊ะ ${i}`;
    sel.appendChild(opt);
  }
}

// ===== MENU GRID =====
function buildMenuGrid() {
  const grid = document.getElementById('menu-grid');
  grid.innerHTML = '';
  RAMEN_MENU.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.style.setProperty('--accent', item.color);
    const spice = getSpiceDisplay(item.spiceLevel);
    const qty = cart[item.id] || 0;
    card.innerHTML = `
      <div class="menu-card-img-wrap">
        <img src="${item.image}" alt="${item.name}" class="menu-img"
          onerror="this.src='${item.imageFallback}'; this.onerror=null;">
        <button class="info-btn" onclick="showInfo('${item.id}')">ℹ</button>
        <div class="menu-badge-kr">${item.nameKr}</div>
      </div>
      <div class="menu-card-body">
        <div class="menu-name-row">
          <span class="menu-emoji">${item.emoji}</span>
          <span class="menu-name">${item.name}</span>
          <span class="menu-brand">${item.brand}</span>
        </div>
        <div class="menu-flavor">${item.flavor}</div>
        <div class="menu-spice">
          ${spice.flames} <span class="spice-label">${spice.label}</span>
        </div>
        <div class="qty-row">
          <button class="qty-btn minus" onclick="changeQty('${item.id}',-1)" ${qty===0?'disabled':''}>−</button>
          <span class="qty-num" id="qty-${item.id}">${qty}</span>
          <button class="qty-btn plus" onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function changeQty(id, delta) {
  cart[id] = Math.max(0, (cart[id] || 0) + delta);
  if (cart[id] === 0) delete cart[id];
  const qtyEl = document.getElementById(`qty-${id}`);
  if (qtyEl) qtyEl.textContent = cart[id] || 0;
  const card = qtyEl?.closest('.menu-card');
  if (card) {
    card.querySelector('.qty-btn.minus').disabled = !cart[id];
    card.classList.toggle('in-cart', !!cart[id]);
  }
  renderCart();
}

// ===== CART =====
function renderCart() {
  const el = document.getElementById('cart-items');
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    el.innerHTML = '<div class="empty-cart">🛒 ยังไม่ได้เลือกเมนู</div>';
    document.getElementById('btn-submit').disabled = true;
    return;
  }
  document.getElementById('btn-submit').disabled = false;
  let total = 0;
  const rows = ids.map(id => {
    const item = RAMEN_MENU.find(r => r.id === id);
    const qty = cart[id];
    total += qty;
    return `
      <div class="cart-row">
        <span class="cart-emoji">${item.emoji}</span>
        <span class="cart-name">${item.name}</span>
        <div class="cart-qty-ctrl">
          <button class="qty-btn minus sm" onclick="changeQty('${id}',-1)">−</button>
          <span class="cart-qty">${qty}</span>
          <button class="qty-btn plus sm" onclick="changeQty('${id}',1)">+</button>
        </div>
      </div>
    `;
  }).join('');
  el.innerHTML = rows + `<div class="cart-total">รวม <strong>${total}</strong> ซอง</div>`;
}

// ===== SUBMIT =====
async function submitOrder() {
  const name = document.getElementById('customer-name').value.trim();
  const table = document.getElementById('table-select').value;
  if (!name) { alert('กรุณากรอกชื่อ'); document.getElementById('customer-name').focus(); return; }
  if (!table) { alert('กรุณาเลือกโต๊ะ'); document.getElementById('table-select').focus(); return; }
  if (Object.keys(cart).length === 0) { alert('กรุณาเลือกเมนู'); return; }

  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.textContent = '⏳ กำลังส่ง...';

  try {
    const queueCount = await dbGetTodayQueueCount();
    const queueNum = queueCount + 1;
    const items = Object.entries(cart).map(([id, qty]) => {
      const item = RAMEN_MENU.find(r => r.id === id);
      return { id, name: item.name, nameKr: item.nameKr, emoji: item.emoji, qty, status: 'pending' };
    });

    const order = {
      queue: queueNum,
      name,
      table: parseInt(table),
      items: JSON.stringify(items),
      status: 'pending',
      date: getTodayKey(),
      created_at: new Date().toISOString()
    };

    await dbInsertOrder(order);

    const itemText = items.map(i => `${i.emoji} ${i.name} × ${i.qty}`).join('<br>');
    document.getElementById('modal-detail').innerHTML = `
      <div class="modal-info-row"><span>👤 ชื่อ</span><strong>${name}</strong></div>
      <div class="modal-info-row"><span>🪑 โต๊ะ</span><strong>โต๊ะ ${table}</strong></div>
      <div class="modal-info-row items-col"><span>🍜 เมนู</span><strong>${itemText}</strong></div>
    `;

    // Step 1: รอคิว
    document.getElementById('modal-emoji').textContent = '⏳';
    document.getElementById('modal-title').textContent = 'กำลังส่งออเดอร์...';
    document.getElementById('modal-hint').textContent = 'กรุณารอสักครู่...';
    document.getElementById('modal-success').classList.remove('hidden');

    // Step 2: รับออเดอร์เรียบร้อย หลัง 1.2 วินาที
    setTimeout(() => {
      document.getElementById('modal-emoji').textContent = '✅';
      document.getElementById('modal-title').textContent = 'พนักงานรับออเดอร์เรียบร้อย!';
      document.getElementById('modal-hint').textContent = 'รอสักครู่นะครับ/ค่ะ 🍜';
    }, 1200);

    cart = {};
    document.getElementById('customer-name').value = '';
    if (!document.getElementById('table-select').disabled) {
      document.getElementById('table-select').value = '';
    }
    buildMenuGrid();
    renderCart();
  } catch(e) {
    alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    console.error(e);
  }

  btn.disabled = false;
  btn.textContent = '🔥 ส่งออเดอร์';
}

function closeModal() {
  document.getElementById('modal-success').classList.add('hidden');
}

// ===== INFO MODAL =====
function showInfo(id) {
  const item = RAMEN_MENU.find(r => r.id === id);
  const spice = getSpiceDisplay(item.spiceLevel);
  const tagsHtml = item.tags.map(t => `<span class="info-tag">${t}</span>`).join('');
  document.getElementById('modal-info-content').innerHTML = `
    <div class="info-header">
      <img src="${item.image}" alt="${item.name}" class="info-img"
        onerror="this.src='${item.imageFallback}'; this.onerror=null;">
      <div class="info-badge-kr">${item.nameKr}</div>
    </div>
    <div class="info-body">
      <div class="info-name-row">
        <span class="info-emoji">${item.emoji}</span>
        <div>
          <h2 class="info-name">${item.name}</h2>
          <p class="info-fullname">${item.nameFull}</p>
        </div>
      </div>
      <div class="info-detail-row"><strong>แบรนด์:</strong> ${item.brand}</div>
      <div class="info-detail-row"><strong>รสชาติ:</strong> ${item.flavor}</div>
      <div class="info-detail-row">
        <strong>ความเผ็ด:</strong>
        <span class="info-spice">${spice.flames}</span>
        <span class="spice-label-lg">${spice.label}</span>
      </div>
      <p class="info-desc">${item.description}</p>
      <div class="info-tags">${tagsHtml}</div>
    </div>
  `;
  document.getElementById('modal-info').classList.remove('hidden');
}

function closeInfoModal() {
  document.getElementById('modal-info').classList.add('hidden');
}
