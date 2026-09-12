(() => {
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const roleResults = {
    'demo-data': {
      default: ['数据处理完成', '已完成数据口径核对、异常项筛查和重点指标整理，可继续查看看板或导出报告。'],
      '数据看板': ['数据看板已生成', '已整理核心指标、趋势和渠道表现，结果已同步到数据看板。'],
      '客户画像': ['客户画像已生成', '已完成用户分层、关注因素和渠道偏好整理，可直接查看客户画像看板。'],
      '独立站看板': ['独立站看板已生成', '已汇总访问、停留、转化和地区分布数据。'],
      '社媒看板': ['社媒看板已生成', '已汇总内容互动、粉丝变化和热点词数据。']
    },
    'demo-ops': {
      default: ['运营技能调用成功', '已完成店铺经营信息校验，并整理出下一步运营建议。'],
      '店铺诊断': ['店铺诊断完成', '已核对流量、转化、商品和售后环节，重点问题已标记。'],
      '选品分析': ['选品分析完成', '已完成市场需求、价格带和竞争情况的初步评估。'],
      '知识图谱': ['知识图谱已生成', '业务实体与关联关系已完成整理，可直接打开图谱查看。']
    },
    'demo-marketing': {
      default: ['营销技能调用成功', '已完成营销任务配置，并生成可执行的下一步建议。'],
      '直播脚本': ['直播脚本已生成', '已完成直播节奏、互动节点和转化话术的初步编排。'],
      '全年日历': ['全年营销日历已生成', '已完成年度节点、活动节奏和内容排期整理。'],
      '投流复盘': ['投流复盘完成', '已完成曝光、点击、转化和成本表现的复核。']
    },
    'demo-visual': {
      default: ['创意技能调用成功', '已完成视觉需求校验，并整理出可继续执行的创意交付。'],
      '视觉简报': ['视觉简报已生成', '已整理主视觉方向、版式建议和素材清单。'],
      '产品图': ['产品图策划完成', '已完成场景、镜头和产品图执行建议。'],
      '品牌规范': ['品牌规范校验完成', '已完成颜色、字体、Logo 与版式的一致性检查。'],
      '设计文案': ['设计文案已生成', '已输出适配视觉版式的多语言文案建议。']
    }
  };
  const getAgent = () => window.__teamTaskAgent || (document.querySelector('#agent-chat')?.dataset.agentId) || 'demo-data';
  const resolveResult = (agent, skill) => {
    const group = roleResults[agent] || roleResults['demo-data'];
    const entry = Object.entries(group).find(([key]) => key !== 'default' && String(skill).includes(key));
    return entry ? entry[1] : group.default;
  };
  const appendBubble = (className, content) => {
    const box = document.getElementById('agentMessages');
    if (!box) return null;
    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + className;
    bubble.innerHTML = content;
    box.appendChild(bubble);
    box.scrollTop = box.scrollHeight;
    return bubble;
  };
  window.runComposerSkill = skill => {
    const picker = document.querySelector('#agent-chat .skill-picker');
    picker?.classList.remove('show');
    document.querySelector('#agent-chat .skill-trigger')?.setAttribute('aria-expanded', 'false');
    const agent = getAgent();
    const [title, detail] = resolveResult(agent, skill);
    appendBubble('me', `<b>调用技能：</b>${escapeHtml(skill)}`);
    const progress = appendBubble('bot skill-call-state', '<b>正在调用技能</b><span>正在读取当前对话资料...</span>');
    const stages = ['正在读取当前对话资料...', '正在匹配岗位工作流...', '正在校验任务输出...', '调用成功，结果已生成。'];
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      if (progress) progress.innerHTML = `<b>正在调用技能</b><span>${stages[Math.min(index, stages.length - 1)]}</span>`;
      if (index >= stages.length - 1) {
        clearInterval(timer);
        window.setTimeout(() => {
          progress?.remove();
          appendBubble('bot skill-call-success', `<div class="skill-success-head"><strong>✓ 技能调用成功</strong><em>${escapeHtml(skill)}</em></div><b>${escapeHtml(title)}</b><p>${escapeHtml(detail)}</p>`);
        }, 380);
      }
    }, 700);
  };
  const style = document.createElement('style');
  style.textContent = '.skill-call-state{display:grid;gap:6px;border-left:3px solid #8fc8a5}.skill-call-state span{color:#73857c;font-size:12px}.skill-call-success{border:1px solid #cfe7d8;background:#f0f9f3!important}.skill-success-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}.skill-success-head strong{color:#087653}.skill-success-head em{padding:3px 7px;border-radius:999px;background:#e0f2e6;color:#087653;font-size:10px;font-style:normal}.skill-call-success>b{color:#173f31}.skill-call-success p{margin:7px 0 0;color:#5f756b;line-height:1.65}';
  document.head.appendChild(style);
})();
