/* ═══════════════════════════════════════════════════════
   ConnectHBG — Government & Crisis Resources
   features/government-crisis.js
═══════════════════════════════════════════════════════ */

'use strict';

// ─── Council Members Data ─────────────────────────────
const COUNCIL_MEMBERS = [
  {
    id: 'cm1',
    name: 'Sal Romero',
    role: 'Mayor',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80',
    description: 'Mayor Romero has championed downtown revitalization and bilingual city services since taking office. He is committed to making Harrisonburg welcoming and accessible for all residents regardless of background.',
    email: 'sal.romero@harrisonburgva.gov',
    phone: '(540) 432-7701'
  },
  {
    id: 'cm2',
    name: 'Laura Gonzalez',
    role: 'Vice Mayor',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    description: 'Vice Mayor Gonzalez leads efforts to expand bilingual city services and immigrant community support. Her work has improved access to city programs for the Shenandoah Valley\'s growing Latino population.',
    email: 'laura.gonzalez@harrisonburgva.gov',
    phone: '(540) 432-7702'
  },
  {
    id: 'cm3',
    name: 'Chris Jones',
    role: 'Council Member',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
    description: 'Council Member Jones focuses on infrastructure planning and road maintenance across Harrisonburg\'s neighborhoods. He chairs the Public Works subcommittee and advocates for safer streets and improved transit.',
    email: 'chris.jones@harrisonburgva.gov',
    phone: '(540) 432-7703'
  },
  {
    id: 'cm4',
    name: 'Monica Patel',
    role: 'Council Member',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80',
    description: 'Council Member Patel leads Harrisonburg\'s environmental sustainability initiatives including the City Climate Action Plan. She is passionate about protecting the Shenandoah Valley\'s natural resources for future generations.',
    email: 'monica.patel@harrisonburgva.gov',
    phone: '(540) 432-7704'
  },
  {
    id: 'cm5',
    name: 'George Whitmore',
    role: 'Council Member',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    description: 'Council Member Whitmore prioritizes public safety and community policing partnerships. He works closely with the Harrisonburg Police Department to strengthen trust between officers and the residents they serve.',
    email: 'george.whitmore@harrisonburgva.gov',
    phone: '(540) 432-7705'
  },
  {
    id: 'cm6',
    name: 'Dina Abramson',
    role: 'Council Member',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&q=80',
    description: 'Council Member Abramson focuses on education and workforce development, partnering with James Madison University and Harrisonburg City Schools to expand apprenticeship and job training programs.',
    email: 'dina.abramson@harrisonburgva.gov',
    phone: '(540) 432-7706'
  }
];

// ─── City Staff Data ──────────────────────────────────
const DEPT_COLORS = {
  'City Manager':        '#14B8A6',
  'Finance':             '#F59E0B',
  'Public Works':        '#F97316',
  'Community Development': '#3B82F6',
  'Parks & Recreation':  '#10B981',
  'Police':              '#8B5CF6',
  'Fire':                '#EF4444'
};

const CITY_STAFF = [
  { id: 's1',  name: 'Thomas Reed',    department: 'City Manager',          title: 'City Manager',           email: 'treed@harrisonburgva.gov',    phone: '(540) 432-7710' },
  { id: 's2',  name: 'Priya Sharma',   department: 'Finance',               title: 'Finance Director',       email: 'psharma@harrisonburgva.gov',  phone: '(540) 432-7711' },
  { id: 's3',  name: 'Marcus Webb',    department: 'Finance',               title: 'Budget Analyst',         email: 'mwebb@harrisonburgva.gov',    phone: '(540) 432-7712' },
  { id: 's4',  name: 'Hector Vargas',  department: 'Public Works',          title: 'Public Works Director',  email: 'hvargas@harrisonburgva.gov',  phone: '(540) 432-7713' },
  { id: 's5',  name: 'Linda Chen',     department: 'Public Works',          title: 'Infrastructure Engineer',email: 'lchen@harrisonburgva.gov',    phone: '(540) 432-7714' },
  { id: 's6',  name: 'James Okafor',   department: 'Community Development', title: 'Planning Director',      email: 'jokafor@harrisonburgva.gov',  phone: '(540) 432-7715' },
  { id: 's7',  name: 'Sofia Martinez', department: 'Parks & Recreation',    title: 'Parks Director',         email: 'smartinez@harrisonburgva.gov',phone: '(540) 432-7716' },
  { id: 's8',  name: 'David Kim',      department: 'Parks & Recreation',    title: 'Recreation Coordinator', email: 'dkim@harrisonburgva.gov',     phone: '(540) 432-7717' },
  { id: 's9',  name: 'Angela Brooks',  department: 'Police',                title: 'Chief of Police',        email: 'abrooks@harrisonburgva.gov',  phone: '(540) 432-7718' },
  { id: 's10', name: 'Robert Nguyen',  department: 'Fire',                  title: 'Fire Chief',             email: 'rnguyen@harrisonburgva.gov',  phone: '(540) 432-7719' }
];

