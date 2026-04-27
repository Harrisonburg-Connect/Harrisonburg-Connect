// ─────────────────────────────────────────────────────────
//  ConnectHBG — News & Donate Feature
// ─────────────────────────────────────────────────────────

// ─── Badge / Author Helpers ───────────────────────────────
function renderVerifiedBadge() {
  return `<span class="news-badge news-badge-verified" title="Verified source">
    <span data-lucide="check-circle" class="w-3 h-3"></span> Verified
  </span>`;
}

function renderFeaturedBadge() {
  return `<span class="news-badge news-badge-featured">
    <span data-lucide="star" class="w-3 h-3"></span> Featured
  </span>`;
}

function renderAuthorDate(author, authorRole, date) {
  return `<div class="news-author-row">
    <span class="news-author-name">${author}</span>
    <span class="news-author-sep">·</span>
    <span class="news-author-role">${authorRole}</span>
    <span class="news-author-sep">·</span>
    <time class="news-article-date" datetime="${date}">${formatNewsDate(date)}</time>
  </div>`;
}

function formatNewsDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ─── News State ───────────────────────────────────────────
let activeNewsCategory = 'All';

// ─── Init News ────────────────────────────────────────────
function initNews() {
  renderNewsFilters();
  renderNewsContent();
}

function renderNewsFilters() {
  const cats = ['All', ...new Set(NEWS_ARTICLES.map(a => a.category))];
  const filtersEl = document.getElementById('news-filters');
  if (!filtersEl) return;
  filtersEl.innerHTML = cats.map(c => `
    <button class="filter-pill${c === activeNewsCategory ? ' active' : ''}"
      onclick="filterNews('${c}')" aria-pressed="${c === activeNewsCategory}">
      ${c}
    </button>
  `).join('');
}

function filterNews(cat) {
  activeNewsCategory = cat;
  renderNewsFilters();
  renderNewsContent();
}

function renderNewsContent() {
  const container = document.getElementById('news-content');
  if (!container) return;

  const filtered = activeNewsCategory === 'All'
    ? NEWS_ARTICLES
    : NEWS_ARTICLES.filter(a => a.category === activeNewsCategory);

  if (!filtered.length) {
    container.innerHTML = '<p class="no-results">No articles in this category yet.</p>';
    return;
  }

  const featured = filtered.find(a => a.featured) || filtered[0];
  const rest = filtered.filter(a => a.id !== featured.id);

  container.innerHTML = `
    ${renderFeaturedNewsCard(featured)}
    ${rest.length ? `<div class="news-grid" role="list">${rest.map((a, i) => renderNewsCard(a, i)).join('')}</div>` : ''}
  `;
  lucide.createIcons();
}

