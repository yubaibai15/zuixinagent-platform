/* 当前四岗位平台的部署修复层：所有功能留在本平台，避免跳转到不可用的旧站点。 */
(() => {
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const roster = {
    'demo-data': ['数据洞察助手', ['数据看板','客户画像','独立站看板','社媒看板','直播数据导出']],
    'demo-ops': ['电商运营助手', ['店铺诊断','选品分析','知识图谱','售后话术']],
    'demo-marketing': ['数字营销助手', ['直播脚本','全年日历','投流复盘','发布平台']],
    'demo-visual': ['内容创意助手', ['视觉简报','产品图','品牌规范','设计文案']]
  };

  const style = document.createElement('style');
  style.textContent = `
    body:not(.admin-session):has(#dashboard.active) #app>.sidebar,body:not(.admin-session):has(#dashboard.active) .topbar{display:none!important}
    body:not(.admin-session):has(#dashboard.active) #app>.main{margin-left:0!important;width:100%!important}
    body:not(.admin-session):has(#dashboard.active) .content{max-width:none!important;padding:0!important}
    body:not(.admin-session) #dashboard.active>.heading,body:not(.admin-session) #dashboard.active>.hero,body:not(.admin-session) #dashboard.active>.stats,body:not(.admin-session) #dashboard.active>.section-title,body:not(.admin-session) #dashboard.active>.roles,body:not(.admin-session) #dashboard.active>.twocol{display:none!important}
    body:not(.admin-session) #dashboard.active #agent-bridge{box-sizing:border-box;min-height:100vh;margin:0!important;padding:clamp(28px,4vw,72px)!important;border:0!important;border-radius:0!important;background:linear-gradient(135deg,#0b3027 0%,#155a46 58%,#0e382e 100%)!important;box-shadow:none!important}
    body:not(.admin-session) #dashboard.active #agent-bridge .bridge-head{max-width:1440px;margin:0 auto 30px!important;align-items:flex-end!important}
    body:not(.admin-session) #dashboard.active #agent-bridge .bridge-head h2{font-size:clamp(30px,3.3vw,54px)!important;line-height:1.15!important;max-width:720px}
    body:not(.admin-session) #dashboard.active #agent-bridge .bridge-head p{max-width:430px!important;font-size:14px!important;line-height:1.75!important}
    body:not(.admin-session) #dashboard.active #agent-bridge .bridge-grid{max-width:1440px;margin:auto;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:18px!important}
    body:not(.admin-session) #dashboard.active #agent-bridge .bridge-card{min-height:300px;padding:22px!important;display:flex;flex-direction:column;border-radius:18px!important;background:rgba(255,255,255,.075)!important}
    body:not(.admin-session) #dashboard.active #agent-bridge .bridge-role-avatar{width:78px!important;height:78px!important;object-fit:cover!important;object-position:center!important;border:3px solid rgba(255,255,255,.9)!important;border-radius:20px!important;background:#fff!important;box-shadow:0 8px 20px rgba(0,0,0,.18)!important}
    body:not(.admin-session) #dashboard.active #agent-bridge .bridge-card h3{font-size:20px!important;margin:12px 0 8px!important}
    body:not(.admin-session) #dashboard.active #agent-bridge .bridge-card p{font-size:13px!important;min-height:0!important}
    body:not(.admin-session) #dashboard.active #agent-bridge .bridge-card a{min-height:46px;margin-top:auto!important;border-radius:10px!important;padding:12px 14px!important;font-size:13px!important}
    body.admin-session #agent-bridge{display:none!important}
    #dashboard.active #agent-bridge .admin-workspace-link{display:inline-flex;align-items:center;gap:9px;margin-top:16px;padding:11px 14px;border:1px solid #e5bc52;border-radius:10px;background:transparent;color:#fff;font-weight:800;cursor:pointer}.admin-workspace-link:hover{background:#e5bc52;color:#192c25}
    .assistant-skills small{display:block;color:#718078;letter-spacing:.12em}.assistant-skills h2{margin:7px 0 4px}.assistant-skills>p{margin:0 0 10px;color:#7b8982;font-size:11px;line-height:1.55}.assistant-skills .skill-list{display:grid;gap:8px}.assistant-skills .skill-list button{display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:9px;width:100%;min-height:56px;padding:9px;border:1px solid #dce8e0;border-radius:11px;background:#fff;color:#203c32;text-align:left}.assistant-skills .skill-list button:hover,.assistant-skills .skill-list button:focus-visible{border-color:#9bcdb0;background:#f2f8f4;outline:2px solid #cbe6d5}.assistant-skills .skill-list i{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#e9f6ee;color:#087653;font-size:9px;font-style:normal}.assistant-skills .skill-list b{font-size:12px}.assistant-skills .skill-list span{color:#087653;font-size:10px;font-weight:800}.skill-result-link{display:inline-flex;margin-top:9px;padding:8px 11px;border-radius:8px;background:#087653;color:#fff!important;text-decoration:none;font-weight:700;font-size:12px}
    .knowledge-graph{min-height:100vh;padding:clamp(24px,4vw,58px);background:#f6faf7}.knowledge-graph header{max-width:1320px;margin:0 auto 26px}.knowledge-graph .back{min-height:44px;background:transparent;color:#087653;font-weight:700}.knowledge-graph h1{font-size:clamp(28px,3vw,44px);margin:12px 0 8px}.knowledge-graph p{color:#66786f}.graph-board{max-width:1320px;min-height:560px;margin:auto;position:relative;overflow:hidden;border:1px solid #d8e8de;border-radius:24px;background:radial-gradient(#c8dcd0 .8px,transparent .8px) 0 0/18px 18px,#fff}.graph-board:before,.graph-board:after{content:"";position:absolute;left:23%;top:48%;width:53%;height:2px;background:#aacdb9;transform-origin:left}.graph-board:before{transform:rotate(-25deg)}.graph-board:after{transform:rotate(23deg)}.graph-node{position:absolute;z-index:1;width:190px;padding:17px;border-radius:16px;background:#fff;border:1px solid #d6e6dc;box-shadow:0 12px 28px rgba(15,73,53,.1)}.graph-node b,.graph-node span{display:block}.graph-node b{font-size:15px;color:#123f30}.graph-node span{margin-top:6px;font-size:11px;color:#718178;line-height:1.55}.graph-node.center{left:calc(50% - 95px);top:calc(50% - 55px);background:#087653;color:#fff;border-color:#087653}.graph-node.center b,.graph-node.center span{color:#fff}.graph-node.n1{left:8%;top:12%}.graph-node.n2{right:8%;top:13%}.graph-node.n3{left:10%;bottom:11%}.graph-node.n4{right:8%;bottom:12%}.graph-legend{max-width:1320px;margin:18px auto 0;display:flex;gap:12px;flex-wrap:wrap}.graph-legend span{padding:8px 11px;border-radius:999px;background:#eaf7ef;color:#0b684b;font-size:12px}
    @media(max-width:980px){#dashboard.active #agent-bridge .bridge-head{display:block!important}#dashboard.active #agent-bridge .bridge-head p{margin-top:16px!important}#dashboard.active #agent-bridge .bridge-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.graph-board{min-height:720px}.graph-node{width:160px}.graph-node.center{left:calc(50% - 80px);top:calc(50% - 48px)}}
    @media(max-width:620px){#dashboard.active #agent-bridge{padding:24px 16px!important}#dashboard.active #agent-bridge .bridge-grid{grid-template-columns:1fr!important}.composer-skill-bar{display:grid;grid-template-columns:1fr 1fr}.composer-skill-bar b{grid-column:1/-1}.knowledge-graph{padding:20px 14px}.graph-board{min-height:760px}.graph-node{width:calc(50% - 26px);padding:12px}.graph-node.n1{left:12px;top:22px}.graph-node.n2{right:12px;top:22px}.graph-node.n3{left:12px;bottom:24px}.graph-node.n4{right:12px;bottom:24px}.graph-node.center{left:calc(50% - 80px);top:calc(50% - 52px)}}
    @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
  `;
  document.head.appendChild(style);

  window.runComposerSkill = name => {
    const input = document.getElementById('agentInput');
    if (input) input.value = name;
    document.querySelector('#agent-chat .skill-picker')?.classList.remove('show');
    document.querySelector('#agent-chat .skill-trigger')?.setAttribute('aria-expanded', 'false');
    if (typeof window.invokeSkill === 'function') return window.invokeSkill(name, '根据当前对话资料执行此技能');
    return window.openInternalSkill?.(name);
  };
  function addComposerSkills(id) {
    const composer = document.querySelector('#agent-chat .chat-composer');
    if (!composer || composer.querySelector('.skill-picker')) return;
    // 技能不再占用右侧栏，统一放进输入框底部，与附件、知识库和深度思考并列。
    document.querySelectorAll('#agent-chat .chat-assist .assistant-skills,#agent-chat .chat-assist .skill-pack').forEach(item => item.remove());
    const [, skills] = roster[id] || roster['demo-data'];
    const toolRow = composer.querySelector('.composer-tools>div:first-child');
    toolRow?.insertAdjacentHTML('beforeend', '<button type="button" class="skill-trigger" aria-expanded="false" onclick="toggleSkillPicker(event)">✦ 技能包</button>');
    composer.insertAdjacentHTML('beforeend', `<section class="skill-picker" aria-label="技能包"><div><b>技能包</b><button type="button" onclick="toggleSkillPicker(event)" aria-label="关闭技能包">×</button></div><p>选择一个技能，智能体会带着本轮已上传的资料执行。</p>${skills.map((name,index) => `<button type="button" onclick="runComposerSkill('${escapeHtml(name)}')"><i>SK${index+1}</i><b>${escapeHtml(name)}</b><span>调用</span></button>`).join('')}</section>`);
  }

  window.toggleSkillPicker = event => {
    event?.preventDefault(); event?.stopPropagation();
    const picker = document.querySelector('#agent-chat .skill-picker'); const trigger = document.querySelector('#agent-chat .skill-trigger');
    if (!picker) return; const open = picker.classList.toggle('show'); if (trigger) trigger.setAttribute('aria-expanded', String(open));
  };
  document.addEventListener('click', event => { if (!event.target.closest('.skill-picker') && !event.target.closest('.skill-trigger')) { const picker = document.querySelector('#agent-chat .skill-picker'); if (picker) picker.classList.remove('show'); document.querySelector('#agent-chat .skill-trigger')?.setAttribute('aria-expanded', 'false'); } });

  const originalOpenAgentChat = window.openAgentChat;
  window.openAgentChat = id => {
    originalOpenAgentChat(id);
    const remoteAgent=(window.remoteAgents||[]).find(agent=>agent._id===id);
    const roleKeys={'数据分析师':'demo-data','电商运营师':'demo-ops','数字营销师':'demo-marketing','视觉设计师':'demo-visual'};
    const key = roster[id] ? id : Object.keys(roster).find(item => id === roster[item][0]) || roleKeys[remoteAgent?.role] || 'demo-data';
    addComposerSkills(key);
  };
  window.openAgent = window.openAgentChat;

  const teamRoleLabel = email => ({
    'data@nev.com':'数据分析师', 'ops@nev.com':'电商运营师', 'marketing@nev.com':'数字营销师', 'design@nev.com':'视觉设计师', 'admin@nev.com':'超级管理员'
  }[String(email || '').toLowerCase()] || '团队成员');
  window.openTeamSpace = async () => {
    let page = document.getElementById('team-space-files');
    if (!page) { page = document.createElement('section'); page.id = 'team-space-files'; page.className = 'page'; document.querySelector('.content')?.appendChild(page); }
    document.querySelectorAll('.page').forEach(item => item.classList.remove('active')); page.classList.add('active');
    document.getElementById('crumb').innerText = '团队空间';
    page.innerHTML = `<main class="team-space-page"><header><button class="link" onclick="openAgentChat('demo-data')">← 返回智能体对话</button><small>TEAM SHARED SPACE</small><h1>团队共享资料库</h1><p>四个岗位上传并共享的资料都在这里；私有资料不会展示给其他成员。</p></header><section class="team-space-board"><div class="team-space-head"><div><b>共享资料</b><span id="teamSharedCount">正在加载…</span></div><button class="secondary" onclick="openAgentChat('demo-data')">上传团队资料</button></div><div id="teamSharedFiles" class="team-shared-files"><p>正在读取团队资料…</p></div></section></main>`;
    try {
      const token = localStorage.getItem('nev_token') || ''; const response = await fetch('/api/files', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await response.json().catch(() => ({})); if (!response.ok) throw Error(data.error || '暂时无法读取团队资料。');
      const files = (Array.isArray(data) ? data : []).filter(file => file.visibility === 'team');
      document.getElementById('teamSharedCount').textContent = `${files.length} 份团队资料`;
      const holder = document.getElementById('teamSharedFiles');
      holder.innerHTML = files.length ? files.map(file => `<article><i>▤</i><div><b>${escapeHtml(file.name)}</b><span>上传岗位：${escapeHtml(teamRoleLabel(file.ownerEmail))} · ${escapeHtml(file.parseStatus === 'ready' ? '已可供智能体引用' : '等待解析')}</span></div><em>${escapeHtml((file.mimeType || 'FILE').split('/').pop().toUpperCase())}</em></article>`).join('') : '<div class="team-space-empty"><b>还没有团队共享资料</b><p>成员在对话框上传文件时，勾选“共享到团队资料库”即可出现在这里。</p></div>';
    } catch (error) { document.getElementById('teamSharedFiles').innerHTML = `<div class="team-space-empty"><b>暂时无法读取团队资料</b><p>${escapeHtml(error.message)}</p></div>`; }
  };
  function addTeamSpaceEntry() {
    const nav = document.querySelector('#agent-chat .chat-workspace nav');
    if (!nav || nav.querySelector('[data-team-space]')) return;
    const entry = document.createElement('button'); entry.dataset.teamSpace = 'true'; entry.textContent = '团队空间'; entry.onclick = () => window.openTeamSpace();
    const project = [...nav.querySelectorAll('button')].find(button => button.textContent.trim() === '我的项目');
    if (project) project.insertAdjacentElement('afterend', entry); else nav.appendChild(entry);
  }
  function promoteWelcomeIP() {
    const welcome = document.querySelector('#agent-chat .chat-welcome'); const title = welcome?.querySelector('h1'); const image = welcome?.querySelector('img');
    if (title && image && title.nextElementSibling !== image) title.insertAdjacentElement('afterend', image);
  }
  // 对话页会在运行时重绘，持续监听以确保左侧“团队空间”入口不会被后续脚本覆盖。
  const teamSpaceObserver = new MutationObserver(() => { addTeamSpaceEntry(); promoteWelcomeIP(); });
  document.addEventListener('DOMContentLoaded', () => teamSpaceObserver.observe(document.body, { childList:true, subtree:true }));
  if (document.body) teamSpaceObserver.observe(document.body, { childList:true, subtree:true });
  const teamSpaceStyle = document.createElement('style');
  teamSpaceStyle.textContent = `.team-space-page{max-width:980px;margin:0 auto;padding:40px 34px}.team-space-page header small{display:block;margin-top:22px;color:#087653;font-weight:800;letter-spacing:.12em}.team-space-page h1{margin:9px 0;color:#143f31;font-size:32px}.team-space-page header p{color:#728178;line-height:1.75}.team-space-board{margin-top:28px;border:1px solid #dce9e1;border-radius:16px;background:#fff;overflow:hidden}.team-space-head{display:flex;align-items:center;justify-content:space-between;padding:17px 19px;border-bottom:1px solid #e8f0eb}.team-space-head b{color:#143f31}.team-space-head span{margin-left:10px;color:#718178;font-size:12px}.team-shared-files article{display:flex;align-items:center;gap:13px;padding:16px 19px;border-bottom:1px solid #eef3ef}.team-shared-files article:last-child{border-bottom:0}.team-shared-files i{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#eaf7ef;color:#087653;font-style:normal}.team-shared-files b,.team-shared-files span{display:block}.team-shared-files b{color:#173f31;font-size:14px}.team-shared-files span{margin-top:4px;color:#77867f;font-size:12px}.team-shared-files em{margin-left:auto;padding:5px 8px;border-radius:999px;background:#f1f7f3;color:#087653;font-size:10px;font-style:normal}.team-space-empty{padding:48px 20px;text-align:center;color:#75847d}.team-space-empty b{display:block;color:#244b3b}.team-space-empty p{margin:7px 0 0;font-size:12px}@media(max-width:680px){.team-space-page{padding:26px 16px}.team-space-head{align-items:flex-start;gap:12px}.team-shared-files article{padding:14px}.team-shared-files em{display:none}}`;
  document.head.appendChild(teamSpaceStyle);
  const welcomeHeroStyle = document.createElement('style');
  welcomeHeroStyle.textContent = `#agent-chat .chat-welcome h1{margin:8px 0 12px!important;font-size:clamp(38px,3.2vw,52px)!important;line-height:1.16!important;letter-spacing:-.04em!important}#agent-chat .chat-welcome img{display:block;width:246px!important;height:246px!important;margin:20px auto 18px!important;border-radius:42px!important}@media(max-width:700px){#agent-chat .chat-welcome img{width:180px!important;height:180px!important}#agent-chat .chat-welcome h1{font-size:32px!important}}`;
  document.head.appendChild(welcomeHeroStyle);
  const openAgentChatWithTeamSpace = window.openAgentChat;
  window.openAgentChat = id => { openAgentChatWithTeamSpace(id); addTeamSpaceEntry(); promoteWelcomeIP(); };

  window.downloadLiveDataExcel = () => {
    const rows = [
      ['直播日期','场次','观看人数','商品点击','成交订单','成交金额(元)','平均停留(秒)'],
      ['2026-08-04','新品预热专场',18620,3928,316,184600,86],
      ['2026-08-11','车型卖点讲解',22380,4860,421,257300,102],
      ['2026-08-18','试驾福利专场',19840,4521,387,231800,94],
      ['2026-08-25','月度收官直播',26750,5980,508,314900,118]
    ];
    const html = `<html><head><meta charset="utf-8"></head><body><table border="1">${rows.map((row, index) => `<tr>${row.map(cell => `<${index ? 'td' : 'th'}>${escapeHtml(cell)}</${index ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</table></body></html>`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' }));
    link.download = '直播数据分析样表.xlsx';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  window.openKnowledgeGraph = () => {
    let page = document.getElementById('knowledge-graph-page');
    if (!page) { page = document.createElement('section'); page.id = 'knowledge-graph-page'; page.className = 'page'; document.querySelector('.content').appendChild(page); }
    page.innerHTML = `<main class="knowledge-graph"><header><button class="back" onclick="openAgentChat('demo-ops')">← 返回电商运营助手</button><small>SKILL OUTPUT · KNOWLEDGE GRAPH</small><h1>电商运营业务知识图谱</h1><p>围绕商品、店铺、用户和售后规则建立可追溯的运营关系网络。</p></header><section class="graph-board" aria-label="电商运营知识图谱"><article class="graph-node center"><b>跨境店铺运营</b><span>运营策略中枢</span></article><article class="graph-node n1"><b>商品与选品</b><span>价格带 · 利润 · 库存 · 认证</span></article><article class="graph-node n2"><b>流量与转化</b><span>搜索词 · 内容 · 详情页 · 广告</span></article><article class="graph-node n3"><b>用户与复购</b><span>用户分层 · 评价 · 会员 · 复购</span></article><article class="graph-node n4"><b>售后与合规</b><span>退换货 · 话术 · 平台规则 · 风险</span></article></section><div class="graph-legend"><span>✓ 商品链路已连接</span><span>✓ 用户画像已关联</span><span>✓ 售后规则可调用</span><span>✓ 可返回继续对话</span></div></main>`;
    document.querySelectorAll('.page').forEach(item => item.classList.remove('active'));
    page.classList.add('active');
    window.scrollTo(0, 0);
  };

  const localResultPaths = {
    '数据看板':'/results/data-dashboards.html',
    '独立站看板':'/results/independent-site-dashboard.html',
    '社媒看板':'/results/social-dashboard.html',
    '客户画像':'/results/customer-profile-dashboard.html',
    '用户画像':'/results/customer-profile-dashboard.html',
    '直播脚本':'/downloads/圣灵节专场营销-短视频分镜脚本.xlsx',
    '直播数据导出':'/downloads/A企业、竞品直播数据.xlsx',
    '知识图谱':'/results/knowledge-graph.html',
    '全年日历':'/results/marketing-calendar.html',
    '营销日历':'/results/marketing-calendar.html',
    '发布平台':'/results/publish-platform.html',
    '发布物料':'/results/publish-platform.html'
  };
  window.openInternalSkill = name => {
    if (localResultPaths[name]) { window.location.href = localResultPaths[name]; return; }
    if (window.showStructuredResult) return window.showStructuredResult(name);
    return window.openQuickFeature(name);
  };

  const keywordSkills = [
    { test: /(?:采集|爬取|导出|下载).{0,8}直播|直播.{0,8}(?:数据|excel|表格|采集|爬取|导出|下载)/i, label:'直播数据采集', text:'已完成直播与竞品数据整理，下面可直接下载 Excel 原始数据表。', href:'/downloads/A企业、竞品直播数据.xlsx', link:'下载直播数据 Excel', download:true },
    { test: /知识图谱|运营图谱|店铺关系/i, label:'电商运营知识图谱', text:'已生成电商运营知识图谱，商品、流量、用户与售后关系已整理完成。', href:'/results/knowledge-graph.html', link:'打开知识图谱' },
    { test: /发布平台|内容分发|渠道发布/i, label:'内容发布平台', text:'已准备内容发布平台，可在平台内检查物料、选择渠道并发起分发。', href:'/results/publish-platform.html', link:'打开发布平台' },
    { test: /全年.{0,4}(?:营销)?日历|营销日历|日历.{0,6}营销/i, label:'全年营销日历', text:'已生成全年营销节奏入口，可查看 2026 年节点、活动和内容排期。', href:'/results/marketing-calendar.html', link:'打开全年营销日历' },
    { test: /独立站.{0,6}(?:看板|数据)|独立站看板/i, label:'独立站数据看板', text:'独立站运营数据看板已生成，可全屏查看访问、停留与转化数据。', href:'/results/independent-site-dashboard.html', link:'全屏打开独立站看板' },
    { test: /社媒.{0,6}(?:看板|数据)|社交媒体.{0,6}看板/i, label:'社媒数据看板', text:'社媒数据看板已生成，可全屏查看粉丝、互动与活动效果。', href:'/results/social-dashboard.html', link:'全屏打开社媒看板' },
    { test: /客户画像|用户画像.{0,6}看板|客户.{0,6}看板/i, label:'客户画像看板', text:'客户画像可视化看板已生成，可全屏查看区域、年龄、偏好和转化路径。', href:'/results/customer-profile-dashboard.html', link:'全屏打开客户画像看板' },
    { test: /(?:数据分析|经营|业务)?数据看板|看数据看板/i, label:'数据分析看板', text:'已整理三类数据成果，请选择独立站、社媒或客户画像看板全屏查看。', href:'/results/data-dashboards.html', link:'选择数据看板' }
  ];
  function showKeywordSkill(skill, query) {
    const input = document.getElementById('agentInput');
    const messages = document.getElementById('agentMessages');
    if (!input || !messages) return;
    input.value = '';
    messages.insertAdjacentHTML('beforeend', `<div class="bubble me">${escapeHtml(query)}</div><div class="bubble bot" id="keywordSkillWait">正在分析需求并匹配技能包…</div>`);
    const overlay = document.createElement('div');
    overlay.className = 'thinking-overlay';
    overlay.innerHTML = `<div><img src="/assets/agent-ip.png" alt="智能助手 IP"><span>AGENT THINKING</span><h2>正在调用「${escapeHtml(skill.label)}」</h2><p>正在检索项目资料、整理结果并生成本地访问链接…</p><div><i></i></div></div>`;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.remove();
      const wait = document.getElementById('keywordSkillWait');
      if (wait) wait.outerHTML = `<div class="bubble bot">${escapeHtml(skill.text)}<br><a class="skill-result-link" href="${skill.href}"${skill.download ? ' download' : ''}>${escapeHtml(skill.link)} →</a></div>`;
      messages.scrollTop = messages.scrollHeight;
    }, 700);
  }
  const originalSendAgentChat = window.sendAgentChat;
  window.sendAgentChat = async () => {
    const query = document.getElementById('agentInput')?.value.trim() || '';
    const skill = keywordSkills.find(item => item.test.test(query));
    if (skill) return showKeywordSkill(skill, query);
    return originalSendAgentChat();
  };

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const bridge = document.getElementById('agent-bridge');
      if (!bridge) return;
      bridge.querySelector('.bridge-head small').textContent = 'FOUR ASSISTANTS · ONE TEAM';
      bridge.querySelector('.bridge-head p').textContent = '数据、运营、营销与视觉四个岗位助手，都在同一平台内完成技能调用与成果保存。';
      const avatarPaths = ['data-analyst.png', 'ecommerce-operator.png', 'digital-marketer.png', 'visual-designer.jpg'];
      bridge.querySelectorAll('.bridge-role-avatar').forEach((avatar, index) => { avatar.src = `/assets/role-avatars/${avatarPaths[index]}`; });
      if (!bridge.querySelector('.admin-workspace-link')) {
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'admin-workspace-link';
        link.innerHTML = '管理员空间 <span>→</span>';
        link.addEventListener('click', () => { window.showPage?.('agents'); window.scrollTo(0, 0); });
        bridge.querySelector('.bridge-head').appendChild(link);
      }
    }, 160);
  });
})();

