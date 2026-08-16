import express from "express";
import { XMLParser } from "fast-xml-parser";
import { CURATED_PODCASTS, CURATED_CATEGORIES } from "../podcastsList";

const app = express();

// CORS Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const cordovalFeed = {
  id: "cordoval",
  title: "The Cordoval Business Show",
  author: "Cordoval Team",
  description: "Helps builders, founders, and managers build, grow, and manage a sovereign enterprise with tactical episodes on pricing, marketing, local-first operations, and design psychology.",
  image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400",
  subscriberCount: "12,480 subscribers",
  categories: { "1": "Business", "3": "Solopreneur", "8": "Self-Improvement", "12": "Local-First" },
  url: "https://media.rss.com/cordovalshow/feed.xml"
};

async function fetchAndParseRSS(feedUrl: string) {
  try {
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "application/xml, text/xml, */*"
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch RSS: ${res.status} ${res.statusText}`);
    }
    const xmlText = await res.text();
    const cleanedXmlText = xmlText.trim();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const jsonObj = parser.parse(cleanedXmlText);

    let channel = jsonObj?.rss?.channel || jsonObj?.channel || jsonObj?.feed;
    if (!channel && jsonObj) {
      const findChannel = (obj: any): any => {
        if (!obj || typeof obj !== "object") return null;
        if (obj.channel) return obj.channel;
        for (const k of Object.keys(obj)) {
          const result = findChannel(obj[k]);
          if (result) return result;
        }
        return null;
      };
      channel = findChannel(jsonObj);
    }

    if (!channel) {
      throw new Error("Invalid RSS feed structure (missing channel)");
    }

    const getPropertyText = (obj: any, keys: string[]): string => {
      if (!obj) return "";
      for (const k of keys) {
        const val = obj[k];
        if (val !== undefined && val !== null) {
          if (typeof val === "string") return val;
          if (typeof val === "object") {
            if (val["#text"] !== undefined) return String(val["#text"]);
            if (val.text !== undefined) return String(val.text);
            if (val["_"] !== undefined) return String(val["_"]);
          }
        }
      }
      return "";
    };

    let items = channel.item || channel.entry || [];
    if (!Array.isArray(items)) {
      items = [items];
    }

    const episodes = items.map((item: any, idx: number) => {
      let enclosureUrl = "";
      const enclosure = item.enclosure;
      if (enclosure) {
        const encArray = Array.isArray(enclosure) ? enclosure : [enclosure];
        for (const enc of encArray) {
          if (enc && typeof enc === "object") {
            enclosureUrl = enc["@_url"] || enc.url || enc["@_href"] || enc.href || "";
            if (enclosureUrl) break;
          } else if (typeof enc === "string") {
            enclosureUrl = enc;
            break;
          }
        }
      }

      if (!enclosureUrl && item["media:content"]) {
        const mc = item["media:content"];
        if (Array.isArray(mc)) {
          for (const m of mc) {
            if (m && typeof m === "object" && (m["@_url"] || m.url)) {
              enclosureUrl = m["@_url"] || m.url;
              break;
            }
          }
        } else if (typeof mc === "object") {
          enclosureUrl = mc["@_url"] || mc.url || "";
        }
      }

      if (!enclosureUrl && item.link) {
        const link = item.link;
        if (typeof link === "string" && (link.endsWith(".mp3") || link.endsWith(".m4a") || link.includes("audio"))) {
          enclosureUrl = link;
        } else if (typeof link === "object" && (link["@_href"] || link.href)) {
          enclosureUrl = link["@_href"] || link.href;
        }
      }

      const title = getPropertyText(item, ["title"]) || `Episode ${idx + 1}`;
      let description = getPropertyText(item, ["description", "summary", "content:encoded", "itunes:summary"]) || "";
      description = description.replace(/<[^>]*>/g, "");

      const pubDate = getPropertyText(item, ["pubDate", "published", "updated", "dc:date"]);
      let datePublished = Math.floor(Date.now() / 1000);
      if (pubDate) {
        const parsedTime = Date.parse(pubDate);
        if (!isNaN(parsedTime)) {
          datePublished = Math.floor(parsedTime / 1000);
        }
      }

      let duration = 0;
      const durRaw = getPropertyText(item, ["itunes:duration", "duration"]);
      if (durRaw) {
        if (/^\d+$/.test(durRaw.trim())) {
          duration = parseInt(durRaw.trim(), 10);
        } else if (durRaw.includes(":")) {
          const parts = durRaw.split(":").map(p => parseInt(p.trim(), 10) || 0);
          if (parts.length === 3) duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
          else if (parts.length === 2) duration = parts[0] * 60 + parts[1];
        }
      }

      let epImage = "";
      if (item["itunes:image"]) {
        epImage = item["itunes:image"]["@_href"] || item["itunes:image"].href || "";
      }

      return {
        id: getPropertyText(item, ["guid", "id"]) || `ep_${idx}`,
        title,
        description,
        enclosureUrl,
        duration,
        datePublished,
        image: epImage
      };
    });

    return {
      title: getPropertyText(channel, ["title"]) || "Podcast Feed",
      description: getPropertyText(channel, ["description", "summary"]) || "",
      image: channel?.image?.url || channel?.["itunes:image"]?.["@_href"] || "",
      episodes
    };
  } catch (err: any) {
    throw new Error(`RSS Parse Error: ${err.message}`);
  }
}

app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok" });
});

app.get(["/api/podcast/search", "/podcast/search"], async (req, res) => {
  const q = String(req.query.q || "").trim();

  try {
    const results: any[] = [cordovalFeed];

    if (q) {
      const qLower = q.toLowerCase();
      const matchingCurated = CURATED_PODCASTS.filter(p => {
        return (
          p.title.toLowerCase().includes(qLower) ||
          p.description.toLowerCase().includes(qLower) ||
          p.author.toLowerCase().includes(qLower) ||
          p.category.toLowerCase().includes(qLower)
        );
      });

      matchingCurated.forEach(p => {
        const catMap: Record<string, string> = {};
        const catObj = CURATED_CATEGORIES.find(c => c.name === p.category);
        catMap[String(catObj?.id || 1)] = p.category;

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
        catMap[String(catObj?.id || 1)] = p.category;

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

    const uniqueResults = results.filter((value, index, self) =>
      self.findIndex(t => String(t.id) === String(value.id)) === index
    );

    res.json({
      status: "true",
      feeds: uniqueResults,
      count: uniqueResults.length,
      isLive: true,
      source: "curated"
    });
  } catch (error: any) {
    console.error("Search API failed:", error);
    res.status(500).json({ error: error.message || "Search failed" });
  }
});

app.get(["/api/podcast/trending", "/podcast/trending"], async (req, res) => {
  try {
    const trendingList: any[] = [cordovalFeed];

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
      catMap[String(catObj?.id || 1)] = p.category;

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

    const uniqueTrending = trendingList.filter((value, index, self) =>
      self.findIndex(t => String(t.id) === String(value.id)) === index
    );

    res.json({
      status: "true",
      feeds: uniqueTrending,
      count: uniqueTrending.length,
      isLive: true
    });
  } catch (error: any) {
    console.error("Trending API failed:", error);
    res.status(500).json({ error: error.message || "Trending failed" });
  }
});

app.get(["/api/podcast/categories", "/podcast/categories"], async (req, res) => {
  res.json({
    status: "true",
    feeds: CURATED_CATEGORIES,
    count: CURATED_CATEGORIES.length,
    isLive: true
  });
});

app.get(["/api/podcast/episodes", "/podcast/episodes"], async (req, res) => {
  const feedId = String(req.query.feedId || "").trim();
  const feedUrl = String(req.query.feedUrl || "").trim();

  try {
    if (feedId === "cordoval" || feedUrl === cordovalFeed.url) {
      const parsed = await fetchAndParseRSS(cordovalFeed.url);
      const formattedEpisodes = parsed.episodes.map(ep => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        enclosureUrl: ep.enclosureUrl,
        duration: ep.duration,
        datePublished: ep.datePublished,
        image: ep.image || parsed.image || cordovalFeed.image
      }));
      return res.json({
        status: "true",
        items: formattedEpisodes,
        count: formattedEpisodes.length,
        isLive: true,
        podcastTitle: "The Cordoval Business Show",
        podcastImage: cordovalFeed.image
      });
    }

    let urlToParse = feedUrl;
    let pTitle = "Web Feed";
    let pImage = "";

    if (!urlToParse && feedId) {
      const match = CURATED_PODCASTS.find(p => p.id === feedId);
      if (match) {
        urlToParse = match.url;
        pTitle = match.title;
        pImage = match.image;
      }
    }

    if (urlToParse) {
      const parsed = await fetchAndParseRSS(urlToParse);
      const formattedEpisodes = parsed.episodes.map(ep => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        enclosureUrl: ep.enclosureUrl,
        duration: ep.duration,
        datePublished: ep.datePublished,
        image: ep.image || parsed.image || pImage
      }));

      return res.json({
        status: "true",
        items: formattedEpisodes,
        count: formattedEpisodes.length,
        isLive: true,
        podcastTitle: parsed.title || pTitle,
        podcastImage: parsed.image || pImage
      });
    }

    return res.json({
      status: "true",
      items: [],
      count: 0,
      isLive: false
    });
  } catch (error: any) {
    console.warn("Podcast episodes fetch error:", error);
    res.status(500).json({ error: error.message || "Episode fetch failed" });
  }
});

app.get(["/api/podcast-rss", "/podcast-rss"], async (req, res) => {
  try {
    const response = await fetch("https://media.rss.com/cordovalshow/feed.xml");
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status}`);
    }
    const xmlText = await response.text();
    res.setHeader("Content-Type", "application/xml");
    res.send(xmlText);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch podcast feed" });
  }
});

app.get(["/api/podcast/proxy-audio", "/podcast/proxy-audio"], async (req, res) => {
  const audioUrl = req.query.url as string;
  if (!audioUrl) {
    return res.status(400).send("Missing url parameter");
  }

  try {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    };

    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }

    const response = await fetch(audioUrl, { headers });
    res.status(response.status);

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges");

    if (contentType) res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    if (contentRange) res.setHeader("Content-Range", contentRange);
    res.setHeader("Accept-Ranges", acceptRanges || "bytes");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

    if (response.body) {
      const { Readable } = await import("stream");
      Readable.fromWeb(response.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error("Audio proxy failed:", error);
    if (!res.headersSent) {
      res.status(500).send("Failed to stream audio");
    }
  }
});

export default app;
