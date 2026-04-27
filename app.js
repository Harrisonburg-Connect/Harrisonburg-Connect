/* ═══════════════════════════════════════════════════════
   ConnectHBG — Community Resource Hub
   app.js — Full Application Logic
═══════════════════════════════════════════════════════ */

'use strict';

// ─── State ───────────────────────────────────────────
let currentView = 'grid';
let filteredResources = [...RESOURCES];
let carouselIndex = 0;
let carouselTotal = 0;
let carouselTimer = null;
let mapInstance = null;
let mapMarkers = [];
let currentEventFilter = 'all';
let currentCalView = 'list';
let pendingReviews = {};
let submissionQueue = [];
let ttsEnabled = false;
let announcementIndex = 0;

// ─── Auth State ───────────────────────────────────────
// Pre-set accounts (judge + admin) that cannot be overwritten
const PRESET_ACCOUNTS = {
  'judge':  { password: 'TSA2026!',      role: 'judge', displayName: 'Competition Judge' },
  'admin':  { password: 'Admin2026!',    role: 'admin', displayName: 'Site Admin' }
};
// User-created accounts persisted in localStorage
let userAccounts = JSON.parse(localStorage.getItem('crh_accounts') || '{}');
// Active session lives in sessionStorage → auto-clears when tab/browser closes
let currentUser = JSON.parse(sessionStorage.getItem('crh_session') || 'null');

// ─── Favorites State ──────────────────────────────────
let favorites = new Set(JSON.parse(localStorage.getItem('crh_favorites') || '[]'));

// ─── Batch 4: Reaction State ──────────────────────────
const reactionMap = new Map();

// Pre-seed reactions for first few resources so UI looks lived-in
(function seedReactions() {
  const seeds = [
    ['1-👍', 8], ['1-❤️', 4],
    ['2-👍', 6],
    ['3-👍', 10], ['3-🔥', 3],
    ['4-👍', 5], ['4-😂', 2],
    ['5-❤️', 7], ['5-🔥', 5],
  ];
  seeds.forEach(([k, v]) => reactionMap.set(k, v));
})();

// Pre-seeded reviews for resources
const SEEDED_REVIEWS = {
  1: [
    { id: 'r1-0', author: 'Maria Torres', rating: 5, text: 'Amazing service — volunteers are so kind and helpful. No judgment, just support.', date: '2026-02-10' },
    { id: 'r1-1', author: 'James Nguyen', rating: 4, text: 'Great selection of fresh produce. Wish hours were extended on weekends.', date: '2026-03-01' },
    { id: 'r1-2', author: 'Aisha Muhammad', rating: 5, text: 'The food bank has been a lifeline for my family during tough times.', date: '2026-03-15' },
  ],
  2: [
    { id: 'r2-0', author: 'Tom Chen', rating: 5, text: 'Staff went above and beyond to help us find housing. Truly life-changing.', date: '2026-01-20' },
    { id: 'r2-1', author: 'Linda Park', rating: 4, text: 'Clean facilities, helpful case managers. A safe place when we needed it most.', date: '2026-02-18' },
  ],
  5: [
    { id: 'r5-0', author: 'Raj Mehta', rating: 5, text: 'Drop-in hours are a game changer. No appointment, no judgment. Just care.', date: '2026-03-05' },
    { id: 'r5-1', author: 'Amy Johnson', rating: 5, text: 'The therapists here genuinely listen. Best mental health resource in the city.', date: '2026-03-20' },
  ],
};

// ─── Batch 4: Utility Functions ───────────────────────
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarColor(name) {
  const PALETTE = ['#14B8A6','#8B5CF6','#F97316','#EF4444','#3B82F6','#10B981','#F59E0B','#EC4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return PALETTE[hash % PALETTE.length];
}

function relativeTime(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ─── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 40 });
  lucide.createIcons();

  // Restore dark mode preference
  if (localStorage.getItem('crh_dark') === '1') {
    document.documentElement.classList.add('dark-mode');
    const icon = document.getElementById('dark-icon');
    if (icon) { icon.setAttribute('data-lucide', 'sun'); lucide.createIcons(); }
  }

  initNavbar();
  initAnnouncement();
  initDashboard();
  initCarousel();
  initDirectory();
  initCalendar();
  initStories();
  initForm();
  initCompare();
  initCharts();
  initSearch();
  animateStats();
  updateUserUI();
  initFavorites();
  updateFavCountBadge();
  initRippleEffects();
  initHeroParallax();
});

/* ═══════════════════════════════════════════════════════
   SITE ANIMATIONS
═══════════════════════════════════════════════════════ */
function initRippleEffects() {
  // Add ripple to all primary buttons on click
  document.body.addEventListener('click', e => {
    const btn = e.target.closest('button, .btn-card-primary, .btn-register, .btn-ar-launch, .btn-carousel-detail');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    // Only set position to relative if the element is currently statically positioned
    // This prevents overriding absolute/fixed positioned elements (e.g. carousel buttons)
    const computedPos = window.getComputedStyle(btn).position;
    if (computedPos === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }, { passive: true });
}

function initHeroParallax() {
  // Apply parallax only to hero-content inner elements (not the stats bar)
  // Negative translateY moves content UP as user scrolls down — correct parallax direction
  // prevents the content from overlapping the stats bar or adjacent sections
  const hero = document.querySelector('.hero-content');
  const heroSection = document.querySelector('.hero-section');
  if (!hero || !heroSection) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const heroH = heroSection.offsetHeight;
    if (y < heroH) {
      hero.style.transform = `translateY(${-y * 0.12}px)`;
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════ */
function initNavbar() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('mobile-menu-btn');
  const isOpen = !menu.classList.contains('hidden');
  menu.classList.toggle('hidden');
  btn.setAttribute('aria-expanded', String(!isOpen));
}

function toggleDark() {
  const isDark = document.documentElement.classList.toggle('dark-mode');
  const icon = document.getElementById('dark-icon');
  if (icon) { icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon'); lucide.createIcons(); }
  localStorage.setItem('crh_dark', isDark ? '1' : '0');
  showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled');
}

/* ═══════════════════════════════════════════════════════
   ACCESSIBILITY TOOLBAR — COLLAPSIBLE
═══════════════════════════════════════════════════════ */
let a11yBarExpanded = false;

function toggleA11yBar() {
  a11yBarExpanded = !a11yBarExpanded;
  const controls = document.getElementById('a11y-controls');
  const btn = document.getElementById('a11y-toggle-btn');
  if (controls) {
    controls.classList.toggle('expanded', a11yBarExpanded);
    controls.setAttribute('aria-hidden', String(!a11yBarExpanded));
  }
  if (btn) btn.setAttribute('aria-expanded', String(a11yBarExpanded));
}

// Close a11y bar when clicking outside
document.addEventListener('click', e => {
  if (a11yBarExpanded) {
    const bar = document.getElementById('a11y-bar');
    if (bar && !bar.contains(e.target)) {
      a11yBarExpanded = false;
      const controls = document.getElementById('a11y-controls');
      const btn = document.getElementById('a11y-toggle-btn');
      if (controls) { controls.classList.remove('expanded'); controls.setAttribute('aria-hidden', 'true'); }
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  }
});

/* ═══════════════════════════════════════════════════════
   ACCESSIBILITY
═══════════════════════════════════════════════════════ */
let fontSize = 16;

function increaseFontSize() {
  fontSize = Math.min(fontSize + 2, 24);
  document.documentElement.style.setProperty('--font-size-base', fontSize + 'px');
  document.documentElement.style.fontSize = fontSize + 'px';
  showToast('Text size increased');
}

function decreaseFontSize() {
  fontSize = Math.max(fontSize - 2, 12);
  document.documentElement.style.setProperty('--font-size-base', fontSize + 'px');
  document.documentElement.style.fontSize = fontSize + 'px';
  showToast('Text size decreased');
}

// High contrast mode removed — see toggleDark() for dark mode

function toggleTTS() {
  ttsEnabled = !ttsEnabled;
  const btn = document.getElementById('btn-tts');
  btn.setAttribute('aria-pressed', String(ttsEnabled));

  if (ttsEnabled) {
    showToast('Text-to-speech enabled — hover over any card or section');
    document.body.addEventListener('mouseenter', handleTTSGlobal, true);
  } else {
    showToast('Text-to-speech disabled');
    document.body.removeEventListener('mouseenter', handleTTSGlobal, true);
    window.speechSynthesis && window.speechSynthesis.cancel();
  }
}

// Global TTS — works on ANY hoverable text block across the entire site
function handleTTSGlobal(e) {
  if (!ttsEnabled) return;
  const el = e.target;
  // Speak content of cards, sections, carousel, dashboard items, modals, stats
  const ttsTargets = [
    '.resource-card', '.event-card', '.story-card', '.dash-card',
    '.carousel-slide', '.compare-card', '.admin-item', '.kpi-card',
    '.hero-content', '.section-header', '.resource-list-item',
    '.modal-body', '.ar-pin-label'
  ];
  const matchedCard = ttsTargets.reduce((found, sel) => found || el.closest(sel), null);
  if (!matchedCard) return;
  // Debounce so rapid hover changes don't spam speech
  clearTimeout(window._ttsTimer);
  window._ttsTimer = setTimeout(() => {
    const titleEl = matchedCard.querySelector(
      'h1,h2,h3,h4,.card-name,.event-title,.story-title,.dash-title,.carousel-title,.kpi-value,.hero-headline,.section-title'
    );
    const descEl = matchedCard.querySelector(
      '.card-desc,.event-desc,.story-excerpt,.modal-desc,.dash-sub,.hero-sub,.section-subtitle'
    );
    if (!titleEl) return;
    const text = `${titleEl.textContent.trim()}. ${descEl ? descEl.textContent.trim().substring(0, 150) : ''}`;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.0; utt.pitch = 1.0; utt.volume = 1;
      window.speechSynthesis.speak(utt);
    }
  }, 300);
}

// Keep old function as alias for compatibility
function handleTTSHover(e) { handleTTSGlobal(e); }

/* ═══════════════════════════════════════════════════════
   VOICE SEARCH
═══════════════════════════════════════════════════════ */
function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { showToast('Voice search not supported in this browser'); return; }

  const recognition = new SpeechRecognition();
  const btn = document.getElementById('voice-btn');
  btn.classList.add('listening');
  recognition.lang = 'en-US';

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const heroSearch = document.getElementById('hero-search');
    const dirSearch = document.getElementById('dir-search');
    if (heroSearch) { heroSearch.value = transcript; }
    const overlay = document.getElementById('hero-typing-overlay');
    if (overlay) overlay.style.visibility = 'hidden';
    if (dirSearch) dirSearch.value = transcript;
    applyFilters();
    jumpToDirectory();
    showToast(`Searching for: "${transcript}"`);
  };
  recognition.onerror = () => { btn.classList.remove('listening'); showToast('Voice search error'); };
  recognition.onend = () => btn.classList.remove('listening');
  recognition.start();
}

/* ═══════════════════════════════════════════════════════
   LOGIN / AUTH
═══════════════════════════════════════════════════════ */
function openLoginModal() {
  if (currentUser) {
    openAccountDashboard();
    return;
  }
  const modal = document.getElementById('login-modal');
  modal.classList.remove('hidden');
  switchLoginTab('signin');
  setTimeout(() => document.getElementById('login-username').focus(), 100);
}

function closeLoginModal(e) {
  if (!e || e.target === document.getElementById('login-modal')) {
    document.getElementById('login-modal').classList.add('hidden');
  }
}

function switchLoginTab(tab) {
  const signinPanel = document.getElementById('panel-signin');
  const registerPanel = document.getElementById('panel-register');
  const signinTab = document.getElementById('tab-signin');
  const registerTab = document.getElementById('tab-register');
  if (!signinPanel) return;

  if (tab === 'signin') {
    signinPanel.classList.remove('hidden');
    registerPanel.classList.add('hidden');
    signinTab.classList.add('active');
    registerTab.classList.remove('active');
    signinTab.setAttribute('aria-selected', 'true');
    registerTab.setAttribute('aria-selected', 'false');
  } else {
    signinPanel.classList.add('hidden');
    registerPanel.classList.remove('hidden');
    signinTab.classList.remove('active');
    registerTab.classList.add('active');
    signinTab.setAttribute('aria-selected', 'false');
    registerTab.setAttribute('aria-selected', 'true');
    setTimeout(() => document.getElementById('reg-displayname').focus(), 50);
  }
}

function submitLogin() {
  const username = document.getElementById('login-username').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');

  if (!username || !password) {
    showLoginError(errEl, 'Please enter your username and password.');
    return;
  }

  // Check preset accounts first
  let account = null;
  if (PRESET_ACCOUNTS[username] && PRESET_ACCOUNTS[username].password === password) {
    account = { username, ...PRESET_ACCOUNTS[username] };
  } else if (userAccounts[username] && userAccounts[username].password === password) {
    account = { username, ...userAccounts[username] };
  }

  if (!account) {
    showLoginError(errEl, 'Incorrect username or password. Please try again.');
    return;
  }

  currentUser = account;
  sessionStorage.setItem('crh_session', JSON.stringify(account));
  document.getElementById('login-modal').classList.add('hidden');
  updateUserUI();
  showToast(`Welcome back, ${account.displayName}! 🎉`);

  // Complete any pending registration
  if (window._pendingRegistration !== undefined) {
    const pid = window._pendingRegistration;
    window._pendingRegistration = undefined;
    setTimeout(() => registerEvent(pid), 400);
  }
}

function submitRegister() {
  const displayName = document.getElementById('reg-displayname').value.trim();
  const username = document.getElementById('reg-username').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const errEl = document.getElementById('register-error');

  if (!displayName || !username || !password || !confirm) {
    showLoginError(errEl, 'All fields are required.');
    return;
  }
  if (username.length < 3) {
    showLoginError(errEl, 'Username must be at least 3 characters.');
    return;
  }
  if (PRESET_ACCOUNTS[username]) {
    showLoginError(errEl, 'That username is reserved. Please choose another.');
    return;
  }
  if (userAccounts[username]) {
    showLoginError(errEl, 'Username already taken. Try a different one.');
    return;
  }
  if (password.length < 6) {
    showLoginError(errEl, 'Password must be at least 6 characters.');
    return;
  }
  if (password !== confirm) {
    showLoginError(errEl, 'Passwords do not match.');
    return;
  }

  // Save new account
  userAccounts[username] = { password, role: 'user', displayName };
  localStorage.setItem('crh_accounts', JSON.stringify(userAccounts));

  // Auto-login
  currentUser = { username, password, role: 'user', displayName };
  sessionStorage.setItem('crh_session', JSON.stringify(currentUser));
  document.getElementById('login-modal').classList.add('hidden');
  updateUserUI();
  showToast(`Account created! Welcome, ${displayName}! 🎉`);

  // Complete any pending registration
  if (window._pendingRegistration !== undefined) {
    const pid = window._pendingRegistration;
    window._pendingRegistration = undefined;
    setTimeout(() => registerEvent(pid), 400);
  }
}

function signOut() {
  currentUser = null;
  sessionStorage.removeItem('crh_session');
  updateUserUI();
  showToast('You have been signed out.');
}

function showLoginError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

function togglePasswordVis(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  const icon = btn.querySelector('[data-lucide]');
  if (icon) { icon.setAttribute('data-lucide', isText ? 'eye' : 'eye-off'); lucide.createIcons(); }
}

function updateUserUI() {
  const btn = document.querySelector('.btn-primary-sm');
  if (!btn) return;
  if (currentUser) {
    const roleIcon = currentUser.role === 'judge' ? 'award' : currentUser.role === 'admin' ? 'shield-check' : 'user-check';
    btn.innerHTML = `<span data-lucide="${roleIcon}" class="w-4 h-4"></span> ${currentUser.displayName}`;
    btn.style.background = currentUser.role === 'judge'
      ? 'linear-gradient(135deg,#F59E0B,#D97706)'
      : currentUser.role === 'admin'
      ? 'linear-gradient(135deg,#8B5CF6,#7C3AED)'
      : 'linear-gradient(135deg,var(--teal),var(--teal-dark))';
  } else {
    btn.innerHTML = `<span data-lucide="user" class="w-4 h-4"></span> Sign In`;
    btn.style.background = '';
  }
  updateAdminSectionVisibility();
  lucide.createIcons();
}

/* ═══════════════════════════════════════════════════════
   ANNOUNCEMENT BANNER
═══════════════════════════════════════════════════════ */
function initAnnouncement() {
  const el = document.getElementById('announcement-text');
  if (!el || !ANNOUNCEMENTS.length) return;

  function showNext() {
    const a = ANNOUNCEMENTS[announcementIndex % ANNOUNCEMENTS.length];
    el.textContent = a.text;
    announcementIndex++;
  }
  showNext();
  setInterval(showNext, 6000);
}

/* ═══════════════════════════════════════════════════════
   STAT COUNTER ANIMATION
═══════════════════════════════════════════════════════ */
function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════
   HERO SEARCH
═══════════════════════════════════════════════════════ */
const HERO_PHRASES = [
  'Find youth programs near you...',
  'Search food assistance in Harrisonburg...',
  'Discover mental health resources...',
  'Find free tutoring for kids...',
  'Search after-school programs...',
  'Find community volunteer opportunities...',
  'Discover senior services nearby...',
  'Search ESL classes in the Valley...',
  'Find emergency shelter and housing...',
  'Discover family counseling services...',
  'Search legal aid resources...',
  'Find transportation assistance...',
  'Discover childcare referral programs...',
  'Search community fitness classes...',
  'Find cultural arts events near you...',
  'Discover coding clubs for teens...',
  'Search food banks near Downtown...',
  'Find immigrant and refugee support...',
  'Discover disability resource services...',
  'Search animal shelter volunteer spots...',
  'Find STEM workshops for youth...',
  'Search farmers market vendors...'
];

function initSearch() {
  const input = document.getElementById('hero-search');
  const dropdown = document.getElementById('hero-autocomplete');
  const overlay = document.getElementById('hero-typing-overlay');
  const typingText = document.getElementById('hero-typing-text');

  // ── Typing animation ──
  if (overlay && typingText) {
    let phraseIdx = 0, charIdx = 0, deleting = false;
    function tick() {
      const phrase = HERO_PHRASES[phraseIdx];
      if (!deleting) {
        charIdx++;
        typingText.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
        setTimeout(tick, 55);
      } else {
        charIdx--;
        typingText.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % HERO_PHRASES.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, 35);
      }
    }
    tick();
  }

  // ── Hero text input ──
  if (input && dropdown) {
    input.addEventListener('input', () => {
      if (overlay) overlay.style.visibility = input.value ? 'hidden' : 'visible';
      const dirSearch = document.getElementById('dir-search');
      if (dirSearch) dirSearch.value = input.value;
    });

    let debounce = null;
    input.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = e.target.value.trim().toLowerCase();
        if (q.length < 2) { dropdown.classList.add('hidden'); return; }
        const matches = RESOURCES.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q))
        ).slice(0, 6);
        if (!matches.length) { dropdown.classList.add('hidden'); return; }
        dropdown.innerHTML = matches.map(r => `
          <div class="autocomplete-item" role="option" tabindex="0"
            onclick="selectAutocomplete('${r.name.replace(/'/g,"&#39;")}', '${r.category}')"
            onkeydown="if(event.key==='Enter') selectAutocomplete('${r.name.replace(/'/g,"&#39;")}', '${r.category}')">
            <span>${highlightMatch(r.name, q)}</span>
            <span class="ac-cat">${r.category}</span>
          </div>
        `).join('');
        dropdown.classList.remove('hidden');
      }, 180);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { jumpToDirectory(); dropdown.classList.add('hidden'); }
      if (e.key === 'Escape') dropdown.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('hero-search-wrap');
      if (wrap && !wrap.contains(e.target)) dropdown.classList.add('hidden');
    });
  }

  // ── Dir search ──
  const dirInput = document.getElementById('dir-search');
  if (dirInput) {
    let dirDebounce = null;
    dirInput.addEventListener('input', () => {
      clearTimeout(dirDebounce);
      dirDebounce = setTimeout(applyFilters, 220);
    });
  }
}

function highlightMatch(text, query) {
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark style="background:rgba(20,184,166,.2);color:inherit;border-radius:2px">$1</mark>');
}

function selectAutocomplete(name, _category) {
  const inp = document.getElementById('hero-search'); if (inp) inp.value = name;
  const ds = document.getElementById('dir-search'); if (ds) ds.value = name;
  const dropdown = document.getElementById('hero-autocomplete');
  if (dropdown) dropdown.classList.add('hidden');
  const overlay = document.getElementById('hero-typing-overlay');
  if (overlay) overlay.style.visibility = 'hidden';
  applyFilters();
  jumpToDirectory();
}