/* 视觉岗位兢底：无论页面显示“视觉设计师”还是“内容创意助手”，视频、脚本、分镜请求都直接交付 Excel，不再转给通用模型追问。 */
(() => {
  const isVisualPage = () => /\u89c6\u89c9\u8bbe\u8ba1\u5e08|\u5185\u5bb9\u521b\u610f\u52a9\u624b|\u5185\u5bb9\u521b\u610f/.test(document.querySelector('#agent-chat .chat-brand')?.textContent || document.querySelector('#agent-chat .chat-profile')?.textContent || '');
  const isVideoRequest = value => /\u89c6\u9891|\u77ed\u89c6\u9891|\u811a\u672c|\u5206\u955c|\u955c\u5934|\u62cd\u6444|\u53e3\u64ad/i.test(value || '');
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const previousSend = window.sendAgentChat;
  window.sendAgentChat = async () => {
    const input = document.getElementById('agentInput');
    const query = input?.value.trim() || '';
    if (!isVisualPage() || !isVideoRequest(query)) return previousSend?.();
    const messages = document.getElementById('agentMessages');
    if (!messages) return previousSend?.();
    input.value = '';
    messages.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(query)}</div><div class="bubble bot" id="visual-delivery-wait">正在进行短视频创意校检…</div>`);
    await new Promise(resolve => setTimeout(resolve, 700));
    const wait = document.getElementById('visual-delivery-wait');
    if (wait) wait.outerHTML = '<div class="bubble bot">已校检完成，已生成短视频分镜脚本。<br><a class="skill-result-link" href="/downloads/圣灵节专场营销-短视频分镜脚本.xlsx" download>下载短视频分镜脚本 Excel →</a></div>';
    messages.scrollTop = messages.scrollHeight;
  };
})();

/* 对话附件可视化：图片与文档在消息流中可见；数字营销岗位提供快速校检回执。 */
(() => {
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const isImage = file => /^image\//.test(file.type || '');
  const renderAttachments = files => {
    const messages = document.getElementById('agentMessages');
    if (!messages || !files.length) return;
    const cards = files.map(file => isImage(file)
      ? `<figure class="chat-upload-card image"><img src="${URL.createObjectURL(file)}" alt="${esc(file.name)}"><figcaption>${esc(file.name)}</figcaption></figure>`
      : `<div class="chat-upload-card document"><i>${esc((file.name.split('.').pop() || 'FILE').slice(0, 5).toUpperCase())}</i><span><b>${esc(file.name)}</b><small>${Math.max(1, Math.ceil(file.size / 1024))} KB · 已添加</small></span></div>`).join('');
    messages.insertAdjacentHTML('beforeend', `<div class="bubble me attachment-bubble"><b>已上传资料</b><div class="chat-upload-grid">${cards}</div></div>`);
    messages.scrollTop = messages.scrollHeight;
  };
  const isMarketingChat = () => /数字营销/.test(document.querySelector('#agent-chat .chat-brand b')?.textContent || '');
  const install = () => {
    document.querySelectorAll('#agent-chat input[type=file]').forEach(input => input.setAttribute('accept', '*/*'));
    if (window.__nevAttachmentFlowInstalled || typeof window.chatUpload !== 'function' || typeof window.sendAgentChat !== 'function') return;
    window.__nevAttachmentFlowInstalled = true;
    const baseUpload = window.chatUpload;
    window.chatUpload = async event => {
      const files = [...(event.target?.files || [])];
      if (!files.length) return;
      await baseUpload(event);
      renderAttachments(files);
      event.target.value = '';
    };
    const baseSend = window.sendAgentChat;
    window.sendAgentChat = async () => {
      const input = document.getElementById('agentInput');
      const message = input?.value.trim() || '';
      const hasAttachments = Boolean(document.querySelector('#agentMessages .attachment-bubble'));
      if (!message || !hasAttachments || !isMarketingChat()) return baseSend();
      const box = document.getElementById('agentMessages');
      box.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(message)}</div>`);
      input.value = '';
      const wait = document.createElement('div');
      wait.className = 'bubble bot marketing-check';
      wait.textContent = '正在校检图片与资料…';
      box.appendChild(wait); box.scrollTop = box.scrollHeight;
      await new Promise(resolve => setTimeout(resolve, 1200));
      const names = [...document.querySelectorAll('.attachment-bubble figcaption,.attachment-bubble .chat-upload-card b')].map(node => node.textContent).filter(Boolean);
      wait.innerHTML = `<b>✓ 已校检完成</b><br>已识别并关联 ${names.length} 份上传资料，可用于本轮数字营销策划、素材审核与发布建议。${names.length ? `<br><small>已校检：${names.map(esc).join('、')}</small>` : ''}`;
      box.scrollTop = box.scrollHeight;
    };
  };
  setTimeout(install, 0);
  const observer = new MutationObserver(() => { document.querySelectorAll('#agent-chat input[type=file]').forEach(input => input.setAttribute('accept', '*/*')); });
  if (document.body) observer.observe(document.body, { childList:true, subtree:true });
  const style = document.createElement('style');
  style.textContent = `.attachment-bubble{max-width:min(560px,88%)}.attachment-bubble>b{display:block;margin-bottom:8px;font-size:12px}.chat-upload-grid{display:flex;flex-wrap:wrap;gap:9px}.chat-upload-card{box-sizing:border-box;overflow:hidden;border:1px solid rgba(255,255,255,.5);border-radius:12px;background:rgba(255,255,255,.18);text-align:left}.chat-upload-card.image{width:132px;margin:0}.chat-upload-card.image img{display:block;width:132px;height:100px;object-fit:cover}.chat-upload-card figcaption{padding:6px 8px;overflow:hidden;color:inherit;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.chat-upload-card.document{display:flex;align-items:center;gap:8px;min-width:185px;max-width:270px;padding:9px}.chat-upload-card.document i{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:#fff;color:#087653;font-size:9px;font-style:normal;font-weight:800}.chat-upload-card.document span{min-width:0}.chat-upload-card.document b,.chat-upload-card.document small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.chat-upload-card.document b{font-size:11px}.chat-upload-card.document small{margin-top:3px;font-size:9px;opacity:.82}.marketing-check b{color:#087653}.marketing-check small{display:block;margin-top:7px;color:#64766d;font-size:11px}@media(max-width:620px){.chat-upload-card.image,.chat-upload-card.image img{width:106px}.chat-upload-card.image img{height:80px}.chat-upload-card.document{min-width:150px;max-width:100%}}`;
  document.head.appendChild(style);
})();