// ─── Initiatives Data ─────────────────────────────────
const INITIATIVES = [
  {
    id: 'init1',
    name: 'Downtown Streetscape Improvement',
    category: 'Infrastructure',
    description: 'A comprehensive redesign of downtown Harrisonburg\'s main corridors, adding wider sidewalks, improved lighting, and new landscaping along Court Square and Main Street. The project will improve pedestrian safety and create a more vibrant environment for local businesses and visitors.',
    budget: '$8.5M',
    timeline: '2025–2028',
    status: 'Funding approved · Construction begins late 2026',
    statusType: 'active',
    learnMoreUrl: 'https://www.harrisonburgva.gov/comprehensive-plan'
  },
  {
    id: 'init2',
    name: 'Blacks Run Greenway Extension',
    category: 'Parks',
    description: 'Extending the beloved Blacks Run trail system by 2.4 miles through east Harrisonburg, connecting Purcell Park to the Eastside neighborhood and creating a continuous greenway corridor. The extension will include new rest areas, improved creek access points, and enhanced stormwater features.',
    budget: '$3.2M',
    timeline: '2026–2027',
    status: 'Planning phase · Community input open',
    statusType: 'planning',
    learnMoreUrl: 'https://www.waynesboro.va.us/974/Greenway-Extension'
  },
  {
    id: 'init3',
    name: 'City Climate Action Plan',
    category: 'Climate',
    description: 'Harrisonburg\'s roadmap to reduce municipal carbon emissions by 45% by 2030, including fleet electrification, solar installation on city buildings, and expanded recycling programs. The plan also addresses climate resilience for vulnerable neighborhoods throughout the Shenandoah Valley.',
    budget: '$1.8M',
    timeline: '2024–2030',
    status: 'Implementation underway · On track',
    statusType: 'active',
    learnMoreUrl: 'https://www.harrisonburgva.gov/EAP'
  },
  {
    id: 'init4',
    name: 'Safe Routes to Schools Program',
    category: 'Education',
    description: 'Comprehensive sidewalk improvements, crosswalk upgrades, and enhanced signage along school routes near Waterman, Keister, and Spotswood elementary schools. Phase 2 focuses on closing remaining gaps in the pedestrian network to make every child\'s walk to school safer and more accessible.',
    budget: '$2.1M',
    timeline: '2025–2027',
    status: 'Phase 2 underway · 3 schools completed',
    statusType: 'active',
    learnMoreUrl: 'https://www.harrisonburgva.gov/safe-routes-to-school'
  },
  {
    id: 'init5',
    name: 'Harrisonburg Broadband Expansion',
    category: 'Infrastructure',
    description: 'Expanding high-speed internet access to underserved neighborhoods across Harrisonburg, partnering with regional providers to bring fiber-optic infrastructure to areas that currently lack reliable connectivity. The project prioritizes low-income residential areas and community anchor institutions.',
    budget: '$4.5M',
    timeline: '2025–2029',
    status: 'Federal funding secured · RFP phase',
    statusType: 'planning',
    learnMoreUrl: 'https://www.dhcd.virginia.gov/bead'
  },
  {
    id: 'init6',
    name: 'Community Recreation Center Renovation',
    category: 'Parks',
    description: 'Major renovation of the Westover Pool complex and community center, adding new fitness areas, fully accessible facilities, upgraded locker rooms, and expanded programming space. The renovation will increase community center capacity and ensure ADA compliance throughout the facility.',
    budget: '$6.8M',
    timeline: '2026–2028',
    status: 'Design approved · Awaiting construction bids',
    statusType: 'planning',
    learnMoreUrl: 'https://www.harrisonburgva.gov/parks-recreation'
  },
  {
    id: 'init7',
    name: 'Harrisonburg Public Art Program',
    category: 'Culture',
    description: 'Installing permanent public art installations at five high-traffic locations downtown including Court Square, the Friendly City Trail head, and the new transit center. The program celebrates the city\'s diverse cultural identity and transforms public spaces into vibrant community gathering points.',
    budget: '$800K',
    timeline: '2026–2028',
    status: 'Artist selection underway · 5 locations identified',
    statusType: 'active',
    learnMoreUrl: 'https://www.harrisonburgva.gov/public-art'
  },
  {
    id: 'init8',
    name: 'Stormwater Infrastructure Upgrade',
    category: 'Infrastructure',
    description: 'Upgrading aging stormwater pipes and adding green infrastructure including bioswales and rain gardens in the Blacks Run watershed to reduce flooding. The project addresses long-standing drainage issues in low-lying neighborhoods and improves water quality throughout the Shenandoah Valley.',
    budget: '$3.2M',
    timeline: '2025–2027',
    status: 'Phase 1 construction · 40% complete',
    statusType: 'active',
    learnMoreUrl: 'https://www.harrisonburgva.gov/stormwater'
  }
];

