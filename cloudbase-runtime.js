/* CloudBase 正式版运行层：把原型界面连接到真实账号、文件和 DeepSeek 对话。 */
(() => {
  let token = localStorage.getItem('nev_token') || '';
  let currentAgent = null;
  let selectedFiles = [];
  const api = async (url, options = {}) => {
    const res = await fetch(url, { ...options, headers: { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || '请求失败，请稍后重试。');
    return data;
  };
  const toast = text => typeof notify === 'function' ? notify(text) : alert(text);
  // 登录页的视觉样式包含 display 的强制规则；切换身份时必须使用同等优先级隐藏它，避免页面与后台叠在一起。
  const showAuthenticatedApp = () => {
    document.getElementById('login').style.setProperty('display', 'none', 'important');
    document.getElementById('app').style.setProperty('display', 'flex', 'important');
    window.showPage?.('dashboard');
  };
  const originalEnterApp = window.enterApp;
  window.enterApp = async () => {
    const email = document.getElementById('account').value.trim();
    const password = document.getElementById('password').value;
    const button = document.querySelector('#login .primary');
    button.disabled = true; button.innerText = '正在安全登录…';
    try {
      const result = await api('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      token = result.token; localStorage.setItem('nev_token', token);
      showAuthenticatedApp();
      window.currentUser = result.user.role === 'admin' ? '超级管理员' : (result.user.jobRole || '团队成员');
      document.body.classList.toggle('admin-session', result.user.role === 'admin');
      document.querySelector('.side-bottom').innerHTML = `<span class="user-dot">${result.user.name.slice(0, 1)}</span>${result.user.name}<br><span style="margin-left:33px;font-size:10px">${result.user.role === 'admin' ? '超级管理员' : '只读调用成员'}</span>`;
      applyRole(result.user.role); await loadAgents(); toast(`登录成功，欢迎 ${result.user.name}`);
    } catch (error) {
      const isLocalPreview = location.port === '4173' || ['127.0.0.1', 'localhost', '::1'].includes(location.hostname);
      if (isLocalPreview) {
        originalEnterApp();
        showAuthenticatedApp();
        toast('已进入本地演示模式；正式部署后将使用真实账号验证');
      } else {
        toast(error.message);
      }
    }
    finally { button.disabled = false; button.innerText = '安全登录 →'; }
  };
  function applyRole(role) {
    const adminOnly = ['compose', 'workflow', 'knowledge', 'models', 'tools', 'team', 'analytics', 'settings'];
    document.querySelectorAll('.nav button').forEach(b => { if (adminOnly.includes(b.dataset.page)) b.style.display = role === 'admin' ? '' : 'none'; });
    const create = document.querySelector('#dashboard .heading .primary'); if (create) create.style.display = role === 'admin' ? '' : 'none';
  }
  async function loadAgents() {
    const agents = await api('/api/agents'); window.remoteAgents = agents;
    // 原型中“全部 16”为静态展示，正式版必须显示数据库中的真实数量。
    document.querySelectorAll('#agents .filters button').forEach(button => {
      if (button.textContent.trim().startsWith('全部')) button.textContent = `全部 ${agents.length}`;
    });
    const target = document.getElementById('agentList'); if (!target) return;
    target.innerHTML = agents.map(a => `<article class="card agent-card" data-agent-id="${a._id}"><div class="agent-top"></div><div class="agent-body"><div class="agent-title"><h3>${escapeHtml(a.name)}</h3><span class="status">● ${a.status === 'published' ? '已发布' : '草稿'}</span></div><span class="tag">${escapeHtml(a.role || '通用')}</span><p>${escapeHtml(a.description || '项目专属智能体')}</p><div class="agent-meta"><span>${a.scope === 'team' ? '团队共享' : '个人私有'}</span><span>◉ 可调用</span></div></div></article>`).join('');
    target.querySelectorAll('[data-agent-id]').forEach(el => el.onclick = () => openRemoteAgent(el.dataset.agentId));
  }
  async function openRemoteAgent(agentId) {
    currentAgent = (window.remoteAgents || []).find(a => a._id === agentId); if (!currentAgent) return;
    showPage('compose');
    const nameInput = document.querySelector('#compose .field input'); if (nameInput) nameInput.value = currentAgent.name;
    document.querySelector('#compose .heading h1').innerHTML = `${escapeHtml(currentAgent.name)} <span class="badge">${currentAgent.scope === 'team' ? '团队共享' : '个人私有'}</span>`;
    document.querySelector('#compose .heading p').innerText = currentUser === '超级管理员' ? '管理员可编辑、上传资料并发布；成员可调用已发布版本。' : '你可以向该智能体提问，也可以上传文件作为本次对话材料。';
    const prompt = document.querySelector('#promptPane > div'); if (prompt) prompt.innerText = currentAgent.systemPrompt || '';
    const messageBox = document.getElementById('composeChat'); messageBox.innerHTML = `<div class="bubble bot">你好，我是${escapeHtml(currentAgent.name)}。你可以直接提问，也可以上传文件让我结合材料分析。</div>`;
    addFileControl();
    if (currentUser !== '超级管理员') makeReadOnly();
  }
  function makeReadOnly() {
    document.querySelector('#compose aside.panel').style.opacity = '.55'; document.querySelector('#compose aside.panel').style.pointerEvents = 'none';
    const actions = document.querySelector('#compose .heading > div:last-child'); if (actions) actions.style.display = 'none';
  }
  function addFileControl() {
    if (document.getElementById('agentFilePicker')) return;
    const box = document.querySelector('#compose .chatbox');
    box.insertAdjacentHTML('beforebegin', '<div id="agentFiles" style="padding:8px 12px;border-top:1px solid #edf2f6;background:#fff;display:flex;align-items:center;gap:8px"><label for="agentFilePicker" style="font-size:12px;color:#2670b5;cursor:pointer">＋ 添加文件</label><input id="agentFilePicker" type="file" style="display:none" accept=".pdf,.docx,.xlsx,.csv,.txt,.md,.json" multiple><span id="agentFileStatus" style="font-size:11px;color:#75869a">支持 PDF、Word、XLSX、CSV、TXT，单个文件不超过 15MB</span></div>');
    document.getElementById('agentFilePicker').onchange = uploadFiles;
  }
  async function uploadFiles(e) {
    const files = [...e.target.files]; const status = document.getElementById('agentFileStatus');
    for (const file of files) { const form = new FormData(); form.append('file', file); status.innerText = `正在上传 ${file.name}…`; try { const data = await api('/api/files', { method: 'POST', body: form }); selectedFiles.push(data._id); status.innerText = `已添加 ${selectedFiles.length} 个文件：${file.name}${data.indexed ? '（可供 AI 解析）' : '（已保存）'}`; } catch (error) { status.innerText = error.message; } }
  }
  window.askCompose = async (message) => {
    message = String(message || '').trim(); if (!message || !currentAgent) return;
    const box = document.getElementById('composeChat'); box.innerHTML += `<div class="bubble me">${escapeHtml(message)}</div>`; box.scrollTop = box.scrollHeight;
    document.getElementById('composeInput').value = ''; const placeholder = document.createElement('div'); placeholder.className = 'bubble bot'; placeholder.innerText = '正在分析…'; box.appendChild(placeholder);
    try { const reply = await api('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agentId: currentAgent._id, message, fileIds: selectedFiles }) }); placeholder.innerText = reply.answer; if (reply.source === 'fixed-answer') toast('已命中管理员配置的标准答案'); }
    catch (error) { placeholder.innerText = `调用失败：${error.message}`; }
    box.scrollTop = box.scrollHeight;
  };
  // 将原型中的“创建成员账号”弹窗连接到 CloudBase 用户数据。
  const demoSubmitModal = window.submitModal;
  window.submitModal = async () => {
    if (typeof currentModal !== 'undefined' && currentModal === 'member') {
      const modal = document.getElementById('modal');
      const inputs = modal.querySelectorAll('input');
      const name = inputs[0]?.value.trim(); const email = inputs[1]?.value.trim(); const password = inputs[2]?.value;
      const jobRole = modal.querySelector('select')?.value.split(' / ')[0] || '团队成员';
      if (!name || !email || !password) return toast('请填写成员姓名、账号和初始密码。');
      try {
        await api('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, jobRole }) });
        closeModal(); toast(`已创建 ${jobRole} 账号，成员可用该账号和初始密码登录。`);
      } catch (error) { toast(error.message); }
      return;
    }
    return demoSubmitModal();
  };
  function escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
})();
