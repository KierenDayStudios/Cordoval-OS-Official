import express from "express";
import { createServer as createViteServer, ViteDevServer } from "vite";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { XMLParser } from "fast-xml-parser";
import { GoogleGenAI } from "@google/genai";
import { CURATED_PODCASTS, CURATED_CATEGORIES } from "./podcastsList.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS middleware for all routes
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: "15mb" }));

  // Helper to initialize GoogleGenAI with server or client provided key
  const getGeminiClient = (passedKey?: string) => {
    const key = passedKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) {
      throw new Error("No Gemini API key available. Please configure your API key.");
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Resilient Gemini generator with multi-model fallback and retry on 503/429
  async function generateContentWithFallback(
    ai: GoogleGenAI,
    params: {
      contents: string;
      systemInstruction?: string;
      temperature?: number;
    }
  ) {
    const candidateModels = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.5-pro"];
    let lastError: any = null;

    for (const model of candidateModels) {
      // Try up to 2 attempts per model with backoff
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: params.contents,
            config: {
              systemInstruction: params.systemInstruction,
              temperature: params.temperature ?? 0.7,
            },
          });
          return { response, modelUsed: model };
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          const isRetryable =
            errMsg.includes("503") ||
            errMsg.includes("UNAVAILABLE") ||
            errMsg.includes("high demand") ||
            errMsg.includes("429") ||
            errMsg.includes("RESOURCE_EXHAUSTED") ||
            errMsg.includes("rate limit") ||
            errMsg.includes("overloaded");

          console.warn(
            `Gemini call with model ${model} (attempt ${attempt + 1}) encountered error:`,
            errMsg
          );

          if (isRetryable && attempt === 0) {
            // Short backoff before next attempt
            await new Promise((resolve) => setTimeout(resolve, 600));
            continue;
          }
          // Move to next candidate model
          break;
        }
      }
    }

    throw lastError || new Error("Failed to generate AI response across all available Gemini models.");
  }

  // Fast Track AI Assist Endpoint (for Wizard Questions)
  app.post("/api/fast-track/assist", async (req, res) => {
    try {
      const { prompt, fieldLabel, phaseTitle, planSummary, apiKey } = req.body;
      const ai = getGeminiClient(apiKey);

      const systemInstruction = `You are the lead startup architect and strategist at Cordoval Fast Track, an elite venture formulation platform.
Your task is to provide a comprehensive, sharp, highly tactical, actionable answer or recommendation for a specific startup planning question.
Be extremely clear, concrete, and high-impact. Avoid generic fluff or cliches. Provide crisp bullet points or structured formulation.`;

      const userContent = `Startup Plan Context So Far:
${planSummary || "No context provided yet."}

Current Planning Phase: ${phaseTitle || "General Formulation"}
Target Field: ${fieldLabel || "Strategic Planning"}

User Request / Question:
"${prompt || "Generate a high-impact, refined answer for this startup documentation field."}"

Please generate a compelling, professional, ready-to-use answer tailored for this business.`;

      const { response, modelUsed } = await generateContentWithFallback(ai, {
        contents: userContent,
        systemInstruction,
        temperature: 0.7,
      });

      res.json({
        status: "ok",
        suggestion: response.text || "",
        modelUsed,
      });
    } catch (error: any) {
      console.error("Fast Track AI Assist Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI suggestion" });
    }
  });

  // Fast Track AI Coder Endpoint (Generate Full Working Frontend Prototype)
  app.post("/api/fast-track/generate-code", async (req, res) => {
    try {
      const { plan, customPrompt, templateType, existingCode, apiKey } = req.body;
      const ai = getGeminiClient(apiKey);

      const systemInstruction = `You are an elite Frontend Architect and UI/UX Engineer at Cordoval Fast Track.
Your mission is to generate a complete, standalone, production-ready, beautiful, interactive single-file HTML/JS/Tailwind CSS web application or landing page prototype for the user's venture.

CRITICAL REQUIREMENTS:
1. Return ONLY the complete, executable HTML source code inside a single standard HTML5 document.
2. Include Tailwind CSS CDN script: <script src="https://cdn.tailwindcss.com"></script>
3. Include Lucide icons CDN: <script src="https://unpkg.com/lucide@latest"></script> (and initialize with <script>lucide.createIcons();</script>).
4. Include interactive client-side JavaScript for all buttons, tabs, pricing toggles, modals, forms, calculators, and interactive widgets so the preview is fully functional and delightful to click and test.
5. Apply modern, high-contrast, polished typography, clean spacing, smooth hover transitions, and an elegant color scheme matching the brand's identity.
6. The HTML code must be completely self-contained. Do not include markdown code fences like \`\`\`html unless necessary, but if included, ensure valid clean text.`;

      const promptContent = `Here is the comprehensive Cordoval Fast Track Business Plan:
${typeof plan === "string" ? plan : JSON.stringify(plan, null, 2)}

User Instructions / Focus:
${customPrompt || `Build a complete, responsive, interactive web application & landing page prototype for this business idea. Include a hero section, interactive product demo/calculator, features breakdown, interactive pricing toggle (Monthly/Annual), customer onboarding flow modal, FAQ accordion, and contact/booking form.`}

${existingCode ? `Existing Code to refine/update:\n${existingCode}` : ""}

Generate the complete, beautiful, working HTML/JS/Tailwind code now.`;

      const { response, modelUsed } = await generateContentWithFallback(ai, {
        contents: promptContent,
        systemInstruction,
        temperature: 0.7,
      });

      let code = response.text || "";
      // Strip markdown code fences if wrapped
      code = code.replace(/^```html\s*/i, "").replace(/```\s*$/i, "").trim();

      res.json({
        status: "ok",
        code,
        summary: "Prototype successfully compiled by Cordoval AI Coder.",
        modelUsed,
      });
    } catch (error: any) {
      console.error("Fast Track AI Coder Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate prototype code" });
    }
  });

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Podcast RSS Parser Helper
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

      // Robustly locate the channel node
      let channel = jsonObj?.rss?.channel || jsonObj?.channel || jsonObj?.feed;
      if (!channel && jsonObj) {
        const findChannel = (obj: any): any => {
          if (!obj || typeof obj !== "object") return null;
          if (obj.channel) return obj.channel;
          for (const key of Object.keys(obj)) {
            const result = findChannel(obj[key]);
            if (result) return result;
          }
          return null;
        };
        channel = findChannel(jsonObj);
      }

      if (!channel) {
        throw new Error("Invalid RSS feed structure (missing channel)");
      }

      // Robustly get text content from an object (handling string, CDATA objects, etc.)
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
        // Robust enclosure (audio URL) resolution
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
          const mediaArray = Array.isArray(item["media:content"]) ? item["media:content"] : [item["media:content"]];
          for (const med of mediaArray) {
            if (med && typeof med === "object") {
              enclosureUrl = med["@_url"] || med.url || "";
              if (enclosureUrl) break;
            }
          }
        }

        if (!enclosureUrl) {
          enclosureUrl = getPropertyText(item, ["link"]);
        }

        // Robust duration resolution
        let durationRaw = item["itunes:duration"] || item.duration || 0;
        let durationSecs = 0;
        if (durationRaw) {
          let durStr = "";
          if (typeof durationRaw === "string") {
            durStr = durationRaw.trim();
          } else if (typeof durationRaw === "number") {
            durationSecs = durationRaw;
          } else if (typeof durationRaw === "object") {
            durStr = String(durationRaw["#text"] || durationRaw.text || "").trim();
          }

          if (durStr) {
            if (durStr.includes(":")) {
              const parts = durStr.split(":").map(Number);
              if (parts.length === 3) {
                durationSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];
              } else if (parts.length === 2) {
                durationSecs = parts[0] * 60 + parts[1];
              }
            } else {
              durationSecs = parseInt(durStr, 10) || 0;
            }
          }
        }

        // Robust date resolution
        let datePublished = Math.floor(Date.now() / 1000);
        const pubDateStr = getPropertyText(item, ["pubDate", "published", "updated", "dc:date"]);
        if (pubDateStr) {
          const d = Date.parse(pubDateStr);
          if (!isNaN(d)) {
            datePublished = Math.floor(d / 1000);
          }
        }

        // Robust image resolution
        let imageUrl = "";
        const itunesImage = item["itunes:image"];
        if (itunesImage) {
          if (typeof itunesImage === "string") {
            imageUrl = itunesImage;
          } else if (typeof itunesImage === "object") {
            imageUrl = itunesImage["@_href"] || itunesImage.href || "";
          }
        }
        if (!imageUrl && item.image) {
          if (typeof item.image === "string") {
            imageUrl = item.image;
          } else if (typeof item.image === "object") {
            imageUrl = item.image.url || item.image["@_href"] || item.image.href || "";
          }
        }

        // Robust description resolution
        const description = (getPropertyText(item, ["description", "itunes:summary", "itunes:subtitle", "summary", "content:encoded"]) || "")
          .replace(/<[^>]*>/g, '')
          .trim();

        // Robust guid/id resolution
        let guidStr = getPropertyText(item, ["guid", "id"]);
        if (!guidStr) {
          guidStr = String(idx);
        }

        return {
          id: guidStr,
          title: getPropertyText(item, ["title", "itunes:title"]) || `Episode ${idx + 1}`,
          description: description,
          enclosureUrl: enclosureUrl,
          duration: durationSecs,
          datePublished: datePublished,
          image: imageUrl || ""
        };
      });

      // Robust channel-level details resolution
      const channelTitle = getPropertyText(channel, ["title", "itunes:title"]) || "";
      const channelDesc = (getPropertyText(channel, ["description", "itunes:summary", "subtitle", "itunes:subtitle"]) || "")
        .replace(/<[^>]*>/g, '')
        .trim();
      const channelAuthor = getPropertyText(channel, ["itunes:author", "author", "itunes:owner", "dc:creator"]) || "";
      
      let channelImage = "";
      const chImg = channel.image || channel["itunes:image"];
      if (chImg) {
        if (typeof chImg === "string") {
          channelImage = chImg;
        } else if (typeof chImg === "object") {
          channelImage = chImg.url || chImg["@_href"] || chImg.href || "";
        }
      }

      return {
        title: channelTitle,
        description: channelDesc,
        author: channelAuthor,
        image: channelImage,
        episodes: episodes
      };
    } catch (error: any) {
      console.error(`RSS parse failed for feed ${feedUrl}:`, error.message);
      throw error;
    }
  }

  function generateFallbackEpisodes(podcastId: string, podcastTitle: string, imageUrl: string) {
    return [
      {
        id: `${podcastId}_fall1`,
        title: `Mastering Focus & Deep Work in ${podcastTitle}`,
        description: `In this episode, we break down high-impact strategies, tactical blueprints, and psychological frameworks to optimize performance and master your craft.`,
        enclosureUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: 3200,
        datePublished: Math.floor(Date.now() / 1000) - 86400 * 2,
        image: imageUrl || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400"
      },
      {
        id: `${podcastId}_fall2`,
        title: `The Future of Decentralized Systems and Creative Sovereignty`,
        description: `Exploring how modern engineering architectures, local-first storage, and decentralized networks are empowering individual builders and sovereign creators globally.`,
        enclosureUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: 2850,
        datePublished: Math.floor(Date.now() / 1000) - 86400 * 5,
        image: imageUrl || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400"
      },
      {
        id: `${podcastId}_fall3`,
        title: `Tactical Blueprints for Scaling Independent Enterprises`,
        description: `An in-depth guide to productization, automated email systems, and building high-retaining product ecosystems with lean operations.`,
        enclosureUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: 4100,
        datePublished: Math.floor(Date.now() / 1000) - 86400 * 10,
        image: imageUrl || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400"
      }
    ];
  }

  const cordovalFeed: {
    id: string;
    title: string;
    author: string;
    description: string;
    image: string;
    subscriberCount: string;
    categories: Record<string, string>;
    url: string;
  } = {
    id: "cordoval",
    title: "The Cordoval Business Show",
    author: "Cordoval Team",
    description: "Helps builders, founders, and managers build, grow, and manage a sovereign enterprise with tactical episodes on pricing, marketing, local-first operations, and design psychology.",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400&h=400",
    subscriberCount: "12,480 subscribers",
    categories: { "1": "Business", "3": "Solopreneur", "8": "Self-Improvement", "12": "Local-First" },
    url: "https://media.rss.com/cordovalshow/feed.xml"
  };

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
      res.status(500).json({ error: error.message || "Trending lookup failed" });
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

      const mockItems = generateFallbackEpisodes(feedId || "custom", pTitle, pImage);
      return res.json({
        status: "true",
        items: mockItems,
        count: mockItems.length,
        isLive: false
      });
    } catch (error: any) {
      console.warn("Podcast episodes fetch error:", error);
      const mockItems = generateFallbackEpisodes(feedId || "custom", "The Cordoval Business Show", cordovalFeed.image);
      return res.json({
        status: "true",
        items: mockItems,
        count: mockItems.length,
        isLive: false
      });
    }
  });

  app.get(["/api/podcast-rss", "/podcast-rss"], async (req, res) => {
    try {
      const response = await fetch("https://media.rss.com/cordovalshow/feed.xml");
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
      }
      const xmlText = await response.text();
      res.setHeader("Content-Type", "application/xml");
      res.send(xmlText);
    } catch (error: any) {
      console.error("Error fetching podcast RSS:", error);
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
      if (acceptRanges) {
        res.setHeader("Accept-Ranges", acceptRanges);
      } else {
        res.setHeader("Accept-Ranges", "bytes");
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Range");

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

  app.get("/sitemap.xml", (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://cordoval.work/</loc></url>
  <url><loc>https://cordoval.work/dashboard</loc></url>
  <!-- Blog posts would be dynamically injected here in a production environment -->
</urlset>`);
  });

  let vite: ViteDevServer | undefined;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
  }

  if (vite) {
    app.use(vite.middlewares);
  } else {
    const distPath = process.cwd();
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
