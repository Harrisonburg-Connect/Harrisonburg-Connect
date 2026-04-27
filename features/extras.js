// ─────────────────────────────────────────────────────────
//  ConnectHBG — Batch 3 Extras: Scroll Indicator, City Stats, Newsletter
// ─────────────────────────────────────────────────────────

// ─── Scroll-Down Indicator ────────────────────────────────
function initScrollIndicator() {
  const indicator = document.getElementById('scroll-indicator');
  const hero = document.getElementById('hero');
  if (!indicator || !hero) return;

  const obs = new IntersectionObserver(entries => {
    indicator.style.opacity = entries[0].intersectionRatio >= 0.5 ? '1' : '0';
    indicator.style.pointerEvents = entries[0].intersectionRatio >= 0.5 ? 'auto' : 'none';
  }, { threshold: [0, 0.5, 1] });
  obs.observe(hero);
}

function scrollToHowItWorks() {
  const target = document.getElementById('how-it-works');
  if (target) target.scrollIntoView({ behavior: 'smooth' });
}

// ─── City Stats Count-Up Animation ───────────────────────
function initCityStats() {
  const grid = document.getElementById('city-stats-grid');
  if (!grid) return;

  let done = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      animateCityStatTiles();
    }
  }, { threshold: 0.25 });
  obs.observe(grid);
}

function animateCityStatTiles() {
  document.querySelectorAll('[data-stat-target]').forEach(el => {
    const target = parseInt(el.dataset.statTarget, 10);
    const suffix = el.dataset.statSuffix || '';
    const duration = parseInt(el.dataset.statDuration || '1400', 10);
    const t0 = performance.now();
    function frame(now) {
      const progress = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  document.querySelectorAll('[data-stat-static]').forEach(el => {
    el.style.transition = 'opacity 0.7s ease';
    el.style.opacity = '1';
  });
}

// ─── Newsletter Signup ────────────────────────────────────
function submitNewsletter() {
  const input = document.getElementById('newsletter-email');
  if (!input) return;
  const email = input.value.trim();

  if (!/.+@.+\..+/.test(email)) {
    showToast('Please enter a valid email address.');
    return;
  }

  try {
    const saved = JSON.parse(localStorage.getItem('crh_newsletter_emails') || '[]');
    saved.push(email);
    localStorage.setItem('crh_newsletter_emails', JSON.stringify(saved));
  } catch (_) {}

  input.value = '';
  showToast("You're subscribed! Welcome to the community.");
}

// ─── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollIndicator();
  initCityStats();
});
