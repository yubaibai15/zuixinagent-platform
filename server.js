const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const mammoth = require('mammoth');
const ExcelJS = require('exceljs');
const pdf = require('pdf-parse');

const app = express();
// CloudBase 不同部署入口的健康检查端口可能是 80 或 8080；同时监听两者，避免端口配置不一致。
const PORTS = [...new Set([Number(process.env.PORT || 80), 80, 8080])];
const ENV_ID = process.env.CLOUDBASE_ENV_ID || 'cs-d4glz3ytydaa6e72a';
const memoryMode = process.env.USE_MEMORY_STORE === 'true';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const memory = { users: [], agents: [], files: [], chats: [], workflows: [], knowledge_bases: [], model_configs: [], tool_configs: [], platform_settings: [], agent_versions: [], audit_logs: [], projects: [], tasks: [], deliverables: [], approvals: [], agent_launches: [] };
let rdb; let cloud;

if (!memoryMode) {
  const cloudbase = require('@cloudbase/node-sdk');
  cloud = cloudbase.init({ env: ENV_ID, accessKey: process.env.CLOUDBASE_APIKEY });
  // Node SDK 默认使用环境 ID 作为 schema；本项目建表位于 public schema。
  rdb = cloud.rdb({ database: 'public' });
}

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(x => x.trim()) : false }));
app.use(express.json({ limit: '1mb' }));
// 仅公开浏览器所需的两个文件，不把服务端代码、部署说明或示例配置暴露为静态资源。
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (_, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/group-platform.html', (_, res) => res.sendFile(path.join(__dirname, 'group-platform.html')));
for (const file of ['cloudbase-runtime.js', 'platform-features.js', 'bridge-runtime.js', 'preview-theme.css']) {
  app.get(`/${file}`, (_, res) => res.sendFile(path.join(__dirname, file)));
}
app.use('/assets', express.static(path.join(__dirname, 'assets')));
// 技能成果和下载资料与前端同域发布，部署后使用 /results 与 /downloads 相对链接即可访问。
app.use('/results', express.static(path.join(__dirname, 'results')));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const clean = (value, limit = 4000) => String(value || '').trim().slice(0, limit);

const columns = { _id: 'id', passwordHash: 'password_hash', jobRole: 'job_role', avatarKey: 'avatar_key', fixedAnswers: 'fixed_answers', systemPrompt: 'system_prompt', createdBy: 'created_by', updatedBy: 'updated_by', publishedAt: 'published_at', ownerId: 'owner_id', ownerEmail: 'owner_email', mimeType: 'mime_type', fileID: 'file_id', extractedText: 'extracted_text', userId: 'user_id', agentId: 'agent_id', modelId: 'model_id', baseUrl: 'base_url', versionNo: 'version_no', publishedBy: 'published_by', actorEmail: 'actor_email', targetType: 'target_type', targetId: 'target_id', projectId: 'project_id', taskId: 'task_id', assigneeEmail: 'assignee_email', dueDate: 'due_date', reviewerEmail: 'reviewer_email', deliverableId: 'deliverable_id', agentKey: 'agent_key', createdAt: 'created_at', updatedAt: 'updated_at' };
const reverseColumns = Object.fromEntries(Object.entries(columns).map(([key, value]) => [value, key]));
const toDb = data => Object.fromEntries(Object.entries(data).map(([key, value]) => [columns[key] || key, value]));
const fromDb = data => Object.fromEntries(Object.entries(data || {}).map(([key, value]) => [reverseColumns[key] || key, value]));
async function list(collection, query = {}) {
  if (memoryMode) return memory[collection].filter(x => Object.entries(query).every(([k, v]) => x[k] === v));
  let request = rdb.from(collection).select('*');
  for (const [key, value] of Object.entries(toDb(query))) request = request.eq(key, value);
  const { data, error } = await request.limit(100); if (error) throw new Error(error.message || '数据库查询失败。');
  return (data || []).map(fromDb);
}
async function one(collection, query) { return (await list(collection, query))[0] || null; }
async function insert(collection, data) {
  const record = { _id: data._id || id(), ...data, createdAt: data.createdAt || now(), updatedAt: now() };
  if (memoryMode) { memory[collection].push(record); return record; }
  const { data: rows, error } = await rdb.from(collection).insert(toDb(record)).select('*');
  if (error) throw new Error(error.message || '数据库写入失败。'); return fromDb(rows?.[0] || record);
}
async function change(collection, docId, data) {
  if (memoryMode) { const r = memory[collection].find(x => x._id === docId); if (!r) return null; Object.assign(r, data, { updatedAt: now() }); return r; }
  const { data: rows, error } = await rdb.from(collection).update(toDb({ ...data, updatedAt: now() })).eq('id', docId).select('*');
  if (error) throw new Error(error.message || '数据库更新失败。'); return rows?.[0] ? fromDb(rows[0]) : null;
}
async function audit(actor, action, targetType, targetId, detail = {}) {
  try { await insert('audit_logs', { actorEmail: actor?.email || 'system', action, targetType, targetId: String(targetId || ''), detail }); }
  catch (error) { console.warn('Audit write failed:', error.message); }
}

async function ensureSeed() {
  const adminEmail = clean(process.env.ADMIN_EMAIL || 'admin@nev.com').toLowerCase();
  if (!(await one('users', { email: adminEmail }))) {
    if (!process.env.ADMIN_INITIAL_PASSWORD) throw new Error('请先设置 ADMIN_INITIAL_PASSWORD 后启动服务。');
    await insert('users', { email: adminEmail, name: 'ADMIN-001', role: 'admin', jobRole: '系统管理员', avatarKey: 'admin', enabled: true, passwordHash: await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD, 12) });
  }
  // 演示账号使用匿名工号；不保存或展示真实姓名。
  const teamInitialPassword = process.env.TEAM_INITIAL_PASSWORD || '123456';
  const defaultMembers = [
    ['ops@nev.com', '电商运营师', '电商运营师', 'ops'],
    ['design@nev.com', '视觉设计师', '视觉设计师', 'visual'],
    ['data@nev.com', '数据分析师', '数据分析师', 'data'],
    ['marketing@nev.com', '数字营销师', '数字营销师', 'marketing']
  ];
  for (const [email, name, jobRole, avatarKey] of defaultMembers) {
    if (!(await one('users', { email }))) {
      await insert('users', { email, name, role: 'member', jobRole, avatarKey, enabled: true, passwordHash: await bcrypt.hash(teamInitialPassword, 12) });
    }
  }
  if ((await list('agents')).length === 0) {
    await insert('agents', { name: '数据洞察助手', role: '数据分析师', description: '分析经营数据、用户画像与增长机会，生成可视化报告。', systemPrompt: '你是数据分析师，负责将经营数据、用户行为和业务目标整理为清晰、可执行的洞察与数据看板。', fixedAnswers: [{ question: '数据分析应该从哪里开始？', answer: '先明确业务目标和核心指标，再统一数据口径，识别趋势、异常与关键用户群，最后给出可执行的建议。' }], scope: 'team', status: 'published', createdBy: adminEmail });
    await insert('agents', { name: '电商运营助手', role: '电商运营师', description: '支持店铺诊断、选品分析、知识图谱与售后运营。', systemPrompt: '你是电商运营师，围绕商品、店铺、内容、转化与售后流程输出可执行的运营方案。', fixedAnswers: [], scope: 'team', status: 'published', createdBy: adminEmail });
    await insert('agents', { name: '数字营销助手', role: '数字营销师', description: '规划直播脚本、全年营销日历、投流复盘和内容发布。', systemPrompt: '你是数字营销师，擅长品牌传播、直播营销、内容分发与广告投放复盘，输出清晰的增长行动方案。', fixedAnswers: [], scope: 'team', status: 'published', createdBy: adminEmail });
    await insert('agents', { name: '内容创意助手', role: '视觉设计师', description: '生成视觉简报、产品图方向、品牌规范与设计文案。', systemPrompt: '你是视觉设计师，负责把业务目标转化为可执行的视觉创意、产品图方向和品牌表达规范。', fixedAnswers: [], scope: 'team', status: 'published', createdBy: adminEmail });
  }
  if ((await list('workflows')).length === 0) await insert('workflows', { name: '智能体协同增长流程', description: '由数据、运营、营销与视觉岗位协同完成洞察、方案和成果输出。', nodes: ['开始', '业务资料整理', '智能体分析', '输出成果'], status: 'published', createdBy: adminEmail });
  if ((await list('knowledge_bases')).length === 0) await insert('knowledge_bases', { name: '团队业务知识库', description: '沉淀商品、用户、营销、设计与运营资料', status: 'ready', createdBy: adminEmail });
  if ((await list('model_configs')).length === 0) await insert('model_configs', { name: 'DeepSeek V4 Flash', provider: 'DeepSeek', modelId: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash', baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com', enabled: true, createdBy: adminEmail });
  if ((await list('tool_configs')).length === 0) await insert('tool_configs', { name: '文件解析器', description: '解析 PDF、Word、Excel 与文本资料', endpoint: 'built-in://file-parser', scope: 'team', enabled: true, createdBy: adminEmail });
  if ((await list('projects')).length === 0) {
    const project = await insert('projects', { code: 'TEAM-GROWTH-01', name: '智能体增长协同项目', description: '数据、运营、营销与视觉岗位联动完成增长方案与成果交付。', status: 'active', progress: 68, ownerEmail: adminEmail, createdBy: adminEmail });
    await insert('tasks', { projectId: project._id, title: '整理直播数据源', description: '统一直播场次数据口径并归档。', status: 'todo', priority: 'high', assigneeEmail: 'data@nev.com', dueDate: '本周三', createdBy: adminEmail });
    await insert('tasks', { projectId: project._id, title: '输出用户画像看板', description: '汇总核心用户画像与增长机会。', status: 'doing', priority: 'high', assigneeEmail: 'data@nev.com', dueDate: '本周四', createdBy: adminEmail });
    await insert('tasks', { projectId: project._id, title: '完成产品视觉简报', description: '确认页面主视觉与内容表达方向。', status: 'review', priority: 'normal', assigneeEmail: 'design@nev.com', dueDate: '本周五', createdBy: adminEmail });
  }
}

