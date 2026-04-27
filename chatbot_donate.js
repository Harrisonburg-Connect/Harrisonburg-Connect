/* ═══════════════════════════════════════════════════════
   FLOATING AI CHATBOT FAB
═══════════════════════════════════════════════════════ */

'use strict';

let chatPanelOpen = false;

function toggleChatPanel() {
  chatPanelOpen = !chatPanelOpen;
  const panel   = document.getElementById('chat-panel');
  const fab     = document.getElementById('chat-fab');
  const fabIcon = document.getElementById('chat-fab-icon');
  if (!panel || !fab || !fabIcon) return;

  if (chatPanelOpen) {
    panel.classList.remove('hidden');
    fab.classList.add('open');
    fab.setAttribute('aria-expanded', 'true');
    fab.setAttribute('aria-label', 'Close community assistant');
    fabIcon.setAttribute('data-lucide', 'x');
    lucide.createIcons();
    setTimeout(() => { const inp = document.getElementById('chat-input'); if (inp) inp.focus(); }, 300);
  } else {
    panel.classList.add('hidden');
    fab.classList.remove('open');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-label', 'Open community assistant');
    fabIcon.setAttribute('data-lucide', 'message-circle');
    lucide.createIcons();
  }
}

function closeChatPanel() { if (chatPanelOpen) toggleChatPanel(); }

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && chatPanelOpen) closeChatPanel();
});

/* ═══════════════════════════════════════════════════════
   CHAT ENGINE
═══════════════════════════════════════════════════════ */

// Conversation context — remembers last topic for follow-ups
const _ctx = { intent: null, topic: null };

// Rotating response picker — never repeats consecutive answers
const _rc = {};
function _next(key, arr) {
  if (!arr || !arr.length) return '';
  _rc[key] = ((_rc[key] ?? -1) + 1) % arr.length;
  return arr[_rc[key]];
}

// ─── Typo / shorthand normalizer ──────────────────────────
const TYPO_MAP = {
  helo:'hello', heloo:'hello', hellp:'hello', heyy:'hey', heya:'hey', hiya:'hi',
  hlep:'help', hlpe:'help', hlelp:'help', pls:'please', plz:'please',
  fod:'food', fods:'food', foodbank:'food bank', hungy:'hungry', hungery:'hungry',
  housin:'housing', houing:'housing', sheltar:'shelter', homeles:'homeless',
  voulteer:'volunteer', voulnteer:'volunteer', vlunteer:'volunteer', volunter:'volunteer', voluneer:'volunteer',
  resorce:'resource', resorces:'resources', resourse:'resource', resourses:'resources',
  tutorng:'tutoring', tutorin:'tutoring', tutorring:'tutoring',
  meantal:'mental', helth:'health', heatlh:'health', medcal:'medical',
  emergancy:'emergency', emergenci:'emergency', emergengy:'emergency',
  donat:'donate', dontion:'donation', donatin:'donation',
  crisi:'crisis', hotlin:'hotline',
  hbg:'harrisonburg', harrissonburg:'harrisonburg', harrisenburg:'harrisonburg',
  harrisonburg:'harrisonburg', connecthbg:'connecthbg',
  jmu:'james madison university', emu:'eastern mennonite university',
  u:'you', ur:'your', r:'are', im:'i am',
  idk:'i dont know', nvm:'nevermind', lol:'haha', omg:'wow',
  thx:'thank you', ty:'thank you', tysm:'thank you so much',
  wht:'what', wher:'where', hw:'how', tho:'though', cuz:'because',
  wanna:'want to', gonna:'going to', gotta:'got to', lemme:'let me',
  cant:'cannot', dont:'do not', wont:'will not', didnt:'did not',
};

function normalizeQuery(text) {
  return text.toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .map(w => TYPO_MAP[w] || w)
    .join(' ');
}

// ─── Keyword banks ─────────────────────────────────────────

const CRISIS_KW = [
  'suicide','suicidal','kill myself','end my life','self harm','self-harm','hurt myself',
  'cut myself','overdose','want to die','wanna die','do not want to live','dont want to live',
  'domestic violence','being abused','he hit me','she hit me','scared for my life',
  'mental health crisis','losing control','i cannot go on','i cant go on',
];

const DISTRESS_KW = [
  'i need help','i need support','need someone to talk','i am struggling','im struggling',
  'struggling with','feel alone','feeling alone','i am scared','i am afraid','i am lonely',
  'feeling hopeless','hopeless','feeling lost','desperate','nobody cares','no one cares',
  'in crisis','really bad day','cannot cope','cant cope','overwhelmed','breaking down',
];

const GREETING_KW = [
  'hi','hello','hey','howdy','hiya','yo','sup','good morning','good afternoon',
  'good evening','whats up','what is up','greetings','hi there','hello there','hey there',
  'what up',
];

const FAREWELL_KW = [
  'bye','goodbye','see you','see ya','later','cya','farewell','take care',
  'goodnight','good night','gotta go','gtg','ttyl','talk later','adios',
];

const THANKS_KW = [
  'thank you','thanks','thank u','thx','ty','appreciate it','so helpful',
  'you re great','great help','that helped','much appreciated','you helped',
  'this helped','you are helpful','that was helpful','very helpful',
];

const HOW_ARE_YOU_KW = [
  'how are you','how re you','how are you doing','how do you do',
  'you doing okay','how r you','hows it going','how is it going','how have you been',
];

const SITE_KW = [
  'what can you do','what do you do','what are you','who are you',
  'what is connecthbg','about this site','what is this site','what is this website',
  'how does this work','how do i use','what can i do here','what features',
  'capabilities','help me navigate','what does this site do','tell me about this site',
  'explain connecthbg','what sections are there','what pages',
  'what is on this site','what this site about','how to use this',
];

const WHO_BUILT_KW = [
  'who built','who made','who created','who designed','who coded','who developed',
  'who are you made by','tsa','webmaster competition','student team',
];

const HBG_KW = [
  'harrisonburg','shenandoah','james madison','rockingham',
  'eastern mennonite','tell me about harrisonburg','about harrisonburg',
  'what is harrisonburg','history of harrisonburg','harrisonburg virginia',
  'population of harrisonburg','where is harrisonburg','how big is harrisonburg',
  'about the city','about hbg',
];

