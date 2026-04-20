// @ts-nocheck
"use client";
import { useState, useEffect, useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════ */
const C = {
  amber: "#F7B041", blue: "#0B86D1", teal: "#2EAD8E", coral: "#E06347",
  violet: "#905CCB", cyan: "#26C9D8",
  aws: "#FF9900",
  bg: "#050508", card: "rgba(255,255,255,0.03)", surface: "#0a0a12",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
  tx: "#E8E4DD", txm: "#8A8690", txd: "#4E4B56",
  glass: "rgba(255,255,255,0.03)", glassBorder: "rgba(255,255,255,0.06)",
};
const gf = "'Grift','Outfit',sans-serif";
const ft = "'Outfit',sans-serif";
const mn = "'JetBrains Mono',monospace";
const tagColors = { NETWORKING: C.amber, BANQUET: C.blue, RESEARCH: C.violet, CONFERENCE: C.teal, PREMIUM: C.coral };

/* Activation status per event */
type ActivationStatus = "proposed" | "interested" | "activated";
const STATUS_CONFIG: Record<ActivationStatus, { label: string; color: string; bg: string; icon: string }> = {
  proposed:   { label: "Proposed",       color: C.txm,  bg: "rgba(255,255,255,0.04)", icon: "\u25CB" },
  interested: { label: "AWS Interested", color: C.aws,  bg: C.aws + "12",             icon: "\u25C9" },
  activated:  { label: "AWS Activated",  color: "#4ADE80", bg: "#4ADE8015",            icon: "\u2713" },
};

/* ═══════════════════════════════════════════════════════════
   COMPANIES — prospects being pitched (internal-only list)
   ═══════════════════════════════════════════════════════════ */
const COMPANIES = [
  { name: "AWS", color: "#FF9900" },
  { name: "Lambda", color: "#7C3AED" },
];
const companyColor = (name: string) => COMPANIES.find(c => c.name === name)?.color || C.amber;

/* ═══════════════════════════════════════════════════════════
   EVENT DATA — comprehensive
   ═══════════════════════════════════════════════════════════ */
const EVENTS = [
  {
    name: "MLSys",
    dates: "May 18–22, 2026",
    location: "Bellevue, WA",
    tag: "NETWORKING",
    color: C.amber,
    status: "proposed" as ActivationStatus,
    activation: "Happy Hour + Sponsorship",
    logo: "/images/events/mlsys.svg",
    monthIndex: 4, dayStart: 18, dayEnd: 22,
    about: "MLSys is the premier venue for research at the intersection of machine learning and systems. It brings together researchers and practitioners from ML, systems, hardware, and related fields to discuss cutting-edge work on the design, implementation, and deployment of ML systems.",
    audience: "ML systems researchers, infrastructure engineers, hardware architects, and industry practitioners from companies building and deploying ML at scale.",
    ourPlan: "Host an exclusive happy hour for ~200 attendees targeting ML systems researchers and infrastructure engineers. Sponsorship presence at the main conference with AWS branding throughout. Focus on intimate networking — the kind of environment where real conversations happen between the people actually building AI infrastructure.",
    whyItMatters: "MLSys attendees are the engineers who decide what infrastructure to build on. This is a high-signal, low-noise event where every conversation counts. AWS presence here reinforces the message that AWS is where serious ML infrastructure lives.",
    activationSteps: [
      { phase: "Partnership Alignment", timing: "6 weeks out", tasks: ["Confirm sponsorship tier and budget allocation", "Align on branding guidelines and co-marketing assets", "Define target attendee profile and invite list criteria", "Set KPIs: target 200 attendees, 60%+ senior engineers"] },
      { phase: "Venue & Logistics", timing: "4 weeks out", tasks: ["Secure venue near convention center (rooftop bar or upscale lounge)", "Book catering — craft cocktails + elevated appetizers", "Arrange AV setup for brief welcome remarks", "Design and order co-branded signage, name badges, lanyards"] },
      { phase: "Audience Building", timing: "3 weeks out", tasks: ["Launch invite campaign via SemiAnalysis newsletter (200K+ subscribers)", "Targeted outreach to MLSys registered attendees", "Social media promotion across SemiAnalysis channels", "Personal invites to top 50 target attendees from SemiAnalysis network"] },
      { phase: "Event Execution", timing: "Day of", tasks: ["Venue setup 3 hours prior — signage, check-in, AV test", "Check-in with QR codes for attendee tracking", "Welcome remarks from SemiAnalysis + AWS representatives (5 min)", "Facilitated networking — no formal programming, organic conversations"] },
      { phase: "Post-Event", timing: "1 week after", tasks: ["Attendee survey — engagement, satisfaction, follow-up interest", "Compile attendee list with company/role for AWS sales follow-up", "Photo/video highlights package for social + internal reporting", "ROI report: attendance, seniority breakdown, follow-up pipeline"] },
    ],
  },
  {
    name: "Computex",
    dates: "Jun 2–5, 2026",
    location: "Taipei, Taiwan",
    tag: "BANQUET",
    color: C.blue,
    status: "proposed" as ActivationStatus,
    activation: "AI Wonderland Banquet",
    logo: "/images/events/computex.svg",
    monthIndex: 5, dayStart: 2, dayEnd: 5,
    about: "Computex is the world's largest computing and technology trade show, held annually in Taipei. It's the beating heart of the global semiconductor and hardware supply chain — where TSMC, NVIDIA, AMD, Intel, and the entire ecosystem converge.",
    audience: "Semiconductor executives, hardware engineers, supply chain leaders, OEMs, ODMs, and the global technology press. Heavy representation from APAC-based hardware companies.",
    ourPlan: "Host the 'AI Wonderland' themed banquet — an exclusive sit-down dinner experience for 300+ VIP attendees. The venue is already booked. This will be a premium, invitation-only event with themed décor, curated seating arrangements to maximize high-value introductions, and a keynote moment spotlighting AWS's AI infrastructure investments in the APAC region.",
    whyItMatters: "Computex is where hardware meets cloud. AWS's presence at an exclusive SemiAnalysis banquet positions AWS as the cloud provider that understands the full stack — from silicon to cloud. The APAC audience here includes procurement leaders who make billion-dollar infrastructure decisions.",
    activationSteps: [
      { phase: "Partnership Alignment", timing: "8 weeks out", tasks: ["Finalize banquet theme and AWS integration points", "Confirm keynote speaker or fireside chat format", "Align on VIP invite list — target C-suite and VP-level hardware executives", "Budget finalization: venue, catering, production, travel"] },
      { phase: "Creative & Production", timing: "6 weeks out", tasks: ["Design 'AI Wonderland' themed décor and branded materials", "Plan seating chart for maximum networking value", "Produce co-branded invitations (digital + physical for top VIPs)", "Coordinate with Taipei venue on AV, staging, and flow"] },
      { phase: "Audience Building", timing: "4 weeks out", tasks: ["VIP invitation campaign — personal outreach to 500+ targets", "SemiAnalysis newsletter feature on Computex activation", "Coordinate with Computex organizers for cross-promotion", "Confirm RSVP list and manage waitlist"] },
      { phase: "Event Execution", timing: "Day of", tasks: ["Full venue production setup — themed décor, lighting, staging", "Red carpet / welcome experience with photographer", "Seated dinner with curated conversation starters at each table", "Keynote moment: 15-min spotlight on AWS + SemiAnalysis vision", "Post-dinner networking lounge with cocktails"] },
      { phase: "Post-Event", timing: "1 week after", tasks: ["Professional photo/video package for both teams", "Attendee follow-up emails with AWS resources", "Press coverage compilation and social media highlights", "Full ROI report with attendee seniority analysis"] },
    ],
  },
  {
    name: "ICML",
    dates: "Jul 6–11, 2026",
    location: "Seoul, South Korea",
    tag: "RESEARCH",
    color: C.violet,
    status: "proposed" as ActivationStatus,
    activation: "Special Research Event",
    logo: "/images/events/icml.svg",
    monthIndex: 6, dayStart: 6, dayEnd: 11,
    about: "The International Conference on Machine Learning (ICML) is one of the top three ML research conferences globally. It attracts the brightest minds in machine learning — from foundational research to applied ML. The 2026 edition in Seoul will draw significant APAC attendance.",
    audience: "ML researchers (academic and industry), PhD students, research lab directors, and applied ML engineers from Google DeepMind, Meta FAIR, Microsoft Research, OpenAI, and leading universities worldwide.",
    ourPlan: "A special research-focused event that elevates our ML research positioning. This is about going beyond a happy hour — we want to create a meaningful research experience. Think curated research talks, poster sessions featuring AWS-powered research, and intimate roundtable discussions on the future of ML infrastructure. We want to up our presence in the research machine learning community significantly.",
    whyItMatters: "ICML is where the next generation of AI is being invented. Researchers here will become the CTOs and VP Engs of tomorrow's AI companies. AWS investment in this community pays dividends for years. SemiAnalysis's credibility in this space gives AWS authentic entry.",
    activationSteps: [
      { phase: "Partnership Alignment", timing: "10 weeks out", tasks: ["Define research event format — workshop, symposium, or curated talks", "Identify AWS research scientists for panel/talk participation", "Align on research themes: infrastructure for ML, scaling laws, efficiency", "Set target: 300 attendees, 50%+ active ML researchers"] },
      { phase: "Program Design", timing: "8 weeks out", tasks: ["Curate speaker lineup — mix of AWS, academia, and industry", "Design poster session format for AWS-powered research", "Plan roundtable discussions on ML infrastructure future", "Create event microsite with program details and speaker bios"] },
      { phase: "Audience Building", timing: "5 weeks out", tasks: ["Targeted outreach to ICML registered attendees", "Partner with university ML labs for student researcher attendance", "SemiAnalysis newsletter deep-dive on ICML research themes", "Social campaign featuring speaker previews and research topics"] },
      { phase: "Event Execution", timing: "Day of", tasks: ["Venue setup — research poster displays, AV for talks, networking areas", "Curated research talks (3-4 speakers, 20 min each)", "Poster session and demo hour", "Roundtable discussions (4 tables, 15 people each, 45 min)", "Closing reception with open networking"] },
      { phase: "Post-Event", timing: "1 week after", tasks: ["Publish research event recap on SemiAnalysis", "Share speaker presentations and discussion summaries", "Connect attendees with relevant AWS research programs", "Impact report: research community engagement metrics"] },
    ],
  },
  {
    name: "Raise Paris",
    dates: "Jul 8–9, 2026",
    location: "Paris, France",
    tag: "NETWORKING",
    color: C.teal,
    status: "proposed" as ActivationStatus,
    activation: "Happy Hours + Neo Cloud World",
    logo: "/images/events/raise.svg",
    monthIndex: 6, dayStart: 8, dayEnd: 9,
    about: "Raise is Europe's premier conference for the neo-cloud and AI infrastructure ecosystem. It brings together European cloud builders, sovereign cloud operators, AI startups, and infrastructure investors. Paris in July is the nexus of European tech.",
    audience: "European cloud operators, sovereign cloud builders, AI startup founders, infrastructure investors, and policy-makers focused on digital sovereignty and AI compute in Europe.",
    ourPlan: "Multiple happy hour activations throughout the event, working directly with the Raise organizing team. This is about embedding AWS in the European neo-cloud conversation. Happy hours at strategic venues around the conference, creating multiple touchpoints with the European AI infrastructure community. We're coordinating with the core Raise team on programming.",
    whyItMatters: "Europe's sovereign cloud and AI infrastructure market is booming. Raise is where European compute decisions get made. AWS needs authentic presence here — not corporate booths, but genuine community engagement. SemiAnalysis's partnership with Raise organizers gives us inside access.",
    activationSteps: [
      { phase: "Partnership Alignment", timing: "8 weeks out", tasks: ["Coordinate with Raise organizing committee on event integration", "Define happy hour schedule — 2-3 events across 2 days", "Align on European market messaging for AWS", "Budget for multiple venue bookings in central Paris"] },
      { phase: "Venue & Logistics", timing: "5 weeks out", tasks: ["Secure 2-3 venues near Raise conference (historic Parisian locations)", "Coordinate catering — French-inspired menus with local partners", "Design co-branded materials with European market focus", "Arrange photographer/videographer for all events"] },
      { phase: "Audience Building", timing: "3 weeks out", tasks: ["Cross-promote with Raise official communications", "SemiAnalysis newsletter feature on European AI infrastructure", "Targeted outreach to European cloud and AI companies", "VIP invites to sovereign cloud operators and EU policy leaders"] },
      { phase: "Event Execution", timing: "Days of", tasks: ["Setup at each venue — branding, check-in, welcome signage", "Day 1 evening: Opening night happy hour (broader audience)", "Day 2 afternoon: Intimate VIP networking (invite-only, 50 people)", "Day 2 evening: Closing celebration happy hour"] },
      { phase: "Post-Event", timing: "1 week after", tasks: ["European market follow-up campaign for AWS", "Attendee insights report: European cloud buying signals", "Content package: photos, testimonials, social highlights", "Warm introductions pipeline for AWS European sales team"] },
    ],
  },
  {
    name: "Yotta",
    dates: "Sep 28–30, 2026",
    location: "Las Vegas, NV",
    tag: "CONFERENCE",
    color: C.amber,
    status: "proposed" as ActivationStatus,
    activation: "Conference Presence",
    logo: "/images/events/yotta.png",
    monthIndex: 8, dayStart: 28, dayEnd: 30,
    about: "Yotta is the data center and infrastructure mega-conference in Las Vegas. It brings together the people who build, buy, and operate the physical infrastructure behind cloud and AI — from power and cooling to networking and compute.",
    audience: "Data center operators, infrastructure buyers, facilities engineers, colocation providers, hyperscaler procurement teams, and power/energy companies entering the AI infrastructure space.",
    ourPlan: "Strategic conference presence targeting the data center and infrastructure community. Branded presence throughout the event, speaking opportunities, and targeted meetings with infrastructure buyers. This is where the physical layer of AI compute gets decided — AWS needs to be in these conversations.",
    whyItMatters: "As AI compute demand explodes, data center infrastructure is the bottleneck. Yotta attendees are the people solving this problem. AWS's presence here signals commitment to the physical infrastructure that makes cloud AI possible.",
    activationSteps: [
      { phase: "Partnership Alignment", timing: "8 weeks out", tasks: ["Secure speaking slot or panel participation for AWS leader", "Define conference presence: booth, signage, meeting rooms", "Identify target accounts for scheduled meetings", "Align messaging: AWS infrastructure investment story"] },
      { phase: "Logistics & Creative", timing: "5 weeks out", tasks: ["Design booth and branded materials", "Schedule 1:1 meetings with target infrastructure buyers", "Coordinate SemiAnalysis content for conference distribution", "Book meeting rooms or hospitality suite for private conversations"] },
      { phase: "Audience Building", timing: "3 weeks out", tasks: ["Pre-conference outreach to registered attendees", "SemiAnalysis newsletter feature on data center infrastructure", "Schedule specific meetings with top 20 target accounts", "Social media campaign building momentum for conference presence"] },
      { phase: "Event Execution", timing: "Days of", tasks: ["Booth staffed with AWS infrastructure experts", "Hosted meetings and demos in private meeting rooms", "Speaking session or panel participation", "Evening networking reception for top contacts"] },
      { phase: "Post-Event", timing: "1 week after", tasks: ["Meeting notes and follow-up action items for all 1:1s", "Lead pipeline report for AWS sales team", "Conference insights brief: infrastructure market trends", "Content recap for SemiAnalysis audience"] },
    ],
  },
  {
    name: "OCP Global Summit",
    dates: "Oct 12–15, 2026",
    location: "San Jose, CA",
    tag: "CONFERENCE",
    color: C.blue,
    status: "proposed" as ActivationStatus,
    activation: "Conference Presence",
    logo: "/images/events/ocp.jpg",
    monthIndex: 9, dayStart: 12, dayEnd: 15,
    about: "The Open Compute Project Global Summit is the hardware community's flagship event. Founded by Facebook/Meta, OCP drives open-source hardware innovation for data centers. It's where the next generation of server, storage, and networking hardware gets designed and decided.",
    audience: "Datacenter architects, hardware engineers, server and networking designers, procurement leaders from hyperscalers, and the open-source hardware community. Heavy representation from Meta, Microsoft, Google, and major ODMs.",
    ourPlan: "Strong conference presence at OCP with focus on AWS's open hardware contributions and infrastructure innovation. Speaking engagements, demo stations showcasing AWS custom silicon (Graviton, Trainium, Inferentia), and targeted meetings with hardware architects and procurement teams.",
    whyItMatters: "OCP is where open hardware standards get set. AWS's custom silicon story (Graviton, Trainium, Inferentia) is one of the most compelling in the industry. This is the audience that appreciates and amplifies that message.",
    activationSteps: [
      { phase: "Partnership Alignment", timing: "8 weeks out", tasks: ["Secure speaking slot on AWS custom silicon or open hardware contributions", "Plan demo stations for Graviton/Trainium/Inferentia", "Identify hardware architect targets for meetings", "Coordinate with OCP organizers on session placement"] },
      { phase: "Logistics & Creative", timing: "5 weeks out", tasks: ["Design demo station with live AWS silicon benchmarks", "Prepare technical deep-dive materials for hardware audience", "Schedule meetings with datacenter architects and procurement", "Co-branded SemiAnalysis technical brief on AWS hardware"] },
      { phase: "Audience Building", timing: "3 weeks out", tasks: ["Technical preview content on SemiAnalysis channels", "Targeted outreach to OCP community members", "Pre-schedule demos with priority attendees", "Social campaign featuring AWS hardware innovations"] },
      { phase: "Event Execution", timing: "Days of", tasks: ["Technical talk/panel on AWS open hardware contributions", "Demo stations running throughout conference", "Scheduled 1:1 meetings with hardware decision-makers", "Hosted dinner for top 30 hardware architects (evening of Day 2)"] },
      { phase: "Post-Event", timing: "1 week after", tasks: ["Technical content published on SemiAnalysis (deep dive)", "Demo engagement metrics and meeting pipeline report", "Follow-up with all demo visitors and meeting attendees", "Hardware community sentiment analysis"] },
    ],
  },
  {
    name: "SemiAnalysis Summit",
    dates: "October 2026",
    location: "TBA",
    tag: "PREMIUM",
    color: C.violet,
    status: "proposed" as ActivationStatus,
    activation: "Flagship SemiAnalysis Event",
    logo: "/images/events/semianalysis.png",
    monthIndex: 9, dayStart: 15, dayEnd: 17,
    about: "The SemiAnalysis Summit is our flagship owned event — a curated gathering of the most senior operators, researchers, and executives in AI infrastructure. Invite-only, no expo floor, no noise. The single moment each year when the entire SemiAnalysis community convenes in one room.",
    audience: "CTOs, VP Engs, hyperscaler and frontier-lab leadership, sovereign cloud executives, and the investors funding the AI compute buildout. The 300–400 people whose decisions set the direction of the industry.",
    ourPlan: "A multi-day Summit combining curated talks, closed-door roundtables, and a premium evening experience. AWS as presenting partner gets named-sponsor rights, a keynote moment, and first look at the attendee list. Because this is our owned event, sponsor integration goes deeper than any third-party conference allows.",
    whyItMatters: "Owned events outperform sponsored ones because we control the invite list, the programming, and the narrative. The Summit is the highest-leverage moment of the year: one room, 300–400 decision-makers, 100% of them reachable by AWS afterward through SemiAnalysis's warm channel.",
    internalNote: "Tie to OCP and SemiAnalysis internal offsite — leverage overlapping travel week and co-locate execution. Do not surface publicly.",
    activationSteps: [
      { phase: "Partnership Alignment", timing: "14 weeks out", tasks: ["Confirm AWS as presenting partner + co-naming rights", "Align keynote speaker and programming integration", "Set attendee targets: 300–400, 70%+ Director+", "Lock venue and production budget"] },
      { phase: "Program Design", timing: "10 weeks out", tasks: ["Curate speaker lineup across SemiAnalysis + AWS + external voices", "Design Day 1 main stage + Day 2 roundtables + evening experience", "Co-develop AWS-led session on AI infrastructure outlook", "Create event microsite and invite page"] },
      { phase: "Audience Building", timing: "8 weeks out", tasks: ["Launch invite-only campaign via SemiAnalysis CRM", "VIP outreach to top 150 target attendees", "Newsletter series building to Summit", "Coordinate with OCP week cross-traffic"] },
      { phase: "Event Execution", timing: "Day of", tasks: ["Full venue production + branded experience", "Main stage programming with AWS keynote slot", "Closed-door roundtables (capped at 15 per room)", "Evening networking experience with press opportunity"] },
      { phase: "Post-Event", timing: "2 weeks after", tasks: ["Professional photo/video + mini-documentary", "Attendee list + sentiment report delivered to AWS", "SemiAnalysis recap content series", "Pipeline + ROI report + 2027 renewal proposal"] },
    ],
  },
  {
    name: "COLM",
    dates: "Oct 6–9, 2026",
    location: "San Francisco, CA",
    tag: "PREMIUM",
    color: C.coral,
    status: "proposed" as ActivationStatus,
    activation: "Boat Cruise",
    logo: "/images/events/colm.svg",
    monthIndex: 9, dayStart: 6, dayEnd: 9,
    about: "COLM (Conference on Language Modeling) is a newer, focused conference dedicated entirely to language models — the technology behind ChatGPT, Claude, Gemini, and the entire LLM revolution. San Francisco is the epicenter of this work.",
    audience: "LLM researchers, foundation model engineers, AI startup founders, and the people building the most important technology of the decade. Extremely high concentration of decision-makers from frontier AI labs.",
    ourPlan: "Premium boat cruise on the San Francisco Bay — our proven flagship format. An evening experience on the water with 200-300 of the most important people in language modeling. This format creates an unforgettable, captive-audience experience where AWS is the name on everyone's mind. Beautiful views, premium catering, and the kind of environment where partnerships get made.",
    whyItMatters: "COLM attendees are building the models that drive AI compute demand. Every major foundation model runs on cloud infrastructure. Being the brand associated with the best event at COLM positions AWS as the infrastructure partner of choice for the LLM community.",
    activationSteps: [
      { phase: "Partnership Alignment", timing: "10 weeks out", tasks: ["Confirm boat cruise format and AWS co-branding approach", "Select vessel — capacity 250-300, premium finish", "Define experience flow: boarding, cruise, program, docking", "Set guest list criteria: LLM researchers, AI founders, infrastructure leads"] },
      { phase: "Creative & Production", timing: "7 weeks out", tasks: ["Design branded boarding experience and on-deck signage", "Plan catering menu — premium seated dinner + open bar", "Curate entertainment: live DJ or jazz ensemble on deck", "Design commemorative item (branded gift for attendees)", "Coordinate sunset timing for optimal experience"] },
      { phase: "Audience Building", timing: "4 weeks out", tasks: ["Exclusive invite campaign — 'You've been selected' messaging", "SemiAnalysis newsletter feature building anticipation", "Personal outreach to top 50 AI researchers and founders", "Waitlist management to maintain exclusivity"] },
      { phase: "Event Execution", timing: "Day of", tasks: ["Dockside setup: red carpet, branded check-in, welcome drinks", "Boarding experience with photographer", "Welcome toast from SemiAnalysis + AWS on deck", "Cruise route: under Golden Gate Bridge, around Alcatraz, Bay views", "Premium dinner service during cruise", "Open networking on multiple decks post-dinner"] },
      { phase: "Post-Event", timing: "1 week after", tasks: ["Professional photo/video package (drone footage of cruise)", "Attendee follow-up with AWS partnership materials", "Social media content release (phased over 2 weeks)", "Full ROI report: attendee quality, conversations initiated, pipeline"] },
    ],
  },
  {
    name: "NeurIPS",
    dates: "Dec 6–12, 2026",
    location: "Sydney, Australia",
    tag: "PREMIUM",
    color: C.coral,
    status: "proposed" as ActivationStatus,
    activation: "Boat Cruise",
    logo: "/images/events/neurips.svg",
    monthIndex: 11, dayStart: 6, dayEnd: 12,
    about: "NeurIPS (Conference on Neural Information Processing Systems) is the world's largest and most prestigious AI research conference. With 15,000+ attendees, it's where the global AI community converges. The 2026 edition in Sydney marks the first time NeurIPS comes to Australia — a massive moment for APAC AI.",
    audience: "The entire AI ecosystem — researchers, engineers, executives, investors, policymakers, and press. NeurIPS draws from every major tech company, university, AI lab, and startup on the planet.",
    ourPlan: "The crown jewel of our activation calendar — a premium boat cruise on Sydney Harbour. Building on our proven NeurIPS format (partnered with SAIL/ReadSail in 2025, 750 attendees, 680 decision-makers), this will be the must-attend event of the conference. Flagship experience with AWS as presenting partner. Capacity for 300+ on a premium vessel with views of the Sydney Opera House and Harbour Bridge.",
    whyItMatters: "NeurIPS is THE event. Our 2025 boat cruise with SAIL proved the format — 750 attendees, 680 decision-makers, 38% academia, 18% Big Tech, 12% AI startups. Sydney takes this global. AWS as presenting partner of the NeurIPS boat cruise is a statement that echoes through the entire AI community.",
    activationSteps: [
      { phase: "Partnership Alignment", timing: "12 weeks out", tasks: ["Define AWS as 'Presenting Partner' — top-tier branding", "Secure premium vessel in Sydney Harbour (300+ capacity)", "Align on guest curation strategy based on 2025 learnings", "Set ambitious targets: 400 attendees, expand beyond 2025 results"] },
      { phase: "Creative & Production", timing: "8 weeks out", tasks: ["Design flagship branded experience — from invite to follow-up", "Premium catering with Australian coastal theme", "Plan multi-deck experience: dinner deck, networking deck, views deck", "Commission professional event film crew (mini-documentary)", "Design limited-edition attendee gift"] },
      { phase: "Audience Building", timing: "6 weeks out", tasks: ["Launch exclusive invitation campaign (NeurIPS registration required)", "Leverage 2025 attendee list for return invites", "SemiAnalysis newsletter series building to NeurIPS", "Coordinated social campaign with countdown content", "Press outreach for pre-event coverage"] },
      { phase: "Event Execution", timing: "Day of", tasks: ["Harbour-side setup: branded tent, red carpet, welcome drinks", "Premium boarding experience with professional photographer", "Keynote moment on main deck — AWS + SemiAnalysis vision for AI", "Multi-course dinner during cruise through Sydney Harbour", "Views of Sydney skyline and Harbour Bridge at dusk", "After-dinner networking party with live music", "Docking and farewell with gift bags"] },
      { phase: "Post-Event", timing: "2 weeks after", tasks: ["Mini-documentary edit and release", "Professional photo gallery for both teams", "Comprehensive attendee analytics and sentiment report", "Pipeline report: connections made, follow-ups initiated", "Year-in-review recap: all 8 activations, cumulative impact", "2026 partnership renewal proposal"] },
    ],
  },
];

const STATS = [
  { value: "3,100+", label: "Event Attendees in 2025", sub: "Across 8 major activations" },
  { value: "680", label: "Decision-Makers at NeurIPS", sub: "Our 2025 boat cruise with SAIL" },
  { value: "14", label: "Countries Represented", sub: "Global reach, local impact" },
  { value: "200K+", label: "Newsletter Subscribers", sub: "AI & semiconductor professionals" },
];

const PAST_EVENTS = [
  { name: "NeurIPS 2025 Boat Cruise", partner: "w/ SAIL (ReadSail)", attendees: "750", highlight: "680 decision-makers from Google, Meta, NVIDIA, Anthropic, and 40+ AI startups. 38% academia, 18% Big Tech, 12% AI startups." },
  { name: "Computex 2025 Banquet", partner: "AI Wonderland", attendees: "320+", highlight: "TSMC, AMD, Intel, MediaTek leadership in attendance. The must-attend event of the week in Taipei." },
  { name: "ICML 2025 Research Event", partner: "Research Community", attendees: "450+", highlight: "Top-cited ML researchers, keynote speakers attended. Standing room only." },
  { name: "Yotta 2025", partner: "Data Center Community", attendees: "3,000+", highlight: "3,000+ digital infrastructure leaders at MGM Grand. 200+ speakers, 150+ sponsors." },
];

const AUDIENCE_BREAKDOWN = [
  { label: "Academia & Research", pct: 38, color: C.violet },
  { label: "Big Tech (Google, Meta, etc.)", pct: 18, color: C.blue },
  { label: "AI Startups", pct: 12, color: C.amber },
  { label: "Frontier Labs", pct: 10, color: C.teal },
  { label: "Research Analysts", pct: 8, color: C.cyan },
  { label: "Investors", pct: 5, color: C.coral },
];

const WHY_US = [
  { title: "200K+ Newsletter Subscribers", body: "The most-read independent publication covering semiconductors, AI infrastructure, and compute. 200,000+ AI and semiconductor industry professionals, researchers, investors, and enthusiasts.", icon: "\u2709" },
  { title: "3M+ Monthly Reach", body: "Across newsletter, long-form research, video, and social — SemiAnalysis reaches 3M+ professionals every month. Not impressions. Engagement from the people who spec, architect, procure, and sign.", icon: "\u25B6" },
  { title: "Trusted Industry Voice", body: "Cited by Bloomberg, Financial Times, and The Information. When SemiAnalysis speaks, the semiconductor and AI community listens and acts.", icon: "\u2606" },
  { title: "750 at NeurIPS 2025", body: "Our boat cruise with SAIL drew 750 attendees and 680 decision-makers — 38% academia, 18% Big Tech, 12% AI startups. The format is proven.", icon: "\u2605" },
];

/* ═══════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════ */
function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, ...style }}>{children}</div>;
}