async function ensureRoleAgent(jobRole, createdBy) {
  const existing = (await list('agents', { role: jobRole })).find(agent => agent.status === 'published' && agent.scope === 'team');
  if (existing) return existing;
  const templates = {
    '数据分析师': { name: '数据洞察助手', description: '分析经营数据、用户画像与增长机会，生成可视化报告。', systemPrompt: '你是数据分析师，负责把经营数据、用户行为和业务目标转化为清晰、可执行的洞察。' },
    '电商运营师': { name: '电商运营助手', description: '支持店铺诊断、选品分析、知识图谱与售后运营。', systemPrompt: '你是电商运营师，围绕商品、店铺、内容、转化与售后流程输出可执行的运营方案。' },
    '数字营销师': { name: '数字营销助手', description: '规划直播脚本、全年营销日历、投流复盘和内容发布。', systemPrompt: '你是数字营销师，擅长品牌传播、直播营销、内容分发与广告投放复盘。' },
    '视觉设计师': { name: '内容创意助手', description: '生成视觉简报、产品图方向、品牌规范与设计文案。', systemPrompt: '你是视觉设计师，负责把业务目标转化为可执行的视觉创意和品牌表达规范。' }
  };
  const template = templates[jobRole];
  if (!template) return null;
  return insert('agents', { ...template, role: jobRole, fixedAnswers: [], scope: 'team', status: 'published', createdBy });
}

