// ===== STATE =====
let currentFilter = 'all';
let refreshTimer = null;
let lastOrderCount = -1;
let soundEnabled = true;
let activeAudioCtx = null;
let soundTimeouts = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  startAutoRefresh();
  document.addEventListener('touchstart', stopAlerts, { passive: true });
  document.addEventListener('click', stopAlerts);
});

// ===== หยุดเสียงและสั่นทันที =====
function stopAlerts() {
  soundTimeouts.forEach(t => clearTimeout(t));
  soundTimeouts = [];
  if (activeAudioCtx) {
    try { activeAudioCtx.close(); } catch(e) {}
    activeAudioCtx = null;
  }
  if (navigator.vibrate) navigator.vibrate(0);
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.htab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`htab-${tab}`).classList.add('active');
  if (tab === 'stats') renderStats();
  if (tab === 'orders') renderDashboard();
  if (tab === 'tables') renderTableStats();
  if (tab === 'menu') renderMenuManage();
}

// ===== DASHBOARD =====
async function renderDashboard() {
  const orders = await dbGetOrders();

  if (lastOrderCount >= 0 && orders.length > lastOrderCount) {
    const newCount = orders.length - lastOrderCount;
    stopAlerts();
    for (let i = 0; i < newCount; i++) {
      const t = setTimeout(() => {
        if (soundEnabled) {
          playNotificationSound();
          if (navigator.vibrate) {
            navigator.vibrate([500,200,500,200,500,200,500,200,500,200,500,200,500]);
          }
        }
      }, i * 900);
      soundTimeouts.push(t);
    }
    showToast(`🔔 ออเดอร์ใหม่ ${newCount} รายการ!`);
  }
  lastOrderCount = orders.length; // แก้ bug orders.shot → orders.length

  document.getElementById('order-count').textContent = orders.length;
  renderSummary(orders);
  renderOrdersList(orders, currentFilter);
  const now = new Date();
  document.getElementById('last-refresh').textContent =
    `อัปเดต ${now.toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit', second:'2-digit'})}`;
}

function renderSummary(orders) {
  const pending = orders.filter(o => o.status === 'pending').length;
  const done = orders.filter(o => o.status === 'done').length;
  const totalPacks = orders.reduce((s, o) => {
    const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
    return s + items.reduce((si, i) => si + i.qty, 0);
  }, 0);

  document.getElementById('dash-summary').innerHTML = `
    <div class="summary-card orange">
      <div class="summary-num">${orders.length}</div>
      <div class="summary-label">ออเดอร์ทั้งหมด</div>
    </div>
    <div class="summary-card red">
      <div class="summary-num">${pending}</div>
      <div class="summary-label">⏳ รอทำ</div>
    </div>
    <div class="summary-card green">
      <div class="summary-num">${done}</div>
      <div class="summary-label">✅ เสร็จแล้ว</div>
    </div>
    <div class="summary-card blue">
      <div class="summary-num">${totalPacks}</div>
      <div class="summary-label">🍜 ซองรวม</div>
    </div>
  `;
}

// ===== FILTER =====
function filterOrders(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-tabs .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderDashboard();
}