const INIT_COLORS  = { Infrastructure: '#F97316', Parks: '#10B981', Climate: '#3B82F6', Education: '#8B5CF6', Culture: '#EC4899' };
const STATUS_COLORS = { active: '#10B981', planning: '#F59E0B', complete: '#3B82F6' };

// ─── Council Meetings Data ────────────────────────────
const COUNCIL_MEETINGS = [
  { id: 'meet4', title: 'Public Hearing: Budget FY2027',    date: '2026-05-05', dayOfWeek: 'Tuesday', time: '7:00 PM', location: 'City Hall Council Chambers', type: 'Public Hearing',  agenda: ['FY2027 budget review', 'Public comment period', 'Department budget presentations'] },
  { id: 'meet7', title: 'City Council Regular Session',     date: '2026-05-06', dayOfWeek: 'Wednesday', time: '7:00 PM', location: 'City Hall Council Chambers', type: 'Regular Session', agenda: ['FY2027 budget first reading', 'Greenway Phase 2 update', 'Public comment period'] },
  { id: 'meet5', title: 'City Council Regular Meeting',     date: '2026-05-12', dayOfWeek: 'Tuesday', time: '7:00 PM', location: 'City Hall Council Chambers', type: 'Regular Session', agenda: ['Regular business', 'Committee reports', 'Public comment'] },
  { id: 'meet6', title: 'City Council Regular Meeting',     date: '2026-05-19', dayOfWeek: 'Tuesday', time: '7:00 PM', location: 'City Hall Council Chambers', type: 'Regular Session', agenda: ['Regular business', 'Committee reports', 'Public comment'] },
  { id: 'meet8', title: 'City Council Work Session',        date: '2026-05-20', dayOfWeek: 'Wednesday', time: '7:00 PM', location: 'City Hall Council Chambers', type: 'Work Session',    agenda: ['Downtown parking study review', 'Community broadband RFP discussion', 'Parks master plan amendment'] }
];

const MONTH_ABBR = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function parseMeetingDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return { month: MONTH_ABBR[d.getMonth()], day: d.getDate() };
}

// ─── Departments Data ─────────────────────────────────
const DEPARTMENTS = [
  { emoji: '🔧', name: 'Public Works',          desc: 'Roads, utilities, infrastructure maintenance', head: 'Director Michael Torres',  headTitle: 'Director',        email: 'mitorres@harrisonburgva.gov', office: 'City Hall, Room 104',       phone: '(540) 434-5928' },
  { emoji: '🏗️', name: 'Community Development', desc: 'Permits, planning, zoning, inspections',       head: 'Director James Polk',      headTitle: 'Director',        email: 'jpolk@harrisonburgva.gov',   office: 'City Hall, Room 306',       phone: '(540) 432-7700' },
  { emoji: '🛡️', name: 'Police Department',     desc: 'Public safety and community policing',         head: 'Chief Kelley Warner',      headTitle: 'Chief of Police', email: 'kwarner@harrisonburgva.gov', office: 'HPD Headquarters',          phone: '(540) 434-4436' },
  { emoji: '🚒', name: 'Fire Department',        desc: 'Fire prevention, EMS, emergency response',     head: 'Chief Ian Bennett',        headTitle: 'Fire Chief',      email: 'ibennett@harrisonburgva.gov',office: 'Central Fire Station',      phone: '(540) 432-7703' },
  { emoji: '🌲', name: 'Parks & Recreation',     desc: 'Parks, trails, programs, facilities',          head: 'Director Angela Freeman',  headTitle: 'Director',        email: 'afreeman@harrisonburgva.gov',office: 'Westover Park Office',      phone: '(540) 433-2474' },
  { emoji: '💰', name: 'Finance',                desc: 'Budget, taxes, financial transparency',        head: 'Director Rachel Liu',      headTitle: 'Director',        email: 'rliu@harrisonburgva.gov',    office: 'City Hall, Room 201',       phone: '(540) 432-7701' }
];