function jwtSecret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error('JWT_SECRET 未配置或少于 32 位，服务拒绝签发不安全的登录会话。');
  return value;
}
function tokenFor(user) { return jwt.sign({ sub: user._id, email: user.email, role: user.role, name: user.name, jobRole: user.jobRole }, jwtSecret(), { expiresIn: '12h' }); }
async function auth(req, res, next) {
  try { const token = (req.headers.authorization || '').replace('Bearer ', ''); const claims = jwt.verify(token, jwtSecret()); const user = await one('users', { _id: claims.sub }); if (!user || !user.enabled) return res.status(401).json({ error: '账号已停用或不存在，请联系管理员。' }); req.user = { ...claims, role: user.role, jobRole: user.jobRole, email: user.email, name: user.name }; next(); }
  catch { res.status(401).json({ error: '登录已失效，请重新登录。' }); }
}
function adminOnly(req, res, next) { if (req.user?.role === 'admin') return next(); return res.status(403).json({ error: '仅超级管理员可执行此操作。' }); }

app.get('/api/health', (_, res) => res.json({ ok: true, env: ENV_ID, mode: memoryMode ? 'memory' : 'cloudbase' }));
app.get('/api/readiness', (_, res) => {
  const checks = { database: memoryMode ? 'memory-only' : Boolean(process.env.CLOUDBASE_APIKEY), jwt: Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32), model: Boolean(process.env.DEEPSEEK_API_KEY), admin: Boolean(process.env.ADMIN_INITIAL_PASSWORD) };
  const ready = Object.values(checks).every(Boolean);
  res.status(ready ? 200 : 503).json({ ready, mode: memoryMode ? 'memory' : 'cloudbase', checks });
});
app.post('/api/auth/login', async (req, res, next) => {
  try { await ensureSeed(); const account = clean(req.body.email, 120).toLowerCase(); const email = account.includes('@') ? account : `${account}@group.local`; const user = await one('users', { email });
    if (!user || !user.enabled || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) return res.status(401).json({ error: '账号或密码不正确。' });
    await audit({ email: user.email }, 'auth.login', 'user', user._id, { jobRole: user.jobRole });
    res.json({ token: tokenFor(user), user: { name: user.name, email: user.email, role: user.role, jobRole: user.jobRole, avatarKey: user.avatarKey || 'default' } });
  } catch (e) { next(e); }
});
app.get('/api/me', auth, async (req, res) => res.json(req.user));