// ===== ORDER LIST =====
function renderOrdersList(orders, filter) {
  // กรองตาม filter
  let filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  filtered = [...filtered].sort((a, b) => a.queue - b.queue);

  const el = document.getElementById('orders-list');
  if (filtered.length === 0) {
    el.innerHTML = '<div class="no-orders">ไม่มีออเดอร์</div>';
    return;
  }

  el.innerHTML = filtered.map((order, index) => {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const elapsed = getElapsed(order.created_at);
    const isDone = order.status === 'done';
    // แสดงคิวเป็นตำแหน่งจริงในลิสต์ปัจจุบัน
    const displayQueue = index + 1;

    const itemsHtml = items.map(item => `
      <div class="order-item ${item.status}">
        <span class="oi-name">${item.emoji} ${item.name} x ${item.qty}</span>
        <button class="item-toggle" onclick="toggleItem(${order.id},'${item.id}')">
          ${item.status === 'pending' ? '⏳ รอ' : '✅ เสร็จ'}
        </button>
      </div>
    `).join('');

    return `
      <div class="order-card ${isDone ? 'done' : ''}">
        <div class="order-card-header">
          <div class="order-queue" style="${isDone ? 'background:#2ecc71' : ''}">Q${displayQueue}</div>
          <div class="order-main-info">
            <span class="order-name">👤 ${order.name}</span>
            <span class="order-table">🪑 โต๊ะ ${order.table}</span>
            <span class="order-time">🕐 ${formatTime(order.created_at)}</span>
            <span class="order-elapsed ${getElapsedClass(order.created_at)}">${elapsed}</span>
          </div>
          <div class="order-actions">
            <button class="btn-done ${isDone ? 'is-done' : ''}" onclick="toggleOrderDone(${order.id},'${order.status}')">
              ${isDone ? '↩ ยกเลิก' : '✅ เสร็จทั้งหมด'}
            </button>
            <button class="btn-delete" onclick="deleteOrder(${order.id})">🗑</button>
          </div>
        </div>
        ${order.note ? `<div style="padding:6px 14px 0;font-family:'Noto Sans Thai',sans-serif;font-size:13px;color:#f39c12;">📝 ${order.note}</div>` : ''}
        <div class="order-items">${itemsHtml}</div>
      </div>
    `;
  }).join('');
}

// ===== ACTIONS =====
async function toggleItem(orderId, itemId) {
  const orders = await dbGetOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  item.status = item.status === 'pending' ? 'done' : 'pending';
  const newStatus = items.every(i => i.status === 'done') ? 'done' : 'pending';
  // ถ้าเสร็จทั้งหมด → บันทึกสถิติ
  if (newStatus === 'done' && order.status !== 'done') {
    await dbSaveToStats({ ...order, items: JSON.stringify(items) });
  }
  await dbUpdateOrder(orderId, { items: JSON.stringify(items), status: newStatus });
  renderDashboard();
}

async function toggleOrderDone(orderId, currentStatus) {
  const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
  const orders = await dbGetOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  items.forEach(i => i.status = newStatus);
  // ถ้ากดเสร็จ → บันทึกสถิติ
  if (newStatus === 'done') {
    await dbSaveToStats({ ...order, items: JSON.stringify(items) });
  }
  await dbUpdateOrder(orderId, { status: newStatus, items: JSON.stringify(items) });
  renderDashboard();
}

async function deleteOrder(orderId) {
  if (!confirm('ลบออเดอร์นี้?')) return;
  await dbDeleteOrder(orderId);
  renderDashboard();
}

async function deleteAllOrders() {
  const orders = await dbGetOrders();
  if (orders.length === 0) { alert('ไม่มีออเดอร์ให้ลบ'); return; }
  if (!confirm(`⚠️ ลบออเดอร์วันนี้ทั้งหมด ${orders.length} รายการ?\nสถิติจะยังคงอยู่ครับ`)) return;
  await dbDeleteAllToday();
  renderDashboard();
}

// ===== STATS (อ่านจาก stats table แยกต่างหาก) =====
async function renderStats() {
  const all = await dbGetStats();
  const el = document.getElementById('stats-body');

  if (all.length === 0) {
    el.innerHTML = '<div class="no-orders" style="padding:40px">ยังไม่มีข้อมูล (สถิติจะขึ้นเมื่อกดเสร็จออเดอร์)</div>';
    return;
  }

  const grouped = {};
  all.forEach(o => {
    if (!grouped[o.date]) grouped[o.date] = [];
    grouped[o.date].push(o);
  });

  const keys = Object.keys(grouped).sort().reverse();

  el.innerHTML = keys.map(key => {
    const orders = grouped[key];
    const totalPacks = orders.reduce((s, o) => {
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      return s + items.reduce((si, i) => si + i.qty, 0);
    }, 0);

    const typeCounts = {};
    orders.forEach(o => {
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      items.forEach(i => { typeCounts[i.name] = (typeCounts[i.name] || 0) + i.qty; });
    });
    const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    const maxVal = sorted[0]?.[1] || 1;

    const barsHtml = sorted.map(([name, cnt]) => {
      const item = RAMEN_MENU.find(r => r.name === name);
      const pct = Math.round((cnt / maxVal) * 100);
      return `
        <div class="stat-bar-row">
          <span class="stat-bar-label">${item?.emoji || '🍜'} ${name}</span>
          <div class="stat-bar-bg">
            <div class="stat-bar-fill" style="width:${pct}%;background:${item?.color || '#E84545'}"></div>
          </div>
          <span class="stat-bar-num">${cnt} ซอง</span>
        </div>
      `;
    }).join('');

    return `
      <div class="stat-day-card">
        <div class="stat-day-header">
          <span class="stat-date">${formatDateKey(key)}</span>
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="stat-totals">${orders.length} ออเดอร์ · ${totalPacks} ซอง</span>
            <button onclick="deleteStatsByDate('${key}')"
              style="background:transparent;color:#E84545;border:1px solid #E84545;border-radius:6px;padding:4px 10px;font-size:12px;font-family:'Noto Sans Thai',sans-serif;cursor:pointer;">
              🗑 ลบวันนี้
            </button>
          </div>
        </div>
        <div class="stat-bars">${barsHtml}</div>
      </div>
    `;
  }).join('');
}

