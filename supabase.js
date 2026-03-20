// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://qpufgsxedeikvpxrvpeq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdWZnc3hlZGVpa3ZweHJ2cGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTgxOTQsImV4cCI6MjA4OTIzNDE5NH0.TEwmFSrp0_xnk5zexN_Mh5t-8cQd3qd9Cg1eYD-Vnug';

// ===== API HELPERS =====
async function dbGetOrders() {
  const today = getTodayKey();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?date=eq.${today}&order=queue.asc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  if (!res.ok) return [];
  return await res.json();
}

async function dbInsertOrder(order) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(order)
  });
  return await res.json();
}

async function dbUpdateOrder(id, data) {
  await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

async function dbDeleteOrder(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
}

async function dbDeleteAllToday() {
  const today = getTodayKey();
  await fetch(`${SUPABASE_URL}/rest/v1/orders?date=eq.${today}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
}

async function dbDeleteByDate(date) {
  await fetch(`${SUPABASE_URL}/rest/v1/orders?date=eq.${date}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
}

async function dbGetAllOrders() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?order=date.desc,queue.asc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  if (!res.ok) return [];
  return await res.json();
}

async function dbGetTodayQueueCount() {
  const today = getTodayKey();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?date=eq.${today}&select=queue`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.length;
}

// ===== DATE HELPER =====
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ===== เพิ่ม: บันทึกสถิติเมื่อกดเสร็จ =====
async function dbSaveToStats(order) {
  await fetch(`${SUPABASE_URL}/rest/v1/stats`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      date: order.date,
      name: order.name,
      table: order.table,
      items: typeof order.items === 'string' ? order.items : JSON.stringify(order.items),
      status: 'done',
      queue: order.queue,
      created_at: order.created_at,
      done_at: new Date().toISOString()
    })
  });
}

// ===== เพิ่ม: ดึงสถิติทั้งหมดจากตาราง stats =====
async function dbGetStats() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/stats?order=date.desc,queue.asc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  if (!res.ok) return [];
  return await res.json();
}

// ===== เพิ่ม: ลบสถิติแต่ละวันจากตาราง stats =====
async function dbDeleteStatsByDate(date) {
  await fetch(`${SUPABASE_URL}/rest/v1/stats?date=eq.${date}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
}
