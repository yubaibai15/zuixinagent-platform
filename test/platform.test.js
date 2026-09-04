const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('core scripts and local result pages exist', () => {
  ['index.html', 'server.js', 'chat-dispatcher.js', 'team-file-download.js', 'results/data-dashboards.html', 'results/marketing-calendar.html', 'downloads/A企业、竞品直播数据.xlsx', 'downloads/圣灵节专场营销-短视频分镜脚本.xlsx'].forEach(file => assert.equal(fs.existsSync(path.join(root, file)), true, file));
});
test('visual Excel link matches the user-provided storyboard workbook', () => assert.match(read('chat-dispatcher.js'), /圣灵节专场营销-短视频分镜脚本\.xlsx/));
test('marketing calendar opens from the marketing chat', () => {
  const source = read('chat-dispatcher.js');
  assert.match(source, /全年营销日历/);
  assert.match(source, /\/results\/marketing-calendar\.html/);
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
  ['cloudbase-runtime.js', 'platform-features.js', 'app-fixes.js', 'agent-skill-catalog.js', 'chat-dispatcher.js', 'team-file-download.js'].forEach(file => assert.match(source, new RegExp(file.replace('.', '\\.'))));
});
