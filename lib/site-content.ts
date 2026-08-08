export const brand = {
  name: "Heapify Global Community",
  tagline: "[TAGLINE PLACEHOLDER]",
  mission: "[MISSION PLACEHOLDER]",
  vision: "[VISION PLACEHOLDER]",
};

export const navigationLinks = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/challenges", label: "Challenges" },
  { href: "/open-source", label: "Projects" },
  { href: "/team", label: "Team" },
  { href: "/resources", label: "Resources" },
  { href: "/social", label: "Social" },
];

export const stats = [
  { label: "Members", value: 14200, detail: "Builders across 60+ countries" },
  { label: "Events", value: 180, detail: "Sessions, summits, and activations" },
  { label: "Projects", value: 310, detail: "Open-source and community launches" },
  { label: "Chapters", value: 22, detail: "Local nodes with global reach" },
  { label: "Mentors", value: 84, detail: "Technical and community guidance" },
];

export const whatWeDo = [
  {
    eyebrow: "01",
    title: "Community infrastructure",
    description:
      "A premium ecosystem for builders to learn, collaborate, and ship with structure.",
  },
  {
    eyebrow: "02",
    title: "Open-source momentum",
    description:
      "Repo-driven programs, contribution pipelines, and project discovery built for scale.",
  },
  {
    eyebrow: "03",
    title: "Career acceleration",
    description:
      "Events, mentorship, internships, and leadership tracks that compound over time.",
  },
  {
    eyebrow: "04",
    title: "Global chapter network",
    description:
      "Distributed communities with local autonomy and a shared operating rhythm.",
  },
  {
    eyebrow: "05",
    title: "Partner activation",
    description:
      "Programs designed for sponsor visibility, technical depth, and measurable engagement.",
  },
  {
    eyebrow: "06",
    title: "Builder storytelling",
    description:
      "A platform that showcases people, projects, and contributions with first-class presentation.",
  },
];

export const featuredEvents = [
  {
    slug: "global-builder-night",
    title: "Global Builder Night",
    category: "Community",
    status: "Upcoming",
    date: "Aug 14, 2026",
    time: "18:30 UTC",
    location: "Virtual + local chapters",
    summary:
      "A flagship showcase of community projects, mentor sessions, and partner talks.",
    spotlight: "Orange glow",
  },
  {
    slug: "web3-systems-lab",
    title: "Web3 Systems Lab",
    category: "Workshop",
    status: "Ongoing",
    date: "Weekly",
    time: "19:00 UTC",
    location: "Live workshop room",
    summary:
      "Hands-on sessions focused on protocol design, product thinking, and ship-ready demos.",
    spotlight: "Deep interface",
  },
  {
    slug: "community-merge-day",
    title: "Community Merge Day",
    category: "Open Source",
    status: "Past",
    date: "Jun 02, 2026",
    time: "All day",
    location: "GitHub + live rooms",
    summary:
      "A high-energy contribution sprint that turned ideas into merged pull requests.",
    spotlight: "Contributor spotlight",
  },
];

export const eventCategories = [
  "All",
  "Workshop",
  "Community",
  "Open Source",
  "Webinar",
  "Hackathon",
];

export const eventStatuses = ["All", "Upcoming", "Ongoing", "Past"];

export const eventCatalog = [
  {
    slug: "global-builder-night",
    title: "Global Builder Night",
    category: "Community",
    status: "Upcoming",
    date: "Aug 14, 2026",
    time: "18:30 UTC",
    format: "Hybrid",
    location: "Multiple cities + stream",
    description:
      "A polished showcase event for contributors, partners, and chapter leaders.",
  },
  {
    slug: "web3-systems-lab",
    title: "Web3 Systems Lab",
    category: "Workshop",
    status: "Ongoing",
    date: "Every Thursday",
    time: "19:00 UTC",
    format: "Live workshop",
    location: "Virtual room",
    description:
      "A guided lab for shipping technically sharp prototypes and teaching by doing.",
  },
  {
    slug: "merge-sprint-weekend",
    title: "Merge Sprint Weekend",
    category: "Open Source",
    status: "Past",
    date: "Jun 02, 2026",
    time: "10:00 UTC",
    format: "Sprint",
    location: "GitHub + Notion",
    description:
      "A contribution marathon spanning onboarding, issues, reviews, and final merges.",
  },
  {
    slug: "founders-qa-live",
    title: "Founders Q&A Live",
    category: "Webinar",
    status: "Upcoming",
    date: "Sep 05, 2026",
    time: "16:00 UTC",
    format: "Livestream",
    location: "Main stage",
    description:
      "A direct conversation on community growth, product direction, and platform thinking.",
  },
  {
    slug: "chapter-launch-playbook",
    title: "Chapter Launch Playbook",
    category: "Community",
    status: "Upcoming",
    date: "Aug 28, 2026",
    time: "20:00 UTC",
    format: "Workshop",
    location: "Chapter leaders room",
    description:
      "A practical session for founding a chapter and running it with consistency.",
  },
  {
    slug: "build-week-zero",
    title: "Build Week Zero",
    category: "Hackathon",
    status: "Past",
    date: "May 12, 2026",
    time: "48 hours",
    format: "Hackathon",
    location: "Distributed teams",
    description:
      "A polished build weekend with mentorship, demos, and highly visual project outputs.",
  },
];