function renderFeaturedNewsCard(article) {
  if (!article) return '';
  const safeTitle = article.title.replace(/'/g, '&#39;');
  return `
    <article class="news-featured-card" data-aos="fade-up" role="listitem"
      onclick="openNewsDetail('${article.id}')" style="cursor:pointer"
      aria-label="Read full article: ${safeTitle}">
      <div class="news-featured-img-wrap">
        <img src="${article.image}" alt="" class="news-featured-img" loading="lazy">
        <div class="news-featured-overlay">
          <div class="news-featured-badges">
            ${article.featured ? renderFeaturedBadge() : ''}
            ${article.verified ? renderVerifiedBadge() : ''}
          </div>
        </div>
      </div>
      <div class="news-featured-body">
        <span class="news-category-tag news-cat-${article.category.toLowerCase()}">${article.category}</span>
        <h3 class="news-featured-title">${article.title}</h3>
        <p class="news-featured-summary">${article.summary}</p>
        ${renderAuthorDate(article.author, article.authorRole, article.date)}
        <span class="btn-read-more" aria-hidden="true">
          Read Story <span data-lucide="arrow-right" class="w-4 h-4"></span>
        </span>
      </div>
    </article>
  `;
}

function renderNewsCard(article, index) {
  const safeTitle = article.title.replace(/'/g, '&#39;');
  return `
    <article class="news-card" data-aos="fade-up" data-aos-delay="${index * 40}" role="listitem"
      onclick="openNewsDetail('${article.id}')" style="cursor:pointer"
      aria-label="Read full article: ${safeTitle}">
      <div class="news-card-img-wrap">
        <img src="${article.image}" alt="" class="news-card-img" loading="lazy">
      </div>
      <div class="news-card-body">
        <div class="news-card-top">
          <span class="news-category-tag news-cat-${article.category.toLowerCase()}">${article.category}</span>
          <div class="news-card-badges">
            ${article.verified ? renderVerifiedBadge() : ''}
          </div>
        </div>
        <h3 class="news-card-title">${article.title}</h3>
        <p class="news-card-summary">${article.summary}</p>
        ${renderAuthorDate(article.author, article.authorRole, article.date)}
      </div>
    </article>
  `;
}

// ─── News Detail Modal ────────────────────────────────────
function openNewsDetail(articleId) {
  const article = NEWS_ARTICLES.find(a => a.id === articleId);
  if (!article) return;

  const modal = document.getElementById('news-detail-modal');
  const content = document.getElementById('news-detail-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="news-modal-hero">
      <img src="${article.image}" alt="" class="news-modal-img">
      <div class="news-modal-hero-overlay">
        <div class="news-modal-badges">
          ${article.featured ? renderFeaturedBadge() : ''}
          ${article.verified ? renderVerifiedBadge() : ''}
        </div>
        <span class="news-category-tag news-cat-${article.category.toLowerCase()}">${article.category}</span>
      </div>
    </div>
    <div class="news-modal-body">
      <h2 class="news-modal-title">${article.title}</h2>
      ${renderAuthorDate(article.author, article.authorRole, article.date)}
      <div class="news-modal-content">${article.body}</div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();

  const escFn = e => {
    if (e.key === 'Escape') { closeNewsDetailModalDirect(); document.removeEventListener('keydown', escFn); }
  };
  document.addEventListener('keydown', escFn);
}

function closeNewsDetailModal(event) {
  if (event && event.target !== document.getElementById('news-detail-modal')) return;
  closeNewsDetailModalDirect();
}

function closeNewsDetailModalDirect() {
  document.getElementById('news-detail-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ─── Story Submission Modal ───────────────────────────────
function openStorySubmitModal() {
  const modal = document.getElementById('story-submit-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
  const escFn = e => {
    if (e.key === 'Escape') { closeStorySubmitModalDirect(); document.removeEventListener('keydown', escFn); }
  };
  document.addEventListener('keydown', escFn);
}

function closeStorySubmitModal(event) {
  if (event && event.target !== document.getElementById('story-submit-modal')) return;
  closeStorySubmitModalDirect();
}

function closeStorySubmitModalDirect() {
  document.getElementById('story-submit-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function submitStory() {
  const title = document.getElementById('story-title-input').value.trim();
  const body = document.getElementById('story-body-input').value.trim();
  if (!title) { showToast('Please add a headline for your story.'); return; }
  if (body.length < 50) { showToast('Please write at least 50 characters for your story.'); return; }
  closeStorySubmitModalDirect();
  document.getElementById('story-submit-form').reset();
  showToast('Your story has been submitted for review. Thank you!');
}

// ─── Donate / Fundraiser State ────────────────────────────
let activeDonateCategory = 'All';
let donateTarget = null;
let selectedDonateAmount = 25;

// ─── Init Donate ──────────────────────────────────────────
function initDonate() {
  renderDonateStats();
  renderDonateFilters();
  renderFundraiserCards();
  initDonateStatsObserver();
}

function renderDonateStats() {
  const totalRaised = FUNDRAISERS.reduce((s, f) => s + f.raisedAmount, 0);
  const totalDonors = FUNDRAISERS.reduce((s, f) => s + f.donorCount, 0);
  const statsEl = document.getElementById('donate-stats-bar');
  if (!statsEl) return;
  statsEl.innerHTML = `
    <div class="donate-stat">
      <span class="donate-stat-value" id="ds-raised" data-target="${totalRaised}">$0</span>
      <span class="donate-stat-label">Total Raised</span>
    </div>
    <div class="donate-stat-divider" aria-hidden="true"></div>
    <div class="donate-stat">
      <span class="donate-stat-value" id="ds-donors" data-target="${totalDonors}">0</span>
      <span class="donate-stat-label">Generous Donors</span>
    </div>
    <div class="donate-stat-divider" aria-hidden="true"></div>
    <div class="donate-stat">
      <span class="donate-stat-value" id="ds-projects" data-target="${FUNDRAISERS.length}">0</span>
      <span class="donate-stat-label">Active Projects</span>
    </div>
  `;
}

function initDonateStatsObserver() {
  const bar = document.getElementById('donate-stats-bar');
  if (!bar) return;
  let animated = false;
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      const totalRaised = FUNDRAISERS.reduce((s, f) => s + f.raisedAmount, 0);
      const totalDonors = FUNDRAISERS.reduce((s, f) => s + f.donorCount, 0);
      countUp(document.getElementById('ds-raised'), 0, totalRaised, 1400, true);
      countUp(document.getElementById('ds-donors'), 0, totalDonors, 1200, false);
      countUp(document.getElementById('ds-projects'), 0, FUNDRAISERS.length, 800, false);
    }
  }, { threshold: 0.3 });
  observer.observe(bar);
}

function countUp(el, from, to, duration, isCurrency) {
  if (!el) return;
  const startTime = performance.now();
  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (to - from) * eased);
    el.textContent = isCurrency ? '$' + current.toLocaleString() : current.toLocaleString();
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderDonateFilters() {
  const cats = ['All', ...new Set(FUNDRAISERS.map(f => f.category))];
  const filtersEl = document.getElementById('donate-filters');
  if (!filtersEl) return;
  filtersEl.innerHTML = cats.map(c => `
    <button class="filter-pill${c === activeDonateCategory ? ' active' : ''}"
      onclick="filterDonate('${c}')" aria-pressed="${c === activeDonateCategory}">
      ${c}
    </button>
  `).join('');
}

function filterDonate(cat) {
  activeDonateCategory = cat;
  renderDonateFilters();
  renderFundraiserCards();
}

function renderFundraiserCards() {
  const grid = document.getElementById('fundraiser-grid');
  if (!grid) return;

  const filtered = activeDonateCategory === 'All'
    ? FUNDRAISERS
    : FUNDRAISERS.filter(f => f.category === activeDonateCategory);

  if (!filtered.length) {
    grid.innerHTML = '<p class="no-results">No fundraisers in this category yet.</p>';
    return;
  }

  grid.innerHTML = filtered.map((f, i) => renderFundraiserCard(f, i)).join('');

  requestAnimationFrame(() => {
    filtered.forEach(f => {
      const bar = document.getElementById('progress-bar-' + f.id);
      if (bar) bar.style.width = Math.min((f.raisedAmount / f.goalAmount) * 100, 100) + '%';
    });
  });

  lucide.createIcons();
}

function renderFundraiserCard(f, index) {
  const pct = Math.min((f.raisedAmount / f.goalAmount) * 100, 100).toFixed(0);
  const barColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#14B8A6' : '#3B82F6';
  const safeTitle = f.title.replace(/'/g, '&#39;');

  return `
    <article class="fundraiser-card" data-aos="fade-up" data-aos-delay="${index * 40}" role="listitem">
      <div class="fundraiser-img-wrap">
        <img src="${f.image}" alt="" class="fundraiser-img" loading="lazy">
        ${f.verified ? `<span class="fundraiser-verified-badge">${renderVerifiedBadge()}</span>` : ''}
      </div>
      <div class="fundraiser-body">
        <div class="fundraiser-org-row">
          <img src="${f.organizerAvatar}" alt="${f.organizer}" class="fundraiser-org-avatar">
          <span class="fundraiser-org-name">${f.organizer}</span>
          <span class="fundraiser-category-tag">${f.category}</span>
        </div>
        <h3 class="fundraiser-title">${f.title}</h3>
        <p class="fundraiser-desc">${f.description}</p>
        <div class="fundraiser-progress-wrap">
          <div class="fundraiser-progress-track" role="progressbar"
            aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
            aria-label="${pct}% funded">
            <div class="fundraiser-progress-bar" id="progress-bar-${f.id}"
              style="width:0%;background:${barColor};transition:width 1.2s ease"></div>
          </div>
          <div class="fundraiser-progress-stats">
            <span class="fundraiser-raised">$${f.raisedAmount.toLocaleString()} raised</span>
            <span class="fundraiser-pct">${pct}%</span>
          </div>
          <div class="fundraiser-meta-row">
            <span class="fundraiser-goal">of $${f.goalAmount.toLocaleString()} goal</span>
            <span class="fundraiser-donors">${f.donorCount} donors · ${f.daysLeft} days left</span>
          </div>
        </div>
        <button class="btn-donate-now" onclick="openDonateModal('${f.id}')"
          aria-label="Donate to ${safeTitle}">
          <span data-lucide="heart" class="w-4 h-4"></span> Donate Now
        </button>
      </div>
    </article>
  `;
}

// ─── Donate Modal ─────────────────────────────────────────
function openDonateModal(fundraiserId) {
  donateTarget = FUNDRAISERS.find(f => f.id === fundraiserId);
  if (!donateTarget) return;

  const modal = document.getElementById('donate-modal');
  if (!modal) return;

  document.getElementById('donate-modal-title').textContent = donateTarget.title;
  document.getElementById('donate-modal-org').textContent = 'by ' + donateTarget.organizer;

  selectedDonateAmount = 25;
  updateDonateChips();
  const customInput = document.getElementById('donate-custom-input');
  if (customInput) customInput.value = '';

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();

  const escFn = e => {
    if (e.key === 'Escape') { closeDonateModalDirect(); document.removeEventListener('keydown', escFn); }
  };
  document.addEventListener('keydown', escFn);
}

function closeDonateModal(event) {
  if (event && event.target !== document.getElementById('donate-modal')) return;
  closeDonateModalDirect();
}

function closeDonateModalDirect() {
  document.getElementById('donate-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function selectDonateChip(amount) {
  selectedDonateAmount = amount;
  const customInput = document.getElementById('donate-custom-input');
  if (customInput) customInput.value = '';
  updateDonateChips();
}

function updateDonateChips() {
  document.querySelectorAll('.donate-chip').forEach(chip => {
    chip.classList.toggle('active', parseInt(chip.dataset.amount) === selectedDonateAmount);
  });
}

function onCustomDonateInput() {
  const val = parseFloat(document.getElementById('donate-custom-input').value);
  if (!isNaN(val) && val > 0) {
    selectedDonateAmount = val;
    document.querySelectorAll('.donate-chip').forEach(c => c.classList.remove('active'));
  }
}

function confirmDonation() {
  const customVal = parseFloat(document.getElementById('donate-custom-input').value);
  const amount = (!isNaN(customVal) && customVal > 0) ? customVal : selectedDonateAmount;

  if (!amount || amount <= 0) { showToast('Please select or enter a donation amount.'); return; }
  if (!donateTarget) return;

  donateTarget.raisedAmount += amount;
  donateTarget.donorCount += 1;

  closeDonateModalDirect();
  renderDonateStats();
  initDonateStatsObserver();
  renderFundraiserCards();

  const displayAmt = amount % 1 === 0 ? amount : amount.toFixed(2);
  showToast(`Thank you! Your $${displayAmt} donation to "${donateTarget.title}" was recorded.`);
}

// ─── Create Fundraiser Modal ──────────────────────────────
function openCreateFundraiserModal() {
  if (typeof currentUser === 'undefined' || !currentUser) {
    showToast('Please sign in to start a fundraiser.');
    if (typeof openLoginModal === 'function') openLoginModal();
    return;
  }

  const modal = document.getElementById('create-fundraiser-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();

  const escFn = e => {
    if (e.key === 'Escape') { closeCreateFundraiserModalDirect(); document.removeEventListener('keydown', escFn); }
  };
  document.addEventListener('keydown', escFn);
}

function closeCreateFundraiserModal(event) {
  if (event && event.target !== document.getElementById('create-fundraiser-modal')) return;
  closeCreateFundraiserModalDirect();
}

function closeCreateFundraiserModalDirect() {
  document.getElementById('create-fundraiser-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function submitFundraiser() {
  const title = document.getElementById('fundraiser-title-input').value.trim();
  const goal = parseFloat(document.getElementById('fundraiser-goal-input').value);
  const desc = document.getElementById('fundraiser-desc-input').value.trim();

  if (!title) { showToast('Please enter a fundraiser title.'); return; }
  if (!goal || goal < 100) { showToast('Please enter a goal amount of at least $100.'); return; }
  if (desc.length < 30) { showToast('Please write a description of at least 30 characters.'); return; }

  closeCreateFundraiserModalDirect();
  document.getElementById('create-fundraiser-form').reset();
  showToast('Your fundraiser has been submitted for review. We\'ll be in touch within 48 hours!');
}

// ─── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNews();
  initDonate();
});
