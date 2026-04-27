/* ═══════════════════════════════════════════════════════
   ConnectHBG — Premium UX System
   Skeleton loaders, 3D card tilt, sound feedback,
   scroll-based stagger reveals, micro-interactions.
═══════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════
   1. SKELETON LOADER SYSTEM
══════════════════════════════════ */

const SKELETON_CARD = `
  <div class="skeleton-card" aria-hidden="true">
    <div class="sk sk-img"></div>
    <div class="sk-body">
      <div class="sk sk-badge"></div>
      <div class="sk sk-title"></div>
      <div class="sk sk-line"></div>
      <div class="sk sk-line sk-line-short"></div>
      <div class="sk sk-meta">
        <div class="sk sk-meta-item"></div>
        <div class="sk sk-meta-item"></div>
      </div>
      <div class="sk sk-tags">
        <div class="sk sk-tag"></div>
        <div class="sk sk-tag"></div>
        <div class="sk sk-tag"></div>
      </div>
    </div>
    <div class="sk-footer">
      <div class="sk sk-btn"></div>
      <div class="sk sk-icon-btn"></div>
      <div class="sk sk-icon-btn"></div>
    </div>
  </div>`;

const SKELETON_LIST_ITEM = `
  <div class="skeleton-list-item" aria-hidden="true">
    <div class="sk sk-list-img"></div>
    <div class="sk-list-body">
      <div class="sk sk-title"></div>
      <div class="sk sk-line"></div>
      <div class="sk sk-line sk-line-short"></div>
      <div class="sk sk-meta">
        <div class="sk sk-meta-item"></div>
        <div class="sk sk-meta-item"></div>
        <div class="sk sk-meta-item"></div>
      </div>
    </div>
    <div class="sk sk-list-btn"></div>
  </div>`;

/* Show skeleton grid (call before fetch/render) */
window.showSkeletonGrid = function(count = 6) {
  const grid = document.getElementById('resource-grid');
  if (!grid) return;
  grid.innerHTML = Array(count).fill(SKELETON_CARD).join('');
  grid.classList.remove('hidden');
  document.getElementById('resource-list')?.classList.add('hidden');
  document.getElementById('map-container')?.classList.add('hidden');
};

/* Show skeleton list */
window.showSkeletonList = function(count = 5) {
  const list = document.getElementById('resource-list');
  if (!list) return;
  list.innerHTML = Array(count).fill(SKELETON_LIST_ITEM).join('');
  list.classList.remove('hidden');
  document.getElementById('resource-grid')?.classList.add('hidden');
  document.getElementById('map-container')?.classList.add('hidden');
};

/* Patch existing renderGrid/renderList to show skeleton briefly */
(function patchRenderFunctions() {
  if (typeof window !== 'undefined') {
    // We'll patch after DOMContentLoaded to ensure app.js functions are defined
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const _origRenderGrid = window.renderGrid;
        const _origRenderList = window.renderList;

        if (typeof _origRenderGrid === 'function') {
          window.renderGrid = function() {
            // Only show skeleton on first load or if grid is empty
            const grid = document.getElementById('resource-grid');
            if (grid && !grid.children.length || (grid && grid.querySelector('.skeleton-card'))) {
              _origRenderGrid();
              return;
            }
            showSkeletonGrid();
            setTimeout(() => _origRenderGrid(), 350);
          };
        }
      }, 100);
    });
  }
})();

/* ══════════════════════════════════
   2. 3D CARD TILT EFFECT
══════════════════════════════════ */

const TILT_CARDS = [
  '.resource-card',
  '.event-card',
  '.story-card',
  '.dash-card',
  '.kpi-card',
  '.ai-result-card',
];

