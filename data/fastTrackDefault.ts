import { FastTrackPhase, FastTrackPlan } from '../types';

export const DEFAULT_PHASES_TEMPLATE: FastTrackPhase[] = [
  {
    id: 1,
    title: "Phase 1: Founder Discovery",
    subtitle: "Founder background & business concept formulation",
    fields: [
      {
        id: "founder_background",
        label: "Founder Background",
        placeholder: "e.g., 6 years Senior UX Architect at a Series C fintech. Led design teams of 8 designers. Strong track record in prototyping and design systems.",
        description: "Your professional background, domain expertise, previous ventures, and core superpowers.",
        value: "",
        type: "textarea"
      },
      {
        id: "business_idea",
        label: "Describe your business idea",
        placeholder: "e.g., A specialized product design consultancy helping B2B SaaS startups design intuitive AI workflows and generative agent interfaces.",
        description: "The core business concept, what you are creating, and how it delivers value.",
        value: "",
        type: "textarea"
      },
      {
        id: "problem_solved",
        label: "What problem does this solve?",
        placeholder: "e.g., Startups add messy AI features without UX thought, causing user confusion and high churn rates.",
        description: "The painful friction, inefficiency, or costly problem your customers currently suffer from.",
        value: "",
        type: "textarea"
      },
      {
        id: "target_audience",
        label: "Who is this for?",
        placeholder: "e.g., Early-stage AI founders, Series A SaaS product leads, and technical CTOs needing design polish.",
        description: "Your ideal customer profile (ICP), target market segment, and buyer persona.",
        value: "",
        type: "textarea"
      },
      {
        id: "why_now",
        label: "Why you & Why now?",
        placeholder: "e.g., LLM adoption is surging, but user experience is lagging. Our deep enterprise design background provides instant credibility.",
        description: "Market timing, technological tailwinds, and your unfair competitive advantage.",
        value: "",
        type: "textarea"
      }
    ]
  },
  {
    id: 2,
    title: "Phase 2: Business Validation",
    subtitle: "Market research, competitive landscape & pricing hypothesis",
    fields: [
      {
        id: "competitors",
        label: "Competitor Landscape & Workarounds",
        placeholder: "e.g., Generic design agencies (slow & don't understand LLMs), In-house engineers (lack UX skills), Freelance UI designers.",
        description: "Direct competitors, indirect alternatives, and current workarounds customers use today.",
        value: "",
        type: "textarea"
      },
      {
        id: "uvp",
        label: "Unique Value Proposition (USP)",
        placeholder: "e.g., We deliver battle-tested AI interaction designs in 10-day sprints, guaranteed to cut user cognitive overload by 50%.",
        description: "What makes your offer 10x better, faster, or uniquely differentiated in the marketplace.",
        value: "",
        type: "textarea"
      },
      {
        id: "market_size",
        label: "Target Market Size & Opportunity",
        placeholder: "e.g., 25,000+ funded B2B SaaS startups adding generative AI features globally. $4B addressable design & productization market.",
        description: "Estimated addressable market (TAM / SAM / SOM) and initial reachable niche size.",
        value: "",
        type: "textarea"
      },
      {
        id: "monetization",
        label: "Monetization Model & Pricing Hypothesis",
        placeholder: "e.g., Tier 1: 10-Day AI UX Audit ($4,500). Tier 2: Full Product Sprint ($12,000). Tier 3: Monthly Advisory Retainer ($5,000/mo).",
        description: "Pricing structure, billing cadence (SaaS subscription, fixed package, retainer), and unit economics.",
        value: "",
        type: "textarea"
      },
      {
        id: "validation_plan",
        label: "Demand Validation Experiments",
        placeholder: "e.g., 15 customer discovery calls with YC founders, 1 free pilot case study, and a high-converting teardown landing page.",
        description: "How you will validate willingness to pay before committing heavy resources.",
        value: "",
        type: "textarea"
      }
    ]
  },
  {
    id: 3,
    title: "Phase 3: Brand Strategy",
    subtitle: "Identity, voice, visual archetype & core mission",
    fields: [
      {
        id: "brand_name_tagline",
        label: "Brand Name & Tagline Formulation",
        placeholder: "e.g., NeuralCraft Studio — 'Human-Grade Interfaces for Autonomous AI'.",
        description: "Primary company name, naming rationale, and punchy memorable tagline.",
        value: "",
        type: "textarea"
      },
      {
        id: "brand_voice",
        label: "Brand Voice & Tone",
        placeholder: "e.g., High-precision, minimalist, confident, jargon-free, deeply technical yet human-centric.",
        description: "The personality, vocabulary, and communication style across all touchpoints.",
        value: "",
        type: "textarea"
      },
      {
        id: "visual_identity",
        label: "Visual Style & Color Palette",
        placeholder: "e.g., High-contrast dark obsidian canvas (#0B0F19), Electric Indigo accents (#6366F1), Crisp typography pairing Plus Jakarta Sans & JetBrains Mono.",
        description: "Aesthetic guidelines, color harmony, typography pairing, and visual archetype.",
        value: "",
        type: "textarea"
      },
      {
        id: "mission_vision",
        label: "Core Mission & Vision Statement",
        placeholder: "e.g., Mission: To eliminate friction between humans and AI agents. Vision: Powering the UX behind 1,000 category-defining AI apps.",
        description: "Your foundational purpose and inspiring long-term horizon.",
        value: "",
        type: "textarea"
      },
      {
        id: "brand_pillars",
        label: "Key Brand Pillars & Proof Points",
        placeholder: "e.g., 1. Velocity (10-day sprints), 2. Precision (Zero AI slop), 3. Measurable ROI (Reduced churn & support tickets).",
        description: "3 core promises and value pillars that anchor your brand positioning.",
        value: "",
        type: "textarea"
      }
    ]
  },
  {
    id: 4,
    title: "Phase 4: Products & Services",
    subtitle: "MVP deliverables, customer journey & feature roadmap",
    fields: [
      {
        id: "mvp_features",
        label: "Core MVP Features & Deliverables",
        placeholder: "e.g., Complete Figma design system, clickable interactive prototype, tokenized Tailwind CSS code handover, and UX audit report.",
        description: "Must-have P0 deliverables and core capabilities included in your initial offer.",
        value: "",
        type: "textarea"
      },
      {
        id: "user_flow",
        label: "User Flow & Customer Journey",
        placeholder: "e.g., 1. 30-min discovery audit -> 2. Sprint scoping & deposit -> 3. Day 3 Wireframe review -> 4. Day 8 Interactive prototype -> 5. Day 10 Code handover.",
        description: "The step-by-step experience from onboarding to value delivery.",
        value: "",
        type: "textarea"
      },
      {
        id: "tech_stack",
        label: "Tech Stack & Operational Infrastructure",
        placeholder: "e.g., React, Tailwind CSS, Vite, Framer Motion, Figma, Loom, Stripe Billing, Notion Client Portal.",
        description: "Tools, frameworks, hosting, and operational stack needed to execute.",
        value: "",
        type: "textarea"
      },
      {
        id: "delivery_method",
        label: "Delivery Method & Service Level",
        placeholder: "e.g., Async Slack channel + 2 weekly live design reviews + shared Notion dashboard with live sprint tracking.",
        description: "How clients receive their product or service with clear SLA guarantees.",
        value: "",
        type: "textarea"
      },
      {
        id: "feature_roadmap",
        label: "Phased Product Roadmap",
        placeholder: "e.g., v1.0: Bespoke 10-day sprint consultancy -> v2.0: Pre-built AI UI Component Library -> v3.0: Automated UX evaluation Chrome extension.",
        description: "How your product or service scales from bespoke MVP to productized scale.",
        value: "",
        type: "textarea"
      }
    ]
  },
  {
    id: 5,
    title: "Phase 5: Online Presence",
    subtitle: "Digital architecture, landing page blueprint & distribution",
    fields: [
      {
        id: "domain_url",
        label: "Domain & URL Strategy",
        placeholder: "e.g., neuralcraft.work (primary), @neuralcraft on X, linkedin.com/company/neuralcraft.",
        description: "Domain names, web addresses, and unified social handle strategy.",
        value: "",
        type: "textarea"
      },
      {
        id: "landing_page_wireframe",
        label: "Landing Page Structure & Wireframe Copy",
        placeholder: "e.g., [Hero]: 'Turn Clunky AI Workflows into Sticky User Experiences'. [Social Proof]: Badges of Series A clients. [Interactive Teardown]: Before/After slider. [Pricing Cards]: 3 clear tiers. [FAQ]: 6 common objections. [CTA]: 'Book 10-Day Sprint'.",
        description: "The architectural blueprint and compelling copy sections of your primary website.",
        value: "",
        type: "textarea"
      },
      {
        id: "seo_strategy",
        label: "SEO Keywords & Search Intent",
        placeholder: "e.g., 'AI UX design agency', 'Generative UI patterns', 'B2B SaaS AI interface design', 'AI product design consultancy'.",
        description: "High-intent organic search queries and target keywords for discoverability.",
        value: "",
        type: "textarea"
      },
      {
        id: "social_channels",
        label: "Social Distribution & Channels",
        placeholder: "e.g., X (daily UI breakdowns & build-in-public), LinkedIn (founder case studies), Substack (weekly 'AI UX Deep Dive' newsletter).",
        description: "Where your target buyers spend time and how you will reach them.",
        value: "",
        type: "textarea"
      },
      {
        id: "analytics_tracking",
        label: "Analytics & Conversion Funnel Setup",
        placeholder: "e.g., Plausible Analytics, Cal.com booking conversion goal, Hotjar session replays, PostHog funnel tracking.",
        description: "Privacy-friendly telemetry, conversion goals, and user journey analytics.",
        value: "",
        type: "textarea"
      }
    ]
  },
  {
    id: 6,
    title: "Phase 6: Marketing Roadmap",
    subtitle: "Acquisition channels, content strategy & lead generation",
    fields: [
      {
        id: "acquisition_channels",
        label: "Primary Acquisition Channels",
        placeholder: "e.g., 1. Direct Cold Email to funded AI startups, 2. Build-in-public design redesigns on X, 3. Community partnerships with AI incubators.",
        description: "Top 3 go-to-market channels to acquire your first 20 paying customers.",
        value: "",
        type: "textarea"
      },
      {
        id: "content_strategy",
        label: "Launch Content Strategy & Teasers",
        placeholder: "e.g., 5 video teardowns of popular AI apps showing UX mistakes and how to fix them + 'The AI UX Checklist' free PDF guide.",
        description: "Content marketing schedule, viral assets, and educational assets.",
        value: "",
        type: "textarea"
      },
      {
        id: "lead_magnet",
        label: "Lead Magnet & Email Capture",
        placeholder: "e.g., 'The 2026 AI Interface Heuristic Checklist' — 12 rules for designing non-confusing agent interfaces.",
        description: "Irresistible free value asset to capture prospective customer contact information.",
        value: "",
        type: "textarea"
      },
      {
        id: "outreach_pitch",
        label: "Cold Outreach & Partnership Pitch Framework",
        placeholder: "e.g., 'Hey [Founder], loved your new agent launch. Noticed 2 UX spots where users might drop off. Recorded a 90-sec Loom showing quick fixes. Mind if I send it over?'",
        description: "High-response outreach messaging script and partnership pitch copy.",
        value: "",
        type: "textarea"
      },
      {
        id: "referral_loops",
        label: "Referral & Word-of-Mouth Engine",
        placeholder: "e.g., 10% referral commission for agency partners + client referral bonus of free monthly design sprint update.",
        description: "Incentives and mechanisms that encourage customers and partners to refer peers.",
        value: "",
        type: "textarea"
      }
    ]
  },
  {
    id: 7,
    title: "Phase 7: Launch Plan",
    subtitle: "Execution timeline, launch platforms & promotional offers",
    fields: [
      {
        id: "launch_platforms",
        label: "Target Launch Date & Platforms",
        placeholder: "e.g., October 15. Launch on Product Hunt, Hacker News Show HN, X/Twitter announcement thread, LinkedIn launch article.",
        description: "Specific target date and launch distribution communities.",
        value: "",
        type: "textarea"
      },
      {
        id: "launch_day_timeline",
        label: "Launch Day Hour-by-Hour Playbook",
        placeholder: "e.g., 00:01 PST: Product Hunt goes live. 06:00 PST: X thread + LinkedIn post. 08:00 PST: Email newsletter to waitlist. 12:00 PST: Live Q&A on X Spaces. 18:00 PST: Day 1 recap & thank you.",
        description: "Detailed schedule for launch day to maximize reach and engagement.",
        value: "",
        type: "textarea"
      },
      {
        id: "early_bird_offer",
        label: "Early Adopter Offer & Launch Incentive",
        placeholder: "e.g., First 5 startups get the 10-day sprint for $8,500 (30% off) + free 3 months of async design advisory.",
        description: "High-urgency promotional pricing or bonus package for first cohort of customers.",
        value: "",
        type: "textarea"
      },
      {
        id: "press_release",
        label: "Official Launch Announcement Copy",
        placeholder: "e.g., 'Today we are launching NeuralCraft — the first design sprint consultancy built specifically for autonomous AI and agent interfaces. Say goodbye to confusing AI chatbots.'",
        description: "Official press release, announcement newsletter copy, and social post text.",
        value: "",
        type: "textarea"
      },
      {
        id: "risk_mitigation",
        label: "Risk Mitigation & Contingency Protocols",
        placeholder: "e.g., If lead volume is high: Cap sprint slots at 3 per month and start a paid waitlist. If slow: Ramp 1-on-1 personalized Loom teardowns.",
        description: "Backup plans for both overflow demand and slower initial pickup.",
        value: "",
        type: "textarea"
      }
    ]
  },
  {
    id: 8,
    title: "Phase 8: Growth Strategy",
    subtitle: "Onboarding delight, retention metrics & long-term moats",
    fields: [
      {
        id: "onboarding_activation",
        label: "Customer Onboarding & Activation Playbook",
        placeholder: "e.g., Instant welcome email with 1-page intake form, private Slack channel auto-created within 2 hours, first kick-off call within 48 hours.",
        description: "Delightful first-hour customer experience creating immediate trust and clarity.",
        value: "",
        type: "textarea"
      },
      {
        id: "retention_strategy",
        label: "Retention & Churn Reduction Tactics",
        placeholder: "e.g., Ongoing $4,500/mo design advisory retainer to review new feature PRs, quarterly UX health checks, continuous design token updates.",
        description: "Recurring value delivery that keeps clients engaged month after month.",
        value: "",
        type: "textarea"
      },
      {
        id: "kpis_milestones",
        label: "Key Performance Indicators & Milestones",
        placeholder: "e.g., Month 1: 3 Sprint Clients ($36K revenue). Month 3: $50K MRR (sprints + retainers). Month 6: $100K MRR + hiring 2 senior designers.",
        description: "Concrete financial, customer volume, and operational metrics.",
        value: "",
        type: "textarea"
      },
      {
        id: "automation_scaling",
        label: "Automation & Operational Scaling",
        placeholder: "e.g., Automated client invoicing via Stripe, template Figma design system boilerplate, automated Loom walkthrough generator.",
        description: "Processes and tooling to scale output without linearly scaling manual hours.",
        value: "",
        type: "textarea"
      },
      {
        id: "defensibility_moat",
        label: "Long-term Moat & Defensibility",
        placeholder: "e.g., Proprietary benchmark dataset of AI conversion rates, industry-standard design component library, recognized category leadership in AI UX.",
        description: "Structural advantages (brand, proprietary data, network effects) that competitors cannot easily copy.",
        value: "",
        type: "textarea"
      }
    ]
  }
];