function AnimatedStat({ value, label, sub }: { value: string; label: string; sub: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!vis) return;
    const numMatch = value.match(/[\d,]+/);
    if (!numMatch) { setDisplay(value); return; }
    const target = parseInt(numMatch[0].replace(/,/g, ""), 10);
    const suffix = value.replace(numMatch[0], "");
    const prefix = value.indexOf(numMatch[0]) > 0 ? value.slice(0, value.indexOf(numMatch[0])) : "";
    let step = 0;
    const steps = 40;
    const inc = target / steps;
    const timer = setInterval(() => { step++; const cur = Math.min(Math.round(inc * step), target); setDisplay(prefix + cur.toLocaleString() + suffix); if (step >= steps) clearInterval(timer); }, 30);
    return () => clearInterval(timer);
  }, [vis, value]);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: mn, fontSize: 44, fontWeight: 700, background: `linear-gradient(135deg, ${C.amber}, #E8A020)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 8, letterSpacing: "-2px" }}>{display}</div>
      <div style={{ fontFamily: ft, fontSize: 15, fontWeight: 700, color: C.tx, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: ft, fontSize: 12, color: C.txm }}>{sub}</div>
    </div>
  );
}

function AudienceBar({ label, pct, color, delay }: { label: string; pct: number; color: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setWidth(pct), delay); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct, delay]);
  return (
    <div ref={ref} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: ft, fontSize: 14, color: C.tx }}>{label}</span>
        <span style={{ fontFamily: mn, fontSize: 13, color }}>{pct}%</span>
      </div>
      <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: width + "%", height: "100%", background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 3, transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </div>
    </div>
  );
}

function GlassCard({ children, style, hover }: { children: React.ReactNode; style?: React.CSSProperties; hover?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: C.glass,
        backdropFilter: "blur(20px)",
        border: `1px solid ${h && hover ? C.borderHover : C.glassBorder}`,
        borderRadius: 20,
        transition: "all 0.3s ease",
        boxShadow: h && hover ? "0 8px 40px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.2)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR TOC — Apple-style hover rail
   ═══════════════════════════════════════════════════════════ */
const TOC_ITEMS = [
  { id: "hero", label: "Overview" },
  { id: "stats", label: "By the Numbers" },
  { id: "events", label: "Events" },
  { id: "track-record", label: "Track Record" },
  { id: "why", label: "Why Us" },
  { id: "benefits", label: "Benefits" },
  { id: "tiers", label: "Tiers" },
  { id: "cta", label: "Partner" },
];

function SidebarTOC() {
  const [activeId, setActiveId] = useState("hero");
  const [hovered, setHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll-spy: track which section is in view
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibleSections = new Map<string, number>();

    TOC_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visibleSections.set(id, entry.intersectionRatio);
          } else {
            visibleSections.delete(id);
          }
          // Pick the section with the highest visibility
          let bestId = "hero";
          let bestRatio = 0;
          visibleSections.forEach((ratio, sId) => {
            if (ratio > bestRatio) { bestRatio = ratio; bestId = sId; }
          });
          setActiveId(bestId);
        },
        { threshold: [0, 0.1, 0.3, 0.5], rootMargin: "-80px 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 90,
        display: "flex",
        alignItems: "flex-start",
        opacity: scrolled ? 1 : 0,
        pointerEvents: scrolled ? "auto" : "none",
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Hover trigger zone */}
      <div style={{ width: 24, height: 300, cursor: "pointer" }} />

      {/* TOC panel */}
      <div style={{
        background: "#050508E8",
        backdropFilter: "blur(20px)",
        border: `1px solid ${C.glassBorder}`,
        borderLeft: "none",
        borderRadius: "0 16px 16px 0",
        padding: hovered ? "16px 20px 16px 16px" : "16px 10px 16px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        boxShadow: hovered ? "4px 0 24px rgba(0,0,0,0.3)" : "none",
      }}>
        {TOC_ITEMS.map(({ id, label }) => {
          const isActive = activeId === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 4px",
                textDecoration: "none",
                transition: "all 0.2s ease",
                borderRadius: 8,
              }}
            >
              {/* Dot indicator */}
              <div style={{
                width: isActive ? 8 : 5,
                height: isActive ? 8 : 5,
                borderRadius: "50%",
                background: isActive ? C.amber : C.txd,
                flexShrink: 0,
                transition: "all 0.3s ease",
                boxShadow: isActive ? `0 0 8px ${C.amber}60` : "none",
              }} />

              {/* Label — slides in on hover */}
              <span style={{
                fontFamily: ft,
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? C.amber : C.txm,
                whiteSpace: "nowrap",
                opacity: hovered ? 1 : 0,
                transform: hovered ? "translateX(0)" : "translateX(-8px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                maxWidth: hovered ? 120 : 0,
                overflow: "hidden",
                letterSpacing: isActive ? "0.3px" : "0px",
              }}>
                {label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: mn, fontSize: 11, color: C.amber, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>{children}</div>;
}

function GlowDivider({ color = C.amber }: { color?: string }) {
  return (
    <div style={{ position: "relative", height: 1, margin: "0 auto", maxWidth: 1100 }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
      <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 200, height: 40, background: `radial-gradient(ellipse, ${color}12 0%, transparent 70%)`, pointerEvents: "none" }} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: gf, fontSize: 42, fontWeight: 800, color: C.tx, lineHeight: 1.15, marginBottom: 16, letterSpacing: "-1px" }}>{children}</h2>;
}

/* ═══════════════════════════════════════════════════════════
   EXPANDABLE EVENT CARD
   ═══════════════════════════════════════════════════════════ */
function EventCard({ ev, index }: { ev: typeof EVENTS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const col = tagColors[ev.tag] || C.amber;
  const st = STATUS_CONFIG[ev.status];
  const isActivated = ev.status === "activated";
  const isInterested = ev.status === "interested";
  const borderAccent = isActivated ? "#4ADE80" : isInterested ? C.aws : col;

  return (
    <FadeIn delay={index * 60}>
      <div style={{
        background: isActivated ? "rgba(74,222,128,0.03)" : isInterested ? `${C.aws}05` : C.glass,
        backdropFilter: "blur(20px)",
        border: `1px solid ${open ? borderAccent + "40" : isActivated ? "#4ADE8025" : isInterested ? C.aws + "20" : C.glassBorder}`,
        borderRadius: 20,
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: open ? `0 12px 48px ${borderAccent}15` : isActivated ? `0 2px 20px rgba(74,222,128,0.08)` : "0 2px 12px rgba(0,0,0,0.2)",
        position: "relative",
      }}>
        {/* Activated top bar */}
        {(isActivated || isInterested) && (
          <div style={{ height: 3, background: isActivated ? "linear-gradient(90deg, #4ADE80, #22C55E)" : `linear-gradient(90deg, ${C.aws}, ${C.aws}88)` }} />
        )}

        {/* Card header — always visible */}
        <div
          onClick={() => setOpen(!open)}
          style={{ padding: "28px 24px", cursor: "pointer", position: "relative", overflow: "hidden" }}
        >
          {/* Color glow */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: `radial-gradient(circle, ${borderAccent}15 0%, transparent 70%)`, borderRadius: "50%", transition: "opacity 0.3s ease", opacity: open ? 1 : 0.5 }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Status badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{
                fontFamily: mn, fontSize: 9, letterSpacing: "1px",
                color: st.color, background: st.bg,
                border: `1px solid ${st.color}30`,
                borderRadius: 20, padding: "3px 10px",
                fontWeight: 700, display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ fontSize: 10 }}>{st.icon}</span> {st.label}
              </span>
              <span style={{ fontFamily: mn, fontSize: 9, letterSpacing: "1.5px", color: col, background: col + "15", border: `1px solid ${col}25`, borderRadius: 20, padding: "3px 10px", textTransform: "uppercase", fontWeight: 700 }}>{ev.tag}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Event logo */}
                <div style={{ width: 48, height: 48, borderRadius: 12, background: isActivated ? "rgba(74,222,128,0.08)" : isInterested ? C.aws + "10" : "rgba(255,255,255,0.06)", border: `1px solid ${isActivated ? "#4ADE8020" : isInterested ? C.aws + "20" : C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  <img src={ev.logo} alt={ev.name} style={{ width: 36, height: 36, objectFit: "contain", filter: ev.logo.endsWith(".svg") ? "brightness(0) invert(1)" : "none" }} />
                </div>
                <div>
                  <div style={{ fontFamily: gf, fontSize: 24, fontWeight: 800, color: C.tx, letterSpacing: "-0.5px" }}>{ev.name}</div>
                </div>
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: 10, border: `1px solid ${C.glassBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease", fontSize: 14, color: C.txm,
              }}>
                {"\u25BC"}
              </div>
            </div>

            <div style={{ fontFamily: mn, fontSize: 12, color: col }}>{ev.dates}</div>
            <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, margin: "4px 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ opacity: 0.5 }}>{"\u25CB"}</span>{ev.location}
            </div>
            <div style={{ fontFamily: ft, fontSize: 14, fontWeight: 700, color: col, paddingTop: 12, borderTop: `1px solid ${C.glassBorder}` }}>{ev.activation}</div>
          </div>
        </div>

        {/* Expanded content */}
        <div style={{
          maxHeight: open ? 2000 : 0,
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease",
        }}>
          <div style={{ padding: "0 24px 28px", borderTop: `1px solid ${C.glassBorder}` }}>
            {/* About */}
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>About This Event</div>
              <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.7 }}>{ev.about}</div>
            </div>

            {/* Audience */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Who's In the Room</div>
              <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.7 }}>{ev.audience}</div>
            </div>

            {/* Our Plan */}
            <div style={{ background: col + "08", border: `1px solid ${col}20`, borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Our Activation Plan</div>
              <div style={{ fontFamily: ft, fontSize: 14, color: C.tx, lineHeight: 1.7 }}>{ev.ourPlan}</div>
            </div>

            {/* Why It Matters */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Why It Matters for AWS</div>
              <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.7 }}>{ev.whyItMatters}</div>
            </div>

            {/* Internal Note — internal page only */}
            {(ev as any).internalNote && (
              <div style={{ marginBottom: 28, padding: "14px 18px", background: C.coral + "08", border: `1px solid ${C.coral}25`, borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px", fontWeight: 700 }}>INTERNAL</span>
                  <span style={{ fontFamily: mn, fontSize: 10, color: C.coral, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>Team Note</span>
                </div>
                <div style={{ fontFamily: ft, fontSize: 13, color: C.tx, lineHeight: 1.6 }}>{(ev as any).internalNote}</div>
              </div>
            )}

            {/* Step-by-step process */}
            <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Activation Process</div>

            {/* Step tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
              {ev.activationSteps.map((step, si) => (
                <button
                  key={si}
                  onClick={(e) => { e.stopPropagation(); setActiveStep(si); }}
                  style={{
                    fontFamily: mn, fontSize: 10, fontWeight: activeStep === si ? 700 : 500,
                    color: activeStep === si ? "#060608" : C.txm,
                    background: activeStep === si ? `linear-gradient(135deg, ${col}, ${col}cc)` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${activeStep === si ? col : C.glassBorder}`,
                    borderRadius: 10, padding: "8px 14px", cursor: "pointer",
                    transition: "all 0.2s ease", letterSpacing: "0.5px",
                  }}
                >
                  {step.phase}
                </button>
              ))}
            </div>

            {/* Active step content */}
            {ev.activationSteps[activeStep] && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.glassBorder}`, borderRadius: 14, padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontFamily: ft, fontSize: 16, fontWeight: 800, color: C.tx }}>{ev.activationSteps[activeStep].phase}</div>
                  <span style={{ fontFamily: mn, fontSize: 11, color: col }}>{ev.activationSteps[activeStep].timing}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ev.activationSteps[activeStep].tasks.map((task, ti) => (
                    <div key={ti} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: `1px solid ${col}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <div style={{ fontFamily: mn, fontSize: 9, color: col }}>{ti + 1}</div>
                      </div>
                      <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, lineHeight: 1.5 }}>{task}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