// ─── FAQ Data ─────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'How do I report a pothole or road damage?',
    a: 'You can report road damage using the "Report an Issue" button in the section above, or by calling Public Works at (540) 433-9179 during business hours. For urgent hazards, contact the City\'s 24-hour line. The Public Works department tracks all submissions and prioritizes repairs by severity and safety impact.'
  },
  {
    q: 'When does the City Council meet?',
    a: 'The Harrisonburg City Council holds regular meetings on the 1st and 3rd Tuesday of each month at 7:00 PM in the City Hall Council Chamber at 409 S. Main Street. Work sessions and special public hearings may be scheduled at other times. See the Upcoming Meetings section above for the current schedule.'
  },
  {
    q: 'How can I submit a public comment to the City Council?',
    a: 'You can speak at any regular Council meeting during the Public Comment period — arrive early and sign in at the clerk\'s table. Written comments may also be submitted by email to the City Clerk at cityclerk@harrisonburgva.gov at least 24 hours before the meeting. All public comments become part of the official record.'
  },
  {
    q: 'How do I apply for a building permit?',
    a: 'Building permits are processed through the Community Development Department at City Hall. You can apply online at harrisonburgva.gov, in person, or by mail. Allow 5–10 business days for standard permits. Contact Community Development at (540) 432-7700 for guidance on specific project requirements and zoning questions.'
  },
  {
    q: "Where can I find the City's budget?",
    a: "The adopted City budget is published annually on the Finance Department's page at harrisonburgva.gov/finance. Budget documents, financial reports, and audit results are available for public review. The Finance Director also presents budget summaries at Council meetings each spring during the annual budget adoption process."
  },
  {
    q: 'How do I contact a City Council member?',
    a: 'All six Council members\' email addresses and phone numbers are listed in the "Your City Council" section above. You may also reach any Council member through City Hall at (540) 432-7700. Council members typically respond to constituent inquiries within 2–3 business days.'
  },
  {
    q: 'What parks and trails does Harrisonburg have?',
    a: 'Harrisonburg maintains over 20 parks and natural areas. Major destinations include Hillandale Park (pool, sports fields, picnic shelters), Purcell Park (tennis courts, open green space), Blacks Run Greenway (paved trail along the creek through downtown), and Westover Park (community center, athletic fields). Visit harrisonburgva.gov/parks for a complete list and trail maps.'
  },
  {
    q: 'How do I report a non-emergency safety concern?',
    a: 'For non-emergency police matters — such as noise complaints, suspicious activity, or minor incidents — call the Harrisonburg Police Department\'s non-emergency line at (540) 434-4436, available 24/7. For immediate life-threatening emergencies, always call 911. You can also submit non-emergency tips online at harrisonburgva.gov/police.'
  }
];

// ─── Crisis Resources Data ────────────────────────────
const CRISIS_CATEGORIES = [
  {
    emoji: '🧠',
    name: 'Mental Health & Suicide Prevention',
    color: '#8B5CF6',
    resources: [
      {
        name: '988 Suicide and Crisis Lifeline',
        phone: '988',
        phoneDisplay: '988',
        hours: '24/7',
        description: 'Call or text 988 for free, confidential support for people in distress. Trained counselors are available around the clock.',
        textLine: 'Text HOME to 988',
        website: '988lifeline.org'
      },
      {
        name: 'SAMHSA National Helpline',
        phone: '18006624357',
        phoneDisplay: '1-800-662-4357',
        hours: '24/7',
        description: 'Free, confidential referrals and information for mental health and substance use disorders. Available in English and Spanish.'
      },
      {
        name: 'HR Community Services Board',
        phone: '5404341941',
        phoneDisplay: '(540) 434-1941',
        hours: 'Mon–Fri 8 AM–5 PM',
        description: 'Local mental health, substance use, and developmental disability services for the Harrisonburg-Rockingham area.'
      }
    ]
  },
  {
    emoji: '🛡️',
    name: 'Domestic Violence & Sexual Assault',
    color: '#EF4444',
    resources: [
      {
        name: 'National Domestic Violence Hotline',
        phone: '18007997233',
        phoneDisplay: '1-800-799-7233',
        hours: '24/7',
        description: 'Confidential support, safety planning, and local shelter referrals for those experiencing domestic violence.',
        textLine: 'Text START to 88788'
      },
      {
        name: 'The Collins Center',
        phone: '5404326430',
        phoneDisplay: '(540) 432-6430',
        hours: '24/7',
        description: 'Local crisis support for survivors of domestic violence and sexual assault serving Harrisonburg and Rockingham County.'
      },
      {
        name: 'RAINN Sexual Assault Hotline',
        phone: '18006564673',
        phoneDisplay: '1-800-656-4673',
        hours: '24/7',
        description: 'Confidential support from trained staff for sexual assault survivors. Connects callers to local sexual assault service providers.'
      }
    ]
  },
  {
    emoji: '💊',
    name: 'Substance Use & Recovery',
    color: '#F97316',
    resources: [
      {
        name: 'SAMHSA National Helpline',
        phone: '18006624357',
        phoneDisplay: '1-800-662-4357',
        hours: '24/7',
        description: 'Free, confidential treatment referrals and information for substance use disorders. Available in English and Spanish.'
      },
      {
        name: 'Virginia Helpline',
        phone: '18005528999',
        phoneDisplay: '1-800-552-8999',
        hours: '24/7',
        description: 'Statewide support line for substance use, gambling addiction, and mental health crises across Virginia.'
      }
    ]
  },
  {
    emoji: '👶',
    name: 'Child & Youth Safety',
    color: '#3B82F6',
    resources: [
      {
        name: 'Childhelp National Child Abuse Hotline',
        phone: '18004224453',
        phoneDisplay: '1-800-422-4453',
        hours: '24/7',
        description: 'Crisis intervention, support, and referrals for victims of child abuse and neglect or concerned family members.'
      },
      {
        name: 'Virginia Child Protective Services',
        phone: '18005527096',
        phoneDisplay: '1-800-552-7096',
        hours: '24/7',
        description: "Report suspected child abuse or neglect to Virginia's statewide child protective services intake hotline."
      },
      {
        name: 'Boys Town National Hotline',
        phone: '18004483000',
        phoneDisplay: '1-800-448-3000',
        hours: '24/7',
        description: 'Confidential support for youth and families from bilingual counselors trained in crisis intervention and family issues.'
      }
    ]
  },
  {
    emoji: '🏠',
    name: 'Food & Housing Emergencies',
    color: '#10B981',
    resources: [
      {
        name: 'United Way 211',
        phone: '211',
        phoneDisplay: '211',
        hours: '24/7',
        description: 'Call or text 211 to be connected with local food banks, emergency shelters, utility assistance, and other social services.'
      },
      {
        name: 'HR Community Action Agency',
        phone: '5404342187',
        phoneDisplay: '(540) 434-2187',
        hours: 'Weekdays',
        description: 'Emergency food assistance, utility help, and housing support for Harrisonburg-Rockingham area residents in need.'
      },
      {
        name: 'Blue Ridge Area Food Bank',
        phone: '5402483663',
        phoneDisplay: '(540) 248-3663',
        hours: 'Weekdays',
        description: 'Food distribution programs across the Shenandoah Valley, serving Harrisonburg, Rockingham County, and surrounding areas.'
      }
    ]
  },
  {
    emoji: '🚨',
    name: 'Emergency Services',
    color: '#EF4444',
    resources: [
      {
        name: '911 — Emergency',
        phone: '911',
        phoneDisplay: '911',
        hours: '24/7',
        description: 'Call 911 immediately for any life-threatening emergency — police, fire, or medical. Do not hesitate to call.'
      },
      {
        name: 'Harrisonburg Police (Non-Emergency)',
        phone: '5404344436',
        phoneDisplay: '(540) 434-4436',
        hours: '24/7',
        description: 'For non-urgent police matters: noise complaints, suspicious activity, minor incidents, and general safety questions.'
      },
      {
        name: 'Poison Control Center',
        phone: '18002221222',
        phoneDisplay: '1-800-222-1222',
        hours: '24/7',
        description: 'Free expert medical advice for poisoning emergencies from household chemicals, medications, plants, and more.'
      }
    ]
  }
];