const FOLLOW_UP_KW = [
  'tell me more','more info','more information','expand on that','explain more',
  'what else','anything else about','what about that','what about it',
  'can you elaborate','go on','continue','keep going','and then','how about that',
  'more details','give me more','i want to know more',
];

const HUMOR_KW = [
  'tell me a joke','joke','make me laugh','funny','humor','humour',
  'knock knock','dad joke','pun','something funny','make me smile',
];

const OFF_TOPIC_KW = [
  'weather','sports','football','basketball','baseball','soccer','score','game',
  'movie','music','celebrity','recipe','cook','cooking','bake','baking',
  'politics','president','election','congress','stock','crypto','bitcoin',
  'what is 2','what is 1','math problem','calculate','solve',
  'who won','who is the president','who plays',
];

// ─── Resource intent definitions ────────────────────────────
const RESOURCE_INTENTS = [
  {
    key: 'food', label: 'food assistance',
    kw: ['food','hungry','hunger','eat','meal','meals','grocery','groceries','pantry',
         'food pantry','food bank','nutrition','feeding','starving','free food','food assistance'],
    responses: [
      "Looking for food? Harrisonburg has you covered! The **Resource Directory** lists local food pantries, free meal programs, and grocery assistance — just filter by 'Food & Nutrition' to find what's available near you. Most programs are open to all residents and don't require proof of income. [Go to Resource Directory →]",
      "Food assistance is one of the most accessed resources in Harrisonburg, and there's real help available! Browse the **Resource Directory** filtered by 'Food' to find pantries, hot meal programs, and grocery support. Many are open multiple days a week. Would you like me to take you there?",
      "You're in the right place for food help! Harrisonburg has several food pantries and free meal programs — check the **Resource Directory** under 'Food & Nutrition' to see options near you. No documentation is usually required. [Go to Resource Directory →]",
    ],
  },
  {
    key: 'housing', label: 'housing support',
    kw: ['housing','shelter','homeless','homelessness','eviction','evicted','rent',
         'apartment','place to stay','somewhere to sleep','living situation',
         'sleeping outside','need a place','rental assistance','housing help','landlord'],
    responses: [
      "If you need housing help, the **Resource Directory** lists local shelters, emergency housing, rental assistance programs, and eviction prevention services. Filter by 'Housing' to see everything available. If it's urgent, some organizations offer same-day placement — don't wait to reach out.",
      "Housing resources in Harrisonburg include emergency shelters, transitional housing, and rental assistance programs. Browse the **Resource Directory** filtered by 'Housing' to find the right fit for your situation — many programs are income-based and free to apply for. [Go to Resource Directory →]",
      "There's housing support available in Harrisonburg! The **Resource Directory** covers emergency shelter, rental assistance, and housing nonprofits. If you're facing eviction or homelessness, reaching out quickly gives you the best options — let me take you to the directory. [Go to Resource Directory →]",
    ],
  },
  {
    key: 'health', label: 'health services',
    kw: ['health','medical','doctor','clinic','sick','therapy','counseling','mental health',
         'psychiatrist','psychologist','dentist','dental','pharmacy','insurance','medication',
         'prescription','free clinic','healthcare','substance abuse','addiction','recovery','rehab'],
    responses: [
      "Harrisonburg has great community health resources — including free and sliding-scale clinics, mental health counseling, dental services, and addiction recovery support. Check the **Resource Directory** filtered by 'Health & Wellness' to find what fits your needs. Many services are available regardless of insurance status.",
      "Looking for health care? The **Resource Directory** has local clinics, mental health providers, dental care, and support services — many at low or no cost. If it's a mental health emergency, the **Crisis Resources** page also has immediate support lines available 24/7.",
      "Health resources in Harrisonburg range from free medical clinics to mental health counseling to dental care. Browse the **Resource Directory** under 'Health' to find providers who work with your situation. Is there a specific type of care you're looking for?",
    ],
  },
  {
    key: 'education', label: 'education & training',
    kw: ['education','school','learn','tutor','tutoring','homework','coding','stem',
         'ged','esl','english','literacy','college','scholarship','job training','training',
         'skills','classes','course','workshop','adult education','degree'],
    responses: [
      "Harrisonburg has solid education and job training resources! The **Resource Directory** includes tutoring programs, GED prep, ESL and English literacy classes, workforce skills training, and scholarship opportunities. Filter by 'Education' to browse what's available.",
      "Looking to learn or level up? Check the **Resource Directory** for tutoring services, adult education programs, ESL classes, and career training — many are free for residents. JMU and EMU also offer some community programs. What specifically are you looking for — kids' tutoring, adult ed, or job skills?",
      "From after-school tutoring to adult GED prep to job skills workshops — Harrisonburg has educational resources for all ages! Browse the **Resource Directory** filtered by 'Education & Training' to find the right program. [Go to Resource Directory →]",
    ],
  },
  {
    key: 'volunteer', label: 'volunteering',
    kw: ['volunteer','volunteering','community service','give back','serve','service hours',
         'donate time','help out','get involved','make a difference','nonprofit help'],
    responses: [
      "Love that you want to give back! The **Community Calendar** lists upcoming volunteer events and service opportunities across Harrisonburg. You can also browse the **Resource Directory** — many of the listed nonprofits actively welcome volunteers. What kind of volunteering interests you most?",
      "Volunteering in Harrisonburg is a great way to connect with the community! Check the **Community Calendar** for one-time events, or browse the **Resource Directory** for organizations that take ongoing volunteers. Whether it's food drives, tutoring, or outdoor cleanup — there's something for everyone.",
      "There are so many ways to get involved in Harrisonburg! The **Resource Directory** lists nonprofits that welcome volunteers, and the **Community Calendar** shows upcoming service events. Want me to take you to the calendar to see what's happening soon?",
    ],
  },
  {
    key: 'legal', label: 'legal aid',
    kw: ['legal','lawyer','attorney','court','rights','immigration','visa','green card',
         'legal aid','legal help','legal assistance','domestic violence legal','tenant rights'],
    responses: [
      "For legal help in Harrisonburg, the **Resource Directory** includes legal aid organizations that provide free or low-cost services to income-eligible residents. They can help with housing disputes, immigration, family law, domestic violence, and more. Filter by 'Legal Services' to find your options.",
      "Legal assistance is available in Harrisonburg! Browse the **Resource Directory** for legal aid clinics and nonprofits — many offer free consultations or services on a sliding scale. Is there a specific legal issue you're trying to navigate? That might help me point you to the right organization.",
    ],
  },
  {
    key: 'transport', label: 'transportation',
    kw: ['transport','transportation','bus','ride','commute','transit','public transit',
         'get around','travel','free ride','bus route','hdpt'],
    responses: [
      "Getting around Harrisonburg? The city has Harrisonburg Department of Public Transportation (HDPT) for local bus routes. Some nonprofits also offer transportation assistance for medical appointments and essential errands. Check the **Resource Directory** filtered by 'Transportation' for local options.",
      "Transportation resources in Harrisonburg include the public bus system (HDPT) and community ride programs for those who need extra support. Browse the **Resource Directory** under 'Transportation' to see what's available for your situation. [Go to Resource Directory →]",
    ],
  },
  {
    key: 'senior', label: 'senior services',
    kw: ['senior','elderly','elder','aging','retired','retirement','older adult','senior center',
         'senior services','65 and older','older people'],
    responses: [
      "Harrisonburg has wonderful resources for older adults! The **Resource Directory** includes senior meal programs, transportation assistance, healthcare navigation, social activities, and caregiver support. Filter by 'Seniors & Elderly' to explore what's available.",
      "For senior services in Harrisonburg, check the **Resource Directory** filtered by 'Seniors.' You'll find meal delivery, transportation help, health programs, social activities, and more — all tailored to older adults and their families.",
    ],
  },
  {
    key: 'child', label: 'children & youth programs',
    kw: ['child','children','kids','toddler','baby','infant','childcare','daycare',
         'preschool','youth','teen','teenager','after school','summer camp','youth program',
         'my kids','my children','my son','my daughter'],
    responses: [
      "There are great resources for kids and families in Harrisonburg! The **Resource Directory** includes childcare assistance, after-school tutoring, summer programs, teen activities, and early childhood development services. Filter by 'Children & Youth' to see what's available.",
      "Looking for something for the kids? Check the **Resource Directory** for childcare programs, youth centers, after-school tutoring, and summer activities — many at low or no cost. What age range or type of program are you looking for?",
    ],
  },
  {
    key: 'immigrant', label: 'immigrant & refugee services',
    kw: ['immigrant','immigration','refugee','asylum','visa','citizenship','undocumented',
         'migrant','spanish','espanol','interpreter','translation','english class','esl',
         'resettlement','naturalization'],
    responses: [
      "Harrisonburg has a strong, welcoming immigrant and refugee community — and solid support services to match! The **Resource Directory** includes ESL classes, immigration legal aid, resettlement services, and multilingual support. Many organizations have Spanish-speaking staff. Filter by 'Immigration & Refugees' to find your options.",
      "You're in a great city for immigrant support! Check the **Resource Directory** for ESL programs, immigration legal help, refugee resettlement services, and language interpretation resources. Harrisonburg is one of Virginia's most diverse cities and has organizations ready to help.",
    ],
  },
  {
    key: 'disability', label: 'disability resources',
    kw: ['disability','disabled','wheelchair','accessibility','accessible','special needs',
         'ada','deaf','blind','hearing impaired','vision impaired','assistance device','mobility'],
    responses: [
      "Harrisonburg has resources for people with disabilities including assistive services, accessible transportation, supported employment, and housing assistance. Browse the **Resource Directory** filtered by 'Disability Services' to find what's available for your specific needs.",
      "Looking for disability support? The **Resource Directory** includes organizations that provide services, job training, accessible housing help, and advocacy for people with disabilities in the Harrisonburg area. [Go to Resource Directory →]",
    ],
  },
];

