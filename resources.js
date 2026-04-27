const RESOURCES = [
  {
    id: 1,
    name: "Harrisonburg Food Bank",
    category: "Food",
    subcategory: "Food Assistance",
    description: "Providing nutritious food to families and individuals in need across the Harrisonburg community. Open 5 days a week with no income verification required.",
    address: "123 Valley Ave, Harrisonburg, VA 22801",
    phone: "(540) 555-0101",
    email: "info@hbgfoodbank.org",
    website: "https://brafb.org",
    hours: "Mon–Fri 9am–5pm",
    rating: 4.8,
    reviews: 142,
    tags: ["Free", "Family Friendly", "Emergency Support"],
    cost: "free",
    ageGroup: "all",
    availability: "weekdays",
    lat: 38.4496,
    lng: -78.8689,
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80",
    featured: true,
    story: "Since 2005, the Harrisonburg Food Bank has served over 50,000 families, becoming the backbone of emergency food support in the Valley.",
    busyTimes: { peak: "11am–1pm weekdays", bestTime: "9–10am or 3–5pm" },
    accessibility: {
      wheelchair: true,
      languages: ["English", "Spanish"],
      transportation: true,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 2,
    name: "Valley Community Shelter",
    category: "Housing",
    subcategory: "Emergency Shelter",
    description: "Safe emergency shelter and transitional housing services for individuals and families experiencing homelessness. Case management and job placement support included.",
    address: "456 Main St, Harrisonburg, VA 22801",
    phone: "(540) 555-0102",
    email: "help@valleyshelter.org",
    website: "https://www.valleymission.org",
    hours: "24/7 Emergency Intake",
    rating: 4.5,
    reviews: 87,
    tags: ["Free", "Emergency Support", "Family Friendly"],
    cost: "free",
    ageGroup: "all",
    availability: "always",
    lat: 38.4520,
    lng: -78.8710,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    featured: true,
    story: "Valley Community Shelter has provided over 200,000 nights of safe housing since its founding, with an 80% housing placement success rate.",
    busyTimes: { peak: "Evenings 6–9pm", bestTime: "Weekday mornings 8–11am" },
    accessibility: {
      wheelchair: true,
      languages: ["English", "Spanish", "Somali"],
      transportation: true,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 3,
    name: "Youth Coding Club",
    category: "Education",
    subcategory: "STEM Programs",
    description: "Free after-school coding program for youth ages 10–18. Learn Python, web development, and robotics in a fun, collaborative environment.",
    address: "789 Tech Blvd, Harrisonburg, VA 22801",
    phone: "(540) 555-0103",
    email: "code@youthclub.org",
    website: "https://juiceworks3d.com/",
    hours: "Tue/Thu 3pm–6pm",
    rating: 4.7,
    reviews: 63,
    tags: ["Free", "Youth", "STEM"],
    cost: "free",
    ageGroup: "youth",
    availability: "weekdays",
    lat: 38.4475,
    lng: -78.8650,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
    featured: false,
    story: "Launched in 2019, the Youth Coding Club has helped 300+ students land internships and college scholarships in tech fields.",
    busyTimes: { peak: "3–5pm Tue & Thu", bestTime: "Arrive at 3pm (opening) or after 5pm" },
    accessibility: {
      wheelchair: true,
      languages: ["English"],
      transportation: false,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 4,
    name: "STEM Innovation Workshop",
    category: "Education",
    subcategory: "Workshops",
    description: "Hands-on science and engineering workshops for all ages. Build robots, conduct experiments, and explore careers in STEM fields.",
    address: "321 Science Dr, Harrisonburg, VA 22801",
    phone: "(540) 555-0104",
    email: "stem@innovate.org",
    website: "https://www.jmu.edu/isat/",
    hours: "Sat 10am–3pm",
    rating: 4.6,
    reviews: 51,
    tags: ["Family Friendly", "STEM", "Youth"],
    cost: "paid",
    ageGroup: "youth",
    availability: "weekends",
    lat: 38.4460,
    lng: -78.8720,
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "10am–1pm Saturdays", bestTime: "1–3pm Saturdays (quieter)" },
    accessibility: {
      wheelchair: true,
      languages: ["English"],
      transportation: false,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 5,
    name: "Valley Mental Health Center",
    category: "Health",
    subcategory: "Mental Health",
    description: "Comprehensive mental health services including counseling, crisis intervention, and psychiatric care. Sliding scale fees available. Walk-ins welcome for crisis support.",
    address: "567 Wellness Way, Harrisonburg, VA 22801",
    phone: "(540) 555-0105",
    email: "care@valleymentalhealth.org",
    website: "https://www.hrcsb.org",
    hours: "Mon–Sat 8am–8pm",
    rating: 4.9,
    reviews: 219,
    tags: ["Sliding Scale", "Crisis Support", "Family Friendly"],
    cost: "free",
    ageGroup: "all",
    availability: "weekdays",
    lat: 38.4510,
    lng: -78.8680,
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&q=80",
    featured: true,
    story: "The Valley Mental Health Center has provided over 10,000 therapy sessions in the past year alone, reducing crisis ER visits by 40% in the region.",
    busyTimes: { peak: "10am–2pm weekdays", bestTime: "8–9am or 5–8pm (drop-in hours)" },
    accessibility: {
      wheelchair: true,
      languages: ["English", "Spanish"],
      transportation: false,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 6,
    name: "Community Garden Collective",
    category: "Volunteer",
    subcategory: "Volunteer Opportunity",
    description: "Join our community garden to grow fresh produce and learn sustainable farming. Volunteer shifts available daily. Surplus produce donated to local food banks.",
    address: "88 Green St, Harrisonburg, VA 22801",
    phone: "(540) 555-0106",
    email: "grow@communitygarden.org",
    website: "https://www.harrisonburgva.gov/parks-recreation",
    hours: "Daily 7am–7pm",
    rating: 4.4,
    reviews: 78,
    tags: ["Volunteer Opportunity", "Free", "Family Friendly"],
    cost: "free",
    ageGroup: "all",
    availability: "always",
    lat: 38.4485,
    lng: -78.8700,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "Sat & Sun mornings 8–11am", bestTime: "Weekday evenings 5–7pm" },
    accessibility: {
      wheelchair: false,
      languages: ["English", "Spanish"],
      transportation: false,
      childFriendly: true,
      petFriendly: true
    }
  },
  {
    id: 7,
    name: "Senior Support Network",
    category: "Health",
    subcategory: "Senior Services",
    description: "Comprehensive services for seniors including meal delivery, transportation, companionship visits, and medical appointment assistance.",
    address: "200 Elder Ave, Harrisonburg, VA 22801",
    phone: "(540) 555-0107",
    email: "seniors@supportnet.org",
    website: "https://www.vpas.info",
    hours: "Mon–Fri 8am–6pm",
    rating: 4.2,
    reviews: 94,
    tags: ["Free", "Seniors", "Transportation"],
    cost: "free",
    ageGroup: "seniors",
    availability: "weekdays",
    lat: 38.4530,
    lng: -78.8660,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "10am–12pm weekdays", bestTime: "1–3pm (afternoons are calmer)" },
    accessibility: {
      wheelchair: true,
      languages: ["English", "Spanish"],
      transportation: true,
      childFriendly: false,
      petFriendly: false
    }
  },
  {
    id: 8,
    name: "Neighborhood Cleanup Crew",
    category: "Volunteer",
    subcategory: "Volunteer Opportunity",
    description: "Monthly community cleanup events to beautify parks, streets, and public spaces. Equipment provided. Great for families, scouts, and civic groups.",
    address: "100 Park Ln, Harrisonburg, VA 22801",
    phone: "(540) 555-0108",
    email: "clean@neighborhoodcrew.org",
    website: "https://www.keepvirginiabeautiful.org",
    hours: "1st Saturday of Month 8am–12pm",
    rating: 4.3,
    reviews: 45,
    tags: ["Volunteer Opportunity", "Free", "Family Friendly"],
    cost: "free",
    ageGroup: "all",
    availability: "weekends",
    lat: 38.4470,
    lng: -78.8730,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "8–10am (first Saturday)", bestTime: "10am–12pm (steady pace)" },
    accessibility: {
      wheelchair: false,
      languages: ["English", "Spanish"],
      transportation: false,
      childFriendly: true,
      petFriendly: true
    }
  },
  {
    id: 9,
    name: "Peer Tutoring Program",
    category: "Education",
    subcategory: "Academic Support",
    description: "Free one-on-one tutoring in math, reading, science, and SAT/ACT prep. Certified tutors and advanced students available. All grade levels welcome.",
    address: "55 Learning Ln, Harrisonburg, VA 22801",
    phone: "(540) 555-0109",
    email: "tutor@peerprogram.org",
    website: "https://www.jmu.edu/learning/index.shtml",
    hours: "Mon–Thu 3pm–7pm, Sat 10am–2pm",
    rating: 4.8,
    reviews: 107,
    tags: ["Free", "Youth", "Academic"],
    cost: "free",
    ageGroup: "youth",
    availability: "weekdays",
    lat: 38.4490,
    lng: -78.8670,
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "3–5pm weekdays", bestTime: "5–7pm weekdays or Sat 10am" },
    accessibility: {
      wheelchair: true,
      languages: ["English", "Spanish"],
      transportation: false,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 10,
    name: "Emergency Food Distribution",
    category: "Food",
    subcategory: "Emergency Food",
    description: "Rapid emergency food boxes for families facing immediate need. No documentation required. Drive-through and walk-in service. Available same day.",
    address: "400 Relief Rd, Harrisonburg, VA 22801",
    phone: "(540) 555-0110",
    email: "emergency@fooddist.org",
    website: "https://brafb.org/get-help/",
    hours: "Daily 8am–4pm",
    rating: 4.7,
    reviews: 132,
    tags: ["Free", "Emergency Support", "No Documentation"],
    cost: "free",
    ageGroup: "all",
    availability: "always",
    lat: 38.4500,
    lng: -78.8740,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "9–11am daily", bestTime: "12–2pm or 3–4pm (shortest wait)" },
    accessibility: {
      wheelchair: true,
      languages: ["English", "Spanish", "Arabic"],
      transportation: true,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 11,
    name: "Community Fitness & Wellness",
    category: "Health",
    subcategory: "Physical Wellness",
    description: "Affordable fitness classes, yoga, and wellness workshops. Scholarship memberships available for those in need. Family and youth programs available.",
    address: "300 Fitness Ave, Harrisonburg, VA 22801",
    phone: "(540) 555-0111",
    email: "fit@communitywellness.org",
    website: "https://www.harrisonburgva.gov/parks-recreation",
    hours: "Mon–Sun 6am–9pm",
    rating: 4.5,
    reviews: 89,
    tags: ["Sliding Scale", "Family Friendly", "Youth"],
    cost: "paid",
    ageGroup: "all",
    availability: "always",
    lat: 38.4455,
    lng: -78.8695,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "6–8am & 5–7pm (rush hours)", bestTime: "10am–12pm or 2–4pm" },
    accessibility: {
      wheelchair: true,
      languages: ["English"],
      transportation: false,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 12,
    name: "Library Discovery Programs",
    category: "Education",
    subcategory: "Library Services",
    description: "Free library programs including reading circles, ESL classes, computer literacy, job search assistance, and kids story time. Available to all residents.",
    address: "1 Library Sq, Harrisonburg, VA 22801",
    phone: "(540) 555-0112",
    email: "programs@hbglibrary.org",
    website: "https://www.mrlib.org",
    hours: "Mon–Sat 9am–8pm",
    rating: 4.6,
    reviews: 175,
    tags: ["Free", "Family Friendly", "ESL", "Seniors"],
    cost: "free",
    ageGroup: "all",
    availability: "weekdays",
    lat: 38.4515,
    lng: -78.8655,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "3–6pm weekdays (after school)", bestTime: "10am–12pm (mornings are quiet)" },
    accessibility: {
      wheelchair: true,
      languages: ["English", "Spanish", "Somali", "Arabic"],
      transportation: false,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 13,
    name: "Immigrant & Refugee Services",
    category: "Support",
    subcategory: "Immigration Support",
    description: "Comprehensive support for immigrants and refugees including language classes, legal aid referrals, cultural orientation, and employment services.",
    address: "750 Welcome Way, Harrisonburg, VA 22801",
    phone: "(540) 555-0113",
    email: "welcome@immigrantservices.org",
    website: "https://cwsglobal.org",
    hours: "Mon–Fri 9am–5pm",
    rating: 4.7,
    reviews: 66,
    tags: ["Free", "ESL", "Legal Aid"],
    cost: "free",
    ageGroup: "all",
    availability: "weekdays",
    lat: 38.4535,
    lng: -78.8715,
    image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "Mon mornings 9–12pm", bestTime: "Tue–Thu afternoons 1–4pm" },
    accessibility: {
      wheelchair: true,
      languages: ["English", "Spanish", "Somali", "Arabic", "French"],
      transportation: true,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 14,
    name: "Youth Arts & Culture Center",
    category: "Education",
    subcategory: "Arts Programs",
    description: "Creative arts programs for youth including painting, music, theater, and digital art. Builds confidence, expression, and career skills in the creative industries.",
    address: "220 Arts Blvd, Harrisonburg, VA 22801",
    phone: "(540) 555-0114",
    email: "create@youtharts.org",
    website: "https://www.jmu.edu/arts/",
    hours: "Mon–Fri 2pm–7pm, Sat 10am–4pm",
    rating: 4.8,
    reviews: 58,
    tags: ["Free", "Youth", "Creative"],
    cost: "free",
    ageGroup: "youth",
    availability: "weekdays",
    lat: 38.4478,
    lng: -78.8685,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "3–5pm weekdays", bestTime: "2–3pm or Sat mornings 10am–12pm" },
    accessibility: {
      wheelchair: true,
      languages: ["English", "Spanish"],
      transportation: false,
      childFriendly: true,
      petFriendly: false
    }
  },
  {
    id: 15,
    name: "Housing Assistance Coalition",
    category: "Housing",
    subcategory: "Housing Aid",
    description: "Rental assistance, eviction prevention, and housing counseling. Helps families maintain stable housing during financial hardships.",
    address: "500 Stable St, Harrisonburg, VA 22801",
    phone: "(540) 555-0115",
    email: "housing@hbgcoalition.org",
    website: "https://www.virginiahousing.com",
    hours: "Mon–Fri 8:30am–4:30pm",
    rating: 4.4,
    reviews: 112,
    tags: ["Free", "Emergency Support", "Family Friendly"],
    cost: "free",
    ageGroup: "all",
    availability: "weekdays",
    lat: 38.4508,
    lng: -78.8745,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    featured: false,
    story: "",
    busyTimes: { peak: "Mon–Tue mornings 9–11am", bestTime: "Wed–Fri afternoons 1–4pm" },
    accessibility: {
      wheelchair: true,
      languages: ["English", "Spanish"],
      transportation: false,
      childFriendly: false,
      petFriendly: false
    }
  }
];

