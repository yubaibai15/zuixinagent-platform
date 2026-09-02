/* 数据分析岗位的看板固定交付：在对话中给出看板入口，不跳转到搭建流程。 */
(() => {
  const isDataPage = () => /\u6570\u636e\u5206\u6790\u5e08|\u6570\u636e\u6d1e\u5bdf\u52a9\u624b|\u6570\u636e\u6d1e\u5bdf/.test(document.querySelector('#agent-chat .chat-brand')?.textContent || document.querySelector('#agent-chat .chat-profile')?.textContent || '');
  const isDashboardRequest = value => /\u6570\u636e\u770b\u677f|\u6570\u636e\u5206\u6790|\u7ecf\u8425\u6570\u636e|\u770b\u770b\u677f|\u7528\u6237\u753b\u50cf/.test(value || '');
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const baseSend = window.sendAgentChat;
  window.sendAgentChat = async () => {
    const input = document.getElementById('agentInput');
    const query = input?.value.trim() || '';
    if (!isDataPage() || !isDashboardRequest(query)) return baseSend?.();
    const messages = document.getElementById('agentMessages');
    if (!messages) return baseSend?.();
    input.value = '';
    messages.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(query)}</div><div class="bubble bot" id="dashboard-delivery-wait">正在整理经营数据、用户画像与渠道趋势…</div>`);
    messages.scrollTop = messages.scrollHeight;
    await new Promise(resolve => setTimeout(resolve, 500));
    const wait = document.getElementById('dashboard-delivery-wait');
    if (wait) wait.outerHTML = '<div class="bubble bot">已完成「数据分析看板」生成，可查看经营概览、用户画像与渠道表现。<br><a class="skill-result-link" href="/results/data-dashboards.html">打开数据分析看板 →</a></div>';
    messages.scrollTop = messages.scrollHeight;
  };
})();
