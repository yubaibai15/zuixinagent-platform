/* 岗位专属对话调度：在所有旧脚本之后运行，确保结果不会被旧的通用模型抢走。 */
(() => {
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const roleText = () => document.querySelector('#agent-chat .chat-brand')?.textContent || document.querySelector('#agent-chat .chat-profile')?.textContent || '';
  const kind = () => { const text = roleText(); if (/\u5185\u5bb9\u521b\u610f|\u89c6\u89c9\u8bbe\u8ba1/.test(text)) return 'visual'; if (/\u6570\u5b57\u8425\u9500/.test(text)) return 'marketing'; if (/\u6570\u636e\u6d1e\u5bdf|\u6570\u636e\u5206\u6790/.test(text)) return 'data'; return 'other'; };
  const rules = {
    visual: [{ test: /\u89c6\u9891|\u77ed\u89c6\u9891|\u811a\u672c|\u5206\u955c|\u955c\u5934|\u62cd\u6444|\u53e3\u64ad/i, label: '圣灵节短视频分镜脚本', href: '/downloads/圣灵节专场营销-短视频分镜脚本.xlsx', link: '下载已完成的短视频分镜脚本 Excel', delay: 150, download: true }],
    marketing: [{ test: /\u5168\u5e74.{0,4}(?:\u8425\u9500)?\u65e5\u5386|\u8425\u9500\u65e5\u5386|\u65e5\u5386.{0,6}\u8425\u9500/, label: '全年营销日历', href: '/results/marketing-calendar.html', link: '打开全年营销日历', delay: 300 }],
    data: [
      { test: /(?:\u91c7\u96c6|\u722c\u53d6|\u5bfc\u51fa|\u4e0b\u8f7d).{0,8}\u76f4\u64ad|\u76f4\u64ad.{0,8}(?:\u6570\u636e|excel|\u8868\u683c|\u91c7\u96c6|\u722c\u53d6|\u5bfc\u51fa|\u4e0b\u8f7d)/i, label: '直播数据 Excel', href: '/downloads/A企业、竞品直播数据.xlsx', link: '下载直播数据 Excel', delay: 450, download: true },
      { test: /\u6570\u636e\u770b\u677f|\u6570\u636e\u5206\u6790|\u7ecf\u8425\u6570\u636e|\u770b\u770b\u677f|\u7528\u6237\u753b\u50cf/, label: '数据分析看板', href: '/results/data-dashboards.html', link: '打开数据分析看板', delay: 300 }
    ]
  };
  // 在用户点击入口前预加载固定分镜表，后续下载优先使用浏览器缓存。
  const storyboardUrl = '/downloads/圣灵节专场营销-短视频分镜脚本.xlsx';
  let storyboardBlobUrl = '';
  const warmStoryboardDownload = () => {
    if (storyboardBlobUrl || !window.fetch) return;
    fetch(storyboardUrl, { credentials: 'same-origin' })
      .then(response => response.ok ? response.blob() : Promise.reject(new Error('download unavailable')))
      .then(blob => { storyboardBlobUrl = URL.createObjectURL(blob); })
      .catch(() => {});
  };
  warmStoryboardDownload();
  const baseSend = window.sendAgentChat;
  const show = async (query, rule) => {
    const input = document.getElementById('agentInput'); const messages = document.getElementById('agentMessages'); if (!input || !messages) return;
    input.value = ''; messages.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(query)}</div><div class="bubble bot" id="role-skill-wait">正在调用「${esc(rule.label)}」…</div>`); messages.scrollTop = messages.scrollHeight;
    await new Promise(resolve => setTimeout(resolve, rule.delay));
    const wait = document.getElementById('role-skill-wait');
    const href = rule.href === storyboardUrl && storyboardBlobUrl ? storyboardBlobUrl : rule.href;
    if (wait) wait.outerHTML = `<div class="bubble bot">已完成「${esc(rule.label)}」。<br><a class="skill-result-link" href="${href}"${rule.download ? ' download' : ''}>${esc(rule.link)} →</a></div>`;
    messages.scrollTop = messages.scrollHeight;
  };
  window.sendAgentChat = async () => { const query = document.getElementById('agentInput')?.value.trim() || ''; const rule = (rules[kind()] || []).find(item => item.test.test(query)); return rule ? show(query, rule) : baseSend?.(); };
  const allowAnyFile = () => document.querySelectorAll('#agent-chat input[type=file]').forEach(input => input.setAttribute('accept', '*/*'));
  new MutationObserver(allowAnyFile).observe(document.documentElement, { childList: true, subtree: true }); allowAnyFile();
})();