app.get('/api/agents', auth, async (req, res, next) => {
  try { if (req.user.role !== 'admin') await ensureRoleAgent(req.user.jobRole, req.user.email); const agents = await list('agents'); const visible = req.user.role === 'admin' ? agents : agents.filter(a => a.status === 'published' && a.scope === 'team'); res.json(visible); } catch (e) { next(e); }
});
app.post('/api/agents', auth, adminOnly, async (req, res, next) => {
  try { const agent = await insert('agents', { name: clean(req.body.name, 80), role: clean(req.body.role, 40), description: clean(req.body.description, 500), systemPrompt: clean(req.body.systemPrompt, 8000), fixedAnswers: Array.isArray(req.body.fixedAnswers) ? req.body.fixedAnswers.slice(0, 30) : [], scope: req.body.scope === 'private' ? 'private' : 'team', status: 'draft', createdBy: req.user.email }); await audit(req.user, 'agent.create', 'agent', agent._id, { name: agent.name }); res.status(201).json(agent); } catch (e) { next(e); }
});
app.put('/api/agents/:id', auth, adminOnly, async (req, res, next) => {
  try { const found = await one('agents', { _id: req.params.id }); if (!found) return res.status(404).json({ error: '智能体不存在。' }); const patch = {};
    ['name', 'role', 'description', 'systemPrompt', 'scope'].forEach(k => { if (req.body[k] !== undefined) patch[k] = clean(req.body[k], k === 'systemPrompt' ? 8000 : 500); });
    if (Array.isArray(req.body.fixedAnswers)) patch.fixedAnswers = req.body.fixedAnswers.slice(0, 30); const updated = await change('agents', found._id, patch); await audit(req.user, 'agent.update', 'agent', found._id, { fields: Object.keys(patch) }); res.json(updated);
  } catch (e) { next(e); }
});
app.post('/api/agents/:id/publish', auth, adminOnly, async (req, res, next) => { try { const found = await one('agents', { _id: req.params.id }); if (!found) return res.status(404).json({ error: '智能体不存在。' }); const versions = await list('agent_versions', { agentId: found._id }); const agent = await change('agents', found._id, { status: 'published', publishedAt: now() }); const version = await insert('agent_versions', { agentId: found._id, versionNo: versions.length + 1, snapshot: agent, publishedBy: req.user.email }); await audit(req.user, 'agent.publish', 'agent', found._id, { versionNo: version.versionNo }); res.json({ ...agent, versionNo: version.versionNo }); } catch (e) { next(e); } });
app.get('/api/agents/:id/versions', auth, adminOnly, async (req, res, next) => { try { const rows = await list('agent_versions', { agentId: req.params.id }); res.json(rows.sort((a, b) => b.versionNo - a.versionNo)); } catch (e) { next(e); } });

