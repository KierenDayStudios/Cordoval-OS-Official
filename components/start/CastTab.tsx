import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Search, Radio, 
  Clock, Tag, Filter, AlertCircle, Headphones, ArrowLeft, Flame, ChevronRight, Users, X,
  Sparkles, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CURATED_PODCASTS, CURATED_CATEGORIES } from '../../podcastsList';

export interface Episode {
  title: string;
  description: string;
  pubDate: string;
  audioUrl: string;
  duration: string;
  tags: string[];
  podcastName: string;
  imageUrl?: string;
}

export interface PodcastChannel {
  id: string;
  name: string;
  host: string;
  description: string;
  imageUrl: string;
  subscriberCount: string;
  tags: string[];
  rssFeedUrl?: string;
  episodes: Episode[];
}

const TAGS = [
  "Business",
  "Technology",
  "Solopreneur",
  "AI & ML",
  "Creative & Media",
  "Culture & Society",
  "Science & Edu",
  "Self-Improvement",
  "News & Politics",
  "Health & Fitness",
  "Entertainment",
  "Local-First"
];

const INITIAL_CHANNELS: PodcastChannel[] = [
  {
    id: "cordoval",
    name: "The Cordoval Business Show",
    host: "Cordoval Team",
    description: "Helps builders, founders, and managers build, grow, and manage a sovereign enterprise with tactical episodes on pricing, marketing, local-first operations, and design psychology.",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400",
    subscriberCount: "12,480 subscribers",
    tags: ["Business", "Solopreneur", "Self-Improvement", "Local-First"],
    rssFeedUrl: "https://media.rss.com/cordovalshow/feed.xml",
    episodes: [
      {
        title: "1. Scaling Solopreneur Operations with Smart Local-First AI Agents",
        description: "Explore how solopreneurs can deploy local-first workflows and autonomous models to automate 80% of routine client tasks without escalating subscription costs.",
        pubDate: "Aug 1, 2026",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: "18:42",
        tags: ["Business", "AI & ML", "Solopreneur", "Local-First"],
        podcastName: "The Cordoval Business Show",
        imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=200&h=200"
      },
      {
        title: "2. The Art of Pricing: Transitioning from Hourly Rates to Fixed Value Plans",
        description: "Hourly pricing is a race to the bottom. Learn how to package your creative and tech skills into durable, value-based products that scale with your brand.",
        pubDate: "Jul 30, 2026",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: "24:15",
        tags: ["Business", "Creative & Media", "Self-Improvement"],
        podcastName: "The Cordoval Business Show",
        imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=200&h=200"
      },
      {
        title: "3. Building Modern Apps with Zero Subscription Dependencies",
        description: "Why pay thousands in recurring SaaS fees? This deep-dive outlines the architecture of building self-hosted, sovereign, offline-first apps that respect privacy.",
        pubDate: "Jul 28, 2026",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: "31:05",
        tags: ["Technology", "Local-First", "AI & ML"],
        podcastName: "The Cordoval Business Show",
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=200&h=200"
      }
    ]
  }
];

interface CastTabProps {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  allEpisodes: Episode[];
  loadingEpisodes: boolean;
  onSelectEpisode: (ep: Episode) => void;
  onTogglePlay: () => void;
  onSetVolume: (vol: number) => void;
  onSetMuted: (muted: boolean) => void;
  onSetPlaybackRate: (rate: number) => void;
  onSeek: (seconds: number) => void;
  onClosePlayer?: () => void;
  onNavigate?: (view: any, data?: any) => void;
}

