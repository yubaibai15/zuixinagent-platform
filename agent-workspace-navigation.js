/* 智能体工作区导航：从岗位助手进入的页面始终回到同一岗位助手。 */
(() => {
  const labels = { '我的项目': 'projects', '任务协作': 'tasks', '成果中心': 'deliverables', '知识库': 'knowledge' };
  const currentAgent = () => window.nevNavigation?.lastAgentId || window.chatAgent?._id || 'demo-data';
  const returnToAgent = () => window.openAgentChat?.(currentAgent());
  const installReturn = title => {
    const page = document.querySelector('.page.active');
    if (!page || page.querySelector('.agent-workspace-return')) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'secondary agent-workspace-return';
    button.textContent = '← 返回智能体对话';
    button.style.cssText = 'margin:0 0 16px;position:relative;z-index:3';
    button.addEventListener('click', returnToAgent);
    const anchor = page.querySelector('.heading,main,article,section') || page;
    anchor.insertBefore(button, anchor.firstChild);
    const crumb = document.getElementById('crumb'); if (crumb) crumb.textContent = title;
  };
  window.openAgentWorkspacePage = (page, title) => {
    window.nevNavigation = window.nevNavigation || {};
    window.nevNavigation.lastAgentId = currentAgent();
    window.showPage?.(page);
    requestAnimationFrame(() => installReturn(title));
    setTimeout(() => installReturn(title), 80);
  };
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    const chatNav = button.closest('.chat-workspace nav'); const label = button.textContent.trim();
    if (chatNav && labels[label]) {
      event.preventDefault(); event.stopImmediatePropagation();
      window.openAgentWorkspacePage(labels[label], label); return;
    }
    if (chatNav && (button.dataset.teamSpace === 'true' || label === '团队空间')) {
      event.preventDefault(); event.stopImmediatePropagation();
      window.nevNavigation = window.nevNavigation || {}; window.nevNavigation.lastAgentId = currentAgent();
      window.openTeamSpace?.(); return;
    }
    if (button.closest('.team-space-page') && /返回智能体对话|上传团队资料/.test(label)) {
      event.preventDefault(); event.stopImmediatePropagation(); returnToAgent();
    }
  }, true);
})();