function jumpToDirectory() {
  const dir = document.getElementById('directory');
  const q = document.getElementById('hero-search')?.value || '';
  if (q) { const d = document.getElementById('dir-search'); if (d) d.value = q; }
  applyFilters();
  dir.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterByCategory(cat) {
  document.getElementById('filter-category').value = cat;
  applyFilters();
  jumpToDirectory();
}

/* ═══════════════════════════════════════════════════════
   DAILY DASHBOARD
═══════════════════════════════════════════════════════ */
function initDashboard() {
  renderTodayEvents();
  renderAnnouncements();
  renderTrending();
}

function renderTodayEvents() {
  const el = document.getElementById('today-events-list');
  if (!el) return;
  // Show next 3 upcoming events
  const upcoming = EVENTS.slice(0, 3);
  el.innerHTML = upcoming.map(ev => {
    const d = new Date(ev.date);
    const month = d.toLocaleString('default', { month: 'short' });
    const day = d.getDate();
    return `
      <div class="dash-event-item">
        <div class="dash-event-dot"></div>
        <div>
          <p class="dash-event-title">${ev.title}</p>
          <p class="dash-event-meta">${month} ${day} · ${ev.time}</p>
        </div>
      </div>`;
  }).join('');
}

function renderAnnouncements() {
  const el = document.getElementById('announcements-list');
  if (!el) return;
  el.innerHTML = ANNOUNCEMENTS.slice(0, 3).map(a => `
    <div class="announce-item">
      ${a.urgent ? '<span class="announce-urgent">URGENT</span>' : ''}
      <p class="announce-text">${a.text}</p>
      <p class="announce-date">${a.date}</p>
    </div>`).join('');
}

function renderTrending() {
  const el = document.getElementById('trending-list');
  if (!el) return;
  const top = [...RESOURCES].sort((a, b) => b.reviews - a.reviews).slice(0, 3);
  el.innerHTML = top.map((r, i) => `
    <div class="dash-event-item" style="cursor:pointer" onclick="openResourceModal(${r.id})">
      <div style="width:24px;height:24px;border-radius:8px;background:rgba(249,115,22,.1);color:#EA580C;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0">${i + 1}</div>
      <div>
        <p class="dash-event-title">${r.name}</p>
        <p class="dash-event-meta">⭐ ${r.rating} · ${r.reviews} reviews</p>
      </div>
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════════
   CAROUSEL
═══════════════════════════════════════════════════════ */
function initCarousel() {
  const featured = RESOURCES.filter(r => r.featured);
  const track = document.getElementById('carousel-track');
  const dotsEl = document.getElementById('carousel-dots');
  if (!track || !dotsEl) return;
  carouselTotal = featured.length;

  track.innerHTML = featured.map(r => `
    <div class="carousel-slide" role="listitem" aria-label="${r.name}">
      ${typeof renderFeaturedBadge === 'function' ? `<div class="carousel-featured-badge">${renderFeaturedBadge()}</div>` : ''}
      <img src="${r.image}" alt="${r.name}" loading="lazy" />
      <div class="carousel-overlay">
        <div class="carousel-content">
          <span class="carousel-cat">${r.category}</span>
          <h3 class="carousel-title">${r.name}</h3>
          ${r.story ? `<p class="carousel-story">${r.story}</p>` : ''}
          <button class="btn-carousel-detail" onclick="openResourceModal(${r.id})">
            View Details
            <span data-lucide="arrow-right" class="w-4 h-4"></span>
          </button>
        </div>
      </div>
    </div>`).join('');

  dotsEl.innerHTML = featured.map((_, i) => `
    <button class="carousel-dot ${i === 0 ? 'active' : ''}"
      onclick="goToSlide(${i})" role="tab"
      aria-label="Slide ${i + 1}" aria-selected="${i === 0}"></button>`).join('');

  lucide.createIcons();
  startCarouselAuto();

  // Touch/swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? carouselNext() : carouselPrev();
  });
}

function goToSlide(i) {
  carouselIndex = i;
  document.getElementById('carousel-track').style.transform = `translateX(-${i * 100}%)`;
  document.querySelectorAll('.carousel-dot').forEach((d, idx) => {
    d.classList.toggle('active', idx === i);
    d.setAttribute('aria-selected', String(idx === i));
    // Restart fill animation on newly active dot
    if (idx === i) {
      d.classList.remove('active');
      void d.offsetWidth;
      d.classList.add('active');
    }
  });
  restartCarouselAuto();
}

function carouselNext() { goToSlide((carouselIndex + 1) % carouselTotal); }
function carouselPrev() { goToSlide((carouselIndex - 1 + carouselTotal) % carouselTotal); }

function startCarouselAuto() {
  carouselTimer = setInterval(carouselNext, 5000);
}
function restartCarouselAuto() {
  clearInterval(carouselTimer);
  startCarouselAuto();
}

/* ═══════════════════════════════════════════════════════
   RESOURCE DIRECTORY
═══════════════════════════════════════════════════════ */
function initDirectory() {
  filteredResources = [...RESOURCES];
  renderGrid();
}

function applyFilters() {
  const q = (document.getElementById('dir-search')?.value || '').trim().toLowerCase();
  const category = document.getElementById('filter-category')?.value || '';
  const cost = document.getElementById('filter-cost')?.value || '';
  const age = document.getElementById('filter-age')?.value || '';
  const availability = document.getElementById('filter-availability')?.value || '';
  const sort = document.getElementById('filter-sort')?.value || 'rating';

  filteredResources = RESOURCES.filter(r => {
    const matchQ = !q || r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q));
    const matchCat = !category || r.category === category;
    const matchCost = !cost || r.cost === cost;
    const matchAge = !age || r.ageGroup === age || r.ageGroup === 'all';
    const matchAv = !availability || r.availability === availability || r.availability === 'always';
    return matchQ && matchCat && matchCost && matchAge && matchAv;
  });

  // Sort
  filteredResources.sort((a, b) => {
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'reviews') return b.reviews - a.reviews;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  updateResultCount();
  updateActiveFilters(category, cost, age, availability);

  if (currentView === 'grid') renderGrid();
  else if (currentView === 'list') renderList();
  else if (currentView === 'map') updateMapMarkers();
}

function clearFilters() {
  const ds = document.getElementById('dir-search'); if (ds) ds.value = '';
  const hs = document.getElementById('hero-search'); if (hs) hs.value = '';
  const ov = document.getElementById('hero-typing-overlay'); if (ov) ov.style.visibility = 'visible';
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-cost').value = '';
  document.getElementById('filter-age').value = '';
  document.getElementById('filter-availability').value = '';
  document.getElementById('filter-sort').value = 'rating';
  applyFilters();
  showToast('Filters cleared');
}

function updateResultCount() {
  const el = document.getElementById('result-count');
  if (el) el.textContent = `${filteredResources.length} resource${filteredResources.length !== 1 ? 's' : ''} found`;
  const noResults = document.getElementById('no-results');
  if (noResults) noResults.classList.toggle('hidden', filteredResources.length > 0);
}

function updateActiveFilters(category, cost, age, availability) {
  const el = document.getElementById('active-filters');
  if (!el) return;
  const chips = [];
  if (category) chips.push({ label: `Category: ${category}`, field: 'filter-category' });
  if (cost)     chips.push({ label: `Cost: ${cost}`,         field: 'filter-cost' });
  if (age)      chips.push({ label: `Age: ${age}`,           field: 'filter-age' });
  if (availability) chips.push({ label: `Availability: ${availability}`, field: 'filter-availability' });

  el.classList.toggle('hidden', chips.length === 0);
  el.innerHTML = chips.map(c => `
    <span class="active-chip">
      ${c.label}
      <button onclick="clearFilterChip('${c.field}')" aria-label="Remove filter ${c.label}" style="display:flex;align-items:center">
        <span data-lucide="x" class="w-3 h-3"></span>
      </button>
    </span>`).join('');
  lucide.createIcons();
}

function clearFilterChip(field) {
  const el = document.getElementById(field);
  if (el) el.value = '';
  applyFilters();
}

function setView(view) {
  currentView = view;
  const grid = document.getElementById('resource-grid');
  const list = document.getElementById('resource-list');
  const map = document.getElementById('map-container');

  grid.classList.add('hidden');
  list.classList.add('hidden');
  map.classList.add('hidden');

  document.getElementById('view-grid-btn').classList.remove('active');
  document.getElementById('view-list-btn').classList.remove('active');
  document.getElementById('view-map-btn').classList.remove('active');

  document.getElementById(`view-${view}-btn`).classList.add('active');
  document.getElementById(`view-${view}-btn`).setAttribute('aria-pressed', 'true');

  // Pass instant=true so cards appear immediately without AOS/animation delay
  if (view === 'grid') { grid.classList.remove('hidden'); renderGrid(true); }
  if (view === 'list') { list.classList.remove('hidden'); renderList(true); }
  if (view === 'map') { map.classList.remove('hidden'); initMap(); }
}

/* ── Grid Render ── */
function renderGrid(instant) {
  const grid = document.getElementById('resource-grid');
  if (!grid) return;

  if (!filteredResources.length) { grid.innerHTML = ''; return; }

  grid.innerHTML = filteredResources.map((r, i) => {
    const a11y = r.accessibility || {};
    const busy = r.busyTimes || {};
    const a11yIcons = [
      a11y.wheelchair  ? `<span class="a11y-icon a11y-icon-yes" title="Wheelchair accessible">♿</span>` : `<span class="a11y-icon a11y-icon-no" title="Not wheelchair accessible">♿</span>`,
      a11y.childFriendly ? `<span class="a11y-icon a11y-icon-yes" title="Child friendly">👶</span>` : '',
      a11y.petFriendly   ? `<span class="a11y-icon a11y-icon-yes" title="Pet friendly">🐾</span>` : '',
      a11y.transportation ? `<span class="a11y-icon a11y-icon-yes" title="Transit/transport access">🚌</span>` : ''
    ].filter(Boolean).join('');
    const langBadge = a11y.languages && a11y.languages.length > 1
      ? `<span class="a11y-lang-badge" title="Languages: ${a11y.languages.join(', ')}">🌐 ${a11y.languages.length} languages</span>` : '';
    const busyBadge = busy.bestTime
      ? `<div class="busy-time-badge"><span class="busy-clock">⏰</span><span>Best time: <strong>${busy.bestTime}</strong></span></div>` : '';

    const _cardStyle = instant ? 'animation:none;opacity:1;transform:none;' : `animation-delay:${i * 40}ms`;
    return `
    <article class="resource-card" role="listitem" style="${_cardStyle}" aria-label="${r.name}">
      <div class="card-img">
        ${r.image
          ? `<img src="${r.image}" alt="${r.name}" loading="lazy" />`
          : `<div class="card-img-placeholder ${catBg(r.category)}">${catEmoji(r.category)}</div>`}
        <span class="card-cat-badge ${catClass(r.category)}">${r.category}</span>
      </div>
      <div class="card-body">
        <div class="card-verified-wrap">
          <h3 class="card-name" style="margin:0">${r.name}</h3>
          ${!r.userSubmitted && typeof renderVerifiedBadge === 'function' ? renderVerifiedBadge() : ''}
        </div>
        <p class="card-desc">${r.description}</p>
        <div class="card-meta">
          <div class="card-meta-row">
            <span data-lucide="map-pin" class="w-3.5 h-3.5"></span>
            ${r.address}
          </div>
          <div class="card-meta-row">
            <span data-lucide="clock" class="w-3.5 h-3.5"></span>
            ${r.hours}
          </div>
        </div>
        ${busyBadge}
        <div class="card-a11y-row">
          <div class="a11y-icons-row">${a11yIcons}</div>
          ${langBadge}
        </div>
        <div class="card-rating">
          <span class="stars">${renderStars(r.rating)}</span>
          <span class="rating-num">${r.rating}</span>
          <span class="rating-count">(${r.reviews})</span>
        </div>
        <div class="card-tags">${renderTags(r.tags)}</div>
      </div>
      <div class="card-footer">
        <button class="btn-card-primary" onclick="openResourceModal(${r.id})">View Details</button>
        <a href="${r.website}" target="_blank" rel="noopener noreferrer" class="btn-card-secondary" title="Visit website" aria-label="Visit ${r.name} website">
          <span data-lucide="external-link" class="w-4 h-4"></span>
        </a>
        <button class="btn-card-secondary" onclick="shareResource(${r.id})" title="Share resource" aria-label="Share ${r.name}">
          <span data-lucide="share-2" class="w-4 h-4"></span>
        </button>
        <button class="btn-favorite ${favorites.has('r-'+r.id) ? 'favorited' : ''}" onclick="toggleFavorite('r-${r.id}',event)" title="${favorites.has('r-'+r.id) ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Favorite ${r.name}" aria-pressed="${favorites.has('r-'+r.id)}">
          <span data-lucide="heart" class="w-4 h-4"></span>
        </button>
      </div>
    </article>`;
  }).join('');

  lucide.createIcons();
  if (typeof AOS !== 'undefined') AOS.refresh();
}

/* ── List Render ── */
function renderList(instant) {
  const list = document.getElementById('resource-list');
  if (!list || !filteredResources.length) { if (list) list.innerHTML = ''; return; }

  list.innerHTML = filteredResources.map((r, i) => {
    const _listStyle = instant ? 'animation:none;opacity:1;transform:none;' : `animation-delay:${i * 30}ms`;
    return `<article class="resource-list-item" role="listitem" style="${_listStyle}">
      <div class="list-img">
        ${r.image
          ? `<img src="${r.image}" alt="${r.name}" loading="lazy" />`
          : `<div style="width:100%;height:100%;background:${catBgHex(r.category)};display:flex;align-items:center;justify-content:center;font-size:28px">${catEmoji(r.category)}</div>`}
      </div>
      <div class="list-body">
        <h3 class="list-name">${r.name}</h3>
        <p class="list-desc">${r.description}</p>
        <div class="list-meta">
          <span class="list-meta-item"><span data-lucide="tag" class="w-3 h-3"></span> ${r.category}</span>
          <span class="list-meta-item"><span data-lucide="map-pin" class="w-3 h-3"></span> ${r.address.split(',')[0]}</span>
          <span class="list-meta-item">⭐ ${r.rating} (${r.reviews})</span>
          <span class="list-meta-item"><span data-lucide="clock" class="w-3 h-3"></span> ${r.hours}</span>
        </div>
        <div class="card-tags" style="margin-top:8px">${renderTags(r.tags)}</div>
      </div>
      <div class="list-actions">
        <button class="btn-card-primary" onclick="openResourceModal(${r.id})" style="white-space:nowrap;padding:10px 16px">View</button>
      </div>
    </article>`;
  }).join('');

  lucide.createIcons();
  if (typeof AOS !== 'undefined') AOS.refresh();
}

/* ═══════════════════════════════════════════════════════
   MAP VIEW (Leaflet)
═══════════════════════════════════════════════════════ */
function initMap() {
  if (mapInstance) { updateMapMarkers(); return; }

  mapInstance = L.map('resource-map', {
    center: [38.4496, -78.8689],
    zoom: 13,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(mapInstance);

  updateMapMarkers();
}

function updateMapMarkers() {
  if (!mapInstance) return;
  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  filteredResources.forEach(r => {
    const catColor = catHex(r.category);
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:${catColor};border:3px solid white;
        box-shadow:0 3px 12px rgba(0,0,0,.3);
        display:flex;align-items:center;justify-content:center;
        font-size:16px;transform:rotate(-45deg);cursor:pointer;
      "><span style="transform:rotate(45deg)">${catEmoji(r.category)}</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    const marker = L.marker([r.lat, r.lng], { icon })
      .addTo(mapInstance)
      .bindPopup(`
        <div class="map-popup">
          <h3>${r.name}</h3>
          <span class="cat-badge ${catClass(r.category)}">${r.category}</span>
          <p>⭐ ${r.rating} · ${r.reviews} reviews</p>
          <p>📍 ${r.address}</p>
          <p>🕐 ${r.hours}</p>
          <a href="#" onclick="openResourceModal(${r.id}); return false;">View Full Details →</a>
        </div>
      `, { maxWidth: 260 });

    mapMarkers.push(marker);
  });
}

/* ═══════════════════════════════════════════════════════
   RESOURCE DETAIL MODAL
═══════════════════════════════════════════════════════ */
function openResourceModal(id) {
  const r = RESOURCES.find(x => x.id === id);
  if (!r) return;

  // Merge seeded reviews with user-submitted reviews
  const seeded = (SEEDED_REVIEWS[id] || []).map((rv, i) => ({ ...rv, id: rv.id || `${id}-seed-${i}` }));
  const userReviews = pendingReviews[id] || [];
  const reviews = [...seeded, ...userReviews];
  const allRatings = reviews.map(rv => rv.rating);
  const avgRating = allRatings.length
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
    : r.rating;
  const totalReviews = r.reviews + userReviews.length;

  document.getElementById('modal-content').innerHTML = `
    <img class="modal-img" src="${r.image || ''}" alt="${r.name}" ${!r.image ? 'style="display:none"' : ''} />
    <div class="modal-body">
      <span class="modal-cat ${catClass(r.category)}">${r.category}</span>
      <h2 class="modal-title" id="modal-title">${r.name}</h2>

      <div class="modal-meta">
        <div class="modal-meta-row"><span data-lucide="map-pin" class="w-4 h-4"></span>${r.address}</div>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}"
          target="_blank" rel="noopener noreferrer"
          class="get-directions-link"
          aria-label="Get directions to ${r.name}">
          <span data-lucide="navigation" class="w-4 h-4"></span>
          Get Directions →
        </a>
        <div class="modal-meta-row"><span data-lucide="phone" class="w-4 h-4"></span>${r.phone}</div>
        <div class="modal-meta-row"><span data-lucide="mail" class="w-4 h-4"></span>${r.email}</div>
        <div class="modal-meta-row"><span data-lucide="clock" class="w-4 h-4"></span>${r.hours}</div>
        <div class="modal-meta-row card-rating">
          <span class="stars">${renderStars(parseFloat(avgRating))}</span>
          <span class="rating-num">${avgRating}</span>
          <span class="rating-count">(${totalReviews} reviews)</span>
        </div>
      </div>

      ${(function() {
        const coords = VERIFIED_COORDS && VERIFIED_COORDS[r.id];
        if (!coords) return '';
        return `<div class="mini-map-container" id="resource-mini-map"></div>`;
      })()}

      <p class="modal-desc">${r.description}</p>

      ${r.busyTimes ? `
      <div class="modal-busy-section">
        <h4 class="modal-section-label"><span>⏰</span> Visit Times</h4>
        <div class="modal-busy-grid">
          <div class="modal-busy-card modal-busy-peak">
            <div class="modal-busy-icon">🔴</div>
            <div><div class="modal-busy-label">Usually Busy</div><div class="modal-busy-val">${r.busyTimes.peak}</div></div>
          </div>
          <div class="modal-busy-card modal-busy-best">
            <div class="modal-busy-icon">🟢</div>
            <div><div class="modal-busy-label">Best Time to Visit</div><div class="modal-busy-val">${r.busyTimes.bestTime}</div></div>
          </div>
        </div>
      </div>` : ''}

      ${r.accessibility ? `
      <div class="modal-a11y-section">
        <h4 class="modal-section-label"><span>♿</span> Accessibility</h4>
        <div class="modal-a11y-grid">
          <div class="modal-a11y-item ${r.accessibility.wheelchair ? 'a11y-yes' : 'a11y-no'}">
            <span class="modal-a11y-emoji">♿</span>
            <span>${r.accessibility.wheelchair ? 'Wheelchair Accessible' : 'Limited Wheelchair Access'}</span>
          </div>
          <div class="modal-a11y-item ${r.accessibility.childFriendly ? 'a11y-yes' : 'a11y-neutral'}">
            <span class="modal-a11y-emoji">👶</span>
            <span>${r.accessibility.childFriendly ? 'Child Friendly' : 'Adults Only'}</span>
          </div>
          <div class="modal-a11y-item ${r.accessibility.transportation ? 'a11y-yes' : 'a11y-neutral'}">
            <span class="modal-a11y-emoji">🚌</span>
            <span>${r.accessibility.transportation ? 'Transit / Ride Access' : 'Self-Transport Needed'}</span>
          </div>
          <div class="modal-a11y-item ${r.accessibility.petFriendly ? 'a11y-yes' : 'a11y-neutral'}">
            <span class="modal-a11y-emoji">🐾</span>
            <span>${r.accessibility.petFriendly ? 'Pet Friendly' : 'No Pets'}</span>
          </div>
        </div>
        ${r.accessibility.languages && r.accessibility.languages.length ? `
        <div class="modal-a11y-languages">
          <span class="modal-a11y-lang-label">🌐 Languages Supported:</span>
          <div class="modal-a11y-lang-chips">
            ${r.accessibility.languages.map(l => `<span class="lang-chip">${l}</span>`).join('')}
          </div>
        </div>` : ''}
      </div>` : ''}

      <div class="modal-tags">${renderTags(r.tags)}</div>

      <div class="modal-actions">
        <a href="${r.website}" target="_blank" rel="noopener" class="btn-modal-primary">
          Visit Website
        </a>
        <button onclick="shareResource(${r.id})" class="btn-modal-secondary">
          Share Resource
        </button>
      </div>

      <!-- Reviews -->
      <div class="modal-reviews">
        <h4>Community Reviews</h4>
        ${currentUser
          ? `<div class="review-form" id="review-form-${id}">
              <div class="star-picker" role="group" aria-label="Rate this resource" id="star-picker-${id}">
                ${[1,2,3,4,5].map(n =>
                  `<button class="star-btn" data-val="${n}" onclick="setStarRating(${id}, ${n})" aria-label="${n} star"
                    aria-pressed="false">★</button>`
                ).join('')}
              </div>
              <input class="review-input" type="text" id="review-text-${id}" placeholder="Write a short review..." maxlength="200" aria-label="Review text" />
              <button class="btn-review-submit" onclick="submitReview(${id})">Post Review</button>
            </div>`
          : `<div class="review-login-prompt">
              <span data-lucide="lock" class="w-4 h-4" style="display:inline-flex;vertical-align:middle;margin-right:6px;color:var(--teal)"></span>
              <span style="font-size:13px;color:var(--navy-700)"><a href="#" onclick="closeResourceModal();openLoginModal();return false;" style="color:var(--teal);font-weight:700;text-decoration:underline">Sign in</a> to write a review</span>
            </div>`
        }
        <div class="review-list" id="review-list-${id}">
          ${reviews.length === 0
            ? '<p style="font-size:13px;color:#94A3B8;text-align:center;padding:16px 0">No reviews yet — be the first!</p>'
            : (() => {
                const EMOJIS = ['👍','❤️','😂','😮','😢','🔥'];
                const visibleCount = currentUser ? reviews.length : Math.min(2, reviews.length);
                const hiddenCount = reviews.length - visibleCount;
                const visibleHtml = reviews.slice(0, visibleCount).map((rv, idx) => {
                  const authorName = typeof rv.author === 'object' ? (rv.author.displayName || rv.author.username) : (rv.author || 'Anonymous');
                  const reviewId = rv.id || `${id}-${idx}`;
                  const avatarColor = getAvatarColor(authorName);
                  const initials = getInitials(authorName);
                  const timeStr = rv.date ? relativeTime(rv.date) : '';
                  const reactionBarHtml = `<div class="emoji-reaction-bar" data-review-id="${reviewId}">${EMOJIS.map(em => {
                    const mapKey = `${reviewId}-${em}`;
                    const count = reactionMap.get(mapKey) || 0;
                    const isActive = reactionMap.get(mapKey + '-active') || false;
                    return `<button class="emoji-reaction-btn${isActive ? ' reaction-active' : ''}" data-emoji="${em}" title="React with ${em}" aria-label="React with ${em}">
                      <span class="reaction-emoji">${em}</span>${count > 0 ? `<span class="reaction-count">${count}</span>` : `<span class="reaction-count" style="display:none">0</span>`}
                    </button>`;
                  }).join('')}</div>`;
                  return `<div class="review-item">
                    <div class="review-avatar-row">
                      <div class="review-avatar" style="background:${avatarColor}">${initials}</div>
                      <div class="review-identity">
                        <div class="review-name-ts">
                          <span class="reviewer-name-b">${authorName}</span>
                          ${timeStr ? `<span class="review-timestamp">${timeStr}</span>` : ''}
                        </div>
                        <span class="review-stars" style="font-size:13px">${'★'.repeat(rv.rating)}${'☆'.repeat(5 - rv.rating)}</span>
                      </div>
                      ${isAdmin() ? `<button onclick="deleteReview(${id},${idx})" class="btn-admin-delete-review" title="Delete review (admin)" aria-label="Delete review" style="margin-left:auto"><span data-lucide="trash-2" class="w-3.5 h-3.5"></span></button>` : ''}
                    </div>
                    <p class="review-text" style="margin:0 0 4px">${rv.text}</p>
                    ${reactionBarHtml}
                  </div>`;
                }).join('');
                const gateHtml = hiddenCount > 0 && !currentUser
                  ? `<div class="review-blur-gate">
                      <div class="review-blur-preview">${reviews.slice(visibleCount).map(rv => {
                        const authorName = typeof rv.author === 'object' ? (rv.author.displayName || rv.author.username) : (rv.author || 'Anonymous');
                        return `<div class="review-item review-blurred"><div class="review-header"><span class="reviewer-name">${authorName}</span><span class="review-stars">${'★'.repeat(rv.rating)}${'☆'.repeat(5-rv.rating)}</span></div><p class="review-text">${rv.text}</p></div>`;
                      }).join('')}</div>
                      <div class="review-gate-overlay">
                        <span data-lucide="lock" class="w-5 h-5"></span>
                        <p style="font-weight:700;color:var(--navy);margin:6px 0 4px">${hiddenCount} more review${hiddenCount > 1 ? 's' : ''} hidden</p>
                        <p style="font-size:12px;color:var(--navy-600);margin:0 0 12px">Sign in to read all community reviews</p>
                        <button onclick="closeResourceModal();openLoginModal();" class="btn-card-primary" style="padding:9px 20px;font-size:13px">Sign In to View</button>
                      </div>
                    </div>`
                  : '';
                return visibleHtml + gateHtml;
              })()
          }
        </div>
      </div>

      <!-- Similar Resources -->
      ${(function() {
        const sameCategory = RESOURCES.filter(x => x.id !== id && x.category === r.category);
        let similar = sameCategory.slice(0, 3);
        if (similar.length < 3) {
          const others = RESOURCES.filter(x => x.id !== id && x.category !== r.category);
          const needed = 3 - similar.length;
          similar = similar.concat(others.slice(0, needed));
        }
        if (!similar.length) return '';
        return `<div class="similar-resources-section">
          <h4 class="similar-resources-title" data-i18n="similar.title">Similar Resources</h4>
          <p class="similar-resources-subtitle" data-i18n="similar.subtitle">Other resources you might find helpful</p>
          <div class="similar-resources-row" id="similar-resources-row">
            ${similar.map(sr => `
              <div class="similar-resource-card" onclick="openSimilarResource(${sr.id})" role="button" tabindex="0" aria-label="View ${sr.name}">
                ${sr.image
                  ? `<img class="similar-thumb" src="${sr.image}" alt="${sr.name}" loading="lazy" />`
                  : `<div class="similar-thumb-placeholder ${catBg(sr.category)}">${catEmoji(sr.category)}</div>`}
                <div class="similar-info">
                  <p class="similar-name">${sr.name}</p>
                  <span class="similar-cat-pill">${sr.category}</span>
                  <div class="similar-loc">
                    <span data-lucide="map-pin" style="width:12px;height:12px;flex-shrink:0"></span>
                    <span>${sr.address.split(',')[0]}</span>
                  </div>
                </div>
              </div>`).join('')}
          </div>
        </div>`;
      })()}
    </div>
  `;

  document.getElementById('resource-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();

  // Attach emoji reaction listeners
  document.querySelectorAll('.emoji-reaction-bar').forEach(bar => {
    const reviewId = bar.dataset.reviewId;
    bar.querySelectorAll('.emoji-reaction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji;
        const mapKey = `${reviewId}-${emoji}`;
        const activeKey = mapKey + '-active';
        const isActive = reactionMap.get(activeKey) || false;
        let count = reactionMap.get(mapKey) || 0;
        if (isActive) {
          count = Math.max(0, count - 1);
          reactionMap.set(mapKey, count);
          reactionMap.set(activeKey, false);
          btn.classList.remove('reaction-active');
        } else {
          count += 1;
          reactionMap.set(mapKey, count);
          reactionMap.set(activeKey, true);
          btn.classList.add('reaction-active');
          const emojiEl = btn.querySelector('.reaction-emoji');
          if (emojiEl) {
            emojiEl.classList.remove('reaction-pop');
            void emojiEl.offsetWidth;
            emojiEl.classList.add('reaction-pop');
            setTimeout(() => emojiEl.classList.remove('reaction-pop'), 600);
          }
        }
        const countEl = btn.querySelector('.reaction-count');
        if (countEl) {
          countEl.textContent = count;
          countEl.style.display = count > 0 ? '' : 'none';
        }
      });
    });
  });

  // Init mini map after modal is painted
  const coords = typeof VERIFIED_COORDS !== 'undefined' && VERIFIED_COORDS[r.id];
  if (coords) {
    setTimeout(() => {
      if (window._miniMap) { window._miniMap.remove(); window._miniMap = null; }
      const mapEl = document.getElementById('resource-mini-map');
      if (!mapEl) return;
      const catColor = catHex(r.category);
      window._miniMap = L.map(mapEl, { scrollWheelZoom: false, zoom: 15, center: [coords.lat, coords.lng] });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19
      }).addTo(window._miniMap);
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;border-radius:50%;background:${catColor};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
        iconSize: [24, 24], iconAnchor: [12, 12]
      });
      L.marker([coords.lat, coords.lng], { icon }).addTo(window._miniMap);
      window._miniMap.invalidateSize();
    }, 150);
  }
}

let currentStarRatings = {};
function setStarRating(resourceId, val) {
  currentStarRatings[resourceId] = val;
  const picker = document.getElementById(`star-picker-${resourceId}`);
  if (!picker) return;
  picker.querySelectorAll('.star-btn').forEach(btn => {
    const v = parseInt(btn.dataset.val);
    btn.classList.toggle('active', v <= val);
    btn.setAttribute('aria-pressed', String(v <= val));
  });
}

function submitReview(resourceId) {
  if (!currentUser) {
    showToast('Please sign in to post a review');
    closeResourceModal();
    openLoginModal();
    return;
  }
  const rating = currentStarRatings[resourceId];
  const textEl = document.getElementById(`review-text-${resourceId}`);
  const text = textEl?.value?.trim();

  if (!rating) { showToast('Please select a star rating'); return; }
  if (!text) { showToast('Please write a review'); return; }

  if (!pendingReviews[resourceId]) pendingReviews[resourceId] = [];
  pendingReviews[resourceId].push({
    id: `${resourceId}-user-${Date.now()}`,
    author: currentUser.displayName || currentUser.username,
    rating,
    text,
    date: new Date().toISOString().split('T')[0]
  });

  delete currentStarRatings[resourceId];
  showToast('Review submitted — thank you!');
  openResourceModal(resourceId); // re-render
}

function closeResourceModal() {
  document.getElementById('resource-modal').classList.add('hidden');
  document.body.style.overflow = '';
  if (window._miniMap) { window._miniMap.remove(); window._miniMap = null; }
}

function openSimilarResource(newId) {
  closeResourceModal();
  setTimeout(() => openResourceModal(newId), 300);
}

function closeModal(e) {
  if (e.target === document.getElementById('resource-modal')) closeResourceModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeResourceModal();
    closeLoginModal();
    closeAR();
    const storyModal = document.getElementById('story-modal');
    if (storyModal && !storyModal.classList.contains('hidden')) {
      storyModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
});

function shareResource(id) {
  const r = RESOURCES.find(x => x.id === id);
  if (!r) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(`${window.location.href.split('#')[0]}#resource-${id}`)
      .then(() => showToast(`Link copied: ${r.name}`))
      .catch(() => showToast(`Share: ${r.name} — ${r.phone}`));
  } else {
    showToast(`${r.name} — ${r.phone}`);
  }
}