async function deleteStatsByDate(date) {
  if (!confirm(`ลบสถิติวันที่ ${date}?`)) return;
  await dbDeleteStatsByDate(date);
  renderStats();
}

// ===== AUTO REFRESH =====
function startAutoRefresh() {
  refreshTimer = setInterval(() => {
    if (document.getElementById('tab-orders').classList.contains('active')) {
      renderDashboard();
    }
  }, 15000);
}

// ===== HELPERS =====
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}
function getElapsed(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'เพิ่งสั่ง';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  return `${Math.floor(m/60)} ชม. ${m%60} นาที`;
}
function getElapsedClass(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m >= 15) return 'elapsed-danger';
  if (m >= 7) return 'elapsed-warn';
  return 'elapsed-ok';
}
function formatDateKey(key) {
  const [y, m, d] = key.split('-');
  const months = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return key === getTodayKey()
    ? `📅 วันนี้ (${d} ${months[parseInt(m)]} ${parseInt(y)+543})`
    : `📅 ${d} ${months[parseInt(m)]} ${parseInt(y)+543}`;
}

// ===== เสียงแจ้งเตือน =====
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    activeAudioCtx = ctx;
    const now = ctx.currentTime;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -10;
    compressor.knee.value = 0;
    compressor.ratio.value = 20;
    compressor.attack.value = 0;
    compressor.release.value = 0.1;
    compressor.connect(ctx.destination);

    const times = [0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6, 6.4];
    times.forEach(t => {
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(3.0, now + t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
      noise.connect(noiseGain);
      noiseGain.connect(compressor);
      noise.start(now + t);

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now + t);
      osc1.frequency.exponentialRampToValueAtTime(55, now + t + 0.35);
      gain1.gain.setValueAtTime(3.0, now + t);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
      osc1.connect(gain1);
      gain1.connect(compressor);
      osc1.start(now + t);
      osc1.stop(now + t + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1800, now + t + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(800, now + t + 0.3);
      gain2.gain.setValueAtTime(2.5, now + t + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + t + 0.35);
      osc2.connect(gain2);
      gain2.connect(compressor);
      osc2.start(now + t + 0.05);
      osc2.stop(now + t + 0.35);
    });
  } catch(e) {}
}