// ─── Response pools ───────────────────────────────────────

const GREETING_RESPONSES = [
  "Hey there! Welcome to ConnectHBG. I'm here to help you find community resources, navigate the site, or answer anything about Harrisonburg. What are you looking for?",
  "Hi! Great to have you here. Whether you need food assistance, housing help, health services, or just want to explore — I've got you covered. What can I help with?",
  "Hello! I know Harrisonburg inside and out, and I know this site even better. What brings you by today?",
  "Hey! I'm the ConnectHBG assistant — your local guide to community resources, events, and everything Harrisonburg. What do you need?",
  "Hi there! ConnectHBG connects you to local nonprofits, services, and events all in one place. Ask me anything — I'm here to help.",
  "Good to see you! I can help you find resources, answer questions about the city, or take you straight to any section. What's on your mind?",
];

const HOW_ARE_YOU_RESPONSES = [
  "I'm doing great, thanks for asking! Always ready to help connect people with what they need. What can I do for you today?",
  "Excellent — and honestly, helping people find community resources in Harrisonburg is pretty rewarding work! What brings you here?",
  "I'm wonderful! Ready to help. More importantly — what brings you to ConnectHBG today? Is there something specific I can help you find?",
  "Doing well! I'm always here when someone needs community support in Harrisonburg. What can I help you with?",
];

const FAREWELL_RESPONSES = [
  "Take care! Remember, ConnectHBG is always here when you need community support. Come back anytime!",
  "Goodbye! I hope I was helpful today. Don't hesitate to come back if you need anything — I'll be right here.",
  "See you! Stay well, and remember Harrisonburg has lots of great resources whenever you need them.",
  "Take care of yourself! The ConnectHBG community is always here if you need us. Bye for now!",
  "Bye! It was great chatting. Come back anytime — Harrisonburg's resources are always just a click away.",
];

const THANKS_RESPONSES = [
  "You're very welcome! That's what I'm here for. Let me know if there's anything else I can help with.",
  "Happy to help! Feel free to ask if you have more questions — no question is too big or small.",
  "Of course! ConnectHBG is all about making it easier to find what you need. Anything else on your mind?",
  "Glad I could help! Is there anything else you'd like to know about resources in Harrisonburg?",
  "Anytime! I really enjoy helping people navigate our community. Is there anything else you need?",
];

