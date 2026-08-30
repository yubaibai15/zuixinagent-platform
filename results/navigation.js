(() => {
  const script = document.currentScript;
  const agent = script?.dataset.agent || 'demo-data';
  const returnToAgent = () => window.location.replace(`/?agent=${encodeURIComponent(agent)}`);

  const install = () => {
    document.querySelectorAll('a[aria-label], header a').forEach(link => {
      const label = link.getAttribute('aria-label') || '';
      if (label.includes('\u8fd4\u56de') || /\u8fd4\u56de/.test(link.textContent || '')) link.remove();
    });
    if (document.querySelector('.result-close')) return;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'result-close';
    close.setAttribute('aria-label', '\u5173\u95ed\u6210\u679c\u5e76\u8fd4\u56de\u5c97\u4f4d\u52a9\u624b');
    close.title = '\u8fd4\u56de\u5c97\u4f4d\u52a9\u624b';
    close.textContent = '\u00d7';
    close.addEventListener('click', returnToAgent);
    document.body.appendChild(close);
  };

  const style = document.createElement('style');
  style.textContent = '.result-close{position:fixed;z-index:10000;top:14px;left:16px;width:38px;height:38px;padding:0;border:0;border-radius:50%;background:transparent;color:rgba(255,255,255,.9);font:300 38px/34px Arial,sans-serif;cursor:pointer;text-shadow:0 1px 5px rgba(0,0,0,.72);opacity:.78;transition:opacity .15s,transform .15s}.result-close:hover,.result-close:focus-visible{opacity:1;transform:scale(1.12);outline:2px solid rgba(255,255,255,.5);outline-offset:2px}@media(max-width:600px){.result-close{top:8px;left:8px}}';
  document.head.appendChild(style);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true }); else install();
})();