export const SAMPLE_FAST_TRACK_PLANS: { name: string; description: string; plan: FastTrackPlan }[] = [
  {
    name: "AI Product Design Consultancy",
    description: "Specialized design sprints helping B2B SaaS startups design intuitive AI workflows & interfaces.",
    plan: {
      id: "sample_ai_consultancy",
      name: "NeuralCraft Studio",
      title: "NeuralCraft Studio",
      tagline: "Human-Grade Interfaces for Autonomous AI",
      updatedAt: Date.now(),
      phases: DEFAULT_PHASES_TEMPLATE.map(p => {
        if (p.id === 1) {
          return {
            ...p,
            fields: p.fields.map(f => {
              if (f.id === 'founder_background') return { ...f, value: "6 years Senior UX Architect at a Series C fintech. Led design teams of 8 designers. Strong track record in prototyping and design systems." };
              if (f.id === 'business_idea') return { ...f, value: "A specialized product design consultancy helping B2B SaaS startups design intuitive AI workflows and generative agent interfaces." };
              if (f.id === 'problem_solved') return { ...f, value: "Startups add messy AI features without UX thought, causing user confusion and high churn rates." };
              if (f.id === 'target_audience') return { ...f, value: "Early-stage AI founders, Series A SaaS product leads, and technical CTOs needing design polish." };
              if (f.id === 'why_now') return { ...f, value: "LLM adoption is surging, but user experience is lagging. Our deep enterprise design background provides instant credibility." };
              return f;
            })
          };
        }
        if (p.id === 2) {
          return {
            ...p,
            fields: p.fields.map(f => {
              if (f.id === 'competitors') return { ...f, value: "Generic design agencies (slow & don't understand LLMs), in-house developers (lack UX craft)." };
              if (f.id === 'uvp') return { ...f, value: "We deliver battle-tested AI interaction designs in 10-day sprints, guaranteed to cut user cognitive overload by 50%." };
              if (f.id === 'market_size') return { ...f, value: "25,000+ funded B2B SaaS startups adding generative AI features globally. $4B addressable market." };
              if (f.id === 'monetization') return { ...f, value: "Tier 1: 10-Day AI UX Audit ($4,500). Tier 2: Full Product Sprint ($12,000). Tier 3: Monthly Advisory Retainer ($5,000/mo)." };
              if (f.id === 'validation_plan') return { ...f, value: "15 customer discovery calls with YC founders, 1 free pilot case study, and a high-converting teardown landing page." };
              return f;
            })
          };
        }
        return p;
      })
    }
  },
  {
    name: "SaaS Analytics & Workflow Micro-Tool",
    description: "Lightweight, privacy-first conversion tracking tool for solopreneurs and indie hackers.",
    plan: {
      id: "sample_saas_tool",
      name: "PulseTrace Analytics",
      title: "PulseTrace Analytics",
      tagline: "Zero-Cookie Conversion Insights for Independent Builders",
      updatedAt: Date.now(),
      phases: DEFAULT_PHASES_TEMPLATE.map(p => {
        if (p.id === 1) {
          return {
            ...p,
            fields: p.fields.map(f => {
              if (f.id === 'founder_background') return { ...f, value: "Full-stack engineer with 7 years experience building high-throughput web apps and developer tools." };
              if (f.id === 'business_idea') return { ...f, value: "A ultra-clean, privacy-first analytics tool that tracks conversion funnels with a single script tag and no cookie banners." };
              if (f.id === 'problem_solved') return { ...f, value: "Google Analytics is bloated, complex, and violates GDPR. Creators just want simple funnel dropoff stats." };
              if (f.id === 'target_audience') return { ...f, value: "Solopreneurs, indie hackers, SaaS founders, and creators running productized services." };
              if (f.id === 'why_now') return { ...f, value: "Privacy regulations and browser third-party cookie deprecation make lightweight first-party tracking essential." };
              return f;
            })
          };
        }
        return p;
      })
    }
  }
];

export const createNewFastTrackPlan = (title = "My Startup Fast Track Plan"): FastTrackPlan => {
  return {
    id: 'ft_' + Math.random().toString(36).substring(2, 9),
    name: title,
    title: title,
    tagline: "From Idea to Launch in Record Time",
    updatedAt: Date.now(),
    phases: JSON.parse(JSON.stringify(DEFAULT_PHASES_TEMPLATE))
  };
};
