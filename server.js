import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = 'energoferon41@gmail.com';

// DATABASE_URL должен быть предоставлен через переменные окружения Railway
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PG_URL;

let pool = null;

if (DATABASE_URL) {
  pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  console.log('PostgreSQL pool initialized');
} else {
  console.warn('WARNING: No DATABASE_URL provided - database features will not work');
}

app.use(cors());
app.use(express.json({ limit: '100mb' }));

// ===== Static files (must be before API routes) =====
app.use(express.static(path.join(__dirname, 'dist')));

// ===== DB Init =====
async function initDB() {
  if (!pool) {
    console.log('Skipping DB init - no pool');
    return;
  }
  
  const c = await pool.connect();
  try {
    console.log('Initializing database tables...');
    
    await c.query(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, avatar_color TEXT NOT NULL DEFAULT '#3B82F6', subscription TEXT NOT NULL DEFAULT 'none', subscription_end TIMESTAMPTZ, monthly_downloads INT NOT NULL DEFAULT 0, total_downloads INT NOT NULL DEFAULT 0, monthly_reset_at TIMESTAMPTZ, is_admin BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    
    await c.query(`CREATE TABLE IF NOT EXISTS sounds (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Drums', tags TEXT[] NOT NULL DEFAULT '{}', downloads INT NOT NULL DEFAULT 0, plays INT NOT NULL DEFAULT 0, is_free BOOLEAN NOT NULL DEFAULT true, duration TEXT NOT NULL DEFAULT '0:00', duration_seconds INT NOT NULL DEFAULT 0, waveform REAL[] NOT NULL DEFAULT '{}', date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(), author_id TEXT NOT NULL, author_name TEXT NOT NULL, file_data TEXT, file_name TEXT)`);
    
    await c.query(`CREATE TABLE IF NOT EXISTS packs (id TEXT PRIMARY KEY, title TEXT NOT NULL, sound_count INT NOT NULL DEFAULT 0, category TEXT NOT NULL DEFAULT 'Pack', is_free BOOLEAN NOT NULL DEFAULT true, downloads INT NOT NULL DEFAULT 0, author_id TEXT NOT NULL, author_name TEXT NOT NULL, date_added TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    
    await c.query(`CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), expires_at TIMESTAMPTZ NOT NULL)`);
    
    await c.query(`CREATE TABLE IF NOT EXISTS pending_sounds (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Drums', tags TEXT[] NOT NULL DEFAULT '{}', is_free BOOLEAN NOT NULL DEFAULT true, duration TEXT NOT NULL DEFAULT '0:00', duration_seconds INT NOT NULL DEFAULT 0, waveform REAL[] NOT NULL DEFAULT '{}', date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(), author_id TEXT NOT NULL, author_name TEXT NOT NULL, file_data TEXT, file_name TEXT)`);
    
    await c.query(`CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, user_name TEXT NOT NULL, user_email TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    
    await c.query(`CREATE TABLE IF NOT EXISTS broadcasts (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, target_user_id TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);

    await c.query(`CREATE TABLE IF NOT EXISTS user_broadcasts (user_id TEXT NOT NULL, broadcast_id TEXT NOT NULL, read BOOLEAN NOT NULL DEFAULT false, PRIMARY KEY (user_id, broadcast_id))`);

    // Add plays column if missing
    try { await c.query(`ALTER TABLE sounds ADD COLUMN IF NOT EXISTS plays INT NOT NULL DEFAULT 0`); } catch (e) { /* ignore */ }
    try { await c.query(`ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS target_user_id TEXT`); } catch (e) { /* ignore */ }
    try { await c.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_downloads INT NOT NULL DEFAULT 0`); } catch (e) { /* ignore */ }
    try { await c.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_reset_at TIMESTAMPTZ`); } catch (e) { /* ignore */ }
    
    // Set main admin
    await c.query(`UPDATE users SET is_admin=true WHERE LOWER(email)=LOWER($1)`, [ADMIN_EMAIL]);
    
    // Verify tables
    const tables = await c.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`);
    console.log('DB tables ready:', tables.rows.map(r => r.tablename).join(', '));
  } catch (e) { 
    console.error('DB init error:', e.message); 
  } finally { 
    c.release(); 
  }
}

// ===== Auth helpers =====
function genToken() { return Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

async function createSession(uid) { 
  if (!pool) return null;
  const t = genToken(); 
  const exp = new Date(Date.now() + 30*24*3600*1000); 
  await pool.query('INSERT INTO sessions (token,user_id,expires_at) VALUES ($1,$2,$3)', [t, uid, exp]); 
  return t; 
}

async function getUser(req) { 
  if (!pool) return null;
  const auth = req.headers.authorization; 
  if (!auth?.startsWith('Bearer ')) return null; 
  try { 
    const s = await pool.query('SELECT user_id FROM sessions WHERE token=$1 AND expires_at>NOW()', [auth.slice(7)]); 
    if (!s.rows.length) return null; 
    const u = await pool.query('SELECT * FROM users WHERE id=$1', [s.rows[0].user_id]); 
    return u.rows[0] || null; 
  } catch { return null; } 
}

function isAdmin(u) { return u && (u.email === ADMIN_EMAIL || u.is_admin); }
const COLORS = ['#EF4444','#F97316','#EAB308','#22C55E','#14B8A6','#3B82F6','#6366F1','#8B5CF6','#EC4899','#F43F5E'];
function fmtUser(u) { return { id:u.id, name:u.name, email:u.email, avatarColor:u.avatar_color, subscription:u.subscription, subscriptionEnd:u.subscription_end, monthlyDownloads:u.monthly_downloads, totalDownloads:u.total_downloads||0, createdAt:u.created_at }; }
function fmtSound(s) { return { id:s.id, title:s.title, category:s.category, bpm:0, key:'-', tags:s.tags||[], downloads:s.downloads, plays:s.plays||0, isFree:s.is_free, isNew:true, waveform:s.waveform||[], duration:s.duration, durationSeconds:s.duration_seconds, dateAdded:s.date_added, authorId:s.author_id, authorName:s.author_name, fileData:s.file_data, fileName:s.file_name }; }
function fmtPack(p) { return { id:p.id, title:p.title, soundCount:p.sound_count, category:p.category, isFree:p.is_free, downloads:p.downloads, authorId:p.author_id, authorName:p.author_name, dateAdded:p.date_added }; }
function genWave(seed) { const w=[]; for(let i=0;i<60;i++){const v=Math.abs(Math.sin(i*0.3+seed)*0.4+Math.sin(i*0.7+seed*2)*0.3+Math.sin(i*1.1+seed*0.5)*0.2+Math.sin(i*0.15+seed*3)*0.1);w.push(Math.min(1,Math.max(0.06,v)));} return w; }

function compressAudio(base64Data) {
  // Просто проверяем что данные валидные, НЕ обрезаем (это ломало файлы > 2 мин)
  if (!base64Data || !base64Data.startsWith('data:audio')) return base64Data;
  return base64Data;
}

// ===== Health check =====
app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: !!pool, env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
});

// ===== Auth Routes =====
app.post('/api/register', async (req, res) => {
  if (!pool) return res.json({ ok: false, error: 'Сервер не настроен (нет БД)' });
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password?.trim()) return res.json({ ok: false, error: 'Заполните все поля' });
    if (password.length < 4) return res.json({ ok: false, error: 'Пароль минимум 4 символа' });
    const ex = await pool.query('SELECT id FROM users WHERE LOWER(email)=LOWER($1)', [email]);
    if (ex.rows.length) return res.json({ ok: false, error: 'Этот email уже зарегистрирован' });
    const id = genId();
    const hash = await bcrypt.hash(password, 10);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    await pool.query('INSERT INTO users (id, name, email, password, avatar_color) VALUES ($1, $2, $3, $4, $5)', [id, name.trim(), email.trim().toLowerCase(), hash, color]);
    const u = (await pool.query('SELECT * FROM users WHERE id=$1', [id])).rows[0];
    const token = await createSession(id);
    res.json({ ok: true, user: fmtUser(u), token });
  } catch (e) { console.error('register:', e); res.json({ ok: false, error: 'Ошибка сервера' }); }
});

app.post('/api/login', async (req, res) => {
  if (!pool) return res.json({ ok: false, error: 'Сервер не настроен (нет БД)' });
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) return res.json({ ok: false, error: 'Заполните все поля' });
    const r = await pool.query('SELECT * FROM users WHERE LOWER(email)=LOWER($1)', [email]);
    if (!r.rows.length) return res.json({ ok: false, error: 'Неверный email или пароль' });
    const u = r.rows[0];
    if (!await bcrypt.compare(password, u.password)) return res.json({ ok: false, error: 'Неверный email или пароль' });
    const token = await createSession(u.id);
    res.json({ ok: true, user: fmtUser(u), token });
  } catch (e) { console.error('login:', e); res.json({ ok: false, error: 'Ошибка сервера' }); }
});

app.get('/api/me', async (req, res) => {
  try {
    const u = await getUser(req);
    if (!u) return res.json({ ok: false });
    res.json({ ok: true, user: fmtUser(u) });
  } catch { res.json({ ok: false }); }
});

app.post('/api/logout', async (req, res) => {
  try {
    const a = req.headers.authorization;
    if (a?.startsWith('Bearer ')) await pool?.query('DELETE FROM sessions WHERE token=$1', [a.slice(7)]);
  } catch {}
  res.json({ ok: true });
});

app.post('/api/user/update-name', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!u) return res.json({ ok: false });
    await pool.query('UPDATE users SET name=$1 WHERE id=$2', [req.body.name.trim(), u.id]);
    const up = (await pool.query('SELECT * FROM users WHERE id=$1', [u.id])).rows[0];
    res.json({ ok: true, user: fmtUser(up) });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

app.post('/api/user/subscribe', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!u) return res.json({ ok: false });
    const { plan } = req.body;
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    await pool.query('UPDATE users SET subscription=$1, subscription_end=$2, monthly_downloads=0 WHERE id=$3', [plan, plan !== 'none' ? end.toISOString() : null, u.id]);
    const up = (await pool.query('SELECT * FROM users WHERE id=$1', [u.id])).rows[0];
    res.json({ ok: true, user: fmtUser(up) });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

// ===== Sound Routes =====
app.get('/api/sounds', async (req, res) => {
  if (!pool) return res.json([]);
  try {
    const r = await pool.query('SELECT * FROM sounds ORDER BY date_added DESC');
    res.json(r.rows.map(fmtSound));
  } catch (e) { console.error(e); res.json([]); }
});

app.post('/api/sounds', async (req, res) => {
  if (!pool) return res.json({ ok: false, error: 'Сервер не настроен (нет БД)' });
  try {
    const u = await getUser(req);
    if (!u) return res.json({ ok: false, error: 'Не авторизован' });
    const { title, category, tags, isFree, duration, durationSeconds, fileData, fileName } = req.body;
    if (!title?.trim()) return res.json({ ok: false, error: 'Введите название' });
    const id = genId();
    const wf = genWave(Math.random() * 100);
    const compressed = compressAudio(fileData);
    const authorName = isAdmin(u) ? 'KITSTUDIO' : u.name;

    if (isAdmin(u)) {
      await pool.query('INSERT INTO sounds (id, title, category, tags, is_free, duration, duration_seconds, waveform, author_id, author_name, file_data, file_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [id, title, category, tags || [], isFree, duration, durationSeconds, wf, u.id, authorName, compressed || null, fileName || null]);
    } else {
      await pool.query('INSERT INTO pending_sounds (id, title, category, tags, is_free, duration, duration_seconds, waveform, author_id, author_name, file_data, file_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [id, title, category, tags || [], isFree, duration, durationSeconds, wf, u.id, u.name, compressed || null, fileName || null]);
    }
    res.json({ ok: true, pending: !isAdmin(u) });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

app.post('/api/sounds/:id/download', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    await pool.query('UPDATE sounds SET downloads=downloads+1 WHERE id=$1', [req.params.id]);
    const u = await getUser(req);
    if (u && !isAdmin(u)) {
      // Проверка сброса месячного счетчика (каждый месяц 1-го числа)
      const now = new Date();
      const resetAt = u.monthly_reset_at ? new Date(u.monthly_reset_at) : null;
      const shouldReset = !resetAt || (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear());
      
      if (shouldReset) {
        // Первый день следующего месяца
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        await pool.query('UPDATE users SET monthly_downloads=1, total_downloads=total_downloads+1, monthly_reset_at=$1 WHERE id=$2', [nextMonth.toISOString(), u.id]);
      } else {
        await pool.query('UPDATE users SET monthly_downloads=monthly_downloads+1, total_downloads=total_downloads+1 WHERE id=$1', [u.id]);
      }
    }
    res.json({ ok: true });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

app.post('/api/sounds/:id/delete', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!u) return res.json({ ok: false, error: 'Не авторизован' });
    // Проверка: можно удалять только свои звуки
    const r = await pool.query('SELECT author_id FROM sounds WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.json({ ok: false, error: 'Звук не найден' });
    if (r.rows[0].author_id !== u.id && !isAdmin(u)) return res.json({ ok: false, error: 'Нет прав' });
    await pool.query('DELETE FROM sounds WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

app.post('/api/sounds/:id/play', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    await pool.query('UPDATE sounds SET plays=plays+1 WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

// ===== Pack Routes =====
app.get('/api/packs', async (req, res) => {
  if (!pool) return res.json([]);
  try {
    const r = await pool.query('SELECT * FROM packs ORDER BY date_added DESC');
    res.json(r.rows.map(fmtPack));
  } catch (e) { console.error(e); res.json([]); }
});

app.post('/api/packs', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!u) return res.json({ ok: false });
    const { title, soundCount, category, isFree } = req.body;
    const id = genId();
    const authorName = isAdmin(u) ? 'KITSTUDIO' : u.name;
    await pool.query('INSERT INTO packs (id, title, sound_count, category, is_free, author_id, author_name) VALUES ($1, $2, $3, $4, $5, $6, $7)', [id, title, soundCount, category, isFree, u.id, authorName]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

// ===== Stats =====
app.get('/api/stats', async (req, res) => {
  if (!pool) return res.json({ totalSounds: 0, totalDownloads: 0 });
  try {
    const s = await pool.query('SELECT COUNT(*) as c, COALESCE(SUM(downloads), 0) as d FROM sounds');
    const p = await pool.query('SELECT COALESCE(SUM(downloads), 0) as d FROM packs');
    res.json({ totalSounds: parseInt(s.rows[0].c), totalDownloads: parseInt(s.rows[0].d) + parseInt(p.rows[0].d) });
  } catch (e) { console.error(e); res.json({ totalSounds: 0, totalDownloads: 0 }); }
});

// ===== Reports =====
app.post('/api/reports', async (req, res) => {
  if (!pool) return res.json({ ok: false, error: 'Сервер не настроен' });
  try {
    const u = await getUser(req);
    if (!u) return res.json({ ok: false, error: 'Не авторизован' });
    const { message } = req.body;
    if (!message?.trim()) return res.json({ ok: false, error: 'Введите сообщение' });
    const id = genId();
    await pool.query('INSERT INTO reports (id, user_id, user_name, user_email, message) VALUES ($1, $2, $3, $4, $5)', [id, u.id, u.name, u.email, message.trim()]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

// ===== Broadcasts =====
app.get('/api/broadcasts', async (req, res) => {
  if (!pool) return res.json({ broadcasts: [], unread: 0 });
  try {
    const u = await getUser(req);
    if (!u) return res.json({ broadcasts: [], unread: 0 });
    const r = await pool.query(`SELECT b.*, COALESCE(ub.read, false) as read FROM broadcasts b LEFT JOIN user_broadcasts ub ON b.id=ub.broadcast_id AND ub.user_id=$1 WHERE b.target_user_id IS NULL OR b.target_user_id=$1 ORDER BY b.created_at DESC LIMIT 50`, [u.id]);
    const broadcasts = r.rows.map(b => ({ id: b.id, title: b.title, body: b.body, createdAt: b.created_at, read: b.read }));
    const unread = broadcasts.filter(b => !b.read).length;
    res.json({ broadcasts, unread });
  } catch (e) { console.error(e); res.json({ broadcasts: [], unread: 0 }); }
});

app.post('/api/broadcasts/mark-read', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!u) return res.json({ ok: false });
    const { broadcastId } = req.body;
    await pool.query('INSERT INTO user_broadcasts (user_id, broadcast_id, read) VALUES ($1, $2, true) ON CONFLICT (user_id, broadcast_id) DO UPDATE SET read=true', [u.id, broadcastId]);
    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
});

// ===== Admin Routes =====
app.get('/api/admin/sounds', async (req, res) => {
  if (!pool) return res.json([]);
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json([]);
    const r = await pool.query('SELECT id, title, category, author_name, downloads, date_added, file_data FROM sounds ORDER BY date_added DESC');
    res.json(r.rows.map(s => ({ id: s.id, title: s.title, category: s.category, authorName: s.author_name, downloads: s.downloads, dateAdded: s.date_added, fileData: s.file_data })));
  } catch { res.json([]); }
});

app.get('/api/admin/pending', async (req, res) => {
  if (!pool) return res.json([]);
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json([]);
    const r = await pool.query('SELECT * FROM pending_sounds ORDER BY date_added DESC');
    res.json(r.rows.map(fmtSound));
  } catch { res.json([]); }
});

app.get('/api/admin/users', async (req, res) => {
  if (!pool) return res.json([]);
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json([]);
    const r = await pool.query('SELECT id, name, email, avatar_color, subscription, is_admin, created_at FROM users ORDER BY created_at DESC');
    res.json(r.rows.map(u => ({ id: u.id, name: u.name, email: u.email, avatarColor: u.avatar_color, subscription: u.subscription, isAdmin: u.is_admin, createdAt: u.created_at })));
  } catch { res.json([]); }
});

app.get('/api/admin/reports', async (req, res) => {
  if (!pool) return res.json([]);
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json([]);
    const r = await pool.query(`SELECT * FROM reports WHERE status='new' ORDER BY created_at DESC`);
    res.json(r.rows);
  } catch { res.json([]); }
});

app.post('/api/admin/sounds/delete', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json({ ok: false });
    await pool.query('DELETE FROM sounds WHERE id=$1', [req.body.soundId]);
    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
});

app.post('/api/admin/pending/approve', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json({ ok: false });
    const { soundId } = req.body;
    const r = await pool.query('SELECT * FROM pending_sounds WHERE id=$1', [soundId]);
    if (!r.rows.length) return res.json({ ok: false });
    const s = r.rows[0];
    await pool.query('INSERT INTO sounds (id, title, category, tags, is_free, duration, duration_seconds, waveform, author_id, author_name, file_data, file_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [s.id, s.title, s.category, s.tags, s.is_free, s.duration, s.duration_seconds, s.waveform, s.author_id, s.author_name, s.file_data, s.file_name]);
    await pool.query('DELETE FROM pending_sounds WHERE id=$1', [soundId]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

app.post('/api/admin/pending/reject', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json({ ok: false });
    await pool.query('DELETE FROM pending_sounds WHERE id=$1', [req.body.soundId]);
    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
});

app.post('/api/admin/users/delete', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json({ ok: false });
    const { userId } = req.body;
    await pool.query('DELETE FROM sessions WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM pending_sounds WHERE author_id=$1', [userId]);
    await pool.query('DELETE FROM sounds WHERE author_id=$1', [userId]);
    await pool.query('DELETE FROM packs WHERE author_id=$1', [userId]);
    await pool.query('DELETE FROM reports WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM user_broadcasts WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

app.post('/api/admin/users/set-admin', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json({ ok: false, error: 'Нет прав администратора' });
    
    // Защита Директора
    const target = await pool.query('SELECT email FROM users WHERE id=$1', [req.body.userId]);
    if (!target.rows.length) return res.json({ ok: false, error: 'Пользователь не найден' });
    if (target.rows[0].email === ADMIN_EMAIL) return res.json({ ok: false, error: 'Директор всегда остаётся администратором' });
    
    const { userId, isAdmin: grant } = req.body;
    const result = await pool.query('UPDATE users SET is_admin=$1 WHERE id=$2 RETURNING id, name, email, is_admin', [grant, userId]);
    
    if (result.rows.length === 0) return res.json({ ok: false, error: 'Не удалось обновить' });
    
    console.log(`Admin set-admin: ${result.rows[0].email} is_admin=${result.rows[0].is_admin}`);
    res.json({ ok: true, user: { id: result.rows[0].id, isAdmin: result.rows[0].is_admin } });
  } catch (e) { console.error('set-admin error:', e); res.json({ ok: false, error: 'Ошибка сервера' }); }
});

app.post('/api/admin/reports/mark-read', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json({ ok: false });
    await pool.query(`UPDATE reports SET status='read' WHERE id=$1`, [req.body.reportId]);
    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
});

app.post('/api/admin/broadcasts', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json({ ok: false });
    const { title, body } = req.body;
    if (!title?.trim() || !body?.trim()) return res.json({ ok: false });
    const id = genId();
    await pool.query('INSERT INTO broadcasts (id, title, body) VALUES ($1, $2, $3)', [id, title.trim(), body.trim()]);
    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
});

// Системное сообщение конкретному пользователю - помечается user_id
app.post('/api/admin/send-system-message', async (req, res) => {
  if (!pool) return res.json({ ok: false });
  try {
    const u = await getUser(req);
    if (!isAdmin(u)) return res.json({ ok: false, error: 'Нет прав' });
    const { userId, title, body } = req.body;
    if (!userId || !title?.trim() || !body?.trim()) return res.json({ ok: false, error: 'Не указаны параметры' });
    const id = genId();
    // Сохраняем в broadcasts с user_id для фильтрации
    await pool.query('INSERT INTO broadcasts (id, title, body, target_user_id) VALUES ($1, $2, $3, $4)', [id, title.trim(), body.trim(), userId]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.json({ ok: false }); }
});

// SPA fallback - serves index.html for all non-API routes
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 404 for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ===== Start server =====
async function start() {
  console.log(`Starting server on port ${PORT}...`);
  console.log(`DATABASE_URL: ${DATABASE_URL ? 'configured' : 'NOT SET'}`);
  
  if (DATABASE_URL) {
    try {
      await initDB();
      console.log('Database initialized successfully');
    } catch (e) {
      console.error('DB init failed:', e.message);
    }
  } else {
    console.warn('Running without database - data will not persist');
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch(e => {
  console.error('Startup failed:', e);
  process.exit(1);
});
