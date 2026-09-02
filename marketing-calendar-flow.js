/* 数字营销岗位的全年日历固定交付：在对话框内给出结果入口，不再跳去旧的搭建页。 */
(() => {
  const isMarketingPage = () => /\u6570\u5b57\u8425\u9500\u5e08|\u6570\u5b57\u8425\u9500\u52a9\u624b|\u6570\u5b57\u8425\u9500/.test(document.querySelector('#agent-chat .chat-brand')?.textContent || document.querySelector('#agent-chat .chat-profile')?.textContent || '');
  const isCalendarRequest = value => /\u5168\u5e74.{0,4}(?:\u8425\u9500)?\u65e5\u5386|\u8425\u9500\u65e5\u5386|\u65e5\u5386.{0,6}\u8425\u9500/.test(value || '');
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const baseSend = window.sendAgentChat;
  window.sendAgentChat = async () => {
    const input = document.getElementById('agentInput');
    const query = input?.value.trim() || '';
    if (!isMarketingPage() || !isCalendarRequest(query)) return baseSend?.();
    const messages = document.getElementById('agentMessages');
    if (!messages) return baseSend?.();
    input.value = '';
    messages.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(query)}</div><div class="bubble bot" id="calendar-delivery-wait">正在整理全年营销节奏与节点排期…</div>`);
    messages.scrollTop = messages.scrollHeight;
    await new Promise(resolve => setTimeout(resolve, 1300));
    const wait = document.getElementById('calendar-delivery-wait');
    if (wait) wait.outerHTML = '<div class="bubble bot">已完成「全年营销日历」生成，包含年度节点、活动排期与内容推进节奏。<br><a class="skill-result-link" href="/results/marketing-calendar.html">打开全年营销日历 →</a></div>';
    messages.scrollTop = messages.scrollHeight;
  };
})();