app.get('/api/members', auth, adminOnly, async (req, res, next) => { try { res.json((await list('users')).map(({ passwordHash, ...u }) => u)); } catch (e) { next(e); } });
app.post('/api/members', auth, adminOnly, async (req, res, next) => { try { const account = clean(req.body.account || req.body.email, 80).toLowerCase(); const email = account.includes('@') ? account : `${account}@group.local`; const password = String(req.body.password || ''); if (!/^[a-z0-9][a-z0-9-]{2,39}(@group\.local)?$/.test(account)) return res.status(400).json({ error: '账号请使用 3-40 位小写字母、数字或短横线。' }); if (password.length < 8) return res.status(400).json({ error: '初始密码至少需要 8 位。' }); if (await one('users', { email })) return res.status(409).json({ error: '该账号已存在。' }); const user = await insert('users', { email, name: clean(req.body.name || account.toUpperCase(), 40), role: 'member', jobRole: clean(req.body.jobRole, 40), avatarKey: clean(req.body.avatarKey, 30) || 'default', enabled: true, passwordHash: await bcrypt.hash(password, 12) }); await audit(req.user, 'member.create', 'user', user._id, { account, jobRole: user.jobRole }); const { passwordHash, ...safe } = user; res.status(201).json(safe); } catch (e) { next(e); } });
app.post('/api/members/:id/reset-password', auth, adminOnly, async (req, res, next) => { try { const password = String(req.body.password || ''); if (password.length < 8) return res.status(400).json({ error: '密码至少需要 8 位。' }); const user = await change('users', req.params.id, { passwordHash: await bcrypt.hash(password, 12) }); if (!user) return res.status(404).json({ error: '成员不存在。' }); await audit(req.user, 'member.reset-password', 'user', user._id); res.json({ ok: true }); } catch (e) { next(e); } });
app.patch('/api/members/:id', auth, adminOnly, async (req, res, next) => { try { const patch = {}; if (typeof req.body.enabled === 'boolean') patch.enabled = req.body.enabled; if (req.body.jobRole) patch.jobRole = clean(req.body.jobRole, 40); if (req.body.avatarKey) patch.avatarKey = clean(req.body.avatarKey, 30); const user = await change('users', req.params.id, patch); if (!user) return res.status(404).json({ error: '成员不存在。' }); await audit(req.user, 'member.update', 'user', user._id, patch); const { passwordHash, ...safe } = user; res.json(safe); } catch (e) { next(e); } });
app.get('/api/audit-logs', auth, adminOnly, async (req, res, next) => { try { const rows = await list('audit_logs'); res.json(rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 200)); } catch (e) { next(e); } });

