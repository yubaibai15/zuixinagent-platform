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
    body:has(#dashboard.active) #app>.sidebar,body:has(#dashboard.active) .topbar{display:none!important}
    body:has(#dashboard.active) #app>.main{margin-left:0!important;width:100%!important}
    body:has(#dashboard.active) .content{max-width:none!important;padding:0!important}
    #dashboard.active>.heading,#dashboard.active>.hero,#dashboard.active>.stats,#dashboard.active>.section-title,#dashboard.active>.roles,#dashboard.active>.twocol{display:none!important}
    #dashboard.active #agent-bridge{box-sizing:border-box;min-height:100vh;margin:0!important;padding:clamp(28px,4vw,72px)!important;border:0!important;border-radius:0!important;background:linear-gradient(135deg,#0b3027 0%,#155a46 58%,#0e382e 100%)!important;box-shadow:none!important}
    #dashboard.active #agent-bridge .bridge-head{max-width:1440px;margin:0 auto 30px!important;align-items:flex-end!important}
    #dashboard.active #agent-bridge .bridge-head h2{font-size:clamp(30px,3.3vw,54px)!important;line-height:1.15!important;max-width:720px}
    #dashboard.active #agent-bridge .bridge-head p{max-width:430px!important;font-size:14px!important;line-height:1.75!important}
    #dashboard.active #agent-bridge .bridge-grid{max-width:1440px;margin:auto;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:18px!important}
    #dashboard.active #agent-bridge .bridge-card{min-height:300px;padding:22px!important;display:flex;flex-direction:column;border-radius:18px!important;background:rgba(255,255,255,.075)!important}
    #dashboard.active #agent-bridge .bridge-card h3{font-size:20px!important;margin:12px 0 8px!important}
    #dashboard.active #agent-bridge .bridge-card p{font-size:13px!important;min-height:0!important}
    #dashboard.active #agent-bridge .bridge-card a{min-height:46px;margin-top:auto!important;border-radius:10px!important;padding:12px 14px!important;font-size:13px!important}
    .assistant-skills small{display:block;color:#718078;letter-spacing:.12em}.assistant-skills h2{margin:7px 0 4px}.assistant-skills>p{margin:0 0 10px;color:#7b8982;font-size:11px;line-height:1.55}.assistant-skills .skill-list{display:grid;gap:8px}.assistant-skills .skill-list button{display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:9px;width:100%;min-height:56px;padding:9px;border:1px solid #dce8e0;border-radius:11px;background:#fff;color:#203c32;text-align:left}.assistant-skills .skill-list button:hover,.assistant-skills .skill-list button:focus-visible{border-color:#9bcdb0;background:#f2f8f4;outline:2px solid #cbe6d5}.assistant-skills .skill-list i{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#e9f6ee;color:#087653;font-size:9px;font-style:normal}.assistant-skills .skill-list b{font-size:12px}.assistant-skills .skill-list span{color:#087653;font-size:10px;font-weight:800}.skill-result-link{display:inline-flex;margin-top:9px;padding:8px 11px;border-radius:8px;background:#087653;color:#fff!important;text-decoration:none;font-weight:700;font-size:12px}
    .knowledge-graph{min-height:100vh;padding:clamp(24px,4vw,58px);background:#f6faf7}.knowledge-graph header{max-width:1320px;margin:0 auto 26px}.knowledge-graph .back{min-height:44px;background:transparent;color:#087653;font-weight:700}.knowledge-graph h1{font-size:clamp(28px,3vw,44px);margin:12px 0 8px}.knowledge-graph p{color:#66786f}.graph-board{max-width:1320px;min-height:560px;margin:auto;position:relative;overflow:hidden;border:1px solid #d8e8de;border-radius:24px;background:radial-gradient(#c8dcd0 .8px,transparent .8px) 0 0/18px 18px,#fff}.graph-board:before,.graph-board:after{content:"";position:absolute;left:23%;top:48%;width:53%;height:2px;background:#aacdb9;transform-origin:left}.graph-board:before{transform:rotate(-25deg)}.graph-board:after{transform:rotate(23deg)}.graph-node{position:absolute;z-index:1;width:190px;padding:17px;border-radius:16px;background:#fff;border:1px solid #d6e6dc;box-shadow:0 12px 28px rgba(15,73,53,.1)}.graph-node b,.graph-node span{display:block}.graph-node b{font-size:15px;color:#123f30}.graph-node span{margin-top:6px;font-size:11px;color:#718178;line-height:1.55}.graph-node.center{left:calc(50% - 95px);top:calc(50% - 55px);background:#087653;color:#fff;border-color:#087653}.graph-node.center b,.graph-node.center span{color:#fff}.graph-node.n1{left:8%;top:12%}.graph-node.n2{right:8%;top:13%}.graph-node.n3{left:10%;bottom:11%}.graph-node.n4{right:8%;bottom:12%}.graph-legend{max-width:1320px;margin:18px auto 0;display:flex;gap:12px;flex-wrap:wrap}.graph-legend span{padding:8px 11px;border-radius:999px;background:#eaf7ef;color:#0b684b;font-size:12px}
    @media(max-width:980px){#dashboard.active #agent-bridge .bridge-head{display:block!important}#dashboard.active #agent-bridge .bridge-head p{margin-top:16px!important}#dashboard.active #agent-bridge .bridge-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.graph-board{min-height:720px}.graph-node{width:160px}.graph-node.center{left:calc(50% - 80px);top:calc(50% - 48px)}}
    @media(max-width:620px){#dashboard.active #agent-bridge{padding:24px 16px!important}#dashboard.active #agent-bridge .bridge-grid{grid-template-columns:1fr!important}.composer-skill-bar{display:grid;grid-template-columns:1fr 1fr}.composer-skill-bar b{grid-column:1/-1}.knowledge-graph{padding:20px 14px}.graph-board{min-height:760px}.graph-node{width:calc(50% - 26px);padding:12px}.graph-node.n1{left:12px;top:22px}.graph-node.n2{right:12px;top:22px}.graph-node.n3{left:12px;bottom:24px}.graph-node.n4{right:12px;bottom:24px}.graph-node.center{left:calc(50% - 80px);top:calc(50% - 52px)}}
    @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
  `;
  document.head.appendChild(style);

  function addComposerSkills(id) {
    const assist = document.querySelector('#agent-chat .chat-assist');
    if (!assist || assist.querySelector('.assistant-skills')) return;
    const [, skills] = roster[id] || roster['demo-data'];
    assist.insertAdjacentHTML('beforeend', `<section class="assistant-skills"><small>SKILLS</small><h2>技能包</h2><p>选择技能后由当前助手调用标准化工作流。</p><div class="skill-list">${skills.map((name,index) => `<button type="button" onclick="openInternalSkill('${escapeHtml(name)}')"><i>SK${index+1}</i><b>${escapeHtml(name)}</b><span>调用</span></button>`).join('')}</div></section>`);
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
    '独立站看板':'/results/independent-site-dashboard.html',
    '社媒看板':'/results/social-dashboard.html',
    '客户画像':'/results/customer-profile-dashboard.html',
    '用户画像':'/results/customer-profile-dashboard.html',
    '知识图谱':'/results/knowledge-graph.html',
    '全年日历':'/results/marketing-calendar.html',
    '营销日历':'/results/marketing-calendar.html',
    '发布平台':'/results/publish-platform.html',
    '发布物料':'/results/publish-platform.html'
  };
  window.openInternalSkill = name => {
    if (localResultPaths[name]) { window.location.href = localResultPaths[name]; return; }
    if (name === '数据看板') return window.openQuickFeature('数据看板');
    if (name === '直播数据导出') return window.downloadLiveDataExcel();
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
    }, 1900);
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
    }, 160);
  });
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
    picker.id='opsGraphFilePicker';picker.setAttribute('accept','.pdf,.docx,.xlsx,.csv,.txt,.md,.json');
    composer.insertAdjacentHTML('afterbegin',`<section class="ops-graph-import" aria-label="知识图谱资料导入"><div><small>KNOWLEDGE GRAPH</small><b>导入运营资料，生成知识图谱</b><span id="opsGraphImportStatus">支持 Excel、CSV、PDF、Word、TXT，单个文件不超过 15MB</span></div><div class="ops-import-actions"><label for="opsGraphFilePicker">导入资料</label><button type="button" onclick="requestKnowledgeGraph()">生成知识图谱 →</button></div></section>`);
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
    document.getElementById('modalBody').innerHTML=`<section class="knowledge-upload-panel"><p>文件会被保存到团队知识库，并在上传完成后用于对应岗位智能体的资料引用。</p><label>选择文件<input id="realKnowledgeFile" type="file" accept=".pdf,.docx,.xlsx,.csv,.txt,.md,.json"></label><label>归属知识库<select id="realKnowledgeBase"><option>跨境电商运营库</option><option>海外市场与政策库</option><option>品牌视觉规范库</option></select></label><div id="realKnowledgeStatus" role="status">支持 XLSX、CSV、PDF、Word、TXT，单个文件不超过 15MB。</div></section>`;
    const foot=modal.querySelector('.modal-foot');if(foot)foot.innerHTML='<button class="secondary" onclick="closeModal()">取消</button><button class="primary" onclick="uploadKnowledgeDocument()">开始导入</button>';
    modal.classList.add('show');
  };
  window.uploadKnowledgeDocument=async()=>{
    const file=document.getElementById('realKnowledgeFile')?.files?.[0],status=document.getElementById('realKnowledgeStatus');
    if(!file){status.textContent='请先选择一个需要导入的文件。';status.dataset.state='error';return;}
    const button=document.querySelector('#modal .modal-foot .primary');if(button){button.disabled=true;button.textContent='正在导入…';}
    status.textContent='正在上传并提取 '+file.name+' 中的可检索内容…';status.dataset.state='loading';
    try{
      const form=new FormData();form.append('file',file);const token=localStorage.getItem('nev_token')||'';
      const response=await fetch('/api/files',{method:'POST',headers:token?{Authorization:'Bearer '+token}:{},body:form});const data=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(data.error||'上传失败，请检查登录状态或部署配置。');
      status.textContent='导入成功：'+file.name+(data.indexed?'，内容已可供智能体引用。':'，文件已保存，等待索引。');status.dataset.state='ready';
      const tbody=document.querySelector('#knowledge tbody');if(tbody)tbody.insertAdjacentHTML('afterbegin',`<tr><td><b>${htmlEscape(file.name)}</b></td><td>${htmlEscape(document.getElementById('realKnowledgeBase').value)}</td><td>${htmlEscape((file.name.split('.').pop()||'FILE').toUpperCase())}</td><td><span class="status">● ${data.indexed?'已完成':'索引中'}</span></td><td>刚刚</td><td><button class="link">已导入</button></td></tr>`);
    }catch(error){status.textContent='导入失败：'+error.message;status.dataset.state='error';}
    finally{if(button){button.disabled=false;button.textContent='开始导入';}}
  };
  const style=document.createElement('style');style.textContent=`.knowledge-upload-panel{display:grid;gap:14px}.knowledge-upload-panel p{margin:0;color:#687971;line-height:1.65;font-size:12px}.knowledge-upload-panel label{display:grid;gap:7px;color:#385346;font-size:12px;font-weight:700}.knowledge-upload-panel input,.knowledge-upload-panel select{width:100%;min-height:42px;border:1px solid #d7e4dc;border-radius:9px;padding:9px;background:#fbfdfb}.knowledge-upload-panel #realKnowledgeStatus{padding:10px 12px;border-radius:9px;background:#f2f8f4;color:#718178;font-size:11px;line-height:1.55}.knowledge-upload-panel #realKnowledgeStatus[data-state="ready"]{background:#e8f6ed;color:#087653}.knowledge-upload-panel #realKnowledgeStatus[data-state="error"]{background:#fff1f0;color:#b84c45}.chat-composer{position:relative}.skill-trigger{background:#f6f9f7!important;color:#07543e!important;border:1px solid #d6e8dc!important}.skill-trigger[aria-expanded="true"]{background:#e3f3e9!important;border-color:#9bcdb0!important}.skill-picker{display:none;position:absolute;z-index:30;left:12px;bottom:calc(100% + 8px);width:min(310px,calc(100vw - 48px));padding:13px;border:1px solid #cfe3d6;border-radius:13px;background:#fff;box-shadow:0 16px 38px rgba(16,64,45,.17)}.skill-picker.show{display:block;animation:skillPop .18s ease-out}.skill-picker>div{display:flex;justify-content:space-between;align-items:center}.skill-picker>div b{font-size:13px;color:#123f30}.skill-picker>div button{width:28px;height:28px;border:0;border-radius:8px;background:#f1f7f3;color:#087653;font-size:18px}.skill-picker p{margin:7px 0 9px;color:#75847d;font-size:10px;line-height:1.5}.skill-picker>button{display:flex;width:100%;justify-content:space-between;align-items:center;padding:10px 9px;border:0;border-top:1px solid #edf2ee;background:#fff;color:#294a3d;text-align:left;font-size:12px}.skill-picker>button:hover{background:#f2f8f4;color:#087653}.skill-picker>button span{color:#087653;font-weight:800}@keyframes skillPop{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}`;document.head.appendChild(style);
})();
