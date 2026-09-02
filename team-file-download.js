(() => {
  const token = () => localStorage.getItem('nev_token') || '';
  const safe = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  window.downloadTeamFile = async id => {
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(id)}/download`, { headers: token() ? { Authorization: `Bearer ${token()}` } : {} });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || '无法生成下载链接。');
      const link = document.createElement('a'); link.href = data.url; link.download = data.name || ''; link.target = '_blank'; link.rel = 'noopener'; document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { window.notify?.(error.message) || alert(error.message); }
  };
  const installButtons = async () => {
    const holder = document.getElementById('teamSharedFiles');
    if (!holder || holder.dataset.downloadsReady === 'true') return;
    const response = await fetch('/api/files', { headers: token() ? { Authorization: `Bearer ${token()}` } : {} });
    const data = await response.json().catch(() => []);
    if (!response.ok || !Array.isArray(data)) return;
    const files = data.filter(file => file.visibility === 'team');
    [...holder.querySelectorAll('article')].forEach((article, index) => {
      const file = files[index]; if (!file || article.querySelector('.team-file-download')) return;
      const button = document.createElement('button'); button.type = 'button'; button.className = 'link team-file-download'; button.textContent = '下载'; button.addEventListener('click', () => window.downloadTeamFile(file._id)); article.appendChild(button);
    });
    holder.dataset.downloadsReady = 'true';
  };
  const previousOpen = window.openTeamSpace;
  window.openTeamSpace = async (...args) => { const result = await previousOpen?.(...args); await installButtons(); return result; };
  new MutationObserver(() => { installButtons().catch(() => {}); }).observe(document.documentElement, { childList: true, subtree: true });
  const style = document.createElement('style'); style.textContent = '.team-file-download{margin-left:10px;border:1px solid #cfe4d7;border-radius:8px;background:#fff;padding:6px 10px;font-size:12px;cursor:pointer}.team-file-download:hover{background:#edf8f1}'; document.head.appendChild(style);
})();