/* ═══════════════════════════════════════════════════════
   GOVERNMENT — RENDER FUNCTIONS
═══════════════════════════════════════════════════════ */

function initGovernment() {
  renderCouncilCards();
  renderStaffDirectory();
  renderInitiatives();
  renderMeetings();
  renderDepartments();
  renderFAQ();
}

// 1B — Council member cards
function renderCouncilCards() {
  const grid = document.getElementById('council-grid');
  if (!grid) return;

  grid.innerHTML = COUNCIL_MEMBERS.map((m, i) => {
    const badgeClass = m.role === 'Mayor' ? 'council-badge-mayor'
                     : m.role === 'Vice Mayor' ? 'council-badge-vice'
                     : 'council-badge-member';
    return `
      <article class="council-card" role="listitem"
        style="animation:fadeSlideIn .35s ease both;animation-delay:${i * 40}ms"
        data-aos="fade-up" data-aos-delay="${i * 60}">
        <div class="council-img-wrap">
          <img src="${m.image}" alt="Photo of ${m.name}" loading="lazy" class="council-img" />
        </div>
        <div class="council-body">
          <span class="council-badge ${badgeClass}" data-i18n="council.role.${m.id}">${m.role}</span>
          <h4 class="council-name" data-i18n="council.name.${m.id}">${m.name}</h4>
          <p class="council-desc" data-i18n="council.desc.${m.id}">${m.description}</p>
          <div class="council-contact">
            <a href="mailto:${m.email}" class="council-contact-link" aria-label="Email ${m.name}">
              <span data-lucide="mail" class="w-4 h-4"></span>${m.email}
            </a>
            <a href="tel:${m.phone.replace(/\D/g,'')}" class="council-contact-link" aria-label="Call ${m.name}">
              <span data-lucide="phone" class="w-4 h-4"></span>${m.phone}
            </a>
          </div>
        </div>
      </article>`;
  }).join('');

  lucide.createIcons();
}

// 1C — Staff directory
let activeStaffDept = 'All';

