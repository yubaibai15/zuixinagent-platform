/* 首页与旧入口统一直达四个岗位对话，并确保欢迎区始终使用岗位专属 IP 图。 */
(() => {
  const ipImages = {
    'demo-ops': '/assets/welcome-ip/ecommerce-operations.png',
    'demo-visual': '/assets/welcome-ip/visual-design.png',
    'demo-marketing': '/assets/welcome-ip/digital-marketing.png',
    'demo-data': '/assets/welcome-ip/data-analysis.png'
  };
  const legacyAliases = {
    '海外市场洞察助手': 'demo-data',
    '竞品销量分析助手': 'demo-data',
    '行业趋势研判助手': 'demo-data',
    '跨境店铺运营助手': 'demo-ops',
    '合规政策咨询助手': 'demo-ops',
    '海外社媒文案助手': 'demo-marketing',
    '广告创意策划助手': 'demo-marketing',
    '海外广告视觉策划助手': 'demo-visual',
    '品牌规范校验助手': 'demo-visual'
  };
  const roleAgent = {
    '数据分析师': 'demo-data',
    '电商运营师': 'demo-ops',
    '数字营销师': 'demo-marketing',
    '视觉设计师': 'demo-visual'
  };
  let currentAgent = 'demo-data';
  const resolveAgent = value => legacyAliases[value] || roleAgent[value] || value || currentAgent;
  const setWelcomeImage = agent => {
    const image = document.querySelector('#agent-chat .chat-welcome img');
    const source = ipImages[agent];
    if (!image || !source) return;
    image.src = source;
    image.alt = '岗位专属 IP 图';
    image.classList.add('role-welcome-ip');
    image.style.objectFit = 'contain';
    image.style.objectPosition = 'center';
  };
  const bindDashboardEntries = () => {
    const cards = document.querySelectorAll('#dashboard .roles .role');
    ['demo-data', 'demo-ops', 'demo-marketing', 'demo-visual'].forEach((agent, index) => {
      const card = cards[index];
      if (!card || card.dataset.directChat === 'true') return;
      card.dataset.directChat = 'true';
      card.onclick = () => window.openAgentChat(agent);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.openAgentChat(agent); } };
    });
    document.querySelectorAll('#dashboard button').forEach(button => {
      if (/进入智能体中心/.test(button.textContent || '')) {
        button.textContent = '进入数据分析助手 →';
        button.onclick = () => window.openAgentChat('demo-data');
      }
    });
  };
  const originalOpenAgentChat = window.openAgentChat;
  if (typeof originalOpenAgentChat === 'function') {
    window.openAgentChat = value => {
      const agent = resolveAgent(value);
      currentAgent = ipImages[agent] ? agent : currentAgent;
      const result = originalOpenAgentChat(agent);
      requestAnimationFrame(() => setWelcomeImage(currentAgent));
      setTimeout(() => setWelcomeImage(currentAgent), 80);
      return result;
    };
    window.openAgent = window.openAgentChat;
  }
  const refresh = () => { bindDashboardEntries(); setWelcomeImage(currentAgent); };
  document.addEventListener('DOMContentLoaded', refresh);
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  refresh();
})();