// 项目协同中心：成员可查看项目与任务；管理员控制项目和审批；每一步都会写入审计。
app.get('/api/projects', auth, async (req, res, next) => { try { await ensureSeed(); res.json((await list('projects')).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))); } catch (e) { next(e); } });
app.post('/api/projects', auth, adminOnly, async (req, res, next) => { try { const project = await insert('projects', { code: clean(req.body.code, 40), name: clean(req.body.name, 100), description: clean(req.body.description, 1000), status: 'active', progress: Math.max(0, Math.min(100, Number(req.body.progress || 0))), ownerEmail: req.user.email, createdBy: req.user.email }); await audit(req.user, 'project.create', 'project', project._id, { name: project.name }); res.status(201).json(project); } catch (e) { next(e); } });
app.patch('/api/projects/:id', auth, adminOnly, async (req, res, next) => { try { const patch = {}; ['name', 'description', 'status'].forEach(k => { if (req.body[k] !== undefined) patch[k] = clean(req.body[k], 1000); }); if (req.body.progress !== undefined) patch.progress = Math.max(0, Math.min(100, Number(req.body.progress))); const row = await change('projects', req.params.id, patch); if (!row) return res.status(404).json({ error: '项目不存在。' }); await audit(req.user, 'project.update', 'project', row._id, patch); res.json(row); } catch (e) { next(e); } });
app.get('/api/tasks', auth, async (req, res, next) => { try { await ensureSeed(); const projectId = clean(req.query.projectId, 80); let rows = await list('tasks'); if (projectId) rows = rows.filter(row => row.projectId === projectId); res.json(rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))); } catch (e) { next(e); } });
app.post('/api/tasks', auth, async (req, res, next) => { try { const task = await insert('tasks', { projectId: clean(req.body.projectId, 80) || null, title: clean(req.body.title, 140), description: clean(req.body.description, 1600), status: 'todo', priority: ['low', 'normal', 'high'].includes(req.body.priority) ? req.body.priority : 'normal', assigneeEmail: clean(req.body.assigneeEmail, 120) || req.user.email, dueDate: clean(req.body.dueDate, 40), createdBy: req.user.email }); await audit(req.user, 'task.create', 'task', task._id, { title: task.title }); res.status(201).json(task); } catch (e) { next(e); } });
app.patch('/api/tasks/:id', auth, async (req, res, next) => { try { const current = await one('tasks', { _id: req.params.id }); if (!current) return res.status(404).json({ error: '任务不存在。' }); if (req.user.role !== 'admin' && current.assigneeEmail !== req.user.email && current.createdBy !== req.user.email) return res.status(403).json({ error: '只能更新自己负责或创建的任务。' }); const patch = {}; ['title', 'description', 'status', 'priority', 'dueDate'].forEach(k => { if (req.body[k] !== undefined) patch[k] = clean(req.body[k], 1600); }); if (req.user.role === 'admin' && req.body.assigneeEmail !== undefined) patch.assigneeEmail = clean(req.body.assigneeEmail, 120); const row = await change('tasks', current._id, patch); await audit(req.user, 'task.update', 'task', row._id, patch); res.json(row); } catch (e) { next(e); } });
app.get('/api/deliverables', auth, async (req, res, next) => { try { const projectId = clean(req.query.projectId, 80); let rows = await list('deliverables'); if (projectId) rows = rows.filter(row => row.projectId === projectId); res.json(rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))); } catch (e) { next(e); } });
app.post('/api/deliverables', auth, async (req, res, next) => { try { const row = await insert('deliverables', { projectId: clean(req.body.projectId, 80) || null, taskId: clean(req.body.taskId, 80) || null, title: clean(req.body.title, 140), kind: clean(req.body.kind, 30) || 'link', url: clean(req.body.url, 1000), status: 'pending', createdBy: req.user.email }); const approval = await insert('approvals', { deliverableId: row._id, status: 'pending', createdBy: req.user.email }); await audit(req.user, 'deliverable.create', 'deliverable', row._id, { title: row.title, approvalId: approval._id }); res.status(201).json(row); } catch (e) { next(e); } });
app.get('/api/approvals', auth, async (req, res, next) => { try { const rows = await list('approvals'); res.json(req.user.role === 'admin' ? rows : rows.filter(row => row.createdBy === req.user.email)); } catch (e) { next(e); } });
app.patch('/api/approvals/:id', auth, adminOnly, async (req, res, next) => { try { const status = ['approved', 'rejected', 'pending'].includes(req.body.status) ? req.body.status : 'pending'; const approval = await change('approvals', req.params.id, { status, reviewerEmail: req.user.email, comment: clean(req.body.comment, 1000) }); if (!approval) return res.status(404).json({ error: '审批记录不存在。' }); const item = await one('deliverables', { _id: approval.deliverableId }); if (item) await change('deliverables', item._id, { status }); await audit(req.user, 'approval.update', 'approval', approval._id, { status }); res.json(approval); } catch (e) { next(e); } });
app.post('/api/agent-launches', auth, async (req, res, next) => { try { const key = clean(req.body.agentKey, 30); if (!['automotive', 'site', 'live'].includes(key)) return res.status(400).json({ error: '智能体标识无效。' }); const row = await insert('agent_launches', { agentKey: key, projectId: clean(req.body.projectId, 80) || null, actorEmail: req.user.email }); await audit(req.user, 'agent.launch', 'agent', key, { projectId: row.projectId }); res.status(201).json(row); } catch (e) { next(e); } });
app.get('/api/command-center', auth, async (req, res, next) => { try { await ensureSeed(); const [projects, tasks, deliverables, approvals, launches] = await Promise.all(['projects', 'tasks', 'deliverables', 'approvals', 'agent_launches'].map(name => list(name))); const visibleApprovals = req.user.role === 'admin' ? approvals : approvals.filter(item => item.createdBy === req.user.email); res.json({ projects, tasks, deliverables, approvals: visibleApprovals, launches: launches.slice(-30).reverse(), summary: { activeProjects: projects.filter(item => item.status === 'active').length, openTasks: tasks.filter(item => item.status !== 'done').length, pendingApprovals: visibleApprovals.filter(item => item.status === 'pending').length, launchCount: launches.length } }); } catch (e) { next(e); } });

