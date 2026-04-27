/* ═══════════════════════════════════════════════════════
   ConnectHBG — AI-Powered Resource Matching
   Rule-based NLP keyword engine with scoring, ranking,
   urgency detection, and related events.
═══════════════════════════════════════════════════════ */

'use strict';

/* ─── Keyword → Category/Need mapping ─── */
const AI_INTENT_MAP = [
  /* Food */
  { keywords: ['food', 'hungry', 'hunger', 'eat', 'meal', 'grocery', 'groceries', 'pantry', 'nutrition', 'feed', 'fed', 'starving', 'comida', 'hambre', 'comer', 'alimento'], category: 'Food', weight: 3, urgency: false },
  { keywords: ['emergency food', 'no food', 'out of food', 'need food', 'nothing to eat', 'sin comida', 'no hay comida'], category: 'Food', weight: 5, urgency: true },

  /* Housing */
  { keywords: ['housing', 'shelter', 'homeless', 'eviction', 'evicted', 'rent', 'evict', 'house', 'home', 'apartment', 'place to stay', 'sleeping outside', 'vivienda', 'refugio', 'sin hogar', 'renta'], category: 'Housing', weight: 3, urgency: false },
  { keywords: ['emergency shelter', 'need shelter', 'nowhere to go', 'kicked out', 'losing home', 'about to lose', 'eviction notice'], category: 'Housing', weight: 5, urgency: true },

  /* Health */
  { keywords: ['health', 'medical', 'doctor', 'clinic', 'sick', 'illness', 'mental health', 'counseling', 'therapy', 'depression', 'anxiety', 'stress', 'hurt', 'pain', 'hospital', 'medicine', 'salud', 'médico', 'enfermo', 'salud mental', 'crisis', 'suicid'], category: 'Health', weight: 3, urgency: false },
  { keywords: ['mental crisis', 'suicide', 'self harm', 'emergency health', 'can\'t cope', 'breaking down', 'crisis'], category: 'Health', weight: 5, urgency: true },

  /* Education */
  { keywords: ['school', 'education', 'learn', 'learning', 'tutor', 'tutoring', 'homework', 'reading', 'math', 'science', 'college', 'esl', 'english', 'class', 'study', 'student', 'kids', 'children', 'youth', 'teen', 'teenager', 'escuela', 'educación', 'aprender', 'tutoría', 'tarea', 'niños', 'jóvenes'], category: 'Education', weight: 3, urgency: false },
  { keywords: ['coding', 'programming', 'computer', 'stem', 'tech', 'technology', 'robotics'], category: 'Education', weight: 2, urgency: false },

  /* Volunteer */
  { keywords: ['volunteer', 'volunteering', 'give back', 'help community', 'community service', 'donate time', 'serve', 'voluntario', 'voluntariado', 'ayudar'], category: 'Volunteer', weight: 3, urgency: false },

  /* Support */
  { keywords: ['immigrant', 'refugee', 'immigration', 'visa', 'legal', 'language', 'translation', 'new to', 'arrived', 'inmigrante', 'refugiado', 'legal', 'idioma'], category: 'Support', weight: 3, urgency: false },

  /* Senior */
  { keywords: ['senior', 'elderly', 'older adult', 'aging', 'elder', 'transportation', 'ride', 'lonely', 'companion', 'meal delivery', 'anciano', 'mayor', 'transporte'], category: 'Health', weight: 2, urgency: false },

  /* Fitness */
  { keywords: ['fitness', 'exercise', 'gym', 'yoga', 'wellness', 'workout', 'physical', 'health club', 'ejercicio', 'bienestar'], category: 'Health', weight: 1, urgency: false },

  /* Garden / environment */
  { keywords: ['garden', 'gardening', 'grow food', 'plant', 'farm', 'outdoor', 'nature', 'jardín', 'jardinería'], category: 'Volunteer', weight: 1, urgency: false },

  /* Arts */
  { keywords: ['art', 'arts', 'music', 'theater', 'theatre', 'creative', 'painting', 'drawing', 'drama', 'arte', 'música', 'teatro'], category: 'Education', weight: 2, urgency: false },
];

/* ─── Urgency keywords ─── */
const URGENCY_WORDS = ['emergency', 'urgent', 'immediately', 'crisis', 'right now', 'today', 'tonight', 'nowhere to go', 'help me', 'desperate', 'urgente', 'emergencia', 'ahora mismo', 'ayúdame'];

