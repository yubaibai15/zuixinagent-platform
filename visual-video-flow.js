(() => {
  const keywords = /(?:\u89c6\u9891|\u77ed\u89c6\u9891|\u811a\u672c|\u5206\u955c|\u955c\u5934|\u89c6\u9891\u53e3\u64ad|\u62cd\u6444\u89c4\u5212)/i;
  const escapeText = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const baseSend = window.sendAgentChat;

  window.sendAgentChat = async () => {
    const input = document.getElementById('agentInput');
    const query = input?.value.trim() || '';
    const roleText = document.querySelector('#agent-chat .chat-brand')?.textContent || document.querySelector('#agent-chat .chat-profile')?.textContent || '';
    // 旧界面名称为“内容创意助手”，也必须视为视觉岗位。
    const isVisualDesigner = /\u89c6\u89c9\u8bbe\u8ba1\u5e08|\u5185\u5bb9\u521b\u610f\u52a9\u624b|\u5185\u5bb9\u521b\u610f/.test(roleText);
    if (!isVisualDesigner || !query || !keywords.test(query)) return baseSend?.();

    const messages = document.getElementById('agentMessages');
    if (!messages) return baseSend?.();
    input.value = '';
    messages.insertAdjacentHTML('beforeend', `<div class="bubble me">${escapeText(query)}</div><div class="bubble bot" id="visualVideoWait">\u6b63\u5728\u5206\u6790\u9700\u6c42\u5e76\u5339\u914d\u6280\u80fd\u5305\u2026</div>`);
    const overlay = document.createElement('div');
    overlay.className = 'thinking-overlay';
    overlay.innerHTML = '<div><img src="/assets/agent-ip.png" alt="\u667a\u80fd\u52a9\u624b IP"><span>AGENT THINKING</span><h2>\u6b63\u5728\u8c03\u7528\u300c\u77ed\u89c6\u9891\u521b\u610f\u6821\u68c0\u300d</h2><p>\u6b63\u5728\u8bc6\u522b\u89c6\u9891\u6216\u811a\u672c\u9700\u6c42\u3001\u6838\u5bf9\u955c\u5934\u8282\u594f\u5e76\u5339\u914d\u5bf9\u5e94\u7d20\u6750\u2026</p><div><i></i></div></div>';
    document.body.appendChild(overlay);
    messages.scrollTop = messages.scrollHeight;
    await new Promise(resolve => window.setTimeout(resolve, 700));
    overlay.remove();
    const wait = document.getElementById('visualVideoWait');
    if (wait) wait.outerHTML = '<div class="bubble bot">\u5df2\u5b8c\u6210\u77ed\u89c6\u9891\u811a\u672c\u6821\u68c0\uff0c\u5df2\u4e3a\u4f60\u5339\u914d\u77ed\u89c6\u9891\u521b\u4f5c\u7d20\u6750\u8868\uff0c\u5305\u542b\u811a\u672c\u3001\u955c\u5934\u3001\u6267\u884c\u53c2\u8003\u548c\u539f\u6709\u56fe\u7247\uff0c\u53ef\u76f4\u63a5\u4e0b\u8f7d\u4f7f\u7528\u3002<br><a class="skill-result-link" href="/downloads/visual-video-storyboard-with-images.xlsm" download>\u4e0b\u8f7d AI \u77ed\u89c6\u9891\u7d20\u6750\u8868 Excel \u2192</a></div>';
    messages.scrollTop = messages.scrollHeight;
  };

  const style = document.createElement('style');
  style.textContent = '.skill-result-link{display:inline-flex;margin-top:12px;padding:8px 11px;border-radius:8px;background:#e9f6ee;color:#087653!important;font-size:12px;font-weight:800;text-decoration:none}';
  document.head.appendChild(style);
})();