function entityRoutes(pathname, table, fields) {
  app.get(`/api/${pathname}`, auth, async (req, res, next) => { try { await ensureSeed(); res.json(await list(table)); } catch (e) { next(e); } });
  app.post(`/api/${pathname}`, auth, adminOnly, async (req, res, next) => { try { const record = {}; fields.forEach(key => { if (req.body[key] !== undefined) record[key] = req.body[key]; }); record.createdBy = req.user.email; res.status(201).json(await insert(table, record)); } catch (e) { next(e); } });
  app.put(`/api/${pathname}/:id`, auth, adminOnly, async (req, res, next) => { try { const patch = {}; fields.forEach(key => { if (req.body[key] !== undefined) patch[key] = req.body[key]; }); const row = await change(table, req.params.id, patch); if (!row) return res.status(404).json({ error: '记录不存在。' }); res.json(row); } catch (e) { next(e); } });
}
entityRoutes('workflows', 'workflows', ['name', 'description', 'nodes', 'status']);
entityRoutes('knowledge-bases', 'knowledge_bases', ['name', 'description', 'status']);
entityRoutes('models', 'model_configs', ['name', 'provider', 'modelId', 'baseUrl', 'enabled']);
entityRoutes('tools', 'tool_configs', ['name', 'description', 'endpoint', 'scope', 'enabled']);
app.post('/api/workflows/:id/run', auth, async (req, res, next) => { try { const flow = await one('workflows', { _id: req.params.id }); if (!flow || (req.user.role !== 'admin' && flow.status !== 'published')) return res.status(403).json({ error: '无权运行该工作流。' }); res.json({ ok: true, result: `工作流「${flow.name}」已完成演示运行：已依次执行 ${(flow.nodes || []).join(' → ')}。` }); } catch (e) { next(e); } });
app.get('/api/analytics', auth, adminOnly, async (req, res, next) => { try { const chats = await list('chats'); const files = await list('files'); const agents = await list('agents'); const popular = Object.values(chats.reduce((acc, row) => { const k = row.question || ''; acc[k] = acc[k] || { question: k, count: 0 }; acc[k].count += 1; return acc; }, {})).sort((a, b) => b.count - a.count).slice(0, 5); res.json({ calls: chats.length, files: files.length, agents: agents.length, popular, recent: chats.slice(-7) }); } catch (e) { next(e); } });
app.get('/api/settings', auth, adminOnly, async (req, res, next) => { try { const row = await one('platform_settings', { name: 'global' }); res.json(row?.config || { platformName: '新能源汽车跨境出海方案智能体', workspaceName: '新能源汽车跨境出海项目', retentionDays: 365 }); } catch (e) { next(e); } });
app.put('/api/settings', auth, adminOnly, async (req, res, next) => { try { const old = await one('platform_settings', { name: 'global' }); const config = { ...(old?.config || {}), ...(req.body || {}) }; const row = old ? await change('platform_settings', old._id, { config, updatedBy: req.user.email }) : await insert('platform_settings', { name: 'global', config, updatedBy: req.user.email }); res.json(row.config); } catch (e) { next(e); } });