/* 附件先暂存于输入框，再与文字一次性发送。 */
(() => {
  let pendingFiles = [];
  const escape = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const renderPending = () => {
    const input = document.getElementById('agentInput');
    const composer = input?.closest('.chat-composer');
    if (!composer) return;
    let tray = composer.querySelector('#chatPendingAttachments');
    if (!pendingFiles.length) { tray?.remove(); return; }
    if (!tray) { tray = document.createElement('div'); tray.id = 'chatPendingAttachments'; input.before(tray); }
    tray.innerHTML = `<span>待发送 ${pendingFiles.length} 项</span>${pendingFiles.map((file, index) => /^image\//.test(file.type || '') ? `<figure><img src="${URL.createObjectURL(file)}" alt="${escape(file.name)}"><button type="button" onclick="removePendingChatFile(${index})" aria-label="移除 ${escape(file.name)}">×</button></figure>` : `<div class="pending-file"><i>${escape((file.name.split('.').pop() || 'FILE').slice(0, 5).toUpperCase())}</i><b>${escape(file.name)}</b><button type="button" onclick="removePendingChatFile(${index})" aria-label="移除 ${escape(file.name)}">×</button></div>`).join('')}`;
  };
  window.removePendingChatFile = index => { pendingFiles.splice(index, 1); renderPending(); };
  const install = () => {
    if (window.__nevStagedAttachmentsInstalled || typeof window.chatUpload !== 'function' || typeof window.sendAgentChat !== 'function') return;
    window.__nevStagedAttachmentsInstalled = true;
    const immediateUpload = window.chatUpload;
    window.chatUpload = async event => {
      const chosen = [...(event.target?.files || [])];
      if (!chosen.length) return;
      pendingFiles.push(...chosen);
      event.target.value = '';
      renderPending();
      const status = document.getElementById('chatFileStatus');
      if (status) status.textContent = `已选择 ${pendingFiles.length} 项资料，输入需求后点击发送即可一起提交。`;
    };
    const immediateSend = window.sendAgentChat;
    window.sendAgentChat = async () => {
      const message = document.getElementById('agentInput')?.value.trim() || '';
      if (!pendingFiles.length) return immediateSend();
      if (!message) { const status = document.getElementById('chatFileStatus'); if (status) status.textContent = '请先输入要和资料一起发送的问题或说明。'; return; }
      const files = pendingFiles.splice(0);
      renderPending();
      const status = document.getElementById('chatFileStatus');
      if (status) status.textContent = `正在提交 ${files.length} 项资料与本次需求…`;
      await immediateUpload({ target: { files } });
      return immediateSend();
    };
  };
  setTimeout(install, 20);
  const style = document.createElement('style');
  style.textContent = `#chatPendingAttachments{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 10px;padding:10px 12px;border:1px solid #d8e8df;border-radius:13px;background:#f8fcf9}#chatPendingAttachments>span{margin-right:2px;color:#087653;font-size:11px;font-weight:800}#chatPendingAttachments figure,#chatPendingAttachments .pending-file{position:relative;display:flex;align-items:center;gap:7px;margin:0;border:1px solid #dce9e1;border-radius:9px;background:#fff;overflow:hidden}#chatPendingAttachments figure img{display:block;width:54px;height:44px;object-fit:cover}#chatPendingAttachments button{position:absolute;top:2px;right:2px;display:grid;place-items:center;width:18px;height:18px;padding:0;border:0;border-radius:50%;background:rgba(21,41,32,.72);color:#fff;font-size:15px;line-height:1;cursor:pointer}#chatPendingAttachments .pending-file{min-width:145px;max-width:235px;padding:8px 26px 8px 8px}#chatPendingAttachments .pending-file i{display:grid;place-items:center;width:28px;height:28px;border-radius:7px;background:#eaf7ef;color:#087653;font-size:8px;font-style:normal;font-weight:800}#chatPendingAttachments .pending-file b{overflow:hidden;color:#29483b;font-size:10px;text-overflow:ellipsis;white-space:nowrap}`;
  document.head.appendChild(style);
})();