const SITE_RESPONSES = [
  "ConnectHBG is a community resource hub for Harrisonburg, Virginia! Here's what you'll find: a **Resource Directory** with 15+ local organizations you can search and filter, a **Community Calendar** with events and volunteer opportunities, local **News**, city **Government** info, a **Crisis Resources** page with emergency hotlines, and tools to save favorites, compare resources, and donate to fundraisers. What would you like to explore?",
  "Great question! ConnectHBG connects Harrisonburg residents to nonprofits, services, and events — all in one place. The **Resource Directory** is a great starting point: searchable, filterable by category (food, housing, health, education, and more). There's also a **Community Calendar**, **News**, **Government** info, and emergency **Crisis Resources**. What are you trying to find?",
  "I'm the ConnectHBG Community Assistant! The site's main features are: the **Resource Directory** (15+ local organizations, filterable by category), **Community Calendar** (events and volunteering), **News** section, **Government** info, **Crisis Resources**, donations and fundraisers, and data analytics. Tell me what you're looking for and I'll point you right to it.",
];

const WHO_BUILT_RESPONSES = [
  "ConnectHBG was built by a student team for the **TSA Webmaster Competition** — a national technology competition for high school students. The goal was to make Harrisonburg's community resources easier to find and use for everyone.",
  "This site was created by a student team as part of the **TSA (Technology Student Association) Webmaster Competition**. We built it to serve the Harrisonburg community by organizing local resources in one accessible, modern platform.",
];

const HBG_RESPONSES = [
  "Harrisonburg is a vibrant, independent city in the **Shenandoah Valley of Virginia** — and honestly, it's one of the most underrated cities in the state! With a population of about **56,000**, it's home to **James Madison University (JMU)** and **Eastern Mennonite University (EMU)**. Founded in 1780, it has 40+ parks and trails, and has been named a Top 100 Best Place to Live. Known for its diversity, incredible local food scene, and tight-knit community spirit.",
  "Harrisonburg, VA sits in the **Shenandoah Valley** between the Blue Ridge and Allegheny Mountains — the views are stunning! About **56,000 people** call it home, alongside students at **JMU and EMU**. The downtown South Main Street area is full of local restaurants, shops, and cultural venues. It's been recognized as a Best College City and one of the most diverse cities in Virginia. Anything specific you'd like to know?",
  "**Harrisonburg, Virginia** was founded in 1780 and has grown into a lively community of around **56,000 residents**. It's home to James Madison University, has a thriving arts and food culture, and is known statewide for being welcoming and diverse. Over 40 parks and trails make it great for outdoor activities, and the downtown corridor is always buzzing. What aspect of the city are you curious about?",
];

const HUMOR_RESPONSES = [
  "Okay here's one: Why did the food pantry volunteer get promoted? Because they really brought a lot to the table! 😄 Anyway — I'm actually great at finding you real community resources. What do you need?",
  "I'd tell you a joke about housing, but I don't want to make things too sheltered. 🏠 On a serious note — need help finding any community resources today?",
  "Why do Harrisonburg residents make the best friends? Because they're always there to lend a hand! 😄 Speaking of which — is there anything I can actually help you find?",
  "What did the community center say to the new neighbor? 'Don't worry — we've got you covered!' Cheesy? Maybe. Accurate? Absolutely. What can I help you with today?",
];

const FOLLOW_UP_CONTEXT = {
  food:       "For more detail — most Harrisonburg food pantries are open multiple days a week and many don't require documentation. The **Resource Directory** has each organization's specific hours, locations, and requirements. Want me to take you there? [Go to Resource Directory →]",
  housing:    "On housing — if it's an emergency, some organizations can help with same-day or next-day placement. Rental assistance programs are usually application-based. The **Resource Directory** has direct contact info for each organization so you can reach out right away. [Go to Resource Directory →]",
  health:     "For more on health services — many Harrisonburg clinics use a sliding-scale fee system, so you may qualify for free or very low-cost care even without insurance. The **Resource Directory** has details on each provider's services, fees, and contact info. Anything specific you'd like to know?",
  education:  "To dig deeper — Harrisonburg's education programs range from literacy classes for adults to after-school tutoring for kids to workforce skills training. The **Resource Directory** lists hours and eligibility for each program. Is there a specific type you're most interested in?",
  volunteer:  "For more on volunteering — most organizations welcome help at community events, and some have ongoing programs that need regular volunteers. The **Community Calendar** shows upcoming one-time volunteer events if you want to start there. [Go to Community Calendar →]",
  harrisonburg: "Happy to share more! Some fun facts: Harrisonburg has been ranked one of the most bike-friendly small cities in Virginia, hosts one of the state's top farmers markets, and has a refugee and immigrant population representing over 40 countries. The downtown arts district is also growing fast. Anything specific you're curious about?",
  site:       "A few more things ConnectHBG offers: you can create a free account to save your favorite resources, register for community events, submit new resources for review, and leave reviews for organizations you've used. The Analytics section also has interesting data visualizations about community resource use. What would you like to explore?",
};

const UNKNOWN_RESPONSES = [
  "That's a great question — I want to make sure I give you the right info! Could you tell me a bit more about what you're looking for? I can help with finding local resources, navigating the site, or anything about Harrisonburg.",
  "Hmm, I want to help but I'm not quite sure I caught that! Are you looking for a specific resource (food, housing, health)? Info about the site? Or something about Harrisonburg? Just say the word and I'll point you in the right direction.",
  "I'm here to help — I just want to make sure I understand what you need! What kind of support are you looking for today? I can search for local resources, take you to a section, or share info about the community.",
  "Got it! I'm not 100% sure what you're looking for — are you trying to find community resources, navigate to a specific part of the site, or learn about Harrisonburg? A bit more context helps me give you a much better answer.",
];

// ─── Response builder helper ───────────────────────────────
function _buildResourceResponse(ri) {
  // renderResponse must run first (it HTML-escapes the text).
  // Nav link injection happens after so the <a> tags are not escaped.
  let html = renderResponse(_next(ri.key, ri.responses));
  html = html
    .replace('[Go to Resource Directory →]', buildNavLink('Go to Resource Directory →', 'index.html#directory', 'directory'))
    .replace('[Go to Community Calendar →]', buildNavLink('Go to Community Calendar →', 'index.html#calendar', 'calendar'));
  return html;
}