/* ═══════════════════════════════════════════════════════
   CALENDAR
═══════════════════════════════════════════════════════ */
function initCalendar() {
  renderEvents();
}

function filterEvents(type) {
  currentEventFilter = type;
  document.querySelectorAll('.cal-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  renderEvents();
}

function setCalView(view) {
  currentCalView = view;
  document.getElementById('cal-list-btn').classList.toggle('active', view === 'list');
  document.getElementById('cal-grid-btn').classList.toggle('active', view === 'grid');
  const calBtn = document.getElementById('cal-cal-btn');
  if (calBtn) calBtn.classList.toggle('active', view === 'calendar');
  document.getElementById('cal-list-btn').setAttribute('aria-pressed', String(view === 'list'));
  document.getElementById('cal-grid-btn').setAttribute('aria-pressed', String(view === 'grid'));
  if (calBtn) calBtn.setAttribute('aria-pressed', String(view === 'calendar'));

  const container = document.getElementById('events-container');
  const monthView = document.getElementById('cal-month-view');

  if (view === 'calendar') {
    if (container) container.classList.add('hidden');
    if (monthView) { monthView.classList.remove('hidden'); renderCalendarView(); }
  } else {
    if (container) { container.classList.remove('hidden'); container.className = view === 'grid' ? 'events-grid' : 'events-list'; }
    if (monthView) monthView.classList.add('hidden');
    renderEvents(true);
  }
}

/* ── Calendar Month View ── */
let calViewYear  = new Date().getFullYear();
let calViewMonth = new Date().getMonth(); // 0-indexed
let calSelectedDay = null;

function renderCalendarView() {
  const today = new Date();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const titleEl = document.getElementById('cal-month-title');
  const gridEl  = document.getElementById('cal-days-grid');
  if (!titleEl || !gridEl) return;

  // Fade title
  titleEl.classList.add('fading');
  setTimeout(() => {
    titleEl.textContent = monthNames[calViewMonth] + ' ' + calViewYear;
    titleEl.classList.remove('fading');
  }, 150);

  const firstDay = new Date(calViewYear, calViewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calViewYear, calViewMonth, 0).getDate();

  // Build day cells
  const cells = [];
  // Leading days from prev month
  for (let d = firstDay - 1; d >= 0; d--) cells.push({ day: daysInPrevMonth - d, currentMonth: false, month: calViewMonth - 1 });
  // Current month
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, currentMonth: true, month: calViewMonth });
  // Trailing days to fill grid
  const remainder = 42 - cells.length;
  for (let d = 1; d <= remainder; d++) cells.push({ day: d, currentMonth: false, month: calViewMonth + 1 });

  const TYPE_COLORS = { community: '#3B82F6', workshop: '#8B5CF6', volunteer: '#10B981', health: '#EF4444', education: '#F97316' };

  gridEl.innerHTML = cells.map((c, idx) => {
    const isToday = c.currentMonth && c.day === today.getDate() && calViewMonth === today.getMonth() && calViewYear === today.getFullYear();
    const dayEvents = c.currentMonth ? (EVENTS || []).filter(e => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getFullYear() === calViewYear && d.getMonth() === calViewMonth && d.getDate() === c.day;
    }) : [];
    const isSelected = c.currentMonth && calSelectedDay === c.day;

    let dotsHtml = '';
    if (dayEvents.length >= 3) {
      dotsHtml = `<div class="cal-event-count">+${dayEvents.length}</div>`;
    } else {
      dotsHtml = dayEvents.map((ev, di) => `<div class="cal-event-dot" style="background:${TYPE_COLORS[ev.type] || '#64748B'};animation-delay:${di*50}ms"></div>`).join('');
    }

    return `<div class="cal-day-cell${c.currentMonth ? '' : ' other-month'}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${dayEvents.length ? ' has-events' : ''}"
      onclick="${c.currentMonth && dayEvents.length ? `calDayClick(${c.day})` : ''}"
      role="gridcell" aria-label="${c.currentMonth ? monthNames[calViewMonth] + ' ' + c.day + (dayEvents.length ? ', ' + dayEvents.length + ' event(s)' : '') : ''}"
      style="animation-delay:${idx * 8}ms">
      <div class="cal-day-num">${c.day}</div>
      <div class="cal-event-dots">${dotsHtml}</div>
    </div>`;
  }).join('');

  lucide.createIcons();
  if (calSelectedDay) showCalDayEvents(calSelectedDay);
}

function calDayClick(day) {
  calSelectedDay = day;
  // Re-render to update selected state
  const cells = document.querySelectorAll('.cal-day-cell:not(.other-month)');
  cells.forEach((cell, i) => cell.classList.toggle('selected', i + 1 === day));
  showCalDayEvents(day);
}

function showCalDayEvents(day) {
  const el = document.getElementById('cal-day-events');
  if (!el) return;
  const dayEvents = (EVENTS || []).filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d.getFullYear() === calViewYear && d.getMonth() === calViewMonth && d.getDate() === day;
  });
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  if (!dayEvents.length) { el.classList.add('hidden'); return; }
  const TYPE_COLORS = { community: '#3B82F6', workshop: '#8B5CF6', volunteer: '#10B981', health: '#EF4444', education: '#F97316' };
  el.classList.remove('hidden');
  el.innerHTML = `<div class="cal-day-events-title">${monthNames[calViewMonth]} ${day}</div>` +
    dayEvents.map(ev => `
      <div class="cal-day-event-item" onclick="registerEvent(${ev.id})" role="button" aria-label="${ev.title}">
        <div class="cal-day-event-dot" style="background:${TYPE_COLORS[ev.type] || '#64748B'}"></div>
        <div>
          <div class="cal-day-event-title">${ev.title}</div>
          <div class="cal-day-event-meta">${ev.time || ''} · <span style="text-transform:capitalize">${ev.type}</span>${ev.free ? ' · Free' : ''}</div>
        </div>
      </div>`).join('');
}

function calMonthPrev() {
  calViewMonth--;
  if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
  calSelectedDay = null;
  document.getElementById('cal-day-events').classList.add('hidden');
  renderCalendarView();
}
function calMonthNext() {
  calViewMonth++;
  if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
  calSelectedDay = null;
  document.getElementById('cal-day-events').classList.add('hidden');
  renderCalendarView();
}

function renderEvents(instant) {
  const container = document.getElementById('events-container');
  if (!container) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only show upcoming events (today and future)
  let filtered = (currentEventFilter === 'all'
    ? EVENTS
    : EVENTS.filter(e => e.type === currentEventFilter))
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Inject live feed header above events-container if not already there
  let liveHeader = document.getElementById('events-live-header');
  if (!liveHeader) {
    liveHeader = document.createElement('div');
    liveHeader.id = 'events-live-header';
    liveHeader.className = 'events-live-header';
    container.parentNode.insertBefore(liveHeader, container);
  }
  const updateTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  liveHeader.innerHTML = `
    <div class="events-live-indicator">
      <span class="events-live-dot"></span>
      <span class="events-live-text">Live Feed</span>
    </div>
    <span class="events-live-count">${filtered.length} upcoming event${filtered.length !== 1 ? 's' : ''}</span>
    <span class="events-live-updated">Updated ${updateTime}</span>`;

  container.className = currentCalView === 'grid' ? 'events-grid' : 'events-list';

  if (!filtered.length) {
    container.innerHTML = '<p style="text-align:center;color:#94A3B8;padding:40px">No upcoming events match this filter.</p>';
    return;
  }

  container.innerHTML = filtered.map((ev, i) => {
    const d = new Date(ev.date);
    const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = d.getDate();
    const typeClass = eventTypeClass(ev.type);
    const animStyle = instant ? 'animation:none;opacity:1;transform:none;' : `animation-delay:${i * 50}ms`;
    const isToday = d.toDateString() === new Date().toDateString();
    const isNew = ev.isNew;
    return `
      <article class="event-card ${isNew ? 'event-card-new' : ''}" role="listitem" style="${animStyle}">
        <div class="event-date-box ${isToday ? 'event-date-today' : ''}" aria-label="${month} ${day}">
          ${isToday ? '<div class="event-today-label">TODAY</div>' : ''}
          <div class="event-month">${month}</div>
          <div class="event-day">${day}</div>
        </div>
        <div class="event-body">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="event-type-badge ${typeClass}">${ev.type}</span>
            ${isNew ? '<span class="event-new-badge">NEW</span>' : ''}
          </div>
          <h3 class="event-title">${ev.title}</h3>
          <p class="event-desc">${ev.description}</p>
          <div class="event-meta">
            <span class="event-meta-item"><span data-lucide="clock" class="w-3 h-3"></span>${ev.time}</span>
            <span class="event-meta-item"><span data-lucide="map-pin" class="w-3 h-3"></span>${ev.location}</span>
            <span class="event-meta-item"><span data-lucide="building-2" class="w-3 h-3"></span>${ev.organization}</span>
          </div>
        </div>
        <div class="event-actions">
          ${(() => { const isReg = getUserRegisteredEvents().some(e => e.id === ev.id); return isReg ? `<button class="btn-unregister" onclick="unregisterEvent(${ev.id})"><span data-lucide="check-circle" class="w-3.5 h-3.5"></span> Registered &nbsp;·&nbsp; Unregister</button>` : `<button class="btn-register" onclick="registerEvent(${ev.id})">Register</button>`; })()}
          ${ev.free ? '<span class="event-free-badge">Free</span>' : ''}
          <button class="btn-favorite ${favorites.has('e-'+ev.id) ? 'favorited' : ''}" onclick="toggleFavorite('e-${ev.id}',event)" title="${favorites.has('e-'+ev.id) ? 'Remove from favorites' : 'Save event'}" aria-label="Favorite ${ev.title}" aria-pressed="${favorites.has('e-'+ev.id)}" style="margin-left:4px">
            <span data-lucide="heart" class="w-4 h-4"></span>
          </button>
        </div>
      </article>`;
  }).join('');

  lucide.createIcons();

  // Auto-refresh live header timestamp every 60s
  if (!window._eventsRefreshTimer) {
    window._eventsRefreshTimer = setInterval(() => {
      const hdr = document.getElementById('events-live-header');
      if (!hdr) return;
      const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const upd = hdr.querySelector('.events-live-updated');
      if (upd) upd.textContent = `Updated ${t}`;
    }, 60000);
  }
}

/* ═══════════════════════════════════════════════════════
   EVENT REGISTRATION — LOGIN GATE + CALENDAR INTEGRATION
═══════════════════════════════════════════════════════ */
function registerEvent(eventId) {
  const ev = EVENTS.find(e => e.id === eventId);
  if (!ev) return;

  // Login gate
  if (!currentUser) {
    window._pendingRegistration = eventId;
    showToast('Sign in to register for events');
    openLoginModal();
    return;
  }

  const userEvents = getUserRegisteredEvents();
  if (userEvents.find(e => e.id === eventId)) {
    showToast('You\'re already registered! Check your account.');
    return;
  }

  userEvents.push({ ...ev, registeredAt: new Date().toISOString() });
  saveUserRegisteredEvents(userEvents);
  showToast(`Registered for: ${ev.title} ✓`);

  // Swap only the register button in-place — no full re-render
  _swapEventButton(eventId, true);

  // Ask about calendar
  setTimeout(() => showCalendarDialog(ev), 500);
}

function _swapEventButton(eventId, registered) {
  // Find the button inside the event-card for this event ID
  const btns = document.querySelectorAll(`[onclick="registerEvent(${eventId})"], [onclick="unregisterEvent(${eventId})"]`);
  btns.forEach(btn => {
    if (registered) {
      btn.className = 'btn-unregister';
      btn.setAttribute('onclick', `unregisterEvent(${eventId})`);
      btn.innerHTML = '<span data-lucide="check-circle" class="w-3.5 h-3.5"></span> Registered &nbsp;·&nbsp; Unregister';
    } else {
      btn.className = 'btn-register';
      btn.setAttribute('onclick', `registerEvent(${eventId})`);
      btn.textContent = 'Register';
    }
    lucide.createIcons({ nodes: [btn] });
  });
}

function getUserRegisteredEvents() {
  if (!currentUser) return [];
  return JSON.parse(localStorage.getItem(`crh_events_${currentUser.username}`) || '[]');
}

function saveUserRegisteredEvents(events) {
  if (!currentUser) return;
  localStorage.setItem(`crh_events_${currentUser.username}`, JSON.stringify(events));
}

function unregisterEvent(eventId) {
  let userEvents = getUserRegisteredEvents();
  userEvents = userEvents.filter(e => e.id !== eventId);
  saveUserRegisteredEvents(userEvents);
  showToast('Unregistered from event');
  _swapEventButton(eventId, false);
  renderAccountDashboard();
}

/* ─── Calendar Integration ─── */
let _calDialogCurrentEv = null;

function showCalendarDialog(ev) {
  const dialog = document.getElementById('calendar-dialog');
  if (!dialog) return;

  _calDialogCurrentEv = ev;

  // Format date for Google Calendar: YYYYMMDD
  const d = new Date(ev.date);
  const dateStr = d.toISOString().replace(/-/g,'').split('T')[0];
  const startDT = `${dateStr}T000000Z`;
  const endDT   = `${dateStr}T235900Z`;

  dialog.innerHTML = `
    <div class="cal-dialog-box" data-aos="zoom-in">
      <div class="cal-dialog-icon">📅</div>
      <h3 class="cal-dialog-title">Add to Your Calendar?</h3>
      <p class="cal-dialog-event">${ev.title}</p>
      <p class="cal-dialog-meta">${new Date(ev.date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · ${ev.time}</p>
      <div class="cal-dialog-btns">
        <a href="${buildGoogleCalURL(ev, startDT, endDT)}" target="_blank" rel="noopener" class="btn-cal-google" onclick="dismissCalendarDialog()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="margin-right:8px"><rect x="3" y="4" width="18" height="18" rx="2" fill="#4285F4"/><path d="M8 2v4M16 2v4M3 10h18" stroke="white" stroke-width="2"/><text x="12" y="19" text-anchor="middle" fill="white" font-size="9" font-weight="700">G</text></svg>
          Google Calendar
        </a>
        <button onclick="downloadICSFromDialog()" class="btn-cal-apple">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="margin-right:8px"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Apple Calendar
        </button>
        <button onclick="dismissCalendarDialog()" class="btn-cal-skip">No thanks</button>
      </div>
    </div>
  `;
  dialog.classList.remove('hidden');
}

function downloadICSFromDialog() {
  const ev = _calDialogCurrentEv;
  if (!ev) return;
  const d = new Date(ev.date);
  const dateStr = d.toISOString().replace(/-/g,'').split('T')[0];
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ConnectHBG//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dateStr}T090000Z`,
    `DTEND:${dateStr}T210000Z`,
    `SUMMARY:${ev.title}`,
    `DESCRIPTION:${ev.description || ev.title}`,
    `LOCATION:${ev.location || 'Harrisonburg, VA'}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${ev.title.replace(/\s+/g,'-')}.ics`;
  a.click(); URL.revokeObjectURL(url);
  dismissCalendarDialog();
  showToast('Calendar file downloaded!');
}

function buildGoogleCalURL(ev, start, end) {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${start}/${end}`,
    details: ev.description,
    location: ev.location
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function downloadICS(eventId) {
  const ev = EVENTS.find(e => e.id === eventId);
  if (!ev) return;
  const d = new Date(ev.date);
  const dateStr = d.toISOString().replace(/-/g,'').split('T')[0];
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ConnectHBG//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dateStr}T090000Z`,
    `DTEND:${dateStr}T170000Z`,
    `SUMMARY:${ev.title}`,
    `DESCRIPTION:${ev.description}`,
    `LOCATION:${ev.location}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${ev.title.replace(/\s+/g,'-')}.ics`;
  a.click(); URL.revokeObjectURL(url);
  dismissCalendarDialog();
  showToast('Calendar file downloaded!');
}

function dismissCalendarDialog() {
  const dialog = document.getElementById('calendar-dialog');
  if (dialog) dialog.classList.add('hidden');
}

/* ═══════════════════════════════════════════════════════
   COMMUNITY STORIES — 3D COVERFLOW CAROUSEL
═══════════════════════════════════════════════════════ */
let storiesCFIndex = 0;
let storiesCFTotal = 0;
let storiesCFAutoTimer = null;

function initStories() {
  const track = document.getElementById('stories-cf-track');
  const dotsEl = document.getElementById('stories-cf-dots');
  if (!track) return;

  storiesCFTotal = STORIES.length;

  // Build cards
  track.innerHTML = STORIES.map((s, i) => `
    <article class="stories-cf-card" data-index="${i}" role="listitem" aria-label="${s.title}" onclick="storiesCFClickCard(${i})">
      <div class="stories-cf-card-img">
        <img src="${s.image}" alt="${s.title}" loading="lazy" />
        <div class="stories-cf-img-overlay"></div>
      </div>
      <div class="stories-cf-card-body">
        <span class="stories-cf-cat">${s.category}</span>
        <h3 class="stories-cf-title">${s.title}</h3>
        <p class="stories-cf-excerpt">${s.excerpt}</p>
        <div class="stories-cf-meta">
          <div class="stories-cf-author-wrap">
            <div class="stories-cf-avatar">${s.author.charAt(0)}</div>
            <div>
              <p class="stories-cf-author">${s.author}</p>
              <p class="stories-cf-date">${s.date} · ${s.readTime}</p>
            </div>
          </div>
          <button class="stories-cf-read-btn" onclick="event.stopPropagation();readStory(${s.id})" aria-label="Read story: ${s.title}">
            Read Story <span data-lucide="arrow-right" class="w-4 h-4"></span>
          </button>
        </div>
      </div>
    </article>`).join('');

  // Build dots
  dotsEl.innerHTML = STORIES.map((_, i) => `
    <button class="stories-cf-dot ${i === 0 ? 'active' : ''}"
      onclick="storiesCFGoTo(${i})" role="tab"
      aria-label="Story ${i + 1}" aria-selected="${i === 0}"></button>`).join('');

  lucide.createIcons();
  updateStoriesCF();
  storiesCFStartAuto();

  // Keyboard nav
  document.addEventListener('keydown', e => {
    const storiesEl = document.getElementById('stories');
    if (!storiesEl) return;
    const rect = storiesEl.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowLeft') storiesCFPrev();
      if (e.key === 'ArrowRight') storiesCFNext();
    }
  });

  // Touch swipe
  let touchStartX = 0;
  const scene = document.querySelector('.stories-cf-scene');
  if (scene) {
    scene.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    scene.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? storiesCFNext() : storiesCFPrev();
    }, { passive: true });
  }
}

