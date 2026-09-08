const API_BASE = 'https://winning-repository-lucky-specialist.trycloudflare.com';
/* BUGDATA Agentic OS — dashboard mockup interactions */
(function () {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
  }

  const dateEl = document.getElementById('today-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  const textarea = document.getElementById('composer-input');
  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }

  const form = document.getElementById('composer-form');
  const feed = document.getElementById('activity-feed');
  if (form && feed) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const value = textarea.value.trim();
      if (!value) return;

      const item = document.createElement('div');
      item.className = 'feed-item working';
      const time = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      const time_el = document.createElement('div');
      time_el.className = 'feed-time';
      time_el.textContent = time;
      const body = document.createElement('div');
      body.className = 'feed-body';
      const who = document.createElement('div');
      who.className = 'feed-who';
      who.textContent = 'Hermes';
      const text = document.createElement('p');
      text.className = 'feed-text';
      text.textContent = `On it — routing “${value}” to the right agent now.`;
      const status = document.createElement('span');
      status.className = 'feed-status';
      status.textContent = 'In progress';
      body.append(who, text, status);
      item.append(time_el, body);
      feed.prepend(item);

      form.reset();
      textarea.style.height = 'auto';

      try {
        const r = await fetch(`${API_BASE}/api/agents/command`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({command: value}),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Command failed');
        const agent = data.agent || 'Hermes';
        const message = data.message || 'Command processed.';
        text.textContent = `${agent}: ${message}`;
        status.textContent = data.action || 'Done';
      } catch (err) {
        text.textContent = `Couldn't reach the server — ${err.message}.`;
        status.textContent = 'Error';
      }
    });
  }

  feed?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button.approve');
    if (!btn) return;
    const item = btn.closest('.feed-item');
    const commandText = item.querySelector('.feed-text')?.textContent || '';
    try {
      const r = await fetch(`${API_BASE}/api/agents/command`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({command: `approve: ${commandText}`}),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Approval failed');
    } catch (err) {
      // fall back to local state change on failure
    }
    item.classList.remove('approval');
    item.classList.add('done');
    item.querySelector('.feed-status').textContent = 'Launched';
    const actions = item.querySelector('.feed-actions');
    if (actions) actions.remove();
  });

  // Nav section router
  document.querySelectorAll('.mlink, aside a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href') || '';
      const targetId = href.replace('#', '') || 'section-command';
      document.querySelectorAll('.app-section, aside').forEach(el => {
        if (el.id === targetId || (!targetId && el.id === 'section-command')) {
          el.style.display = '';
        } else if (el.classList.contains('app-section')) {
          el.style.display = 'none';
        }
      });
      document.querySelectorAll('aside a').forEach(a => a.classList.remove('active'));
      document.querySelectorAll('.mlink').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      if (window.innerWidth <= 720) {
        const menu = document.getElementById('mobile-nav-menu');
        if (menu) menu.classList.remove('open');
      }
    });
  });
})();