function renderStaffDirectory() {
  const tabsEl = document.getElementById('staff-filter-tabs');
  const listEl = document.getElementById('staff-list');
  if (!tabsEl || !listEl) return;

  const depts = ['All', 'City Manager', 'Finance', 'Public Works',
                 'Community Development', 'Parks & Recreation', 'Police', 'Fire'];

  tabsEl.innerHTML = depts.map(d => `
    <button class="staff-dept-tab${d === activeStaffDept ? ' active' : ''}"
      onclick="filterStaff('${d}')"
      aria-pressed="${d === activeStaffDept}"
      data-dept="${d}">${d}</button>`).join('');

  renderStaffCards(listEl);
}

function renderStaffCards(listEl) {
  const filtered = activeStaffDept === 'All'
    ? CITY_STAFF
    : CITY_STAFF.filter(s => s.department === activeStaffDept);

  listEl.innerHTML = filtered.map((s, i) => {
    const color = DEPT_COLORS[s.department] || '#14B8A6';
    return `
      <div class="staff-card" role="listitem"
        style="animation:fadeSlideIn .3s ease both;animation-delay:${i * 30}ms">
        <div class="staff-avatar" style="background:${color}" aria-hidden="true">${s.name.charAt(0)}</div>
        <div class="staff-info">
          <div class="staff-name">${s.name}</div>
          <div class="staff-title-text">${s.title}</div>
          <div class="staff-dept-label" style="color:${color}">${s.department}</div>
        </div>
        <div class="staff-actions">
          <a href="mailto:${s.email}" class="staff-action-btn" aria-label="Email ${s.name}" title="Email ${s.name}">
            <span data-lucide="mail" class="w-4 h-4"></span>
          </a>
          <a href="tel:${s.phone.replace(/\D/g,'')}" class="staff-action-btn" aria-label="Call ${s.name}" title="Call ${s.name}">
            <span data-lucide="phone" class="w-4 h-4"></span>
          </a>
        </div>
      </div>`;
  }).join('');

  lucide.createIcons();
}

function filterStaff(dept) {
  activeStaffDept = dept;
  const listEl = document.getElementById('staff-list');
  const tabs   = document.querySelectorAll('.staff-dept-tab');

  tabs.forEach(tab => {
    const active = tab.dataset.dept === dept;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-pressed', String(active));
  });

  if (!listEl) return;
  listEl.style.opacity = '0';
  listEl.style.transition = 'opacity .18s ease';
  setTimeout(() => {
    renderStaffCards(listEl);
    listEl.style.opacity = '1';
  }, 160);
}

// 1D — Initiatives
function renderInitiatives() {
  const grid = document.getElementById('initiatives-grid');
  if (!grid) return;

  grid.innerHTML = INITIATIVES.map((init, i) => {
    const col    = INIT_COLORS[init.category]  || '#14B8A6';
    const stCol  = STATUS_COLORS[init.statusType] || '#94A3B8';
    return `
      <article class="initiative-card" role="listitem"
        style="border-left-color:${col};animation:fadeSlideIn .35s ease both;animation-delay:${i * 50}ms"
        data-aos="fade-up" data-aos-delay="${i * 80}">
        <span class="init-pill" style="background:${col}18;color:${col};border:1px solid ${col}35"
          data-i18n="init.cat.${init.id}">${init.category}</span>
        <h4 class="init-name" data-i18n="init.name.${init.id}">${init.name}</h4>
        <p class="init-desc" data-i18n="init.desc.${init.id}">${init.description}</p>
        <div class="init-meta-row">
          <span class="init-meta-item">
            <span data-lucide="dollar-sign" class="w-4 h-4"></span>${init.budget}
          </span>
          <span class="init-meta-item">
            <span data-lucide="clock" class="w-4 h-4"></span>${init.timeline}
          </span>
        </div>
        <div class="init-status-badge" style="background:${stCol}18;color:${stCol}">
          <span class="init-status-dot" style="background:${stCol}"></span>
          ${init.status}
        </div>
        <a href="${init.learnMoreUrl || '#'}" class="init-learn-more" ${init.learnMoreUrl ? 'target="_blank" rel="noopener noreferrer"' : 'onclick="return false;"'} aria-label="Learn more about ${init.name}">Learn more →</a>
      </article>`;
  }).join('');

  lucide.createIcons();
}