const EVENTS = [
  {
    id: 1,
    title: "Community Health Fair",
    date: "2026-05-22",
    time: "10:00 AM – 3:00 PM",
    location: "Harrisonburg Civic Center",
    type: "Community Event",
    organization: "Valley Health Network",
    description: "Free health screenings, wellness workshops, and resource fair. Over 30 vendors and service providers.",
    free: true,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80",
    isNew: false
  },
  {
    id: 2,
    title: "Youth Coding Hackathon",
    date: "2026-05-24",
    time: "9:00 AM – 5:00 PM",
    location: "Youth Coding Club, 789 Tech Blvd",
    type: "Workshop",
    organization: "Youth Coding Club",
    description: "24-hour build challenge for ages 13–18. Build an app that solves a community problem. Prizes and mentorship available.",
    free: true,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80",
    isNew: false
  },
  {
    id: 3,
    title: "Community Garden Volunteer Day",
    date: "2026-05-31",
    time: "8:00 AM – 12:00 PM",
    location: "Community Garden, 88 Green St",
    type: "Volunteer",
    organization: "Community Garden Collective",
    description: "Summer planting day! Help prepare beds, plant seeds, and learn composting. All ages welcome.",
    free: true,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
    isNew: false
  },
  {
    id: 4,
    title: "Mental Health Awareness Night",
    date: "2026-05-07",
    time: "6:00 PM – 8:30 PM",
    location: "Valley Mental Health Center",
    type: "Workshop",
    organization: "Valley Mental Health Center",
    description: "Panel discussion on destigmatizing mental health with local therapists and community members. Light refreshments provided.",
    free: true,
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&q=80",
    isNew: false
  },
  {
    id: 5,
    title: "ESL Conversation Circle",
    date: "2026-05-10",
    time: "2:00 PM – 4:00 PM",
    location: "Library Discovery Programs, 1 Library Sq",
    type: "Workshop",
    organization: "Library Discovery Programs",
    description: "Weekly casual English conversation practice for all skill levels. Volunteers and native speakers welcome.",
    free: true,
    image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&q=80",
    isNew: false
  },
  {
    id: 6,
    title: "Neighborhood Cleanup — May",
    date: "2026-05-04",
    time: "8:00 AM – 12:00 PM",
    location: "Various Parks, Harrisonburg",
    type: "Volunteer",
    organization: "Neighborhood Cleanup Crew",
    description: "Monthly community beautification event. Gloves and bags provided. Meet at Purcell Park main entrance.",
    free: true,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    isNew: false
  },
  {
    id: 7,
    title: "Senior Technology Workshop",
    date: "2026-05-21",
    time: "10:00 AM – 12:00 PM",
    location: "Senior Support Network, 200 Elder Ave",
    type: "Workshop",
    organization: "Senior Support Network",
    description: "Learn to use smartphones, video calling, and online safety. Tablets provided during the session.",
    free: true,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    isNew: false
  },
  {
    id: 8,
    title: "Youth Arts Showcase",
    date: "2026-05-01",
    time: "5:00 PM – 8:00 PM",
    location: "Youth Arts & Culture Center",
    type: "Community Event",
    organization: "Youth Arts & Culture Center",
    description: "Annual showcase of youth artwork, music performances, and theatrical presentations. Open to all community members.",
    free: true,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
    isNew: false
  },
  {
    id: 9,
    title: "Housing Resource Seminar",
    date: "2026-04-17",
    time: "1:00 PM – 3:00 PM",
    location: "Housing Assistance Coalition, 500 Stable St",
    type: "Workshop",
    organization: "Housing Assistance Coalition",
    description: "Learn about rental assistance programs, eviction prevention resources, and tenant rights. Housing counselors available for one-on-one appointments.",
    free: true,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80",
    isNew: false
  },
  {
    id: 10,
    title: "Community Fitness Fun Run",
    date: "2026-04-19",
    time: "7:00 AM – 10:00 AM",
    location: "Purcell Park, Harrisonburg",
    type: "Community Event",
    organization: "Community Fitness & Wellness",
    description: "Annual 5K fun run open to all ages and fitness levels. Medals for finishers, free healthy refreshments after the race. Families and strollers welcome.",
    free: true,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    isNew: false
  },
  {
    id: 11,
    title: "Immigrant Welcome Potluck",
    date: "2026-04-22",
    time: "5:30 PM – 8:30 PM",
    location: "Immigrant & Refugee Services, 750 Welcome Way",
    type: "Community Event",
    organization: "Immigrant & Refugee Services",
    description: "Celebrate Harrisonburg's diverse community at our annual multicultural potluck dinner. Bring a dish from your culture and connect with neighbors from around the world.",
    free: true,
    image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&q=80",
    isNew: false
  },
  {
    id: 12,
    title: "Food Bank Volunteer Drive",
    date: "2026-04-26",
    time: "9:00 AM – 1:00 PM",
    location: "Harrisonburg Food Bank, 123 Valley Ave",
    type: "Volunteer",
    organization: "Harrisonburg Food Bank",
    description: "Help sort, pack, and distribute food boxes to families in need. No experience required — just show up ready to make a difference! Groups and individuals welcome.",
    free: true,
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80",
    isNew: false
  },
  {
    id: 13,
    title: "Youth STEM Career Day",
    date: "2026-05-02",
    time: "10:00 AM – 3:00 PM",
    location: "STEM Innovation Workshop, 321 Science Dr",
    type: "Workshop",
    organization: "STEM Innovation Workshop",
    description: "Hands-on demos and career talks with local professionals in engineering, tech, biology, and environmental science. Students ages 12–18 especially encouraged to attend.",
    free: true,
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80",
    isNew: false
  },
  {
    id: 14,
    title: "Library Summer Reading Kickoff",
    date: "2026-05-07",
    time: "11:00 AM – 2:00 PM",
    location: "Library Discovery Programs, 1 Library Sq",
    type: "Community Event",
    organization: "Library Discovery Programs",
    description: "Launch the summer reading challenge with storytelling, book giveaways, and activities for all ages. Sign up for the program and earn prizes throughout the summer.",
    free: true,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
    isNew: false
  },
  {
    id: 15,
    title: "Senior Social & Lunch",
    date: "2026-05-09",
    time: "11:30 AM – 1:30 PM",
    location: "Senior Support Network, 200 Elder Ave",
    type: "Community Event",
    organization: "Senior Support Network",
    description: "Monthly social gathering for seniors featuring a catered lunch, live music, and resource fair. Transportation assistance available. RSVP appreciated but not required.",
    free: true,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    isNew: false
  },
  {
    id: 16,
    title: "Mental Health First Aid Training",
    date: "2026-05-14",
    time: "9:00 AM – 5:00 PM",
    location: "Valley Mental Health Center",
    type: "Workshop",
    organization: "Valley Mental Health Center",
    description: "Full-day certification course in Mental Health First Aid. Learn to identify signs of mental health crises and connect people to help. Certificate awarded upon completion.",
    free: false,
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&q=80",
    isNew: false
  },
  {
    id: 17,
    title: "Community Resource Fair",
    date: "2026-06-06",
    time: "10:00 AM – 4:00 PM",
    location: "Harrisonburg Community Center, 395 S High St",
    type: "Community Event",
    organization: "ConnectHBG Coalition",
    description: "Annual resource expo featuring 40+ local nonprofits, social services, health providers, and volunteer organizations. Free admission, door prizes, and live entertainment.",
    free: true,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
    isNew: true
  },
  {
    id: 18,
    title: "Youth Summer Arts Camp Kickoff",
    date: "2026-06-20",
    time: "9:00 AM – 12:00 PM",
    location: "Youth Arts & Culture Center, 220 Arts Blvd",
    type: "Community Event",
    organization: "Youth Arts & Culture Center",
    description: "Kick off the 6-week summer arts camp with free trial classes in painting, music, theater, and digital design. Open enrollment for kids ages 8–18.",
    free: true,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
    isNew: true
  },
  {
    id: 19,
    title: "Multicultural Community Festival",
    date: "2026-07-11",
    time: "12:00 PM – 7:00 PM",
    location: "Purcell Park, Harrisonburg",
    type: "Community Event",
    organization: "Immigrant & Refugee Services",
    description: "Celebrate Harrisonburg's rich cultural diversity with food stalls, live music, traditional dance performances, and cultural exhibits from 20+ nations.",
    free: true,
    image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&q=80",
    isNew: true
  },
  {
    id: 20,
    title: "Back-to-School Supply Drive",
    date: "2026-07-25",
    time: "9:00 AM – 1:00 PM",
    location: "Harrisonburg Food Bank, 123 Valley Ave",
    type: "Volunteer",
    organization: "Harrisonburg Food Bank",
    description: "Help pack backpacks and school supply kits for 500+ students in need before the fall semester. Donations of supplies also accepted. Make a difference for local kids!",
    free: true,
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=400&q=80",
    isNew: true
  },
  {
    id: 21,
    title: "Mental Health & Wellness Fair",
    date: "2026-08-08",
    time: "10:00 AM – 3:00 PM",
    location: "Valley Mental Health Center",
    type: "Community Event",
    organization: "Valley Mental Health Center",
    description: "Free wellness screenings, stress-relief workshops, meditation sessions, and one-on-one consultations with counselors. Resources for all ages available.",
    free: true,
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&q=80",
    isNew: true
  }
];