/* 结果页统一回到指定岗位：不依赖浏览器历史，避免误退回登录页。 */
(() => {
  const params = new URLSearchParams(window.location.search);
  const agentFromResult = params.get('agent');
  if (agentFromResult) {
    sessionStorage.setItem('nev_return_agent', agentFromResult);
    params.delete('agent');
    const cleanQuery = params.toString();
    history.replaceState({}, '', `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${window.location.hash}`);
  }
  let tries = 0;
  const restore = () => {
    const agent = sessionStorage.getItem('nev_return_agent');
    const login = document.getElementById('login');
    if (!agent || !localStorage.getItem('nev_token') || typeof window.openAgentChat !== 'function' || login?.style.display !== 'none') return;
    window.openAgentChat(agent);
    sessionStorage.removeItem('nev_return_agent');
  };
  const timer = setInterval(() => {
    restore();
    if (++tries > 30 || !sessionStorage.getItem('nev_return_agent')) clearInterval(timer);
  }, 250);
})();

/* 统一页面跳转：所有岗位工具和团队资料页都保留当前助手上下文，避免落入旧的静态页面。 */
(() => {
  const previousOpenAgentChat = window.openAgentChat;
  window.nevNavigation = window.nevNavigation || { lastAgentId: 'demo-data' };

  window.openAgentChat = id => {
    if (id) window.nevNavigation.lastAgentId = id;
    return previousOpenAgentChat(id);
  };

  window.returnToCurrentAgent = () => window.openAgentChat(window.nevNavigation.lastAgentId || 'demo-data');

  const previousTeamSpace = window.openTeamSpace;
  window.openTeamSpace = async () => {
    const result = await previousTeamSpace?.();
    const page = document.getElementById('team-space-files');
    if (page) {
      page.querySelectorAll('button').forEach(button => {
        const text = button.textContent || '';
        if (/返回|上传团队资料/.test(text)) {
          button.removeAttribute('onclick');
          button.onclick = () => window.returnToCurrentAgent();
        }
      });
    }
    return result;
  };

  const previousInternalSkill = window.openInternalSkill;
  window.openInternalSkill = name => {
    if (typeof previousInternalSkill === 'function') return previousInternalSkill(name);
    if (typeof window.showStructuredResult === 'function') return window.showStructuredResult(name);
    return window.openQuickFeature?.(name);
  };

  const resultNameByPath = {
    'independent-site-dashboard.html': '独立站看板',
    'social-dashboard.html': '社媒看板',
    'customer-profile-dashboard.html': '客户画像',
    'knowledge-graph.html': '知识图谱',
    'marketing-calendar.html': '全年营销日历',
    'publish-platform.html': '发布平台',
    'data-dashboards.html': '数据看板'
  };

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download')) return;
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('/results/')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const filename = href.split('/').pop();
    window.openInternalSkill(resultNameByPath[filename] || link.textContent.trim() || '成果预览');
  }, true);
})();