// ─── Main intent/response engine ──────────────────────────
function generateResponse(query) {
  const q = normalizeQuery(query);

  /* ── 1. Crisis (highest priority) ── */
  if (CRISIS_KW.some(w => q.includes(w))) {
    _ctx.intent = 'crisis';
    return {
      isCrisis: true,
      text: `<span class="crisis-text">⚠ If this is a life-threatening emergency, please call <strong>911</strong> right now.</span><br><br>` +
            `For mental health support, call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline — free, confidential, 24/7).<br>` +
            `For domestic violence: <strong>1-800-799-7233</strong>.<br><br>` +
            `You don't have to face this alone. ${buildNavLink('See all crisis resources →', 'crisis.html', null)}`,
    };
  }

  /* ── 2. Distress (empathy first) ── */
  if (DISTRESS_KW.some(w => q.includes(w))) {
    _ctx.intent = 'distress';
    return {
      isCrisis: true,
      text: `I'm really glad you reached out — you don't have to go through this alone. 💙<br><br>` +
            `Whatever you're facing, there are people in Harrisonburg who genuinely care and want to help. When you're ready, our <strong>Crisis Resources</strong> page has free, confidential support lines available 24/7. ` +
            buildNavLink('Go to Crisis Resources →', 'crisis.html', null),
    };
  }

  /* ── 3. Follow-up ("tell me more") ── */
  if (FOLLOW_UP_KW.some(w => q.includes(w)) && _ctx.intent && FOLLOW_UP_CONTEXT[_ctx.intent]) {
    let html = renderResponse(FOLLOW_UP_CONTEXT[_ctx.intent]);
    html = html
      .replace('[Go to Resource Directory →]', buildNavLink('Go to Resource Directory →', 'index.html#directory', 'directory'))
      .replace('[Go to Community Calendar →]', buildNavLink('Go to Community Calendar →', 'index.html#calendar', 'calendar'));
    return { text: html };
  }

  /* ── 4. Greeting ── */
  if (GREETING_KW.some(w => q === w || q.startsWith(w + ' ') || q.endsWith(' ' + w))) {
    _ctx.intent = 'greeting';
    return { text: _next('greeting', GREETING_RESPONSES) };
  }

  /* ── 5. How are you ── */
  if (HOW_ARE_YOU_KW.some(w => q.includes(w))) {
    _ctx.intent = 'how_are_you';
    return { text: _next('how_are_you', HOW_ARE_YOU_RESPONSES) };
  }

  /* ── 6. Farewell ── */
  if (FAREWELL_KW.some(w => q.includes(w))) {
    _ctx.intent = 'farewell';
    return { text: _next('farewell', FAREWELL_RESPONSES) };
  }

  /* ── 7. Thanks ── */
  if (THANKS_KW.some(w => q.includes(w))) {
    _ctx.intent = 'thanks';
    return { text: _next('thanks', THANKS_RESPONSES) };
  }

  /* ── 8. Who built this ── */
  if (WHO_BUILT_KW.some(w => q.includes(w))) {
    _ctx.intent = 'who_built';
    return { text: renderResponse(_next('who_built', WHO_BUILT_RESPONSES)) };
  }

  /* ── 9. About the site ── */
  if (SITE_KW.some(w => q.includes(w))) {
    _ctx.intent = 'site';
    return { text: renderResponse(_next('site', SITE_RESPONSES)) };
  }

  /* ── 10. About Harrisonburg ── */
  if (HBG_KW.some(w => q.includes(w))) {
    _ctx.intent = 'harrisonburg';
    return { text: renderResponse(_next('hbg', HBG_RESPONSES)) };
  }

  /* ── 11. Humor ── */
  if (HUMOR_KW.some(w => q.includes(w))) {
    _ctx.intent = 'humor';
    return { text: _next('humor', HUMOR_RESPONSES) };
  }

  /* ── 12. Navigation requests ── */
  const NAV_TRIGGERS = [
    'where is','where can i find','take me to','show me','go to','navigate to',
    'how do i find','how do i get to','find the','i want to see','where are the',
    'bring me to','jump to','open the','how to get to',
  ];
  if (NAV_TRIGGERS.some(t => q.includes(t))) {
    for (const entry of NAV_MAP) {
      if (entry.keys.some(k => q.includes(k.toLowerCase()))) {
        _ctx.intent = 'nav';
        return { text: entry.text + '<br><br>' + buildNavLink(entry.label, entry.href, entry.id) };
      }
    }
  }

  /* ── 13. Resource intents (supports multi-topic) ── */
  const matched = RESOURCE_INTENTS.filter(ri => ri.kw.some(w => q.includes(w)));

  if (matched.length > 1) {
    // Multi-topic: "I need food and tutoring and housing"
    _ctx.intent = matched[0].key;
    const intro = "Sounds like you're working through a few different things — I can help with all of them!\n\n";
    const parts = matched.map(ri => {
      const firstSentence = ri.responses[0].split(/(?<=[.!?])\s/)[0];
      return `**${ri.label.charAt(0).toUpperCase() + ri.label.slice(1)}:** ${firstSentence}`;
    }).join('\n\n');
    const outro = `\n\nThe **Resource Directory** covers all of these — use the category filters to narrow things down. [Dir]`;
    let html = renderResponse(intro + parts + outro);
    html = html.replace('[Dir]', buildNavLink('Go to Resource Directory →', 'index.html#directory', 'directory'));
    return { text: html };
  }

  if (matched.length === 1) {
    _ctx.intent = matched[0].key;
    return { text: _buildResourceResponse(matched[0]) };
  }

  /* ── 14. Direct section name mention ── */
  for (const entry of NAV_MAP) {
    if (entry.keys.some(k => q.includes(k.toLowerCase()))) {
      _ctx.intent = 'nav';
      return { text: entry.text + '<br><br>' + buildNavLink(entry.label, entry.href, entry.id) };
    }
  }

  /* ── 15. Off-topic — friendly redirect ── */
  if (OFF_TOPIC_KW.some(w => q.includes(w))) {
    _ctx.intent = 'off_topic';
    return {
      text: "Ha, that's a bit outside my area of expertise — my specialty is Harrisonburg community resources! " +
            "I'm not the best person to ask about that, but I can tell you pretty much anything about local food, housing, health, events, and more. " +
            "Is there anything community-related I can help you find?",
    };
  }

  /* ── 16. Unknown ── */
  _ctx.intent = null;
  return { text: _next('unknown', UNKNOWN_RESPONSES) };
}

