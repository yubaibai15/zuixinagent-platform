(() => {
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  let selectedSkill = '';

  const removeSelectedSkill = () => {
    selectedSkill = '';
    document.querySelector('#agent-chat .selected-skill-token')?.remove();
  };

  const showSelectedSkill = skill => {
    const composer = document.querySelector('#agent-chat .chat-composer');
    const input = document.getElementById('agentInput');
    if (!composer || !input) return;
    selectedSkill = String(skill || '').trim();
    composer.querySelector('.selected-skill-token')?.remove();
    const token = document.createElement('div');
    token.className = 'selected-skill-token';
    token.innerHTML = `<button type="button" aria-label="移除技能">×</button><span>${escapeHtml(selectedSkill)}</span>`;
    token.querySelector('button').onclick = removeSelectedSkill;
    input.insertAdjacentElement('beforebegin', token);
    input.focus();
  };

  window.runComposerSkill = skill => {
    document.querySelector('#agent-chat .skill-picker')?.classList.remove('show');
    document.querySelector('#agent-chat .skill-trigger')?.setAttribute('aria-expanded', 'false');
    showSelectedSkill(skill);
  };

  const originalSendAgentChat = window.sendAgentChat;
  window.sendAgentChat = async () => {
    const input = document.getElementById('agentInput');
    if (selectedSkill && input) {
      const request = input.value.trim();
      if (!request) {
        window.notify?.('已选择技能，请补充你的需求后再发送。');
        input.focus();
        return;
      }
      input.value = `[技能：${selectedSkill}] ${request}`;
      removeSelectedSkill();
    }
    return originalSendAgentChat?.();
  };

  const style = document.createElement('style');
  style.textContent = `
    #agent-chat .chat-composer{position:relative}
    #agent-chat .selected-skill-token{display:inline-flex;align-items:center;gap:7px;margin:0 0 9px 2px;padding:6px 10px;border:1px solid #b9dcc8;border-radius:9px;background:#eef8f1;color:#087653;font-size:12px;font-weight:700}
    #agent-chat .selected-skill-token button{width:17px;height:17px;padding:0;border:0;border-radius:50%;background:transparent;color:#5d7c6d;font-size:18px;line-height:15px;cursor:pointer}
    #agent-chat .selected-skill-token button:hover,#agent-chat .selected-skill-token button:focus-visible{background:#d8efe0;color:#07563f;outline:none}
  `;
  document.head.appendChild(style);
})();