function updateStoriesCF() {
  const cards = document.querySelectorAll('.stories-cf-card');
  cards.forEach((card, i) => {
    const offset = i - storiesCFIndex;
    let transform, zIndex, opacity, filter, pointerEvents;

    if (offset === 0) {
      // Active — front and center
      transform = 'translateX(0) translateZ(0px) rotateY(0deg) scale(1)';
      zIndex = 10;
      opacity = 1;
      filter = 'brightness(1)';
      pointerEvents = 'auto';
    } else if (offset === 1 || (offset === -(storiesCFTotal - 1))) {
      // Right neighbor
      transform = 'translateX(58%) translateZ(-220px) rotateY(-40deg) scale(0.82)';
      zIndex = 6;
      opacity = 0.75;
      filter = 'brightness(0.65)';
      pointerEvents = 'auto';
    } else if (offset === -1 || offset === (storiesCFTotal - 1)) {
      // Left neighbor
      transform = 'translateX(-58%) translateZ(-220px) rotateY(40deg) scale(0.82)';
      zIndex = 6;
      opacity = 0.75;
      filter = 'brightness(0.65)';
      pointerEvents = 'auto';
    } else if (offset === 2 || offset === -(storiesCFTotal - 2)) {
      // Right far
      transform = 'translateX(105%) translateZ(-420px) rotateY(-55deg) scale(0.62)';
      zIndex = 3;
      opacity = 0.4;
      filter = 'brightness(0.45)';
      pointerEvents = 'auto';
    } else if (offset === -2 || offset === (storiesCFTotal - 2)) {
      // Left far
      transform = 'translateX(-105%) translateZ(-420px) rotateY(55deg) scale(0.62)';
      zIndex = 3;
      opacity = 0.4;
      filter = 'brightness(0.45)';
      pointerEvents = 'auto';
    } else {
      // Hidden
      const dir = offset > 0 ? 1 : -1;
      transform = `translateX(${dir * 140}%) translateZ(-600px) rotateY(${-dir * 70}deg) scale(0.4)`;
      zIndex = 1;
      opacity = 0;
      filter = 'brightness(0.3)';
      pointerEvents = 'none';
    }

    card.style.transform = transform;
    card.style.zIndex = zIndex;
    card.style.opacity = opacity;
    card.style.filter = filter;
    card.style.pointerEvents = pointerEvents;
    card.classList.toggle('stories-cf-active', offset === 0);
  });

  // Update dots with progress fill restart
  document.querySelectorAll('.stories-cf-dot').forEach((d, i) => {
    const wasActive = d.classList.contains('active');
    const isNowActive = i === storiesCFIndex;
    d.classList.toggle('active', isNowActive);
    d.setAttribute('aria-selected', String(isNowActive));
    // Restart fill animation by removing/re-adding class
    if (isNowActive) {
      d.classList.remove('active');
      void d.offsetWidth; // force reflow
      d.classList.add('active');
    }
  });
}

function storiesCFGoTo(i) {
  storiesCFIndex = ((i % storiesCFTotal) + storiesCFTotal) % storiesCFTotal;
  updateStoriesCF();
  storiesCFRestartAuto();
}

function storiesCFNext() { storiesCFGoTo(storiesCFIndex + 1); }
function storiesCFPrev() { storiesCFGoTo(storiesCFIndex - 1); }

function storiesCFClickCard(i) {
  if (i !== storiesCFIndex) {
    storiesCFGoTo(i);
  } else {
    readStory(STORIES[i].id);
  }
}

function storiesCFStartAuto() {
  storiesCFAutoTimer = setInterval(storiesCFNext, 6000);
}
function storiesCFRestartAuto() {
  clearInterval(storiesCFAutoTimer);
  storiesCFStartAuto();
}

function readStory(id) {
  const s = STORIES.find(x => x.id === id);
  if (!s) return;

  const contentHtml = s.fullContent
    ? s.fullContent.split('\n\n').map(p => `<p style="margin:0 0 18px;font-size:15px;color:var(--navy-700);line-height:1.8">${p.trim()}</p>`).join('')
    : `<p style="margin:0 0 18px;font-size:15px;color:var(--navy-700);line-height:1.8">${s.excerpt}</p>`;

  document.getElementById('story-modal-content').innerHTML = `
    <div class="story-modal-img" style="width:100%;height:280px;overflow:hidden;border-radius:20px 20px 0 0">
      <img src="${s.image}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;filter:brightness(.85)" />
    </div>
    <div class="modal-body" style="padding:28px 32px 32px">
      <span style="display:inline-block;font-size:11px;font-weight:700;background:rgba(139,92,246,.12);color:#6D28D9;padding:4px 12px;border-radius:50px;margin-bottom:16px;text-transform:uppercase;letter-spacing:.5px">${s.category}</span>
      <h2 id="story-modal-title" style="font-size:1.65rem;font-weight:900;color:var(--navy);margin:0 0 10px;letter-spacing:-.5px;line-height:1.25">${s.title}</h2>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid rgba(0,0,0,.06)">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--teal-dark));display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:800;flex-shrink:0">${s.author.charAt(0)}</div>
        <div>
          <p style="font-size:13px;font-weight:700;color:var(--navy);margin:0">${s.author}</p>
          <p style="font-size:12px;color:var(--navy-600);margin:0">${s.date} · ${s.readTime}</p>
        </div>
      </div>
      <div class="story-full-content">
        ${contentHtml}
      </div>
    </div>
  `;

  const modal = document.getElementById('story-modal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeStoryModal(e) {
  if (!e || e.target === document.getElementById('story-modal')) {
    document.getElementById('story-modal').classList.add('hidden');
    document.body.style.overflow = '';
  }
}

/* ═══════════════════════════════════════════════════════
   RESOURCE SUBMISSION FORM
═══════════════════════════════════════════════════════ */
function initForm() {
  const form = document.getElementById('resource-form');
  if (!form) return;

  form.addEventListener('submit', handleFormSubmit);

  // Drag-and-drop for file upload
  const dropArea = document.getElementById('file-drop');
  if (dropArea) {
    dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
    dropArea.addEventListener('drop', e => {
      e.preventDefault();
      dropArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) previewFile(file);
    });
  }
}

function handleFormSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById('form-error');
  errEl.classList.add('hidden');

  const name = document.getElementById('f-name').value.trim();
  const category = document.getElementById('f-category').value;
  const address = document.getElementById('f-address').value.trim();
  const desc = document.getElementById('f-desc').value.trim();

  if (!name) { showFormError('Resource name is required.'); return; }
  if (!category) { showFormError('Please select a category.'); return; }
  if (!address) { showFormError('Address is required.'); return; }
  if (!desc) { showFormError('Description is required.'); return; }

  const tags = [...document.querySelectorAll('#tag-checkboxes input:checked')].map(c => c.value);

  const submission = {
    id: Date.now(),
    name,
    category,
    address,
    phone: document.getElementById('f-phone').value,
    email: document.getElementById('f-email').value,
    website: document.getElementById('f-website').value,
    description: desc,
    tags,
    submittedBy: currentUser ? (currentUser.displayName || currentUser.username) : 'Anonymous',
    submittedByUsername: currentUser ? currentUser.username : null,
    submittedAt: new Date().toLocaleString()
  };

  submissionQueue.push(submission);
  renderAdminQueue();

  document.getElementById('resource-form').classList.add('hidden');
  document.getElementById('submit-success').classList.remove('hidden');
}

function showFormError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetForm() {
  document.getElementById('resource-form').reset();
  document.getElementById('resource-form').classList.remove('hidden');
  document.getElementById('submit-success').classList.add('hidden');
  document.getElementById('form-error').classList.add('hidden');
  document.getElementById('file-preview').classList.add('hidden');
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) previewFile(file);
}

function previewFile(file) {
  const preview = document.getElementById('file-preview');
  if (preview) {
    preview.classList.remove('hidden');
    preview.innerHTML = `
      <span data-lucide="file-check" class="w-4 h-4" style="display:inline-flex;vertical-align:middle;margin-right:6px"></span>
      ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    lucide.createIcons();
  }
}

/* ═══════════════════════════════════════════════════════
   ADMIN QUEUE  — admin-only access
═══════════════════════════════════════════════════════ */
function isAdmin() {
  return currentUser && currentUser.role === 'admin';
}

function updateAdminSectionVisibility() {
  const adminSection = document.getElementById('admin');
  if (adminSection) {
    adminSection.style.display = isAdmin() ? '' : 'none';
  }
}

function renderAdminQueue() {
  const el = document.getElementById('admin-queue');
  if (!el) return;

  // Only admin can see the queue
  if (!isAdmin()) {
    el.innerHTML = `<p style="color:#94A3B8;text-align:center;padding:20px">Access restricted to administrators.</p>`;
    return;
  }

  if (!submissionQueue.length) {
    el.innerHTML = `<div class="empty-queue"><span data-lucide="inbox" class="w-10 h-10 mx-auto mb-3 text-slate-300" style="display:block;margin:0 auto 12px"></span><p style="color:#94A3B8;text-align:center">No submissions pending review</p></div>`;
    lucide.createIcons();
    return;
  }

  el.innerHTML = submissionQueue.map((sub, i) => `
    <div class="admin-item">
      <div class="admin-item-body">
        <h3 class="admin-item-name">${sub.name}</h3>
        <p class="admin-item-desc">${sub.description}</p>
        <p style="font-size:12px;color:#94A3B8;margin-top:6px">
          Submitted by ${typeof sub.submittedBy === 'object' ? (sub.submittedBy.displayName || sub.submittedBy.username) : sub.submittedBy} · ${sub.submittedAt}
        </p>
      </div>
      <div class="admin-actions">
        <button class="btn-approve" onclick="approveSubmission(${i})">
          <span data-lucide="check" class="w-4 h-4" style="display:inline-flex;vertical-align:middle;margin-right:4px"></span>
          Approve
        </button>
        <button class="btn-reject" onclick="rejectSubmission(${i})">
          <span data-lucide="x" class="w-4 h-4" style="display:inline-flex;vertical-align:middle;margin-right:4px"></span>
          Reject
        </button>
      </div>
    </div>`).join('');
  lucide.createIcons();
}

function approveSubmission(i) {
  if (!isAdmin()) { showToast('Admin access required'); return; }
  const sub = submissionQueue[i];
  if (!sub) return;

  // Add to resources list
  const newResource = {
    id: RESOURCES.length + Date.now(),
    name: sub.name,
    category: sub.category,
    subcategory: sub.category,
    description: sub.description,
    address: sub.address,
    phone: sub.phone || 'N/A',
    email: sub.email || 'N/A',
    website: sub.website || '#',
    hours: 'Contact for hours',
    rating: 4.0,
    reviews: 0,
    tags: sub.tags || [],
    cost: 'free',
    ageGroup: 'all',
    availability: 'weekdays',
    lat: 38.4496 + (Math.random() - .5) * .02,
    lng: -78.8689 + (Math.random() - .5) * .02,
    image: '',
    featured: false,
    story: '',
    userSubmitted: true
  };
  RESOURCES.push(newResource);
  submissionQueue.splice(i, 1);

  // Track approved submission for the submitter's dashboard
  const submitter = sub.submittedByUsername || (typeof sub.submittedBy === 'object' ? sub.submittedBy.username : null);
  if (submitter && submitter !== 'Anonymous') {
    const approved = JSON.parse(localStorage.getItem('crh_approved_' + submitter) || '[]');
    approved.push({ name: sub.name, submittedAt: sub.submittedAt });
    localStorage.setItem('crh_approved_' + submitter, JSON.stringify(approved));
  }

  renderAdminQueue();
  applyFilters();
  showToast(`"${sub.name}" approved and added to directory`);
}

function rejectSubmission(i) {
  if (!isAdmin()) { showToast('Admin access required'); return; }
  const sub = submissionQueue[i];
  submissionQueue.splice(i, 1);
  renderAdminQueue();
  showToast(`Submission "${sub.name}" rejected`);
}

function deleteReview(resourceId, reviewIndex) {
  if (!isAdmin()) { showToast('Admin access required'); return; }
  // Offset by seeded reviews count so we only delete from user-submitted reviews
  const seededCount = (SEEDED_REVIEWS[resourceId] || []).length;
  const userIndex = reviewIndex - seededCount;
  if (userIndex >= 0 && pendingReviews[resourceId]) {
    pendingReviews[resourceId].splice(userIndex, 1);
  } else {
    showToast('Cannot delete built-in reviews');
    return;
  }
  showToast('Review removed');
  openResourceModal(resourceId);
}

/* ═══════════════════════════════════════════════════════
   COMPARE
═══════════════════════════════════════════════════════ */
function initCompare() {
  const selA = document.getElementById('compare-a');
  const selB = document.getElementById('compare-b');
  if (!selA || !selB) return;

  // Start with placeholder options — no pre-selection
  RESOURCES.forEach(r => {
    selA.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    selB.innerHTML += `<option value="${r.id}">${r.name}</option>`;
  });
  // Leave at placeholder ('') — user selects explicitly
}

function renderComparison() {
  const aId = parseInt(document.getElementById('compare-a').value);
  const bId = parseInt(document.getElementById('compare-b').value);
  const result = document.getElementById('comparison-result');

  // Same resource selected — show error notification
  if (aId && bId && aId === bId) {
    result.innerHTML = `
      <div class="compare-same-error" role="alert">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:44px;height:44px;border-radius:50%;background:rgba(239,68,68,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span data-lucide="alert-circle" class="w-6 h-6" style="color:#EF4444"></span>
          </div>
          <div>
            <p style="font-size:15px;font-weight:700;color:var(--navy);margin:0 0 4px">Same Resource Selected</p>
            <p style="font-size:13px;color:var(--navy-600);margin:0">Please select two <em>different</em> resources to compare them side by side.</p>
          </div>
        </div>
      </div>`;
    lucide.createIcons();
    return;
  }

  if (!aId || !bId) {
    result.innerHTML = '';
    return;
  }

  const a = RESOURCES.find(r => r.id === aId);
  const b = RESOURCES.find(r => r.id === bId);
  if (!a || !b) return;

  const winner = a.rating >= b.rating ? a : b;

  result.innerHTML = [a, b].map(r => `
    <div class="compare-card ${r.id === winner.id ? 'winner' : ''}">
      ${r.id === winner.id ? '<span class="compare-winner-badge">Higher Rated</span>' : ''}
      <h3 style="font-size:17px;font-weight:800;color:var(--navy);margin:0 0 16px">${r.name}</h3>
      <div class="compare-row"><span class="compare-row-label">Category</span><span class="compare-row-val">${r.category}</span></div>
      <div class="compare-row"><span class="compare-row-label">Rating</span><span class="compare-row-val">⭐ ${r.rating}</span></div>
      <div class="compare-row"><span class="compare-row-label">Reviews</span><span class="compare-row-val">${r.reviews}</span></div>
      <div class="compare-row"><span class="compare-row-label">Cost</span><span class="compare-row-val">${r.cost === 'free' ? '✅ Free' : '💰 Paid'}</span></div>
      <div class="compare-row"><span class="compare-row-label">Hours</span><span class="compare-row-val">${r.hours}</span></div>
      <div class="compare-row"><span class="compare-row-label">Age Group</span><span class="compare-row-val">${r.ageGroup}</span></div>
      <button class="btn-card-primary" style="width:100%;margin-top:16px;padding:11px" onclick="openResourceModal(${r.id})">View Details</button>
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════════
   GENERATIONAL CHARTS (ECharts + ECharts-GL)
═══════════════════════════════════════════════════════ */
function initCharts() {
  if (typeof echarts === 'undefined') {
    setTimeout(initCharts, 500);
    return;
  }

  const categories = ['Food','Health','Education','Housing','Volunteer','Support'];
  const catColors  = ['#F97316','#EF4444','#3B82F6','#10B981','#8B5CF6','#F59E0B'];
  const catCounts  = categories.map(c => RESOURCES.filter(r => r.category === c).length);
  const avgRatings = categories.map(cat => {
    const items = RESOURCES.filter(r => r.category === cat);
    return items.length ? +(items.reduce((s, r) => s + r.rating, 0) / items.length).toFixed(2) : 0;
  });
  const isDark   = document.documentElement.classList.contains('dark-mode');
  const textClr  = isDark ? '#94A3B8' : '#475569';
  const gridClr  = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';

  // ══ 1. EPIC 3D BAR — Resource Command Center ══════════
  const el3DBar = document.getElementById('chart-3d-bar');
  if (el3DBar) {
    const chart3DBar = echarts.init(el3DBar);
    const bar3DData = categories.map((_cat, i) => [i, 0, catCounts[i]]);
    chart3DBar.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        formatter: p => {
          const idx = p.data[0];
          return `<div style="font-weight:800;color:${catColors[idx]};font-size:14px">${categories[idx]}</div><div style="margin-top:5px">📦 <b>${p.data[2]}</b> resources</div><div>⭐ Avg rating: <b>${avgRatings[idx]}</b></div>`;
        }
      },
      visualMap: {
        show: true, min: 0, max: Math.max(...catCounts),
        inRange: { color: catColors },
        orient: 'horizontal', left: 'center', bottom: 8,
        textStyle: { color: textClr, fontSize: 10 },
        itemWidth: 14, itemHeight: 7
      },
      xAxis3D: {
        type: 'category', data: categories,
        axisLabel: { color: textClr, fontSize: 12, fontWeight: 700, interval: 0 },
        axisLine: { lineStyle: { color: gridClr } }
      },
      yAxis3D: { type: 'value', show: false },
      zAxis3D: {
        type: 'value', name: 'Resources',
        axisLabel: { color: textClr, fontSize: 10 },
        axisLine: { lineStyle: { color: gridClr } },
        nameTextStyle: { color: textClr, fontSize: 11 }
      },
      grid3D: {
        boxWidth: 220, boxDepth: 80, boxHeight: 140,
        viewControl: { autoRotate: true, autoRotateSpeed: 12, distance: 250, beta: 22, alpha: 22 },
        light: {
          main: { intensity: 1.6, shadow: true, shadowQuality: 'high' },
          ambient: { intensity: 0.55 }
        },
        axisLine: { lineStyle: { color: gridClr } },
        splitLine: { lineStyle: { color: gridClr } },
        environment: 'none',
        postEffect: {
          enable: true,
          bloom: { enable: true, bloomIntensity: 0.25 },
          SSAO: { enable: true, quality: 'medium', radius: 4 }
        }
      },
      series: [{
        type: 'bar3D', data: bar3DData,
        shading: 'realistic',
        realisticMaterial: { roughness: 0.08, metalness: 0.85 },
        label: { show: true, textStyle: { color: '#0F172A', fontSize: 13, fontWeight: 900, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 3, padding: [2, 4] }, formatter: p => p.value[2] },
        emphasis: {
          label: { textStyle: { fontSize: 17, color: '#0F172A', fontWeight: 900, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 3, padding: [2, 5] } },
          itemStyle: { color: '#5EEAD4', opacity: 1 }
        },
        itemStyle: { opacity: 0.93 }
      }]
    });
    window.addEventListener('resize', () => chart3DBar.resize());
  }

  // ══ 2. FORCE NETWORK GRAPH — Resource Galaxy ══════════
  const el3DScatter = document.getElementById('chart-3d-scatter');
  if (el3DScatter) {
    const chartNetwork = echarts.init(el3DScatter);
    const nodes = [
      ...categories.map((cat, i) => ({
        id: 'cat-' + i, name: cat,
        symbolSize: 48 + catCounts[i] * 7,
        category: i,
        itemStyle: { color: catColors[i], shadowBlur: 40, shadowColor: catColors[i] },
        label: { show: true, fontWeight: 900, fontSize: 12, color: catColors[i], position: 'inside' },
        value: catCounts[i], fixed: false
      })),
      ...RESOURCES.map(r => ({
        id: 'r-' + r.id,
        name: r.name.split(' ').slice(0,2).join(' '),
        symbolSize: 10 + Math.min(r.reviews / 12, 18),
        category: categories.indexOf(r.category),
        itemStyle: { color: catColors[categories.indexOf(r.category)], opacity: 0.88 },
        label: { show: false },
        value: r.rating
      }))
    ];
    const links = RESOURCES.map(r => ({
      source: 'cat-' + categories.indexOf(r.category),
      target: 'r-' + r.id,
      lineStyle: { color: catColors[categories.indexOf(r.category)], opacity: 0.38, width: 1.5, curveness: 0.25 }
    }));
    chartNetwork.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        formatter: p => {
          if (p.dataType !== 'node') return '';
          const isHub = p.data.id && p.data.id.startsWith('cat-');
          return `<b>${p.data.name}</b><br/>${isHub ? p.data.value + ' resources' : '⭐ ' + p.data.value}`;
        }
      },
      legend: [{
        data: categories.map((c, i) => ({ name: c, icon: 'circle', itemStyle: { color: catColors[i] } })),
        orient: 'horizontal', bottom: 0, textStyle: { color: textClr, fontSize: 10 },
        itemWidth: 10, itemHeight: 10, itemGap: 10
      }],
      series: [{
        type: 'graph', layout: 'force',
        data: nodes, links,
        categories: categories.map((cat, i) => ({ name: cat, itemStyle: { color: catColors[i] } })),
        roam: true, focusNodeAdjacency: true,
        edgeSymbol: ['none','arrow'], edgeSymbolSize: [0, 5],
        force: { repulsion: 320, edgeLength: [50, 180], gravity: 0.08, layoutAnimation: true, friction: 0.65 },
        emphasis: { focus: 'adjacency', lineStyle: { width: 3, opacity: 0.9 } },
        animation: true, animationDuration: 2200, animationEasing: 'elasticOut'
      }]
    });
    window.addEventListener('resize', () => chartNetwork.resize());
  }

  // ══ 3. DUAL RADAR — Community Coverage ════════════════
  const elRadar = document.getElementById('chart-radar');
  if (elRadar) {
    const chartRadar = echarts.init(elRadar);
    chartRadar.setOption({
      backgroundColor: 'transparent',
      tooltip: {},
      legend: {
        data: ['Resource Count','Avg Quality'],
        bottom: 0, textStyle: { color: textClr, fontSize: 10 },
        itemWidth: 12, itemHeight: 8
      },
      radar: {
        indicator: categories.map(c => ({ name: c, max: Math.max(...catCounts) + 2 })),
        shape: 'circle',
        axisName: { color: textClr, fontSize: 12, fontWeight: 700 },
        splitArea: { areaStyle: { color: [
          'rgba(20,184,166,.03)','rgba(20,184,166,.06)',
          'rgba(20,184,166,.09)','rgba(20,184,166,.12)','rgba(20,184,166,.15)'
        ]}},
        splitLine: { lineStyle: { color: gridClr } },
        axisLine: { lineStyle: { color: gridClr } }
      },
      series: [
        {
          type: 'radar', name: 'Resource Count',
          data: [{ value: catCounts, name: 'Resource Count',
            symbol: 'circle', symbolSize: 7,
            areaStyle: { color: 'rgba(20,184,166,.25)' },
            lineStyle: { color: '#14B8A6', width: 2.8 },
            itemStyle: { color: '#14B8A6' }
          }]
        },
        {
          type: 'radar', name: 'Avg Quality',
          data: [{ value: avgRatings.map(v => +(v * 10).toFixed(1)), name: 'Avg Quality',
            symbol: 'diamond', symbolSize: 7,
            areaStyle: { color: 'rgba(139,92,246,.2)' },
            lineStyle: { color: '#8B5CF6', width: 2, type: 'dashed' },
            itemStyle: { color: '#8B5CF6' }
          }]
        }
      ]
    });
    window.addEventListener('resize', () => chartRadar.resize());
  }

  // ══ 4. ANIMATED SANKEY FLOW — Community Flow ══════════
  const elSunburst = document.getElementById('chart-sunburst');
  if (elSunburst) {
    const chartSankey = echarts.init(elSunburst);
    const sankeyNodes = [
      ...categories.map((cat, i) => ({ name: cat, itemStyle: { color: catColors[i] }, depth: 0 })),
      ...RESOURCES.map(r => ({ name: r.name.split(' ').slice(0, 2).join(' '), depth: 1 }))
    ];
    const sankeyLinks = RESOURCES.map(r => ({
      source: r.category,
      target: r.name.split(' ').slice(0, 2).join(' '),
      value: r.reviews
    }));
    chartSankey.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', triggerOn: 'mousemove' },
      grid: { containLabel: true, left: 10, right: 10, top: 10, bottom: 10 },
      series: [{
        type: 'sankey', layout: 'none',
        data: sankeyNodes, links: sankeyLinks,
        nodeAlign: 'left',
        emphasis: { focus: 'adjacency' },
        label: { color: textClr, fontWeight: 600, fontSize: 10, overflow: 'truncate', width: 80 },
        nodeGap: 10, nodeWidth: 16,
        left: '12%', right: '12%', top: '8%', bottom: '8%',
        lineStyle: { color: 'gradient', opacity: 0.48, curveness: 0.5 },
        levels: [
          { depth: 0, itemStyle: { borderWidth: 2, gapWidth: 5 }, lineStyle: { color: 'gradient', opacity: 0.48 } },
          { depth: 1, itemStyle: { gapWidth: 2 } }
        ],
        animation: true, animationDuration: 2000, animationEasing: 'cubicOut'
      }]
    });
    window.addEventListener('resize', () => chartSankey.resize());
  }

  // ══ 5. LIVE STREAMING METRICS ═════════════════════════
  const elGauge = document.getElementById('chart-gauge');
  if (elGauge) {
    const chartLive = echarts.init(elGauge);
    const N = 50;
    const liveEngagement = Array.from({ length: N }, (_, i) => [i, 60 + Math.sin(i * 0.3) * 20 + Math.random() * 10]);
    const liveActivity   = Array.from({ length: N }, (_, i) => [i, 45 + Math.cos(i * 0.25) * 15 + Math.random() * 8]);
    const liveAccess     = Array.from({ length: N }, (_, i) => [i, 75 + Math.sin(i * 0.15) * 10 + Math.random() * 5]);

    chartLive.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#475569' } } },
      legend: {
        data: ['Engagement','Event Activity','Resource Access'],
        top: 0, textStyle: { color: textClr, fontSize: 10 },
        itemWidth: 12, itemHeight: 8, itemGap: 12
      },
      grid: { top: 38, bottom: 24, left: 44, right: 16 },
      xAxis: {
        type: 'value', min: 'dataMin', max: 'dataMax',
        axisLabel: { show: false },
        splitLine: { lineStyle: { color: gridClr } },
        axisLine: { lineStyle: { color: gridClr } }
      },
      yAxis: {
        type: 'value', min: 0, max: 100,
        axisLabel: { color: textClr, fontSize: 10, formatter: '{value}%' },
        splitLine: { lineStyle: { color: gridClr } },
        axisLine: { lineStyle: { color: gridClr } }
      },
      series: [
        {
          name: 'Engagement', type: 'line', data: liveEngagement,
          smooth: true, showSymbol: false,
          lineStyle: { color: '#14B8A6', width: 2.5 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(20,184,166,.38)' }, { offset: 1, color: 'rgba(20,184,166,0)' }] } }
        },
        {
          name: 'Event Activity', type: 'line', data: liveActivity,
          smooth: true, showSymbol: false,
          lineStyle: { color: '#8B5CF6', width: 2, type: 'dashed' },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(139,92,246,.28)' }, { offset: 1, color: 'rgba(139,92,246,0)' }] } }
        },
        {
          name: 'Resource Access', type: 'line', data: liveAccess,
          smooth: true, showSymbol: false,
          lineStyle: { color: '#F97316', width: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(249,115,22,.22)' }, { offset: 1, color: 'rgba(249,115,22,0)' }] } }
        }
      ],
      animation: false
    });

    // Simulate live stream
    let tick = N;
    setInterval(() => {
      if (!document.getElementById('chart-gauge') || !chartLive) return;
      try {
        const opt = chartLive.getOption();
        opt.series[0].data.push([tick, 60 + Math.sin(tick * 0.3) * 20 + Math.random() * 10]);
        opt.series[1].data.push([tick, 45 + Math.cos(tick * 0.25) * 15 + Math.random() * 8]);
        opt.series[2].data.push([tick, 75 + Math.sin(tick * 0.15) * 10 + Math.random() * 5]);
        if (opt.series[0].data.length > 65) {
          opt.series[0].data.shift();
          opt.series[1].data.shift();
          opt.series[2].data.shift();
        }
        tick++;
        chartLive.setOption(opt, { notMerge: false, silent: true });
      } catch (_) { /* chart may be disposed */ }
    }, 900);

    window.addEventListener('resize', () => chartLive.resize());
  }

  // KPI values
  const kpiTotal   = document.getElementById('kpi-total');
  const kpiAvg     = document.getElementById('kpi-avg-rating');
  const kpiReviews = document.getElementById('kpi-reviews');
  const kpiFree    = document.getElementById('kpi-free');
  if (kpiTotal)   kpiTotal.textContent   = RESOURCES.length;
  if (kpiAvg)     kpiAvg.textContent     = (RESOURCES.reduce((s,r) => s+r.rating, 0) / RESOURCES.length).toFixed(1);
  if (kpiReviews) kpiReviews.textContent = RESOURCES.reduce((s,r) => s+r.reviews, 0).toLocaleString();
  if (kpiFree)    kpiFree.textContent    = RESOURCES.filter(r => r.cost === 'free').length;

  // Init 3D Orbit after a short delay (let other charts load first)
  setTimeout(initCommunityOrbit3D, 400);
}

