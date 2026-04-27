/* ═══════════════════════════════════════════════════════
   ConnectHBG — Smart Map System
   Upgraded Leaflet map: clustering, filtering, distance,
   heatmap, rich popups, CARTO modern tiles
═══════════════════════════════════════════════════════ */

'use strict';

/* ─── Verified Harrisonburg, VA coordinates for all 15 resources ─── */
const VERIFIED_COORDS = {
  1:  { lat: 38.4537, lng: -78.8725 }, // Harrisonburg Food Bank – near Waterman Dr area
  2:  { lat: 38.4489, lng: -78.8731 }, // Valley Community Shelter – S Main St corridor
  3:  { lat: 38.4402, lng: -78.8693 }, // Youth Coding Club – S High St / JMU area
  4:  { lat: 38.4368, lng: -78.8730 }, // STEM Innovation Workshop – near JMU ISAT
  5:  { lat: 38.4512, lng: -78.8669 }, // Valley Mental Health Center – E Market St area
  6:  { lat: 38.4461, lng: -78.8752 }, // Community Garden Collective – near Purcell Park
  7:  { lat: 38.4579, lng: -78.8641 }, // Senior Support Network – N Mason St area
  8:  { lat: 38.4447, lng: -78.8774 }, // Neighborhood Cleanup Crew – Purcell Park
  9:  { lat: 38.4503, lng: -78.8658 }, // Peer Tutoring Program – E Market area
  10: { lat: 38.4533, lng: -78.8801 }, // Emergency Food Distribution – W Water St area
  11: { lat: 38.4421, lng: -78.8712 }, // Community Fitness & Wellness – Pleasant Hill Rd
  12: { lat: 38.4496, lng: -78.8689 }, // Library Discovery Programs – downtown library
  13: { lat: 38.4558, lng: -78.8718 }, // Immigrant & Refugee Services – N Liberty St
  14: { lat: 38.4431, lng: -78.8675 }, // Youth Arts & Culture Center – S Main area
  15: { lat: 38.4519, lng: -78.8755 }, // Housing Assistance Coalition – W Bruce St area
};

/* ─── State ─── */
let smartMap = null;
let clusterGroup = null;
let heatLayer = null;
let userPinMarker = null;
let userCoords = null;
let smCategoryFilter = '';
let smOpenNowFilter = false;
let smHeatmapActive = false;
let smartMapMarkersList = [];

/* ─── Haversine distance (miles) ─── */
function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

/* ─── Open-now detection ─── */
function isOpenNow(r) {
  if (r.availability === 'always') return true;
  const d = new Date();
  const dow = d.getDay(); // 0=Sun
  const h = d.getHours() + d.getMinutes() / 60;
  if (r.availability === 'weekdays') return dow >= 1 && dow <= 5 && h >= 8 && h < 20;
  if (r.availability === 'weekends') return (dow === 0 || dow === 6) && h >= 7 && h < 18;
  return false;
}

/* ─── Inject smart map control panel ─── */
function injectSmartMapControls() {
  if (document.getElementById('smc-panel')) return;
  const wrap = document.getElementById('map-container');
  if (!wrap) return;

  const panel = document.createElement('div');
  panel.id = 'smc-panel';
  panel.className = 'smc-panel';
  panel.innerHTML = `
    <div class="smc-row smc-cats" role="group" aria-label="Filter by category">
      <button class="smc-cat active" data-cat="" onclick="smSetCategory('')">
        <span class="smc-cat-icon">🗺️</span> All
      </button>
      <button class="smc-cat" data-cat="Food" onclick="smSetCategory('Food')">
        <span class="smc-cat-icon">🍎</span> Food
      </button>
      <button class="smc-cat" data-cat="Health" onclick="smSetCategory('Health')">
        <span class="smc-cat-icon">🏥</span> Health
      </button>
      <button class="smc-cat" data-cat="Education" onclick="smSetCategory('Education')">
        <span class="smc-cat-icon">📚</span> Education
      </button>
      <button class="smc-cat" data-cat="Housing" onclick="smSetCategory('Housing')">
        <span class="smc-cat-icon">🏠</span> Housing
      </button>
      <button class="smc-cat" data-cat="Volunteer" onclick="smSetCategory('Volunteer')">
        <span class="smc-cat-icon">🤝</span> Volunteer
      </button>
      <button class="smc-cat" data-cat="Support" onclick="smSetCategory('Support')">
        <span class="smc-cat-icon">💛</span> Support
      </button>
    </div>
    <div class="smc-row smc-toggles">
      <label class="smc-toggle-wrap">
        <div class="smc-switch">
          <input type="checkbox" id="sm-open-now" onchange="smToggleOpenNow(this.checked)" />
          <span class="smc-slider"></span>
        </div>
        <span class="smc-toggle-label">Open Now</span>
      </label>
      <label class="smc-toggle-wrap">
        <div class="smc-switch">
          <input type="checkbox" id="sm-heatmap" onchange="smToggleHeatmap(this.checked)" />
          <span class="smc-slider"></span>
        </div>
        <span class="smc-toggle-label">Density Heat</span>
      </label>
      <button class="smc-locate-btn" onclick="smLocateUser()" aria-label="Find resources near me">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
          <circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
        </svg>
        Near Me
      </button>
    </div>
    <div id="smc-status" class="smc-status hidden"></div>
  `;
  wrap.insertBefore(panel, wrap.firstChild);
}