export const CastTab: React.FC<CastTabProps> = ({
  currentEpisode,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  allEpisodes,
  loadingEpisodes,
  onSelectEpisode,
  onTogglePlay,
  onSetVolume,
  onSetMuted,
  onSetPlaybackRate,
  onSeek,
  onClosePlayer,
  onNavigate
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleEpisodesCount, setVisibleEpisodesCount] = useState<number>(10);

  const [trendingPodcasts, setTrendingPodcasts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState<boolean>(false);
  const [currentChannelEpisodes, setCurrentChannelEpisodes] = useState<Episode[]>([]);
  const [selectedFeedDetails, setSelectedFeedDetails] = useState<any>(null);
  const [resolvedChannelImages, setResolvedChannelImages] = useState<Record<string, string>>({});

  const fetchChannelImage = async (feedUrl: string): Promise<string | null> => {
    let xmlText = '';
    let success = false;

    const proxyGenerators = [
      (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ];

    try {
      const response = await fetch(feedUrl);
      if (response.ok) {
        const text = await response.text();
        if (text && (text.trim().startsWith('<') || text.includes('<rss') || text.includes('<feed'))) {
          xmlText = text;
          success = true;
        }
      }
    } catch (e) {}

    if (!success) {
      for (const getProxy of proxyGenerators) {
        try {
          const response = await fetch(getProxy(feedUrl));
          if (response.ok) {
            const text = await response.text();
            if (text && (text.trim().startsWith('<') || text.includes('<rss') || text.includes('<feed') || text.includes('<channel'))) {
              xmlText = text;
              success = true;
              break;
            }
          }
        } catch (err) {}
      }
    }

    if (!success || !xmlText) return null;

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const itunesImage = xmlDoc.querySelector('channel > image') || xmlDoc.querySelector('image');
      if (itunesImage) {
        const href = itunesImage.getAttribute('href');
        if (href) return href;
      }

      const itunesImages = xmlDoc.getElementsByTagName('itunes:image');
      if (itunesImages.length > 0) {
        const href = itunesImages[0].getAttribute('href');
        if (href) return href;
      }

      const urlTag = xmlDoc.querySelector('channel > image > url') || xmlDoc.querySelector('image > url');
      if (urlTag && urlTag.textContent) {
        return urlTag.textContent.trim();
      }
    } catch (e) {
      console.warn("Error parsing channel XML for image", e);
    }

    return null;
  };

  // Pre-fetch channel images sequentially in the background
  useEffect(() => {
    const list = searchQuery ? searchResults : trendingPodcasts;
    if (!list || list.length === 0) return;

    const feedsToFetch = list.filter(
      feed => feed && feed.url && !resolvedChannelImages[feed.id] && !resolvedChannelImages[feed.url]
    );

    if (feedsToFetch.length === 0) return;

    let active = true;

    const fetchNext = async (index: number) => {
      if (!active || index >= feedsToFetch.length) return;
      const feed = feedsToFetch[index];
      
      try {
        const imgUrl = await fetchChannelImage(feed.url);
        if (imgUrl && active) {
          setResolvedChannelImages(prev => ({
            ...prev,
            [feed.id]: imgUrl,
            [feed.url]: imgUrl
          }));
        }
      } catch (err) {
        console.warn(`Could not resolve cover image for ${feed.title}`, err);
      }

      setTimeout(() => {
        fetchNext(index + 1);
      }, 1000);
    };

    fetchNext(0);

    return () => {
      active = false;
    };
  }, [trendingPodcasts, searchResults]);

  const cordovalFeed: any = {
    id: "cordoval",
    title: "The Cordoval Business Show",
    author: "Cordoval Team",
    description: "Helps builders, founders, and managers build, grow, and manage a sovereign enterprise with tactical episodes on pricing, marketing, local-first operations, and design psychology.",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400",
    subscriberCount: "12,480 subscribers",
    categories: { "1": "Business", "3": "Solopreneur", "8": "Self-Improvement", "12": "Local-First" },
    url: "https://media.rss.com/cordovalshow/feed.xml"
  };

  const getLocalTrending = () => {
    const trendingList = [cordovalFeed];
    const selectedPodcasts: typeof CURATED_PODCASTS = [];
    CURATED_CATEGORIES.forEach(cat => {
      const match = CURATED_PODCASTS.find(p => p.category === cat.name);
      if (match && !selectedPodcasts.some(p => p.id === match.id)) {
        selectedPodcasts.push(match);
      }
    });

    selectedPodcasts.forEach(p => {
      const catMap: Record<string, string> = {};
      const catObj = CURATED_CATEGORIES.find(c => c.name === p.category);
      if (catObj) {
        catMap[String(catObj.id)] = catObj.name;
      } else {
        catMap["1"] = p.category;
      }

      trendingList.push({
        id: p.id,
        title: p.title,
        author: p.author,
        description: p.description,
        image: p.image,
        subscriberCount: "100K+ listeners",
        categories: catMap,
        url: p.url
      });
    });

    return trendingList.filter((value, index, self) =>
      self.findIndex(t => t.id === value.id) === index
    );
  };

  const getLocalSearch = (q: string) => {
    const query = q.trim().toLowerCase();
    const results = [cordovalFeed];

    if (query) {
      const matchingCurated = CURATED_PODCASTS.filter(p => {
        return (
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.author.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      });

      matchingCurated.forEach(p => {
        const catMap: Record<string, string> = {};
        const catObj = CURATED_CATEGORIES.find(c => c.name === p.category);
        if (catObj) {
          catMap[String(catObj.id)] = catObj.name;
        } else {
          catMap["1"] = p.category;
        }

        results.push({
          id: p.id,
          title: p.title,
          author: p.author,
          description: p.description,
          image: p.image,
          subscriberCount: "100K+ listeners",
          categories: catMap,
          url: p.url
        });
      });
    } else {
      CURATED_PODCASTS.slice(0, 15).forEach(p => {
        const catMap: Record<string, string> = {};
        const catObj = CURATED_CATEGORIES.find(c => c.name === p.category);
        if (catObj) {
          catMap[String(catObj.id)] = catObj.name;
        } else {
          catMap["1"] = p.category;
        }

        results.push({
          id: p.id,
          title: p.title,
          author: p.author,
          description: p.description,
          image: p.image,
          subscriberCount: "100K+ listeners",
          categories: catMap,
          url: p.url
        });
      });
    }

    return results.filter((value, index, self) =>
      self.findIndex(t => t.id === value.id) === index
    );
  };

  const fetchAndParseRSSClient = async (feedUrl: string) => {
    let xmlText = '';
    let success = false;

    // Ordered list of CORS proxies
    const proxyGenerators = [
      (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ];

    // Try direct fetch first (in case of open CORS)
    try {
      const response = await fetch(feedUrl);
      if (response.ok) {
        const text = await response.text();
        if (text && (text.trim().startsWith('<') || text.includes('<rss') || text.includes('<feed'))) {
          xmlText = text;
          success = true;
        }
      }
    } catch (e) {
      console.warn('Direct RSS fetch failed or blocked by CORS, trying proxies...');
    }

    // Try CORS proxies sequentially
    if (!success) {
      for (let i = 0; i < proxyGenerators.length; i++) {
        const getProxyUrl = proxyGenerators[i];
        const proxyUrl = getProxyUrl(feedUrl);
        try {
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const text = await response.text();
            if (text && (text.trim().startsWith('<') || text.includes('<rss') || text.includes('<feed') || text.includes('<channel'))) {
              xmlText = text;
              success = true;
              break;
            }
          }
        } catch (err) {
          console.warn(`Proxy ${i + 1} failed for ${feedUrl}:`, err);
        }
      }
    }

    if (!success || !xmlText) {
      throw new Error(`Failed to retrieve RSS feed from ${feedUrl} using any method.`);
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Parse channel cover image
    let channelCoverImg = '';
    try {
      const itunesImage = xmlDoc.querySelector('channel > image') || xmlDoc.querySelector('image');
      if (itunesImage) {
        channelCoverImg = itunesImage.getAttribute('href') || '';
      }
      if (!channelCoverImg) {
        const itunesImages = xmlDoc.getElementsByTagName('itunes:image');
        if (itunesImages.length > 0) {
          channelCoverImg = itunesImages[0].getAttribute('href') || '';
        }
      }
      if (!channelCoverImg) {
        const urlTag = xmlDoc.querySelector('channel > image > url') || xmlDoc.querySelector('image > url');
        if (urlTag && urlTag.textContent) {
          channelCoverImg = urlTag.textContent.trim();
        }
      }
      
      if (channelCoverImg) {
        setResolvedChannelImages(prev => ({
          ...prev,
          [selectedChannelId || '']: channelCoverImg,
          [feedUrl]: channelCoverImg
        }));
      }
    } catch (e) {
      console.warn('Failed to parse channel cover image', e);
    }
    
    // Check if it's an Atom or RSS feed
    const items = xmlDoc.querySelectorAll('item, entry');
    const fetchedEpisodes: Episode[] = [];

    const getTagText = (el: Element, tagName: string): string => {
      try {
        let tag = el.querySelector(tagName);
        if (!tag) {
          const lowerName = tagName.toLowerCase();
          tag = Array.from(el.getElementsByTagName('*')).find(
            child => child.localName.toLowerCase() === lowerName
          ) || null;
        }
        return tag?.textContent || '';
      } catch (e) {
        const lowerName = tagName.toLowerCase();
        const tag = Array.from(el.getElementsByTagName('*')).find(
          child => child.localName.toLowerCase() === lowerName
        );
        return tag?.textContent || '';
      }
    };

    const getTagAttr = (el: Element, tagName: string, attrName: string): string => {
      try {
        let tag = el.querySelector(tagName);
        if (!tag) {
          const lowerName = tagName.toLowerCase();
          tag = Array.from(el.getElementsByTagName('*')).find(
            child => child.localName.toLowerCase() === lowerName
          ) || null;
        }
        return tag?.getAttribute(attrName) || '';
      } catch (e) {
        const lowerName = tagName.toLowerCase();
        const tag = Array.from(el.getElementsByTagName('*')).find(
          child => child.localName.toLowerCase() === lowerName
        );
        return tag?.getAttribute(attrName) || '';
      }
    };

    items.forEach((item, idx) => {
      const title = getTagText(item, 'title') || `Episode ${idx + 1}`;
      let description = getTagText(item, 'description') || getTagText(item, 'summary') || getTagText(item, 'content') || '';
      description = description.replace(/<[^>]*>/g, '').trim();
      if (description.length > 250) {
        description = description.substring(0, 250) + '...';
      }

      const pubDateRaw = getTagText(item, 'pubDate') || getTagText(item, 'published') || getTagText(item, 'updated') || '';
      
      // Enclosure resolution
      let audioUrl = getTagAttr(item, 'enclosure', 'url') || '';
      if (!audioUrl) {
        const linkHref = getTagAttr(item, 'link', 'href');
        if (linkHref && linkHref.includes('.mp3')) {
          audioUrl = linkHref;
        } else {
          audioUrl = getTagText(item, 'link') || '';
        }
      }

      let durationRaw = getTagText(item, 'duration') || '30:00';
      if (/^\d+$/.test(durationRaw.trim())) {
        const totalSecs = parseInt(durationRaw.trim(), 10);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        if (hrs > 0) {
          durationRaw = `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
        } else {
          durationRaw = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
      }

      let imageUrlRaw = getTagAttr(item, 'image', 'href') || getTagText(item, 'image') || '';

      const dateObj = new Date(pubDateRaw);
      const pubDate = isNaN(dateObj.getTime()) ? 'Unknown Date' : dateObj.toLocaleDateString([], {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      fetchedEpisodes.push({
        title,
        description,
        pubDate,
        audioUrl,
        duration: durationRaw,
        tags: ["Podcast"],
        podcastName: selectedFeedDetails?.title || "Podcast",
        imageUrl: imageUrlRaw || channelCoverImg || selectedFeedDetails?.image || selectedFeedDetails?.artwork || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400"
      });
    });

    return fetchedEpisodes;
  };

  // Reset visible episodes count when selected channel changes
  useEffect(() => {
    setVisibleEpisodesCount(10);
  }, [selectedChannelId]);

  // Load Trending & Categories
  const fetchTrendingAndCategories = async () => {
    setIsLoadingTrending(true);
    try {
      const trendingRes = await fetch('/api/podcast/trending');
      const contentType = trendingRes.headers.get("content-type") || "";
      if (trendingRes.ok && !contentType.includes("text/html")) {
        const trendingData = await trendingRes.json();
        if (trendingData.feeds) {
          setTrendingPodcasts(trendingData.feeds);
        } else {
          setTrendingPodcasts(getLocalTrending());
        }
      } else {
        setTrendingPodcasts(getLocalTrending());
      }
    } catch (err) {
      console.warn('Failed to fetch trending podcasts, falling back to local list', err);
      setTrendingPodcasts(getLocalTrending());
    } finally {
      setIsLoadingTrending(false);
    }

    try {
      const catRes = await fetch('/api/podcast/categories');
      const contentType = catRes.headers.get("content-type") || "";
      if (catRes.ok && !contentType.includes("text/html")) {
        const catData = await catRes.json();
        if (catData.feeds) {
          setCategories(catData.feeds);
        } else {
          setCategories(CURATED_CATEGORIES);
        }
      } else {
        setCategories(CURATED_CATEGORIES);
      }
    } catch (err) {
      console.warn('Failed to fetch categories, falling back to local categories', err);
      setCategories(CURATED_CATEGORIES);
    }
  };

  useEffect(() => {
    fetchTrendingAndCategories();
  }, []);

  // Handle Search Fetching
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoadingSearch(true);
    try {
      const res = await fetch(`/api/podcast/search?q=${encodeURIComponent(query)}`);
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && !contentType.includes("text/html")) {
        const data = await res.json();
        if (data.feeds) {
          setSearchResults(data.feeds);
        } else {
          setSearchResults(getLocalSearch(query));
        }
      } else {
        setSearchResults(getLocalSearch(query));
      }
    } catch (err) {
      console.warn('Podcast search failed, falling back to local search', err);
      setSearchResults(getLocalSearch(query));
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Fetch episodes when selectedChannelId changes
  useEffect(() => {
    if (!selectedChannelId) {
      setCurrentChannelEpisodes([]);
      return;
    }

    if (selectedChannelId === 'cordoval') {
      const fetchCordovalEpisodes = async () => {
        setIsLoadingEpisodes(true);
        try {
          const res = await fetch(`/api/podcast/episodes?feedId=cordoval`);
          if (res.ok) {
            const data = await res.json();
            const items = data.items || [];
            if (items.length > 0) {
              const mapped: Episode[] = items.map((item: any, idx: number) => {
                const durationSecs = item.duration || 0;
                const mins = Math.floor(durationSecs / 60);
                const secs = durationSecs % 60;
                const formattedDuration = durationSecs > 0 ? `${mins}:${secs < 10 ? '0' : ''}${secs}` : "18:42";
                return {
                  title: item.title || `Episode ${idx + 1}`,
                  description: item.description ? item.description.replace(/<[^>]*>/g, '') : 'No description available.',
                  pubDate: item.datePublished ? new Date(item.datePublished * 1000).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent Episode',
                  audioUrl: item.enclosureUrl || item.link || '',
                  duration: formattedDuration,
                  tags: ["Business", "Local-First"],
                  podcastName: "The Cordoval Business Show",
                  imageUrl: item.image || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400"
                };
              });
              setCurrentChannelEpisodes(mapped);
              setIsLoadingEpisodes(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Error fetching cordoval live episodes", e);
        }
        // Fallback to initial channel static episodes
        setCurrentChannelEpisodes(INITIAL_CHANNELS[0].episodes);
        setIsLoadingEpisodes(false);
      };
      fetchCordovalEpisodes();
      return;
    }

    const fetchEpisodesForFeed = async () => {
      setIsLoadingEpisodes(true);
      try {
        const feedUrlParam = activeFeedObj?.url ? `&feedUrl=${encodeURIComponent(activeFeedObj.url)}` : '';
        const res = await fetch(`/api/podcast/episodes?feedId=${selectedChannelId}${feedUrlParam}`);
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && !contentType.includes("text/html")) {
          const data = await res.json();
          const items = data.items || data.episodes || [];
          
          const mapped: Episode[] = items.map((item: any, idx: number) => {
            const durationSecs = item.duration || 0;
            const mins = Math.floor(durationSecs / 60);
            const secs = durationSecs % 60;
            const formattedDuration = durationSecs > 0 ? `${mins}:${secs < 10 ? '0' : ''}${secs}` : "Unknown";
            
            return {
              title: item.title || `Episode ${idx + 1}`,
              description: item.description ? item.description.replace(/<[^>]*>/g, '') : 'No description available.',
              pubDate: item.datePublished ? new Date(item.datePublished * 1000).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date',
              audioUrl: item.enclosureUrl || item.link || '',
              duration: formattedDuration,
              tags: item.categories ? Object.values(item.categories) : ["Podcast"],
              podcastName: activeFeedObj?.title || "Podcast",
              imageUrl: item.image || activeFeedObj?.image || activeFeedObj?.artwork || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400"
            };
          });
          setCurrentChannelEpisodes(mapped);
        } else {
          const feedUrl = activeFeedObj?.url || selectedChannel?.rssFeedUrl;
          if (feedUrl) {
            const clientEpisodes = await fetchAndParseRSSClient(feedUrl);
            setCurrentChannelEpisodes(clientEpisodes);
          } else {
            setCurrentChannelEpisodes([]);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch episodes for feed, attempting client-side parse fallback', err);
        try {
          const feedUrl = activeFeedObj?.url || selectedChannel?.rssFeedUrl;
          if (feedUrl) {
            const clientEpisodes = await fetchAndParseRSSClient(feedUrl);
            setCurrentChannelEpisodes(clientEpisodes);
          } else {
            setCurrentChannelEpisodes([]);
          }
        } catch (fallbackErr) {
          console.error('Client-side parse fallback also failed', fallbackErr);
          setCurrentChannelEpisodes([]);
        }
      } finally {
        setIsLoadingEpisodes(false);
      }
    };

    fetchEpisodesForFeed();
  }, [selectedChannelId, selectedFeedDetails]);

  const cordovalChannel: PodcastChannel = {
    id: "cordoval",
    name: "The Cordoval Business Show",
    host: "Cordoval Team",
    description: "Helps builders, founders, and managers build, grow, and manage a sovereign enterprise with tactical episodes on pricing, marketing, local-first operations, and design psychology.",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400",
    subscriberCount: "12,480 subscribers",
    tags: ["Business", "Solopreneur", "Self-Improvement", "Local-First"],
    rssFeedUrl: "https://media.rss.com/cordovalshow/feed.xml",
    episodes: allEpisodes.length > 0 ? allEpisodes : INITIAL_CHANNELS[0].episodes
  };

  const skipForward = () => {
    onSeek(Math.min(duration, currentTime + 15));
  };

  const skipBackward = () => {
    onSeek(Math.max(0, currentTime - 15));
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const fallbackFeed = selectedChannelId && selectedChannelId !== 'cordoval' && !selectedFeedDetails
    ? (trendingPodcasts.find(p => String(p.id) === selectedChannelId) ||
       searchResults.find(p => String(p.id) === selectedChannelId) ||
       (() => {
         const cp = CURATED_PODCASTS.find(p => p.id === selectedChannelId);
         if (!cp) return null;
         return {
           id: cp.id,
           title: cp.title,
           author: cp.author,
           description: cp.description,
           image: cp.image,
           subscriberCount: "100K+ listeners",
           categories: { "1": cp.category },
           url: cp.url
         };
       })())
    : null;

  const activeFeedObj = selectedFeedDetails || fallbackFeed;

  const selectedChannel = selectedChannelId === 'cordoval'
    ? cordovalChannel
    : activeFeedObj
      ? {
          id: String(activeFeedObj.id),
          name: activeFeedObj.title,
          host: activeFeedObj.author || "Host",
          description: activeFeedObj.description || "No description provided.",
          imageUrl: resolvedChannelImages[String(activeFeedObj.id)] || resolvedChannelImages[activeFeedObj.url] || activeFeedObj.image || activeFeedObj.artwork || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400",
          subscriberCount: activeFeedObj.subscriberCount || "Trending Station",
          tags: activeFeedObj.categories ? Object.values(activeFeedObj.categories) : ["General"],
          episodes: currentChannelEpisodes,
          rssFeedUrl: activeFeedObj.url
        }
      : null;

  const activeEpisode = currentEpisode || (selectedChannel && selectedChannel.episodes[0]) || cordovalChannel.episodes[0];

  return (
    <div className="flex-1 bg-slate-50 flex flex-col lg:flex-row h-full overflow-hidden">
      
      {/* LEFT: Channel and Tags Navigation Bar */}
      <div className="hidden lg:flex w-80 bg-white border-r border-slate-100 p-6 flex-col gap-6 overflow-y-auto flex-shrink-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Radio className="text-indigo-600" size={18} />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Cast Platform</h2>
          </div>
          <p className="text-xs text-slate-400">Premium business channels & daily tactical strategies.</p>
        </div>

        {/* Dynamic Navigation Indicator */}
        {selectedChannelId && (
          <button
            onClick={() => setSelectedChannelId(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50/50 p-2.5 rounded-xl border border-slate-100 hover:border-indigo-100/30"
          >
            <ArrowLeft size={14} /> Back to Discover
          </button>
        )}

        {/* Discovery Search */}
        {!selectedChannelId && (
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100/80 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
        )}

        {/* Tags Directory */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">Channel Tags</span>
          <div className="flex flex-wrap lg:flex-col gap-1">
            <button
              onClick={() => {
                setSelectedTag(null);
                setSelectedChannelId(null);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all w-full ${
                selectedTag === null && !selectedChannelId && !searchQuery
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/30' 
                  : 'bg-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={12} /> All Channels
            </button>
            {TAGS.slice(0, 7).map(tag => {
              const isActive = selectedTag === tag && !selectedChannelId;
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    setSelectedChannelId(null);
                    handleSearch(tag);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-all w-full ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/30' 
                      : 'bg-transparent text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Tag size={12} /> {tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy Policy & Terms Links */}
        {onNavigate && (
          <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <button 
                onClick={() => onNavigate('settings', null)}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Legal & Terms
              </button>
            </div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              Cordoval OS
            </div>
          </div>
        )}

      </div>

      {/* RIGHT: Active Main panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Main Display screen */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          
          <AnimatePresence mode="wait">
            
            {/* 1. CHANNEL DETAIL PAGE VIEW */}
            {selectedChannelId && selectedChannel ? (
              <motion.div
                key="channel-page"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: -20 }}
                className="space-y-6"
              >
                {/* Back button */}
                <button 
                  onClick={() => setSelectedChannelId(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Discover Channels
                </button>

                {/* Channel Header Banner */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <img 
                    src={selectedChannel.imageUrl} 
                    alt={selectedChannel.name} 
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Active Station
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{selectedChannel.name}</h1>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>Host: <strong className="text-slate-700">{selectedChannel.host}</strong></span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed max-w-3xl pt-1">
                      {selectedChannel.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedChannel.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Episode Directory Section */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Episode Directory ({selectedChannel.episodes.length})</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {selectedChannel.episodes.slice(0, visibleEpisodesCount).map((ep, idx) => {
                      const isCurrent = currentEpisode && currentEpisode.title === ep.title;
                      const playingThis = isCurrent && isPlaying;

                      return (
                        <div 
                          key={ep.title || idx}
                          className={`p-5 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row gap-5 items-start justify-between ${
                            isCurrent 
                              ? 'border-indigo-600 shadow-sm ring-1 ring-indigo-50 bg-indigo-50/5' 
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 items-center text-[10px] text-slate-400 font-bold">
                              <span>{ep.pubDate}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5"><Clock size={10} /> {ep.duration}</span>
                            </div>
                            
                            <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{ep.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">{ep.description}</p>
                            
                            <div className="flex flex-wrap gap-1 pt-1">
                              {ep.tags.map(tag => (
                                <span key={tag} className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (isCurrent) {
                                onTogglePlay();
                              } else {
                                onSelectEpisode(ep);
                              }
                            }}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 active:scale-95 ${
                              playingThis
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            {playingThis ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {selectedChannel.episodes.length > visibleEpisodesCount && (
                    <div className="flex justify-center pt-4 pb-8">
                      <button
                        onClick={() => setVisibleEpisodesCount(prev => prev + 12)}
                        className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        Load More Past Episodes ({selectedChannel.episodes.length - visibleEpisodesCount} remaining)
                      </button>
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              
              // 2. DISCOVER CHANNELS HUB VIEW
              <motion.div
                key="discover-hub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header title */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Podcast Discovery Hub</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-black text-slate-900">
                        {selectedTag ? `Exploring: ${selectedTag}` : searchQuery ? `Search Results: "${searchQuery}"` : 'Podcast Network'}
                      </h1>
                      {(selectedTag || searchQuery) && (
                        <button
                          onClick={() => {
                            setSelectedTag(null);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          Clear <X size={10} />
                        </button>
                      )}
                    </div>
                  </div>

                  {(loadingEpisodes || isLoadingSearch || isLoadingTrending) && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1.5 animate-pulse font-bold">
                      <Radio size={14} className="text-emerald-500" /> Connecting Live RSS Feed...
                    </span>
                  )}
                </div>

                {/* Mobile Search and Filters (only visible on mobile/tablet) */}
                <div className="block lg:hidden space-y-3 bg-slate-100/40 p-3.5 rounded-2xl border border-slate-200/40">
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search channels & topics..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200/50 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                          setSelectedTag(null);
                        }}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 h-7 w-7 flex items-center justify-center rounded-full"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Horizontal scrolling tags for mobile */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
                    <button
                      onClick={() => {
                        setSelectedTag(null);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                        selectedTag === null && !searchQuery
                          ? 'bg-indigo-50 border-indigo-100/40 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      All Channels
                    </button>
                    {TAGS.slice(0, 8).map(tag => {
                      const isActive = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            setSelectedTag(tag);
                            handleSearch(tag);
                          }}
                          className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-indigo-50 border-indigo-100/40 text-indigo-700 shadow-sm'
                              : 'bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* HERO FEATURED PLACEMENT FOR THE CORDOVAL BUSINESS SHOW */}
                {!searchQuery && (
                  <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-xl flex flex-col md:flex-row gap-5 sm:gap-6 items-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_40%)]" />
                    <img 
                      src={cordovalChannel.imageUrl} 
                      alt={cordovalChannel.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-800 shadow-2xl flex-shrink-0 z-10"
                    />
                    <div className="space-y-2.5 flex-1 text-center md:text-left z-10">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Spotlight
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-none">The Cordoval Business Show</h2>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                        Learn how to build, mannage, and grow your business with focused micro podcast episodes
                      </p>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold pt-1">
                        <button 
                          onClick={() => {
                            setSelectedChannelId('cordoval');
                            setSelectedFeedDetails(null);
                          }}
                          className="h-9 px-4 bg-white hover:bg-slate-100 text-slate-950 rounded-xl uppercase tracking-wider text-[10px] font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                        >
                          <Play size={12} fill="currentColor" /> Open Channel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* FEEDS LIST SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      {searchQuery ? `Search Results (${searchResults.length})` : 'Trending Broadcasts'}
                    </h3>
                    {!searchQuery && (
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                        <Flame size={12} className="text-amber-500 fill-amber-500" /> Active Streams
                      </span>
                    )}
                  </div>

                  {isLoadingSearch || isLoadingTrending ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2, 4, 6].map(n => (
                        <div key={n} className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 animate-pulse">
                          <div className="flex gap-4 items-start">
                            <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0" />
                            <div className="space-y-2 flex-1">
                              <div className="h-3 bg-slate-100 rounded w-1/3" />
                              <div className="h-4 bg-slate-200 rounded w-2/3" />
                            </div>
                          </div>
                          <div className="h-3 bg-slate-100 rounded w-5/6" />
                          <div className="h-8 bg-slate-100 rounded-xl w-1/3 ml-auto" />
                        </div>
                      ))}
                    </div>
                  ) : (searchQuery ? searchResults : trendingPodcasts).length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
                      <AlertCircle size={32} className="mx-auto text-slate-300" />
                      <p className="text-sm font-bold text-slate-600">No channels match your current search queries.</p>
                      <button 
                        onClick={() => { setSelectedTag(null); handleSearch(''); }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                      >
                        Reset Search
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(searchQuery ? searchResults : trendingPodcasts).map((feed: any) => {
                        const categoriesList = feed.categories ? Object.values(feed.categories) : [];
                        return (
                          <div 
                            key={feed.id}
                            className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-100/40 hover:shadow-md transition-all p-4 flex flex-col justify-between gap-4 relative group"
                          >
                            <div className="flex gap-3.5 items-start">
                              <img 
                                src={resolvedChannelImages[feed.id] || resolvedChannelImages[feed.url] || feed.image || feed.artwork || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400"} 
                                alt={feed.title} 
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                              />
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] font-black bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded uppercase tracking-wider truncate">
                                    {feed.author || "Global Host"}
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-sm leading-snug truncate group-hover:text-indigo-600 transition-colors">
                                  {feed.title}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold truncate">
                                  {categoriesList.join(' • ') || 'Podcast'}
                                </p>
                              </div>
                            </div>

                            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">
                              {feed.description ? feed.description.replace(/<[^>]*>/g, '') : "No description available for this show."}
                            </p>

                            <div className="flex items-center justify-end border-t border-slate-100/50 pt-2.5 mt-auto">
                              <button
                                onClick={() => {
                                  setSelectedFeedDetails(feed);
                                  setSelectedChannelId(String(feed.id));
                                }}
                                className="h-9 px-4 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                              >
                                Open Station <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>

          {/* Main Display screen footer with Privacy & Terms */}
          {onNavigate && (
            <div className="pt-8 mt-12 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <p className="text-center sm:text-left">Non-Private Streams independent of Cordoval</p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onNavigate('settings', null)}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Legal & Terms
                </button>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM: Global Persistent Audio Player */}
        <div className="bg-white border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4 shadow-xl flex flex-col gap-3 select-none flex-shrink-0">
          
          {/* Episode Info banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center justify-between gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-3 min-w-0">
                {activeEpisode && activeEpisode.imageUrl && (
                  <img 
                    src={activeEpisode.imageUrl} 
                    alt="Player cover" 
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">NOW STREAMING</span>
                  <h4 className="font-extrabold text-slate-900 text-xs truncate max-w-[220px] sm:max-w-xs md:max-w-md">
                    {activeEpisode ? activeEpisode.title : "No Episode Loaded"}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold -mt-0.5">{activeEpisode ? activeEpisode.podcastName : ""}</p>
                </div>
              </div>

              {currentEpisode && onClosePlayer && (
                <button 
                  onClick={onClosePlayer}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors flex-shrink-0"
                  title="Close player"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Interactive Seek Bar */}
            <div className="flex-1 w-full sm:max-w-xl flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                className="flex-1 accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-bold text-slate-400 w-8">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Player controls row */}
          <div className="flex items-center justify-between gap-4">
            
            {/* Speed Selector */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 border border-slate-100 p-0.5 sm:p-1 rounded-xl">
              {[1, 1.25, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => onSetPlaybackRate(speed)}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black rounded-lg transition-all ${
                    playbackRate === speed 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Center Playback control keys */}
            <div className="flex items-center gap-3">
              <button 
                onClick={skipBackward}
                className="w-8 h-8 rounded-full hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors"
                title="Rewind 15 seconds"
              >
                <SkipBack size={16} />
              </button>
              <button
                onClick={onTogglePlay}
                className="w-11 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>
              <button 
                onClick={skipForward}
                className="w-8 h-8 rounded-full hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors"
                title="Fast-forward 15 seconds"
              >
                <SkipForward size={16} />
              </button>
            </div>

            {/* Volume adjustments */}
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={() => onSetMuted(!isMuted)}
                className="text-slate-500 hover:text-slate-900 transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  onSetVolume(parseFloat(e.target.value));
                  onSetMuted(false);
                }}
                className="w-16 h-1 accent-indigo-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex sm:hidden items-center">
              <button 
                onClick={() => onSetMuted(!isMuted)}
                className="w-8 h-8 rounded-full hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