// ===== toast แจ้งเตือน =====
function showToast(msg) {
  const existing = document.getElementById('order-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'order-toast';
  toast.className = 'order-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ===== toggle เสียง =====
function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('btn-sound');
  if (btn) btn.textContent = soundEnabled ? '🔔 เสียงเปิด' : '🔕 เสียงปิด';
}

// ===== เพิ่ม: จัดการเมนูหมด/งดจำหน่าย =====
function renderMenuManage() {
  const soldOutMap = JSON.parse(localStorage.getItem('soldOutMap') || '{}');
  const el = document.getElementById('menu-manage-list');
  el.innerHTML = RAMEN_MENU.map(item => {
    const isSoldOut = soldOutMap[item.id] || false;
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:28px;">${item.emoji}</span>
          <div>
            <div style="font-family:'Noto Sans Thai',sans-serif;font-weight:700;color:#fff;">${item.name}</div>
            <div style="font-family:'Noto Sans Thai',sans-serif;font-size:12px;color:#888;">${item.flavor}</div>
          </div>
        </div>
        <button onclick="toggleSoldOut('${item.id}')"
          style="background:${isSoldOut ? '#E84545' : '#2ecc71'};color:#fff;border:none;border-radius:8px;padding:8px 18px;font-family:'Noto Sans Thai',sans-serif;font-weight:700;font-size:14px;cursor:pointer;">
          ${isSoldOut ? '🔴 หมด/งด' : '🟢 มีขาย'}
        </button>
      </div>
    `;
  }).join('');
}

function toggleSoldOut(id) {
  const soldOutMap = JSON.parse(localStorage.getItem('soldOutMap') || '{}');
  soldOutMap[id] = !soldOutMap[id];
  localStorage.setItem('soldOutMap', JSON.stringify(soldOutMap));
  renderMenuManage();
}

// ===== เพิ่ม: สถิติรายโต๊ะ =====
async function renderTableStats() {
  const all = await dbGetStats();
  const el = document.getElementById('table-stats-body');
  if (!el) return;

  if (all.length === 0) {
    el.innerHTML = '<div class="no-orders" style="padding:40px">ยังไม่มีข้อมูล</div>';
    return;
  }

  // populate date filter
  const dateFilter = document.getElementById('date-filter');
  const tableFilter = document.getElementById('table-filter');
  const allDates = [...new Set(all.map(o => o.date))].sort().reverse();
  const allTables = [...new Set(all.map(o => o.table_num))].filter(Boolean).sort((a,b) => a-b);

  // เพิ่ม option ถ้ายังไม่มี
  if (dateFilter.options.length <= 1) {
    allDates.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d === getTodayKey() ? `วันนี้ (${d})` : d;
      dateFilter.appendChild(opt);
    });
  }
  if (tableFilter.options.length <= 1) {
    allTables.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = `โต๊ะ ${t}`;
      tableFilter.appendChild(opt);
    });
  }

  const selectedDate = dateFilter.value;
  const selectedTable = tableFilter.value;

  let filtered = all;
  if (selectedDate !== 'all') filtered = filtered.filter(o => o.date === selectedDate);
  if (selectedTable !== 'all') filtered = filtered.filter(o => String(o.table_num) === String(selectedTable));

  if (filtered.length === 0) {
    el.innerHTML = '<div class="no-orders" style="padding:40px">ไม่มีข้อมูลในช่วงที่เลือก</div>';
    return;
  }

  // จัดกลุ่มตามโต๊ะ
  const byTable = {};
  filtered.forEach(o => {
    const t = o.table_num || '?';
    if (!byTable[t]) byTable[t] = [];
    byTable[t].push(o);
  });

  const tableKeys = Object.keys(byTable).sort((a,b) => parseInt(a)-parseInt(b));

  el.innerHTML = tableKeys.map(tNum => {
    const orders = byTable[tNum];
    const typeCounts = {};
    let totalPacks = 0;
    orders.forEach(o => {
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      items.forEach(i => {
        typeCounts[i.name] = (typeCounts[i.name] || 0) + i.qty;
        totalPacks += i.qty;
      });
    });
    const sorted = Object.entries(typeCounts).sort((a,b) => b[1]-a[1]);
    const itemsHtml = sorted.map(([name, cnt]) => {
      const item = RAMEN_MENU.find(r => r.name === name);
      return `<span style="display:inline-block;background:#2a2a2a;border-radius:6px;padding:4px 10px;font-family:'Noto Sans Thai',sans-serif;font-size:13px;margin:3px;">${item?.emoji || '🍜'} ${name} × ${cnt}</span>`;
    }).join('');

    return `
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-family:'Black Han Sans',sans-serif;font-size:18px;color:#E84545;">🪑 โต๊ะ ${tNum}</span>
          <span style="font-family:'Noto Sans Thai',sans-serif;font-size:13px;color:#888;">${orders.length} ออเดอร์ · ${totalPacks} ซอง</span>
        </div>
        <div>${itemsHtml}</div>
      </div>
    `;
  }).join('');
}
