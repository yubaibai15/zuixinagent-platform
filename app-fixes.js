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
    .login-mascot{display:none!important}body:has(#dashboard.active) #app>.sidebar,body:has(#dashboard.active) .topbar{display:none!important}
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
    .composer-skill-bar{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;padding-top:10px;border-top:1px dashed #dbe8df}.composer-skill-bar b{display:flex;align-items:center;color:#718078;font-size:10px;margin-right:2px}.composer-skill-bar button{min-height:34px;border:1px solid #cfe2d6;background:#f7fbf8;color:#07543e;border-radius:9px;padding:7px 10px;font-size:11px}.composer-skill-bar button:hover,.composer-skill-bar button:focus-visible{background:#e5f4ea;outline:2px solid #b1dbc0;outline-offset:1px}.skill-result-link{display:inline-flex;margin-top:9px;padding:8px 11px;border-radius:8px;background:#087653;color:#fff!important;text-decoration:none;font-weight:700;font-size:12px}
    .knowledge-graph{min-height:100vh;padding:clamp(24px,4vw,58px);background:#f6faf7}.knowledge-graph header{max-width:1320px;margin:0 auto 26px}.knowledge-graph .back{min-height:44px;background:transparent;color:#087653;font-weight:700}.knowledge-graph h1{font-size:clamp(28px,3vw,44px);margin:12px 0 8px}.knowledge-graph p{color:#66786f}.graph-board{max-width:1320px;min-height:560px;margin:auto;position:relative;overflow:hidden;border:1px solid #d8e8de;border-radius:24px;background:radial-gradient(#c8dcd0 .8px,transparent .8px) 0 0/18px 18px,#fff}.graph-board:before,.graph-board:after{content:"";position:absolute;left:23%;top:48%;width:53%;height:2px;background:#aacdb9;transform-origin:left}.graph-board:before{transform:rotate(-25deg)}.graph-board:after{transform:rotate(23deg)}.graph-node{position:absolute;z-index:1;width:190px;padding:17px;border-radius:16px;background:#fff;border:1px solid #d6e6dc;box-shadow:0 12px 28px rgba(15,73,53,.1)}.graph-node b,.graph-node span{display:block}.graph-node b{font-size:15px;color:#123f30}.graph-node span{margin-top:6px;font-size:11px;color:#718178;line-height:1.55}.graph-node.center{left:calc(50% - 95px);top:calc(50% - 55px);background:#087653;color:#fff;border-color:#087653}.graph-node.center b,.graph-node.center span{color:#fff}.graph-node.n1{left:8%;top:12%}.graph-node.n2{right:8%;top:13%}.graph-node.n3{left:10%;bottom:11%}.graph-node.n4{right:8%;bottom:12%}.graph-legend{max-width:1320px;margin:18px auto 0;display:flex;gap:12px;flex-wrap:wrap}.graph-legend span{padding:8px 11px;border-radius:999px;background:#eaf7ef;color:#0b684b;font-size:12px}
    @media(max-width:980px){#dashboard.active #agent-bridge .bridge-head{display:block!important}#dashboard.active #agent-bridge .bridge-head p{margin-top:16px!important}#dashboard.active #agent-bridge .bridge-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.graph-board{min-height:720px}.graph-node{width:160px}.graph-node.center{left:calc(50% - 80px);top:calc(50% - 48px)}}
    @media(max-width:620px){#dashboard.active #agent-bridge{padding:24px 16px!important}#dashboard.active #agent-bridge .bridge-grid{grid-template-columns:1fr!important}.composer-skill-bar{display:grid;grid-template-columns:1fr 1fr}.composer-skill-bar b{grid-column:1/-1}.knowledge-graph{padding:20px 14px}.graph-board{min-height:760px}.graph-node{width:calc(50% - 26px);padding:12px}.graph-node.n1{left:12px;top:22px}.graph-node.n2{right:12px;top:22px}.graph-node.n3{left:12px;bottom:24px}.graph-node.n4{right:12px;bottom:24px}.graph-node.center{left:calc(50% - 80px);top:calc(50% - 52px)}}
    @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
  `;
  document.head.appendChild(style);

  function addComposerSkills(id) {
    const composer = document.querySelector('#agent-chat .chat-composer');
    if (!composer || composer.querySelector('.composer-skill-bar')) return;
    const [, skills] = roster[id] || roster['demo-data'];
    composer.insertAdjacentHTML('beforeend', `<div class="composer-skill-bar" aria-label="可调用技能包"><b>可调用技能包</b>${skills.map(name => `<button type="button" onclick="openInternalSkill('${escapeHtml(name)}')">${escapeHtml(name)}</button>`).join('')}</div>`);
  }

  const originalOpenAgentChat = window.openAgentChat;
  window.openAgentChat = id => {
    originalOpenAgentChat(id);
    const key = roster[id] ? id : Object.keys(roster).find(item => id === roster[item][0]) || 'demo-data';
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
    link.download = '直播数据分析样表.xls';
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