/* ─── Score a single resource against extracted intents ─── */
function scoreResource(resource, intents) {
  let score = 0;
  intents.forEach(intent => {
    if (resource.category === intent.category) {
      score += intent.weight * 10;
    }
    /* Partial match on subcategory, tags, description */
    const searchText = [
      resource.subcategory,
      ...resource.tags,
      resource.description,
      resource.name
    ].join(' ').toLowerCase();

    intent.keywords.forEach(kw => {
      if (searchText.includes(kw)) score += intent.weight * 2;
    });
  });

  /* Bonus for high rating */
  score += resource.rating * 2;
  /* Bonus for free */
  if (resource.cost === 'free') score += 5;
  /* Bonus for featured */
  if (resource.featured) score += 8;
  return score;
}

/* ─── Score events against intents ─── */
function scoreEvent(event, intents) {
  let score = 0;
  const text = (event.title + ' ' + event.description + ' ' + event.type).toLowerCase();
  intents.forEach(intent => {
    intent.keywords.forEach(kw => {
      if (text.includes(kw)) score += intent.weight;
    });
  });
  return score;
}

/* ─── Main matching function ─── */
function runAIMatchEngine(query) {
  const q = query.toLowerCase();

  /* Detect urgency */
  const isUrgent = URGENCY_WORDS.some(w => q.includes(w));

  /* Extract intents */
  const matchedIntents = AI_INTENT_MAP.filter(intent =>
    intent.keywords.some(kw => q.includes(kw))
  );

  /* Urgency boost for emergency-tagged intents */
  const intents = matchedIntents.map(intent => ({
    ...intent,
    weight: (isUrgent && intent.urgency) ? intent.weight * 2 : intent.weight
  }));

  /* Score all resources */
  const scored = RESOURCES.map(r => ({
    resource: r,
    score: scoreResource(r, intents.length ? intents : AI_INTENT_MAP) // fallback: score all if no intent
  })).filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  /* Score events */
  const scoredEvents = EVENTS.map(ev => ({
    event: ev,
    score: scoreEvent(ev, intents.length ? intents : [])
  })).filter(x => x.score > 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return { results: scored, events: scoredEvents, isUrgent, intents };
}

/* ─── Render results ─── */
function renderAIResults(data, query) {
  const container = document.getElementById('ai-results');
  if (!container) return;

  const lang = window.currentLang || 'en';

  if (!data.results.length) {
    container.innerHTML = `
      <div class="ai-empty">
        <div class="ai-empty-icon">🔍</div>
        <p>${window.t ? window.t('ai.no.results', lang) : 'No close matches found. Try different keywords or browse the full directory.'}</p>
        <a href="#directory" class="ai-browse-link">Browse All Resources →</a>
      </div>`;
    return;
  }

  const urgencyBanner = data.isUrgent ? `
    <div class="ai-urgency-banner">
      <span class="ai-urgency-icon">🚨</span>
      <div>
        <strong>${window.t ? window.t('ai.urgency', lang) : '🚨 Urgent Need Detected'}</strong>
        <span>We've prioritized emergency and crisis resources for you.</span>
      </div>
    </div>` : '';

  const resultsHtml = data.results.map((item, i) => {
    const r = item.resource;
    const open = typeof isOpenNow === 'function' ? isOpenNow(r) : false;
    const coords = typeof VERIFIED_COORDS !== 'undefined' ? VERIFIED_COORDS[r.id] : null;
    const maxScore = data.results[0].score;
    const pct = Math.round((item.score / maxScore) * 100);

    return `
      <article class="ai-result-card${i === 0 ? ' ai-result-top' : ''}" style="animation-delay:${i * 60}ms">
        ${i === 0 ? '<div class="ai-best-badge">Best Match</div>' : ''}
        <div class="ai-result-img" style="background-image:url('${r.image || ''}')">
          <span class="ai-result-cat" style="background:${catHex ? catHex(r.category) : '#64748B'}">${r.category}</span>
          ${open ? '<span class="ai-open-dot">● Open</span>' : ''}
        </div>
        <div class="ai-result-body">
          <div class="ai-result-rank">#${i + 1}</div>
          <h3 class="ai-result-name">${r.name}</h3>
          <p class="ai-result-desc">${r.description.substring(0, 120)}…</p>
          <div class="ai-result-meta">
            <span>⭐ ${r.rating} (${r.reviews})</span>
            <span>🕐 ${r.hours.split(',')[0]}</span>
            ${r.cost === 'free' ? '<span class="ai-free-badge">Free</span>' : ''}
          </div>
          <div class="ai-match-bar-wrap">
            <div class="ai-match-bar-label">Match Strength</div>
            <div class="ai-match-bar-track">
              <div class="ai-match-bar-fill" style="width:${pct}%;background:${catHex ? catHex(r.category) : '#14B8A6'}"></div>
            </div>
            <span class="ai-match-pct">${pct}%</span>
          </div>
          <div class="ai-result-actions">
            <button class="ai-detail-btn" onclick="openResourceModal(${r.id})">
              Full Details →
            </button>
            <button class="ai-map-btn" onclick="aiShowOnMap(${r.id})" title="View on map">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/>
                <line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
              Map
            </button>
          </div>
        </div>
      </article>`;
  }).join('');

  const eventsHtml = data.events.length ? `
    <div class="ai-events-section">
      <h4 class="ai-events-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Related Events
      </h4>
      <div class="ai-events-row">
        ${data.events.map(item => {
          const ev = item.event;
          const d = new Date(ev.date);
          return `
            <div class="ai-event-chip">
              <div class="ai-event-chip-date">${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}</div>
              <div class="ai-event-chip-title">${ev.title}</div>
              ${ev.free ? '<span class="ai-free-badge">Free</span>' : ''}
            </div>`;
        }).join('')}
      </div>
    </div>` : '';

  container.innerHTML = `
    ${urgencyBanner}
    <div class="ai-results-header">
      <h3 class="ai-results-title">${window.t ? window.t('ai.results.title', lang) : 'Best Matches For You'}</h3>
      <p class="ai-results-sub">${window.t ? window.t('ai.results.sub', lang) : 'Ranked by relevance to your situation'}</p>
    </div>
    <div class="ai-results-grid">${resultsHtml}</div>
    ${eventsHtml}
    <div class="ai-cta-row">
      <a href="#directory" class="ai-browse-all">Browse Full Directory →</a>
    </div>
  `;

  /* Animate match bars */
  requestAnimationFrame(() => {
    document.querySelectorAll('.ai-match-bar-fill').forEach(bar => {
      bar.style.transition = 'width 0.8s cubic-bezier(.4,0,.2,1)';
    });
  });
}

/* ─── Show resource on map ─── */
window.aiShowOnMap = function(resourceId) {
  /* Switch to map view in directory */
  if (typeof setView === 'function') {
    setView('map');
    /* Scroll to directory */
    const dir = document.getElementById('directory');
    if (dir) dir.scrollIntoView({ behavior: 'smooth', block: 'start' });

    /* Open the marker popup after map loads */
    setTimeout(() => {
      const coords = typeof VERIFIED_COORDS !== 'undefined' ? VERIFIED_COORDS[resourceId] : null;
      if (coords && window.smartMap) {
        window.smartMap.setView([coords.lat, coords.lng], 15, { animate: true });
      }
      openResourceModal(resourceId);
    }, 800);
  }
};

/* ─── Main button handler ─── */
window.runAIMatch = function() {
  const input = document.getElementById('ai-input');
  const btn   = document.getElementById('ai-find-btn');
  const container = document.getElementById('ai-results');
  const lang = window.currentLang || 'en';

  if (!input || !btn || !container) return;

  const query = input.value.trim();
  if (!query) {
    input.focus();
    input.classList.add('ai-input-shake');
    setTimeout(() => input.classList.remove('ai-input-shake'), 500);
    return;
  }

  /* Loading state */
  btn.disabled = true;
  btn.textContent = window.t ? window.t('ai.btn.thinking', lang) : 'Analyzing…';
  btn.classList.add('ai-btn-thinking');

  container.innerHTML = `
    <div class="ai-thinking">
      <div class="ai-thinking-dots">
        <span></span><span></span><span></span>
      </div>
      <p>Analyzing your situation…</p>
    </div>`;

  /* Simulate brief processing delay for UX feel */
  setTimeout(() => {
    const data = runAIMatchEngine(query);
    renderAIResults(data, query);

    btn.disabled = false;
    btn.textContent = window.t ? window.t('ai.btn', lang) : 'Find Matches';
    btn.classList.remove('ai-btn-thinking');

    /* Scroll to results */
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 900);
};

/* ─── Allow Enter key in textarea ─── */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('ai-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        window.runAIMatch();
      }
    });
  }

  /* Example prompt chips */
  document.querySelectorAll('.ai-example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const aiInput = document.getElementById('ai-input');
      if (aiInput) {
        aiInput.value = chip.dataset.prompt;
        aiInput.focus();
        /* Subtle highlight */
        aiInput.classList.add('ai-input-highlight');
        setTimeout(() => aiInput.classList.remove('ai-input-highlight'), 600);
      }
    });
  });
});