// 1E — Council meetings
function renderMeetings() {
  const list = document.getElementById('meetings-list');
  if (!list) return;

  const typeColors = { 'Regular Session': '#14B8A6', 'Work Session': '#8B5CF6', 'Public Hearing': '#F97316' };

  list.innerHTML = COUNCIL_MEETINGS.map((m, i) => {
    const { month, day } = parseMeetingDate(m.date);
    const rowStyle = i % 2 === 1 ? 'background:rgba(20,184,166,0.02)' : '';
    return `
      <div class="meeting-card" role="listitem"
        style="${rowStyle};animation:fadeSlideIn .3s ease both;animation-delay:${i * 40}ms">
        <div class="meeting-date-badge" aria-label="${month} ${day}">
          <span class="meeting-month">${month}</span>
          <span class="meeting-day">${day}</span>
        </div>
        <div class="meeting-info">
          <div class="meeting-title">${m.title}</div>
          <div class="meeting-meta-line">${m.dayOfWeek} · <span style="color:${typeColors[m.type]||'#94A3B8'}">${m.type}</span></div>
          <div class="meeting-detail-row">
            <span class="meeting-time">${m.time}</span>
            <span class="meeting-location">
              <span data-lucide="map-pin" class="w-3.5 h-3.5" style="flex-shrink:0"></span>${m.location}
            </span>
            <button class="meeting-cal-btn" onclick="addMeetingToCalendar('${m.id}')" aria-label="Add ${m.title} to calendar">
              <span data-lucide="calendar-plus" class="w-3.5 h-3.5"></span>
              Add to Calendar
            </button>
          </div>
        </div>
      </div>`;
  }).join('');

  lucide.createIcons();
}

function addMeetingToCalendar(id) {
  if (typeof currentUser === 'undefined' || !currentUser) {
    typeof showToast === 'function' && showToast('Sign in to add meetings to your calendar.');
    typeof openLoginModal === 'function' && openLoginModal();
    return;
  }
  const m = COUNCIL_MEETINGS.find(x => x.id === id);
  if (!m) return;
  typeof showCalendarDialog === 'function' && showCalendarDialog({
    id: m.id,
    title: m.title,
    date: m.date,
    time: m.time,
    location: m.location,
    description: m.agenda ? m.agenda.join(' · ') : m.title
  });
}

// 1F — Department flip cards
function renderDepartments() {
  const grid = document.getElementById('departments-grid');
  if (!grid) return;

  grid.innerHTML = DEPARTMENTS.map((d, i) => `
    <div class="dept-flip-outer" role="listitem"
      style="animation:fadeSlideIn .3s ease both;animation-delay:${i * 40}ms"
      data-aos="fade-up" data-aos-delay="${i * 50}"
      aria-label="${d.name}: ${d.desc}. Hover or tap to see contact details."
      onclick="this.classList.toggle('flipped')"
      onkeydown="if(event.key==='Enter'||event.key===' ')this.classList.toggle('flipped')"
      tabindex="0" role="button">
      <div class="dept-flip-inner">
        <!-- FRONT -->
        <div class="dept-flip-front dept-card" aria-hidden="false">
          <span class="dept-emoji" aria-hidden="true">${d.emoji}</span>
          <div class="dept-name">${d.name}</div>
          <div class="dept-desc-text">${d.desc}</div>
          <div class="dept-flip-hint" aria-hidden="true">Tap for contact info →</div>
        </div>
        <!-- BACK -->
        <div class="dept-flip-back dept-card dept-card-back" aria-hidden="true">
          <div class="dept-name" style="margin-bottom:10px">${d.name}</div>
          <div class="dept-head-name">${d.head}</div>
          <div class="dept-head-title">${d.headTitle}</div>
          <div class="dept-contact-list">
            <a href="mailto:${d.email}" class="dept-contact-item" onclick="event.stopPropagation()" aria-label="Email ${d.head}">
              <span data-lucide="mail" class="w-3.5 h-3.5 dept-contact-icon"></span>
              <span>${d.email}</span>
            </a>
            <div class="dept-contact-item">
              <span data-lucide="map-pin" class="w-3.5 h-3.5 dept-contact-icon"></span>
              <span>${d.office}</span>
            </div>
            <a href="tel:${d.phone}" class="dept-contact-item" onclick="event.stopPropagation()" aria-label="Call ${d.head}">
              <span data-lucide="phone" class="w-3.5 h-3.5 dept-contact-icon"></span>
              <span>${d.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>`).join('');

  lucide.createIcons();
}

// 1H — FAQ accordion
let openFAQIndex = -1;

function renderFAQ() {
  const container = document.getElementById('faq-accordion');
  if (!container) return;

  container.innerHTML = FAQ_ITEMS.map((item, i) => `
    <div class="faq-item" role="listitem">
      <button class="faq-question" id="faq-btn-${i}"
        onclick="toggleFAQ(this, ${i})"
        aria-expanded="false"
        aria-controls="faq-panel-${i}">
        <span class="faq-q-text" data-i18n="faq.q.${i}">${item.q}</span>
        <span data-lucide="chevron-down" class="faq-chevron"></span>
      </button>
      <div class="faq-answer" id="faq-panel-${i}"
        role="region" aria-labelledby="faq-btn-${i}"
        style="max-height:0;overflow:hidden;transition:max-height .35s ease">
        <p class="faq-answer-text" data-i18n="faq.a.${i}">${item.a}</p>
      </div>
    </div>`).join('');

  lucide.createIcons();
}