async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.txt', '.md', '.csv', '.json'].includes(ext)) return file.buffer.toString('utf8').slice(0, 12000);
  if (ext === '.docx') return (await mammoth.extractRawText({ buffer: file.buffer })).value.slice(0, 12000);
  if (ext === '.xlsx') { const book = new ExcelJS.Workbook(); await book.xlsx.load(file.buffer); const sheets = []; book.eachSheet(sheet => { const lines = []; sheet.eachRow(row => lines.push(row.values.slice(1).map(value => typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')).join(','))); sheets.push(`【${sheet.name}】\n${lines.join('\n')}`); }); return sheets.join('\n').slice(0, 12000); }
  if (ext === '.pdf') return (await pdf(file.buffer)).text.slice(0, 12000);
  return '';
}
app.post('/api/files', auth, upload.single('file'), async (req, res, next) => {
  try { if (!req.file) return res.status(400).json({ error: '请选择需要上传的文件。' }); const safeName = req.file.originalname.replace(/[^\w.\-\u4e00-\u9fa5]/g, '_'); const cloudPath = `uploads/${req.user.sub}/${Date.now()}-${safeName}`; let fileID = `memory://${cloudPath}`;
    if (!memoryMode) { const uploaded = await cloud.uploadFile({ cloudPath, fileContent: req.file.buffer }); fileID = uploaded.fileID; }
    const record = await insert('files', { ownerId: req.user.sub, ownerEmail: req.user.email, name: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size, fileID, extractedText: await extractText(req.file) }); await audit(req.user, 'file.upload', 'file', record._id, { name: record.name, size: record.size }); res.status(201).json({ _id: record._id, name: record.name, size: record.size, fileID: record.fileID, indexed: Boolean(record.extractedText) });
  } catch (e) { next(e); }
});
app.get('/api/files', auth, async (req, res, next) => { try { const files = await list('files'); res.json(req.user.role === 'admin' ? files : files.filter(f => f.ownerId === req.user.sub)); } catch (e) { next(e); } });

async function deepseek(messages) {
  if (!process.env.DEEPSEEK_API_KEY) throw new Error('尚未配置 DEEPSEEK_API_KEY。请在 CloudBase 云托管环境变量中添加后重新部署。');
  const response = await fetch(`${(process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` }, body: JSON.stringify({ model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash', messages, temperature: 0.35, max_tokens: 1800 }) });
  const data = await response.json(); if (!response.ok) throw new Error(data?.error?.message || 'DeepSeek 调用失败。'); return data.choices?.[0]?.message?.content || '模型未返回有效内容。';
}
app.post('/api/chat', auth, async (req, res, next) => {
  try { const question = clean(req.body.message, 5000); if (!question) return res.status(400).json({ error: '请输入问题。' }); const agent = await one('agents', { _id: req.body.agentId }); if (!agent || (req.user.role !== 'admin' && !(agent.status === 'published' && agent.scope === 'team' && agent.role === req.user.jobRole))) return res.status(403).json({ error: '你没有调用该智能体的权限。' });
    const fixed = (agent.fixedAnswers || []).find(x => question.includes(x.question) || x.question.includes(question)); let answer; let source = 'deepseek';
    if (fixed) { answer = fixed.answer + (Array.isArray(fixed.sourceNames) && fixed.sourceNames.length ? `\n\n【依据文件】${fixed.sourceNames.join('、')}` : ''); source = 'fixed-answer'; } else { const selected = Array.isArray(req.body.fileIds) ? req.body.fileIds.slice(0, 5) : []; const allFiles = await list('files'); const permitted = req.user.role === 'admin' ? allFiles : allFiles.filter(f => f.ownerId === req.user.sub); const context = permitted.filter(f => selected.includes(f._id)).map(f => `【文件：${f.name}】\n${f.extractedText || '该文件已保存，暂不支持文本解析。'}`).join('\n\n').slice(0, 24000); answer = await deepseek([{ role: 'system', content: `${agent.systemPrompt || '你是专业企业助手。'}\n请用中文回答，若材料不足请明确说明。` }, ...(context ? [{ role: 'system', content: `用户同时上传/选择了以下材料，请以此为依据：\n${context}` }] : []), { role: 'user', content: question }]); }
    const chat = await insert('chats', { userId: req.user.sub, agentId: agent._id, question, answer, source }); await audit(req.user, 'chat.create', 'chat', chat._id, { agentId: agent._id, source }); res.json({ answer, source, agent: { _id: agent._id, name: agent.name } });
  } catch (e) { next(e); }
});
app.get('/api/chats', auth, async (req, res, next) => {
  try {
    const agentId = clean(req.query.agentId, 80);
    let rows = await list('chats');
    if (req.user.role !== 'admin') rows = rows.filter(row => row.userId === req.user.sub);
    if (agentId) rows = rows.filter(row => row.agentId === agentId);
    rows.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    res.json(rows.slice(0, 50));
  } catch (e) { next(e); }
});

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: err.message || '服务暂时不可用，请稍后重试。' }); });
PORTS.forEach(port => {
  const server = app.listen(port, () => console.log(`NEV Agent Platform listening on ${port} (${memoryMode ? 'memory' : ENV_ID})`));
  // 本机调试时某个兼容端口可能已被占用，不影响另一个已成功监听的端口。
  server.on('error', err => console.warn(`Port ${port} unavailable: ${err.code || err.message}`));
});