/* ═══════════════════════════════════════════════════════
   3D COMMUNITY ORBIT — Three.js Auto-Animated Visualization
═══════════════════════════════════════════════════════ */
function initCommunityOrbit3D() {
  const container = document.getElementById('community-orbit-3d');
  if (!container || typeof THREE === 'undefined') return;

  const W = container.clientWidth || 800;
  const H = container.clientHeight || 480;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 1000);
  camera.position.set(0, 3, 22);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);
  const pointLight1 = new THREE.PointLight(0x14B8A6, 3.5, 60);
  pointLight1.position.set(0, 0, 0);
  scene.add(pointLight1);
  const pointLight2 = new THREE.PointLight(0x8B5CF6, 2, 50);
  pointLight2.position.set(10, 5, -5);
  scene.add(pointLight2);
  const pointLight3 = new THREE.PointLight(0xF97316, 1.5, 40);
  pointLight3.position.set(-8, -4, 8);
  scene.add(pointLight3);

  // Central sphere (the community hub)
  const centralGeo = new THREE.SphereGeometry(1.6, 48, 48);
  const centralMat = new THREE.MeshPhongMaterial({
    color: 0x14B8A6, emissive: 0x0A8077, emissiveIntensity: 0.5,
    shininess: 100, transparent: true, opacity: 0.92
  });
  const central = new THREE.Mesh(centralGeo, centralMat);
  scene.add(central);

  // Central glow ring
  const glowRingGeo = new THREE.TorusGeometry(2.2, 0.06, 16, 80);
  const glowRingMat = new THREE.MeshBasicMaterial({ color: 0x5EEAD4, transparent: true, opacity: 0.5 });
  const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
  glowRing.rotation.x = Math.PI / 2;
  scene.add(glowRing);

  // Category data
  const catData = [
    { name: 'Food',      color: 0x22C55E, tilt: 0.0,  orbitR: 5.5,  speed: 0.0035 },
    { name: 'Health',    color: 0xEC4899, tilt: 0.52, orbitR: 6.5,  speed: 0.0027 },
    { name: 'Education', color: 0x3B82F6, tilt: 1.1,  orbitR: 7.4,  speed: 0.0042 },
    { name: 'Housing',   color: 0xF97316, tilt: 1.7,  orbitR: 8.2,  speed: 0.0023 },
    { name: 'Volunteer', color: 0x14B8A6, tilt: 2.3,  orbitR: 5.8,  speed: 0.0038 },
    { name: 'Support',   color: 0x8B5CF6, tilt: 2.9,  orbitR: 7.0,  speed: 0.0031 }
  ];

  const orbitGroups = [];
  const allNodes = [];

  catData.forEach((cat, ci) => {
    const group = new THREE.Group();
    group.rotation.z = cat.tilt;
    group.rotation.x = cat.tilt * 0.4;

    // Orbit ring (torus)
    const ringGeo = new THREE.TorusGeometry(cat.orbitR, 0.025, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: cat.color, transparent: true, opacity: 0.18 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Resource nodes on this orbit
    const catResources = RESOURCES.filter(r => r.category === cat.name);
    catResources.forEach((res, ri) => {
      const angle = (ri / catResources.length) * Math.PI * 2;
      const nodeGeo = new THREE.SphereGeometry(0.35 + res.rating * 0.04, 20, 20);
      const nodeMat = new THREE.MeshPhongMaterial({
        color: cat.color, emissive: cat.color, emissiveIntensity: 0.45, shininess: 80
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(Math.cos(angle) * cat.orbitR, 0, Math.sin(angle) * cat.orbitR);
      node.userData = { angle, orbitR: cat.orbitR, name: res.name, cat: cat.name };
      group.add(node);
      allNodes.push({ mesh: node, group, angleOffset: angle });

      // Glowing halo around node
      const haloGeo = new THREE.SphereGeometry(0.55, 12, 12);
      const haloMat = new THREE.MeshBasicMaterial({ color: cat.color, transparent: true, opacity: 0.12, side: THREE.BackSide });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(node.position);
      group.add(halo);
    });

    scene.add(group);
    orbitGroups.push({ group, speed: cat.speed });

    // Connection line from center to orbit
    const linePts = [];
    for (let t = 0; t <= 1; t += 0.1) {
      linePts.push(new THREE.Vector3(0, 0, t * cat.orbitR));
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    const lineMat = new THREE.LineBasicMaterial({ color: cat.color, transparent: true, opacity: 0.08 });
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);
  });

  // Starfield particles
  const starCount = 280;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 60;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0x94A3B8, size: 0.07, transparent: true, opacity: 0.6 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Build legend
  const legendEl = document.getElementById('orbit-legend');
  if (legendEl) {
    legendEl.innerHTML = catData.map(c => {
      const hex = '#' + c.color.toString(16).padStart(6, '0');
      const count = RESOURCES.filter(r => r.category === c.name).length;
      return `<div class="orbit-legend-item">
        <span class="orbit-legend-dot" style="background:${hex}"></span>
        <span class="orbit-legend-name">${c.name}</span>
        <span class="orbit-legend-count">${count}</span>
      </div>`;
    }).join('');
  }

  // Animation loop
  let frame = 0;
  let raf;

  function animate() {
    raf = requestAnimationFrame(animate);
    frame++;

    // Gentle overall scene rotation
    scene.rotation.y += 0.0022;
    scene.rotation.x = Math.sin(frame * 0.004) * 0.12;

    // Central sphere pulsation
    const s = 1 + Math.sin(frame * 0.04) * 0.04;
    central.scale.set(s, s, s);
    centralMat.emissiveIntensity = 0.45 + Math.sin(frame * 0.06) * 0.2;

    // Glow ring pulse
    glowRingMat.opacity = 0.3 + Math.sin(frame * 0.05) * 0.25;
    glowRing.rotation.z += 0.008;

    // Orbit group rotation
    orbitGroups.forEach(({ group, speed }) => {
      group.rotation.y += speed;
    });

    // Node pulse (shimmer effect)
    allNodes.forEach(({ mesh }, ni) => {
      const t = frame * 0.03 + ni * 0.7;
      mesh.scale.setScalar(1 + Math.sin(t) * 0.12);
    });

    // Slow star drift
    stars.rotation.y += 0.0005;
    stars.rotation.x += 0.0002;

    // Gentle camera bob
    camera.position.y = 3 + Math.sin(frame * 0.008) * 1.2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Raycasting hover
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredNode = null;

  const tooltip = document.createElement('div');
  tooltip.style.cssText = 'position:absolute;pointer-events:none;background:rgba(4,13,26,.88);backdrop-filter:blur(8px);border:1px solid rgba(20,184,166,.4);border-radius:10px;padding:8px 12px;font-size:12px;color:#F1F5F9;display:none;z-index:10;max-width:160px;line-height:1.5;';
  container.appendChild(tooltip);

  renderer.domElement.addEventListener('mousemove', e => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const meshes = allNodes.map(n => n.mesh);
    const hits = raycaster.intersectObjects(meshes);

    if (hits.length) {
      const hit = hits[0].object;
      if (hoveredNode !== hit) {
        if (hoveredNode) {
          hoveredNode.scale.setScalar(1);
          hoveredNode.material.emissiveIntensity = 0.45;
        }
        hoveredNode = hit;
        hit.scale.setScalar(1.6);
        hit.material.emissiveIntensity = 1.0;
      }
      const ud = hit.userData;
      tooltip.innerHTML = `<div style="font-weight:800;color:#14B8A6;font-size:10px;text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px">${ud.cat}</div><div style="font-weight:700">${ud.name}</div>`;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
      renderer.domElement.style.cursor = 'pointer';
    } else {
      if (hoveredNode) {
        hoveredNode.scale.setScalar(1);
        hoveredNode.material.emissiveIntensity = 0.45;
        hoveredNode = null;
      }
      tooltip.style.display = 'none';
      renderer.domElement.style.cursor = 'default';
    }
  });

  renderer.domElement.addEventListener('mouseleave', () => {
    if (hoveredNode) {
      hoveredNode.scale.setScalar(1);
      hoveredNode.material.emissiveIntensity = 0.45;
      hoveredNode = null;
    }
    tooltip.style.display = 'none';
    renderer.domElement.style.cursor = 'default';
  });

  // Pause when off-screen for performance
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!raf) animate();
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  }, { threshold: 0.1 });
  observer.observe(container);

  // Resize handler
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    camera.aspect = w / H;
    camera.updateProjectionMatrix();
    renderer.setSize(w, H);
  });
}

/* ═══════════════════════════════════════════════════════
   TOAST NOTIFICATION
═══════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

/* ═══════════════════════════════════════════════════════
   HELPERS — Categories
═══════════════════════════════════════════════════════ */
function catClass(cat) {
  const map = { Food: 'cat-food', Health: 'cat-health', Education: 'cat-education', Housing: 'cat-housing', Volunteer: 'cat-volunteer', Support: 'cat-support' };
  return map[cat] || 'cat-support';
}
function catBg(cat) {
  const map = { Food: 'bg-orange-50', Health: 'bg-red-50', Education: 'bg-blue-50', Housing: 'bg-emerald-50', Volunteer: 'bg-purple-50', Support: 'bg-yellow-50' };
  return map[cat] || 'bg-slate-50';
}
function catBgHex(cat) {
  const map = { Food: '#FFF7ED', Health: '#FEF2F2', Education: '#EFF6FF', Housing: '#ECFDF5', Volunteer: '#F5F3FF', Support: '#FFFBEB' };
  return map[cat] || '#F8FAFC';
}
function catHex(cat) {
  const map = { Food: '#F97316', Health: '#EF4444', Education: '#3B82F6', Housing: '#10B981', Volunteer: '#8B5CF6', Support: '#F59E0B' };
  return map[cat] || '#94A3B8';
}
function catEmoji(cat) {
  const map = { Food: '🍎', Health: '🏥', Education: '📚', Housing: '🏠', Volunteer: '🤝', Support: '💛' };
  return map[cat] || '📌';
}
function eventTypeClass(type) {
  const map = { 'Community Event': 'ev-community', 'Workshop': 'ev-workshop', 'Volunteer': 'ev-volunteer' };
  return map[type] || 'ev-community';
}

/* ═══════════════════════════════════════════════════════
   FAVORITES
═══════════════════════════════════════════════════════ */
function initFavorites() {
  renderFavoritesSection();
}

function toggleFavorite(key, event) {
  if (event) { event.stopPropagation(); event.preventDefault(); }

  // Burst hearts animation
  if (event && !favorites.has(key)) {
    for (let i = 0; i < 4; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-burst';
      heart.textContent = '❤';
      heart.style.left = (event.clientX + (Math.random() - .5) * 40) + 'px';
      heart.style.top  = (event.clientY + (Math.random() - .5) * 20) + 'px';
      heart.style.animationDelay = (i * 80) + 'ms';
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1200);
    }
  }

  if (favorites.has(key)) {
    favorites.delete(key);
    showToast('Removed from favorites');
  } else {
    favorites.add(key);
    showToast('Added to favorites ❤');
  }

  const isFav = favorites.has(key);
  // Persist
  localStorage.setItem('crh_favorites', JSON.stringify([...favorites]));

  // Animate the clicked button
  const btn = event?.currentTarget;
  if (btn) {
    btn.classList.toggle('favorited', isFav);
    btn.setAttribute('aria-pressed', String(isFav));
    btn.setAttribute('title', isFav ? 'Remove from favorites' : 'Add to favorites');
    btn.classList.add('heart-pop');
    setTimeout(() => btn.classList.remove('heart-pop'), 500);
  }

  // Sync ALL other buttons for this key across the entire page
  document.querySelectorAll('.btn-favorite').forEach(b => {
    if (b === btn) return; // skip the one we already handled
    const onclick = b.getAttribute('onclick') || '';
    if (onclick.includes(`'${key}'`) || onclick.includes(`"${key}"`)) {
      b.classList.toggle('favorited', isFav);
      b.setAttribute('aria-pressed', String(isFav));
      b.setAttribute('title', isFav ? 'Remove from favorites' : 'Add to favorites');
    }
  });

  updateFavCountBadge();
  renderFavoritesSection();
}

