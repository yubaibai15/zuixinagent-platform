/* Unified portal layer: coordinates three independently deployed agents. */
(() => {
  const agents = [
    { id: 'automotive', no: '01', name: '汽车增长策略智能体', type: 'AUTOMOTIVE GROWTH', url: 'https://automotive-growth-api-300033-11-1470261947.sh.run.tcloudbase.com/', tags: ['直播数据', '客户画像', '独立站看板', '社媒看板'], description: '围绕汽车增长、用户洞察、车型选品、直播数据与社媒策略输出结果。' },
    { id: 'site', no: '02', name: '独立站本地化增长智能体', type: 'SITE LOCALIZATION', url: 'https://dilizhan-marketing-results-302768-11-1474942037.sh.run.tcloudbase.com/', tags: ['知识图谱', '本地内容', 'SEO', '转化'], description: '围绕独立站本地化、知识图谱、内容、SEO 与转化优化提供支持。' },
    { id: 'live', no: '03', name: '直播营销策划智能体', type: 'LIVE MARKETING', url: 'https://live-marketing-results-302728-7-1474898132.sh.run.tcloudbase.com/', tags: ['直播脚本', '营销日历', '发布平台', '复盘'], description: '围绕直播策划、脚本、营销排期、发布与复盘调用既有成果。' }
  ];
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const recordOpen = id => {
    const activity = JSON.parse(localStorage.getItem('growth-agent-opens') || '[]');
    activity.unshift({ id, at: new Date().toISOString() });
    localStorage.setItem('growth-agent-opens', JSON.stringify(activity.slice(0, 20)));
  };
  const openAgent = id => { const agent = agents.find(item => item.id === id); if (!agent) return; recordOpen(id); window.open(agent.url, '_blank', 'noopener,noreferrer'); };
  const addPage = () => {
    const content = document.querySelector('.content'); if (!content || document.getElementById('agent-bridge-page')) return;
    const page = document.createElement('section'); page.id = 'agent-bridge-page'; page.className = 'page';
    page.innerHTML = `<style>
      #agent-bridge-page .bridge-hero{padding:34px;border-radius:18px;background:linear-gradient(120deg,#112c26,#1d5b48);color:#fff;margin-bottom:20px}.bridge-hero small{color:#dfbd59;font-weight:700;letter-spacing:.13em}.bridge-hero h1{font-size:30px;margin:11px 0}.bridge-hero p{max-width:760px;color:#c7ded5;line-height:1.75}.bridge-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.bridge-agent{background:#fff;border:1px solid #dce7e2;border-radius:15px;padding:20px}.bridge-agent .number{color:#177659;font-size:11px;font-weight:700;letter-spacing:.1em}.bridge-agent h2{font-size:18px;margin:12px 0 8px}.bridge-agent p{color:#62736e;font-size:12px;line-height:1.7;min-height:62px}.bridge-tags{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}.bridge-tags span{padding:4px 8px;border-radius:99px;background:#eef6f2;color:#276650;font-size:11px}.bridge-agent button{width:100%;padding:10px;border-radius:8px;background:#167657;color:#fff;font-weight:700}.bridge-flow{margin-top:18px;background:#fff;border:1px solid #dce7e2;border-radius:15px;padding:20px}.bridge-flow h3{margin:0 0 14px}.flow-row{display:grid;grid-template-columns:1fr 28px 1fr 28px 1fr;gap:10px;align-items:stretch}.flow-step{padding:15px;border-radius:10px;background:#f4f8f6}.flow-step b{display:block;color:#1f4237;font-size:13px}.flow-step span{display:block;color:#71817c;font-size:11px;line-height:1.55;margin-top:5px}.flow-arrow{display:grid;place-items:center;color:#d2a634;font-weight:700}@media(max-width:900px){.bridge-grid{grid-template-columns:1fr}.flow-row{grid-template-columns:1fr}.flow-arrow{transform:rotate(90deg);min-height:20px}}
    </style><div class="bridge-hero"><small>GROWTH AGENT ORCHESTRATION</small><h1>一个入口，串联三个专业智能体。</h1><p>门户承托统一账户、资料、知识库、工作流、模型配置和审计；具体对话与成果页在对应智能体中打开，既保持专业边界，也让项目协作可追溯。</p></div><div class="bridge-grid">${agents.map(agent => `<article class="bridge-agent"><span class="number">${esc(agent.no)} / ${esc(agent.type)}</span><h2>${esc(agent.name)}</h2><p>${esc(agent.description)}</p><div class="bridge-tags">${agent.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div><button data-agent-id="${agent.id}">进入智能体 ↗</button></article>`).join('')}</div><section class="bridge-flow"><h3>统一协同框架</h3><div class="flow-row"><div class="flow-step"><b>① 项目资料进入门户</b><span>统一管理文件、知识库、成员权限与项目背景。</span></div><div class="flow-arrow">→</div><div class="flow-step"><b>② 选择专业智能体</b><span>按汽车增长、独立站增长或直播营销进入对应工作台。</span></div><div class="flow-arrow">→</div><div class="flow-step"><b>③ 成果回流与审计</b><span>通过门户工作流、版本、操作记录沉淀项目过程。</span></div></div></section>`;
    content.append(page);
    page.querySelectorAll('[data-agent-id]').forEach(button => button.addEventListener('click', () => openAgent(button.dataset.agentId)));
  };
  const attachNav = () => {
    const nav = document.querySelector('.nav'); if (!nav || document.getElementById('agent-bridge-nav')) return;
    const button = document.createElement('button'); button.id = 'agent-bridge-nav'; button.innerHTML = '<i>✦</i><span>三智能体入口</span>';
    button.addEventListener('click', () => { document.querySelectorAll('.page').forEach(page => page.classList.remove('active')); document.getElementById('agent-bridge-page')?.classList.add('active'); document.querySelectorAll('.nav button').forEach(item => item.classList.remove('active')); button.classList.add('active'); });
    nav.prepend(button);
  };
  const replaceIdentity = () => {
    document.title = '新能源汽车跨境出海方案智能体';
  };
  // 三个旧公网服务仅保留为兼容能力，不再占用主导航；成员统一进入平台内的独立智能体对话页。
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => { replaceIdentity(); addPage(); }, 120));
  window.openGrowthAgent = openAgent;
})();