function applyTiltEffect(el) {
  if (el._tiltInit) return;
  el._tiltInit = true;

  const MAX_TILT = 8;
  const SCALE = 1.025;

  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = -dy * MAX_TILT;
    const rotY = dx * MAX_TILT;

    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${SCALE},${SCALE},${SCALE})`;
    el.style.transition = 'transform 0.1s ease-out';

    /* Specular shine */
    let shine = el.querySelector('.tilt-shine');
    if (!shine) {
      shine = document.createElement('div');
      shine.className = 'tilt-shine';
      el.style.position = el.style.position || 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(shine);
    }
    const shineX = (dx + 1) / 2 * 100;
    const shineY = (dy + 1) / 2 * 100;
    shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
    shine.style.opacity = '1';
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    el.style.transition = 'transform 0.5s cubic-bezier(.23,1,.32,1)';
    const shine = el.querySelector('.tilt-shine');
    if (shine) shine.style.opacity = '0';
  });

  el.addEventListener('mouseenter', () => {
    el.style.transition = 'transform 0.1s ease-out';
  });
}

function initTiltEffects() {
  TILT_CARDS.forEach(sel => {
    document.querySelectorAll(sel).forEach(applyTiltEffect);
  });
}

/* Re-apply tilt to dynamically added cards using MutationObserver */
const tiltObserver = new MutationObserver(mutations => {
  mutations.forEach(m => {
    m.addedNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      TILT_CARDS.forEach(sel => {
        if (node.matches && node.matches(sel)) applyTiltEffect(node);
        node.querySelectorAll && node.querySelectorAll(sel).forEach(applyTiltEffect);
      });
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  tiltObserver.observe(document.body, { childList: true, subtree: true });
  initTiltEffects();
});

/* ══════════════════════════════════
   3. SOUND FEEDBACK (opt-in)
══════════════════════════════════ */

let soundEnabled = localStorage.getItem('crh_sound') === '1';
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; }
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', vol = 0.06) {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/* Distinct sounds for different interactions */
window.sfx = {
  click:   () => playTone(520, 0.08, 'sine', 0.05),
  success: () => { playTone(660, 0.1, 'sine', 0.05); setTimeout(() => playTone(880, 0.12, 'sine', 0.04), 100); },
  error:   () => playTone(220, 0.18, 'sawtooth', 0.04),
  toggle:  () => playTone(440, 0.07, 'triangle', 0.04),
  hover:   () => playTone(600, 0.04, 'sine', 0.02),
};

window.toggleSound = function() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('crh_sound', soundEnabled ? '1' : '0');
  const btn = document.getElementById('sound-toggle');
  if (btn) {
    btn.setAttribute('aria-pressed', String(soundEnabled));
    btn.classList.toggle('active', soundEnabled);
  }
  if (soundEnabled) {
    sfx.success();
    showToast && showToast('Sound feedback enabled');
  } else {
    showToast && showToast('Sound feedback disabled');
  }
};

/* Attach click sounds to interactive elements */
document.addEventListener('click', e => {
  const btn = e.target.closest('button, .btn-card-primary, .btn-hero-primary, .nav-link, .chip');
  if (!btn) return;
  if (btn.classList.contains('btn-hero-primary') || btn.classList.contains('form-submit-btn')) {
    sfx.success();
  } else {
    sfx.click();
  }
}, { passive: true });

/* ══════════════════════════════════
   4. SCROLL-BASED STAGGER REVEALS
══════════════════════════════════ */

function initStaggerReveals() {
  const targets = document.querySelectorAll('.resource-card, .event-card, .story-card, .kpi-card, .dash-card, .ai-result-card');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => io.observe(el));
}

/* Re-run on dynamic content */
const revealObserver = new MutationObserver(() => {
  document.querySelectorAll('.resource-card:not(.revealed), .event-card:not(.revealed), .ai-result-card:not(.revealed)').forEach(el => {
    el.classList.add('will-reveal');
  });
  initStaggerReveals();
});

document.addEventListener('DOMContentLoaded', () => {
  initStaggerReveals();
  revealObserver.observe(document.body, { childList: true, subtree: true });
});

/* ══════════════════════════════════
   5. SOUND TOGGLE BUTTON (inject into a11y bar)
══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const a11yBar = document.getElementById('a11y-bar');
  if (!a11yBar) return;

  const btn = document.createElement('button');
  btn.id = 'sound-toggle';
  btn.title = 'Toggle sound feedback';
  btn.setAttribute('aria-label', 'Toggle sound feedback');
  btn.setAttribute('aria-pressed', String(soundEnabled));
  btn.classList.toggle('active', soundEnabled);
  btn.innerHTML = `<span data-lucide="volume-2" class="w-4 h-4"></span>`;
  btn.onclick = () => window.toggleSound();
  a11yBar.appendChild(btn);
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

/* ══════════════════════════════════
   6. ENHANCED BUTTON PRESS EFFECT
══════════════════════════════════ */

document.addEventListener('mousedown', e => {
  const btn = e.target.closest('.btn-hero-primary, .btn-hero-secondary, .form-submit-btn, .btn-card-primary');
  if (!btn) return;
  btn.style.transform = (btn.style.transform || '') + ' scale(0.97)';
  btn.style.transition = 'transform 0.07s ease';
}, { passive: true });

document.addEventListener('mouseup', e => {
  const btn = e.target.closest('.btn-hero-primary, .btn-hero-secondary, .form-submit-btn, .btn-card-primary');
  if (!btn) return;
  btn.style.transform = btn.style.transform.replace(/\s?scale\([^)]*\)/, '');
  btn.style.transition = 'transform 0.25s cubic-bezier(.23,1,.32,1)';
}, { passive: true });

/* ══════════════════════════════════
   7. SMOOTH PAGE-SECTION TRANSITIONS
══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  /* Intercept all nav link clicks for smooth indicator animation */
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.addEventListener('click', function() {
      /* Brief flash on active nav item */
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('nav-active'));
      this.classList.add('nav-active');
      setTimeout(() => this.classList.remove('nav-active'), 1200);
    });
  });
});

/* ══════════════════════════════════
   8. TOAST ENHANCEMENT
══════════════════════════════════ */

/* Override showToast with entrance animation */
(function() {
  const origShowToast = window.showToast;
  if (typeof origShowToast !== 'function') return;

  window.showToast = function(msg, type = 'default') {
    const toast = document.getElementById('toast');
    if (!toast) { origShowToast && origShowToast(msg); return; }

    /* Clear previous animation */
    toast.classList.remove('toast-enter', 'toast-exit', 'toast-success', 'toast-error');
    void toast.offsetWidth; // force reflow

    toast.textContent = msg;
    if (type === 'success') toast.classList.add('toast-success');
    if (type === 'error') toast.classList.add('toast-error');
    toast.classList.add('toast-enter');
    toast.classList.remove('hidden');

    clearTimeout(window._toastTimer2);
    window._toastTimer2 = setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3200);
  };
})();