// ─── Chat send (with typing indicator delay) ──────────────
async function chatSend() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  addChatMessage('user', text);
  showChatTyping();

  // Natural thinking delay: scales with message length
  const delay = 500 + Math.min(text.length * 12, 1400);
  await new Promise(resolve => setTimeout(resolve, delay));

  const thinkEl = document.getElementById('chat-thinking-text');
  if (thinkEl) thinkEl.textContent = '';

  removeChatTyping();
  const response = generateResponse(text);
  addChatMessage('ai', response.text || '', response.resources, response.isCrisis);
}

document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); chatSend(); }
    });
  }

  const msgs = document.getElementById('chat-messages');
  if (msgs && msgs.innerHTML.trim() === '') {
    msgs.innerHTML = buildAIBubble(
      "Hi! I'm the ConnectHBG assistant. I can help you find community resources, answer questions about Harrisonburg, or help you navigate the site. What's on your mind?"
    );
    lucide.createIcons();
  }

  setTimeout(() => {
    const fab = document.getElementById('chat-fab');
    if (fab) fab.classList.remove('btn-pulse');
  }, 5000);
});

// ─── Bubble builders ──────────────────────────────────────
function buildAIBubble(text, resourcesHtml) {
  return `<div class="chat-msg-row">
    <div class="chat-avatar" aria-hidden="true"><span data-lucide="sparkles" style="width:14px;height:14px"></span></div>
    <div class="chat-bubble ai">${text}${resourcesHtml || ''}</div>
  </div>`;
}

function buildUserBubble(text) {
  return `<div class="chat-msg-row user">
    <div class="chat-bubble user">${escapeHtml(text)}</div>
  </div>`;
}

function addChatMessage(role, text, resources, isCrisis) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  let html;
  if (role === 'user') {
    html = buildUserBubble(text);
  } else {
    let resHtml = '';
    if (resources && resources.length) {
      resHtml = '<div style="margin-top:8px">' + resources.map(r =>
        `<div class="chat-resource-card" onclick="chatOpenResource(${r.id})" role="button" tabindex="0" aria-label="View ${r.name}">
          <div class="chat-resource-name">${r.name}</div>
          <div><span class="chat-resource-cat">${r.category}</span></div>
          <div class="chat-resource-addr">${r.address || ''}</div>
        </div>`
      ).join('') + '</div>';
    }
    const crisisClass = isCrisis ? ' crisis' : '';
    html = `<div class="chat-msg-row">
      <div class="chat-avatar" aria-hidden="true"><span data-lucide="sparkles" style="width:14px;height:14px"></span></div>
      <div class="chat-bubble ai${crisisClass}">${text}${resHtml}</div>
    </div>`;
  }
  msgs.insertAdjacentHTML('beforeend', html);
  msgs.scrollTop = msgs.scrollHeight;
  lucide.createIcons();
}

function showChatTyping() {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  msgs.insertAdjacentHTML('beforeend', `
    <div id="chat-typing-row" class="chat-msg-row">
      <div class="chat-avatar" aria-hidden="true"><span data-lucide="sparkles" style="width:14px;height:14px"></span></div>
      <div class="chat-bubble ai">
        <div class="chat-typing-indicator">
          <span class="chat-typing-dot"></span>
          <span class="chat-typing-dot"></span>
          <span class="chat-typing-dot"></span>
          <span id="chat-thinking-text" class="chat-thinking-text"></span>
        </div>
      </div>
    </div>`);
  msgs.scrollTop = msgs.scrollHeight;
  lucide.createIcons();
}

function removeChatTyping() {
  const row = document.getElementById('chat-typing-row');
  if (row) row.remove();
}

function chatOpenResource(id) {
  closeChatPanel();
  setTimeout(() => { if (typeof openResourceModal === 'function') openResourceModal(id); }, 200);
}

function chatNavTo(href, sectionId) {
  closeChatPanel();
  setTimeout(() => {
    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    window.location.href = href;
  }, 250);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Navigation map ───────────────────────────────────────
const NAV_MAP = [
  {
    keys: ['directory','resources','browse','find resources','all resources','resource directory'],
    label: 'Go to Resource Directory →', href: 'index.html#directory', id: 'directory',
    text: 'You can browse all community resources in the <strong>Resource Directory</strong>.'
  },
  {
    keys: ['calendar','events','event','activities','upcoming'],
    label: 'Go to Events Calendar →', href: 'index.html#calendar', id: 'calendar',
    text: 'All upcoming community events and activities are in the <strong>Community Calendar</strong>.'
  },
  {
    keys: ['news','articles','article','latest news','community news'],
    label: 'Go to News →', href: 'index.html#news', id: 'news',
    text: 'The latest community news and updates are in the <strong>News</strong> section.'
  },
  {
    keys: ['donate','fundraiser','fundraise','contribution','give','support a cause','raise money'],
    label: 'Go to Donate →', href: 'index.html#donate', id: 'donate',
    text: 'You can support local causes in the <strong>Donate &amp; Fundraise</strong> section.'
  },
  {
    keys: ['stories','community stories','story','impact'],
    label: 'Go to Stories →', href: 'index.html#stories', id: 'stories',
    text: 'Community voices and impact stories are in the <strong>Community Stories</strong> section.'
  },
  {
    keys: ['favorites','saved','saved resources','my favorites','bookmarks'],
    label: 'Go to Favorites →', href: 'index.html#favorites', id: 'favorites',
    text: 'Your saved resources are in the <strong>Favorites</strong> section.'
  },
  {
    keys: ['submit','add resource','suggest','submit a resource','add a listing'],
    label: 'Go to Submit →', href: 'index.html#submit', id: 'submit',
    text: 'You can suggest a new community resource using the <strong>Submit a Resource</strong> form.'
  },
  {
    keys: ['analytics','charts','data','insights','statistics','graphs'],
    label: 'Go to Analytics →', href: 'index.html#analytics', id: 'analytics',
    text: 'Interactive charts and community data insights are in the <strong>Analytics</strong> section.'
  },
  {
    keys: ['compare'],
    label: 'Go to Compare →', href: 'index.html#compare', id: 'compare',
    text: 'You can compare two community resources side-by-side in the <strong>Compare</strong> section.'
  },
  {
    keys: ['government','city council','departments','city hall','meetings','council','civic'],
    label: 'Go to City Government →', href: 'government.html', id: null,
    text: 'Information about Harrisonburg City Government, city council, departments, and meetings is on the <strong>Government</strong> page.'
  },
  {
    keys: ['crisis','hotline','help line','mental health crisis','emergency resources'],
    label: 'Go to Crisis Resources →', href: 'crisis.html', id: null,
    text: 'Crisis hotlines, mental health resources, and emergency contacts are on the <strong>Crisis Resources</strong> page.'
  },
  {
    keys: ['references','credits','sources','citations','bibliography','attribution'],
    label: 'Go to References →', href: 'references.html', id: null,
    text: 'The full list of sources, libraries, and attributions is on the <strong>References</strong> page.'
  },
];

function buildNavLink(label, href, sectionId) {
  const handler = sectionId
    ? `chatNavTo('${href}','${sectionId}')`
    : `chatNavTo('${href}',null)`;
  return `<a class="chat-link" onclick="${handler}" style="cursor:pointer;font-weight:600">${label}</a>`;
}

// ─── Response renderer (bold + section auto-links) ────────
function renderResponse(text) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\n/g, '<br>');

  const sections = [
    { pat: /Resource Directory/g,  href: 'index.html#directory',  id: 'directory',  label: 'Resource Directory' },
    { pat: /Community Calendar/g,  href: 'index.html#calendar',   id: 'calendar',   label: 'Community Calendar' },
    { pat: /Community Stories/g,   href: 'index.html#stories',    id: 'stories',    label: 'Community Stories'  },
    { pat: /Submit a Resource/g,   href: 'index.html#submit',     id: 'submit',     label: 'Submit a Resource'  },
    { pat: /Crisis Resources/g,    href: 'crisis.html',           id: null,         label: 'Crisis Resources'   },
    { pat: /City Government/g,     href: 'government.html',       id: null,         label: 'City Government'    },
    { pat: /Analytics/g,           href: 'index.html#analytics',  id: 'analytics',  label: 'Analytics'          },
    { pat: /Fundraisers/g,         href: 'index.html#donate',     id: 'donate',     label: 'Fundraisers'        },
  ];

  for (const { pat, href, id, label } of sections) {
    const handler = id ? `chatNavTo('${href}','${id}')` : `chatNavTo('${href}',null)`;
    html = html.replace(pat, `<a class="chat-link" onclick="${handler}" style="cursor:pointer;font-weight:600">${label}</a>`);
  }

  return html;
}


