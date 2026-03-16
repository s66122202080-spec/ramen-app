// ===== STATE =====
let currentFilter = 'all';
let refreshTimer = null;
let lastOrderCount = -1;
let soundEnabled = true;
let activeAudioCtx = null;   // เพิ่ม: เก็บ context เสียงที่กำลังดัง
let soundTimeouts = [];       // เพิ่ม: เก็บ timeout ที่กำลังรอ

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  startAutoRefresh();

  // เพิ่ม: แตะ/คลิกที่ไหนก็ได้ → หยุดเสียงและสั่น
  document.addEventListener('touchstart', stopAlerts, { passive: true });
  document.addEventListener('click', stopAlerts);
});

// ===== เพิ่ม: หยุดเสียงและสั่นทันที =====
function stopAlerts() {
  // หยุด timeout ที่รออยู่ทั้งหมด
  soundTimeouts.forEach(t => clearTimeout(t));
  soundTimeouts = [];
  // หยุดเสียง
  if (activeAudioCtx) {
    try { activeAudioCtx.close(); } catch(e) {}
    activeAudioCtx = null;
  }
  // หยุดสั่น
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
}

// ===== DASHBOARD =====
async function renderDashboard() {
  const orders = await dbGetOrders();

  // เพิ่ม: เช็คออเดอร์ใหม่
  if (lastOrderCount >= 0 && orders.length > lastOrderCount) {
    const newCount = orders.length - lastOrderCount;
    // เล่นเสียง + สั่น 1 ครั้งต่อ 1 ออเดอร์
    stopAlerts(); // หยุดเสียงเก่าก่อน
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
    showToast(`🔔 มีออเดอร์ใหม่ ${newCount} รายการ!`);
  }
  lastOrderCount = orders.length;

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
  let filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  filtered = [...filtered].sort((a, b) => a.queue - b.queue);

  const el = document.getElementById('orders-list');
  if (filtered.length === 0) {
    el.innerHTML = '<div class="no-orders">ไม่มีออเดอร์</div>';
    return;
  }

  el.innerHTML = filtered.map(order => {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const elapsed = getElapsed(order.created_at);
    const isDone = order.status === 'done';

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
          <div class="order-queue" style="${isDone ? 'background:#2ecc71' : ''}">Q${order.queue}</div>
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
  if (!confirm(`⚠️ ลบออเดอร์วันนี้ทั้งหมด ${orders.length} รายการ?\nกดตกลงเพื่อยืนยัน`)) return;
  await dbDeleteAllToday();
  renderDashboard();
}

// ===== STATS =====
async function renderStats() {
  const all = await dbGetAllOrders();
  const el = document.getElementById('stats-body');

  if (all.length === 0) {
    el.innerHTML = '<div class="no-orders" style="padding:60px">ยังไม่มีข้อมูล</div>';
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
          <span class="stat-totals">${orders.length} ออเดอร์ · ${totalPacks} ซอง</span>
        </div>
        <div class="stat-bars">${barsHtml}</div>
      </div>
    `;
  }).join('');
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

// ===== เพิ่ม: เสียงแจ้งเตือน =====
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    activeAudioCtx = ctx; // เก็บไว้เพื่อหยุดได้
    const now = ctx.currentTime;

    // compressor ทำให้เสียงดังและชัดขึ้นมาก
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -10;
    compressor.knee.value = 0;
    compressor.ratio.value = 20;
    compressor.attack.value = 0;
    compressor.release.value = 0.1;
    compressor.connect(ctx.destination);

    // ดังซ้ำทุก 0.8 วินาที รวม 7 วินาที = ~8 ครั้ง
    const times = [0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6, 6.4];
    times.forEach(t => {
      // เสียงกลองโหด
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

      // เสียงต่ำหนัก
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

      // เสียง ping แหลม
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

// ===== เพิ่ม: toast แจ้งเตือน =====
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

// ===== เพิ่ม: toggle เสียง =====
function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('btn-sound');
  if (btn) btn.textContent = soundEnabled ? '🔔 เสียงเปิด' : '🔕 เสียงปิด';
}