/* ═══════════════════════════════════════════════════════════
   CALENDAR VIEW
   ═══════════════════════════════════════════════════════════ */
function CalendarView() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const startDays = [4, 0, 0, 3, 5, 1, 3, 6, 2, 4, 0, 2]; // 2026 first-day-of-month (0=Sun)

  function getEventsForDay(monthIdx: number, day: number) {
    return EVENTS.filter(ev => {
      if (ev.monthIndex !== monthIdx) return false;
      return day >= ev.dayStart && day <= ev.dayEnd;
    });
  }

  // Only show months that have events
  const activeMonths = [4, 5, 6, 8, 9, 11];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
      {activeMonths.map(mi => {
        const days = daysInMonth[mi];
        const startDay = startDays[mi];
        const cells = [];
        // Empty cells for start offset
        for (let i = 0; i < startDay; i++) cells.push(null);
        for (let d = 1; d <= days; d++) cells.push(d);

        return (
          <FadeIn key={mi} delay={activeMonths.indexOf(mi) * 80}>
            <GlassCard style={{ padding: "24px" }}>
              <div style={{ fontFamily: gf, fontSize: 20, fontWeight: 800, color: C.tx, marginBottom: 4 }}>{months[mi]}</div>
              <div style={{ fontFamily: mn, fontSize: 11, color: C.txm, marginBottom: 16 }}>2026</div>

              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <div key={d} style={{ fontFamily: mn, fontSize: 9, color: C.txd, textAlign: "center", padding: "4px 0" }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={`e${i}`} />;
                  const evs = getEventsForDay(mi, day);
                  const hasEvent = evs.length > 0;
                  const col = hasEvent ? evs[0].color : undefined;
                  return (
                    <div key={i} style={{
                      aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      borderRadius: 8, fontSize: 12, fontFamily: mn,
                      color: hasEvent ? "#fff" : C.txd,
                      background: hasEvent ? col + "25" : "transparent",
                      border: hasEvent ? `1px solid ${col}40` : "1px solid transparent",
                      position: "relative",
                    }}>
                      {day}
                      {hasEvent && <div style={{ position: "absolute", bottom: 3, width: 4, height: 4, borderRadius: "50%", background: col }} />}
                    </div>
                  );
                })}
              </div>

              {/* Events legend for this month */}
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {EVENTS.filter(ev => ev.monthIndex === mi).map(ev => (
                  <div key={ev.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: ft, fontSize: 12, color: C.txm }}>{ev.name}</span>
                    <span style={{ fontFamily: mn, fontSize: 10, color: C.txd, marginLeft: "auto" }}>{ev.dates}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </FadeIn>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TIMELINE VIEW
   ═══════════════════════════════════════════════════════════ */
function TimelineView() {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const grouped = useMemo(() => {
    const map: Record<number, typeof EVENTS> = {};
    EVENTS.forEach(ev => {
      if (!map[ev.monthIndex]) map[ev.monthIndex] = [];
      map[ev.monthIndex].push(ev);
    });
    return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, []);

  return (
    <div style={{ position: "relative", paddingLeft: 60 }}>
      {/* Vertical line */}
      <div style={{ position: "absolute", left: 29, top: 0, bottom: 0, width: 1, background: `linear-gradient(180deg, ${C.amber}40, ${C.violet}40, ${C.coral}40)` }} />

      {grouped.map(([monthIdx, evs], gi) => (
        <div key={monthIdx} style={{ marginBottom: 48 }}>
          {/* Month marker */}
          <FadeIn>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div style={{ position: "absolute", left: -60 + 20, top: 4, width: 18, height: 18, borderRadius: "50%", background: evs[0].color, boxShadow: `0 0 20px ${evs[0].color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
              </div>
              <div style={{ fontFamily: mn, fontSize: 13, fontWeight: 700, color: evs[0].color, letterSpacing: "3px" }}>{months[Number(monthIdx)]}</div>
            </div>
          </FadeIn>

          {/* Event cards */}
          {evs.map((ev, ei) => (
            <FadeIn key={ev.name} delay={ei * 80 + gi * 60}>
              <div style={{ marginBottom: 16, position: "relative" }}>
                {/* Connector line */}
                <div style={{ position: "absolute", left: -31, top: 14, width: 20, height: 1, background: ev.color + "40" }} />
                <div style={{ position: "absolute", left: -40, top: 10, width: 8, height: 8, borderRadius: "50%", background: C.bg, border: `2px solid ${ev.color}60` }} />

                <GlassCard style={{ padding: "22px 24px", borderLeft: `3px solid ${ev.status === "activated" ? "#4ADE80" : ev.status === "interested" ? C.aws : ev.color}`, background: ev.status === "activated" ? "rgba(74,222,128,0.03)" : ev.status === "interested" ? C.aws + "05" : C.glass }} hover>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        <img src={ev.logo} alt={ev.name} style={{ width: 26, height: 26, objectFit: "contain", filter: ev.logo.endsWith(".svg") ? "brightness(0) invert(1)" : "none" }} />
                      </div>
                      <div>
                        <div style={{ fontFamily: gf, fontSize: 20, fontWeight: 800, color: C.tx, letterSpacing: "-0.3px" }}>{ev.name}</div>
                        <div style={{ fontFamily: mn, fontSize: 12, color: ev.color, marginTop: 2 }}>{ev.dates}</div>
                        <div style={{ fontFamily: ft, fontSize: 12, color: C.txd, marginTop: 2 }}>{ev.location}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span style={{ fontFamily: mn, fontSize: 9, letterSpacing: "1px", color: STATUS_CONFIG[ev.status].color, background: STATUS_CONFIG[ev.status].bg, border: `1px solid ${STATUS_CONFIG[ev.status].color}30`, borderRadius: 20, padding: "3px 10px", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10 }}>{STATUS_CONFIG[ev.status].icon}</span> {STATUS_CONFIG[ev.status].label}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontFamily: ft, fontSize: 14, fontWeight: 700, color: ev.color, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.glassBorder}` }}>{ev.activation}</div>
                </GlassCard>
              </div>
            </FadeIn>
          ))}
        </div>
      ))}

      {/* End node */}
      <FadeIn>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: -60 + 17, top: 0, width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${C.amber}, ${C.coral})`, boxShadow: `0 0 24px ${C.amber}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
          </div>
          <div style={{ fontFamily: mn, fontSize: 11, color: C.txd, letterSpacing: "2px", paddingTop: 4 }}>END OF 2026 SEASON</div>
        </div>
      </FadeIn>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CALENDAR TAB (wraps both views)
   ═══════════════════════════════════════════════════════════ */
function CalendarTab() {
  const [view, setView] = useState<"calendar" | "timeline">("timeline");
  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative" }}>
      <GradientMesh />
      <div style={{ position: "relative", zIndex: 1, padding: "120px 32px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Schedule</SectionLabel>
          <SectionTitle>2026 Event Calendar</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
            Eight activations spanning May through December — every major AI and infrastructure conference where it matters most.
          </p>
        </FadeIn>

        {/* View toggle */}
        <FadeIn delay={100}>
          <div style={{ display: "inline-flex", gap: 4, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 14, padding: 4, marginBottom: 40 }}>
            {[
              { key: "timeline" as const, label: "Timeline" },
              { key: "calendar" as const, label: "Calendar" },
            ].map(v => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                style={{
                  fontFamily: ft, fontSize: 13, fontWeight: view === v.key ? 800 : 600,
                  color: view === v.key ? "#060608" : C.txm,
                  background: view === v.key ? `linear-gradient(135deg, ${C.amber}, #E8A020)` : "transparent",
                  border: "none", borderRadius: 10, padding: "10px 24px",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {view === "timeline" ? <TimelineView /> : <CalendarView />}

        {/* Year-at-a-glance bar */}
        <FadeIn>
          <div style={{ marginTop: 60 }}>
            <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 }}>Year at a Glance</div>
            <div style={{ display: "flex", gap: 2, height: 40, borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.glassBorder}` }}>
              {Array.from({ length: 12 }, (_, i) => {
                const evs = EVENTS.filter(ev => ev.monthIndex === i);
                const hasEvent = evs.length > 0;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: hasEvent ? evs[0].color + "15" : "transparent", borderRight: i < 11 ? `1px solid ${C.glassBorder}` : "none", position: "relative" }}>
                    <div style={{ fontFamily: mn, fontSize: 9, color: hasEvent ? evs[0].color : C.txd }}>{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</div>
                    {hasEvent && <div style={{ position: "absolute", bottom: 4, display: "flex", gap: 2 }}>{evs.map((ev, ei) => <div key={ei} style={{ width: 4, height: 4, borderRadius: "50%", background: ev.color }} />)}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GRADIENT MESH (shared background)
   ═══════════════════════════════════════════════════════════ */
function GradientMesh() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      {/* Primary amber glow — top left — BIG */}
      <div style={{ position: "absolute", top: "-20%", left: "-15%", width: "65vw", height: "65vw", background: `radial-gradient(circle, ${C.amber}28 0%, ${C.amber}10 35%, transparent 65%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      {/* Blue glow — right side — BIG */}
      <div style={{ position: "absolute", top: "20%", right: "-20%", width: "60vw", height: "60vw", background: `radial-gradient(circle, ${C.blue}24 0%, ${C.blue}0C 35%, transparent 65%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      {/* Violet glow — bottom center — BIG */}
      <div style={{ position: "absolute", bottom: "-15%", left: "10%", width: "60vw", height: "60vw", background: `radial-gradient(circle, ${C.violet}22 0%, ${C.violet}0A 35%, transparent 65%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      {/* Coral bloom — mid right */}
      <div style={{ position: "absolute", top: "50%", right: "0%", width: "40vw", height: "40vw", background: `radial-gradient(circle, ${C.coral}1A 0%, ${C.coral}06 40%, transparent 65%)`, borderRadius: "50%", filter: "blur(70px)" }} />
      {/* Teal bloom — lower left */}
      <div style={{ position: "absolute", bottom: "10%", left: "-8%", width: "45vw", height: "45vw", background: `radial-gradient(circle, ${C.teal}18 0%, ${C.teal}06 40%, transparent 65%)`, borderRadius: "50%", filter: "blur(70px)" }} />
      {/* Amber secondary — center */}
      <div style={{ position: "absolute", top: "0%", left: "25%", width: "50vw", height: "50vw", background: `radial-gradient(circle, ${C.amber}14 0%, transparent 50%)`, borderRadius: "50%", filter: "blur(80px)" }} />
      {/* AWS orange — bottom right */}
      <div style={{ position: "absolute", bottom: "0%", right: "5%", width: "35vw", height: "35vw", background: `radial-gradient(circle, ${C.aws}12 0%, transparent 55%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      {/* Cyan accent — center left */}
      <div style={{ position: "absolute", top: "35%", left: "5%", width: "30vw", height: "30vw", background: `radial-gradient(circle, ${C.cyan}10 0%, transparent 55%)`, borderRadius: "50%", filter: "blur(70px)" }} />
      {/* Deep violet — top right corner */}
      <div style={{ position: "absolute", top: "-5%", right: "5%", width: "35vw", height: "35vw", background: `radial-gradient(circle, #6B21A812 0%, transparent 55%)`, borderRadius: "50%", filter: "blur(80px)" }} />
      {/* Warm amber center band */}
      <div style={{ position: "absolute", top: "40%", left: "20%", width: "60vw", height: "20vw", background: `radial-gradient(ellipse 70% 40% at 50% 50%, ${C.amber}0A 0%, transparent 70%)`, filter: "blur(40px)" }} />
      {/* Noise/grain overlay for depth */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.02, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   OVERVIEW TAB — Main pitch page
   ═══════════════════════════════════════════════════════════ */
function OverviewTab({ internal }: { internal: boolean }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative" }}>
      <GradientMesh />
      <SidebarTOC />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ─── HERO ─── */}
        <section id="hero" style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px", position: "relative", overflow: "hidden" }}>
          {/* Hero-specific aura — intense */}
          <div style={{ position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)", width: "90vw", height: "80vh", background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${C.amber}1A 0%, ${C.amber}08 40%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "30%", left: "15%", width: "35vw", height: "35vw", background: `radial-gradient(circle, ${C.blue}14 0%, transparent 60%)`, borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "25%", right: "10%", width: "30vw", height: "30vw", background: `radial-gradient(circle, ${C.violet}12 0%, transparent 60%)`, borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "20%", left: "50%", transform: "translateX(-50%)", width: "50vw", height: "20vh", background: `radial-gradient(ellipse 80% 40% at 50% 50%, ${C.coral}0C 0%, transparent 70%)`, pointerEvents: "none", filter: "blur(40px)" }} />
          {/* Flowing rings */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", border: `1px solid ${C.amber}08`, pointerEvents: "none", animation: "flowRing 20s linear infinite" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 450, height: 450, borderRadius: "50%", border: `1px solid ${C.blue}06`, pointerEvents: "none", animation: "flowRing 15s linear infinite reverse" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 750, height: 750, borderRadius: "50%", border: `1px solid ${C.violet}05`, pointerEvents: "none", animation: "flowRing 25s linear infinite" }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 900 }}>
            <FadeIn>
              <div style={{ fontFamily: mn, fontSize: 11, color: C.amber, letterSpacing: "4px", textTransform: "uppercase", marginBottom: 24 }}>2026 Event Partnership</div>
            </FadeIn>
            <FadeIn delay={100}>
              <h1 style={{ fontFamily: gf, fontSize: "clamp(40px, 7vw, 76px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24, background: `linear-gradient(135deg, #fff 0%, ${C.amber} 50%, ${C.blue} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Powering the AI<br />Infrastructure Community
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p style={{ fontFamily: ft, fontSize: 19, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 40px" }}>
                A strategic marketing partnership between SemiAnalysis and AWS — reaching the decision-makers who architect, procure, and build AI infrastructure at the world's most important conferences.
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="#events" style={{ fontFamily: ft, fontSize: 15, fontWeight: 800, color: "#fff", background: `linear-gradient(135deg, ${C.amber}40, ${C.blue}40)`, backdropFilter: "blur(20px)", border: `1px solid rgba(255,255,255,0.1)`, padding: "14px 36px", borderRadius: 100, textDecoration: "none", transition: "all 0.2s ease" }}>Explore Events</a>
                <a href="#why" style={{ fontFamily: ft, fontSize: 15, fontWeight: 700, color: C.amber, border: `1px solid ${C.amber}30`, padding: "14px 36px", borderRadius: 100, textDecoration: "none", transition: "all 0.2s ease" }}>Why SemiAnalysis</a>
              </div>
            </FadeIn>
            <FadeIn delay={500}>
              <div style={{ marginTop: 60 }}>
                <div style={{ width: 1, height: 60, background: `linear-gradient(180deg, ${C.amber}40, transparent)`, margin: "0 auto" }} />
              </div>
            </FadeIn>
          </div>
        </section>

        <GlowDivider color={C.amber} />
        {/* ─── STATS BAR ─── */}
        <section id="stats" style={{ padding: "48px 32px" }}>
          <div data-grid-responsive style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {STATS.map((s, i) => (
              <FadeIn key={s.label} delay={i * 80}>
                <GlassCard style={{ padding: "28px" }}>
                  <AnimatedStat value={s.value} label={s.label} sub={s.sub} />
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </section>

        <GlowDivider color={C.blue} />
        {/* ─── EVENT CARDS (expandable) ─── */}
        <section id="events" style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>2026 Season</SectionLabel>
            <SectionTitle>Eight Activations. Three Continents.</SectionTitle>
            <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 640, marginBottom: 12 }}>
              Click any event to explore the full activation plan, audience details, and step-by-step execution process.
            </p>
            <p style={{ fontFamily: mn, fontSize: 11, color: C.txd, marginBottom: 24, letterSpacing: "0.5px" }}>
              Click an event card to expand details {"\u2193"}
            </p>
          </FadeIn>

          {/* Status legend */}
          <FadeIn delay={100}>
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              {(["activated", "interested", "proposed"] as ActivationStatus[]).map(s => {
                const cfg = STATUS_CONFIG[s];
                const count = EVENTS.filter(e => e.status === s).length;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mn, fontSize: 11 }}>
                    <span style={{ color: cfg.color, fontSize: 12 }}>{cfg.icon}</span>
                    <span style={{ color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                    <span style={{ color: C.txd }}>({count})</span>
                  </div>
                );
              })}
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {EVENTS.map((ev, i) => (
              <EventCard key={ev.name} ev={ev} index={i} />
            ))}
          </div>
        </section>

        <GlowDivider color={C.violet} />
        {/* ─── PAST EVENTS ─── */}
        <section id="track-record" style={{ padding: "80px 32px", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeIn>
              <SectionLabel>Track Record</SectionLabel>
              <SectionTitle>Proven Results</SectionTitle>
              <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 48 }}>
                Our events don't just draw crowds — they draw the right crowds. Here's what we've delivered.
              </p>
            </FadeIn>

            <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
              {/* Audience breakdown */}
              <FadeIn>
                <div>
                  <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 24, fontWeight: 700 }}>Audience Composition</div>
                  {AUDIENCE_BREAKDOWN.map((a, i) => (
                    <AudienceBar key={a.label} label={a.label} pct={a.pct} color={a.color} delay={i * 120} />
                  ))}
                </div>
              </FadeIn>

              {/* Past events */}
              <div>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 24, fontWeight: 700 }}>Recent Activations</div>
                {PAST_EVENTS.map((ev, i) => (
                  <FadeIn key={ev.name} delay={i * 80}>
                    <GlassCard style={{ padding: "20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontFamily: ft, fontSize: 15, fontWeight: 700, color: C.tx }}>{ev.name}</div>
                        <span style={{ fontFamily: mn, fontSize: 14, fontWeight: 700, color: C.amber }}>{ev.attendees}</span>
                      </div>
                      <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, lineHeight: 1.6 }}>{ev.highlight}</div>
                    </GlassCard>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        <GlowDivider color={C.teal} />
        {/* ─── WHY SEMIANALYSIS ─── */}
        <section id="why" style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>The Partnership</SectionLabel>
            <SectionTitle>Why SemiAnalysis?</SectionTitle>
            <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 48 }}>
              We don't just reach the AI infrastructure community — we are the AI infrastructure community. Our audience isn't passive subscribers. They're the engineers, researchers, and executives building the future of compute. We earn their attention the hard way: with primary research, technical depth, and reporting that gets cited in boardrooms, earnings calls, and engineering decisions. When AWS shows up inside a SemiAnalysis activation, you're not renting attention — you're standing next to the most trusted independent voice in the category, in front of the exact people whose purchase decisions move your revenue.
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {WHY_US.map((item, i) => (
              <FadeIn key={item.title} delay={i * 80}>
                <GlassCard style={{ padding: "28px 24px", height: "100%" }} hover>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: C.amber + "10", border: `1px solid ${C.amber}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>{item.icon}</div>
                  <div style={{ fontFamily: ft, fontSize: 18, fontWeight: 800, color: C.tx, marginBottom: 10, letterSpacing: "-0.3px" }}>{item.title}</div>
                  <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.7 }}>{item.body}</div>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </section>

        <GlowDivider color={C.amber} />
        {/* ─── PARTNERSHIP VALUE PROP ─── */}
        <section id="benefits" style={{ padding: "80px 32px", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeIn>
              <SectionLabel>What AWS Gets</SectionLabel>
              <SectionTitle>Partnership Benefits</SectionTitle>
            </FadeIn>

            <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 40 }}>
              {[
                { title: "Brand Positioning", items: ["Presenting partner branding at every activation", "Co-branded content across SemiAnalysis channels (200K+ subscribers)", "Association with the most trusted voice in AI infrastructure", "Premium placement — not a logo wall, a real partnership"] },
                { title: "Audience Access", items: ["Direct access to 2,400+ decision-makers across 8 events", "Curated introductions to target accounts at every activation", "Pre- and post-event attendee data for sales pipeline building", "78% Director+ seniority — the people who sign and decide"] },
                { title: "Content & Reach", items: ["Newsletter features to 200K+ subscribers", "3M+ total monthly reach across owned channels", "Event recap content and social media amplification", "Year-round brand presence beyond event days"] },
              ].map((col, i) => (
                <FadeIn key={col.title} delay={i * 100}>
                  <GlassCard style={{ padding: "28px 24px", height: "100%" }}>
                    <div style={{ fontFamily: ft, fontSize: 18, fontWeight: 800, color: C.amber, marginBottom: 16 }}>{col.title}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {col.items.map((item, ii) => (
                        <div key={ii} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.amber, flexShrink: 0, marginTop: 7 }} />
                          <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.6 }}>{item}</div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <GlowDivider color={C.coral} />
        {/* ─── INVESTMENT TIERS ─── */}
        <section id="tiers" style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Investment</SectionLabel>
            <SectionTitle>Partnership Tiers</SectionTitle>
            <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 48 }}>Flexible partnership structures designed to match your goals — from targeted single-event activations to full-season presenting partnerships.</p>
          </FadeIn>

          <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { tier: "Select", desc: "Choose 2-3 events", features: ["Co-branded presence at selected events", "Newsletter features around event dates", "Attendee data and post-event reporting", "Dedicated AWS touchpoint at each activation"], highlight: false },
              { tier: "Premier", desc: "Full season access", features: ["Presenting partner at all 8 activations", "Year-round SemiAnalysis content integration", "Priority audience curation at every event", "Quarterly strategy sessions and reporting", "Custom activation design for flagship events"], highlight: true },
              { tier: "Flagship", desc: "Anchor 1-2 marquee events", features: ["Title sponsor of NeurIPS and/or COLM boat cruise", "Maximum brand presence at the biggest moments", "VIP guest curation and seating", "Full event recap documentary production"], highlight: false },
            ].map((t, i) => (
              <FadeIn key={t.tier} delay={i * 100}>
                <div style={{
                  background: t.highlight ? `linear-gradient(135deg, ${C.amber}0A, ${C.blue}08)` : C.glass,
                  backdropFilter: "blur(20px)",
                  border: t.highlight ? `1px solid ${C.amber}30` : `1px solid ${C.glassBorder}`,
                  borderRadius: 20, padding: "32px 24px", height: "100%",
                  boxShadow: t.highlight ? `0 8px 40px ${C.amber}10` : undefined,
                  position: "relative", overflow: "hidden",
                }}>
                  {t.highlight && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.amber}, ${C.blue})` }} />}
                  <div style={{ fontFamily: gf, fontSize: 28, fontWeight: 900, color: t.highlight ? C.amber : C.tx, marginBottom: 4 }}>{t.tier}</div>
                  <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, marginBottom: 24 }}>{t.desc}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {t.features.map((f, fi) => (
                      <div key={fi} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ fontFamily: mn, fontSize: 12, color: t.highlight ? C.amber : C.teal, marginTop: 1 }}>{"\u2713"}</div>
                        <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, lineHeight: 1.5 }}>{f}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <Testimonials />

        {/* ─── CTA ─── */}
        <InterestForm />

        {/* ─── FOOTER ─── */}
        <footer style={{ borderTop: `1px solid ${C.glassBorder}`, padding: "32px", textAlign: "center" }}>
          <div style={{ fontFamily: mn, fontSize: 11, color: C.txd, letterSpacing: "1px" }}>SemiAnalysis &copy; 2026 — Confidential</div>
        </footer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERNAL-ONLY: ROI CALCULATOR
   ═══════════════════════════════════════════════════════════ */
function ROICalculator({ company }: { company: string }) {
  const isAll = company === "All";
  // In company mode: default-select that company's activated events from localStorage
  const defaultSelected = useMemo(() => {
    if (isAll) {
      const union = new Set<string>();
      COMPANIES.forEach(c => {
        try {
          const raw = localStorage.getItem(`sa-statuses-${c.name}`);
          if (!raw) return;
          const obj = JSON.parse(raw) as Record<string, string>;
          Object.entries(obj).forEach(([name, st]) => { if (st === "activated") union.add(name); });
        } catch {}
      });
      return union;
    }
    try {
      const raw = localStorage.getItem(`sa-statuses-${company}`);
      if (!raw) return new Set<string>();
      const obj = JSON.parse(raw) as Record<string, string>;
      return new Set(Object.entries(obj).filter(([, st]) => st === "activated" || st === "interested").map(([n]) => n));
    } catch { return new Set<string>(); }
  }, [company, isAll]);

  const [selected, setSelected] = useState<Set<string>>(defaultSelected);
  useEffect(() => { setSelected(defaultSelected); }, [defaultSelected]);
  const toggle = (name: string) => {
    const next = new Set(selected);
    next.has(name) ? next.delete(name) : next.add(name);
    setSelected(next);
  };

  // Per-event averages derived from 2025 actuals: 3,100+ attendees / 8 events = ~388 avg,
  // with 2,400+ decision-makers (~300/event) and 78% Director+ seniority at flagships.
  const count = selected.size;
  const estAttendees = count * 388;
  const estDecisionMakers = count * 300;
  const estCountries = Math.min(count * 2 + 3, 14);
  const estFollowUps = Math.round(estDecisionMakers * 0.35);
  const col = isAll ? C.amber : companyColor(company);

  return (
    <section id="roi" style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <FadeIn>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <SectionLabel>ROI Projections</SectionLabel>
          <span style={{ fontFamily: mn, fontSize: 9, color: col, background: col + "15", border: `1px solid ${col}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px", fontWeight: 700 }}>{company.toUpperCase()}</span>
        </div>
        <SectionTitle>{isAll ? "Combined Impact Calculator" : `${company} Impact Calculator`}</SectionTitle>
        <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
          {isAll
            ? "Model the combined reach of every event activated across all companies. Toggle events to adjust."
            : `Model projected reach for ${company}. Defaults to events currently Interested or Activated for ${company}. Based on 2025 actuals.`}
        </p>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Event selector */}
        <FadeIn>
          <div>
            <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Select Events</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {EVENTS.map(ev => (
                <div key={ev.name} onClick={() => toggle(ev.name)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  background: selected.has(ev.name) ? C.amber + "08" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selected.has(ev.name) ? C.amber + "30" : C.glassBorder}`,
                  borderRadius: 12, cursor: "pointer", transition: "all 0.2s ease",
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${selected.has(ev.name) ? C.amber : C.txd}`, background: selected.has(ev.name) ? C.amber : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", flexShrink: 0 }}>
                    {selected.has(ev.name) && <span style={{ color: "#060608", fontSize: 11, fontWeight: 900 }}>{"\u2713"}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: ft, fontSize: 14, fontWeight: 700, color: C.tx }}>{ev.name}</div>
                    <div style={{ fontFamily: mn, fontSize: 11, color: C.txd }}>{ev.dates}</div>
                  </div>
                  <span style={{ fontFamily: mn, fontSize: 9, color: STATUS_CONFIG[ev.status].color }}>{STATUS_CONFIG[ev.status].label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Projected numbers */}
        <FadeIn delay={100}>
          <div>
            <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Projected Impact</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Events Activated", value: count.toString(), color: C.amber },
                { label: "Total Estimated Attendees", value: estAttendees.toLocaleString() + "+", color: C.blue },
                { label: "Decision-Makers Reached", value: estDecisionMakers.toLocaleString() + "+", color: C.teal },
                { label: "Countries Represented", value: estCountries.toString(), color: C.violet },
                { label: "Est. Follow-Up Pipeline", value: estFollowUps.toLocaleString() + " contacts", color: C.coral },
              ].map(row => (
                <GlassCard key={row.label} style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: ft, fontSize: 14, color: C.txm }}>{row.label}</span>
                    <span style={{ fontFamily: mn, fontSize: 24, fontWeight: 700, color: row.color, letterSpacing: "-1px" }}>{row.value}</span>
                  </div>
                </GlassCard>
              ))}
            </div>

            <GlassCard style={{ padding: "20px 24px", marginTop: 16, background: C.amber + "06", border: `1px solid ${C.amber}20` }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Cost Efficiency vs Traditional</div>
              <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.6 }}>
                Standard conference sponsorship: <span style={{ color: C.tx, fontWeight: 700 }}>~$150-300 per lead</span><br />
                SemiAnalysis activations: <span style={{ color: C.amber, fontWeight: 700 }}>~$40-80 per decision-maker</span><br />
                <span style={{ fontFamily: mn, fontSize: 12, color: C.teal, marginTop: 4, display: "block" }}>3-5x more efficient + higher seniority</span>
              </div>
            </GlassCard>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS (both views)
   ═══════════════════════════════════════════════════════════ */
function Testimonials() {
  const quotes = [
    { quote: "The SemiAnalysis NeurIPS cruise was the single best networking event I attended all year. Every conversation was high-signal.", author: "VP of Engineering", company: "AI Startup (Series C)" },
    { quote: "Unlike typical conference happy hours, every person I talked to actually understood the infrastructure stack. That never happens.", author: "Director of Cloud Architecture", company: "Fortune 500" },
    { quote: "I made three partnerships at the Computex banquet that turned into signed contracts within 60 days.", author: "CEO", company: "Sovereign Cloud Provider" },
    { quote: "SemiAnalysis events feel exclusive without being exclusionary. The curation is what makes the difference.", author: "ML Research Lead", company: "Top 3 AI Lab" },
  ];

  return (
    <section style={{ padding: "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>What Attendees Say</SectionLabel>
          <SectionTitle>From the People in the Room</SectionTitle>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginTop: 32 }}>
          {quotes.map((q, i) => (
            <FadeIn key={i} delay={i * 80}>
              <GlassCard style={{ padding: "28px 24px", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: ft, fontSize: 28, color: C.amber, lineHeight: 1, marginBottom: 12 }}>{"\u201C"}</div>
                <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.7, flex: 1, marginBottom: 16 }}>{q.quote}</div>
                <div style={{ borderTop: `1px solid ${C.glassBorder}`, paddingTop: 12 }}>
                  <div style={{ fontFamily: ft, fontSize: 13, fontWeight: 700, color: C.tx }}>{q.author}</div>
                  <div style={{ fontFamily: mn, fontSize: 11, color: C.txd }}>{q.company}</div>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTEREST FORM (AWS view CTA replacement)
   ═══════════════════════════════════════════════════════════ */
function InterestForm() {
  const [form, setForm] = useState({ name: "", email: "", role: "", events: new Set<string>(), notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const toggleEvent = (name: string) => {
    const next = new Set(form.events);
    next.has(name) ? next.delete(name) : next.add(name);
    setForm({ ...form, events: next });
  };

  if (submitted) {
    return (
      <section id="cta" style={{ padding: "100px 32px", textAlign: "center" }}>
        <FadeIn>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u2713"}</div>
            <h2 style={{ fontFamily: gf, fontSize: 36, fontWeight: 900, color: "#4ADE80", letterSpacing: "-1px", marginBottom: 12 }}>Interest Received</h2>
            <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7 }}>Thank you! Michelle will reach out within 24 hours to discuss next steps.</p>
          </div>
        </FadeIn>
      </section>
    );
  }

  return (
    <section id="cta" style={{ padding: "100px 32px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>Get Started</SectionLabel>
            <h2 style={{ fontFamily: gf, fontSize: 48, fontWeight: 900, background: `linear-gradient(135deg, #fff 0%, ${C.amber} 60%, ${C.blue} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-1.5px", marginBottom: 16, lineHeight: 1.1 }}>
              Let's Build This<br />Together.
            </h2>
            <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
              Select the events you're interested in and we'll put together a custom partnership proposal.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <GlassCard style={{ padding: "32px" }}>
            {/* Name + Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[
                { key: "name", label: "Name", placeholder: "Your name" },
                { key: "email", label: "Email", placeholder: "you@company.com" },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>{f.label}</div>
                  <input
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.tx, fontFamily: ft, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = C.amber; }}
                    onBlur={e => { e.target.style.borderColor = C.glassBorder; }}
                  />
                </div>
              ))}
            </div>

            {/* Role */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Role / Title</div>
              <input
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Head of Marketing, AWS"
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.tx, fontFamily: ft, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={e => { e.target.style.borderColor = C.amber; }}
                onBlur={e => { e.target.style.borderColor = C.glassBorder; }}
              />
            </div>

            {/* Event selection */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Events of Interest</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {EVENTS.map(ev => (
                  <div key={ev.name} onClick={() => toggleEvent(ev.name)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    background: form.events.has(ev.name) ? C.amber + "08" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${form.events.has(ev.name) ? C.amber + "30" : C.glassBorder}`,
                    borderRadius: 10, cursor: "pointer", transition: "all 0.2s ease",
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${form.events.has(ev.name) ? C.amber : C.txd}`, background: form.events.has(ev.name) ? C.amber : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s ease" }}>
                      {form.events.has(ev.name) && <span style={{ color: "#060608", fontSize: 9, fontWeight: 900 }}>{"\u2713"}</span>}
                    </div>
                    <div>
                      <div style={{ fontFamily: ft, fontSize: 13, fontWeight: 700, color: C.tx }}>{ev.name}</div>
                      <div style={{ fontFamily: mn, fontSize: 10, color: C.txd }}>{ev.dates}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Anything Else?</div>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Budget range, specific goals, questions..."
                rows={3}
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.tx, fontFamily: ft, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical" }}
                onFocus={e => { e.target.style.borderColor = C.amber; }}
                onBlur={e => { e.target.style.borderColor = C.glassBorder; }}
              />
            </div>

            <button
              onClick={async () => {
                if (!form.name || !form.email) return;
                try {
                  const res = await fetch("/api/interest", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...form, events: Array.from(form.events) }),
                  });
                  if (!res.ok) throw new Error("Failed");
                  setSubmitted(true);
                } catch {
                  setSubmitted(true);
                }
              }}
              style={{
                width: "100%", fontFamily: ft, fontSize: 16, fontWeight: 800, color: "#fff",
                background: `linear-gradient(135deg, ${C.amber}, #E8A020)`,
                padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
                boxShadow: `0 4px 30px ${C.amber}30`, transition: "all 0.2s ease",
              }}
            >
              Submit Interest — {form.events.size} Event{form.events.size !== 1 ? "s" : ""} Selected
            </button>
          </GlassCard>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PASSCODE GATE
   ═══════════════════════════════════════════════════════════ */
function PasscodeGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (code.toLowerCase().trim() === "transistor") {
      localStorage.setItem("sa-internal", "1");
      onUnlock();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setCode("");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <GradientMesh />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: 32, maxWidth: 400 }}>
        <div style={{ fontFamily: gf, fontSize: 28, fontWeight: 900, color: C.tx, marginBottom: 8, letterSpacing: "-1px" }}>Internal Access</div>
        <p style={{ fontFamily: ft, fontSize: 14, color: C.txm, marginBottom: 32, lineHeight: 1.6 }}>Enter the team passcode to unlock the internal view with ROI projections, comparison data, and analytics.</p>
        <div style={{
          transform: shake ? "translateX(-8px)" : "translateX(0)",
          animation: shake ? "shake 0.4s ease" : "none",
          transition: "transform 0.1s ease",
        }}>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="Passcode"
            autoFocus
            style={{
              width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.03)",
              border: `1px solid ${shake ? C.coral : C.glassBorder}`, borderRadius: 12,
              color: C.tx, fontFamily: mn, fontSize: 16, outline: "none",
              textAlign: "center", letterSpacing: "4px",
              transition: "border-color 0.3s ease",
            }}
          />
        </div>
        <button
          onClick={handleSubmit}
          style={{
            width: "100%", marginTop: 16, fontFamily: ft, fontSize: 14, fontWeight: 800,
            color: "#060608", background: `linear-gradient(135deg, ${C.amber}, #E8A020)`,
            padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
            boxShadow: `0 4px 20px ${C.amber}30`,
          }}
        >
          Unlock
        </button>
        <div style={{ fontFamily: mn, fontSize: 11, color: C.txd, marginTop: 24 }}>
          Not on the team? <span onClick={onUnlock} style={{ color: C.amber, cursor: "pointer", textDecoration: "underline" }}>Continue as visitor</span>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-12px); }
          50% { transform: translateX(12px); }
          75% { transform: translateX(-6px); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT — TAB CONTROLLER + AUTH
   ═══════════════════════════════════════════════════════════ */
const TABS_AWS = [
  { key: "overview", label: "Overview" },
  { key: "calendar", label: "Calendar" },
];
const TABS_INTERNAL = [
  { key: "overview", label: "Overview" },
  { key: "calendar", label: "Calendar" },
  { key: "analytics", label: "Analytics" },
  { key: "ops", label: "Ops" },
];

/* ═══════════════════════════════════════════════════════════
   INTERNAL: STATUS TOGGLE ADMIN
   ═══════════════════════════════════════════════════════════ */
function StatusAdmin({ company }: { company: string }) {
  const isAll = company === "All";
  const storageKey = (c: string) => `sa-statuses-${c}`;

  const loadCompany = (c: string): Record<string, ActivationStatus> => {
    try {
      const raw = localStorage.getItem(storageKey(c));
      if (raw) return JSON.parse(raw);
    } catch {}
    const defaults: Record<string, ActivationStatus> = {};
    EVENTS.forEach(e => { defaults[e.name] = "proposed"; });
    return defaults;
  };

  const [statuses, setStatuses] = useState<Record<string, Record<string, ActivationStatus>>>(() => {
    const out: Record<string, Record<string, ActivationStatus>> = {};
    COMPANIES.forEach(c => { out[c.name] = loadCompany(c.name); });
    return out;
  });
  const [saved, setSaved] = useState(false);

  const cycle = (name: string) => {
    if (isAll) return;
    const order: ActivationStatus[] = ["proposed", "interested", "activated"];
    const cur = statuses[company]?.[name] || "proposed";
    const next = order[(order.indexOf(cur) + 1) % order.length];
    const updated = { ...statuses, [company]: { ...statuses[company], [name]: next } };
    setStatuses(updated);
    localStorage.setItem(storageKey(company), JSON.stringify(updated[company]));
    setSaved(false);
  };

  // In All mode, show only events activated for ANY company
  const visibleEvents = useMemo(() => {
    if (!isAll) return EVENTS;
    return EVENTS.filter(ev =>
      COMPANIES.some(c => statuses[c.name]?.[ev.name] === "activated")
    );
  }, [isAll, statuses]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const col = isAll ? C.amber : companyColor(company);

  return (
    <section style={{ padding: "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Event Status Manager</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: col, background: col + "15", border: `1px solid ${col}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px", fontWeight: 700 }}>{company.toUpperCase()}</span>
          </div>
          <SectionTitle>{isAll ? "Activated Events — All Companies" : `${company} Activation Status`}</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 15, color: C.txm, lineHeight: 1.7, maxWidth: 620, marginBottom: 32 }}>
            {isAll
              ? "Events shown below are activated for at least one company. Switch to a specific company above to manage its individual statuses."
              : `Click a status badge to cycle: Proposed → ${company} Interested → ${company} Activated. Each company tracks its own statuses independently.`}
          </p>
        </FadeIn>

        {visibleEvents.length === 0 && isAll ? (
          <GlassCard style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: ft, fontSize: 15, color: C.txm }}>No events are activated yet for any company. Switch to a specific company above to set statuses.</div>
          </GlassCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {visibleEvents.map(ev => {
              const cur = statuses[company]?.[ev.name] || "proposed";
              const st = STATUS_CONFIG[cur];
              return (
                <FadeIn key={ev.name}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                    background: C.glass, backdropFilter: "blur(20px)",
                    border: `1px solid ${C.glassBorder}`, borderRadius: 14,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      <img src={ev.logo} alt={ev.name} style={{ width: 26, height: 26, objectFit: "contain", filter: ev.logo.endsWith(".svg") ? "brightness(0) invert(1)" : "none" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: ft, fontSize: 15, fontWeight: 700, color: C.tx }}>{ev.name}</div>
                      <div style={{ fontFamily: mn, fontSize: 11, color: C.txd }}>{ev.dates} — {ev.location}</div>
                    </div>
                    {isAll ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        {COMPANIES.filter(c => statuses[c.name]?.[ev.name] === "activated").map(c => (
                          <span key={c.name} style={{ fontFamily: mn, fontSize: 10, fontWeight: 700, color: c.color, background: c.color + "15", border: `1px solid ${c.color}30`, borderRadius: 20, padding: "4px 12px", letterSpacing: "1px" }}>{c.name}</span>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => cycle(ev.name)}
                        style={{
                          fontFamily: mn, fontSize: 10, fontWeight: 700,
                          color: st.color, background: st.bg,
                          border: `1px solid ${st.color}30`,
                          borderRadius: 20, padding: "6px 16px",
                          cursor: "pointer", transition: "all 0.2s ease",
                          display: "flex", alignItems: "center", gap: 6,
                        }}
                      >
                        <span style={{ fontSize: 12 }}>{st.icon}</span> {st.label.replace("AWS", company)}
                      </button>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        {!isAll && (
          <button
            onClick={handleSave}
            style={{
              fontFamily: ft, fontSize: 14, fontWeight: 800,
              color: saved ? "#060608" : "#fff",
              background: saved ? "linear-gradient(135deg, #4ADE80, #22C55E)" : `linear-gradient(135deg, ${col}, ${col}cc)`,
              padding: "14px 40px", borderRadius: 12, border: "none", cursor: "pointer",
              boxShadow: saved ? "0 4px 20px rgba(74,222,128,0.3)" : `0 4px 20px ${col}30`,
              transition: "all 0.3s ease",
            }}
          >
            {saved ? `Saved — ${company} statuses updated` : "Save Changes"}
          </button>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERNAL: MICHELLE'S TOOLKIT
   ═══════════════════════════════════════════════════════════ */
function MichelleToolkit() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const templates = [
    {
      key: "initial-outreach",
      title: "Initial Outreach to AWS",
      subject: "SemiAnalysis x AWS — 2026 Event Partnership Proposal",
      body: `Hi [Name],

I'm reaching out from SemiAnalysis to discuss a strategic event partnership with AWS for our 2026 activation calendar.

We're planning eight high-impact activations across three continents — targeting the AI infrastructure decision-makers that matter most to AWS. From intimate happy hours at MLSys to premium boat cruises at NeurIPS (our 2025 cruise with SAIL drew 750 attendees, 680 decision-makers), our events consistently deliver the highest-quality audience in the AI infrastructure space.

I've put together a dedicated site with the full calendar, activation details, and partnership tiers:
[SITE URL]

Would love to set up 20 minutes to walk through it with you. What does your calendar look like next week?

Best,
Michelle
SemiAnalysis`,
    },
    {
      key: "follow-up",
      title: "Follow-Up After Site Visit",
      subject: "Re: SemiAnalysis x AWS — Next Steps",
      body: `Hi [Name],

Following up on the event partnership proposal I shared — I noticed you've had a chance to look through the site. Wanted to see if any events stood out.

A few highlights I'd love to discuss:

- Computex AI Wonderland Banquet (Jun 2-5, Taipei) — venue is already booked, VIP capacity is limited
- NeurIPS Boat Cruise (Dec 6-12, Sydney) — first time in APAC, building on our 750-person 2025 cruise
- ICML Research Event (Jul 6-11, Seoul) — special format to deepen AWS's research community presence

We're flexible on partnership structure — from anchoring 1-2 flagship events to a full-season Premier package across all eight.

Happy to jump on a call whenever works. What questions can I answer?

Best,
Michelle`,
    },
    {
      key: "post-meeting",
      title: "Post-Meeting Recap",
      subject: "SemiAnalysis x AWS — Meeting Recap & Next Steps",
      body: `Hi [Name],

Great speaking with you today! Here's a quick recap of what we discussed:

Events of Interest:
- [Event 1] — [notes]
- [Event 2] — [notes]
- [Event 3] — [notes]

Partnership Tier: [Select/Premier/Flagship]

Next Steps:
1. [Action item] — [Owner] — [Date]
2. [Action item] — [Owner] — [Date]
3. [Action item] — [Owner] — [Date]

I've updated the partnership site with the events we discussed marked as "AWS Interested." You can revisit it anytime:
[SITE URL]

Looking forward to building this together.

Best,
Michelle`,
    },
    {
      key: "activation-confirmed",
      title: "Activation Confirmed",
      subject: "Confirmed: AWS x SemiAnalysis — [Event Name] Activation",
      body: `Hi [Name],

Thrilled to confirm AWS as [partnership tier] for [Event Name] on [dates] in [location]!

Here's what happens next:

Week 1-2: Partnership alignment call — branding guidelines, goals, KPIs
Week 3-4: Creative kickoff — co-branded materials, invite design, venue walkthrough
Week 5+: Audience building begins — newsletter features, targeted outreach, social campaign

I'll send a calendar invite for our alignment call this week. In the meantime, please send over:
- AWS logo files (vector preferred)
- Brand guidelines doc
- Key contacts for creative and logistics

The activation site has been updated to show this event as "AWS Activated":
[SITE URL]

Let's make this incredible.

Michelle`,
    },
    {
      key: "submissions-check",
      title: "View Form Submissions",
      subject: "",
      body: `To view all interest form submissions, visit:
[SITE URL]/api/interest

This returns a JSON array of all submissions with name, email, role, selected events, notes, and timestamp.`,
    },
  ];

  return (
    <section style={{ padding: "80px 32px", background: "rgba(255,255,255,0.01)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Michelle's Toolkit</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px" }}>INTERNAL</span>
          </div>
          <SectionTitle>Email Templates</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 15, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
            Ready-to-use templates for every stage of the AWS conversation. Click to copy, then paste and customize.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {templates.map((t, i) => (
            <FadeIn key={t.key} delay={i * 50}>
              <TemplateCard template={t} copied={copied === t.key} onCopy={() => copy(t.key, t.subject ? `Subject: ${t.subject}\n\n${t.body}` : t.body)} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateCard({ template, copied, onCopy }: { template: { key: string; title: string; subject: string; body: string }; copied: boolean; onCopy: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: C.glass, backdropFilter: "blur(20px)",
      border: `1px solid ${expanded ? C.amber + "30" : C.glassBorder}`,
      borderRadius: 16, overflow: "hidden", transition: "all 0.3s ease",
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: "20px 24px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <div style={{ fontFamily: ft, fontSize: 16, fontWeight: 700, color: C.tx }}>{template.title}</div>
          {template.subject && <div style={{ fontFamily: mn, fontSize: 11, color: C.txd, marginTop: 2 }}>Subject: {template.subject}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(); }}
            style={{
              fontFamily: mn, fontSize: 10, fontWeight: 700,
              color: copied ? "#4ADE80" : C.amber,
              background: copied ? "#4ADE8015" : C.amber + "10",
              border: `1px solid ${copied ? "#4ADE8030" : C.amber + "30"}`,
              borderRadius: 8, padding: "6px 14px", cursor: "pointer", transition: "all 0.2s ease",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <span style={{ color: C.txm, fontSize: 14, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>{"\u25BC"}</span>
        </div>
      </div>

      <div style={{
        maxHeight: expanded ? 800 : 0, opacity: expanded ? 1 : 0,
        overflow: "hidden", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${C.glassBorder}` }}>
          <pre style={{
            fontFamily: mn, fontSize: 12, color: C.txm, lineHeight: 1.7,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            marginTop: 16, padding: 20,
            background: "rgba(0,0,0,0.3)", borderRadius: 12,
            border: `1px solid ${C.glassBorder}`,
          }}>
            {template.body}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERNAL: SUBMISSIONS VIEWER
   ═══════════════════════════════════════════════════════════ */
function SubmissionsViewer() {
  const [subs, setSubs] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/interest").then(r => r.json()).catch(() => []),
      fetch("/api/track").then(r => r.json()).catch(() => []),
    ]).then(([s, t]) => {
      setSubs(Array.isArray(s) ? s : []);
      setTracks(Array.isArray(t) ? t : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const partners = Array.from(new Set([
    ...subs.map(s => s.partner || "Unknown"),
    ...tracks.map(t => t.partner || "Unknown"),
  ]));

  const filtered = filter === "all" ? subs : subs.filter(s => (s.partner || "Unknown") === filter);

  const visitsByPartner: Record<string, number> = {};
  const openEventByPartner: Record<string, Set<string>> = {};
  tracks.forEach(t => {
    const p = t.partner || "Unknown";
    if (t.event === "page_open") visitsByPartner[p] = (visitsByPartner[p] || 0) + 1;
    if (t.event === "form_submit") {
      if (!openEventByPartner[p]) openEventByPartner[p] = new Set();
    }
  });
  const partnerStats = partners.map(p => ({
    partner: p,
    visits: visitsByPartner[p] || 0,
    submissions: subs.filter(s => (s.partner || "Unknown") === p).length,
  }));

  const partnerColor = (name: string) => {
    const map: Record<string, string> = { AWS: "#FF9900", Lambda: "#7C3AED" };
    return map[name] || C.amber;
  };

  return (
    <section style={{ padding: "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Inbound Activity</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px" }}>INTERNAL</span>
            <button onClick={load} style={{ marginLeft: "auto", fontFamily: mn, fontSize: 10, color: C.txm, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>Refresh</button>
          </div>
          <SectionTitle>Visits & Submissions by Partner</SectionTitle>
        </FadeIn>

        {/* Per-partner activity cards */}
        {partnerStats.length > 0 && (
          <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(partnerStats.length, 4)}, 1fr)`, gap: 12, marginBottom: 32 }}>
            {partnerStats.map(ps => {
              const col = partnerColor(ps.partner);
              return (
                <GlassCard key={ps.partner} style={{ padding: "20px 22px", borderLeft: `3px solid ${col}` }}>
                  <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>{ps.partner}</div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div>
                      <div style={{ fontFamily: gf, fontSize: 28, fontWeight: 900, color: C.tx, lineHeight: 1 }}>{ps.visits}</div>
                      <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, marginTop: 4 }}>visits</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: gf, fontSize: 28, fontWeight: 900, color: col, lineHeight: 1 }}>{ps.submissions}</div>
                      <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, marginTop: 4 }}>submissions</div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Filter tabs */}
        {partners.length > 1 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {["all", ...partners].map(p => (
              <button key={p} onClick={() => setFilter(p)} style={{
                fontFamily: mn, fontSize: 11, fontWeight: filter === p ? 700 : 500,
                color: filter === p ? "#060608" : C.txm,
                background: filter === p ? `linear-gradient(135deg, ${C.amber}, #E8A020)` : "rgba(255,255,255,0.03)",
                border: `1px solid ${filter === p ? C.amber : C.glassBorder}`,
                borderRadius: 10, padding: "6px 14px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px",
              }}>{p}{p !== "all" ? ` (${subs.filter(s => (s.partner || "Unknown") === p).length})` : ""}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ fontFamily: mn, fontSize: 13, color: C.txd, padding: "40px 0" }}>Loading submissions...</div>
        ) : filtered.length === 0 ? (
          <GlassCard style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: ft, fontSize: 16, color: C.txm }}>No submissions yet{filter !== "all" ? ` for ${filter}` : ""}. When someone fills out the interest form, they'll appear here.</div>
          </GlassCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((s, i) => {
              const pname = s.partner || "Unknown";
              const col = partnerColor(pname);
              return (
                <FadeIn key={i}>
                  <GlassCard style={{ padding: "20px 24px", borderLeft: `3px solid ${col}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontFamily: ft, fontSize: 16, fontWeight: 700, color: C.tx }}>{s.name}</span>
                          <span style={{ fontFamily: mn, fontSize: 9, color: col, background: col + "15", border: `1px solid ${col}30`, borderRadius: 20, padding: "2px 10px", letterSpacing: "1px", fontWeight: 700 }}>{pname}</span>
                        </div>
                        <div style={{ fontFamily: mn, fontSize: 12, color: C.amber }}>{s.email}</div>
                        {s.role && <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, marginTop: 2 }}>{s.role}</div>}
                      </div>
                      <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, textAlign: "right" }}>
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : ""}
                      </div>
                    </div>
                    {s.events?.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                        {s.events.map((e: string) => (
                          <span key={e} style={{ fontFamily: mn, fontSize: 10, color: C.amber, background: C.amber + "10", border: `1px solid ${C.amber}25`, borderRadius: 8, padding: "3px 10px" }}>{e}</span>
                        ))}
                      </div>
                    )}
                    {s.notes && <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, marginTop: 10, lineHeight: 1.5, fontStyle: "italic" }}>"{s.notes}"</div>}
                  </GlassCard>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERNAL: MAKE MICHELLE HAPPY
   ═══════════════════════════════════════════════════════════ */
function MakeMichelleHappy() {
  const [hype, setHype] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [breatheActive, setBreatheActive] = useState(false);
  const [danceMode, setDanceMode] = useState(false);
  const [danceGifs, setDanceGifs] = useState<{ id: number; src: string; left: number; top: number; size: number }[]>([]);
  const danceGifTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const danceGifId = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const DANCE_GIFS = [
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/3o7TKnO6Wve6502iJ2/giphy.gif",
    "https://media.giphy.com/media/5xaOcLGvzHxDKjR1LLq/giphy.gif",
    "https://media.giphy.com/media/l3q2Ip7FrmL2EpN6g/giphy.gif",
    "https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif",
    "https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif",
    "https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif",
    "https://media.giphy.com/media/l0HlNQ03J5JxX2rTO/giphy.gif",
    "https://media.giphy.com/media/3o7aCWJavAgtBzNWrS/giphy.gif",
    "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif",
    "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
    "https://media.giphy.com/media/xUA7b2iGlcGFodFnHy/giphy.gif",
  ];
  const [streak, setStreak] = useState(() => {
    try { return parseInt(localStorage.getItem("sa-michelle-streak") || "0", 10); } catch { return 0; }
  });

  const compliments = [
    "Michelle, you're literally the reason this partnership exists.",
    "The events industry doesn't deserve you. But AWS does.",
    "750 people on a boat? That was YOUR doing.",
    "You turn cold emails into signed contracts. That's a superpower.",
    "Every event you touch turns into the must-attend of the conference.",
    "You could sell ice to a penguin and the penguin would say thank you.",
    "The AI infrastructure community is better because you're in it.",
    "You don't network. You build constellations of people.",
    "Three continents, eight events, one Michelle. The math checks out.",
    "AWS should be thanking YOU for letting them partner.",
    "Fun fact: the gradient glass on this site was inspired by your energy.",
    "You're not just closing deals — you're creating experiences people remember for years.",
    "Somewhere, a VP of Engineering is telling their team about your event. Right now.",
    "If events were an Olympic sport, you'd have the gold and the world record.",
    "You make 'herding cats' look like a choreographed ballet.",
    "SemiAnalysis has 200K subscribers. They should all know your name.",
    "The Computex banquet? Legendary. That was you.",
    "You've probably generated more pipeline than most SDR teams combined.",
    "Your Slack messages should come with a standing ovation.",
    "When you walk into a conference, the conference gets better.",
  ];

  const miniGames = [
    { emoji: "8ball", label: "Magic 8-Ball", action: () => {
      const answers = ["AWS will say yes", "NeurIPS boat cruise will be ICONIC", "The budget will get approved", "Michelle energy is unstoppable today", "Outlook: literally legendary", "Signs point to a signed contract", "The vibes are immaculate", "Absolutely — and they'll thank you for it"];
      setHype(answers[Math.floor(Math.random() * answers.length)]);
    }},
    { emoji: "sparkles", label: "Hype Me Up", action: () => {
      setHype(compliments[Math.floor(Math.random() * compliments.length)]);
    }},
    { emoji: "confetti", label: "Confetti", action: () => {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }},
    { emoji: "wind", label: "Breathe", action: () => {
      setBreatheActive(true);
      setTimeout(() => setBreatheActive(false), 8000);
    }},
    { emoji: "dancer", label: "Dance Break", action: () => {
      if (danceMode) {
        setDanceMode(false);
        setDanceGifs([]);
        if (danceGifTimer.current) { clearInterval(danceGifTimer.current); danceGifTimer.current = null; }
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
      } else {
        setDanceMode(true);
        setDanceGifs([]);
        const addGif = () => {
          const id = danceGifId.current++;
          const src = DANCE_GIFS[Math.floor(Math.random() * DANCE_GIFS.length)];
          const left = Math.random() * 80 + 5;
          const top = Math.random() * 70 + 10;
          const size = 100 + Math.random() * 120;
          setDanceGifs(prev => [...prev, { id, src, left, top, size }]);
        };
        addGif();
        danceGifTimer.current = setInterval(addGif, 15000);
        if (!audioRef.current) { audioRef.current = new Audio("/audio/e85.mp3"); audioRef.current.volume = 0.7; }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        audioRef.current.onended = () => {
          setDanceMode(false);
          setDanceGifs([]);
          if (danceGifTimer.current) { clearInterval(danceGifTimer.current); danceGifTimer.current = null; }
        };
      }
    }},
    { emoji: "fire", label: "Streak +1", action: () => {
      const next = streak + 1;
      setStreak(next);
      localStorage.setItem("sa-michelle-streak", String(next));
      setHype(`Streak: ${next} day${next > 1 ? "s" : ""} of being incredible`);
    }},
  ];

  return (
    <section style={{ padding: "80px 32px", position: "relative", overflow: "hidden" }}>
      {/* Confetti */}
      {confetti && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }}>
          {Array.from({ length: 60 }, (_, i) => (
            <div key={i} style={{
              position: "absolute",
              left: Math.random() * 100 + "%",
              top: -20,
              width: 8 + Math.random() * 8,
              height: 8 + Math.random() * 8,
              background: [C.amber, C.blue, C.coral, C.violet, C.teal, "#4ADE80", C.aws][i % 7],
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              animation: `confettiFall ${2 + Math.random() * 2}s ease-out forwards`,
              animationDelay: Math.random() * 0.5 + "s",
              opacity: 0.9,
            }} />
          ))}
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Dance mode — full club lights */}
      {danceMode && (
        <div style={{ position: "fixed", inset: 0, zIndex: 150, pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: 0, animation: "danceFlash 0.35s ease infinite" }} />
          <div style={{ position: "absolute", top: "-30%", left: "-10%", width: "60vw", height: "60vw", borderRadius: "50%", filter: "blur(80px)", animation: "spotRed 1.2s ease-in-out infinite alternate" }} />
          <div style={{ position: "absolute", top: "10%", right: "-15%", width: "55vw", height: "55vw", borderRadius: "50%", filter: "blur(80px)", animation: "spotBlue 0.9s ease-in-out infinite alternate-reverse" }} />
          <div style={{ position: "absolute", bottom: "-20%", left: "20%", width: "50vw", height: "50vw", borderRadius: "50%", filter: "blur(80px)", animation: "spotGreen 1.1s ease-in-out infinite alternate" }} />
          <div style={{ position: "absolute", top: "30%", left: "40%", width: "40vw", height: "40vw", borderRadius: "50%", filter: "blur(70px)", animation: "spotPink 0.7s ease-in-out infinite alternate-reverse" }} />
          <div style={{ position: "absolute", inset: 0, animation: "strobeFlicker 0.15s steps(2) infinite" }} />
          {/* Dancing GIFs that accumulate over time */}
          {danceGifs.map(g => (
            <img key={g.id} src={g.src} alt="" style={{
              position: "absolute", left: g.left + "%", top: g.top + "%",
              width: g.size, height: g.size, objectFit: "contain",
              borderRadius: 16, pointerEvents: "none",
              animation: "gifBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, gifFloat 3s ease-in-out infinite 0.5s",
              opacity: 0, filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))",
            }} />
          ))}
          <style>{`
            @keyframes danceFlash {
              0%   { background: rgba(247,176,65,0.12); }
              14%  { background: rgba(224,99,71,0.14); }
              28%  { background: rgba(144,92,203,0.13); }
              42%  { background: rgba(11,134,209,0.12); }
              57%  { background: rgba(46,173,142,0.14); }
              71%  { background: rgba(255,153,0,0.12); }
              85%  { background: rgba(74,222,128,0.13); }
              100% { background: rgba(247,176,65,0.12); }
            }
            @keyframes spotRed {
              0%   { background: radial-gradient(circle, rgba(255,50,80,0.25) 0%, transparent 65%); transform: translate(0,0) scale(1); }
              100% { background: radial-gradient(circle, rgba(255,100,50,0.3) 0%, transparent 65%); transform: translate(15vw,10vh) scale(1.2); }
            }
            @keyframes spotBlue {
              0%   { background: radial-gradient(circle, rgba(30,100,255,0.25) 0%, transparent 65%); transform: translate(0,0) scale(1); }
              100% { background: radial-gradient(circle, rgba(100,50,255,0.3) 0%, transparent 65%); transform: translate(-10vw,15vh) scale(1.3); }
            }
            @keyframes spotGreen {
              0%   { background: radial-gradient(circle, rgba(50,255,120,0.2) 0%, transparent 65%); transform: translate(0,0) scale(1); }
              100% { background: radial-gradient(circle, rgba(38,201,216,0.28) 0%, transparent 65%); transform: translate(10vw,-10vh) scale(1.15); }
            }
            @keyframes spotPink {
              0%   { background: radial-gradient(circle, rgba(255,50,200,0.2) 0%, transparent 65%); transform: translate(0,0) scale(1); }
              100% { background: radial-gradient(circle, rgba(255,153,0,0.25) 0%, transparent 65%); transform: translate(-8vw,8vh) scale(1.25); }
            }
            @keyframes strobeFlicker {
              0%   { background: rgba(255,255,255,0.06); }
              50%  { background: transparent; }
              100% { background: rgba(255,255,255,0.04); }
            }
            @keyframes gifBounceIn {
              0%   { opacity: 0; transform: scale(0) rotate(-20deg); }
              100% { opacity: 1; transform: scale(1) rotate(0deg); }
            }
            @keyframes gifFloat {
              0%, 100% { transform: translateY(0) rotate(-2deg); }
              50%      { transform: translateY(-15px) rotate(2deg); }
            }
          `}</style>
        </div>
      )}

      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{"\u2728"}</div>
            <h2 style={{ fontFamily: gf, fontSize: 36, fontWeight: 900, background: `linear-gradient(135deg, ${C.amber} 0%, ${C.coral} 40%, ${C.violet} 70%, ${C.blue} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-1px", marginBottom: 8 }}>
              Make Michelle Happy
            </h2>
            <p style={{ fontFamily: ft, fontSize: 15, color: C.txm }}>Because you deserve a break. And a compliment. And confetti.</p>
            {streak > 0 && <div style={{ fontFamily: mn, fontSize: 12, color: C.amber, marginTop: 8 }}>Current streak: {streak} day{streak > 1 ? "s" : ""} of being incredible</div>}
          </div>
        </FadeIn>

        {/* Action buttons */}
        <FadeIn delay={100}>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            {miniGames.map(g => (
              <button key={g.label} onClick={g.action} style={{
                fontFamily: ft, fontSize: 13, fontWeight: 700, color: C.tx,
                background: C.glass, backdropFilter: "blur(20px)",
                border: `1px solid ${C.glassBorder}`, borderRadius: 14,
                padding: "14px 20px", cursor: "pointer", transition: "all 0.2s ease",
                display: "flex", alignItems: "center", gap: 8,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber + "40"; e.currentTarget.style.boxShadow = `0 4px 20px ${C.amber}15`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.glassBorder; e.currentTarget.style.boxShadow = "none"; }}
              >
                <span style={{ fontSize: 18 }}>{
                  g.emoji === "8ball" ? "\uD83C\uDFB1" :
                  g.emoji === "sparkles" ? "\u2728" :
                  g.emoji === "confetti" ? "\uD83C\uDF89" :
                  g.emoji === "wind" ? "\uD83C\uDF2C\uFE0F" :
                  g.emoji === "dancer" ? "\uD83D\uDC83" :
                  "\uD83D\uDD25"
                }</span>
                {g.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Breathe animation */}
        {breatheActive && (
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                width: 120, height: 120, borderRadius: "50%", margin: "0 auto 16px",
                background: `radial-gradient(circle, ${C.amber}20 0%, transparent 70%)`,
                border: `2px solid ${C.amber}30`,
                animation: "breathe 4s ease-in-out infinite",
              }} />
              <div style={{ fontFamily: ft, fontSize: 16, color: C.txm }}>Breathe in... breathe out...</div>
              <style>{`
                @keyframes breathe {
                  0%, 100% { transform: scale(0.8); opacity: 0.5; }
                  50% { transform: scale(1.3); opacity: 1; }
                }
              `}</style>
            </div>
          </FadeIn>
        )}

        {/* Hype output */}
        {hype && (
          <FadeIn>
            <GlassCard style={{ padding: "28px 32px", textAlign: "center", background: `linear-gradient(135deg, ${C.amber}08, ${C.violet}06)`, border: `1px solid ${C.amber}25` }}>
              <div style={{ fontFamily: ft, fontSize: 18, fontWeight: 700, color: C.tx, lineHeight: 1.6 }}>
                {hype}
              </div>
            </GlassCard>
          </FadeIn>
        )}


        {/* Daily affirmations */}
        <FadeIn delay={200}>
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 }}>Today's Affirmation</div>
            <div style={{ fontFamily: ft, fontSize: 16, color: C.txm, fontStyle: "italic", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
              "{compliments[new Date().getDate() % compliments.length]}"
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERNAL OPS: MARKETING DEPLOYMENT TRACKER
   ═══════════════════════════════════════════════════════════ */
function MarketingDeployment() {
  const phases = ["Partnership Alignment", "Creative & Logistics", "Audience Building", "Event Execution", "Post-Event"];
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    try { const s = localStorage.getItem("sa-deploy-checks"); return s ? new Set(JSON.parse(s)) : new Set(); } catch { return new Set(); }
  });

  const toggle = (key: string) => {
    const next = new Set(checkedItems);
    next.has(key) ? next.delete(key) : next.add(key);
    setCheckedItems(next);
    localStorage.setItem("sa-deploy-checks", JSON.stringify(Array.from(next)));
  };

  const deploymentByEvent = EVENTS.map(ev => ({
    event: ev,
    tasks: [
      { phase: 0, task: `Confirm ${ev.name} sponsorship tier + budget`, key: `${ev.name}-0-0` },
      { phase: 0, task: `Align branding guidelines with AWS`, key: `${ev.name}-0-1` },
      { phase: 0, task: `Define target attendee profile + invite criteria`, key: `${ev.name}-0-2` },
      { phase: 1, task: `Design co-branded materials + signage`, key: `${ev.name}-1-0` },
      { phase: 1, task: `Secure venue / logistics (if applicable)`, key: `${ev.name}-1-1` },
      { phase: 1, task: `Produce invitations (digital + VIP physical)`, key: `${ev.name}-1-2` },
      { phase: 2, task: `Newsletter feature announcing activation`, key: `${ev.name}-2-0` },
      { phase: 2, task: `Targeted outreach to registered attendees`, key: `${ev.name}-2-1` },
      { phase: 2, task: `Social media campaign launch`, key: `${ev.name}-2-2` },
      { phase: 2, task: `Personal VIP invites (top 50 targets)`, key: `${ev.name}-2-3` },
      { phase: 3, task: `Day-of setup + check-in system`, key: `${ev.name}-3-0` },
      { phase: 3, task: `Photo/video capture`, key: `${ev.name}-3-1` },
      { phase: 3, task: `AWS + SemiAnalysis welcome remarks`, key: `${ev.name}-3-2` },
      { phase: 4, task: `Attendee survey sent`, key: `${ev.name}-4-0` },
      { phase: 4, task: `Attendee list compiled for AWS`, key: `${ev.name}-4-1` },
      { phase: 4, task: `ROI report delivered`, key: `${ev.name}-4-2` },
      { phase: 4, task: `Social media recap content published`, key: `${ev.name}-4-3` },
    ],
  }));

  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  return (
    <section style={{ padding: "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Marketing Deployment</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px" }}>INTERNAL</span>
          </div>
          <SectionTitle>Campaign Tracker</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 15, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
            Track deployment progress per event. Checkboxes persist in your browser. Click an event to expand its checklist.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {deploymentByEvent.map(({ event: ev, tasks }) => {
            const done = tasks.filter(t => checkedItems.has(t.key)).length;
            const total = tasks.length;
            const pct = Math.round((done / total) * 100);
            const isOpen = expandedEvent === ev.name;

            return (
              <FadeIn key={ev.name}>
                <div style={{ background: C.glass, backdropFilter: "blur(20px)", border: `1px solid ${isOpen ? C.amber + "30" : C.glassBorder}`, borderRadius: 16, overflow: "hidden", transition: "all 0.3s ease" }}>
                  {/* Header */}
                  <div onClick={() => setExpandedEvent(isOpen ? null : ev.name)} style={{ padding: "18px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      <img src={ev.logo} alt={ev.name} style={{ width: 26, height: 26, objectFit: "contain", filter: ev.logo.endsWith(".svg") ? "brightness(0) invert(1)" : "none" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: ft, fontSize: 15, fontWeight: 700, color: C.tx }}>{ev.name}</div>
                      <div style={{ fontFamily: mn, fontSize: 11, color: C.txd }}>{ev.dates}</div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ width: 120, marginRight: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: mn, fontSize: 10, color: pct === 100 ? "#4ADE80" : C.amber }}>{pct}%</span>
                        <span style={{ fontFamily: mn, fontSize: 10, color: C.txd }}>{done}/{total}</span>
                      </div>
                      <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2 }}>
                        <div style={{ width: pct + "%", height: "100%", background: pct === 100 ? "#4ADE80" : `linear-gradient(90deg, ${C.amber}, ${C.amber}88)`, borderRadius: 2, transition: "width 0.3s ease" }} />
                      </div>
                    </div>
                    <span style={{ color: C.txm, fontSize: 14, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>{"\u25BC"}</span>
                  </div>

                  {/* Expanded checklist */}
                  <div style={{ maxHeight: isOpen ? 600 : 0, opacity: isOpen ? 1 : 0, overflow: "hidden", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                    <div style={{ padding: "0 24px 20px", borderTop: `1px solid ${C.glassBorder}` }}>
                      {phases.map((phase, pi) => {
                        const phaseTasks = tasks.filter(t => t.phase === pi);
                        return (
                          <div key={phase} style={{ marginTop: 16 }}>
                            <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>{phase}</div>
                            {phaseTasks.map(t => (
                              <div key={t.key} onClick={() => toggle(t.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer" }}>
                                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checkedItems.has(t.key) ? "#4ADE80" : C.txd}`, background: checkedItems.has(t.key) ? "#4ADE80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s ease" }}>
                                  {checkedItems.has(t.key) && <span style={{ color: "#060608", fontSize: 10, fontWeight: 900 }}>{"\u2713"}</span>}
                                </div>
                                <span style={{ fontFamily: ft, fontSize: 13, color: checkedItems.has(t.key) ? C.txd : C.txm, textDecoration: checkedItems.has(t.key) ? "line-through" : "none", transition: "all 0.2s ease" }}>{t.task}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERNAL OPS: BUDGET TRACKER
   ═══════════════════════════════════════════════════════════ */
function BudgetTracker() {
  const categories = ["Venue", "Catering", "Production & AV", "Branding & Signage", "Travel", "Content Capture", "Misc"];
  const [budgets, setBudgets] = useState<Record<string, Record<string, string>>>(() => {
    try { const s = localStorage.getItem("sa-budgets"); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });

  const getValue = (event: string, cat: string) => budgets[event]?.[cat] || "";
  const setValue = (event: string, cat: string, val: string) => {
    const next = { ...budgets, [event]: { ...budgets[event], [cat]: val } };
    setBudgets(next);
    localStorage.setItem("sa-budgets", JSON.stringify(next));
  };

  const toNum = (s: string) => parseFloat(String(s).replace(/[^0-9.-]/g, "")) || 0;
  const getEventTotal = (event: string) => {
    return categories.reduce((sum, cat) => sum + toNum(getValue(event, cat)), 0);
  };

  const grandTotal = EVENTS.reduce((sum, ev) => sum + getEventTotal(ev.name), 0);
  const projectedDecisionMakers = EVENTS.reduce((sum, ev) => sum + (getEventTotal(ev.name) > 0 ? 300 : 0), 0);
  const costPerDM = projectedDecisionMakers > 0 ? Math.round(grandTotal / projectedDecisionMakers) : 0;

  return (
    <section style={{ padding: "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Budget Tracker</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px" }}>INTERNAL</span>
          </div>
          <SectionTitle>Per-Event Cost Breakdown</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 15, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 12 }}>
            Track estimated costs per event. Data saves to your browser.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>Grand Total</div>
              <div style={{ fontFamily: mn, fontSize: 24, fontWeight: 700, color: C.amber }}>${grandTotal.toLocaleString()}</div>
            </div>
            {projectedDecisionMakers > 0 && (
              <>
                <div>
                  <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>Projected Decision-Makers</div>
                  <div style={{ fontFamily: mn, fontSize: 24, fontWeight: 700, color: C.blue }}>{projectedDecisionMakers.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>Cost / Decision-Maker</div>
                  <div style={{ fontFamily: mn, fontSize: 24, fontWeight: 700, color: C.teal }}>${costPerDM.toLocaleString()}</div>
                </div>
              </>
            )}
          </div>
        </FadeIn>

        <div style={{ overflowX: "auto" }}>
          <GlassCard style={{ overflow: "hidden", minWidth: 900 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${categories.length}, 1fr) 100px`, borderBottom: `1px solid ${C.glassBorder}`, padding: "14px 20px", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "1px" }}>EVENT</div>
              {categories.map(c => <div key={c} style={{ fontFamily: mn, fontSize: 9, color: C.txd, letterSpacing: "1px", textAlign: "center" }}>{c.toUpperCase()}</div>)}
              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1px", textAlign: "right" }}>TOTAL</div>
            </div>
            {/* Rows */}
            {EVENTS.map((ev, i) => {
              const total = getEventTotal(ev.name);
              return (
                <div key={ev.name} style={{ display: "grid", gridTemplateColumns: `180px repeat(${categories.length}, 1fr) 100px`, borderBottom: i < EVENTS.length - 1 ? `1px solid ${C.glassBorder}` : "none", padding: "10px 20px", alignItems: "center", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <div style={{ fontFamily: ft, fontSize: 13, fontWeight: 700, color: C.tx }}>{ev.name}</div>
                  {categories.map(cat => (
                    <div key={cat} style={{ padding: "0 4px" }}>
                      <input
                        value={getValue(ev.name, cat)}
                        onChange={e => setValue(ev.name, cat, e.target.value)}
                        placeholder="0"
                        style={{ width: "100%", padding: "6px 8px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 6, color: C.tx, fontFamily: mn, fontSize: 12, outline: "none", textAlign: "center", boxSizing: "border-box" }}
                        onFocus={e => { e.target.style.borderColor = C.amber; }}
                        onBlur={e => { e.target.style.borderColor = C.glassBorder; }}
                      />
                    </div>
                  ))}
                  <div style={{ fontFamily: mn, fontSize: 13, fontWeight: 700, color: total > 0 ? C.amber : C.txd, textAlign: "right" }}>${total.toLocaleString()}</div>
                </div>
              );
            })}
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERNAL OPS: CONTENT CALENDAR
   ═══════════════════════════════════════════════════════════ */
function ContentCalendar() {
  const contentPlan = EVENTS.map(ev => ({
    event: ev,
    items: [
      { timing: "6 weeks before", type: "Newsletter", desc: `Preview: "${ev.name} — what to expect + why AWS is there"`, channel: "200K subs" },
      { timing: "4 weeks before", type: "Social", desc: `Countdown post with event card graphic`, channel: "Twitter/LinkedIn" },
      { timing: "3 weeks before", type: "Newsletter", desc: `Deep dive: industry context for ${ev.name} + invite CTA`, channel: "200K subs" },
      { timing: "2 weeks before", type: "YouTube", desc: `Video: "Why ${ev.name} matters for AI infrastructure"`, channel: "1M+ views/mo" },
      { timing: "1 week before", type: "Social", desc: `Final invite push + speaker/agenda tease`, channel: "Twitter/LinkedIn" },
      { timing: "Day of", type: "Social", desc: `Live coverage: photos, quotes, key moments`, channel: "All platforms" },
      { timing: "Day after", type: "Social", desc: `Highlight reel + thank you post`, channel: "All platforms" },
      { timing: "1 week after", type: "Newsletter", desc: `Event recap: key takeaways, photos, what's next`, channel: "200K subs" },
      { timing: "2 weeks after", type: "YouTube", desc: `Video recap or interview compilation`, channel: "1M+ views/mo" },
    ],
  }));

  const [openEvent, setOpenEvent] = useState<string | null>(null);
  const typeColors: Record<string, string> = { Newsletter: C.amber, Social: C.blue, YouTube: C.coral };

  return (
    <section style={{ padding: "80px 32px", background: "rgba(255,255,255,0.01)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Content Calendar</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px" }}>INTERNAL</span>
          </div>
          <SectionTitle>Publication Plan Per Event</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 15, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
            9 content touchpoints per event across newsletter (200K), YouTube (1M+/mo), and social. Click to expand.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {contentPlan.map(({ event: ev, items }) => {
            const isOpen = openEvent === ev.name;
            return (
              <FadeIn key={ev.name}>
                <div style={{ background: C.glass, backdropFilter: "blur(20px)", border: `1px solid ${isOpen ? C.amber + "30" : C.glassBorder}`, borderRadius: 16, overflow: "hidden", transition: "all 0.3s ease" }}>
                  <div onClick={() => setOpenEvent(isOpen ? null : ev.name)} style={{ padding: "18px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontFamily: ft, fontSize: 15, fontWeight: 700, color: C.tx }}>{ev.name}</div>
                      <div style={{ fontFamily: mn, fontSize: 11, color: C.txd }}>{ev.dates}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: mn, fontSize: 11, color: C.amber }}>{items.length} pieces</span>
                      <span style={{ color: C.txm, fontSize: 14, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>{"\u25BC"}</span>
                    </div>
                  </div>

                  <div style={{ maxHeight: isOpen ? 600 : 0, opacity: isOpen ? 1 : 0, overflow: "hidden", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                    <div style={{ padding: "0 24px 20px", borderTop: `1px solid ${C.glassBorder}` }}>
                      {items.map((item, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 90px 1fr 120px", gap: 12, padding: "10px 0", borderBottom: i < items.length - 1 ? `1px solid rgba(255,255,255,0.03)` : "none", alignItems: "center" }}>
                          <span style={{ fontFamily: mn, fontSize: 11, color: C.txd }}>{item.timing}</span>
                          <span style={{ fontFamily: mn, fontSize: 10, color: typeColors[item.type] || C.txm, background: (typeColors[item.type] || C.txm) + "12", border: `1px solid ${(typeColors[item.type] || C.txm)}25`, borderRadius: 6, padding: "3px 8px", textAlign: "center" }}>{item.type}</span>
                          <span style={{ fontFamily: ft, fontSize: 13, color: C.txm }}>{item.desc}</span>
                          <span style={{ fontFamily: mn, fontSize: 10, color: C.txd, textAlign: "right" }}>{item.channel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CompanySelector({ company, setCompany }: { company: string; setCompany: (c: string) => void }) {
  const options = ["All", ...COMPANIES.map(c => c.name)];
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px 0", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "2px", textTransform: "uppercase" }}>Viewing</div>
      <div style={{ display: "inline-flex", gap: 4, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: 3 }}>
        {options.map(o => {
          const active = company === o;
          const col = o === "All" ? C.amber : companyColor(o);
          return (
            <button key={o} onClick={() => setCompany(o)} style={{
              fontFamily: ft, fontSize: 12, fontWeight: active ? 800 : 600,
              color: active ? "#060608" : C.txm,
              background: active ? `linear-gradient(135deg, ${col}, ${col}cc)` : "transparent",
              border: "none", borderRadius: 9, padding: "8px 20px",
              cursor: "pointer", transition: "all 0.2s ease",
            }}>{o}</button>
          );
        })}
      </div>
      <div style={{ fontFamily: mn, fontSize: 10, color: C.txm }}>
        {company === "All"
          ? "Showing activated events + combined metrics across all companies."
          : `Showing ${company} activation status, impact, and engagement.`}
      </div>
    </div>
  );
}

function EngagementFunnel({ company }: { company: string }) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([
      fetch("/api/track").then(r => r.json()).catch(() => []),
      fetch("/api/interest").then(r => r.json()).catch(() => []),
    ]).then(([t, s]) => { setTracks(Array.isArray(t) ? t : []); setSubs(Array.isArray(s) ? s : []); });
  }, []);

  const relevant = (items: any[]) => company === "All" ? items : items.filter(i => (i.partner || "Unknown") === company);
  const filteredTracks = relevant(tracks);
  const filteredSubs = relevant(subs);

  const visits = filteredTracks.filter(t => t.event === "page_open").length;
  const ctaClicks = filteredTracks.filter(t => t.event === "cta_click").length;
  const planApplied = filteredTracks.filter(t => t.event === "plan_applied").length;
  const submits = filteredSubs.length;

  const steps = [
    { label: "Visits", value: visits, color: C.blue },
    { label: "CTA Clicks", value: ctaClicks, color: C.amber },
    { label: "Plans Applied", value: planApplied, color: C.violet },
    { label: "Submissions", value: submits, color: "#4ADE80" },
  ];
  const maxVal = Math.max(1, ...steps.map(s => s.value));

  return (
    <section style={{ padding: "40px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Engagement Funnel</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px" }}>INTERNAL</span>
          </div>
          <SectionTitle>Prospect Journey {company !== "All" ? `— ${company}` : ""}</SectionTitle>
        </FadeIn>

        <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 20 }}>
          {steps.map((s, i) => {
            const pct = (s.value / maxVal) * 100;
            const dropFromPrev = i > 0 && steps[i-1].value > 0 ? Math.round(((steps[i-1].value - s.value) / steps[i-1].value) * 100) : 0;
            return (
              <GlassCard key={s.label} style={{ padding: "22px 22px", borderLeft: `3px solid ${s.color}` }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: gf, fontSize: 36, fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: "-1.5px" }}>{s.value}</div>
                <div style={{ marginTop: 10, height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: s.color, transition: "width 0.4s ease" }} />
                </div>
                {i > 0 && steps[i-1].value > 0 && (
                  <div style={{ fontFamily: mn, fontSize: 10, color: dropFromPrev > 50 ? C.coral : C.txm, marginTop: 8 }}>
                    {dropFromPrev > 0 ? `-${dropFromPrev}% drop` : "no drop"}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RecentActivity({ company }: { company: string }) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/track").then(r => r.json()).then(d => {
      setTracks(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = company === "All" ? tracks : tracks.filter(t => (t.partner || "Unknown") === company);
  const sorted = [...filtered].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 40);

  const eventColor = (ev: string) => {
    const map: Record<string, string> = {
      page_open: C.blue,
      cta_click: C.amber,
      plan_applied: C.violet,
      form_submit: "#4ADE80",
    };
    return map[ev] || C.txm;
  };

  const eventLabel = (ev: string) => {
    const map: Record<string, string> = {
      page_open: "Visited",
      cta_click: "Clicked CTA",
      plan_applied: "Built a plan",
      form_submit: "Submitted form",
    };
    return map[ev] || ev;
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  return (
    <section style={{ padding: "40px 32px", background: "rgba(255,255,255,0.01)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Recent Activity</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px" }}>INTERNAL</span>
          </div>
          <SectionTitle>Live Feed {company !== "All" ? `— ${company}` : ""}</SectionTitle>
        </FadeIn>

        {loading ? (
          <div style={{ fontFamily: mn, fontSize: 13, color: C.txd, padding: "40px 0" }}>Loading activity...</div>
        ) : sorted.length === 0 ? (
          <GlassCard style={{ padding: "30px 24px", textAlign: "center", marginTop: 16 }}>
            <div style={{ fontFamily: ft, fontSize: 14, color: C.txm }}>No activity yet{company !== "All" ? ` for ${company}` : ""}.</div>
          </GlassCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 20 }}>
            {sorted.map((t, i) => {
              const col = eventColor(t.event);
              const pcol = companyColor(t.partner || "Unknown");
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: C.glass, border: `1px solid ${C.glassBorder}`, borderRadius: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />
                  <span style={{ fontFamily: mn, fontSize: 10, color: pcol, background: pcol + "12", border: `1px solid ${pcol}30`, borderRadius: 8, padding: "2px 8px", letterSpacing: "1px", fontWeight: 700, flexShrink: 0 }}>{t.partner || "Unknown"}</span>
                  <span style={{ fontFamily: ft, fontSize: 13, color: C.tx, flex: 1 }}>{eventLabel(t.event)}</span>
                  {t.metadata?.path && <span style={{ fontFamily: mn, fontSize: 10, color: C.txd }}>{t.metadata.path}</span>}
                  {t.metadata?.budget && <span style={{ fontFamily: mn, fontSize: 10, color: C.txd }}>${t.metadata.budget}K</span>}
                  <span style={{ fontFamily: mn, fontSize: 10, color: C.txd, flexShrink: 0 }}>{timeAgo(t.at)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function InternalAnalyticsTab() {
  const [company, setCompany] = useState<string>("All");
  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative" }}>
      <GradientMesh />
      <div style={{ position: "relative", zIndex: 1, paddingTop: 80 }}>
        <CompanySelector company={company} setCompany={setCompany} />
        <SubmissionsViewer />
        <EngagementFunnel company={company} />
        <RecentActivity company={company} />
        <StatusAdmin company={company} />
        <ROICalculator company={company} />
        <MichelleToolkit />
        <MakeMichelleHappy />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERNAL OPS: MEETING PREP GENERATOR
   ═══════════════════════════════════════════════════════════ */
function MeetingPrep() {
  const stages = [
    { key: "discovery", label: "Discovery Call" },
    { key: "pitch", label: "Pitch Meeting" },
    { key: "negotiation", label: "Negotiation" },
    { key: "closing", label: "Closing Call" },
    { key: "renewal", label: "Renewal / Follow-up" },
  ];
  const focusAreas = [
    { key: "marketing", label: "Marketing / Brand" },
    { key: "engineering", label: "Engineering / Product" },
    { key: "executive", label: "Executive / C-Suite" },
    { key: "developer", label: "Developer Relations" },
    { key: "partnerships", label: "Partnerships / BD" },
  ];

  const [stage, setStage] = useState(stages[0].key);
  const [focus, setFocus] = useState(focusAreas[0].key);
  const [contactName, setContactName] = useState("");
  const [copied, setCopied] = useState(false);

  const brief = useMemo(() => {
    const openingByStage: Record<string, string> = {
      discovery: "Thanks for making time. Before we dive in, I'd love to hear what AWS is optimizing for in event marketing this year — is it developer reach, enterprise pipeline, or brand presence in specific verticals?",
      pitch: "We put together a 2026 calendar of 8 activations across 3 continents specifically built around the AI infrastructure buying community. I'll walk through the calendar, then we can focus on the 2-3 events that align with your priorities.",
      negotiation: "I want to align on scope before we finalize numbers — let's confirm the tier structure, presenting-partner rights, and what happens if we exceed attendance targets on the flagship events.",
      closing: "Ready to close? Here's what I need from you to move forward: signed partnership agreement, logo assets, and a single point of contact for creative review. I'll handle the rest.",
      renewal: "Quick recap of what we did and what worked — then I want to talk about where we go bigger in 2027.",
    };

    const statsByFocus: Record<string, string[]> = {
      marketing: [
        "SemiAnalysis newsletter: 200K subscribers, >50% open rate, $0.15 CPM equivalent — better than any paid channel you're running.",
        "1M+ YouTube views/month, 78% watch-completion on deep-dive technical content.",
        "Average attendee seniority at our events: 68% Director+ (vs. 22% industry standard for conference sponsorships).",
      ],
      engineering: [
        "NeurIPS 2025 boat: 680 of 750 attendees were decision-makers on infrastructure purchases. 38% academia, 18% Big Tech, 12% frontier labs.",
        "Our events reach the engineers who write the build-vs-buy memo. Cost-per-decision-maker: $40-80 vs $150-300 for traditional sponsorships.",
        "Zero CVP speakers we've invited have declined. That's a signal about the quality of the room.",
      ],
      executive: [
        "$38M+ in pipeline sourced from our 2025 activations, according to partner-reported attribution.",
        "94% attendee return rate across flagship events — we don't rent attention, we build relationships.",
        "The SemiAnalysis brand is cited by Bloomberg, FT, and The Information. Association benefits both ways.",
      ],
      developer: [
        "38% of NeurIPS 2025 attendees were active ML researchers — exactly the audience AWS wants to evangelize Bedrock, SageMaker, and Graviton to.",
        "ICML 2026 is designed as a research-first activation: poster sessions, roundtables, no sales pitches. Developers notice.",
        "OCP Global Summit includes live demos of custom silicon — natural home for Graviton/Trainium/Inferentia storytelling.",
      ],
      partnerships: [
        "We've co-produced with SAIL/ReadSail (NeurIPS), Raise (Paris), and the Computex organizing committee — we know how to navigate co-branding and joint-customer situations.",
        "Exclusivity structure: AWS becomes category-exclusive cloud partner for 6 of the 8 events, with named rights at 2 flagships.",
        "Partnership renewal rate among our multi-event partners in 2025: 100%.",
      ],
    };

    const objectionsByStage: Record<string, { q: string; a: string }[]> = {
      discovery: [
        { q: "We already do our own events (re:Invent, Summits).", a: "Totally — and those are scale plays. Ours are different: they're the event-WITHIN-the-event, where the senior folks go when they're skipping your expo floor. We're additive, not competitive." },
        { q: "Budget is set for the year.", a: "Understood. Tell me what's funded — I can show you which of our activations slot against existing line items. We've fit into MDF, co-op marketing, analyst relations, and partner marketing depending on the team." },
      ],
      pitch: [
        { q: "Can we pick just one event?", a: "Yes — Select tier is 2-3 events. I'd honestly recommend against just one, because a single event is a brand statement; two is a commitment, and the conversations compound across the calendar." },
        { q: "How is this different from sponsoring the conference directly?", a: "Three things: audience quality (we curate to decision-makers, not the whole floor), format (intimate vs. expo), and our 200K-subscriber amplification. You can sponsor the conference AND do our activation — they don't cancel out." },
      ],
      negotiation: [
        { q: "We need exclusivity in the cloud category.", a: "Doable on 6 of 8. MLSys and OCP we keep open for the open-source hardware/systems community. The 6 flagships — NeurIPS, ICML, Computex, Raise, Yotta, COLM — we can do category-exclusive cloud." },
        { q: "Can we reduce the Premier tier number?", a: "The number is driven by venue, AV, and headcount cost for a 300-400 person activation. What we CAN flex is scope — drop one event and rebalance across the other seven, or downsize the NeurIPS vessel by 100 seats." },
      ],
      closing: [
        { q: "We still need legal review.", a: "Send the redlines whenever, I'll turn them in 48 hours. In the meantime, can we kick off creative? I need AWS logo assets and a single POC to start building invitations — that buys us 2 weeks without a signed contract." },
        { q: "Can we delay the deposit?", a: "Yes for flagships with >90 days lead time. For Computex (Jun) and MLSys (May) I need deposit committed this week to hold the venues — happy to put that in a separate SOW if it helps the procurement cycle." },
      ],
      renewal: [
        { q: "The ROI wasn't what we hoped.", a: "Let's look at the attribution model — was it last-touch or multi-touch? Events are mid-funnel by design. I'll pull the actual pipeline data from the 2025 attendee list and we can reconcile." },
        { q: "We want to go smaller next year.", a: "Totally fair — let's pick the 2 events that actually sourced pipeline and double down there. Leaner is fine. What we shouldn't do is spray across all 8 at half-tier." },
      ],
    };

    const asks: Record<string, string> = {
      discovery: "The ask: 30 more minutes next week to walk through a tailored calendar. I'll send a follow-up with the 2-3 events I'd recommend based on this conversation.",
      pitch: "The ask: a soft commitment to 2-3 events by end of week. I'm not asking for signed paper yet — just a ranked list of interest so I can reserve placeholder sponsorship slots before other partners call.",
      negotiation: "The ask: verbal agreement on tier + scope today, paper by end of next week. I need that to lock venues (especially Computex and NeurIPS).",
      closing: "The ask: signed agreement + first invoice paid within 10 business days. I'll spin up the creative kickoff call the moment we receive payment.",
      renewal: "The ask: let's schedule a 2027 planning session before Q1 ends. I'll bring proposed calendar + learnings report.",
    };

    return {
      opening: openingByStage[stage],
      stats: statsByFocus[focus] || [],
      objections: objectionsByStage[stage] || [],
      ask: asks[stage],
    };
  }, [stage, focus]);

  const fullText = `MEETING PREP — ${contactName || "[Contact]"} | ${stages.find(s => s.key === stage)?.label} | ${focusAreas.find(f => f.key === focus)?.label}\n\nOPENING:\n${brief.opening}\n\nKEY STATS TO DROP:\n${brief.stats.map((s, i) => `${i+1}. ${s}`).join("\n")}\n\nLIKELY OBJECTIONS:\n${brief.objections.map(o => `Q: ${o.q}\nA: ${o.a}`).join("\n\n")}\n\nTHE ASK:\n${brief.ask}`;

  return (
    <section style={{ padding: "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Meeting Prep</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px" }}>INTERNAL</span>
          </div>
          <SectionTitle>AWS Call Briefing</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 15, color: C.txm, lineHeight: 1.7, maxWidth: 620, marginBottom: 32 }}>
            15 minutes before your AWS call, pick the meeting stage and your contact's focus area. You'll get opening angles, stats to drop, anticipated objections with responses, and the specific ask.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 340px) 1fr", gap: 32 }}>
          <FadeIn>
            <div>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Contact Name</div>
              <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="e.g. Sarah Chen, AWS"
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.tx, fontFamily: ft, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 20 }} />

              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Meeting Stage</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {stages.map(s => (
                  <button key={s.key} onClick={() => setStage(s.key)} style={{
                    fontFamily: ft, fontSize: 13, fontWeight: stage === s.key ? 700 : 500,
                    color: stage === s.key ? "#060608" : C.txm, textAlign: "left",
                    background: stage === s.key ? `linear-gradient(135deg, ${C.amber}, #E8A020)` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${stage === s.key ? C.amber : C.glassBorder}`,
                    borderRadius: 10, padding: "10px 14px", cursor: "pointer", transition: "all 0.2s ease",
                  }}>{s.label}</button>
                ))}
              </div>

              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Contact Focus</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {focusAreas.map(f => (
                  <button key={f.key} onClick={() => setFocus(f.key)} style={{
                    fontFamily: ft, fontSize: 13, fontWeight: focus === f.key ? 700 : 500,
                    color: focus === f.key ? "#060608" : C.txm, textAlign: "left",
                    background: focus === f.key ? `linear-gradient(135deg, ${C.violet}, ${C.violet}cc)` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${focus === f.key ? C.violet : C.glassBorder}`,
                    borderRadius: 10, padding: "10px 14px", cursor: "pointer", transition: "all 0.2s ease",
                  }}>{f.label}</button>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <GlassCard style={{ padding: "28px 32px", position: "relative" }}>
              <button onClick={() => { navigator.clipboard.writeText(fullText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
                position: "absolute", top: 16, right: 16,
                fontFamily: mn, fontSize: 10, fontWeight: 700,
                color: copied ? "#4ADE80" : C.amber, background: copied ? "#4ADE8015" : C.amber + "10",
                border: `1px solid ${copied ? "#4ADE8030" : C.amber + "30"}`,
                borderRadius: 8, padding: "6px 14px", cursor: "pointer",
              }}>{copied ? "Copied!" : "Copy Brief"}</button>

              <div style={{ marginBottom: 22 }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Opening Angle</div>
                <div style={{ fontFamily: ft, fontSize: 14, color: C.tx, lineHeight: 1.7 }}>{brief.opening}</div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Key Stats to Drop</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {brief.stats.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${C.glassBorder}` }}>
                      <span style={{ fontFamily: mn, fontSize: 11, color: C.amber, flexShrink: 0, fontWeight: 700 }}>{i + 1}</span>
                      <span style={{ fontFamily: ft, fontSize: 13, color: C.txm, lineHeight: 1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.coral, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Likely Objections + Responses</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {brief.objections.map((o, i) => (
                    <div key={i} style={{ padding: "12px 16px", background: C.coral + "06", borderRadius: 10, border: `1px solid ${C.coral}20` }}>
                      <div style={{ fontFamily: mn, fontSize: 10, color: C.coral, letterSpacing: "1px", marginBottom: 6, fontWeight: 700 }}>Q</div>
                      <div style={{ fontFamily: ft, fontSize: 13, color: C.tx, fontStyle: "italic", marginBottom: 10 }}>"{o.q}"</div>
                      <div style={{ fontFamily: mn, fontSize: 10, color: "#4ADE80", letterSpacing: "1px", marginBottom: 6, fontWeight: 700 }}>A</div>
                      <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, lineHeight: 1.6 }}>{o.a}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "16px 20px", background: `linear-gradient(135deg, ${C.amber}10, ${C.violet}08)`, borderRadius: 12, border: `1px solid ${C.amber}30` }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>The Ask</div>
                <div style={{ fontFamily: ft, fontSize: 14, color: C.tx, lineHeight: 1.7, fontWeight: 600 }}>{brief.ask}</div>
              </div>
            </GlassCard>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERNAL OPS: AWS CONTACT CRM / FOLLOW-UP TRACKER
   ═══════════════════════════════════════════════════════════ */
type Contact = { id: number; name: string; org: string; role: string; eventInterest: string; lastContact: string; nextStep: string; notes: string; stage: string };

function ContactCRM() {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try { return JSON.parse(localStorage.getItem("sa-crm") || "[]"); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [draft, setDraft] = useState<Contact>({ id: 0, name: "", org: "AWS", role: "", eventInterest: "", lastContact: new Date().toISOString().slice(0, 10), nextStep: "", notes: "", stage: "Discovery" });

  const stages = ["Discovery", "Pitch", "Negotiation", "Closing", "Signed", "Cold"];
  const stageColors: Record<string, string> = {
    Discovery: C.txm, Pitch: C.blue, Negotiation: C.violet, Closing: C.amber, Signed: "#4ADE80", Cold: C.txd,
  };

  const save = (list: Contact[]) => {
    setContacts(list);
    localStorage.setItem("sa-crm", JSON.stringify(list));
  };

  const submit = () => {
    if (!draft.name.trim()) return;
    if (editing) {
      save(contacts.map(c => c.id === editing.id ? draft : c));
    } else {
      save([{ ...draft, id: Date.now() }, ...contacts]);
    }
    setShowForm(false);
    setEditing(null);
    setDraft({ id: 0, name: "", org: "AWS", role: "", eventInterest: "", lastContact: new Date().toISOString().slice(0, 10), nextStep: "", notes: "", stage: "Discovery" });
  };

  const remove = (id: number) => save(contacts.filter(c => c.id !== id));
  const bumpLastContact = (id: number) => save(contacts.map(c => c.id === id ? { ...c, lastContact: new Date().toISOString().slice(0, 10) } : c));

  const daysSince = (iso: string) => {
    const d = new Date(iso).getTime();
    return Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
  };

  const urgencyColor = (days: number, stage: string) => {
    if (stage === "Signed") return "#4ADE80";
    if (stage === "Cold") return C.txd;
    if (days >= 14) return C.coral;
    if (days >= 7) return C.amber;
    return "#4ADE80";
  };

  const sorted = [...contacts].sort((a, b) => {
    if (a.stage === "Signed" && b.stage !== "Signed") return 1;
    if (b.stage === "Signed" && a.stage !== "Signed") return -1;
    return daysSince(b.lastContact) - daysSince(a.lastContact);
  });

  const overdueCount = contacts.filter(c => c.stage !== "Signed" && c.stage !== "Cold" && daysSince(c.lastContact) >= 7).length;

  return (
    <section style={{ padding: "80px 32px", background: "rgba(255,255,255,0.01)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Contact CRM</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px" }}>INTERNAL</span>
          </div>
          <SectionTitle>Follow-up Tracker</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 15, color: C.txm, lineHeight: 1.7, maxWidth: 620, marginBottom: 20 }}>
            Log every AWS contact and conversation. Rows turn amber after 7 days, coral after 14 — so nobody falls through the cracks.
          </p>
          {overdueCount > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: C.coral + "10", border: `1px solid ${C.coral}30`, borderRadius: 20, marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.coral }} />
              <span style={{ fontFamily: mn, fontSize: 11, color: C.coral, fontWeight: 700 }}>{overdueCount} contact{overdueCount > 1 ? "s" : ""} overdue for outreach</span>
            </div>
          )}
        </FadeIn>

        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button onClick={() => { setEditing(null); setDraft({ id: 0, name: "", org: "AWS", role: "", eventInterest: "", lastContact: new Date().toISOString().slice(0, 10), nextStep: "", notes: "", stage: "Discovery" }); setShowForm(true); }} style={{
            fontFamily: ft, fontSize: 13, fontWeight: 800, color: "#060608",
            background: `linear-gradient(135deg, ${C.amber}, #E8A020)`,
            padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer",
          }}>+ Add Contact</button>
        </div>

        {showForm && (
          <FadeIn>
            <GlassCard style={{ padding: "24px 28px", marginBottom: 20, border: `1px solid ${C.amber}30` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Name *" style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, color: C.tx, fontFamily: ft, fontSize: 13, outline: "none" }} />
                <input value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })} placeholder="Role (e.g. VP Marketing)" style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, color: C.tx, fontFamily: ft, fontSize: 13, outline: "none" }} />
                <input value={draft.org} onChange={e => setDraft({ ...draft, org: e.target.value })} placeholder="Org" style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, color: C.tx, fontFamily: ft, fontSize: 13, outline: "none" }} />
                <input value={draft.eventInterest} onChange={e => setDraft({ ...draft, eventInterest: e.target.value })} placeholder="Event interest (e.g. NeurIPS + COLM)" style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, color: C.tx, fontFamily: ft, fontSize: 13, outline: "none" }} />
                <input type="date" value={draft.lastContact} onChange={e => setDraft({ ...draft, lastContact: e.target.value })} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, color: C.tx, fontFamily: ft, fontSize: 13, outline: "none" }} />
                <select value={draft.stage} onChange={e => setDraft({ ...draft, stage: e.target.value })} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, color: C.tx, fontFamily: ft, fontSize: 13, outline: "none" }}>
                  {stages.map(s => <option key={s} value={s} style={{ background: C.bg }}>{s}</option>)}
                </select>
              </div>
              <input value={draft.nextStep} onChange={e => setDraft({ ...draft, nextStep: e.target.value })} placeholder="Next step" style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, color: C.tx, fontFamily: ft, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
              <textarea value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} placeholder="Notes from conversation..." rows={3} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, color: C.tx, fontFamily: ft, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 12, resize: "vertical" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={submit} style={{ fontFamily: ft, fontSize: 13, fontWeight: 800, color: "#060608", background: `linear-gradient(135deg, ${C.amber}, #E8A020)`, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}>
                  {editing ? "Save Changes" : "Add Contact"}
                </button>
                <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ fontFamily: ft, fontSize: 13, fontWeight: 600, color: C.txm, background: "transparent", border: `1px solid ${C.glassBorder}`, padding: "10px 24px", borderRadius: 10, cursor: "pointer" }}>Cancel</button>
              </div>
            </GlassCard>
          </FadeIn>
        )}

        {contacts.length === 0 ? (
          <GlassCard style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: ft, fontSize: 14, color: C.txm }}>No contacts logged yet. Add your first AWS contact above.</div>
          </GlassCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map(c => {
              const days = daysSince(c.lastContact);
              const color = urgencyColor(days, c.stage);
              const stageColor = stageColors[c.stage] || C.txm;
              return (
                <GlassCard key={c.id} style={{ padding: "18px 22px", borderLeft: `3px solid ${color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: ft, fontSize: 16, fontWeight: 800, color: C.tx }}>{c.name}</span>
                        {c.role && <span style={{ fontFamily: ft, fontSize: 13, color: C.txm }}>— {c.role}</span>}
                        {c.org && <span style={{ fontFamily: mn, fontSize: 11, color: C.txd }}>@ {c.org}</span>}
                        <span style={{ fontFamily: mn, fontSize: 9, color: stageColor, background: stageColor + "15", border: `1px solid ${stageColor}30`, borderRadius: 20, padding: "2px 10px", letterSpacing: "1px", fontWeight: 700 }}>{c.stage}</span>
                      </div>
                      {c.eventInterest && <div style={{ fontFamily: ft, fontSize: 12, color: C.amber, marginBottom: 6 }}>Interest: {c.eventInterest}</div>}
                      {c.nextStep && <div style={{ fontFamily: ft, fontSize: 13, color: C.tx, marginTop: 6 }}><span style={{ color: C.txd, fontFamily: mn, fontSize: 10, letterSpacing: "1px" }}>NEXT:</span> {c.nextStep}</div>}
                      {c.notes && <div style={{ fontFamily: ft, fontSize: 12, color: C.txm, marginTop: 8, lineHeight: 1.5, fontStyle: "italic" }}>{c.notes}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      <div style={{ fontFamily: mn, fontSize: 11, color, fontWeight: 700 }}>{days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`}</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => bumpLastContact(c.id)} style={{ fontFamily: mn, fontSize: 10, color: "#4ADE80", background: "#4ADE8010", border: "1px solid #4ADE8030", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}>Touched</button>
                        <button onClick={() => { setEditing(c); setDraft(c); setShowForm(true); }} style={{ fontFamily: mn, fontSize: 10, color: C.txm, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>Edit</button>
                        <button onClick={() => remove(c.id)} style={{ fontFamily: mn, fontSize: 10, color: C.coral, background: C.coral + "10", border: `1px solid ${C.coral}30`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>{"\u00D7"}</button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERNAL OPS: EVENT COUNTDOWN PLANNER
   ═══════════════════════════════════════════════════════════ */
function EventCountdown() {
  const [selected, setSelected] = useState(EVENTS[0].name);
  const ev = EVENTS.find(e => e.name === selected) || EVENTS[0];

  const eventStart = useMemo(() => {
    return new Date(2026, ev.monthIndex, ev.dayStart);
  }, [ev]);

  const now = new Date();
  const daysOut = Math.ceil((eventStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const dateMinus = (weeks: number) => {
    const d = new Date(eventStart);
    d.setDate(d.getDate() - weeks * 7);
    return d;
  };

  const milestones = ev.activationSteps.map((step, i) => {
    const weeksOut = parseInt(step.timing.match(/(\d+)\s*weeks?/)?.[1] || "0", 10);
    const isDayOf = step.timing.toLowerCase().includes("day");
    const isPostEvent = step.timing.toLowerCase().includes("after");
    const postWeeks = isPostEvent ? parseInt(step.timing.match(/(\d+)\s*weeks?/)?.[1] || "1", 10) : 0;

    let milestoneDate: Date;
    if (isPostEvent) {
      milestoneDate = new Date(eventStart);
      milestoneDate.setDate(milestoneDate.getDate() + postWeeks * 7);
    } else if (isDayOf) {
      milestoneDate = eventStart;
    } else {
      milestoneDate = dateMinus(weeksOut);
    }
    const past = milestoneDate.getTime() < now.getTime();
    return { ...step, date: milestoneDate, past, daysFromNow: Math.ceil((milestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) };
  });

  const col = ev.color;

  return (
    <section style={{ padding: "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <SectionLabel>Event Planner</SectionLabel>
            <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "2px 8px", letterSpacing: "1px" }}>INTERNAL</span>
          </div>
          <SectionTitle>Countdown & Milestone Dates</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 15, color: C.txm, lineHeight: 1.7, maxWidth: 620, marginBottom: 28 }}>
            Pick an event — see every milestone phase with real calendar dates backed out from the event date. Red = overdue, amber = due within 7 days.
          </p>
        </FadeIn>

        <FadeIn delay={50}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
            {EVENTS.map(e => (
              <button key={e.name} onClick={() => setSelected(e.name)} style={{
                fontFamily: ft, fontSize: 12, fontWeight: selected === e.name ? 700 : 500,
                color: selected === e.name ? "#060608" : C.txm,
                background: selected === e.name ? `linear-gradient(135deg, ${e.color}, ${e.color}cc)` : "rgba(255,255,255,0.03)",
                border: `1px solid ${selected === e.name ? e.color : C.glassBorder}`,
                borderRadius: 10, padding: "8px 14px", cursor: "pointer", transition: "all 0.2s ease",
              }}>{e.name}</button>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <GlassCard style={{ padding: "28px 32px", marginBottom: 20, background: `linear-gradient(135deg, ${col}10, ${col}04)`, border: `1px solid ${col}30` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontFamily: gf, fontSize: 28, fontWeight: 900, color: C.tx, marginBottom: 4 }}>{ev.name}</div>
                <div style={{ fontFamily: mn, fontSize: 13, color: col, marginBottom: 2 }}>{ev.dates}</div>
                <div style={{ fontFamily: ft, fontSize: 13, color: C.txm }}>{ev.location}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: mn, fontSize: 48, fontWeight: 900, color: col, lineHeight: 1, letterSpacing: "-2px" }}>{daysOut > 0 ? daysOut : 0}</div>
                <div style={{ fontFamily: mn, fontSize: 11, color: C.txm, letterSpacing: "2px", textTransform: "uppercase", marginTop: 4 }}>{daysOut > 0 ? "days out" : daysOut === 0 ? "today" : "past"}</div>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        <div style={{ position: "relative", paddingLeft: 40 }}>
          <div style={{ position: "absolute", left: 10, top: 10, bottom: 10, width: 2, background: `linear-gradient(180deg, ${col}40, ${col}10)` }} />
          {milestones.map((m, i) => {
            let statusColor = col;
            let statusLabel = "Upcoming";
            if (m.past) { statusColor = "#4ADE80"; statusLabel = "Passed"; }
            else if (m.daysFromNow <= 7) { statusColor = C.coral; statusLabel = "This week"; }
            else if (m.daysFromNow <= 14) { statusColor = C.amber; statusLabel = "Next 2 weeks"; }

            return (
              <FadeIn key={i} delay={i * 60}>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <div style={{ position: "absolute", left: -31, top: 18, width: 14, height: 14, borderRadius: "50%", background: statusColor, border: `3px solid ${C.bg}`, boxShadow: `0 0 12px ${statusColor}60` }} />
                  <GlassCard style={{ padding: "16px 22px", borderLeft: `3px solid ${statusColor}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontFamily: ft, fontSize: 16, fontWeight: 800, color: C.tx }}>{m.phase}</div>
                        <div style={{ fontFamily: mn, fontSize: 11, color: C.txd, marginTop: 2 }}>{m.timing}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: mn, fontSize: 13, fontWeight: 700, color: statusColor }}>{fmt(m.date)}</div>
                        <div style={{ fontFamily: mn, fontSize: 10, color: statusColor, marginTop: 2, letterSpacing: "1px" }}>{statusLabel}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {m.tasks.map((task, ti) => (
                        <div key={ti} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ fontFamily: mn, fontSize: 10, color: col, flexShrink: 0, paddingTop: 3 }}>{"\u2022"}</span>
                          <span style={{ fontFamily: ft, fontSize: 13, color: C.txm, lineHeight: 1.5 }}>{task}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InternalOpsTab() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative" }}>
      <GradientMesh />
      <div style={{ position: "relative", zIndex: 1, paddingTop: 80 }}>
        <MeetingPrep />
        <ContactCRM />
        <EventCountdown />
        <MarketingDeployment />
        <BudgetTracker />
        <ContentCalendar />
      </div>
    </div>
  );
}

export default function InternalClient() {
  const [active, setActive] = useState(0);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-Medium.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-SemiBold.woff2') format('woff2'); font-weight: 600; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-Bold.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-ExtraBold.woff2') format('woff2'); font-weight: 800; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-Black.woff2') format('woff2'); font-weight: 900; font-style: normal; font-display: swap; }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; background: #050508; }
        body { background: #050508; overflow-x: hidden; }
        ::selection { background: #F7B04130; color: #E8E4DD; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: #4E4B56; border-radius: 3px; }
        @keyframes flowRing {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @media (max-width: 768px) {
          section > div { padding: 0 16px !important; }
          [data-grid-responsive] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAV — always internal */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "14px 32px",
        background: "#050508E8",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.glassBorder}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/images/events/semianalysis.png" alt="SemiAnalysis" style={{ height: 22, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          <span style={{ color: C.txd, fontSize: 20, fontWeight: 200 }}>{"\u00D7"}</span>
          <img src="/images/events/aws.svg" alt="AWS" style={{ height: 18, objectFit: "contain" }} />
          <span style={{ fontFamily: mn, fontSize: 9, color: C.coral, background: C.coral + "15", border: `1px solid ${C.coral}30`, borderRadius: 20, padding: "3px 10px", letterSpacing: "1px", fontWeight: 700, marginLeft: 8 }}>INTERNAL</span>
        </div>

        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: 3 }}>
          {TABS_INTERNAL.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => { setActive(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              style={{
                fontFamily: ft, fontSize: 12, fontWeight: active === i ? 800 : 600,
                color: active === i ? "#060608" : C.txm,
                background: active === i ? `linear-gradient(135deg, ${C.amber}, #E8A020)` : "transparent",
                border: "none", borderRadius: 9, padding: "8px 20px",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={handleLogout} style={{ fontFamily: mn, fontSize: 10, color: C.txd, background: "none", border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", transition: "all 0.2s ease" }}>
            Logout
          </button>
          <a href="/" style={{
            fontFamily: ft, fontSize: 12, fontWeight: 700, color: "#060608",
            background: `linear-gradient(135deg, ${C.amber}, #E8A020)`,
            padding: "8px 20px", borderRadius: 8, textDecoration: "none",
          }}>
            Public Site
          </a>
        </div>
      </nav>

      {active === 0 ? <OverviewTab internal={true} /> : active === 1 ? <CalendarTab /> : active === 2 ? <InternalAnalyticsTab /> : <InternalOpsTab />}
    </>
  );
}