/* ═══════════════════════════════════════════════════════
   DONATION FLOW — PAYMENT STEPS
═══════════════════════════════════════════════════════ */

function showDonateStep(n) {
  [1,2,3,4].forEach(i => {
    const el = document.getElementById('donate-step-' + i);
    if (el) el.classList.toggle('hidden', i !== n);
  });
  lucide.createIcons();
}

function proceedToPayment() {
  const customVal = parseFloat(document.getElementById('donate-custom-input').value);
  const amount = (!isNaN(customVal) && customVal > 0) ? customVal : selectedDonateAmount;
  if (!amount || amount <= 0) { showToast('Please select or enter a donation amount.'); return; }
  selectedDonateAmount = amount;
  const el = document.getElementById('donate-payment-amount');
  if (el) el.textContent = 'Donation amount: $' + (amount % 1 === 0 ? amount : amount.toFixed(2));
  showDonateStep(2);
}

function backToAmount() { showDonateStep(1); }

function formatCardNumber(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  v = v.replace(/(.{4})/g, '$1 ').trim();
  input.value = v;
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
  input.value = v;
}

function completeDonation() {
  const name = (document.getElementById('pay-name').value || '').trim();
  const card = (document.getElementById('pay-card').value || '').replace(/\s/g, '');
  const exp  = (document.getElementById('pay-exp').value || '').trim();
  const cvv  = (document.getElementById('pay-cvv').value || '').trim();
  const zip  = (document.getElementById('pay-zip').value || '').trim();

  const errEl = document.getElementById('donate-payment-error');
  const errors = [];

  ['pay-name','pay-card','pay-exp','pay-cvv','pay-zip'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('invalid');
  });

  if (!name) { errors.push('Cardholder name is required.'); document.getElementById('pay-name').classList.add('invalid'); }
  if (!/^\d{13,19}$/.test(card)) { errors.push('Card number must be 13–19 digits.'); document.getElementById('pay-card').classList.add('invalid'); }
  if (!/^\d{2}\/\d{2}$/.test(exp)) { errors.push('Expiration must be MM/YY.'); document.getElementById('pay-exp').classList.add('invalid'); }
  if (!/^\d{3,4}$/.test(cvv)) { errors.push('CVV must be 3–4 digits.'); document.getElementById('pay-cvv').classList.add('invalid'); }
  if (!/^\d{5}$/.test(zip)) { errors.push('ZIP must be 5 digits.'); document.getElementById('pay-zip').classList.add('invalid'); }

  if (errors.length) {
    if (errEl) { errEl.textContent = errors[0]; errEl.classList.remove('hidden'); }
    return;
  }
  if (errEl) errEl.classList.add('hidden');

  showDonateStep(3);
  setTimeout(() => {
    if (donateTarget) {
      donateTarget.raisedAmount += selectedDonateAmount;
      donateTarget.donorCount += 1;
      renderDonateStats && renderDonateStats();
      renderFundraiserCards && renderFundraiserCards();
    }
    const amount = selectedDonateAmount;
    const displayAmt = amount % 1 === 0 ? amount : amount.toFixed(2);
    const msgEl = document.getElementById('donate-success-msg');
    const titleEl = document.getElementById('donate-success-title');
    if (msgEl) msgEl.textContent = 'Thank you for your donation of $' + displayAmt + '!';
    if (titleEl && donateTarget) titleEl.textContent = donateTarget.title;
    showDonateStep(4);
    lucide.createIcons();
  }, 1600);
}

const _origOpenDonateModal = window.openDonateModal;
if (typeof _origOpenDonateModal === 'function') {
  window.openDonateModal = function(id) {
    _origOpenDonateModal(id);
    showDonateStep(1);
  };
}