function updateFavCountBadge() {
  const badge = document.getElementById('fav-count-badge');
  if (!badge) return;
  const count = favorites.size;
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

function renderFavoritesSection() {
  const grid = document.getElementById('favorites-grid');
  const empty = document.getElementById('favorites-empty');
  if (!grid || !empty) return;

  if (favorites.size === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.classList.remove('hidden');

  const items = [];
  favorites.forEach(key => {
    const [type, idStr] = key.split('-');
    const id = parseInt(idStr);
    if (type === 'r') {
      const r = RESOURCES.find(x => x.id === id);
      if (r) items.push({ type: 'resource', data: r });
    } else if (type === 'e') {
      const ev = EVENTS.find(x => x.id === id);
      if (ev) items.push({ type: 'event', data: ev });
    }
  });

  grid.innerHTML = items.map(item => {
    if (item.type === 'resource') {
      const r = item.data;
      return `
        <article class="resource-card" role="listitem" aria-label="${r.name}">
          <div class="card-img">
            ${r.image
              ? `<img src="${r.image}" alt="${r.name}" loading="lazy" />`
              : `<div class="card-img-placeholder ${catBg(r.category)}">${catEmoji(r.category)}</div>`}
            <span class="card-cat-badge ${catClass(r.category)}">${r.category}</span>
          </div>
          <div class="card-body">
            <h3 class="card-name">${r.name}</h3>
            <p class="card-desc">${r.description}</p>
            <div class="card-rating">
              <span class="stars">${renderStars(r.rating)}</span>
              <span class="rating-num">${r.rating}</span>
              <span class="rating-count">(${r.reviews})</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn-card-primary" onclick="openResourceModal(${r.id})">View Details</button>
            <button class="btn-favorite favorited heart-pop" onclick="toggleFavorite('r-${r.id}',event)" aria-label="Remove from favorites" aria-pressed="true">
              <span data-lucide="heart" class="w-4 h-4"></span>
            </button>
          </div>
        </article>`;
    } else {
      const ev = item.data;
      const d = new Date(ev.date);
      const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      return `
        <article class="event-card" role="listitem" style="position:relative">
          <div class="event-date-box"><div class="event-month">${month}</div><div class="event-day">${day}</div></div>
          <div class="event-body">
            <span class="event-type-badge ${eventTypeClass(ev.type)}">${ev.type}</span>
            <h3 class="event-title">${ev.title}</h3>
            <p class="event-desc">${ev.description}</p>
          </div>
          <div class="event-actions">
            <button class="btn-register" onclick="registerEvent(${ev.id})">Register</button>
            <button class="btn-favorite favorited" onclick="toggleFavorite('e-${ev.id}',event)" aria-label="Remove from favorites" aria-pressed="true">
              <span data-lucide="heart" class="w-4 h-4"></span>
            </button>
          </div>
        </article>`;
    }
  }).join('');

  lucide.createIcons();
}

/* ═══════════════════════════════════════════════════════
   AR — AUGMENTED REALITY RESOURCE FINDER
═══════════════════════════════════════════════════════ */
let arStream = null;

async function startAR() {
  const modal = document.getElementById('ar-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  const video = document.getElementById('ar-video');
  const noCamera = document.getElementById('ar-no-camera');

  try {
    arStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false
    });
    video.srcObject = arStream;
    noCamera.classList.add('hidden');
    renderARPins();
  } catch (err) {
    video.style.display = 'none';
    noCamera.classList.remove('hidden');
  }
}

function renderARPins() {
  const pinsContainer = document.getElementById('ar-pins');
  if (!pinsContainer) return;

  // Show up to 8 nearby resources as AR pins scattered across the viewport
  const nearby = RESOURCES.slice(0, 8);
  const positions = [
    { x: 20, y: 30 }, { x: 50, y: 20 }, { x: 75, y: 35 },
    { x: 85, y: 60 }, { x: 65, y: 72 }, { x: 35, y: 65 },
    { x: 15, y: 55 }, { x: 45, y: 45 }
  ];

  pinsContainer.innerHTML = nearby.map((r, i) => {
    const pos = positions[i] || { x: 50, y: 50 };
    const dist = (0.1 + Math.random() * 1.8).toFixed(1);
    return `
      <div class="ar-pin" style="left:${pos.x}%;top:${pos.y}%;animation-delay:${i * 120}ms"
        onclick="openResourceModal(${r.id})" role="button" tabindex="0"
        aria-label="${r.name}, ${dist} miles away">
        <div class="ar-pin-dot">${catEmoji(r.category)}</div>
        <div class="ar-pin-label">
          <span class="ar-pin-name">${r.name}</span>
          <span class="ar-pin-dist">${dist} mi away</span>
        </div>
      </div>`;
  }).join('');

  const countEl = document.getElementById('ar-nearby-count');
  if (countEl) countEl.textContent = `${nearby.length} resources nearby`;
}

function closeAR() {
  if (arStream) {
    arStream.getTracks().forEach(t => t.stop());
    arStream = null;
  }
  const video = document.getElementById('ar-video');
  if (video) { video.srcObject = null; video.style.display = ''; }
  document.getElementById('ar-modal')?.classList.add('hidden');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════
   ACCOUNT DASHBOARD
═══════════════════════════════════════════════════════ */
function openAccountDashboard() {
  if (!currentUser) { openLoginModal(); return; }
  const panel = document.getElementById('account-dashboard');
  panel.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderAccountDashboard();
}

function closeAccountDashboard() {
  document.getElementById('account-dashboard').classList.add('hidden');
  document.body.style.overflow = '';
}

function renderAccountDashboard() {
  if (!currentUser) return;

  // Avatar initials
  const avatarEl = document.getElementById('account-avatar');
  const initials = currentUser.displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (avatarEl) {
    avatarEl.textContent = initials;
    avatarEl.style.background = currentUser.role === 'judge'
      ? 'linear-gradient(135deg,#F59E0B,#D97706)'
      : currentUser.role === 'admin'
      ? 'linear-gradient(135deg,#8B5CF6,#7C3AED)'
      : 'linear-gradient(135deg,var(--teal),var(--teal-dark))';
    avatarEl.style.boxShadow = currentUser.role === 'judge'
      ? '0 8px 24px rgba(245,158,11,.35)'
      : currentUser.role === 'admin'
      ? '0 8px 24px rgba(139,92,246,.35)'
      : '0 8px 24px rgba(20,184,166,.3)';
  }

  const nameEl = document.getElementById('account-displayname');
  const handleEl = document.getElementById('account-username-display');
  if (nameEl) nameEl.textContent = currentUser.displayName;
  if (handleEl) handleEl.textContent = '@' + currentUser.username;

  const badgeEl = document.getElementById('account-role-badge');
  if (badgeEl) {
    badgeEl.textContent = currentUser.role === 'judge' ? 'Competition Judge' : currentUser.role === 'admin' ? 'Administrator' : 'Community Member';
    badgeEl.className = 'account-role-badge ' + (currentUser.role === 'judge' ? 'badge-judge' : currentUser.role === 'admin' ? 'badge-admin' : 'badge-user');
  }

  // Stats
  const userEvents = getUserRegisteredEvents();
  const evCountEl = document.getElementById('acc-events-count');
  const favCountEl = document.getElementById('acc-favs-count');
  const revCountEl = document.getElementById('acc-reviews-count');
  const subCountEl = document.getElementById('acc-submissions-count');
  if (evCountEl) evCountEl.textContent = userEvents.length;
  if (favCountEl) favCountEl.textContent = favorites.size;
  if (revCountEl) {
    // Count reviews submitted by this user across all resources
    let reviewCount = 0;
    Object.values(pendingReviews).forEach(rvArr => {
      rvArr.forEach(rv => {
        const authorName = typeof rv.author === 'object' ? (rv.author.displayName || rv.author.username) : rv.author;
        if (authorName === currentUser.displayName || authorName === currentUser.username) reviewCount++;
      });
    });
    revCountEl.textContent = reviewCount;
  }

  // Submissions tracking
  const userSubmissions = submissionQueue.filter(sub => {
    return sub.submittedByUsername === currentUser.username || sub.submittedBy === currentUser.username;
  });
  const approvedSubmissions = JSON.parse(localStorage.getItem('crh_approved_' + currentUser.username) || '[]');
  const totalSubmitted = userSubmissions.length + approvedSubmissions.length;
  if (subCountEl) subCountEl.textContent = totalSubmitted;

  const subSection = document.getElementById('acc-submissions-section');
  if (subSection) {
    subSection.style.display = totalSubmitted > 0 ? '' : 'none';
    const subList = document.getElementById('account-submissions-list');
    if (subList) {
      if (totalSubmitted === 0) {
        subList.innerHTML = '<p class="account-empty-msg">No submissions yet.</p>';
      } else {
        const pendingHtml = userSubmissions.map(sub => `
          <div class="account-event-item">
            <div style="width:8px;height:8px;border-radius:50%;background:#F59E0B;flex-shrink:0;margin-top:5px"></div>
            <div class="account-event-info">
              <div class="account-event-title">${sub.name}</div>
              <div class="account-event-meta"><span style="color:#F59E0B;font-weight:700">Pending Review</span> · ${sub.submittedAt}</div>
            </div>
          </div>`).join('');
        const approvedHtml = approvedSubmissions.map(sub => `
          <div class="account-event-item">
            <div style="width:8px;height:8px;border-radius:50%;background:#10B981;flex-shrink:0;margin-top:5px"></div>
            <div class="account-event-info">
              <div class="account-event-title">${sub.name}</div>
              <div class="account-event-meta"><span style="color:#10B981;font-weight:700">Approved</span> · ${sub.submittedAt}</div>
            </div>
          </div>`).join('');
        subList.innerHTML = pendingHtml + approvedHtml;
      }
    }
  }

  // Registered events list
  const eventsList = document.getElementById('account-events-list');
  if (eventsList) {
    if (userEvents.length === 0) {
      eventsList.innerHTML = '<p class="account-empty-msg">No events registered yet.<br>Browse events below to get started!</p>';
    } else {
      eventsList.innerHTML = userEvents.map(ev => {
        const d = new Date(ev.date);
        const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = d.getDate();
        const evJSON = JSON.stringify(ev).replace(/"/g, '&quot;');
        return `
          <div class="account-event-item">
            <div class="account-event-date">
              <div class="account-event-month">${month}</div>
              <div class="account-event-day">${day}</div>
            </div>
            <div class="account-event-info">
              <div class="account-event-title">${ev.title}</div>
              <div class="account-event-meta">${ev.time} · ${ev.location || 'Harrisonburg, VA'}</div>
            </div>
            <div class="account-event-actions">
              <button class="account-cal-btn" onclick="showCalendarDialog(${evJSON})" title="Add to calendar">
                <span data-lucide="calendar-plus" class="w-3.5 h-3.5"></span>
              </button>
              <button class="account-unreg-btn" onclick="unregisterEvent(${ev.id})" title="Unregister from event">
                <span data-lucide="x" class="w-3.5 h-3.5"></span>
              </button>
            </div>
          </div>`;
      }).join('');
    }
  }

  // Favorites preview
  const favsPreview = document.getElementById('account-favs-preview');
  if (favsPreview) {
    if (favorites.size === 0) {
      favsPreview.innerHTML = '<p class="account-empty-msg">No favorites saved yet.</p>';
    } else {
      const items = [];
      favorites.forEach(key => {
        const [type, idStr] = key.split('-');
        const id = parseInt(idStr);
        if (type === 'r') {
          const r = RESOURCES.find(x => x.id === id);
          if (r) items.push({ name: r.name, cat: r.category });
        } else if (type === 'e') {
          const ev = EVENTS.find(x => x.id === id);
          if (ev) items.push({ name: ev.title, cat: 'Event' });
        }
      });
      const preview = items.slice(0, 5);
      favsPreview.innerHTML = preview.map(item =>
        `<div class="account-fav-chip"><span>${catEmoji(item.cat)}</span><span>${item.name.split(' ').slice(0,3).join(' ')}</span></div>`
      ).join('') + (items.length > 5 ? `<div class="account-fav-chip account-fav-more">+${items.length - 5} more</div>` : '');
    }
  }

  lucide.createIcons();
}

/* ═══════════════════════════════════════════════════════
   THREE.JS 3D VIRTUAL WORLD — FPS City Explorer
═══════════════════════════════════════════════════════ */
let world3DScene = null;
let world3DRenderer = null;
let world3DCamera = null;
let world3DControls = null;    // PointerLockControls
let world3DAnimFrame = null;
let world3DSelectedResource = null;
let world3DProximityResource = null;
const world3DBuildingGroups = [];
let world3DKeys = {};
let world3DKeyDownHandler = null;
let world3DKeyUpHandler = null;
let world3DClickHandler = null;
let world3DResize = null;

function startWorld3D() {
  const modal = document.getElementById('world3d-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Legend
  const legend = document.getElementById('world3d-legend');
  const W3D_CAT_COLORS = { Food: '#F97316', Health: '#EF4444', Education: '#3B82F6', Housing: '#10B981', Volunteer: '#8B5CF6', Support: '#F59E0B' };
  if (legend) {
    legend.innerHTML = Object.entries(W3D_CAT_COLORS).map(([cat, color]) =>
      `<div class="world3d-legend-item"><div class="world3d-legend-dot" style="background:${color};box-shadow:0 0 6px ${color}80"></div><span>${cat}</span></div>`
    ).join('');
  }

  const canvas = document.getElementById('world3d-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    showToast('3D engine loading — try again in a moment!');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    return;
  }
  if (!THREE.PointerLockControls) {
    showToast('PointerLockControls not loaded — try again');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    return;
  }

  const W = window.innerWidth, H = window.innerHeight;
  const CAT_HEX = { Food: 0xF97316, Health: 0xEF4444, Education: 0x3B82F6, Housing: 0x10B981, Volunteer: 0x8B5CF6, Support: 0xF59E0B };

  // ── Scene ─────────────────────────────────────────────────────────
  world3DScene = new THREE.Scene();
  world3DScene.background = new THREE.Color(0x5B8DD9);
  world3DScene.fog = new THREE.FogExp2(0x8BB8E8, 0.007);

  // ── Camera ────────────────────────────────────────────────────────
  world3DCamera = new THREE.PerspectiveCamera(72, W / H, 0.1, 500);

  // ── Renderer ──────────────────────────────────────────────────────
  world3DRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  world3DRenderer.setSize(W, H);
  world3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  world3DRenderer.shadowMap.enabled = true;
  world3DRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  world3DRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  world3DRenderer.toneMappingExposure = 1.1;

  // ── Controls ──────────────────────────────────────────────────────
  world3DControls = new THREE.PointerLockControls(world3DCamera, document.body);
  world3DScene.add(world3DControls.getObject());
  world3DControls.getObject().position.set(0, 1.75, 60);

  const clickToPlay = document.getElementById('world3d-click-to-play');
  const fpsHud = document.getElementById('world3d-fps-hud');
  const enterBtn = document.getElementById('world3d-enter-btn');
  world3DControls.addEventListener('lock', () => {
    if (clickToPlay) clickToPlay.style.display = 'none';
    if (fpsHud) fpsHud.style.display = 'flex';
    world3DKeys = {};
  });
  world3DControls.addEventListener('unlock', () => {
    const panel = document.getElementById('world3d-info');
    if (!panel || panel.classList.contains('hidden')) {
      if (clickToPlay) clickToPlay.style.display = 'flex';
    }
    if (fpsHud) fpsHud.style.display = 'none';
    world3DKeys = {};
  });
  if (enterBtn) enterBtn.onclick = () => world3DControls.lock();

  // ── Input ─────────────────────────────────────────────────────────
  world3DKeys = {};
  world3DKeyDownHandler = e => {
    world3DKeys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'e' && world3DProximityResource !== null) {
      showWorld3DResourceInfo(world3DProximityResource);
    }
  };
  world3DKeyUpHandler = e => { world3DKeys[e.key.toLowerCase()] = false; };
  document.addEventListener('keydown', world3DKeyDownHandler);
  document.addEventListener('keyup', world3DKeyUpHandler);

  const raycaster = new THREE.Raycaster();
  world3DClickHandler = () => {
    if (!world3DControls || !world3DControls.isLocked) return;
    raycaster.setFromCamera({ x: 0, y: 0 }, world3DCamera);
    const allInteractable = [];
    world3DBuildingGroups.forEach(g => { if (g.userData.interactMesh) allInteractable.push(g.userData.interactMesh); });
    const hits = raycaster.intersectObjects(allInteractable, false);
    if (hits.length && hits[0].distance < 30) {
      const rid = hits[0].object.userData.resourceId;
      if (rid != null) showWorld3DResourceInfo(rid);
    }
  };
  document.addEventListener('click', world3DClickHandler);

  // ── Shared materials ──────────────────────────────────────────────
  const metalM   = new THREE.MeshStandardMaterial({ color: 0x7A8A9A, roughness: 0.3, metalness: 0.8 });
  const darkM    = new THREE.MeshStandardMaterial({ color: 0x1A1A2E, roughness: 0.8 });
  const concreteM= new THREE.MeshStandardMaterial({ color: 0x8A9AAA, roughness: 0.95 });
  const sidewalkM= new THREE.MeshStandardMaterial({ color: 0xB0B8C4, roughness: 0.9 });
  const roadM    = new THREE.MeshStandardMaterial({ color: 0x2A2A3A, roughness: 0.95 });
  const lineM    = new THREE.MeshBasicMaterial({ color: 0xFFFFCC });
  const whiteLineM = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const grassM   = new THREE.MeshStandardMaterial({ color: 0x3D7A35, roughness: 0.95 });
  const darkGrassM= new THREE.MeshStandardMaterial({ color: 0x2D5C28, roughness: 0.95 });
  const waterM   = new THREE.MeshStandardMaterial({ color: 0x2E6FA3, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.85 });
  const woodM    = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.9 });
  const redM     = new THREE.MeshStandardMaterial({ color: 0xCC2222, roughness: 0.7 });

  // ── Lighting ──────────────────────────────────────────────────────
  world3DScene.add(new THREE.AmbientLight(0xD4E8FF, 0.7));
  const sun = new THREE.DirectionalLight(0xFFF4D0, 2.2);
  sun.position.set(80, 120, 60);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 350;
  sun.shadow.camera.left = -120; sun.shadow.camera.right = 120;
  sun.shadow.camera.top = 120; sun.shadow.camera.bottom = -120;
  world3DScene.add(sun);
  const fillL = new THREE.DirectionalLight(0xA8C4E8, 0.5);
  fillL.position.set(-60, 40, -40);
  world3DScene.add(fillL);
  const skyL = new THREE.HemisphereLight(0x6699CC, 0x334422, 0.6);
  world3DScene.add(skyL);

  // ── Helpers ───────────────────────────────────────────────────────
  function box(w, h, d, mat, x, y, z, shadow) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    if (shadow) { m.castShadow = true; m.receiveShadow = true; }
    world3DScene.add(m);
    return m;
  }
  function plane(w, d, mat, x, y, z, ry) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = -Math.PI / 2;
    if (ry) m.rotation.z = ry;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    world3DScene.add(m);
    return m;
  }
  function cyl(rt, rb, h, seg, mat, x, y, z, shadow) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    if (shadow) { m.castShadow = true; m.receiveShadow = true; }
    world3DScene.add(m);
    return m;
  }

  // ── Ground ────────────────────────────────────────────────────────
  plane(500, 500, grassM, 0, 0, 0);

  // ── Roads ─────────────────────────────────────────────────────────
  // ── Road network: 3 N-S avenues + 5 E-W cross streets + alleys ───
  const NS_ROADS = [0, 34, -34];       // three parallel N-S avenues
  const EW_ROADS = [-55, -27, 0, 27, 55]; // five cross streets
  const ROAD_W = 13;                    // road width
  const SW_W  = 2.8;                    // sidewalk width

  // N-S avenues
  NS_ROADS.forEach(rx => {
    plane(ROAD_W, 310, roadM, rx, 0.01, 0);
    plane(SW_W, 310, sidewalkM, rx + ROAD_W/2 + SW_W/2, 0.015, 0);
    plane(SW_W, 310, sidewalkM, rx - ROAD_W/2 - SW_W/2, 0.015, 0);
    // Center dashes
    for (let z = -150; z < 150; z += 9) plane(0.3, 4.5, lineM, rx, 0.025, z);
    // Lane separator line
    for (let z = -150; z < 150; z += 1) plane(0.08, 0.9, lineM, rx - 2.5, 0.026, z);
    for (let z = -150; z < 150; z += 1) plane(0.08, 0.9, lineM, rx + 2.5, 0.026, z);
  });

  // E-W cross streets spanning all avenues + beyond
  EW_ROADS.forEach(cz => {
    plane(160, ROAD_W, roadM, 0, 0.01, cz);
    plane(160, SW_W, sidewalkM, 0, 0.016, cz + ROAD_W/2 + SW_W/2);
    plane(160, SW_W, sidewalkM, 0, 0.016, cz - ROAD_W/2 - SW_W/2);
    // Center dashes
    for (let x = -75; x < 75; x += 9) plane(4.5, 0.3, lineM, x, 0.025, cz);
  });

  // Crosswalks at every N-S × E-W intersection
  NS_ROADS.forEach(rx => {
    EW_ROADS.forEach(cz => {
      for (let s = 0; s < 5; s++) {
        const stripe = 1.4;
        plane(stripe, ROAD_W * 0.6, whiteLineM, rx - ROAD_W/2 - stripe + s * stripe * 2.1, 0.027, cz);
        plane(ROAD_W * 0.6, stripe, whiteLineM, rx, 0.027, cz - ROAD_W/2 - stripe + s * stripe * 2.1);
      }
    });
  });

  // Short E-W alley at Z=14 between 0 and 27 cross streets (connecting detail)
  plane(110, 7, roadM, 0, 0.01, 14);
  for (let x = -50; x < 50; x += 7) plane(3.5, 0.2, lineM, x, 0.025, 14);

  // Parking lot entry road
  plane(8, 18, roadM, 54, 0.01, -62);
  plane(8, 18, roadM, -54, 0.01, 38);

  // ── Collision boxes: [minX, maxX, minZ, maxZ] ─────────────────────
  const colliders = [];

  // ── Buildings ─────────────────────────────────────────────────────
  world3DBuildingGroups.length = 0;
  // City blocks: between avenues and beyond outer avenues, 5 depth rows
  // Columns: X=±17 (between X=0 and X=±34), X=±55 (outside X=±34)
  const buildingSlots = [];
  [-55, -17, 17, 55].forEach(bx => {
    [-48, -21, 7, 41, 68].forEach(bz => {
      buildingSlots.push([bx, bz]);
    });
  });

  RESOURCES.forEach((r, i) => {
    if (i >= buildingSlots.length) return;
    const [bx, bz] = buildingSlots[i];
    const colorHex = CAT_HEX[r.category] || 0x14B8A6;
    const hex6 = '#' + colorHex.toString(16).padStart(6, '0');
    const bW = 10 + (i % 3) * 2;
    const bD = 9 + (i % 2);
    const bH = 6 + Math.round(r.rating * 2.5) + (i % 4) * 3;

    // Store collider
    colliders.push({ minX: bx - bW/2 - 0.5, maxX: bx + bW/2 + 0.5, minZ: bz - bD/2 - 0.5, maxZ: bz + bD/2 + 0.5 });

    const group = new THREE.Group();
    group.position.set(bx, 0, bz);
    group.userData = { resourceId: r.id };

    // Foundation / plinth
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x404858, roughness: 0.8 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(bW + 1, 0.5, bD + 1), plinthMat);
    plinth.position.y = 0.25; plinth.receiveShadow = true;
    group.add(plinth);

    // Building skin — vary style by category
    const skinColor = new THREE.Color(colorHex).lerp(new THREE.Color(0x334455), 0.55);
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6, metalness: 0.25 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), skinMat);
    body.position.y = bH / 2 + 0.5;
    body.castShadow = true; body.receiveShadow = true;
    body.userData.resourceId = r.id;
    group.userData.interactMesh = body;
    group.add(body);

    // Glass accent panels (vertical strips on facade)
    const glassMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.55 });
    [-bW/4, bW/4].forEach(sx => {
      const glass = new THREE.Mesh(new THREE.BoxGeometry(bW/5, bH - 1, 0.15), glassMat);
      glass.position.set(sx, bH/2 + 0.5, bD/2 + 0.08);
      group.add(glass);
    });

    // Windows — each building has its own lit/unlit pattern, on all 4 sides
    const winLitColor = [0xFFFDE0, 0xE8F4FF, 0xFFF0CC, 0xF0FFE8][i % 4];
    const winOnMat = new THREE.MeshBasicMaterial({ color: winLitColor });
    const winOffMat = new THREE.MeshBasicMaterial({ color: 0x1C2A3A });
    const blindMat = new THREE.MeshBasicMaterial({ color: 0x8899AA });
    const winCols = Math.floor(bW / 2.5);
    const winRowsN = Math.floor((bH - 2) / 2.8);
    // Front & back
    [bD/2 + 0.12, -(bD/2 + 0.12)].forEach((fz, fi) => {
      for (let wr = 0; wr < winRowsN; wr++) {
        for (let wc = 0; wc < winCols; wc++) {
          const rnd = Math.random();
          const wMat = rnd > 0.3 ? winOnMat : rnd > 0.1 ? blindMat : winOffMat;
          const w2 = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.85), wMat);
          w2.position.set(-bW/2 + 1.25 + wc * 2.5, 2.4 + wr * 2.8, fz);
          if (fi === 1) w2.rotation.y = Math.PI;
          group.add(w2);
        }
      }
    });
    // Side windows
    const sWinCols = Math.floor(bD / 2.5);
    [bW/2 + 0.12, -(bW/2 + 0.12)].forEach((fx, fi) => {
      for (let wr = 0; wr < winRowsN; wr++) {
        for (let wc2 = 0; wc2 < sWinCols; wc2++) {
          const rnd2 = Math.random();
          const wMat2 = rnd2 > 0.35 ? winOnMat : rnd2 > 0.12 ? blindMat : winOffMat;
          const sw = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.85), wMat2);
          sw.position.set(fx, 2.4 + wr * 2.8, -bD/2 + 1.25 + wc2 * 2.5);
          sw.rotation.y = fi === 0 ? Math.PI/2 : -Math.PI/2;
          group.add(sw);
        }
      }
    });

    // Ground-floor entrance — varies by building index
    const doorStyle = i % 4;
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: [0x888888, 0xC8A850, 0x445566, 0x333333][doorStyle], roughness: 0.4, metalness: 0.5 });
    const doorGlassMat = new THREE.MeshStandardMaterial({ color: 0x88BBCC, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.65 });
    // Door surround
    const dSurround = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 0.25), doorFrameMat);
    dSurround.position.set(0, 1.7, bD/2 + 0.13);
    group.add(dSurround);
    // Door glass
    const dGlass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.7, 0.1), doorGlassMat);
    dGlass.position.set(0, 1.6, bD/2 + 0.22);
    group.add(dGlass);
    // Awning above door
    const awningColors = [0xC8202020, 0x203070C8, 0x20C87030, 0x2030C820];
    const awMat = new THREE.MeshStandardMaterial({ color: [0xCC2222, 0x2255BB, 0xBB7722, 0x228844][doorStyle], roughness: 0.7 });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(4, 0.12, 1.8), awMat);
    awning.position.set(0, 3.5, bD/2 + 1.1);
    awning.rotation.x = -0.18;
    group.add(awning);
    // Steps up to door
    [0, 0.15].forEach((sy, si) => {
      const step = new THREE.Mesh(new THREE.BoxGeometry(3.8 - si * 0.5, 0.15, 0.55), concreteM);
      step.position.set(0, sy + 0.08, bD/2 + 0.9 - si * 0.3);
      group.add(step);
    });

    // Fire escape on some buildings
    if (i % 3 === 1) {
      const feMat = new THREE.MeshStandardMaterial({ color: 0x666677, roughness: 0.4, metalness: 0.7 });
      for (let fe = 0; fe < Math.min(3, Math.floor(bH / 4)); fe++) {
        const fePlatform = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 1.5), feMat);
        fePlatform.position.set(bW/2 - 1.2, 2.5 + fe * 4, bD/2 + 0.8);
        group.add(fePlatform);
        [-1.1, 1.1].forEach(rx => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), feMat);
          rail.position.set(bW/2 - 1.2 + rx, 2.55 + fe * 4 + 0.55, bD/2 + 0.8);
          group.add(rail);
        });
      }
    }
    // Balconies on some buildings
    if (i % 4 === 2 && bH > 8) {
      const balMat = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.6, metalness: 0.4 });
      for (let bl = 1; bl < Math.min(3, Math.floor(bH / 5)); bl++) {
        const balFloor = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 1.2), balMat);
        balFloor.position.set(0, bl * 5, bD/2 + 0.7);
        group.add(balFloor);
        const balRail = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 0.06), balMat);
        balRail.position.set(0, bl * 5 + 0.45, bD/2 + 1.25);
        group.add(balRail);
      }
    }

    // Rooftop details
    const roofCapMat = new THREE.MeshStandardMaterial({ color: 0x1A202C, roughness: 0.7 });
    const roofCap = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.6, 0.6, bD + 0.6), roofCapMat);
    roofCap.position.y = bH + 0.8; roofCap.castShadow = true;
    group.add(roofCap);
    // AC units / vents on roof — count varies per building
    const acCount = 1 + (i % 3);
    for (let ac2 = 0; ac2 < acCount; ac2++) {
      const acUnit = new THREE.Mesh(new THREE.BoxGeometry(1.4 + (ac2 % 2) * 0.5, 0.8 + (ac2 % 2) * 0.4, 1.4), concreteM);
      acUnit.position.set(-bW/3 + ac2 * (bW / acCount), bH + 1.2, (ac2 % 2 === 0 ? bD/4 : -bD/4));
      group.add(acUnit);
    }
    // Water tower on 1-in-4 buildings
    if (i % 4 === 3) {
      const wtMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.85 });
      const wtPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), metalM);
      wtPost.position.set(-bW/4, bH + 2.1, bD/4);
      group.add(wtPost);
      const wtTank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 1.6, 10), wtMat);
      wtTank.position.set(-bW/4, bH + 3.4, bD/4);
      group.add(wtTank);
    }
    // Antenna
    const antMat = new THREE.MeshStandardMaterial({ color: 0xCCCCDD, roughness: 0.4, metalness: 0.7 });
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), antMat);
    ant.position.set(bW/4, bH + 2.8, -bD/4);
    group.add(ant);

    // Billboard — large double-sided sign on tall pole above building
    const postMat2 = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.4, metalness: 0.6 });
    const bbH = bH + 6;
    const bbPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, bbH, 8), postMat2);
    bbPost.position.set(bW/2 + 3.5, bbH/2, 0);
    group.add(bbPost);

    // Billboard canvas — large and readable
    const bbCv = document.createElement('canvas');
    bbCv.width = 1024; bbCv.height = 512;
    const bctx = bbCv.getContext('2d');
    // Dark background
    bctx.fillStyle = '#0D1B2A';
    bctx.fillRect(0, 0, 1024, 512);
    // Top color bar
    bctx.fillStyle = hex6;
    bctx.fillRect(0, 0, 1024, 80);
    // Inner dark
    bctx.fillStyle = 'rgba(0,0,0,0.35)';
    bctx.fillRect(0, 80, 1024, 432);
    // Rounded highlight bar at bottom
    bctx.fillStyle = hex6;
    bctx.globalAlpha = 0.18;
    bctx.fillRect(0, 440, 1024, 72);
    bctx.globalAlpha = 1;
    // Category + emoji
    bctx.font = 'bold 52px Arial';
    bctx.fillStyle = 'white';
    bctx.fillText(`${catEmoji(r.category)}  ${r.category.toUpperCase()}`, 24, 62);
    // Name (word wrap)
    bctx.font = 'bold 58px Arial';
    bctx.fillStyle = 'white';
    const bbWords = r.name.split(' ');
    let bbLine = '', bbY = 160;
    bbWords.forEach(word => {
      const test = bbLine ? bbLine + ' ' + word : word;
      if (bctx.measureText(test).width > 970 && bbLine) {
        bctx.fillText(bbLine, 24, bbY); bbLine = word; bbY += 68;
      } else { bbLine = test; }
    });
    bctx.fillText(bbLine, 24, bbY);
    // Rating bar
    bctx.fillStyle = 'rgba(255,255,255,0.55)';
    bctx.font = '38px Arial';
    bctx.fillText(`⭐ ${r.rating}   ·   ${r.reviews} reviews   ·   ${r.cost === 'free' ? '✅ Free' : '💰 Paid'}`, 24, 470);
    // Border frame
    bctx.strokeStyle = hex6;
    bctx.lineWidth = 8;
    bctx.strokeRect(4, 4, 1016, 504);

    const bbTex = new THREE.CanvasTexture(bbCv);
    // Panel: very wide and tall, mounted low near the top of the building, not in the sky
    const bbPanelMesh = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), new THREE.MeshBasicMaterial({ map: bbTex, side: THREE.DoubleSide }));
    bbPanelMesh.position.set(bW/2 + 3.5, bH + 4, 0);
    group.userData.billboard = bbPanelMesh;
    group.add(bbPanelMesh);

    // Icon sprite just above the billboard panel
    const icCv = document.createElement('canvas');
    icCv.width = 256; icCv.height = 256;
    const ictx2 = icCv.getContext('2d');
    ictx2.clearRect(0, 0, 256, 256);
    const grd = ictx2.createRadialGradient(128, 128, 20, 128, 128, 120);
    grd.addColorStop(0, hex6);
    grd.addColorStop(1, 'transparent');
    ictx2.fillStyle = grd;
    ictx2.beginPath(); ictx2.arc(128, 128, 120, 0, Math.PI * 2); ictx2.fill();
    ictx2.font = '140px serif';
    ictx2.textAlign = 'center'; ictx2.textBaseline = 'middle';
    ictx2.fillText(catEmoji(r.category), 128, 136);
    const icTex = new THREE.CanvasTexture(icCv);
    const icMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ map: icTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.05 }));
    icMesh.position.set(bW/2 + 3.5, bH + 10, 0);
    group.userData.iconSprite = icMesh;
    group.add(icMesh);

    // Ground glow ring
    const glowMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
    const glow = new THREE.Mesh(new THREE.RingGeometry(bW/2, bW/2 + 3, 32), glowMat);
    glow.rotation.x = -Math.PI / 2; glow.position.y = 0.02;
    group.add(glow);

    // Point light
    const pt = new THREE.PointLight(colorHex, 1.2, 20);
    pt.position.set(0, 2, 0);
    group.add(pt);

    world3DScene.add(group);
    world3DBuildingGroups.push(group);
  });

  // ── Trees ─────────────────────────────────────────────────────────
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6B4226, roughness: 0.9 });
  const leafMats = [
    new THREE.MeshStandardMaterial({ color: 0x2D6A2D, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x3A7A2A, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x1F5C1F, roughness: 0.9 }),
  ];
  function addTree(tx, tz, scale) {
    scale = scale || 1;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18*scale, 0.28*scale, 2.5*scale, 8), trunkMat);
    tr.position.set(tx, 1.25*scale, tz); tr.castShadow = true;
    world3DScene.add(tr);
    const lm = leafMats[Math.floor(Math.random() * leafMats.length)];
    [0, 1.4*scale, 2.5*scale].forEach((yOff, li) => {
      const r2 = (2.8 - li * 0.6) * scale;
      const lc = new THREE.Mesh(new THREE.ConeGeometry(r2, 3.5*scale, 8), lm);
      lc.position.set(tx, 3.5*scale + yOff, tz); lc.castShadow = true;
      world3DScene.add(lc);
    });
  }
  // Cross street Z positions — trees must stay clear of these
  const xStreetZs = [-55, -28, 0, 28, 55];
  function isNearRoad(z, clearance) { return xStreetZs.some(cz => Math.abs(z - cz) < clearance); }

  // Trees on grass strip outside sidewalks (X=±13.5, well clear of road)
  for (let z = -145; z < 155; z += 14) {
    if (isNearRoad(z, 12)) continue; // skip near cross streets
    if (Math.random() < 0.2) continue; // occasional gaps
    addTree(13.5 + Math.random() * 1.5, z + (Math.random()-0.5)*5, 0.85 + Math.random() * 0.5);
    addTree(-13.5 - Math.random() * 1.5, z + (Math.random()-0.5)*5, 0.85 + Math.random() * 0.5);
  }
  // Dense tree rows behind buildings (far edges)
  for (let z = -130; z < 130; z += 10) {
    if (isNearRoad(z, 8)) continue;
    addTree(70 + Math.random()*8, z, 1.0 + Math.random()*0.6);
    addTree(-70 - Math.random()*8, z, 1.0 + Math.random()*0.6);
  }
  // Park clusters on grass lots
  [[-70,-60],[-70,20],[70,-60],[70,20]].forEach(([px, pz]) => {
    for (let t = 0; t < 7; t++) {
      addTree(px + (Math.random()-0.5)*14, pz + (Math.random()-0.5)*14, 0.9 + Math.random()*0.8);
    }
  });
  // Trees beside building entrances (on grass, not in road)
  buildingSlots.forEach(([bx, bz], i) => {
    if (i % 4 === 0 && !isNearRoad(bz, 10)) {
      addTree(bx + (bx > 0 ? 7 : -7), bz, 0.7 + Math.random()*0.4);
    }
  });

  // ── Bushes ────────────────────────────────────────────────────────
  const bushMats = [
    new THREE.MeshStandardMaterial({ color: 0x256325, roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: 0x1D4D1D, roughness: 0.95 }),
  ];
  function addBush(bshx, bshz) {
    const bm = bushMats[Math.floor(Math.random() * bushMats.length)];
    [0, 0.7, -0.5].forEach((ox, bi) => {
      const bs = new THREE.Mesh(new THREE.SphereGeometry(0.6 + bi*0.2, 7, 6), bm);
      bs.position.set(bshx + ox, 0.5, bshz + (bi-1)*0.4);
      bs.castShadow = true;
      world3DScene.add(bs);
    });
  }
  for (let z = -130; z < 150; z += 24) {
    addBush(10.5, z + 6);
    addBush(-10.5, z + 12);
  }
  buildingSlots.forEach(([bx, bz], i) => {
    if (i % 2 === 1) { addBush(bx - 7, bz + 5); addBush(bx + 5, bz + 6); }
  });

  // ── Benches ───────────────────────────────────────────────────────
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.85 });
  const benchLegMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.6 });
  function addBench(bex, bez, rot) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.7), benchMat);
    seat.position.y = 0.7; seat.castShadow = true;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.1), benchMat);
    back.position.set(0, 1.1, -0.35); back.castShadow = true;
    g.add(back);
    [-0.9, 0.9].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.6), benchLegMat);
      leg.position.set(lx, 0.35, 0); g.add(leg);
    });
    g.rotation.y = rot || 0;
    g.position.set(bex, 0, bez);
    world3DScene.add(g);
  }
  for (let z = -120; z < 130; z += 28) {
    addBench(11.5, z, 0);
    addBench(-11.5, z + 10, 0);
  }

  // ── Park + Pond ───────────────────────────────────────────────────
  // Park tile
  plane(30, 30, darkGrassM, -70, 0.005, -35);
  // Pond
  const pondM2 = new THREE.Mesh(new THREE.CircleGeometry(7, 32), waterM);
  pondM2.rotation.x = -Math.PI / 2; pondM2.position.set(-70, 0.08, -35);
  world3DScene.add(pondM2);
  // Pond rim
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x8899AA, roughness: 0.7 });
  const rim = new THREE.Mesh(new THREE.RingGeometry(7, 7.8, 32), rimMat);
  rim.rotation.x = -Math.PI / 2; rim.position.set(-70, 0.06, -35);
  world3DScene.add(rim);
  // Park benches around pond
  [[0,9,0],[0,-9,Math.PI],[9,0,-Math.PI/2],[-9,0,Math.PI/2]].forEach(([dx,dz,r2]) => addBench(-70+dx, -35+dz, r2));
  // Flower beds
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xFFB347, roughness: 0.9 });
  for (let fi = 0; fi < 12; fi++) {
    const ang = (fi / 12) * Math.PI * 2;
    const fc = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 5), flowerMat);
    fc.position.set(-70 + Math.cos(ang)*8.5, 0.3, -35 + Math.sin(ang)*8.5);
    world3DScene.add(fc);
  }

  // ── Cars ──────────────────────────────────────────────────────────
  const carColors = [0xC0392B, 0x2980B9, 0xF39C12, 0x27AE60, 0x8E44AD, 0x2C3E50, 0xE74C3C, 0x1ABC9C];
  function addCar(cx, cz, ry, cColorHex) {
    const g = new THREE.Group();
    const bodyMat2 = new THREE.MeshStandardMaterial({ color: cColorHex, roughness: 0.3, metalness: 0.6 });
    const glassCarMat = new THREE.MeshStandardMaterial({ color: 0x88BBDD, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.7 });
    // Body
    const carBody = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 2.0), bodyMat2);
    carBody.position.y = 0.85; carBody.castShadow = true; carBody.receiveShadow = true;
    g.add(carBody);
    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 1.85), glassCarMat);
    cabin.position.set(-0.2, 1.7, 0); g.add(cabin);
    // Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.9 });
    const rimCarMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.3, metalness: 0.8 });
    [[-1.4, 0, 1.1],[1.4, 0, 1.1],[-1.4, 0,-1.1],[1.4, 0,-1.1]].forEach(([wx, wy, wz]) => {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.32, 14), wheelMat);
      wh.rotation.x = Math.PI/2; wh.position.set(wx, 0.42, wz); g.add(wh);
      const rim2 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.34, 10), rimCarMat);
      rim2.rotation.x = Math.PI/2; rim2.position.set(wx, 0.42, wz); g.add(rim2);
    });
    // Headlights
    const headMat = new THREE.MeshBasicMaterial({ color: 0xFFFFCC });
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xFF2222 });
    [[2.12,0.9,0.7,headMat],[2.12,0.9,-0.7,headMat],[-2.12,0.9,0.7,tailMat],[-2.12,0.9,-0.7,tailMat]].forEach(([lx,ly,lz,lm]) => {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.35), lm);
      l.position.set(lx, ly, lz); g.add(l);
    });
    g.rotation.y = ry;
    g.position.set(cx, 0, cz);
    world3DScene.add(g);
  }
  // ── Parking Lots ──────────────────────────────────────────────────
  const lotMat = new THREE.MeshStandardMaterial({ color: 0x1E1E2A, roughness: 0.95 });
  const lotLineMat = new THREE.MeshBasicMaterial({ color: 0xCCCCCC });
  function addParkingLot(lotX, lotZ, cols, rows) {
    const spW = 5.5, spD = 11;
    const lotW = cols * spW + 2, lotD = rows * spD + 4;
    plane(lotW, lotD, lotMat, lotX, 0.012, lotZ);
    for (let r3 = 0; r3 < rows; r3++) {
      for (let c3 = 0; c3 <= cols; c3++) {
        const lx3 = lotX - (cols*spW)/2 + c3*spW;
        const lz3 = lotZ - (rows*spD)/2 + r3*spD + 2;
        plane(0.2, spD - 0.5, lotLineMat, lx3, 0.022, lz3);
      }
    }
    // Drive lane down middle
    plane(2.5, lotD, lotLineMat, lotX, 0.018, lotZ);
  }
  addParkingLot(60, -70, 4, 2);
  addParkingLot(-60, 45, 4, 2);
  addParkingLot(60, 30, 3, 2);
  addParkingLot(-60, -30, 3, 2);

  let carIdx = 0;
  const parkedCarColliders = [];
  // Parked cars in lots
  // Parking lot cars: nose points along +Z or -Z into each stall row
  [[60,-70],[60,30]].forEach(([lotX, lotZ]) => {
    [-8,-2.5,3,8.5].forEach(dx => {
      addCar(lotX + dx, lotZ - 3.5, -Math.PI/2, carColors[carIdx++ % carColors.length]);
      addCar(lotX + dx, lotZ + 3.5,  Math.PI/2, carColors[carIdx++ % carColors.length]);
      parkedCarColliders.push({ minX: lotX+dx-2.5, maxX: lotX+dx+2.5, minZ: lotZ-5.5, maxZ: lotZ+5.5 });
    });
  });
  [[-60,45],[-60,-30]].forEach(([lotX, lotZ]) => {
    [-6, 0, 6].forEach(dx => {
      addCar(lotX + dx, lotZ - 3.5, -Math.PI/2, carColors[carIdx++ % carColors.length]);
      addCar(lotX + dx, lotZ + 3.5,  Math.PI/2, carColors[carIdx++ % carColors.length]);
      parkedCarColliders.push({ minX: lotX+dx-2.5, maxX: lotX+dx+2.5, minZ: lotZ-5.5, maxZ: lotZ+5.5 });
    });
  });
  // Push parked car colliders into main list
  parkedCarColliders.forEach(c => colliders.push(c));

  // Parked cars along side-street curbs — parallel to X roads (nose along X = ry=0)
  [-55, -28, 28].forEach(cz => {
    [-46, -32, -18, 18, 32, 46].forEach(cx => {
      if (Math.abs(cx) < 10) return;
      addCar(cx, cz + 10.5, 0, carColors[carIdx++ % carColors.length]);
      colliders.push({ minX: cx-2.5, maxX: cx+2.5, minZ: cz+8, maxZ: cz+13 });
    });
  });

  // ── Moving Cars ────────────────────────────────────────────────────
  // Cars drive up/down the main boulevard (X=±3.5) and along cross streets (Z=±28, ±55)
  const movingCars = [];
  function addMovingCar(sx, sz, dir, lane) {
    // dir: 'Z+','Z-','X+','X-'  lane: offset from road center
    const g = new THREE.Group();
    const bMat = new THREE.MeshStandardMaterial({ color: carColors[carIdx++ % carColors.length], roughness: 0.3, metalness: 0.6 });
    const glMat = new THREE.MeshStandardMaterial({ color: 0x88BBDD, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.7 });
    const carBod = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 2.0), bMat);
    carBod.position.y = 0.85; carBod.castShadow = true; g.add(carBod);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 1.85), glMat);
    cab.position.set(-0.2, 1.7, 0); g.add(cab);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.9 });
    const rMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.3, metalness: 0.8 });
    [[-1.4,0,1.1],[1.4,0,1.1],[-1.4,0,-1.1],[1.4,0,-1.1]].forEach(([wx,,wz]) => {
      const wh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.32, 14), wMat);
      wh2.rotation.x = Math.PI/2; wh2.position.set(wx, 0.42, wz); g.add(wh2);
      const ri2 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.34, 10), rMat);
      ri2.rotation.x = Math.PI/2; ri2.position.set(wx, 0.42, wz); g.add(ri2);
    });
    const hdMat = new THREE.MeshBasicMaterial({ color: 0xFFFFCC });
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xFF2222 });
    [[2.12,0.9,0.7,hdMat],[2.12,0.9,-0.7,hdMat],[-2.12,0.9,0.7,tlMat],[-2.12,0.9,-0.7,tlMat]].forEach(([lx,ly,lz,lm]) => {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.35), lm); l.position.set(lx,ly,lz); g.add(l);
    });
    // Car body BoxGeometry(4.2,…,2.0): length=4.2 along local X.
    // To face +Z: rotate so local +X → world +Z → rotation.y = -PI/2
    // To face -Z: rotation.y = +PI/2
    // To face +X: rotation.y = 0 (no rotation needed)
    // To face -X: rotation.y = PI
    if (dir === 'Z+') g.rotation.y = -Math.PI/2;
    else if (dir === 'Z-') g.rotation.y = Math.PI/2;
    else if (dir === 'X+') g.rotation.y = 0;
    else g.rotation.y = Math.PI;
    g.position.set(sx, 0, sz);
    world3DScene.add(g);
    const speed = 8 + Math.random() * 5;
    movingCars.push({ group: g, dir, lane, speed, baseSpeed: speed, minBound: -140, maxBound: 140 });
    return g;
  }
  // Spawn moving cars on all 3 N-S avenues with random gaps + varied speeds
  NS_ROADS.forEach(rx => {
    // Each avenue gets 4-7 cars, randomly distributed, random direction
    const carCount = 4 + Math.floor(Math.random() * 4);
    for (let ci2 = 0; ci2 < carCount; ci2++) {
      if (Math.random() < 0.2) continue; // random skip for gaps
      const startZ = -115 + ci2 * (230 / carCount) + (Math.random() - 0.5) * 25;
      const lane = (ci2 % 2 === 0 ? 1 : -1) * (2.8 + Math.random() * 0.8);
      const dir2 = lane > 0 ? 'Z+' : 'Z-';
      addMovingCar(rx + lane, startZ, dir2, rx + lane);
      { const _mc = movingCars[movingCars.length - 1]; _mc.speed = _mc.baseSpeed = 5 + Math.random() * 12; _mc.minBound = -145; _mc.maxBound = 110; }
    }
  });
  // E-W cross street cars — sparse, on a few streets only
  EW_ROADS.filter((_, i) => i % 2 === 0).forEach(rz => {
    const count = 1 + Math.floor(Math.random() * 3);
    for (let ci3 = 0; ci3 < count; ci3++) {
      if (Math.random() < 0.35) continue;
      const dir2 = ci3 % 2 === 0 ? 'X+' : 'X-';
      const laneZ = rz + (dir2 === 'X+' ? 2.5 : -2.5);
      const startX = dir2 === 'X+' ? -75 + ci3 * 30 : 75 - ci3 * 30;
      addMovingCar(startX, laneZ, dir2, laneZ);
      { const _mc = movingCars[movingCars.length - 1]; _mc.speed = _mc.baseSpeed = 6 + Math.random() * 9; }
    }
  });

  // ── People (simple humanoids) ─────────────────────────────────────
  const skinMats = [
    new THREE.MeshStandardMaterial({ color: 0xFFCBA4, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0xD4956A, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0x8D5524, roughness: 0.8 }),
  ];
  const shirtColors = [0x3B82F6, 0xEF4444, 0x10B981, 0xF97316, 0x8B5CF6, 0xEC4899, 0xFFD700];
  function addPerson(px, pz, ry) {
    const g = new THREE.Group();
    const sk = skinMats[Math.floor(Math.random()*skinMats.length)];
    const sh = new THREE.MeshStandardMaterial({ color: shirtColors[Math.floor(Math.random()*shirtColors.length)], roughness: 0.8 });
    const pant = new THREE.MeshStandardMaterial({ color: 0x334466, roughness: 0.85 });
    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.25), sh);
    torso.position.y = 1.3; torso.castShadow = true; g.add(torso);
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), sk);
    head.position.y = 1.85; g.add(head);
    // Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: [0x1A1A1A,0x8B4513,0xFFD700][Math.floor(Math.random()*3)], roughness: 1 });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6), hairMat);
    hair.position.set(0, 1.94, -0.02); hair.scale.set(1,0.6,1); g.add(hair);
    // Legs
    [-0.12, 0.12].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.18), pant);
      leg.position.set(lx, 0.65, 0); g.add(leg);
    });
    // Feet
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    [-0.12, 0.12].forEach(lx => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.25), shoeMat);
      foot.position.set(lx, 0.32, 0.04); g.add(foot);
    });
    // Arms
    [[-0.3, 1.25],[0.3, 1.25]].forEach(([ax, ay]) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), sh);
      arm.position.set(ax, ay, 0); arm.rotation.z = ax < 0 ? 0.15 : -0.15; g.add(arm);
    });
    g.rotation.y = ry;
    g.position.set(px, 0, pz);
    world3DScene.add(g);
    return g;
  }
  const peopleGroups = [];
  // Sidewalk X positions matching the 3 avenues
  const swalkXs = [
    ROAD_W/2 + SW_W/2,          // right of main (≈8)
    -(ROAD_W/2 + SW_W/2),       // left of main
    34 + ROAD_W/2 + SW_W/2,     // right of +34 avenue
    34 - ROAD_W/2 - SW_W/2,     // left of +34 avenue (≈27.5)
    -(34 + ROAD_W/2 + SW_W/2),  // right of -34 avenue (inner)
    -(34 - ROAD_W/2 - SW_W/2),  // left of -34 avenue
  ];
  // Spawn pedestrians with random gaps, different sidewalks, random starting Z
  let zCursor = -115;
  while (zCursor < 115) {
    const swX = swalkXs[Math.floor(Math.random() * swalkXs.length)];
    const dir = Math.random() > 0.5 ? 1 : -1;
    const pg = addPerson(swX + (Math.random()-0.5)*0.8, zCursor + (Math.random()-0.5)*4, dir > 0 ? 0 : Math.PI);
    pg.userData.sidewalkX = swX;
    pg.userData.walkDir = dir;
    pg.userData.walkSpeed = 1.1 + Math.random() * 2.0;
    pg.userData.walkBound = 115;
    peopleGroups.push(pg);
    // Random gap: 6–24 units so density varies
    zCursor += 6 + Math.random() * 18;
  }
  // Cluster of people near park
  for (let pi = 0; pi < 6; pi++) {
    const pg = addPerson(-70 + (Math.random()-0.5)*16, -35 + (Math.random()-0.5)*16, Math.random()*Math.PI*2);
    pg.userData.sidewalkX = null; // park wanderer — no fixed sidewalk
    pg.userData.walkDir = Math.random() > 0.5 ? 1 : -1;
    pg.userData.walkSpeed = 0.5 + Math.random() * 0.8;
    pg.userData.walkBound = -18;
    pg.userData.parkPerson = true;
    peopleGroups.push(pg);
  }

  // ── Street Lamps ──────────────────────────────────────────────────
  const lampPostMat = new THREE.MeshStandardMaterial({ color: 0x3A3A4A, roughness: 0.4, metalness: 0.7 });
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xFFF5CC });
  function addLamp(lx, lz) {
    const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 7, 8), lampPostMat);
    post2.position.set(lx, 3.5, lz); post2.castShadow = true;
    world3DScene.add(post2);
    // Arm
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.1), lampPostMat);
    arm2.position.set(lx + 0.75, 7.1, lz);
    world3DScene.add(arm2);
    const globe2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), lampGlowMat);
    globe2.position.set(lx + 1.5, 7.0, lz);
    world3DScene.add(globe2);
    const ptL = new THREE.PointLight(0xFFF5CC, 1.2, 18);
    ptL.position.set(lx + 1.5, 7.0, lz);
    world3DScene.add(ptL);
  }
  for (let z = -130; z < 130; z += 22) {
    addLamp(11, z);
    addLamp(-11, z + 11);
  }

  // ── Traffic Lights ────────────────────────────────────────────────
  // Each intersection has 4 signal heads (one per approach corner).
  // Phase A = NS green (EW red), Phase B = EW green (NS red), yellow 2s between.
  const TL_GREEN = 12, TL_YELLOW = 2.5, TL_RED = 12;
  const TL_CYCLE = TL_GREEN + TL_YELLOW + TL_RED + TL_YELLOW; // ~28.5s
  // stagger intersections by EW_ROADS index so they're not all in sync
  const tlPhaseOffsets = [0, TL_CYCLE / 5, TL_CYCLE * 2/5, TL_CYCLE * 3/5, TL_CYCLE * 4/5];

  const tlHousingMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });
  const tlPostMat    = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.6 });
  const tlOffMat     = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const tlRedMat     = new THREE.MeshBasicMaterial({ color: 0xFF2222 });
  const tlYelMat     = new THREE.MeshBasicMaterial({ color: 0xFFCC00 });
  const tlGrnMat     = new THREE.MeshBasicMaterial({ color: 0x22EE44 });

  // Returns { meshR, meshY, meshG, phaseOffset, forNS }
  // forNS = true → this head controls N-S traffic; false → E-W traffic
  const trafficLightHeads = []; // { meshR, meshY, meshG, phaseOffset, forNS }

  function addTrafficLight(px, pz, facingZ, phaseOffset, forNS) {
    // Post
    const post3 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 5.5, 8), tlPostMat);
    post3.position.set(px, 2.75, pz);
    world3DScene.add(post3);
    // Horizontal arm toward road center
    const armLen = 2.4;
    const arm3 = new THREE.Mesh(new THREE.BoxGeometry(facingZ !== 0 ? 0.1 : armLen, 0.1, facingZ !== 0 ? armLen : 0.1), tlPostMat);
    arm3.position.set(px + (facingZ !== 0 ? 0 : -armLen/2 * Math.sign(px)), 5.5, pz + (facingZ !== 0 ? -armLen/2 * Math.sign(pz || 1) : 0));
    world3DScene.add(arm3);
    // Housing box — 3 lights tall
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.7, 0.45), tlHousingMat);
    const hx = px + (facingZ !== 0 ? 0 : -armLen * Math.sign(px));
    const hz2 = pz + (facingZ !== 0 ? -armLen * Math.sign(pz || 1) : 0);
    housing.position.set(hx, 5.5, hz2);
    world3DScene.add(housing);
    // 3 light bulbs: R top, Y mid, G bottom
    const makeLight = (yOff, mat) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), mat.clone());
      m.position.set(hx, 5.5 + yOff, hz2 + 0.25);
      world3DScene.add(m);
      return m;
    };
    const meshR = makeLight(0.55, tlOffMat);
    const meshY = makeLight(0, tlOffMat);
    const meshG = makeLight(-0.55, tlOffMat);
    trafficLightHeads.push({ meshR, meshY, meshG, phaseOffset, forNS });
    return { meshR, meshY, meshG };
  }

  // Place traffic lights at every NS_ROAD × EW_ROAD intersection
  // Real-life: pole on the far-right corner of each approach; signal face away from driver's approach
  NS_ROADS.forEach(rx => {
    EW_ROADS.forEach((ez, ei) => {
      const off = tlPhaseOffsets[ei];
      const o = ROAD_W / 2 + 0.6;
      // NE corner: controls S-bound (N-S) & E-bound (E-W)
      addTrafficLight(rx + o, ez - o, -1, off, true);   // NS approach from north
      addTrafficLight(rx + o, ez + o,  1, off, false);  // EW approach from east
      addTrafficLight(rx - o, ez + o,  1, off, true);   // NS approach from south
      addTrafficLight(rx - o, ez - o, -1, off, false);  // EW approach from west
    });
  });

  // Traffic light state helper — returns 'green','yellow','red' for a given forNS flag
  function getTLState(phaseOffset, forNS, time) {
    const t = ((time + phaseOffset) % TL_CYCLE + TL_CYCLE) % TL_CYCLE;
    // Phase 0..GREEN = NS green, EW red
    // GREEN..GREEN+YEL = NS yellow, EW red
    // GREEN+YEL..GREEN+YEL+RED = NS red, EW green
    // rest = NS red, EW yellow
    if (forNS) {
      if (t < TL_GREEN) return 'green';
      if (t < TL_GREEN + TL_YELLOW) return 'yellow';
      return 'red';
    } else {
      if (t < TL_GREEN + TL_YELLOW) return 'red';
      if (t < TL_GREEN + TL_YELLOW + TL_RED) return 'green';
      if (t < TL_CYCLE) return 'yellow';
      return 'red';
    }
  }

  // ── River + Bridge ────────────────────────────────────────────────
  // River runs E-W at Z≈90-102, full width of city
  const RIVER_Z = 96, RIVER_W = 18;
  // Animated water canvas texture
  const riverCv = document.createElement('canvas');
  riverCv.width = 256; riverCv.height = 256;
  const rctx = riverCv.getContext('2d');
  // Draw wave pattern
  rctx.fillStyle = '#1A5C8C';
  rctx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 32; row++) {
    rctx.strokeStyle = `rgba(100,180,230,${0.15 + (row % 3) * 0.08})`;
    rctx.lineWidth = 1.5;
    rctx.beginPath();
    for (let px = 0; px <= 256; px += 4) {
      const py = row * 8 + Math.sin(px * 0.06) * 3;
      px === 0 ? rctx.moveTo(px, py) : rctx.lineTo(px, py);
    }
    rctx.stroke();
  }
  const riverTex = new THREE.CanvasTexture(riverCv);
  riverTex.wrapS = THREE.RepeatWrapping;
  riverTex.wrapT = THREE.RepeatWrapping;
  riverTex.repeat.set(6, 3);
  const riverMat = new THREE.MeshStandardMaterial({
    map: riverTex, color: 0x2878B8, roughness: 0.05, metalness: 0.5,
    transparent: true, opacity: 0.88
  });
  const riverPlane = new THREE.Mesh(new THREE.PlaneGeometry(400, RIVER_W), riverMat);
  riverPlane.rotation.x = -Math.PI / 2;
  riverPlane.position.set(0, 0.04, RIVER_Z);
  world3DScene.add(riverPlane);
  // River banks (stone edge)
  const bankMat = new THREE.MeshStandardMaterial({ color: 0x7A8899, roughness: 0.9 });
  [RIVER_Z + RIVER_W/2 + 1, RIVER_Z - RIVER_W/2 - 1].forEach(bz => {
    const bank = new THREE.Mesh(new THREE.BoxGeometry(400, 0.35, 2.5), bankMat);
    bank.position.set(0, 0.17, bz); bank.receiveShadow = true;
    world3DScene.add(bank);
  });
  // River retaining walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.75 });
  [RIVER_Z + RIVER_W/2, RIVER_Z - RIVER_W/2].forEach(wz => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(400, 1.8, 0.8), wallMat);
    wall.position.set(0, 0.9, wz); wall.castShadow = true;
    world3DScene.add(wall);
  });

  // ── Arched Bridge ─────────────────────────────────────────────────
  // Bridge spans from Z=RIVER_Z-RIVER_W/2-1 to Z=RIVER_Z+RIVER_W/2+1 at each avenue
  const BRIDGE_SPAN = RIVER_W + 2;  // ~20 units
  const ARCH_H = 4.5;               // peak height of arch above deck
  const DECK_Y = 1.85;              // deck elevation
  const bridgeDeckMat = new THREE.MeshStandardMaterial({ color: 0x3A3A4A, roughness: 0.9 });
  const archMat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.5, metalness: 0.4 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x889AAA, roughness: 0.4, metalness: 0.6 });
  const hangerMat = new THREE.MeshStandardMaterial({ color: 0xAABBCC, roughness: 0.3, metalness: 0.8 });

  function buildBridge(bx) {
    const ARCH_SEGS = 18;
    const bridgeZ = RIVER_Z;
    const halfSpan = BRIDGE_SPAN / 2;

    // Deck surface
    const deck = new THREE.Mesh(new THREE.BoxGeometry(ROAD_W, 0.35, BRIDGE_SPAN + 2), bridgeDeckMat);
    deck.position.set(bx, DECK_Y, bridgeZ);
    deck.castShadow = true; deck.receiveShadow = true;
    world3DScene.add(deck);
    // Road markings on bridge
    for (let dm = -8; dm < 8; dm += 7) plane(0.25, BRIDGE_SPAN, lineM, bx + dm * 0.5, DECK_Y + 0.18, bridgeZ);

    // Two arch ribs (one each side of road width)
    [-ROAD_W/2 + 1.2, ROAD_W/2 - 1.2].forEach(ribX => {
      for (let s = 0; s < ARCH_SEGS; s++) {
        const t0 = s / ARCH_SEGS, t1 = (s + 1) / ARCH_SEGS;
        const z0 = bridgeZ - halfSpan + t0 * BRIDGE_SPAN;
        const z1 = bridgeZ - halfSpan + t1 * BRIDGE_SPAN;
        const y0 = DECK_Y + ARCH_H * Math.sin(t0 * Math.PI);
        const y1 = DECK_Y + ARCH_H * Math.sin(t1 * Math.PI);
        const midZ = (z0 + z1) / 2;
        const midY = (y0 + y1) / 2;
        const segLen = Math.sqrt((z1-z0)**2 + (y1-y0)**2);
        const angle = Math.atan2(y1 - y0, z1 - z0);
        const seg = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, segLen + 0.05), archMat);
        seg.position.set(bx + ribX, midY, midZ);
        seg.rotation.x = angle;
        seg.castShadow = true;
        world3DScene.add(seg);
      }
    });

    // Vertical hangers from arch to deck every ~2 units
    const HANGER_COUNT = 8;
    for (let h = 1; h < HANGER_COUNT; h++) {
      const t = h / HANGER_COUNT;
      const hz = bridgeZ - halfSpan + t * BRIDGE_SPAN;
      const archY = DECK_Y + ARCH_H * Math.sin(t * Math.PI);
      const hangerH = archY - DECK_Y;
      if (hangerH < 0.3) continue;
      [-ROAD_W/2 + 1.2, ROAD_W/2 - 1.2].forEach(ribX => {
        const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, hangerH, 5), hangerMat);
        hanger.position.set(bx + ribX, DECK_Y + hangerH/2, hz);
        world3DScene.add(hanger);
      });
    }

    // Solid bridge piers at each end
    [[bridgeZ - halfSpan - 1.5], [bridgeZ + halfSpan + 1.5]].forEach(([pz]) => {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(ROAD_W + 0.5, DECK_Y + 0.4, 2.2), wallMat);
      pier.position.set(bx, (DECK_Y + 0.4)/2, pz);
      pier.castShadow = true;
      world3DScene.add(pier);
    });

    // Bridge railings (both sides, full span)
    [-(ROAD_W/2 + 0.3), ROAD_W/2 + 0.3].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, BRIDGE_SPAN + 2.5), railMat);
      rail.position.set(bx + rx, DECK_Y + 0.62, bridgeZ);
      world3DScene.add(rail);
      // Rail posts every 3 units
      for (let rp = -9; rp <= 9; rp += 3) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), railMat);
        post.position.set(bx + rx, DECK_Y + 0.62, bridgeZ + rp);
        world3DScene.add(post);
      }
    });

    // Lamp posts on bridge
    [-7, 0, 7].forEach(lz => {
      [-(ROAD_W/2 + 0.5), ROAD_W/2 + 0.5].forEach(lx => {
        const lpost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4, 8), railMat);
        lpost.position.set(bx + lx, DECK_Y + 2.3, bridgeZ + lz);
        world3DScene.add(lpost);
        const lg = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 5), lampGlowMat);
        lg.position.set(bx + lx, DECK_Y + 4.4, bridgeZ + lz);
        world3DScene.add(lg);
        const lpt = new THREE.PointLight(0xFFF5CC, 0.8, 12);
        lpt.position.set(bx + lx, DECK_Y + 4.4, bridgeZ + lz);
        world3DScene.add(lpt);
      });
    });
  }

  // Single bridge — main avenue only (X=0)
  buildBridge(0);

  // ── Clouds (animated) ─────────────────────────────────────────────
  const cloudMat2 = new THREE.MeshStandardMaterial({ color: 0xF0F6FF, roughness: 1 });
  const clouds3D = [];
  [[60,75,-60],[-80,80,20],[30,70,-130],[100,68,30],[-50,82,-80],[140,72,60],[-120,78,-30]].forEach(([cx, cy, cz]) => {
    const cg = new THREE.Group();
    const clens = [8,10,7,9,6];
    clens.forEach((cr, ci) => {
      const cp = new THREE.Mesh(new THREE.SphereGeometry(cr, 8, 6), cloudMat2);
      cp.position.set(ci * cr * 1.2 - 20, (ci%2)*3, (ci%3-1)*4);
      cp.castShadow = false;
      cg.add(cp);
    });
    cg.position.set(cx, cy, cz);
    world3DScene.add(cg);
    clouds3D.push(cg);
  });

  // ── Animation loop ─────────────────────────────────────────────────
  const clock = new THREE.Clock();
  const MOVE_SPEED = 10.0;
  const PLAYER_RADIUS = 1.2;

  function animate3D() {
    world3DAnimFrame = requestAnimationFrame(animate3D);
    const delta = Math.min(clock.getDelta(), 0.05);

    // Cloud drift
    clouds3D.forEach((cg, ci) => { cg.position.x += delta * (0.8 + ci * 0.15); if (cg.position.x > 180) cg.position.x = -180; });
    // River flow — animate texture offset
    if (riverTex) { riverTex.offset.x -= delta * 0.18; }

    // Traffic light bulb animation
    const tlTime = clock.elapsedTime;
    trafficLightHeads.forEach(head => {
      const tlState = getTLState(head.phaseOffset, head.forNS, tlTime);
      head.meshR.material.color.setHex(tlState === 'red'    ? 0xFF2222 : 0x111111);
      head.meshY.material.color.setHex(tlState === 'yellow' ? 0xFFCC00 : 0x111111);
      head.meshG.material.color.setHex(tlState === 'green'  ? 0x22EE44 : 0x111111);
    });

    // People walk — sidewalk walkers stay on their lane, park wanderers drift
    peopleGroups.forEach(pg => {
      if (pg.userData.walkDir == null) return;
      if (pg.userData.parkPerson) {
        // Wander in small random circle around park
        pg.position.x += Math.sin(pg.position.z * 0.3) * pg.userData.walkSpeed * delta * 0.5;
        pg.position.z += pg.userData.walkDir * pg.userData.walkSpeed * delta;
        pg.rotation.y += delta * 0.4;
        if (pg.position.z > pg.userData.walkBound) pg.userData.walkDir = -1;
        if (pg.position.z < pg.userData.walkBound - 20) pg.userData.walkDir = 1;
        pg.position.x = Math.max(-82, Math.min(-58, pg.position.x));
        pg.position.z = Math.max(pg.userData.walkBound - 22, Math.min(pg.userData.walkBound, pg.position.z));
      } else {
        pg.position.z += pg.userData.walkDir * pg.userData.walkSpeed * delta;
        pg.rotation.y = pg.userData.walkDir > 0 ? 0 : Math.PI;
        if (pg.position.z > pg.userData.walkBound) { pg.userData.walkDir = -1; pg.position.z = pg.userData.walkBound; }
        if (pg.position.z < -pg.userData.walkBound) { pg.userData.walkDir = 1; pg.position.z = -pg.userData.walkBound; }
        if (pg.userData.sidewalkX !== null) pg.position.x = pg.userData.sidewalkX;
      }
    });

    // Moving cars — traffic-light aware
    const STOP_DIST = 9, SLOW_DIST = 18;
    movingCars.forEach(mc => {
      const g2 = mc.group;
      const pos = g2.position;

      // Find upcoming intersection and check its TL state
      let upcomingTLState = 'green';
      if (mc.dir === 'Z+' || mc.dir === 'Z-') {
        const nextEW = mc.dir === 'Z+'
          ? EW_ROADS.filter(ez => ez > pos.z + 1).sort((a, b) => a - b)[0]
          : EW_ROADS.filter(ez => ez < pos.z - 1).sort((a, b) => b - a)[0];
        if (nextEW !== undefined && Math.abs(nextEW - pos.z) < SLOW_DIST) {
          const ei = EW_ROADS.indexOf(nextEW);
          upcomingTLState = getTLState(tlPhaseOffsets[ei], true, tlTime);
        }
      } else {
        const nextNS = mc.dir === 'X+'
          ? NS_ROADS.filter(rx => rx > pos.x + 1).sort((a, b) => a - b)[0]
          : NS_ROADS.filter(rx => rx < pos.x - 1).sort((a, b) => b - a)[0];
        if (nextNS !== undefined && Math.abs(nextNS - pos.x) < SLOW_DIST) {
          const ei = EW_ROADS.reduce((best, ez, i) =>
            Math.abs(ez - mc.lane) < Math.abs(EW_ROADS[best] - mc.lane) ? i : best, 0);
          upcomingTLState = getTLState(tlPhaseOffsets[ei], false, tlTime);
        }
      }

      // Compute upcoming intersection distance for graduated stop
      let distToStop = SLOW_DIST;
      if (mc.dir === 'Z+' || mc.dir === 'Z-') {
        const nextEW = mc.dir === 'Z+'
          ? EW_ROADS.filter(ez => ez > pos.z + 1).sort((a, b) => a - b)[0]
          : EW_ROADS.filter(ez => ez < pos.z - 1).sort((a, b) => b - a)[0];
        if (nextEW !== undefined) distToStop = Math.abs(nextEW - pos.z);
      } else {
        const nextNS = mc.dir === 'X+'
          ? NS_ROADS.filter(rx => rx > pos.x + 1).sort((a, b) => a - b)[0]
          : NS_ROADS.filter(rx => rx < pos.x - 1).sort((a, b) => b - a)[0];
        if (nextNS !== undefined) distToStop = Math.abs(nextNS - pos.x);
      }

      let targetSpeed = mc.baseSpeed;
      if (upcomingTLState === 'red') {
        targetSpeed = distToStop < STOP_DIST ? 0 : mc.baseSpeed * Math.max(0, (distToStop - STOP_DIST) / (SLOW_DIST - STOP_DIST));
      } else if (upcomingTLState === 'yellow') {
        targetSpeed = distToStop < STOP_DIST * 1.5 ? mc.baseSpeed * 0.2 : mc.baseSpeed * 0.6;
      }
      mc.speed += (targetSpeed - mc.speed) * Math.min(delta * 4, 1);

      if (mc.dir === 'Z+') { g2.position.z += mc.speed * delta; if (g2.position.z > mc.maxBound) g2.position.z = mc.minBound; }
      else if (mc.dir === 'Z-') { g2.position.z -= mc.speed * delta; if (g2.position.z < mc.minBound) g2.position.z = mc.maxBound; }
      else if (mc.dir === 'X+') { g2.position.x += mc.speed * delta; if (g2.position.x > mc.maxBound) g2.position.x = mc.minBound; }
      else { g2.position.x -= mc.speed * delta; if (g2.position.x < mc.minBound) g2.position.x = mc.maxBound; }
    });

    if (world3DControls && world3DControls.isLocked) {
      const obj = world3DControls.getObject();
      const prevX = obj.position.x, prevZ = obj.position.z;

      const fwd = (world3DKeys['w'] || world3DKeys['arrowup']) ? 1 : 0;
      const bwd = (world3DKeys['s'] || world3DKeys['arrowdown']) ? 1 : 0;
      const lft = (world3DKeys['a'] || world3DKeys['arrowleft']) ? 1 : 0;
      const rgt = (world3DKeys['d'] || world3DKeys['arrowright']) ? 1 : 0;

      world3DControls.moveForward((fwd - bwd) * MOVE_SPEED * delta);
      world3DControls.moveRight((rgt - lft) * MOVE_SPEED * delta);

      // Collision: push player out of building/car footprints
      // Soft push from people (don't hard-block, just nudge)
      peopleGroups.forEach(pg => {
        const dx3 = obj.position.x - pg.position.x;
        const dz3 = obj.position.z - pg.position.z;
        const dist3 = Math.sqrt(dx3*dx3 + dz3*dz3);
        if (dist3 < 0.9 && dist3 > 0.001) {
          obj.position.x += (dx3 / dist3) * (0.9 - dist3) * 0.5;
          obj.position.z += (dz3 / dist3) * (0.9 - dist3) * 0.5;
        }
      });
      const dynamicColliders = movingCars.map(mc => {
        const gp = mc.group.position;
        const hw = mc.dir === 'Z+' || mc.dir === 'Z-' ? 1.2 : 2.3;
        const hd = mc.dir === 'Z+' || mc.dir === 'Z-' ? 2.3 : 1.2;
        return { minX: gp.x - hw, maxX: gp.x + hw, minZ: gp.z - hd, maxZ: gp.z + hd };
      });
      [...colliders, ...dynamicColliders].forEach(c => {
        if (obj.position.x > c.minX - PLAYER_RADIUS && obj.position.x < c.maxX + PLAYER_RADIUS &&
            obj.position.z > c.minZ - PLAYER_RADIUS && obj.position.z < c.maxZ + PLAYER_RADIUS) {
          const wasInsideX = prevX > c.minX - PLAYER_RADIUS && prevX < c.maxX + PLAYER_RADIUS;
          const wasInsideZ = prevZ > c.minZ - PLAYER_RADIUS && prevZ < c.maxZ + PLAYER_RADIUS;
          if (!wasInsideX) obj.position.x = prevX;
          if (!wasInsideZ) obj.position.z = prevZ;
          if (wasInsideX && wasInsideZ) { obj.position.x = prevX; obj.position.z = prevZ; }
        }
      });

      obj.position.y = 1.75;
      obj.position.x = Math.max(-130, Math.min(130, obj.position.x));
      obj.position.z = Math.max(-130, Math.min(130, obj.position.z));

      // Proximity check for E prompt
      let closestDist = Infinity, closestId = null;
      world3DBuildingGroups.forEach(g => {
        const dist = Math.hypot(obj.position.x - g.position.x, obj.position.z - g.position.z);
        if (dist < 14 && dist < closestDist) { closestDist = dist; closestId = g.userData.resourceId; }
      });
      if (closestId !== world3DProximityResource) {
        world3DProximityResource = closestId;
        const prompt2 = document.getElementById('world3d-proximity-prompt');
        const pname2 = document.getElementById('world3d-proximity-name');
        if (prompt2) prompt2.classList.toggle('hidden', !closestId);
        if (pname2 && closestId) {
          const pr2 = RESOURCES.find(x => x.id === closestId);
          if (pr2) pname2.textContent = pr2.name;
        }
      }
    }

    // Billboards + icon sprites face camera
    if (world3DCamera) {
      world3DBuildingGroups.forEach(g => {
        if (g.userData.billboard) g.userData.billboard.lookAt(world3DCamera.position);
        if (g.userData.iconSprite) g.userData.iconSprite.lookAt(world3DCamera.position);
      });
    }

    if (world3DRenderer && world3DScene && world3DCamera) {
      world3DRenderer.render(world3DScene, world3DCamera);
    }
  }
  animate3D();

  // ── Resize ────────────────────────────────────────────────────────
  world3DResize = () => {
    if (!world3DCamera || !world3DRenderer) return;
    world3DCamera.aspect = window.innerWidth / window.innerHeight;
    world3DCamera.updateProjectionMatrix();
    world3DRenderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', world3DResize);

  lucide.createIcons();
}