/* 登录成功后，内联隐藏状态必须优先于登录页的展示样式。 */
(()=>{
  const style=document.createElement('style');
  style.textContent='#login[style*="display: none"]{display:none!important}#app[style*="display: flex"]{display:flex!important}';
  document.head.appendChild(style);
})();

/* 管理员工作台：显示四个岗位及对应团队成员，员工端不展示此管理视图。 */
(() => {
  const roles = [
    ['数据分析师', 'data-member.jpg'],
    ['电商运营师', 'ecommerce-member.jpg'],
    ['数字营销师', 'marketing-member.jpg'],
    ['视觉设计师', 'visual-member.png']
  ];
  const style = document.createElement('style');
  style.textContent = `
    body.admin-session #dashboard .roles .role{position:relative;min-height:178px;padding:20px 18px 18px 112px!important;cursor:pointer}
    body.admin-session #dashboard .roles .team-role-avatar{position:absolute;left:18px;top:20px;width:76px;height:76px;object-fit:cover;border:2px solid #d9ebe0;border-radius:18px;background:#fff;box-shadow:0 8px 18px rgba(17,70,50,.12)}
    body.admin-session #dashboard .roles .role-icon{display:none!important}
    body.admin-session #dashboard .roles .role img:not(.team-role-avatar){display:none!important}
    body.admin-session #dashboard .roles .role>.tag{display:none!important}
    body.admin-session #dashboard .roles .team-role-member{display:block;margin:5px 0 12px;color:#087653;font-size:12px;font-weight:800}
    body.admin-session #dashboard .team-assistant-showcase{margin:28px 0 0}
    body.admin-session #dashboard .team-assistant-showcase .showcase-title{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}
    body.admin-session #dashboard .team-assistant-showcase h3{margin:0;color:#143f31;font-size:20px}
    body.admin-session #dashboard .team-assistant-showcase p{margin:5px 0 0;color:#718178;font-size:12px}
    body.admin-session #dashboard .assistant-showcase-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
    body.admin-session #dashboard .assistant-showcase-card{overflow:hidden;border:1px solid #dce9e1;border-radius:16px;background:#fff;box-shadow:0 8px 22px rgba(23,73,54,.06)}
    body.admin-session #dashboard .assistant-showcase-card img{display:block;width:100%;height:160px;object-fit:cover;object-position:center 18%;background:#f6faf7}
    body.admin-session #dashboard .assistant-showcase-body{padding:14px 15px 16px}
    body.admin-session #dashboard .assistant-showcase-body small{color:#087653;font-weight:800;letter-spacing:.06em}
    body.admin-session #dashboard .assistant-showcase-body h4{margin:7px 0 6px;color:#143f31;font-size:16px}
    body.admin-session #dashboard .assistant-showcase-body button{width:100%;margin-top:12px;padding:9px 11px;border:0;border-radius:9px;background:#087653;color:#fff;font-weight:800;cursor:pointer}
    @media(max-width:980px){body.admin-session #dashboard .assistant-showcase-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:540px){body.admin-session #dashboard .assistant-showcase-grid{grid-template-columns:1fr}}
    @media(max-width:680px){body.admin-session #dashboard .roles .role{padding-left:104px!important}}
  `;
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    document.querySelectorAll('#dashboard .section-title h3').forEach(title => {
      if (title.textContent.trim() === '岗位专属助手') title.textContent = '岗位';
    });
    document.querySelectorAll('#dashboard .roles .role').forEach(card => {
      const heading = card.querySelector('h4');
      const role = roles.find(item => item[0] === heading?.textContent.trim());
      if (!role || card.querySelector('.team-role-avatar')) return;
      const image = document.createElement('img');
      image.className = 'team-role-avatar';
      image.src = `/assets/role-avatars/${role[1]}`;
      image.alt = `${role[0]}岗位头像`;
      heading.before(image);
      const member = document.createElement('span');
      member.className = 'team-role-member';
      member.textContent = '岗位智能助手';
      heading.after(member);
    });

    if (!document.getElementById('team-assistant-showcase')) {
      const assistants = [
        ['数据洞察助手', '数据分析师', 'data-analyst.png', 'demo-data'],
        ['电商运营助手', '电商运营师', 'ecommerce-operator.png', 'demo-ops'],
        ['数字营销助手', '数字营销师', 'digital-marketer.png', 'demo-marketing'],
        ['内容创意助手', '视觉设计师', 'visual-designer.jpg', 'demo-visual']
      ];
      const section = document.createElement('section');
      section.id = 'team-assistant-showcase';
      section.className = 'team-assistant-showcase';
      section.innerHTML = `<div class="showcase-title"><div><h3>岗位智能体</h3><p>每个岗位配置一位专属智能助手，可直接调用。</p></div></div><div class="assistant-showcase-grid">${assistants.map(item => `<article class="assistant-showcase-card"><img src="/assets/role-avatars/${item[2]}" alt="${item[0]} IP 形象"><div class="assistant-showcase-body"><small>${item[1]}</small><h4>${item[0]}</h4><button type="button" data-agent="${item[3]}">进入智能体 →</button></div></article>`).join('')}</div>`;
      document.querySelector('#dashboard .roles')?.after(section);
      section.querySelectorAll('[data-agent]').forEach(button => button.addEventListener('click', () => window.openAgentChat?.(button.dataset.agent) || window.showPage?.('agents')));
    }
  }, 220));
})();