/* ═══════════════════════════════════════════════════════
   FUNDRAISER MODERATION QUEUE
═══════════════════════════════════════════════════════ */
let pendingFundraisers = [];

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const origSubmit = window.submitFundraiser;
    if (typeof origSubmit === 'function') {
      window.submitFundraiser = function() {
        const title = (document.getElementById('fundraiser-title-input') || {}).value?.trim();
        const goal  = parseFloat((document.getElementById('fundraiser-goal-input') || {}).value);
        const desc  = (document.getElementById('fundraiser-desc-input') || {}).value?.trim();
        const cat   = (document.getElementById('fundraiser-cat-select') || {}).value || 'Community';

        if (!title) { showToast('Please enter a fundraiser title.'); return; }
        if (!goal || goal < 100) { showToast('Please enter a goal amount of at least $100.'); return; }
        if (!desc || desc.length < 30) { showToast('Please write a description of at least 30 characters.'); return; }

        const pf = {
          id: 'pf_' + Date.now(),
          title, goal, description: desc, category: cat,
          submittedBy: currentUser ? (currentUser.displayName || currentUser.username) : 'Anonymous',
          submittedAt: new Date().toLocaleDateString()
        };
        pendingFundraisers.push(pf);
        renderAdminQueue();

        const form = document.getElementById('create-fundraiser-form');
        const confirmEl = document.createElement('div');
        confirmEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:32px 16px;text-align:center;';
        confirmEl.innerHTML = `
          <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#10B981,#059669);display:flex;align-items:center;justify-content:center;margin-bottom:4px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style="font-size:18px;font-weight:800;color:#10B981;">Fundraiser Submitted!</div>
          <div style="font-size:13px;color:#64748B;">Pending admin review</div>`;
        if (form) {
          form.style.display = 'none';
          form.parentNode.insertBefore(confirmEl, form);
        }
        setTimeout(() => {
          if (form) { form.style.display = ''; form.reset(); }
          if (confirmEl.parentNode) confirmEl.parentNode.removeChild(confirmEl);
          if (typeof closeCreateFundraiserModalDirect === 'function') closeCreateFundraiserModalDirect();
          const toast = document.getElementById('toast');
          if (toast) {
            toast.textContent = 'Your fundraiser has been submitted and is pending admin approval!';
            toast.style.background = 'linear-gradient(135deg,#10B981,#059669)';
            toast.style.color = 'white';
            toast.classList.remove('hidden');
            clearTimeout(window._fundraiserToastTimer);
            window._fundraiserToastTimer = setTimeout(() => {
              toast.classList.add('hidden');
              toast.style.background = '';
              toast.style.color = '';
            }, 4000);
          }
        }, 1500);
      };
    }
  }, 500);
});

const _origRenderAdminQueue = window.renderAdminQueue;
window.renderAdminQueue = function() {
  const el = document.getElementById('admin-queue');
  if (!el) return;

  if (typeof isAdmin === 'function' && !isAdmin()) {
    el.innerHTML = '<p style="color:#94A3B8;text-align:center;padding:20px">Access restricted to administrators.</p>';
    return;
  }

  const allItems = [
    ...submissionQueue.map(s => ({ ...s, _type: 'resource' })),
    ...pendingFundraisers.map(f => ({ ...f, _type: 'fundraiser' }))
  ];

  if (!allItems.length) {
    el.innerHTML = '<div class="empty-queue"><p style="color:#94A3B8;text-align:center">No submissions pending review</p></div>';
    return;
  }

  el.innerHTML = allItems.map((item) => {
    if (item._type === 'fundraiser') {
      return `<div class="admin-item">
        <div class="admin-item-body">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;background:rgba(249,115,22,.1);color:#F97316">Fundraiser</span>
          </div>
          <h3 class="admin-item-name">${item.title}</h3>
          <p class="admin-item-desc">${item.description}</p>
          <p style="font-size:12px;color:#94A3B8;margin-top:6px">Goal: $${item.goal?.toLocaleString()} · Submitted by ${item.submittedBy} · ${item.submittedAt}</p>
        </div>
        <div class="admin-actions">
          <button class="btn-approve" onclick="approveFundraiser('${item.id}')"><span data-lucide="check" class="w-4 h-4" style="display:inline-flex;vertical-align:middle;margin-right:4px"></span>Approve</button>
          <button class="btn-reject" onclick="rejectFundraiser('${item.id}')"><span data-lucide="x" class="w-4 h-4" style="display:inline-flex;vertical-align:middle;margin-right:4px"></span>Reject</button>
        </div>
      </div>`;
    } else {
      const qi = submissionQueue.indexOf(item);
      return `<div class="admin-item">
        <div class="admin-item-body">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;background:rgba(20,184,166,.1);color:#14B8A6">Resource</span>
          </div>
          <h3 class="admin-item-name">${item.name}</h3>
          <p class="admin-item-desc">${item.description}</p>
          <p style="font-size:12px;color:#94A3B8;margin-top:6px">Submitted by ${typeof item.submittedBy==='object'?(item.submittedBy.displayName||item.submittedBy.username):item.submittedBy} · ${item.submittedAt}</p>
        </div>
        <div class="admin-actions">
          <button class="btn-approve" onclick="approveSubmission(${qi})"><span data-lucide="check" class="w-4 h-4" style="display:inline-flex;vertical-align:middle;margin-right:4px"></span>Approve</button>
          <button class="btn-reject" onclick="rejectSubmission(${qi})"><span data-lucide="x" class="w-4 h-4" style="display:inline-flex;vertical-align:middle;margin-right:4px"></span>Reject</button>
        </div>
      </div>`;
    }
  }).join('');
  lucide.createIcons();
};

function approveFundraiser(id) {
  const idx = pendingFundraisers.findIndex(f => f.id === id);
  if (idx < 0) return;
  const pf = pendingFundraisers[idx];
  FUNDRAISERS.push({
    id: pf.id, title: pf.title, category: pf.category || 'Community',
    organizer: pf.submittedBy,
    organizerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
    description: pf.description, goalAmount: pf.goal,
    raisedAmount: 0, donorCount: 0, daysLeft: 30, verified: false
  });
  pendingFundraisers.splice(idx, 1);
  typeof renderFundraiserCards === 'function' && renderFundraiserCards();
  typeof renderDonateStats === 'function' && renderDonateStats();
  renderAdminQueue();
  showToast('"' + pf.title + '" fundraiser approved and is now live!');
}

function rejectFundraiser(id) {
  const idx = pendingFundraisers.findIndex(f => f.id === id);
  if (idx < 0) return;
  const pf = pendingFundraisers[idx];
  pendingFundraisers.splice(idx, 1);
  renderAdminQueue();
  showToast('Fundraiser "' + pf.title + '" rejected.');
}