function showWorld3DResourceInfo(resourceId) {
  world3DSelectedResource = resourceId;
  const r = RESOURCES.find(x => x.id === resourceId);
  if (!r) return;
  const infoPanel = document.getElementById('world3d-info');
  const infoContent = document.getElementById('world3d-info-content');
  if (infoContent) {
    infoContent.innerHTML = `
      <div class="world3d-info-cat">${catEmoji(r.category)} ${r.category}</div>
      <div class="world3d-info-name">${r.name}</div>
      <div class="world3d-info-desc">${r.description.substring(0, 110)}…</div>
      <div class="world3d-info-rating">⭐ ${r.rating} · ${r.reviews} reviews · ${r.cost === 'free' ? '✅ Free' : '💰 Paid'}</div>`;
  }
  if (infoPanel) infoPanel.classList.remove('hidden');
  if (world3DControls && world3DControls.isLocked) world3DControls.unlock();
}

function closeWorld3D() {
  if (world3DAnimFrame) { cancelAnimationFrame(world3DAnimFrame); world3DAnimFrame = null; }
  if (world3DRenderer) { world3DRenderer.dispose(); world3DRenderer = null; }
  if (world3DScene) { world3DScene.clear(); world3DScene = null; }
  world3DCamera = null;
  if (world3DControls) { world3DControls.dispose(); world3DControls = null; }
  world3DBuildingGroups.length = 0;
  world3DSelectedResource = null;
  world3DProximityResource = null;
  world3DKeys = {};
  if (world3DKeyDownHandler) { document.removeEventListener('keydown', world3DKeyDownHandler); world3DKeyDownHandler = null; }
  if (world3DKeyUpHandler) { document.removeEventListener('keyup', world3DKeyUpHandler); world3DKeyUpHandler = null; }
  if (world3DClickHandler) { document.removeEventListener('click', world3DClickHandler); world3DClickHandler = null; }
  if (world3DResize) { window.removeEventListener('resize', world3DResize); world3DResize = null; }
  document.getElementById('world3d-modal')?.classList.add('hidden');
  document.getElementById('world3d-info')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function openResourceFromWorld3D() {
  if (world3DSelectedResource !== null) {
    const id = world3DSelectedResource;
    closeWorld3D();
    setTimeout(() => openResourceModal(id), 200);
  }
}

/* ─── Star Renderer ─── */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/* ─── Tag Renderer ─── */
function renderTags(tags) {
  const classMap = {
    'Free': 'tag-free',
    'Family Friendly': 'tag-family',
    'Emergency Support': 'tag-emergency',
    'Volunteer Opportunity': 'tag-volunteer',
    'Youth': 'tag-youth',
    'Seniors': 'tag-senior',
    'STEM': 'tag-volunteer',
    'ESL': 'tag-family',
    'Crisis Support': 'tag-emergency',
    'Sliding Scale': 'tag-free',
    'Transportation': 'tag-default',
    'Academic': 'tag-family',
    'Legal Aid': 'tag-default',
    'Creative': 'tag-volunteer',
    'No Documentation': 'tag-free'
  };
  return tags.slice(0, 3).map(t =>
    `<span class="tag ${classMap[t] || 'tag-default'}">${t}</span>`
  ).join('');
}
