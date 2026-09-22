const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('each assistant welcome area uses its assigned IP illustration', () => {
  const source = read('platform-features.js');
  const welcomeAssets = {
    'demo-ops': 'assets/welcome-ip/ecommerce-operations.png',
    'demo-visual': 'assets/welcome-ip/visual-design.png',
    'demo-marketing': 'assets/welcome-ip/digital-marketing.png',
    'demo-data': 'assets/welcome-ip/data-analysis.png'
  };
  Object.entries(welcomeAssets).forEach(([agent, asset]) => {
    assert.match(source, new RegExp(`'${agent}':'/${asset}'`));
    assert.equal(fs.existsSync(path.join(root, asset)), true, asset);
  });
  assert.match(source, /querySelectorAll\('\.chat-brand img'\)/);
  assert.match(source, /querySelector\('\.chat-welcome img'\)/);
});

test('core scripts and local result pages exist', () => {
  ['index.html', 'server.js', 'chat-dispatcher.js', 'team-file-download.js', 'results/data-dashboards.html', 'results/marketing-calendar.html', 'downloads/A企业、竞品直播数据.xlsx', 'downloads/圣灵节专场营销-短视频分镜脚本.xlsm'].forEach(file => assert.equal(fs.existsSync(path.join(root, file)), true, file));
});
test('visual Excel link matches the user-provided storyboard workbook', () => assert.match(read('chat-dispatcher.js'), /圣灵节专场营销-短视频分镜脚本\.xlsm/));
test('marketing calendar opens from the marketing chat', () => {
  const source = read('chat-dispatcher.js');
  assert.match(source, /全年营销日历/);
  assert.match(source, /\/results\/marketing-calendar\.html/);
  assert.match(read('app-fixes.js'), /'全年营销日历':'\/results\/marketing-calendar\.html'/);
  assert.match(read('platform-features.js'), /'全年营销日历':'\/results\/marketing-calendar\.html'/);
});

test('knowledge graph uses the current Brazil culture graph and returns to operations', () => {
  const graph = read('results/knowledge-graph.html');
  assert.match(graph, /巴西新能源汽车出海知识图谱/);
  assert.match(graph, /data-agent="demo-ops" src="\/results\/navigation\.js\?v=20260917-return2"/);
  assert.match(read('app-fixes.js'), /'知识图谱':'\/results\/knowledge-graph\.html'/);
});

test('every active result page is registered for a clickable assistant return button', () => {
  const source = read('server.js');
  ['data-dashboards.html', 'customer-profile-dashboard.html', 'independent-site-dashboard.html', 'social-dashboard.html', 'knowledge-graph.html', 'all-channel-data-collection-dashboard.html', 'data-analysis-skills-mindmap.html', 'marketing-calendar.html', 'publish-platform.html'].forEach(file => {
    assert.match(source, new RegExp(`'${file.replace('.', '\\.')}': 'demo-`));
  });
  assert.match(read('results/navigation.js'), /z-index:2147483647!important/);
  assert.match(read('results/navigation.js'), /window\.location\.replace/);
  assert.doesNotMatch(read('results/navigation.js'), /history\.back/);
});

test('active result pages do not retain browser-history return links', () => {
  ['data-dashboards.html', 'customer-profile-dashboard.html', 'independent-site-dashboard.html', 'social-dashboard.html', 'knowledge-graph.html', 'all-channel-data-collection-dashboard.html', 'data-analysis-skills-mindmap.html', 'marketing-calendar.html', 'publish-platform.html'].forEach(file => {
    const page = read(`results/${file}`);
    assert.match(page, /\/results\/navigation\.js\?v=20260917-return2/);
    assert.doesNotMatch(page, /javascript:history\.back\(\)/);
  });
});
test('no browser route points to a missing legacy file', () => {
  const source = read('server.js');
  assert.doesNotMatch(source, /group-platform\.html|bridge-runtime\.js/);
  assert.doesNotMatch(read('app-fixes.js'), /visual-video-storyboard-with-images\.xlsx/);
});
test('server protects team-file downloads', () => {
  const source = read('server.js');
  assert.match(source, /\/api\/files\/:id\/download/);
  assert.match(source, /getTempFileURL/);
  assert.match(source, /file\.visibility === 'team'/);
});
test('index loads the final dispatcher and removes superseded role flows', () => {
  const source = read('index.html');
  assert.match(source, /chat-dispatcher\.js/);
  assert.doesNotMatch(source, /visual-video-flow\.js/);
  assert.doesNotMatch(source, /marketing-calendar-flow\.js/);
});
test('server serves every browser script loaded by index', () => {
  const source = read('server.js');
  ['cloudbase-runtime.js', 'platform-features.js', 'app-fixes.js', 'agent-skill-catalog.js', 'chat-dispatcher.js', 'team-file-download.js', 'team-tasks.js', 'skill-invocation-feedback.js', 'agent-workspace-navigation.js'].forEach(file => assert.match(source, new RegExp(file.replace('.', '\\.'))));
});
test('team task page and collection dashboard are available', () => {
  assert.equal(fs.existsSync(path.join(root, 'team-tasks.js')), true);
  assert.equal(fs.existsSync(path.join(root, 'results/all-channel-data-collection-dashboard.html')), true);
  assert.match(read('team-tasks.js'), /openTeamCollectionBoard/);
  assert.match(read('server.js'), /all-channel-data-collection-dashboard\.html/);
});
test('team file names are normalized before storage and display', () => {
  const source = read('server.js');
  assert.match(source, /normalizeFilename/);
  assert.match(source, /req\.file\.originalname = normalizeFilename/);
  assert.match(read('team-tasks.js'), /restoreFilename/);
});
test('every assistant receives the shared composer skill-tag interaction', () => {
  const source = read('skill-invocation-feedback.js');
  assert.match(source, /selected-skill-token/);
  assert.match(source, /runComposerSkill/);
  assert.match(source, /originalSendAgentChat/);
  assert.match(source, /removeSelectedSkill/);
});

test('assistant sidebar pages remember the current assistant and provide a return path', () => {
  const source = read('agent-workspace-navigation.js');
  ['我的项目', '任务协作', '成果中心', '知识库', '团队空间'].forEach(label => assert.match(source, new RegExp(label)));
  assert.match(source, /openAgentWorkspacePage/);
  assert.match(source, /返回智能体对话/);
  assert.match(read('team-tasks.js'), /团队任务/);
  assert.match(read('team-tasks.js'), /openAgentChat/);
});
