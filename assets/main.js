/* BUGDATA Agentic OS — site interactions */
(function () {
  // Quick Cloudflare tunnel (trycloudflare.com) — this URL rotates whenever
  // the tunnel process restarts. When the form starts failing silently,
  // check this first before anything else.
  const EARLY_ACCESS_API = 'https://winning-repository-lucky-specialist.trycloudflare.com/api/early-access';

  // ---- Mobile menu ----
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      })
    );
  }

  // ---- Accessible modal (Request early access) ----
  const modal = document.getElementById('access-modal');
  const openTriggers = document.querySelectorAll('.open-access');
  const modalClose = document.getElementById('modal-close');
  const modalDone = document.getElementById('modal-done');
  const formView = document.getElementById('modal-form-view');
  const successView = document.getElementById('modal-success-view');
  const form = document.getElementById('access-form');
  let lastFocusedEl = null;

  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);
  }

  function openModal() {
    lastFocusedEl = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const focusable = getFocusable(modal);
    (focusable[0] || modal).focus();
    document.addEventListener('keydown', trapFocus);
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', trapFocus);
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
  }

  function trapFocus(e) {
    if (e.key === 'Escape') return closeModal();
    if (e.key !== 'Tab') return;
    const focusable = getFocusable(modal);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (modal && form) {
    openTriggers.forEach((el) =>
      el.addEventListener('click', (e) => {
        e.preventDefault();
        formView.style.display = 'block';
        successView.style.display = 'none';
        form.reset();
        document.getElementById('access-feedback').textContent = '';
        openModal();
      })
    );
    modalClose.addEventListener('click', closeModal);
    modalDone.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Posts to the local backend via a Cloudflare tunnel (see EARLY_ACCESS_API
    // above). Shows a real error state on failure instead of always claiming
    // success — a quick tunnel can go down without warning.
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('af-name').value.trim();
      const business = document.getElementById('af-business').value.trim();
      const email = document.getElementById('af-email').value.trim();
      const feedback = document.getElementById('access-feedback');
      const submitBtn = form.querySelector('button[type=submit]');
      if (!name || !email) return;

      feedback.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const res = await fetch(EARLY_ACCESS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, business, email }),
        });
        if (!res.ok) throw new Error('Request failed: ' + res.status);

        formView.style.display = 'none';
        successView.style.display = 'block';
        const doneBtn = document.getElementById('modal-done');
        if (doneBtn) doneBtn.focus();
      } catch (err) {
        feedback.textContent = "Couldn't reach the server — please try again in a moment, or email us directly.";
        console.error('Early access submission failed:', err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request access';
      }
    });
  }

  // ---- Dispatch log: single orchestrated reveal, staggered ----
  const dlines = document.querySelectorAll('#dispatch-body .dline');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    dlines.forEach((line, i) => {
      line.style.animationDelay = `${0.15 + i * 0.5}s`;
    });
  }
})();