/* ─── Category helpers (safe fallbacks if app.js not yet loaded) ─── */
function smCatHex(cat) {
  const map = { Food:'#F97316', Health:'#EF4444', Education:'#3B82F6', Housing:'#10B981', Volunteer:'#8B5CF6', Support:'#F59E0B' };
  return map[cat] || '#64748B';
}
function smCatEmoji(cat) {
  const map = { Food:'🍎', Health:'🏥', Education:'📚', Housing:'🏠', Volunteer:'🤝', Support:'💛' };
  return map[cat] || '📌';
}

/* ─── Build filtered resource list for smart map ─── */
function smGetResources() {
  const base = (typeof filteredResources !== 'undefined' && filteredResources.length)
    ? filteredResources
    : RESOURCES;
  return base.filter(r => {
    if (smCategoryFilter && r.category !== smCategoryFilter) return false;
    if (smOpenNowFilter && !isOpenNow(r)) return false;
    return true;
  });
}

/* ─── Render markers ─── */
function smRefreshMarkers() {
  if (!smartMap) return;

  /* Clear old cluster / markers */
  if (clusterGroup) { smartMap.removeLayer(clusterGroup); clusterGroup = null; }
  smartMapMarkersList = [];

  const resources = smGetResources();

  /* Create cluster group if plugin available */
  if (typeof L.markerClusterGroup !== 'undefined') {
    clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      maxClusterRadius: 55,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: cluster => {
        const n = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="sm-cluster"><span>${n}</span></div>`,
          className: '',
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });
      }
    });
  }

  resources.forEach(r => {
    /* Use verified coordinates */
    const coords = VERIFIED_COORDS[r.id];
    const lat = coords ? coords.lat : r.lat;
    const lng = coords ? coords.lng : r.lng;

    const color = smCatHex(r.category);
    const open = isOpenNow(r);
    const dist = userCoords
      ? `${haversineMiles(userCoords.lat, userCoords.lng, lat, lng)} mi`
      : null;

    /* Custom marker icon */
    const icon = L.divIcon({
      className: '',
      html: `
        <div class="sm-marker${open ? ' sm-open' : ' sm-closed'}" style="--mc:${color}">
          <span class="sm-marker-emoji">${smCatEmoji(r.category)}</span>
          ${open ? '<span class="sm-open-ring"></span>' : ''}
        </div>`,
      iconSize: [44, 52],
      iconAnchor: [22, 52],
      popupAnchor: [0, -56]
    });

    /* Rich popup card */
    const popup = L.popup({
      maxWidth: 300,
      className: 'sm-popup-wrap',
      closeButton: true,
      autoPan: true,
      autoPanPadding: [30, 30]
    }).setContent(`
      <div class="sm-popup">
        <div class="sm-popup-img" style="background-image:url('${r.image || ''}');background-color:${color}20">
          <span class="sm-popup-cat-pill" style="background:${color}">${r.category}</span>
          ${open
            ? '<span class="sm-popup-status open">● Open Now</span>'
            : '<span class="sm-popup-status closed">● Closed</span>'}
        </div>
        <div class="sm-popup-body">
          <h3 class="sm-popup-title">${r.name}</h3>
          <p class="sm-popup-desc">${r.description.substring(0, 110)}…</p>
          <div class="sm-popup-meta">
            <span>⭐ ${r.rating} <span style="opacity:.6">(${r.reviews})</span></span>
            ${dist ? `<span>📍 ${dist} away</span>` : `<span>📍 ${r.address.split(',')[0]}</span>`}
          </div>
          <div class="sm-popup-hours">🕐 ${r.hours}</div>
          <button class="sm-popup-btn" onclick="openResourceModal(${r.id})">
            View Full Details →
          </button>
        </div>
      </div>`);

    const marker = L.marker([lat, lng], { icon }).bindPopup(popup);

    if (clusterGroup) {
      clusterGroup.addLayer(marker);
    } else {
      marker.addTo(smartMap);
    }
    smartMapMarkersList.push(marker);
  });

  if (clusterGroup) smartMap.addLayer(clusterGroup);

  /* Update status bar */
  smUpdateStatus(resources.length);
}

function smUpdateStatus(count) {
  const el = document.getElementById('smc-status');
  if (!el) return;
  if (userCoords) {
    const nearby = smGetResources().filter(r => {
      const c = VERIFIED_COORDS[r.id];
      return parseFloat(haversineMiles(userCoords.lat, userCoords.lng,
        c ? c.lat : r.lat, c ? c.lng : r.lng)) <= 2;
    }).length;
    el.textContent = `${count} resource${count !== 1 ? 's' : ''} shown · ${nearby} within 2 miles`;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

/* ─── Public controls ─── */
window.smSetCategory = function(cat) {
  smCategoryFilter = cat;
  document.querySelectorAll('.smc-cat').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  smRefreshMarkers();
};

window.smToggleOpenNow = function(val) {
  smOpenNowFilter = val;
  smRefreshMarkers();
};

window.smToggleHeatmap = function(val) {
  smHeatmapActive = val;
  if (!smartMap) return;
  if (!val) { if (heatLayer) { smartMap.removeLayer(heatLayer); heatLayer = null; } return; }
  if (typeof L.heatLayer === 'undefined') { showToast && showToast('Heatmap layer loading…'); return; }
  if (heatLayer) smartMap.removeLayer(heatLayer);
  const pts = RESOURCES.map(r => {
    const c = VERIFIED_COORDS[r.id];
    return [c ? c.lat : r.lat, c ? c.lng : r.lng, 0.8];
  });
  heatLayer = L.heatLayer(pts, {
    radius: 38, blur: 22, maxZoom: 16,
    gradient: { 0.3: '#14B8A6', 0.6: '#8B5CF6', 1.0: '#F43F5E' }
  }).addTo(smartMap);
};

window.smLocateUser = function() {
  if (!navigator.geolocation) { showToast && showToast('Geolocation not supported'); return; }
  const btn = document.querySelector('.smc-locate-btn');
  if (btn) { btn.classList.add('locating'); btn.textContent = 'Locating…'; }

  navigator.geolocation.getCurrentPosition(pos => {
    userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };

    if (userPinMarker) smartMap.removeLayer(userPinMarker);
    userPinMarker = L.marker([userCoords.lat, userCoords.lng], {
      icon: L.divIcon({
        className: '',
        html: `<div class="sm-user-pin">
          <div class="sm-user-pulse"></div>
          <div class="sm-user-dot"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      zIndexOffset: 1000
    }).addTo(smartMap).bindPopup('<strong>📍 Your Location</strong>');

    smartMap.flyTo([userCoords.lat, userCoords.lng], 14, { duration: 1.2 });
    smRefreshMarkers();
    if (btn) { btn.classList.remove('locating'); btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg> Near Me ✓`; }
    showToast && showToast('Showing distances from your location');
  }, () => {
    if (btn) { btn.classList.remove('locating'); btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg> Near Me`; }
    showToast && showToast('Unable to access your location');
  });
};

/* ─── Override initMap ─── */
window.initMap = function() {
  if (smartMap) { smRefreshMarkers(); return; }

  injectSmartMapControls();

  smartMap = L.map('resource-map', {
    center: [38.4496, -78.8689],
    zoom: 13,
    zoomControl: false,
    scrollWheelZoom: true,
  });

  /* Modern CARTO Voyager tiles — no API key needed */
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(smartMap);

  /* Move zoom control to bottom-right */
  L.control.zoom({ position: 'bottomright' }).addTo(smartMap);

  /* Sync global variable so legacy code still works */
  mapInstance = smartMap;

  smRefreshMarkers();
};

/* ─── Override updateMapMarkers for backward compat ─── */
window.updateMapMarkers = function() {
  smRefreshMarkers();
};
