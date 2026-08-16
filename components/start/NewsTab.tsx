import React, { useState, useEffect } from 'react';
import { 
  Newspaper, ExternalLink, Bookmark, Search, Sparkles, 
  TrendingUp, RefreshCw, Filter, Plus, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface NewsArticle {
  id: string;
  title: string;
  snippet: string;
  url: string;
  source: string;
  topic: 'AI' | 'Startups' | 'Business' | 'Technology' | 'Creator Economy' | 'Markets' | 'Product Launches';
  publishedAt: string;
  readTime: string;
  imageUrl?: string;
}

const INITIAL_NEWS_ARTICLES: NewsArticle[] = [
  // AI news
  {
    id: 'ai-1',
    title: 'OpenAI Announces GPT-5 Developer Preview with Advanced Agentic Reasoning',
    snippet: 'The next generation model introduces multi-step autonomous planning, zero-shot code execution in sandboxed environments, and native reasoning tokens.',
    url: 'https://openai.com/news',
    source: 'OpenAI Blog',
    topic: 'AI',
    publishedAt: '2 hours ago',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ai-2',
    title: 'Anthropic Releases Claude 3.5 Opus with Deep Research Capabilities',
    snippet: 'New architecture shifts focus toward autonomous web synthesis, complex document analysis, and zero-hallucination factual verification.',
    url: 'https://anthropic.com/news',
    source: 'Anthropic Research',
    topic: 'AI',
    publishedAt: '4 hours ago',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ai-3',
    title: 'Google DeepMind Unveils Gemini 2.5 Pro with Native Multimodal Live Audio Stream',
    snippet: 'Real-time audio and vision reasoning capabilities allow developers to build low-latency interactive agents across web and mobile platforms.',
    url: 'https://blog.google/technology/ai',
    source: 'Google DeepMind',
    topic: 'AI',
    publishedAt: '5 hours ago',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ai-4',
    title: 'Meta Open-Sources Llama 4 Code Models with 1M Token Context Window',
    snippet: 'Enterprise developers can now fine-tune massive open-weight models locally on sovereign infrastructure with unprecedented coding accuracy.',
    url: 'https://ai.meta.com/blog',
    source: 'Meta AI',
    topic: 'AI',
    publishedAt: '7 hours ago',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ai-5',
    title: 'Hugging Face Launches Autonomous Agent Hub for Enterprise Workflow Automation',
    snippet: 'A decentralized registry of verified tool-use agents allows seamless composition of multi-step business workflows in seconds.',
    url: 'https://huggingface.co/blog',
    source: 'Hugging Face',
    topic: 'AI',
    publishedAt: '9 hours ago',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600'
  },

  // Startup news
  {
    id: 'startup-1',
    title: 'Y Combinator W26 Batch Kickoff: AI Infrastructure and Sovereign Cloud Dominate',
    snippet: 'Over 300 early-stage startups selected for the latest batch, with a 65% tilt toward decentralized enterprise automation and developer tooling.',
    url: 'https://ycombinator.com/blog',
    source: 'Y Combinator',
    topic: 'Startups',
    publishedAt: '6 hours ago',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'startup-2',
    title: 'Global Venture Funding Recovers 28% YoY in Q3 Driven by AI & CleanTech',
    snippet: 'Venture capitalists deploy record capital into late-stage infrastructure plays while seed valuations stabilize across European and North American hubs.',
    url: 'https://techcrunch.com',
    source: 'TechCrunch',
    topic: 'Startups',
    publishedAt: '1 day ago',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'startup-3',
    title: 'Seed-Stage Valuations Reach New Highs as Founder-Led Bootstrapping Surges',
    snippet: 'More founders are reaching $1M ARR with lean remote teams before taking institutional venture capital.',
    url: 'https://sifted.eu',
    source: 'Sifted EU',
    topic: 'Startups',
    publishedAt: '12 hours ago',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'startup-4',
    title: 'Andreessen Horowitz Leads $150M Series B in Sovereign Autonomous Security Startup',
    snippet: 'Cybersecurity startups focusing on zero-trust AI agent perimeters see unprecedented venture inflows.',
    url: 'https://a16z.com',
    source: 'a16z News',
    topic: 'Startups',
    publishedAt: '15 hours ago',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600'
  },

  // Business news
  {
    id: 'biz-1',
    title: 'Stripe Launches Instant Cross-Border Stablecoin Settlements for Enterprises',
    snippet: 'Global merchants can now settle international invoices instantly with zero foreign exchange fees and automated ledger reconciliation.',
    url: 'https://stripe.com/news',
    source: 'Stripe Press',
    topic: 'Business',
    publishedAt: '3 hours ago',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'biz-2',
    title: 'Fortune 500 CFOs Accelerate Automation Budgets by 40% for Next Fiscal Year',
    snippet: 'Enterprise software spending shifts rapidly from legacy ERP licenses toward modular AI-driven accounting and treasury agents.',
    url: 'https://wsj.com',
    source: 'Wall Street Journal',
    topic: 'Business',
    publishedAt: '8 hours ago',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'biz-3',
    title: 'Global Supply Chains Embrace Autonomous Predictive Freight Routing',
    snippet: 'Logistics giants cut transit delays by 32% using real-time generative route optimization algorithms.',
    url: 'https://ft.com',
    source: 'Financial Times',
    topic: 'Business',
    publishedAt: '14 hours ago',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600'
  },

  // Technology
  {
    id: 'tech-1',
    title: 'Apple Unveils Next-Gen Silicon M5 Ultra Built on 2nm Process Node',
    snippet: 'Boasting 128 unified memory cores and dedicated neural accelerators, the M5 Ultra redefines on-device neural network training benchmarks.',
    url: 'https://apple.com/newsroom',
    source: 'Apple Newsroom',
    topic: 'Technology',
    publishedAt: '5 hours ago',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'tech-2',
    title: 'Quantum Computing Breakthrough: 10,000 Logical Qubits Achieved in Error-Corrected Grid',
    snippet: 'Physicists mark a major milestone toward fault-tolerant quantum supremacy for complex pharmaceutical simulations.',
    url: 'https://technologyreview.com',
    source: 'MIT Tech Review',
    topic: 'Technology',
    publishedAt: '11 hours ago',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'tech-3',
    title: 'Starlink Direct-to-Cell Satellite Constellation Reaches 100% Global Coverage',
    snippet: 'Standard mobile devices can now maintain high-speed broadband connectivity anywhere on Earth without terrestrial cellular towers.',
    url: 'https://spacex.com',
    source: 'SpaceX News',
    topic: 'Technology',
    publishedAt: '16 hours ago',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&q=80&w=600'
  },

  // Creator economy
  {
    id: 'creator-1',
    title: 'Substack Introduces Direct Video Streaming and Fractional Membership Tiers',
    snippet: 'Independent creators gain sovereign monetization tools to bundle newsletters, video episodes, and private community chat access.',
    url: 'https://substack.com',
    source: 'Substack Blog',
    topic: 'Creator Economy',
    publishedAt: '8 hours ago',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'creator-2',
    title: 'Creator Economy Market Valuation Projected to Reach $480 Billion by 2028',
    snippet: 'Brand sponsorships shift from mega-influencers to hyper-targeted micro-communities and sovereign subscriber networks.',
    url: 'https://forbes.com',
    source: 'Forbes',
    topic: 'Creator Economy',
    publishedAt: '1 day ago',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'creator-3',
    title: 'YouTube Launches AI Dubbing and Real-Time Multilingual Creator Studio',
    snippet: 'Creators can instantly translate and clone their voice into 40+ languages while preserving exact vocal inflection and acoustic timbre.',
    url: 'https://blog.youtube',
    source: 'YouTube Creator Blog',
    topic: 'Creator Economy',
    publishedAt: '13 hours ago',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600'
  },

  // Markets
  {
    id: 'market-1',
    title: 'S&P 500 Reaches New All-Time High Led by Semiconductor and Cloud Majors',
    snippet: 'Wall Street analysts point to resilient corporate earnings and expanding enterprise software margins as primary market catalysts.',
    url: 'https://bloomberg.com',
    source: 'Bloomberg Markets',
    topic: 'Markets',
    publishedAt: '2 hours ago',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'market-2',
    title: 'Federal Reserve Holds Interest Rates Steady Amid Robust Employment Data',
    snippet: 'Chairman statements emphasize data-dependent monetary policy and continued vigilance against inflationary pressures in housing and services.',
    url: 'https://reuters.com',
    source: 'Reuters',
    topic: 'Markets',
    publishedAt: '7 hours ago',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'market-3',
    title: 'European Sovereign Bond Yields Stabilize as Energy Transition Investments Accelerate',
    snippet: 'Institutional capital flows strongly into green infrastructure funds across Frankfurt, London, and Paris exchanges.',
    url: 'https://ft.com',
    source: 'Financial Times',
    topic: 'Markets',
    publishedAt: '18 hours ago',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600'
  },

  // Product launches
  {
    id: 'launch-1',
    title: 'Product Hunt Golden Kitty Award Winner: Cordoval Sovereign OS Named Product of the Year',
    snippet: 'The all-in-one sovereign productivity and AI workspace wins acclaim for its lightning-fast client-side architecture and offline resilience.',
    url: 'https://producthunt.com',
    source: 'Product Hunt',
    topic: 'Product Launches',
    publishedAt: '1 hour ago',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'launch-2',
    title: 'Notion 4.0 Released with Native AI Co-Pilots and Relational Graph Databases',
    snippet: 'Users can now link unstructured notes directly to relational database rows with real-time multiplayer synchronization.',
    url: 'https://notion.so/releases',
    source: 'Notion Changelog',
    topic: 'Product Launches',
    publishedAt: '10 hours ago',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'launch-3',
    title: 'Figma AI Design Systems: Generate Production-Ready React Components from Wireframes',
    snippet: 'Designers and engineers can now bridge the gap instantly with native bi-directional code synthesis and token synchronization.',
    url: 'https://figma.com/blog',
    source: 'Figma Releases',
    topic: 'Product Launches',
    publishedAt: '14 hours ago',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=600'
  }
];

// Additional simulated incoming live posts that get dynamically injected via live RSS polling simulation
const LIVE_INCOMING_FEED_POOL: NewsArticle[] = [
  {
    id: 'live-1',
    title: 'BREAKING: Autonomous AI Agents Now Negotiate Enterprise Software Contracts Autonomously',
    snippet: 'Recent breakthrough in multi-agent negotiation protocols allows secure corporate procurement without human friction.',
    url: 'https://techcrunch.com',
    source: 'TechCrunch Live',
    topic: 'AI',
    publishedAt: 'Just now',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'live-2',
    title: 'Y Combinator Announces New Sovereign Cloud Grant Program for 2026 Batch',
    snippet: 'Selected startups receive $500k in dedicated compute credits and zero-latency enterprise gateway access.',
    url: 'https://ycombinator.com',
    source: 'Y Combinator',
    topic: 'Startups',
    publishedAt: 'Just now',
    readTime: '2 min read',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'live-3',
    title: 'Global Semiconductor Giants Announce Next-Gen 1.4nm Fab Construction Plans',
    snippet: 'Multi-billion dollar capital expenditure aims to satisfy explosive global demand for sovereign AI chips.',
    url: 'https://reuters.com',
    source: 'Reuters Markets',
    topic: 'Markets',
    publishedAt: 'Just now',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'live-4',
    title: 'Creator Platform Patreon Adds Direct Token-Gated Community Channels',
    snippet: 'Independent creators gain granular control over subscriber perks and sovereign token distribution.',
    url: 'https://substack.com',
    source: 'Creator Daily',
    topic: 'Creator Economy',
    publishedAt: 'Just now',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600'
  }
];

export const NewsTab: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem('cordoval_news_articles_v2');
    return saved ? JSON.parse(saved) : INITIAL_NEWS_ARTICLES;
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('cordoval_news_saved_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [liveUpdateCount, setLiveUpdateCount] = useState<number>(0);

  // Save articles and bookmarks
  useEffect(() => {
    localStorage.setItem('cordoval_news_articles_v2', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('cordoval_news_saved_ids', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Auto-polling live feed simulation (simulate sites uploading new content automatically every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomPoolItem = LIVE_INCOMING_FEED_POOL[Math.floor(Math.random() * LIVE_INCOMING_FEED_POOL.length)];
      const uniqueNewPost: NewsArticle = {
        ...randomPoolItem,
        id: `auto-live-${Date.now()}`,
        publishedAt: 'Just now'
      };

      setArticles(prev => {
        // Prevent duplicate titles
        if (prev.some(a => a.title === uniqueNewPost.title)) return prev;
        setLiveUpdateCount(c => c + 1);
        return [uniqueNewPost, ...prev];
      });
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(item => item !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const handleRefreshFeeds = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Pull next item from pool if available
      const randomPoolItem = LIVE_INCOMING_FEED_POOL[Math.floor(Math.random() * LIVE_INCOMING_FEED_POOL.length)];
      const manualNewPost: NewsArticle = {
        ...randomPoolItem,
        id: `manual-refresh-${Date.now()}`,
        publishedAt: 'Just now'
      };
      setArticles(prev => [manualNewPost, ...prev]);
      setIsRefreshing(false);
      setLiveUpdateCount(c => c + 1);
    }, 800);
  };

  const topics = [
    'All',
    'AI',
    'Startups',
    'Business',
    'Technology',
    'Creator Economy',
    'Markets',
    'Product Launches'
  ];

  const filteredArticles = articles.filter(article => {
    const matchesTopic = selectedTopic === 'All' || article.topic === selectedTopic;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBookmark = !showBookmarksOnly || bookmarkedIds.includes(article.id);
    return matchesTopic && matchesSearch && matchesBookmark;
  });

  // "More" button handler to simulate fetching additional batch of articles for the selected topic
  const handleLoadMoreForCategory = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const extraBatch: NewsArticle[] = [
        {
          id: `more-1-${Date.now()}`,
          title: `Advanced ${selectedTopic === 'All' ? 'Industry' : selectedTopic} Protocols Released for Global Enterprise Deployment`,
          snippet: 'Leading research labs and industry syndicates publish open standards for sovereign compliance and secure data pipelines.',
          url: 'https://github.com',
          source: 'Global Wire',
          topic: selectedTopic === 'All' ? 'Technology' : (selectedTopic as any),
          publishedAt: 'Just now',
          readTime: '4 min read',
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'
        },
        {
          id: `more-2-${Date.now()}`,
          title: `Top Analysts Share Q3 Outlook on ${selectedTopic === 'All' ? 'Global Markets' : selectedTopic} Growth Trajectory`,
          snippet: 'Key macroeconomic indicators point toward sustained bullish sentiment and rapid venture capital deployment.',
          url: 'https://bloomberg.com',
          source: 'Market Watch',
          topic: selectedTopic === 'All' ? 'Markets' : (selectedTopic as any),
          publishedAt: '1 hour ago',
          readTime: '5 min read',
          imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600'
        },
        {
          id: `more-3-${Date.now()}`,
          title: `Next-Gen Architecture Redefines ${selectedTopic === 'All' ? 'Sovereignty Standards' : selectedTopic} for 2026`,
          snippet: 'Engineers worldwide adopt decentralized protocols to ensure uncompromising data privacy and lightning-fast execution.',
          url: 'https://techcrunch.com',
          source: 'Tech Insights',
          topic: selectedTopic === 'All' ? 'AI' : (selectedTopic as any),
          publishedAt: '2 hours ago',
          readTime: '4 min read',
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600'
        }
      ];
      setArticles(prev => [...prev, ...extraBatch]);
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black shadow-inner relative">
            <Newspaper size={22} />
            {liveUpdateCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                {liveUpdateCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Global News & RSS Feeds</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Real-time RSS ingestion across AI, Startups, Business, Tech, Creator Economy, Markets, and Launches.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search news articles, sources..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showBookmarksOnly ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Bookmark size={14} />
            <span className="hidden sm:inline">Saved ({bookmarkedIds.length})</span>
          </button>

          <button
            onClick={handleRefreshFeeds}
            disabled={isRefreshing}
            className="p-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Poll RSS Feeds Now"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-indigo-600' : ''} />
            <span className="hidden md:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* Topic Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto flex-shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-1">
          <Filter size={12} /> Topics:
        </span>
        {topics.map(topic => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedTopic === topic
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Main Articles Grid */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
        {filteredArticles.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
            <Newspaper className="text-slate-300" size={48} />
            <h3 className="text-sm font-bold text-slate-800">No articles found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {showBookmarksOnly ? 'You have not bookmarked any articles yet.' : 'Try adjusting your search query or selecting a different topic category.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => {
                const isBookmarked = bookmarkedIds.includes(article.id);
                return (
                  <motion.div
                    key={article.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
                    onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                  >
                    {article.imageUrl && (
                      <div className="h-48 overflow-hidden relative bg-slate-100">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 shadow-sm">
                          {article.topic}
                        </div>
                        <button
                          onClick={(e) => toggleBookmark(article.id, e)}
                          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-colors shadow-sm cursor-pointer ${
                            isBookmarked ? 'bg-indigo-600 text-white' : 'bg-white/90 text-slate-600 hover:text-slate-900'
                          }`}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                        >
                          <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{article.source}</span>
                          <div className="flex items-center gap-2">
                            <span>{article.publishedAt}</span>
                            <span>•</span>
                            <span>{article.readTime}</span>
                          </div>
                        </div>

                        <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {article.snippet}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:underline">
                        <span className="flex items-center gap-1.5">
                          Read original post <ExternalLink size={14} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* "More" Button at the bottom of all category pages */}
            <div className="flex justify-center pt-6 pb-12">
              <button
                onClick={handleLoadMoreForCategory}
                disabled={isRefreshing}
                className="px-8 py-3.5 bg-white border border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Fetching Live Feeds...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Load More {selectedTopic === 'All' ? 'Articles' : selectedTopic} Posts
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
