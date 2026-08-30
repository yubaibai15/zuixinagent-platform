(() => {
  const visualSkills = [
    '\u89c6\u9891\u5206\u955c\u751f\u6210',
    '\u56fe\u7247\u751f\u6210',
    '\u89c6\u9891\u751f\u6210'
  ];

  const isVisualDesigner = () => /\u89c6\u89c9\u8bbe\u8ba1\u5e08/.test(document.querySelector('#agent-chat .chat-brand')?.textContent || document.querySelector('#agent-chat .chat-profile')?.textContent || '');
  const installSkills = () => {
    if (!isVisualDesigner()) return;
    const picker = document.querySelector('#agent-chat .skill-picker');
    if (!picker || picker.dataset.visualSkillsInstalled === 'true') return;
    picker.dataset.visualSkillsInstalled = 'true';
    visualSkills.forEach((name, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = `<i>SK${index + 5}</i><b>${name}</b><span>\u8c03\u7528</span>`;
      button.addEventListener('click', () => window.runComposerSkill?.(name));
      picker.appendChild(button);
    });
  };

  const baseOpenAgentChat = window.openAgentChat;
  window.openAgentChat = id => {
    baseOpenAgentChat(id);
    installSkills();
  };
  window.openAgent = window.openAgentChat;
  window.setTimeout(installSkills, 0);
})();