/* 无 IP 登录页：以岗位协作网络取代形象图，保持企业团队空间的专业感。 */
(()=>{
  const style=document.createElement('style');
  style.textContent=`
    #login.login{grid-template-columns:minmax(0,1.12fr) minmax(420px,.88fr)!important;background:#f5f8f6!important}
    #login .login-intro{padding:clamp(42px,6vw,88px)!important;background:linear-gradient(145deg,#eff8f2 0%,#e4f3e9 58%,#d9eee3 100%)!important}
    #login .login-intro:after{width:680px!important;height:680px!important;right:-270px!important;bottom:-320px!important;border-color:rgba(7,118,83,.13)!important}
    #login .login-copy{max-width:600px!important}#login .login-mascot{display:block!important;max-width:min(430px,44vw)!important;max-height:48vh!important;object-fit:contain!important}
    #login .login-intro h1{font-size:clamp(38px,4.1vw,64px)!important;max-width:590px!important;color:#0c3b2e!important}#login .login-intro>.brand .brand-mark{width:46px!important;height:46px!important;background:#087653!important;border:0!important;box-shadow:none!important;font-size:0!important}#login .login-intro>.brand .brand-mark:after{content:'NEV';font-size:11px;font-weight:800;color:#fff;letter-spacing:.04em}
    #login .login-network{position:relative;width:min(470px,78%);height:210px;margin:42px 0 0;border:1px solid rgba(12,116,83,.17);border-radius:22px;background:rgba(255,255,255,.52);overflow:hidden}
    #login .login-network:before,#login .login-network:after{content:"";position:absolute;top:50%;left:50%;width:72%;height:1px;background:#93c6aa;transform-origin:left}#login .login-network:before{transform:rotate(28deg)}#login .login-network:after{transform:rotate(-28deg)}
    #login .login-network span{position:absolute;z-index:1;display:grid;place-items:center;width:56px;height:56px;border-radius:18px;background:#fff;border:1px solid #cce3d4;color:#087653;font-size:12px;font-weight:800;box-shadow:0 10px 23px rgba(19,83,55,.09)}
    #login .login-network .network-center{left:calc(50% - 30px);top:calc(50% - 28px);width:60px;height:60px;border-color:#087653;background:#087653;color:#fff;font-size:15px}#login .login-network span:nth-child(2){left:9%;top:22px}#login .login-network span:nth-child(3){right:9%;top:22px}#login .login-network span:nth-child(4){left:16%;bottom:22px}#login .login-network span:nth-child(5){right:16%;bottom:22px}
    #login .login-panel{background:#fff!important;padding:clamp(32px,5vw,76px)!important}#login .login-card{max-width:460px!important;border-radius:18px!important;box-shadow:0 20px 55px rgba(20,71,53,.08)!important}#login .workspace-badge>span{background:#087653!important}
    #login .login-card .primary{min-height:48px!important;background:#087653!important;box-shadow:0 10px 22px rgba(8,118,83,.18)!important}#login .login-card .primary:hover{background:#066447!important;transform:translateY(-1px)}#login .login-card input:focus{outline:3px solid rgba(8,118,83,.17)!important;border-color:#087653!important}
    @media(max-width:1000px){#login .login-network{display:none}#login.login{grid-template-columns:1fr!important}#login .login-intro{display:none!important}}
    @media(prefers-reduced-motion:reduce){#login .login-card .primary{transition:none!important}}
  `;document.head.appendChild(style);
  const install=()=>{const mascot=document.querySelector('#login .login-mascot');if(mascot)mascot.src='assets/agent-ip.png'};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();

/* 企业团队入口：按最终视觉稿重构，去除所有 IP、人物与装饰性图片。 */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    #login.login{position:relative;min-height:100dvh;display:block!important;background:#f7f5f0!important}
    #login .login-intro{position:relative;isolation:isolate;display:flex!important;flex-direction:column;width:60%;min-height:100dvh;padding:clamp(48px,7vw,110px)!important;background:#f7f5f0!important;color:#123f32!important;overflow:hidden}
    #login .login-intro:before{content:"";position:absolute;inset:0;z-index:-2;opacity:.78;background-image:linear-gradient(rgba(18,63,50,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(18,63,50,.07) 1px,transparent 1px),radial-gradient(circle at 74% 47%,rgba(184,150,69,.18) 0 3px,transparent 4px),radial-gradient(circle at 54% 63%,rgba(184,150,69,.16) 0 3px,transparent 4px),radial-gradient(circle at 88% 69%,rgba(184,150,69,.16) 0 3px,transparent 4px);background-size:72px 72px,72px 72px,190px 160px,210px 190px,240px 180px;background-position:0 0,0 0,0 0,50px 40px,120px 80px}
    #login .login-intro:after{content:"";position:absolute;z-index:-1;width:88%;height:64%;right:-18%;bottom:12%;border:1px solid rgba(184,150,69,.45)!important;border-left:0!important;border-radius:55% 0 0 48%!important;transform:rotate(-12deg);box-shadow:-220px 116px 0 -219px rgba(184,150,69,.5),-420px 4px 0 -419px rgba(184,150,69,.5),-110px -106px 0 -109px rgba(184,150,69,.5)}
    #login .login-world-map{position:absolute;z-index:0;inset:17% 2% 8% 2%;background:none!important;opacity:.68;pointer-events:none}
    #login .login-world-map svg{display:block;width:100%;height:100%}
    #login .login-intro>.brand{position:relative;z-index:1;padding:0!important;color:#123f32!important}
    #login .login-intro>.brand .brand-mark{display:grid!important;width:48px!important;height:48px!important;border-radius:12px!important;background:#123f32!important;box-shadow:none!important}
    #login .login-intro>.brand .brand-mark:after{content:"NEV"!important;color:#fff!important;font-size:11px!important;letter-spacing:.05em}
    #login .login-intro>.brand b{font-size:15px!important;color:#123f32!important}.login-intro>.brand small{color:#6f8479!important;letter-spacing:.12em!important}
    #login .login-copy{position:relative;z-index:1;max-width:760px!important;margin:auto 0!important}
    #login .login-kicker{color:#087653!important;font-weight:800!important;letter-spacing:.14em!important}
    #login .login-copy h1{max-width:760px!important;margin:24px 0 22px!important;color:#123f32!important;font-family:"Noto Serif SC","Songti SC","STSong",serif!important;font-size:clamp(42px,4.35vw,72px)!important;line-height:1.08!important;letter-spacing:-.055em!important;text-wrap:balance}
    #login .login-copy p{max-width:540px!important;color:#64786e!important;font-size:15px!important;line-height:1.9!important}
    #login .login-features{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:0!important;max-width:760px;margin:58px 0 0!important;border-top:1px solid rgba(18,63,50,.17);padding-top:20px!important}
    #login .login-features span{display:block!important;padding:0 20px!important;border:0!important;border-left:1px solid rgba(18,63,50,.14)!important;border-radius:0!important;background:transparent!important;color:#123f32!important;font-size:15px!important;font-weight:800!important;white-space:normal!important}
    #login .login-features span:first-child{padding-left:0!important;border-left:0!important}
    #login .login-features span small{display:block;margin-top:7px;color:#71847a;font-size:11px;font-weight:500;line-height:1.5}
    #login .login-mascot,#login .login-network{display:none!important}
    #login .login-panel{position:absolute!important;inset:0 0 0 auto!important;width:40%!important;min-height:100dvh;display:flex!important;flex-direction:column;justify-content:center;padding:clamp(42px,4.5vw,92px)!important;background:#fbfaf7!important;border-left:1px solid #e7e1d5}
    #login .workspace-badge{max-width:460px!important;margin:0 auto 24px!important}.workspace-badge>span{width:44px!important;height:44px!important;border-radius:11px!important;background:#123f32!important}.workspace-badge b{color:#123f32!important}.workspace-badge small{color:#809087!important}
    #login .login-card{width:100%!important;max-width:460px!important;margin:0 auto!important;padding:38px!important;border:1px solid #e4ded2!important;border-radius:16px!important;background:rgba(255,255,255,.72)!important;box-shadow:0 18px 48px rgba(35,61,49,.08)!important}
    #login .login-card h2{margin:16px 0 8px!important;color:#123f32!important;font-family:"Noto Serif SC","Songti SC","STSong",serif!important;font-size:30px!important;letter-spacing:-.04em!important}
    #login .login-card p{margin-bottom:28px!important;color:#77867f!important}.login-card label{color:#466055!important;font-size:12px!important}
    #login .login-card input{height:52px!important;margin-bottom:18px!important;border:1px solid #dce4dc!important;border-radius:9px!important;background:#fff!important;color:#123f32!important}
    #login .login-card .primary{min-height:54px!important;margin-top:5px!important;border-radius:8px!important;background:#123f32!important;box-shadow:none!important;font-weight:800!important}.login-card .primary:hover{background:#0b3027!important;transform:translateY(-1px)}
    #login .login-options{margin:14px 0 4px!important;color:#708078!important}.login-options button{color:#087653!important}.hint{margin-top:18px!important;background:#f2f5f0!important;color:#6c7d73!important;border-radius:8px!important}.login-security{color:#89948d!important}
    @media(max-width:1000px){#login .login-intro{display:none!important}#login .login-panel{position:relative!important;width:100%!important;min-height:100dvh;border-left:0}}
  `;
  document.head.appendChild(style);

  const install = () => {
    document.title = '新能源汽车跨境出海方案';
    const intro = document.querySelector('#login .login-intro');
    if (!intro) return;
    if (!intro.querySelector('.login-world-map')) intro.insertAdjacentHTML('afterbegin', `<div class="login-world-map" aria-hidden="true"><svg viewBox="0 0 1400 850" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="#9eb5a7" stroke-width="2" opacity=".42" stroke-linecap="round" stroke-linejoin="round"><path d="M87 208 129 166 191 145 254 151 290 184 284 220 325 248 316 287 276 303 245 335 196 331 173 368 123 346 101 303 62 277Z"/><path d="M312 389 345 410 361 466 341 510 354 562 327 629 297 655 281 611 289 555 262 496 269 438Z"/><path d="M536 190 584 165 641 176 681 155 738 170 771 204 759 237 798 254 827 289 805 327 764 319 728 351 682 344 657 371 608 356 590 316 553 300 542 258 511 238Z"/><path d="M698 388 741 375 773 404 786 452 766 487 778 547 752 602 718 620 692 578 668 532 676 481 652 438Z"/><path d="M825 224 881 190 944 197 979 233 1027 245 1062 279 1052 314 1010 335 977 325 946 362 901 349 878 316 842 298Z"/><path d="M1052 504 1092 481 1147 495 1184 535 1176 585 1134 611 1092 592 1062 554Z"/></g><g stroke="#b99845" stroke-width="2.4" opacity=".72" stroke-linecap="round"><path d="M813 330C705 219 510 190 270 285"/><path d="M813 330C650 398 458 423 317 461"/><path d="M813 330C901 226 978 233 1051 289"/><path d="M813 330C934 400 1047 483 1117 543"/><path d="M813 330C738 432 726 514 729 575"/></g><g fill="#b99845" opacity=".9"><circle cx="813" cy="330" r="8"/><circle cx="270" cy="285" r="6"/><circle cx="317" cy="461" r="6"/><circle cx="1051" cy="289" r="6"/><circle cx="1117" cy="543" r="6"/><circle cx="729" cy="575" r="6"/></g></svg></div>`);
    const brand = intro.querySelector('.brand');
    if (brand) { brand.querySelector('b').textContent = '新能源汽车跨境出海方案'; brand.querySelector('small').textContent = 'ENTERPRISE WORKSPACE'; }
    const copy = intro.querySelector('.login-copy');
    if (copy) {
      copy.querySelector('.login-kicker').textContent = 'TEAM WORKSPACE';
      copy.querySelector('h1').innerHTML = '一个团队空间，<br>协同四类专业能力';
      copy.querySelector('p').textContent = '从数据洞察、跨境运营到数字营销与视觉创意，让项目、任务与知识在同一空间有序协作。';
      copy.querySelector('.login-features').innerHTML = '<span>数据洞察<small>市场趋势与经营分析</small></span><span>电商运营<small>店铺策略与合规管理</small></span><span>数字营销<small>内容策划与增长协同</small></span><span>视觉创意<small>品牌表达与设计规范</small></span>';
    }
    const hint = document.querySelector('#login .hint');
    if (hint) hint.textContent = '安全加密传输 · 保障数据安全 · 私密团队空间';
    const security = document.querySelector('#login .login-security');
    if (security) security.textContent = '企业级安全防护，守护每一次协作';
    intro.querySelector('.login-mascot')?.remove();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();

/* 电商运营资料导入 → 知识图谱：统一显示上传状态，并为生成操作提供明确入口。 */
(()=>{
  const assetNames=()=>JSON.parse(localStorage.getItem('nev_ops_graph_files')||'[]');
  const saveAssets=files=>localStorage.setItem('nev_ops_graph_files',JSON.stringify(files));
  const setStatus=(text,kind='')=>{const el=document.getElementById('opsGraphImportStatus');if(el){el.textContent=text;el.dataset.state=kind;}};
  const oldUpload=window.chatUpload;
  window.chatUpload=async event=>{
    const names=[...event.target.files].map(file=>file.name);
    if(!names.length)return;
    setStatus('正在导入：'+names.join('、'),'loading');
    try{await oldUpload(event);saveAssets([...assetNames(),...names]);setStatus('已导入 '+assetNames().length+' 份资料，可生成知识图谱。','ready');}
    catch(error){const message='导入失败：'+(error.message||'请检查登录状态和文件大小后重试。');setStatus(message,'error');const chatStatus=document.getElementById('chatFileStatus');if(chatStatus)chatStatus.textContent=message;}
  };
  window.requestKnowledgeGraph=()=>{
    const files=assetNames();
    if(!files.length){setStatus('请先导入 Excel、CSV、PDF、Word 或 TXT 资料。','error');return;}
    const input=document.getElementById('agentInput');
    if(!input)return;
    input.value='根据已导入的 '+files.length+' 份资料生成知识图谱';
    window.sendAgentChat();
  };
  function addOpsImport(id){
    if(id!=='demo-ops')return;
    const composer=document.querySelector('#agent-chat .chat-composer');
    const picker=composer?.querySelector('input[type=file]');
    if(!composer||!picker||composer.querySelector('.ops-graph-import'))return;
    picker.id='opsGraphFilePicker';picker.setAttribute('accept','*/*');
    composer.insertAdjacentHTML('afterbegin',`<section class="ops-graph-import" aria-label="知识图谱资料导入"><div><small>KNOWLEDGE GRAPH</small><b>导入运营资料，生成知识图谱</b><span id="opsGraphImportStatus">支持任意文件上传，图片、音视频和压缩包会进入解析流程</span></div><div class="ops-import-actions"><label for="opsGraphFilePicker">导入资料</label><button type="button" onclick="requestKnowledgeGraph()">生成知识图谱 →</button></div></section>`);
    const files=assetNames();if(files.length)setStatus('已导入 '+files.length+' 份资料，可生成知识图谱。','ready');
  }
  const oldOpen=window.openAgentChat;
  window.openAgentChat=id=>{oldOpen(id);addOpsImport(id);};
  const style=document.createElement('style');style.textContent=`
    .ops-graph-import{display:flex;justify-content:space-between;align-items:center;gap:18px;margin:0 0 12px;padding:14px 15px;border:1px solid #cfe5d7;border-radius:13px;background:linear-gradient(100deg,#eff9f2,#fbfdfb)}.ops-graph-import small,.ops-graph-import b,.ops-graph-import span{display:block}.ops-graph-import small{font-size:9px;letter-spacing:.11em;color:#087653}.ops-graph-import b{margin:4px 0;font-size:13px;color:#123f30}.ops-graph-import span{font-size:10px;color:#708078}.ops-graph-import span[data-state="ready"]{color:#087653}.ops-graph-import span[data-state="error"]{color:#b84747}.ops-import-actions{display:flex;gap:8px;flex-shrink:0}.ops-import-actions label,.ops-import-actions button{min-height:38px;display:inline-flex;align-items:center;justify-content:center;border-radius:9px;padding:8px 11px;font-size:11px;font-weight:700;cursor:pointer}.ops-import-actions label{border:1px solid #b9d9c5;background:#fff;color:#087653}.ops-import-actions button{border:0;background:#087653;color:#fff}@media(max-width:620px){.ops-graph-import{align-items:stretch;flex-direction:column}.ops-import-actions>*{flex:1}}
  `;document.head.appendChild(style);
})();

/* 知识库上传不再使用原型假成功提示，改为真实文件接口与可恢复错误状态。 */
(()=>{
  const htmlEscape=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const baseOpenModal=window.openModal;
  window.openModal=type=>{
    if(type!=='upload')return baseOpenModal?.(type);
    const modal=document.getElementById('modal');if(!modal)return;
    document.getElementById('modalTitle').textContent='导入知识库资料';
    document.getElementById('modalBody').innerHTML=`<section class="knowledge-upload-panel"><p>任何格式的文件都可上传至团队知识库。可直接解析的文本资料会立即用于问答；图片、音视频和压缩包需要多媒体解析服务完成后才可引用。</p><label>选择文件<input id="realKnowledgeFile" type="file" accept="*/*"></label><label>归属知识库<select id="realKnowledgeBase"><option>跨境电商运营库</option><option>海外市场与政策库</option><option>品牌视觉规范库</option></select></label><label class="team-share-files"><input id="realKnowledgeTeamShare" type="checkbox" checked> 共享到团队资料库（四位成员均可查看与引用）</label><div id="realKnowledgeStatus" role="status">默认单个文件不超过 100MB；文本资料快速解析，多媒体资料进入转写流程。</div></section>`;
    const foot=modal.querySelector('.modal-foot');if(foot)foot.innerHTML='<button class="secondary" onclick="closeModal()">取消</button><button class="primary" onclick="uploadKnowledgeDocument()">开始导入</button>';
    modal.classList.add('show');
  };
  window.uploadKnowledgeDocument=async()=>{
    const file=document.getElementById('realKnowledgeFile')?.files?.[0],status=document.getElementById('realKnowledgeStatus');
    if(!file){status.textContent='请先选择一个需要导入的文件。';status.dataset.state='error';return;}
    const button=document.querySelector('#modal .modal-foot .primary');if(button){button.disabled=true;button.textContent='正在导入…';}
    status.textContent='正在上传并提取 '+file.name+' 中的可检索内容…';status.dataset.state='loading';
    try{
      const form=new FormData();form.append('file',file);form.append('visibility',document.getElementById('realKnowledgeTeamShare')?.checked?'team':'private');const token=localStorage.getItem('nev_token')||'';
      const response=await fetch('/api/files',{method:'POST',headers:token?{Authorization:'Bearer '+token}:{},body:form});const data=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(data.error||'上传失败，请检查登录状态或部署配置。');
      status.textContent='导入成功：'+file.name+(data.indexed?'，内容已可供智能体引用。':'，'+(data.parseMessage||'文件已保存，等待解析。'));status.dataset.state='ready';
      const tbody=document.querySelector('#knowledge tbody');if(tbody)tbody.insertAdjacentHTML('afterbegin',`<tr><td><b>${htmlEscape(file.name)}</b></td><td>${htmlEscape(document.getElementById('realKnowledgeBase').value)}</td><td>${htmlEscape((file.name.split('.').pop()||'FILE').toUpperCase())}</td><td><span class="status">● ${data.indexed?'已完成':'索引中'}</span></td><td>刚刚</td><td><button class="link">已导入</button></td></tr>`);
    }catch(error){status.textContent='导入失败：'+error.message;status.dataset.state='error';}
    finally{if(button){button.disabled=false;button.textContent='开始导入';}}
  };
  const style=document.createElement('style');style.textContent=`.knowledge-upload-panel{display:grid;gap:14px}.knowledge-upload-panel p{margin:0;color:#687971;line-height:1.65;font-size:12px}.knowledge-upload-panel label{display:grid;gap:7px;color:#385346;font-size:12px;font-weight:700}.knowledge-upload-panel input,.knowledge-upload-panel select{width:100%;min-height:42px;border:1px solid #d7e4dc;border-radius:9px;padding:9px;background:#fbfdfb}.knowledge-upload-panel #realKnowledgeStatus{padding:10px 12px;border-radius:9px;background:#f2f8f4;color:#718178;font-size:11px;line-height:1.55}.knowledge-upload-panel #realKnowledgeStatus[data-state="ready"]{background:#e8f6ed;color:#087653}.knowledge-upload-panel #realKnowledgeStatus[data-state="error"]{background:#fff1f0;color:#b84c45}.chat-composer{position:relative}.team-share-files{display:block;margin-top:9px;color:#087653;font-size:11px;font-weight:700}.team-share-files input{accent-color:#087653}.skill-trigger{background:#f6f9f7!important;color:#07543e!important;border:1px solid #d6e8dc!important}.skill-trigger[aria-expanded="true"]{background:#e3f3e9!important;border-color:#9bcdb0!important}.skill-picker{display:none;position:absolute;z-index:30;left:12px;bottom:calc(100% + 8px);width:min(310px,calc(100vw - 48px));padding:13px;border:1px solid #cfe3d6;border-radius:13px;background:#fff;box-shadow:0 16px 38px rgba(16,64,45,.17)}.skill-picker.show{display:block;animation:skillPop .18s ease-out}.skill-picker>div{display:flex;justify-content:space-between;align-items:center}.skill-picker>div b{font-size:13px;color:#123f30}.skill-picker>div button{width:28px;height:28px;border:0;border-radius:8px;background:#f1f7f3;color:#087653;font-size:18px}.skill-picker p{margin:7px 0 9px;color:#75847d;font-size:10px;line-height:1.5}.skill-picker>button{display:flex;width:100%;justify-content:space-between;align-items:center;padding:10px 9px;border:0;border-top:1px solid #edf2ee;background:#fff;color:#294a3d;text-align:left;font-size:12px}.skill-picker>button:hover{background:#f2f8f4;color:#087653}.skill-picker>button span{color:#087653;font-weight:800}@keyframes skillPop{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}`;document.head.appendChild(style);
})();