function toggleFAQ(btn, index) {
  // Close any open item that isn't this one
  if (openFAQIndex !== -1 && openFAQIndex !== index) {
    const prevBtn   = document.getElementById(`faq-btn-${openFAQIndex}`);
    const prevPanel = document.getElementById(`faq-panel-${openFAQIndex}`);
    if (prevBtn && prevPanel) {
      prevBtn.setAttribute('aria-expanded', 'false');
      prevBtn.classList.remove('faq-open');
      prevPanel.style.maxHeight = '0';
    }
  }

  const panel  = document.getElementById(`faq-panel-${index}`);
  const isOpen = btn.getAttribute('aria-expanded') === 'true';

  if (isOpen) {
    btn.setAttribute('aria-expanded', 'false');
    btn.classList.remove('faq-open');
    panel.style.maxHeight = '0';
    openFAQIndex = -1;
  } else {
    btn.setAttribute('aria-expanded', 'true');
    btn.classList.add('faq-open');
    panel.style.maxHeight = panel.scrollHeight + 'px';
    openFAQIndex = index;
  }
}

/* ═══════════════════════════════════════════════════════
   ISSUE REPORT MODAL
═══════════════════════════════════════════════════════ */
function openIssueModal() {
  const modal = document.getElementById('issue-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  const onEsc = e => {
    if (e.key === 'Escape') { closeIssueModalDirect(); document.removeEventListener('keydown', onEsc); }
  };
  document.addEventListener('keydown', onEsc);
}

function closeIssueModal(event) {
  if (event && event.target !== document.getElementById('issue-modal')) return;
  closeIssueModalDirect();
}

function closeIssueModalDirect() {
  const modal = document.getElementById('issue-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function handleIssuePhoto(event) {
  const file  = event.target.files[0];
  const nameEl = document.getElementById('issue-photo-name');
  if (!file || !nameEl) return;
  nameEl.textContent = '📎 ' + file.name;
  nameEl.classList.remove('hidden');
}

function submitIssueReport() {
  const type     = document.getElementById('issue-type').value;
  const location = document.getElementById('issue-location').value.trim();
  if (!type)     { showToast('Please select an issue type');    return; }
  if (!location) { showToast('Please enter the issue location'); return; }

  showToast('Report submitted! Thank you for helping improve Harrisonburg.');
  closeIssueModalDirect();

  document.getElementById('issue-form').reset();
  const nameEl = document.getElementById('issue-photo-name');
  if (nameEl) nameEl.classList.add('hidden');
}

/* ═══════════════════════════════════════════════════════
   CRISIS — RENDER
═══════════════════════════════════════════════════════ */
function initCrisis() {
  const container = document.getElementById('crisis-resources');
  if (!container) return;

  container.innerHTML = CRISIS_CATEGORIES.map((cat, ci) => `
    <div class="crisis-category${ci > 0 ? ' crisis-category-gap' : ''}"
      data-aos="fade-up" data-aos-delay="${ci * 60}">
      <h3 class="crisis-cat-heading" data-i18n="crisis.cat.${ci}">${cat.emoji} ${cat.name}</h3>
      <div class="crisis-grid">
        ${cat.resources.map((r, ri) => `
          <article class="crisis-card" role="article"
            style="border-left-color:${cat.color};animation:fadeSlideIn .35s ease both;animation-delay:${ri * 60}ms">
            <div class="crisis-org-name" data-i18n="crisis.org.${ci}.${ri}">${r.name}</div>
            <div class="crisis-phone-row">
              <span data-lucide="phone" class="w-4 h-4 crisis-phone-icon"></span>
              <a href="tel:${r.phone}" class="crisis-phone-number" aria-label="Call ${r.name} at ${r.phoneDisplay}">${r.phoneDisplay}</a>
              <span class="crisis-hours-badge ${r.hours === '24/7' ? 'crisis-hours-247' : 'crisis-hours-limited'}"
                data-i18n="crisis.hours.${ci}.${ri}">${r.hours}</span>
            </div>
            <p class="crisis-desc" data-i18n="crisis.desc.${ci}.${ri}">${r.description}</p>
            ${r.textLine ? `
            <div class="crisis-extra-row">
              <span data-lucide="message-circle" class="w-3.5 h-3.5"></span>
              <span class="crisis-extra-text">${r.textLine}</span>
            </div>` : ''}
            ${r.website ? `
            <div class="crisis-extra-row">
              <span data-lucide="globe" class="w-3.5 h-3.5"></span>
              <a href="https://${r.website}" target="_blank" rel="noopener noreferrer"
                class="crisis-website-link">${r.website}</a>
            </div>` : ''}
          </article>`).join('')}
      </div>
    </div>`).join('');

  lucide.createIcons();
}

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initGovernment();
  initCrisis();
});
