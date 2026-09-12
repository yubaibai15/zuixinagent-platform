(() => {
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const activeAgent = () => window.__teamTaskAgent || 'demo-data';

  window.openTeamTasks = () => {
    const agent = activeAgent();
    let page = document.getElementById('team-tasks-page');
    if (!page) {
      page = document.createElement('section');
      page.id = 'team-tasks-page';
      page.className = 'page';
      document.querySelector('.content')?.appendChild(page);
    }
    page.innerHTML = `<main class="team-tasks-page">
      <header class="team-task-header">
        <button class="link" onclick="openAgentChat('${escapeHtml(agent)}')">← 返回岗位助手</button>
        <div><span>TEAM TASK</span><h1>全渠道数据采集协同任务</h1><p>四个岗位在同一任务内完成采集、运营校验、营销归因与视觉素材复核。</p></div>
        <button class="primary" onclick="openTeamCollectionBoard()">打开任务看板</button>
      </header>
      <section class="team-task-overview">
        <div><b>任务状态</b><strong>进行中</strong><small>资料可持续补充</small></div>
        <div><b>协同岗位</b><strong>4 个</strong><small>数据、运营、营销、视觉</small></div>
        <div><b>任务成果</b><strong>1 个看板</strong><small>全渠道数据采集业务看板</small></div>
      </section>
      <section class="team-task-body">
        <div class="team-task-main">
          <h2>本次任务</h2>
          <p class="task-lead">统一汇总渠道数据，明确每个岗位的交付内容，再在看板内跟进执行状态。</p>
          <div class="task-list">
            <article><b>数据分析师</b><span>整理渠道口径、数据源与异常项</span><em>采集与校验</em></article>
            <article><b>电商运营师</b><span>核对店铺、商品与转化链路</span><em>运营确认</em></article>
            <article><b>数字营销师</b><span>标注渠道活动、投放节点与归因</span><em>营销归因</em></article>
            <article><b>视觉设计师</b><span>复核图像、视频和素材使用规范</span><em>素材复核</em></article>
          </div>
        </div>
        <aside class="team-task-result">
          <span>交付成果</span><h2>全渠道数据采集业务看板</h2><p>在完整页面中查看分工、进度和各项交付。</p>
          <button class="secondary" onclick="openTeamCollectionBoard()">全屏查看看板 →</button>
        </aside>
      </section>
    </main>`;
    document.querySelectorAll('.page').forEach(item => item.classList.remove('active'));
    page.classList.add('active');
    const crumb = document.getElementById('crumb'); if (crumb) crumb.textContent = '团队任务';
    window.scrollTo(0, 0);
  };

  window.openTeamCollectionBoard = () => {
    window.location.assign('/results/all-channel-data-collection-dashboard.html?agent=' + encodeURIComponent(activeAgent()) + '&from=team-task');
  };

  const addTeamTaskEntry = () => {
    const nav = document.querySelector('#agent-chat .chat-workspace nav');
    if (!nav || nav.querySelector('[data-team-tasks]')) return;
    const entry = document.createElement('button');
    entry.dataset.teamTasks = 'true';
    entry.textContent = '团队任务';
    entry.onclick = () => window.openTeamTasks();
    const teamSpace = nav.querySelector('[data-team-space]');
    if (teamSpace) teamSpace.insertAdjacentElement('beforebegin', entry); else nav.appendChild(entry);
  };

  const previousOpenAgentChat = window.openAgentChat;
  window.openAgentChat = id => {
    window.__teamTaskAgent = id || 'demo-data';
    previousOpenAgentChat(id);
    addTeamTaskEntry();
  };

  const style = document.createElement('style');
  style.textContent = `
    .team-tasks-page{max-width:1120px;margin:0 auto;padding:42px 34px 64px;color:#143f31}
    .team-task-header{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end}
    .team-task-header .link{grid-column:1/-1;justify-self:start}
    .team-task-header span,.team-task-result>span{color:#087653;font-weight:800;letter-spacing:.12em;font-size:11px}
    .team-task-header h1{margin:7px 0 8px;font-size:36px;letter-spacing:-.03em}
    .team-task-header p,.team-task-result p,.task-lead{margin:0;color:#6f8178;line-height:1.7}
    .team-task-overview{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:30px;border:1px solid #dbe8df;border-radius:14px;overflow:hidden;background:#dbe8df}
    .team-task-overview div{padding:18px 20px;background:#fff}
    .team-task-overview b,.team-task-overview small{display:block;color:#74847c;font-size:12px}
    .team-task-overview strong{display:block;margin:5px 0;color:#087653;font-size:24px}
    .team-task-body{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:20px;margin-top:20px}
    .team-task-main,.team-task-result{border:1px solid #dbe8df;border-radius:14px;background:#fff;padding:24px}
    .team-task-main h2,.team-task-result h2{margin:0 0 8px;font-size:20px}
    .task-list{margin-top:18px}.task-list article{display:grid;grid-template-columns:130px 1fr auto;gap:18px;align-items:center;padding:15px 0;border-top:1px solid #edf2ee}
    .task-list b{color:#173f31}.task-list span{color:#6f8178;font-size:13px}.task-list em{font-style:normal;color:#087653;font-size:12px;font-weight:700}
    .team-task-result{background:#f4faf6}.team-task-result .secondary{width:100%;margin-top:24px}
    @media(max-width:760px){.team-tasks-page{padding:28px 16px}.team-task-header,.team-task-body{grid-template-columns:1fr}.team-task-header h1{font-size:30px}.team-task-overview{grid-template-columns:1fr}.task-list article{grid-template-columns:1fr;gap:5px}.team-task-header .primary{width:100%}}
  `;
  document.head.appendChild(style);
  const restoreFilename = value => {
    const raw = String(value || '');
    if (!/[ÃÂÅÆÇÐåæçð]/.test(raw)) return raw;
    try {
      const bytes = Uint8Array.from(raw, char => char.charCodeAt(0) & 255);
      const fixed = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      return /[\u4e00-\u9fff]/.test(fixed) ? fixed : raw;
    } catch (_) { return raw; }
  };
  const repairTeamFileNames = () => document.querySelectorAll('#teamSharedFiles article b').forEach(node => {
    const fixed = restoreFilename(node.textContent);
    if (fixed !== node.textContent) node.textContent = fixed;
  });
  new MutationObserver(() => { addTeamTaskEntry(); repairTeamFileNames(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
