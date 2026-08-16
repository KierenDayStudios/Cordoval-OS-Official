export interface CuratedPodcast {
  id: string;
  title: string;
  author: string;
  url: string;
  mime: string;
  hostPlatform: string;
  category: string;
  description: string;
  image: string;
}

export const CURATED_CATEGORIES = [
  {
    "id": 1,
    "name": "Business"
  },
  {
    "id": 2,
    "name": "Technology"
  },
  {
    "id": 3,
    "name": "Solopreneur"
  },
  {
    "id": 4,
    "name": "AI & ML"
  },
  {
    "id": 5,
    "name": "Creative & Media"
  },
  {
    "id": 6,
    "name": "Culture & Society"
  },
  {
    "id": 7,
    "name": "Science & Edu"
  },
  {
    "id": 8,
    "name": "Self-Improvement"
  },
  {
    "id": 9,
    "name": "News & Politics"
  },
  {
    "id": 10,
    "name": "Health & Fitness"
  },
  {
    "id": 11,
    "name": "Entertainment"
  },
  {
    "id": 12,
    "name": "Local-First"
  }
];

export const CURATED_PODCASTS: CuratedPodcast[] = [
  {
    "id": "diary-of-a-ceo",
    "title": "The Diary Of A CEO",
    "author": "Steven Bartlett",
    "url": "https://feeds.acast.com/public/shows/c6d80f60-4ad1-4850-a231-628c674db178",
    "mime": "audio/mpeg",
    "hostPlatform": "Acast",
    "category": "Business",
    "description": "Steven Bartlett deconstructs the stories and masterclass mindsets of the world's most influential people.",
    "image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "100-mba-show",
    "title": "The $100 MBA Show",
    "author": "Omar Zenhom",
    "url": "https://feeds.libsyn.com/53013/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Business",
    "description": "Real-world business lessons for real-world entrepreneurial success. Straight to the point, zero fluff.",
    "image": "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "entrepreneurs-on-fire",
    "title": "Entrepreneurs on Fire",
    "author": "John Lee Dumas",
    "url": "https://entrepreneuronfire.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Business",
    "description": "Award-winning podcast where JLD interviews inspiring entrepreneurs to guide you on your journey.",
    "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "how-i-built-this",
    "title": "How I Built This",
    "author": "Guy Raz / NPR",
    "url": "https://feeds.npr.org/510313/podcast.xml",
    "mime": "audio/mpeg",
    "hostPlatform": "NPR Distribution",
    "category": "Business",
    "description": "Guy Raz dives into the stories behind some of the world's best-known companies and brands.",
    "image": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "planet-money",
    "title": "Planet Money",
    "author": "NPR",
    "url": "https://feeds.npr.org/510289/podcast.xml",
    "mime": "audio/mpeg",
    "hostPlatform": "NPR Distribution",
    "category": "Business",
    "description": "The economy, explained. Imagine you could call up a friend and say: 'Meet me at the bar and tell me what's going on with the economy.'",
    "image": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "business-wars",
    "title": "Business Wars",
    "author": "Wondery",
    "url": "https://rss.art19.com/business-wars",
    "mime": "audio/mpeg",
    "hostPlatform": "Art19",
    "category": "Business",
    "description": "Business Wars gives you the unauthorized, real story of what drives companies and their leaders to new heights.",
    "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "noah-kagan-presents",
    "title": "Noah Kagan Presents",
    "author": "Noah Kagan",
    "url": "https://noahkagan.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Business",
    "description": "Top strategies and case studies on launching products, starting businesses, and living a fulfilling life.",
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "twit",
    "title": "This Week in Tech (TWiT)",
    "author": "Leo Laporte / TWiT",
    "url": "https://feeds.twit.tv/twit.xml",
    "mime": "audio/mpeg",
    "hostPlatform": "TWiT CDN",
    "category": "Technology",
    "description": "Your guide to every major development in tech. Leo Laporte and friends discuss the most relevant trends.",
    "image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "atp",
    "title": "Accidental Tech Podcast",
    "author": "Marco Arment, Casey Liss, John Siracusa",
    "url": "https://atp.fm/episodes?format=rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Custom / Linode",
    "category": "Technology",
    "description": "Three veteran developers discuss Apple, programming, computing history, and the state of modern technology.",
    "image": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "syntax",
    "title": "Syntax - Tasty Web Development",
    "author": "Wes Bos & Scott Tolinski",
    "url": "https://feed.syntax.fm/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Sentry / Simplecast",
    "category": "Technology",
    "description": "A tasty podcast for web developers. Wes Bos and Scott Tolinski discuss JavaScript, CSS, frameworks, servers, and full stack architecture.",
    "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "se-daily",
    "title": "Software Engineering Daily",
    "author": "SE Daily Team",
    "url": "https://softwareengineeringdaily.com/feed/podcast/",
    "mime": "audio/mpeg",
    "hostPlatform": "WordPress / Custom",
    "category": "Technology",
    "description": "Technical interviews and breakdowns about system architecture, cloud platforms, DevOps, and machine learning.",
    "image": "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "changelog",
    "title": "The Changelog",
    "author": "Adam Stacoviak & Jerod Santo",
    "url": "https://changelog.com/podcast/feed",
    "mime": "audio/mpeg",
    "hostPlatform": "Custom / Fastly",
    "category": "Technology",
    "description": "Conversations with founders, open source developers, hackers, and software leaders shaping the tech landscape.",
    "image": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "darknet-diaries",
    "title": "Darknet Diaries",
    "author": "Jack Rhysider",
    "url": "https://feeds.megaphone.fm/DARKNETDIARIES",
    "mime": "audio/mpeg",
    "hostPlatform": "Megaphone",
    "category": "Technology",
    "description": "True stories from the dark side of the Internet. Hackers, cyber security breaches, shadow operations, and government espionage.",
    "image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "devtools-fm",
    "title": "DevTools FM",
    "author": "Andrew Lisowski & Justin Bennett",
    "url": "https://anchor.fm/s/dd6922b4/podcast/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Spotify / Anchor",
    "category": "Technology",
    "description": "A podcast about developer tools and the developers who build them. Deep technical insights and user experience design.",
    "image": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "se-radio",
    "title": "Software Engineering Radio",
    "author": "IEEE Computer Society",
    "url": "https://feeds.feedburner.com/se-radio",
    "mime": "audio/mpeg",
    "hostPlatform": "FeedBurner / Libsyn",
    "category": "Technology",
    "description": "The podcast for professional software developers. Targeted at school graduates and senior system managers.",
    "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "streamlined-solopreneur",
    "title": "Streamlined Solopreneur",
    "author": "Joe Casabona",
    "url": "https://back.streamlined.fm/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "RSS.com / Transistor",
    "category": "Solopreneur",
    "description": "Tactical tips on automation, system design, and outsourcing to help solopreneurs scale and reclaim time.",
    "image": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "solopreneur-grind",
    "title": "Solopreneur Grind",
    "author": "Josh Schachnow",
    "url": "https://feed.podbean.com/solopreneurgrind/feed.xml",
    "mime": "audio/mpeg",
    "hostPlatform": "Podbean",
    "category": "Solopreneur",
    "description": "Real stories and systems for solo founders, freelancers, and agency builders going from zero to one.",
    "image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "side-hustle",
    "title": "The Side Hustle Show",
    "author": "Nick Loper",
    "url": "https://sidehustlenation.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Solopreneur",
    "description": "Actionable part-time business ideas, side hustle systems, and marketing tactics to create new income streams.",
    "image": "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "ai-daily-brief",
    "title": "The AI Daily Brief",
    "author": "Nathaniel Whittemore (NLW)",
    "url": "https://anchor.fm/s/f7cac464/podcast/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Spotify / Anchor",
    "category": "AI & ML",
    "description": "The leading daily podcast on artificial intelligence, covering commercial disruption, and developer tooling.",
    "image": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "lex-fridman",
    "title": "Lex Fridman Podcast",
    "author": "Lex Fridman",
    "url": "https://lexfridman.com/feed/podcast/",
    "mime": "audio/mpeg",
    "hostPlatform": "Custom / Libsyn",
    "category": "AI & ML",
    "description": "Conversations about deep learning, robotics, consciousness, cosmology, and the future of human intelligence.",
    "image": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "latent-space",
    "title": "Latent Space",
    "author": "Swyx & Alessio Fanelli",
    "url": "https://www.latent.space/feed",
    "mime": "audio/mpeg",
    "hostPlatform": "Substack",
    "category": "AI & ML",
    "description": "The AI engineer podcast. In-depth technical breakdowns of foundational model research, open weights, and LLM ops.",
    "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "practical-ai",
    "title": "Practical AI",
    "author": "Daniel Whitenack & Chris Benson",
    "url": "https://changelog.com/practicalai/feed",
    "mime": "audio/mpeg",
    "hostPlatform": "Custom / Fastly",
    "category": "AI & ML",
    "description": "Making artificial intelligence practical, productive, and accessible to developers and system builders.",
    "image": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "twiml-ai",
    "title": "TWIML AI Podcast",
    "author": "Sam Charrington",
    "url": "https://twimlai.com/feed/podcast/",
    "mime": "audio/mpeg",
    "hostPlatform": "WordPress / Libsyn",
    "category": "AI & ML",
    "description": "This Week in Machine Learning and AI. Bringing you the leading voices in artificial intelligence, deep learning, and MLOps.",
    "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "a16z-ai",
    "title": "a16z Podcast (AI Series)",
    "author": "Andreessen Horowitz",
    "url": "https://feeds.simplecast.com/Hb_IuXOo",
    "mime": "audio/mpeg",
    "hostPlatform": "Simplecast",
    "category": "AI & ML",
    "description": "Venture firm a16z analyzes the foundational layer, commercial shifts, and technical vectors of AI.",
    "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "artcurious",
    "title": "Artcurious Podcast",
    "author": "Jennifer Dasal",
    "url": "https://artcurious.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Creative & Media",
    "description": "Exploring the unexpected, the slightly odd, and the strangely wonderful aspects of art history.",
    "image": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "user-defenders",
    "title": "User Defenders",
    "author": "Jason Ogle",
    "url": "https://userdefenders.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Creative & Media",
    "description": "The premier UX podcast focusing on empathy-driven user experience design and interaction psychology.",
    "image": "https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "this-american-life",
    "title": "This American Life",
    "author": "Ira Glass / WBEZ",
    "url": "https://feeds.thisamericanlife.org/tallivepodcast",
    "mime": "audio/mpeg",
    "hostPlatform": "Custom / PRX",
    "category": "Culture & Society",
    "description": "The legendary long-form weekly public radio program. Mostly true stories about everyday lives.",
    "image": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "code-switch",
    "title": "Code Switch",
    "author": "NPR",
    "url": "https://feeds.npr.org/510312/podcast.xml",
    "mime": "audio/mpeg",
    "hostPlatform": "NPR Distribution",
    "category": "Culture & Society",
    "description": "Deep, fearless, and thoughtful conversations about race, representation, and cultural identity in society.",
    "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "philosophize-this",
    "title": "Philosophize This!",
    "author": "Stephen West",
    "url": "https://philosophizethis.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Culture & Society",
    "description": "An incredibly accessible, chronological journey through history's most profound philosophical thinkers.",
    "image": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "science-vs",
    "title": "Science Vs",
    "author": "Gimlet / Spotify",
    "url": "https://feeds.megaphone.fm/sciencevs",
    "mime": "audio/mpeg",
    "hostPlatform": "Megaphone",
    "category": "Science & Edu",
    "description": "Pitting facts, scientific evidence, and study citations against cultural myths and popular fads.",
    "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "huberman-lab",
    "title": "Huberman Lab",
    "author": "Dr. Andrew Huberman",
    "url": "https://feeds.megaphone.fm/hubermanlab",
    "mime": "audio/mpeg",
    "hostPlatform": "Megaphone",
    "category": "Science & Edu",
    "description": "Discussing neuroscience, physiological tools, and biological systems for human optimization.",
    "image": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "short-wave",
    "title": "Short Wave",
    "author": "NPR",
    "url": "https://feeds.npr.org/510351/podcast.xml",
    "mime": "audio/mpeg",
    "hostPlatform": "NPR Distribution",
    "category": "Science & Edu",
    "description": "A fast, daily, and highly visual space where NPR editors break down major discoveries.",
    "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "quanta-science",
    "title": "Quanta Science Podcast",
    "author": "Quanta Magazine",
    "url": "https://api.quantamagazine.org/feed/podcast",
    "mime": "audio/mpeg",
    "hostPlatform": "Custom / Enterprise",
    "category": "Science & Edu",
    "description": "Detailed articles and academic reviews of mathematics, cosmology, and quantum physics.",
    "image": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "naked-scientists",
    "title": "The Naked Scientists",
    "author": "Cambridge University",
    "url": "https://www.thenakedscientists.com/naked_scientists_podcast.xml",
    "mime": "audio/mpeg",
    "hostPlatform": "Cambridge University",
    "category": "Science & Edu",
    "description": "Top scientific updates, debates, and interactive Q&A sessions from Cambridge researchers.",
    "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "tim-ferriss",
    "title": "The Tim Ferriss Show",
    "author": "Tim Ferriss",
    "url": "https://timferriss.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Self-Improvement",
    "description": "Deconstructing world-class performers to extract the tactical tools, routines, and habits they use.",
    "image": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "knowledge-project",
    "title": "The Knowledge Project",
    "author": "Shane Parrish",
    "url": "https://theknowledgeproject.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Self-Improvement",
    "description": "Shane Parrish guides you through deep mental models, reading habits, and high-stakes decision architecture.",
    "image": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "deep-questions",
    "title": "Deep Questions with Cal Newport",
    "author": "Cal Newport",
    "url": "https://feeds.buzzsprout.com/1121972.rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Buzzsprout",
    "category": "Self-Improvement",
    "description": "Author Cal Newport answers questions about deep work, focus architectures, and living a minimalist digital life.",
    "image": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "optimal-living-daily",
    "title": "Optimal Living Daily",
    "author": "Justin Malik",
    "url": "https://optimallivingdaily.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Self-Improvement",
    "description": "Daily reading of the web's best articles on personal growth, productivity, and life hacks.",
    "image": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "up-first",
    "title": "Up First",
    "author": "NPR",
    "url": "https://feeds.npr.org/510318/podcast.xml",
    "mime": "audio/mpeg",
    "hostPlatform": "NPR Distribution",
    "category": "News & Politics",
    "description": "The three biggest news stories of the morning. Organized, objective, and presented in 10-15 minutes.",
    "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "global-news",
    "title": "Global News Podcast",
    "author": "BBC World Service",
    "url": "https://podcasts.files.bbci.co.uk/p02nq0gn.rss",
    "mime": "audio/mpeg",
    "hostPlatform": "BBC Engine",
    "category": "News & Politics",
    "description": "The world's half-hour digest of international reporting and analysis from the BBC World Service.",
    "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "foundmyfitness",
    "title": "FoundMyFitness",
    "author": "Dr. Rhonda Patrick",
    "url": "https://foundmyfitness.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Health & Fitness",
    "description": "Dr. Rhonda Patrick discusses biological pathways, heat shock proteins, micronutrients, and fitness science.",
    "image": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "mind-pump",
    "title": "Mind Pump: Raw Fitness",
    "author": "Mind Pump Media",
    "url": "https://mindpump.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Health & Fitness",
    "description": "Raw fitness, science, muscle building, and health advice mixed with humor and cultural commentary.",
    "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "model-health",
    "title": "The Model Health Show",
    "author": "Shawn Stevenson",
    "url": "https://themodelhealthshow.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Health & Fitness",
    "description": "Shawn Stevenson explores nutrition, optimal sleep habits, exercise physiology, and clinical biochemistry.",
    "image": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "ben-greenfield",
    "title": "Ben Greenfield Life",
    "author": "Ben Greenfield",
    "url": "https://bengreenfieldfitness.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Health & Fitness",
    "description": "Explosive, unconventional health advice covering biohacking, sleep protocols, and muscle performance.",
    "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "maintenance-phase",
    "title": "Maintenance Phase",
    "author": "Aubrey Gordon & Michael Hobbes",
    "url": "https://feeds.buzzsprout.com/1411126.rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Buzzsprout",
    "category": "Health & Fitness",
    "description": "Debunking the junk science, corporate scams, and historical trends of the wellness vertical.",
    "image": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "muscle-for-life",
    "title": "Muscle For Life",
    "author": "Mike Matthews",
    "url": "https://muscleforlife.libsyn.com/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn",
    "category": "Health & Fitness",
    "description": "Mike Matthews teaches science-based weightlifting, meal preparation, and behavior loops for longevity.",
    "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "rewatchables",
    "title": "The Rewatchables",
    "author": "Bill Simmons / The Ringer",
    "url": "https://feeds.megaphone.fm/the-rewatchables",
    "mime": "audio/mpeg",
    "hostPlatform": "Megaphone",
    "category": "Entertainment",
    "description": "Bill Simmons and Ringer staff discuss the movies they can't stop rewatching.",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "filmspotting",
    "title": "Filmspotting",
    "author": "Adam Kempenaar & Josh Larsen",
    "url": "https://feeds.feedburner.com/filmspotting",
    "mime": "audio/mpeg",
    "hostPlatform": "FeedBurner",
    "category": "Entertainment",
    "description": "Chicago's premier film review podcast, offering reviews, top 5 lists, and cinematic analysis.",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "pop-culture-happy-hour",
    "title": "Pop Culture Happy Hour",
    "author": "NPR",
    "url": "https://feeds.npr.org/510282/podcast.xml",
    "mime": "audio/mpeg",
    "hostPlatform": "NPR Distribution",
    "category": "Entertainment",
    "description": "Your daily guide to television, movies, books, video games, and cultural trends from NPR.",
    "image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "localfirst-fm",
    "title": "localfirst.fm",
    "author": "Johannes Schickling & Adam Wiggins",
    "url": "https://www.localfirst.fm/feed.xml",
    "mime": "text/xml",
    "hostPlatform": "Vercel / Static XML",
    "category": "Local-First",
    "description": "Dedicated to the Local-First software movement: offline-first, client-side persistence, and peer-to-peer sync.",
    "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "devtools-fm-local",
    "title": "DevTools FM (Local-First Edition)",
    "author": "Andrew Lisowski & Justin Bennett",
    "url": "https://anchor.fm/s/dd6922b4/podcast/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Anchor / Spotify",
    "category": "Local-First",
    "description": "DevTools FM dives deep into developer tools, local compiling, ASTs, and local-first data systems.",
    "image": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "syntax-local",
    "title": "Syntax (Local-First Series)",
    "author": "Wes Bos & Scott Tolinski",
    "url": "https://feed.syntax.fm/rss",
    "mime": "audio/mpeg",
    "hostPlatform": "Sentry / Simplecast",
    "category": "Local-First",
    "description": "Wes Bos and Scott Tolinski discuss SQLite, PouchDB, RxDB, and constructing high-uptime offline web apps.",
    "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "se-radio-local",
    "title": "Software Engineering Radio (Local-First Special)",
    "author": "IEEE / Martin Kleppmann",
    "url": "https://se-radio.net/feed/",
    "mime": "audio/mpeg",
    "hostPlatform": "Libsyn / Enterprise",
    "category": "Local-First",
    "description": "Interviews with Martin Kleppmann and other scholars on local data, CRDTs, and relational consistency models.",
    "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "infoq-local",
    "title": "InfoQ Podcast (Local-First Architecture)",
    "author": "InfoQ Architecture Series",
    "url": "https://feed.infoq.com/podcasts/",
    "mime": "audio/mpeg",
    "hostPlatform": "InfoQ Engine",
    "category": "Local-First",
    "description": "Software architects analyze state replication, edge computing, conflict resolution, and decentralization.",
    "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    "id": "changelog-local",
    "title": "Changelog Master Feed (Local-First Web)",
    "author": "Changelog Media",
    "url": "https://changelog.com/podcast/feed",
    "mime": "audio/mpeg",
    "hostPlatform": "Custom / Fastly",
    "category": "Local-First",
    "description": "Changelog Media reviews independent developer tools, local compilation pipelines, and secure data sync.",
    "image": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=400&h=400"
  }
];