export const eventDetail = {
  slug: "global-builder-night",
  title: "Global Builder Night",
  banner:
    "A premium community showcase for builders, chapters, mentors, and partners.",
  category: "Community",
  status: "Upcoming",
  date: "Aug 14, 2026",
  time: "18:30 UTC",
  location: "Hybrid: regional hubs + livestream",
  host: "Heapify Global Community",
  registrationState: "Registration placeholder",
  agenda: [
    { time: "18:30", item: "Opening notes and welcome" },
    { time: "18:50", item: "Featured project demos" },
    { time: "19:20", item: "Speaker session and panel" },
    { time: "20:00", item: "Community recognitions" },
    { time: "20:20", item: "Networking and chapter rooms" },
  ],
  speakers: [
    { name: "Aanya Rao", role: "Founder", focus: "Community systems" },
    { name: "Mika Chen", role: "Co-Founder", focus: "Product and partnerships" },
    { name: "Jordan Vega", role: "Mentor", focus: "Open-source growth" },
  ],
  related: featuredEvents.slice(1),
};

export const featuredProjects = [
  {
    slug: "heap-network",
    title: "Heap Network",
    description:
      "A community graph for tracking contributors, chapters, and momentum.",
    stack: ["Next.js", "TypeScript", "Supabase"],
    impact: "Builder visibility",
    members: "12 contributors",
  },
  {
    slug: "open-source-pathways",
    title: "Open Source Pathways",
    description:
      "A guided contribution system that turns first-time contributors into regulars.",
    stack: ["Docs", "GitHub", "Automation"],
    impact: "Faster onboarding",
    members: "8 maintainers",
  },
  {
    slug: "chapter-ops-kit",
    title: "Chapter Ops Kit",
    description:
      "A polished toolkit for running local chapters with global consistency.",
    stack: ["Templates", "Workflows", "Analytics"],
    impact: "Operational clarity",
    members: "6 core builders",
  },
];

export const communityJourney = [
  {
    step: "01",
    title: "Discover",
    description:
      "Meet the community through events, content, and chapter activations.",
  },
  {
    step: "02",
    title: "Learn",
    description: "Use roadmaps, workshops, and recordings to level up quickly.",
  },
  {
    step: "03",
    title: "Build",
    description:
      "Ship alongside peers using projects, hackathons, and open-source repos.",
  },
  {
    step: "04",
    title: "Lead",
    description:
      "Become a mentor, organizer, or chapter lead inside the ecosystem.",
  },
];

export const partners = [
  "GitHub",
  "Vercel",
  "Stripe",
  "Luma",
  "Linear",
  "Supabase",
];

export const testimonials = [
  {
    quote:
      "The platform feels like a real product, not just a community landing page.",
    name: "Arielle M.",
    role: "Chapter Lead",
  },
  {
    quote:
      "The event experience is polished enough to bring sponsors and maintain trust.",
    name: "Noah K.",
    role: "Partner Engineer",
  },
  {
    quote:
      "It makes contribution and leadership paths visible in a way that actually converts.",
    name: "Sofia R.",
    role: "Open Source Contributor",
  },
];

export const coreValues = [
  {
    title: "Merit with empathy",
    description:
      "Contribution is visible, but support is still personal and deliberate.",
  },
  {
    title: "Global by default",
    description: "Every experience is designed to work across time zones and cultures.",
  },
  {
    title: "Built, not spoken",
    description: "Programs are judged by shipped outcomes, not by surface-level hype.",
  },
  {
    title: "Open and durable",
    description: "Infrastructure should be understandable, maintainable, and reusable.",
  },
];

export const timeline = [
  {
    year: "2024",
    title: "Seeded the community",
    description:
      "Started with builders, chapters, and a strong emphasis on structured growth.",
  },
  {
    year: "2025",
    title: "Expanded the network",
    description:
      "Added events, mentors, partner programs, and repeatable community ops.",
  },
  {
    year: "2026",
    title: "Shipped the platform",
    description:
      "Moved toward a premium digital home for the global community.",
  },
];

export const growthSeries = [24, 38, 52, 64, 81, 92, 108, 126];

