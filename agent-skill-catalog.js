(() => {
  const catalog = {
    data: ['\u6570\u636e\u770b\u677f', '\u5ba2\u6237\u753b\u50cf', '\u72ec\u7acb\u7ad9\u770b\u677f', '\u793e\u5a92\u770b\u677f', '\u76f4\u64ad\u6570\u636e\u5bfc\u51fa'],
    ops: ['\u5e97\u94fa\u8bca\u65ad', '\u9009\u54c1\u5206\u6790', '\u77e5\u8bc6\u56fe\u8c31', '\u5408\u89c4\u6e05\u5355', '\u552e\u540e\u8bdd\u672f'],
    marketing: ['\u76f4\u64ad\u811a\u672c', '\u5168\u5e74\u65e5\u5386', '\u6295\u6d41\u590d\u76d8', '\u53d1\u5e03\u5e73\u53f0', '\u793e\u5a92\u5185\u5bb9\u5206\u53d1'],
    visual: ['\u5e7f\u544a\u89c6\u89c9\u7b80\u62a5', '\u4ea7\u54c1\u56fe\u7b56\u5212', '\u54c1\u724c\u89c4\u8303\u6821\u9a8c', '\u89c6\u9891\u5206\u955c\u751f\u6210', '\u56fe\u7247\u751f\u6210', '\u89c6\u9891\u751f\u6210']
  };
  const roleFromPage = () => {
    const text = document.querySelector('#agent-chat .chat-brand')?.textContent || document.querySelector('#agent-chat .chat-profile')?.textContent || '';
    // 旧页面使用“内容创意助手”，新页面使用“视觉设计师”：两者都是视觉岗位。
    if (/\u89c6\u89c9\u8bbe\u8ba1\u5e08|\u5185\u5bb9\u521b\u610f\u52a9\u624b|\u5185\u5bb9\u521b\u610f/.test(text)) return 'visual';
    if (/\u6570\u5b57\u8425\u9500\u5e08/.test(text)) return 'marketing';
    if (/\u7535\u5546\u8fd0\u8425\u5e08/.test(text)) return 'ops';
    return 'data';
  };
  const install = () => {
    const picker = document.querySelector('#agent-chat .skill-picker');
    if (!picker) return;
    const role = roleFromPage();
    if (picker.dataset.roleSkills === role) return;
    picker.dataset.roleSkills = role;
    // 不保留旧的统一技能包，直接重建成当前岗位的技能。
    picker.querySelectorAll('button').forEach(button => button.remove());
    catalog[role].forEach((name, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = `<i>SK${index + 1}</i><b>${name}</b><span>\u8c03\u7528</span>`;
      button.addEventListener('click', () => window.runComposerSkill?.(name));
      picker.appendChild(button);
    });
  };
  new MutationObserver(install).observe(document.documentElement, { childList: true, subtree: true });
  // 每次打开“技能包”都重新检查岗位，避免切换助手后保留上一个助手的技能。
  document.addEventListener('click', event => {
    if (event.target.closest('#agent-chat .skill-trigger, #agent-chat .skill-picker')) window.setTimeout(install, 0);
  }, true);
  window.setTimeout(install, 0);
})();
