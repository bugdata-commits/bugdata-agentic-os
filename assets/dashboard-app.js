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
    form.addEventListener('submit', (e) => {
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
    });
  }

  // Approve buttons in the demo feed just flip that item's own state —
  // this is a mockup, not a live approval pipeline.
  feed?.addEventListener('click', (e) => {
    const btn = e.target.closest('button.approve');
    if (!btn) return;
    const item = btn.closest('.feed-item');
    item.classList.remove('approval');
    item.classList.add('done');
    item.querySelector('.feed-status').textContent = 'Launched';
    const actions = item.querySelector('.feed-actions');
    if (actions) actions.remove();
  });
})();