export const teamSections = [
  {
    title: "Founder",
    members: [
      {
        name: "Aanya Rao",
        role: "Founder",
        bio: "Sets the product vision and community operating model.",
        links: ["LinkedIn", "X", "GitHub"],
      },
    ],
  },
  {
    title: "Co-Founder",
    members: [
      {
        name: "Mika Chen",
        role: "Co-Founder",
        bio: "Leads platform strategy, partnerships, and event design.",
        links: ["LinkedIn", "YouTube"],
      },
    ],
  },
  {
    title: "Core Team",
    members: [
      {
        name: "Jordan Vega",
        role: "Community Lead",
        bio: "Runs chapters, mentorship, and global engagement flows.",
        links: ["LinkedIn", "Discord"],
      },
      {
        name: "Priya Shah",
        role: "Program Lead",
        bio: "Coordinates events, partnerships, and volunteer systems.",
        links: ["LinkedIn", "X"],
      },
      {
        name: "Leo Martins",
        role: "Design Lead",
        bio: "Crafts the visual language and storytelling systems.",
        links: ["Dribbble", "GitHub"],
      },
    ],
  },
  {
    title: "Junior Core",
    members: [
      {
        name: "Zara Ali",
        role: "Operations",
        bio: "Keeps programs moving and chapter launches on track.",
        links: ["LinkedIn"],
      },
      {
        name: "Ethan Cole",
        role: "Events",
        bio: "Builds the schedule, sessions, and live experience.",
        links: ["LinkedIn", "Instagram"],
      },
    ],
  },
  {
    title: "Mentors",
    members: [
      {
        name: "Riya Nair",
        role: "Mentor",
        bio: "Advises contributors on systems thinking and shipping habits.",
        links: ["LinkedIn", "GitHub"],
      },
      {
        name: "Samir Bose",
        role: "Mentor",
        bio: "Supports chapter teams, workshops, and technical depth.",
        links: ["LinkedIn", "X"],
      },
    ],
  },
  {
    title: "Advisor Cards",
    members: [
      {
        name: "Dr. Lina Park",
        role: "Advisor",
        bio: "Helps align community growth with durable product thinking.",
        links: ["LinkedIn", "Website"],
      },
    ],
  },
];

export const resourceGroups = [
  {
    title: "Blogs",
    slug: "blogs",
    description: "Long-form essays, community updates, and product direction notes.",
    meta: "18 articles",
  },
  {
    title: "Roadmaps",
    slug: "roadmaps",
    description: "Structured paths for beginners, contributors, and chapter organizers.",
    meta: "12 tracks",
  },
  {
    title: "Recordings",
    slug: "recordings",
    description: "Event archives, workshop replays, and mentor sessions.",
    meta: "64 videos",
  },
  {
    title: "Notes",
    slug: "notes",
    description: "Concise references, session summaries, and implementation guides.",
    meta: "90 notes",
  },
];

export const socialChannels = [
  {
    title: "Discord",
    href: "#",
    description: "Daily coordination and live community chat.",
  },
  {
    title: "GitHub",
    href: "#",
    description: "Open-source repos, templates, and contribution flows.",
  },
  {
    title: "LinkedIn",
    href: "#",
    description: "Announcements, team updates, and partner-facing content.",
  },
  {
    title: "Instagram",
    href: "#",
    description: "Visual recaps, event moments, and community culture.",
  },
  {
    title: "Twitter/X",
    href: "#",
    description: "Fast updates, launches, and session highlights.",
  },
  {
    title: "YouTube",
    href: "#",
    description: "Recordings, showcases, and premium long-form content.",
  },
  {
    title: "WhatsApp",
    href: "#",
    description: "Local chapter coordination and quick communication.",
  },
  {
    title: "Telegram",
    href: "#",
    description: "Broadcast updates and distributed community alerts.",
  },
];

export const formEntries = [
  {
    title: "Sponsor Form",
    type: "sponsor",
    description:
      "Share a partnership objective, region, and preferred activation format.",
  },
  {
    title: "Partnership Form",
    type: "partnership",
    description: "Collaborate on events, content, internships, or chapter growth.",
  },
  {
    title: "Volunteer Form",
    type: "volunteer",
    description: "Join operations, design, events, community, or technical support.",
  },
  {
    title: "Speaker Form",
    type: "speaker",
    description:
      "Propose a talk, workshop, panel, or fireside with community value.",
  },
  {
    title: "Mentor Form",
    type: "mentor",
    description:
      "Support contributors with career guidance, reviews, and feedback loops.",
  },
  {
    title: "Chapter Lead Form",
    type: "chapter_lead",
    description: "Launch or expand a chapter with clear support and governance.",
  },
  {
    title: "Ambassador Form",
    type: "ambassador",
    description:
      "Represent the community locally and expand our reach on campuses or within companies.",
  },
  {
    title: "Contact",
    type: "contact",
    description:
      "General inquiries, press, and non-standard collaboration requests.",
  },
  {
    title: "Join a Chapter",
    type: "chapter_member",
    description:
      "Apply to join a Heapify chapter near you. Your application will be reviewed by the chapter lead.",
  },
];

export const openSourceHighlights = [
  {
    title: "Contribution-ready repos",
    description: "Clearly labeled issues, templates, and review workflows.",
  },
  {
    title: "Project discovery",
    description: "A curated system for surfacing high-impact community builds.",
  },
  {
    title: "Builder visibility",
    description: "Profiles, milestones, and contribution history presented beautifully.",
  },
];