const STORIES = [
  {
    id: 1,
    title: "How One Food Bank Changed 10,000 Lives",
    excerpt: "The Harrisonburg Food Bank started with three volunteers and a single van. Today it serves over 10,000 families annually and has become the heart of food security in the Valley.",
    fullContent: `In 2005, Maria Torres and two neighbors loaded up a borrowed van with donated groceries and drove door-to-door in Harrisonburg's Rockingham Road neighborhood. They had $300 in donated funds and no office. Twenty years later, the Harrisonburg Food Bank operates from a 12,000-square-foot facility, runs a fleet of seven refrigerated trucks, and has served over 10,000 families.

"We didn't start with a plan," Torres recalls, laughing softly. "We started with a problem. People were going hungry two blocks from a grocery store."

The turning point came in 2011 when the Food Bank partnered with James Madison University to establish a 'dignity-first' distribution model. Instead of food lines, clients shop in a store-like environment, choosing items that fit their family's dietary needs and cultural preferences.

Today, the Food Bank distributes over 1.2 million pounds of food annually. Their Mobile Pantry program reaches rural Rockingham County communities that lack transportation access. A new hydroponic growing facility — a collaboration with the local high school's agriculture program — grows fresh produce year-round.

"Food insecurity doesn't take a day off," says current director Antonio Reyes. "Neither do we." The Food Bank is now open 362 days a year.`,
    author: "Maria Torres",
    date: "March 10, 2026",
    category: "Impact Story",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80",
    readTime: "4 min read"
  },
  {
    id: 2,
    title: "From Code Newbie to Startup Founder at 17",
    excerpt: "After just two years in the Youth Coding Club, Jaylen Washington launched a mobile app helping seniors find transportation. His story shows what's possible when communities invest in young people.",
    fullContent: `Jaylen Washington was 14 when he walked into the Youth Coding Club's storefront on Tech Boulevard, skeptical and a little bored. He'd been signed up by his grandmother, who'd read about the program in the community newsletter.

"I thought coding was just for computer nerds," he admits. "I wanted to play basketball."

Eighteen months later, Jaylen had built a prototype of RideConnect — a mobile app that matches seniors who need rides with volunteer drivers in Harrisonburg. His inspiration was watching his own grandmother struggle to get to medical appointments after her driver's license was revoked.

"She kept missing her physical therapy sessions," Jaylen says. "I thought, there has to be a way to fix this with technology."

RideConnect launched in beta in early 2025 with 40 volunteer drivers and 120 registered seniors. Within six months, it had completed over 1,400 rides. The app now partners with the Senior Support Network and is expanding to Staunton and Waynesboro.

At 17, Jaylen has presented at two regional tech conferences, secured a $15,000 grant from the Virginia Innovation Partnership, and deferred his acceptance to Virginia Tech to continue building the company. He still finds time to mentor younger Youth Coding Club members every Thursday afternoon.

"The community invested in me," he says. "Now I want to invest back."`,
    author: "Chris Navarro",
    date: "March 5, 2026",
    category: "Success Story",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
    readTime: "5 min read"
  },
  {
    id: 3,
    title: "Mental Health Destigmatized: A Community's Journey",
    excerpt: "Three years ago, the Valley Mental Health Center launched free drop-in sessions. Today, wait times are gone, crisis calls are down 40%, and hundreds have found paths to healing.",
    fullContent: `In 2022, Dr. Priya Mehta looked at the data and felt the weight of it: 14-week average wait times. Crisis line calls up 31% year-over-year. A community struggling silently.

"Mental health care should not be a luxury," she told the Valley Mental Health Center's board. "In Harrisonburg, it was becoming one."

The center launched its radical experiment: free, no-appointment-needed drop-in hours every weekday from 3 PM to 7 PM. Staff therapists volunteered extra hours. JMU psychology graduate students provided supervised support. Local faith communities helped fund the gap.

The first week, seven people came. The second week, twenty-three. By month three, the drop-in lounge had a regular crowd of regulars who referred to it simply as "the Center."

"People need a place that's just there," says counselor Marcus Webb, who has worked at the Center for eight years. "Not just when you're in crisis. Just… there."

Three years in, the results are measurable and stunning. Emergency room visits for mental health crises in Rockingham County are down 38%. The crisis line receives 40% fewer calls because people are getting help before they reach breaking point. 847 Harrisonburg residents have completed at least 10 sessions of counseling — many for the first time in their lives.

The stigma hasn't vanished. But it's cracking. Local high schools now send students for monthly workshops on emotional wellness. Three local employers have made the Center's drop-in program part of their employee wellness packages.

Dr. Mehta thinks about the next three years. "Healing takes time," she says. "We're just making sure time is available."`,
    author: "Dr. Priya Mehta",
    date: "February 28, 2026",
    category: "Health",
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&q=80",
    readTime: "6 min read"
  },
  {
    id: 4,
    title: "Volunteers Who Grew a Garden — and a Community",
    excerpt: "What started as a small plot of land on Green Street is now a 2-acre urban farm feeding 200 families and teaching 150 children about sustainable agriculture each year.",
    fullContent: `The lot at 88 Green Street sat vacant for six years, collecting weeds and the occasional shopping cart. Then Samuel Okafor, a retired agriculture professor originally from Kumasi, Ghana, knocked on the city's door with a proposal.

"Give me the land for five years," he said. "I'll give you a garden."

That was 2018. Today, the Community Garden Collective spans two full acres, feeds 200 families through a community-supported agriculture share program, and hosts 150 children in Saturday workshops on growing food.

Okafor didn't do it alone. The garden has logged over 8,000 volunteer hours since its founding, drawing participants from JMU, the local immigrant services organization, and three Harrisonburg churches. The Collective's model is deliberately intergenerational: older volunteers teach planting and preservation techniques, young volunteers bring ideas about sustainable irrigation and companion planting.

"I wanted this to look like Harrisonburg," Okafor says, gesturing at the rows of okra, tomatoes, bitter melon, and collard greens. The crops reflect the cultures of the city's diverse residents. A section of the garden is reserved each year for immigrant families to grow vegetables specific to their home countries.

The Collective donates 30% of its harvest to the Harrisonburg Food Bank — nearly 4,000 pounds of fresh produce last year alone. A new preservation kitchen, funded by a USDA community grant, allows volunteers to can and freeze surplus crops for distribution during winter months.

"A garden teaches patience," Okafor says with a quiet smile. "And community teaches us that we don't have to do anything alone."`,
    author: "Samuel Okafor",
    date: "February 20, 2026",
    category: "Volunteer Impact",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    readTime: "3 min read"
  },
  {
    id: 5,
    title: "From Refugee to Restaurant Owner: Amara's Journey",
    excerpt: "When Amara Diallo arrived in Harrisonburg with nothing but determination, she couldn't have imagined that six years later she'd be feeding the whole city. Her restaurant on South Main Street has become a beloved gathering place — and a testament to what community support can make possible.",
    fullContent: `Amara Diallo still remembers the exact moment she decided to open a restaurant. It was a Tuesday afternoon in 2019, and she was sitting in the waiting room of the Immigrant and Refugee Services office on Mason Street, filling out paperwork for her third attempt at a small business loan. A volunteer named Patricia Chen handed her a cup of tea and sat down beside her.

"You're going to make it," Patricia said. "I don't know how, but I know you will."

Amara had arrived in Harrisonburg from Sierra Leone in 2017 with her two daughters, her mother's hand-written recipe book, and $400 in savings. She'd spent two years working in food service while learning English at the Valley ESL Academy, and she'd grown increasingly convinced that Harrisonburg was missing the flavors of West Africa. The city's diverse population — Congolese, Somali, Ethiopian — deserved food that tasted like home.

The path to opening Amara's Kitchen on South Main Street was not easy. The first loan application was denied. The second was denied. The third succeeded — $35,000 from a Community Development Financial Institution that specifically serves immigrant entrepreneurs — and was supplemented by a GoFundMe campaign that raised $12,000 from Harrisonburg residents who had tasted Amara's cooking at community events.

When Amara's Kitchen opened in March 2021, the line stretched down the block. Regulars still describe their first bite of her jollof rice with the reverence of a religious experience. The restaurant now employs eight people, including three other immigrants from the Valley's refugee community.

"This city gave me a chance," Amara says, refilling a customer's glass of bissap. "Every meal I cook is my way of saying thank you."`,
    author: "Fatima Al-Hassan",
    date: "April 2, 2026",
    category: "Community",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    readTime: "5 min read"
  },
  {
    id: 6,
    title: "Students Build Little Free Libraries Across Harrisonburg",
    excerpt: "What began as a single JMU service-learning project has grown into a citywide movement. Fifteen Little Free Libraries now stand in neighborhoods that previously had no easy access to books — each one hand-built by students who stayed long after the project was graded.",
    fullContent: `The first Little Free Library in the Keister neighborhood looked a little crooked. Professor Dana Whitfield pointed this out gently to her students during the installation, and they laughed and agreed, and then stood back and admired it anyway.

"Perfectly imperfect," said Marcus Webb, a junior from Charlottesville who'd spent the better part of his Saturday building it. "Like the neighborhood."

That was in 2024. Today, 15 Little Free Libraries dot Harrisonburg's streets — each one hand-built by teams of JMU and John Paul the Great Catholic High School students in a joint project organized by the Valley Literacy Coalition. The libraries stand in neighborhoods where public transit access to the city's branch libraries is limited, where after-school programs run thin, and where children might not otherwise encounter books on their own block.

The project works like this: teams of four to six students research a neighborhood's demographics and reading interests, design a weather-proof library box, build it in the school's woodshop over several weeks, and then partner with a local family or business to host it. Each library is stocked with 30–40 books to start, sourced from book drives at JMU and local churches, and then replenished by the community.

What surprised everyone — including the students — was how quickly the neighbors took ownership. In the Simms Crossing neighborhood, a retired teacher named Dolores Washington began cataloguing the books and sending hand-written notes to the student builders with updates: "Your library had 14 borrows this week. Three children came back for seconds."

"I went back to visit six months later," Marcus recalls. "The library was fuller than when we left it. Someone had added a whole shelf of Spanish-language books. Someone else left a note that said, 'Thank you for thinking of us.'"

The coalition is now planning five more libraries for 2026, with funding from the Harrisonburg Community Foundation.`,
    author: "Marcus Webb",
    date: "March 22, 2026",
    category: "Education",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80",
    readTime: "5 min read"
  },
  {
    id: 7,
    title: "The Greenway That Connected Two Neighborhoods",
    excerpt: "For decades, Harrisonburg's Eastside and downtown felt like different cities separated by the same creek. Then the Blacks Run Greenway extension opened — and something unexpected happened.",
    fullContent: `Sarah Chen moved to Harrisonburg's Eastside in 2018 and spent the first three years of her life there almost never crossing West Market Street. It wasn't hostility — it was simply that the infrastructure didn't invite it. No sidewalk, no crosswalk, and a creek that felt more like a barrier than a feature.

Then, in late 2024, the first section of the Blacks Run Greenway extension opened. The paved trail traced the creek from Purcell Park eastward, threading through backyards and under bridges, arriving in the Eastside with a little trailhead and a wooden bench.

"The first morning it was open, I walked the whole thing," Sarah recalls. "And I passed maybe thirty people I'd never seen before in my neighborhood. And we all just kind of... waved. Like it was the most natural thing."

The Greenway extension has become more than infrastructure. In its first year, it has hosted three organized community cleanups, a guided birdwatching walk led by a JMU biology professor, and an informal weekly running group that now has over 80 members from both sides of the trail. The Harrisonburg Farmers Market has begun organizing occasional "Greenway Saturdays" where vendors set up along the trail extension.

David Okonkwo, who grew up in the Eastside and now works as a city planner, has watched the change with a mixture of professional satisfaction and personal joy.

"I used to say the creek divided us," he says, standing on the new trail with the sound of water below. "Now I say it connects us. Same creek. Different infrastructure. Everything changed."

City planners are now advancing Phase 2 of the extension, which would connect the trail to the Eastside Community Center and beyond. Community input sessions have drawn record attendance — a sure sign that people have noticed what a path can do.`,
    author: "Sarah Chen",
    date: "March 15, 2026",
    category: "Environment",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    readTime: "4 min read"
  },
  {
    id: 8,
    title: "Friday Night Volunteers: Inside the Food Bank's Busiest Shift",
    excerpt: "Every Friday evening, 40 volunteers show up at the Blue Ridge Area Food Bank to sort, pack, and distribute food to hundreds of families. This is their story — told in pallets, packing tape, and remarkable human kindness.",
    fullContent: `The shift starts at 5:30 PM, which means the volunteers — some still in work clothes, some in their teens, one woman in her 80s — begin arriving at 5:15. The dock doors are already open. The pallets are already waiting.

David Okonkwo has been the Friday Night Shift coordinator at the Blue Ridge Area Food Bank's Harrisonburg distribution center for three years. He is relentlessly cheerful, deeply organized, and quick to learn the names of the new volunteers who show up week after week.

"You'd be surprised how many people come once and then just keep coming," he says, handing a pair of food-safe gloves to a teenager from Harrisonburg High School. "I think it's because the work is so tangible. You can see exactly what you did."

In a typical Friday night shift, the team sorts through 8,000 to 12,000 pounds of donated food. Produce is separated and graded for freshness. Canned goods are scanned and sorted by category. Bread and dairy — the most perishable items — are staged for same-day distribution to families who arrive at the distribution windows on the building's south side.

The diversity of the volunteer corps mirrors the diversity of Harrisonburg itself. There are JMU students completing service-learning hours alongside retirees who have volunteered every Friday for six years. There are corporate groups from local businesses on team-building nights, and there are individuals who simply show up because they want to do something useful on a Friday.

"My favorite moment every shift is when the distribution windows open," says longtime volunteer Rosa Martinez, 67, who has missed fewer than ten Friday nights in four years. "You can see the relief on people's faces. This is real. This matters."

By 8:30, the pallets are empty, the dock is swept, and the coolers are stocked for Saturday's early-morning distribution. David thanks each volunteer by name. The lights click off. Friday night is done. The same volunteers will be back next week.`,
    author: "David Okonkwo",
    date: "March 8, 2026",
    category: "Volunteer",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80",
    readTime: "6 min read"
  }
];

const ANNOUNCEMENTS = [
  { id: 1, text: "New emergency rental assistance funds available — apply by May 31", urgent: true, date: "Today" },
  { id: 2, text: "Youth Coding Club now accepting applications for Summer 2026 cohort", urgent: false, date: "Yesterday" },
  { id: 3, text: "Community Resource Fair announced for June 6 — 40+ organizations attending!", urgent: false, date: "2 days ago" },
  { id: 4, text: "Valley Mental Health Center extending drop-in hours through summer", urgent: false, date: "3 days ago" },
  { id: 5, text: "Back-to-School Supply Drive needs volunteers — sign up now for July 25", urgent: false, date: "4 days ago" }
];
