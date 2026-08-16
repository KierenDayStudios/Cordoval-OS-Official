
import { FunctionDeclaration, Type } from "@google/genai";
import { storage } from "../storage";
import { Note, LedgerProject, CalendarEvent, Goal, JournalEntry, StorageArtifact, Habit, KanbanProject, Agent, Document, Presentation, Spreadsheet, SitePage, CanvasBoard, BusinessPlan } from "../types";
import { createAIInstance } from "./ai";

/**
 * TOOL DEFINITIONS (FunctionDeclarations)
 * These are sent to Gemini so it knows what it can do.
 */

export const createNoteTool: FunctionDeclaration = {
  name: "createNote",
  description: "Create a new note or thought in the user's second brain.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the note." },
      content: { type: Type.STRING, description: "The content of the note (supports markdown)." },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Optional tags for categorization." }
    },
    required: ["title", "content"]
  }
};

export const listNotesTool: FunctionDeclaration = {
  name: "listNotes",
  description: "List all notes in the user's second brain.",
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};

export const addLedgerEntryTool: FunctionDeclaration = {
  name: "addLedgerEntry",
  description: "Add a financial transaction (income or expense) to the ledger.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING, description: "What the transaction was for." },
      amount: { type: Type.NUMBER, description: "The amount of the transaction." },
      type: { type: Type.STRING, enum: ["income", "expense"], description: "Whether it's income or an expense." },
      category: { type: Type.STRING, description: "The category (e.g., Food, Rent, Salary)." },
      date: { type: Type.STRING, description: "The date of the transaction (YYYY-MM-DD). Defaults to today if omitted." }
    },
    required: ["description", "amount", "type", "category"]
  }
};

export const getLedgerSummaryTool: FunctionDeclaration = {
  name: "getLedgerSummary",
  description: "Get a summary of total income, expenses, and balance from the ledger.",
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};

export const createCalendarEventTool: FunctionDeclaration = {
  name: "createCalendarEvent",
  description: "Schedule a new event in the user's calendar.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The name of the event." },
      date: { type: Type.STRING, description: "The date of the event (YYYY-MM-DD)." },
      type: { type: Type.STRING, enum: ["work", "personal", "urgent"], description: "The priority/type of the event." },
      description: { type: Type.STRING, description: "Optional details about the event." }
    },
    required: ["title", "date", "type"]
  }
};

export const listCalendarEventsTool: FunctionDeclaration = {
  name: "listCalendarEvents",
  description: "List all scheduled events in the user's calendar.",
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};

export const createGoalTool: FunctionDeclaration = {
  name: "createGoal",
  description: "Define a new strategic goal or intention.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the goal." },
      description: { type: Type.STRING, description: "A detailed description of the goal." },
      targetDate: { type: Type.STRING, description: "The deadline for the goal (YYYY-MM-DD)." }
    },
    required: ["title", "description", "targetDate"]
  }
};

export const listGoalsTool: FunctionDeclaration = {
  name: "listGoals",
  description: "List all active goals and their progress.",
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};

export const createJournalEntryTool: FunctionDeclaration = {
  name: "createJournalEntry",
  description: "Record a reflection or journal entry.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the entry." },
      content: { type: Type.STRING, description: "The body of the reflection." },
      mood: { type: Type.STRING, enum: ["serene", "energetic", "thoughtful", "anxious", "grateful", "melancholy"], description: "The mood of the entry." }
    },
    required: ["title", "content", "mood"]
  }
};

export const listJournalEntriesTool: FunctionDeclaration = {
  name: "listJournalEntries",
  description: "List recent journal entries.",
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};

export const createHabitTool: FunctionDeclaration = {
  name: "createHabit",
  description: "Create a new habit to track daily.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The name of the habit." },
      icon: { type: Type.STRING, description: "A lucide icon name (e.g., 'Zap', 'Heart', 'Book')." },
      color: { type: Type.STRING, description: "A tailwind color class (e.g., 'text-blue-500')." }
    },
    required: ["title", "icon", "color"]
  }
};

export const listHabitsTool: FunctionDeclaration = {
  name: "listHabits",
  description: "List all habits being tracked.",
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};

export const createTaskTool: FunctionDeclaration = {
  name: "createTask",
  description: "Add a task to a project's Kanban board.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      projectTitle: { type: Type.STRING, description: "The title of the project." },
      taskTitle: { type: Type.STRING, description: "The title of the task." },
      priority: { type: Type.STRING, enum: ["low", "medium", "high"], description: "The priority of the task." }
    },
    required: ["projectTitle", "taskTitle", "priority"]
  }
};

export const createDocumentTool: FunctionDeclaration = {
  name: "createDocument",
  description: "Create a new text document (report, meeting notes, resume, etc.)",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the document." },
      content: { type: Type.STRING, description: "The markdown content of the document." },
      category: { type: Type.STRING, enum: ["resume", "meeting", "report", "blank"], description: "The category of the document." }
    },
    required: ["title", "content"]
  }
};

export const createPresentationTool: FunctionDeclaration = {
  name: "createPresentation",
  description: "Create a new slide presentation.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the presentation." },
      slides: { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            layout: { type: Type.STRING, enum: ["title", "title-content", "two-columns", "comparison", "blank", "title-only"] }
          },
          required: ["title", "content", "layout"]
        },
        description: "The slides for the presentation."
      }
    },
    required: ["title", "slides"]
  }
};

export const createSiteTool: FunctionDeclaration = {
  name: "createSite",
  description: "Create a new website or landing page.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the site." },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["hero", "features", "pricing", "cta", "footer", "nav", "testimonial"] },
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["type", "title", "content"]
        }
      }
    },
    required: ["title", "sections"]
  }
};

export const processIntelligenceTaskTool: FunctionDeclaration = {
  name: "processIntelligenceTask",
  description: "Perform advanced AI tasks like summarization, grammar fixing, code refactoring, etc.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskType: { 
        type: Type.STRING, 
        enum: [
          "summarize", "fixGrammar", "generateHeadline", "explainCode", 
          "refactorCode", "generateRegex", "buildSQL", "generateAPIRequest", 
          "generateCommitMessage", "interpretError", "generateTestCase", "draftLegal"
        ],
        description: "The type of AI task to perform."
      },
      input: { type: Type.STRING, description: "The text or code to process." }
    },
    required: ["taskType", "input"]
  }
};

export const startPodcastRecordingTool: FunctionDeclaration = {
  name: "startPodcastRecording",
  description: "Open the Podcast Studio and start recording audio.",
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};

export const createBusinessPlanTool: FunctionDeclaration = {
  name: "createBusinessPlan",
  description: "Create a new business plan with strategic sections.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The name of the business plan." },
      companyName: { type: Type.STRING, description: "The name of the company." },
      industry: { type: Type.STRING, description: "The industry the company operates in." },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "content"]
        },
        description: "The strategic sections of the plan."
      }
    },
    required: ["name", "companyName", "industry"]
  }
};

export const startTimerTool: FunctionDeclaration = {
  name: "startTimer",
  description: "Start a countdown timer.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      duration: { type: Type.NUMBER, description: "The duration of the timer in seconds." },
      label: { type: Type.STRING, description: "An optional label for the timer." }
    },
    required: ["duration"]
  }
};

export const storeMemoryTool: FunctionDeclaration = {
  name: "storeMemory",
  description: "Store a key fact or preference about the user or a project for long-term recall.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      fact: { type: Type.STRING, description: "The information to remember." },
      category: { type: Type.STRING, description: "Optional category (e.g., 'preference', 'project-x', 'bio')." }
    },
    required: ["fact"]
  }
};

export const retrieveMemoryTool: FunctionDeclaration = {
  name: "retrieveMemory",
  description: "Search the agent's long-term memory for relevant facts or preferences.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "The search query to find relevant memories." }
    },
    required: ["query"]
  }
};

export const createLogoArtifactTool: FunctionDeclaration = {
  name: "createLogoArtifact",
  description: "Create and save a brand logo as an SVG artifact or image in the user's design vault. Use this whenever the user asks to 'save' a logo you just generated.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      brandName: { type: Type.STRING, description: "The name of the brand (e.g., 'Zen')." },
      conceptName: { type: Type.STRING, description: "A name for the design concept (e.g., 'Minimalist Lotus')." },
      svgCode: { type: Type.STRING, description: "The raw SVG code for the logo (if vector)." },
      imageData: { type: Type.STRING, description: "The base64 encoded image data (if PNG/JPEG). Leave empty if you just generated an image, the system will capture it." },
      description: { type: Type.STRING, description: "A brief description of the design concept and strategy." }
    },
    required: ["brandName", "conceptName"]
  }
};

export const listLogosTool: FunctionDeclaration = {
  name: "listLogos",
  description: "List all saved brand logos and design artifacts.",
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};

export const createSpreadsheetTool: FunctionDeclaration = {
  name: "createSpreadsheet",
  description: "Create a new spreadsheet for data analysis or tracking.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the spreadsheet." },
      data: { 
        type: Type.STRING, 
        description: "A JSON string representing a map of cell IDs (e.g., 'A1', 'B2') to their string values."
      }
    },
    required: ["title", "data"]
  }
};

export const cordovalTools: FunctionDeclaration[] = [
  createNoteTool,
  listNotesTool,
  addLedgerEntryTool,
  getLedgerSummaryTool,
  createCalendarEventTool,
  listCalendarEventsTool,
  createGoalTool,
  listGoalsTool,
  createJournalEntryTool,
  listJournalEntriesTool,
  createHabitTool,
  listHabitsTool,
  createTaskTool,
  createDocumentTool,
  createPresentationTool,
  createSpreadsheetTool,
  createSiteTool,
  processIntelligenceTaskTool,
  startPodcastRecordingTool,
  createBusinessPlanTool,
  startTimerTool,
  storeMemoryTool,
  retrieveMemoryTool
];

/**
 * TOOL IMPLEMENTATIONS
 * These are the actual functions that run on the client.
 */

export const toolHandlers = {
  createNote: async (args: { title: string; content: string; tags?: string[] }) => {
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: args.title,
      content: args.content,
      color: 'bg-white',
      updatedAt: Date.now(),
      tags: args.tags || ['ai-generated'],
      isPinned: false,
      isChecklist: false,
      checklistItems: [],
      history: [],
      folderId: null
    };
    await storage.save('notes', { id: note.id, name: note.title, data: note, updatedAt: note.updatedAt, type: 'notes' });
    return { status: "success", message: `Note '${args.title}' created.` };
  },

  listNotes: async () => {
    const notes = await storage.list('notes');
    return notes.map(n => ({ id: n.id, title: n.data.title, tags: n.data.tags, updatedAt: n.updatedAt }));
  },

  addLedgerEntry: async (args: { description: string; amount: number; type: 'income' | 'expense'; category: string; date?: string }) => {
    const ledgers = await storage.list('ledger');
    let project: LedgerProject;
    
    if (ledgers.length === 0) {
      project = {
        id: 'default-ledger',
        name: 'Main Ledger',
        updatedAt: Date.now(),
        tags: ['finance'],
        folderId: null,
        history: [],
        currency: 'USD',
        entries: []
      };
    } else {
      project = ledgers[0].data;
    }

    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      date: args.date || new Date().toISOString().split('T')[0],
      description: args.description,
      amount: args.amount,
      category: args.category,
      type: args.type
    };

    project.entries.unshift(entry);
    project.updatedAt = Date.now();

    await storage.save('ledger', { id: project.id, name: project.name, data: project, updatedAt: project.updatedAt, type: 'ledger' });
    return { status: "success", message: `Added ${args.type} of ${args.amount} for ${args.description}.` };
  },

  getLedgerSummary: async () => {
    const ledgers = await storage.list('ledger');
    if (ledgers.length === 0) return { income: 0, expenses: 0, balance: 0 };
    
    const project: LedgerProject = ledgers[0].data;
    const income = project.entries.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = project.entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    
    return { income, expenses, balance: income - expenses, currency: project.currency };
  },

  createCalendarEvent: async (args: { title: string; date: string; type: 'work' | 'personal' | 'urgent'; description?: string }) => {
    const event: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: args.title,
      date: args.date,
      type: args.type,
      description: args.description
    };
    await storage.save('calendar', { id: event.id, name: event.title, data: event, updatedAt: Date.now(), type: 'calendar' });
    return { status: "success", message: `Event '${args.title}' scheduled for ${args.date}.` };
  },

  listCalendarEvents: async () => {
    const events = await storage.list('calendar');
    return events.map(e => e.data);
  },

  createGoal: async (args: { title: string; description: string; targetDate: string }) => {
    const goal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title: args.title,
      name: args.title,
      description: args.description,
      targetDate: args.targetDate,
      progress: 0,
      status: 'active',
      milestones: [],
      updatedAt: Date.now(),
      tags: ['ai-suggested'],
      folderId: null,
      history: []
    };
    await storage.save('goals', { id: goal.id, name: goal.title, data: goal, updatedAt: goal.updatedAt, type: 'goals' });
    return { status: "success", message: `Goal '${args.title}' established.` };
  },

  listGoals: async () => {
    const goals = await storage.list('goals');
    return goals.map(g => ({ title: g.data.title, progress: g.data.progress, status: g.data.status, targetDate: g.data.targetDate }));
  },

  createJournalEntry: async (args: { title: string; content: string; mood: any }) => {
    const entry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      title: args.title,
      name: args.title,
      content: args.content,
      mood: args.mood,
      updatedAt: Date.now(),
      tags: ['reflection'],
      folderId: null,
      history: []
    };
    await storage.save('journal', { id: entry.id, name: entry.title, data: entry, updatedAt: entry.updatedAt, type: 'journal' });
    return { status: "success", message: `Journal entry '${args.title}' saved.` };
  },

  listJournalEntries: async () => {
    const entries = await storage.list('journal');
    return entries.map(e => ({ title: e.data.title, mood: e.data.mood, date: new Date(e.updatedAt).toLocaleDateString() }));
  },

  createHabit: async (args: { title: string; icon: string; color: string }) => {
    const habit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: args.title,
      title: args.title,
      icon: args.icon,
      color: args.color,
      completedDays: [],
      updatedAt: Date.now(),
      tags: ['habit'],
      folderId: null,
      history: []
    };
    await storage.save('habits', { id: habit.id, name: habit.title, data: habit, updatedAt: habit.updatedAt, type: 'habits' });
    return { status: "success", message: `Habit '${args.title}' created.` };
  },

  listHabits: async () => {
    const habits = await storage.list('habits');
    return habits.map(h => ({ title: h.data.title, completedCount: h.data.completedDays.length }));
  },

  createTask: async (args: { projectTitle: string; taskTitle: string; priority: 'low' | 'medium' | 'high' }) => {
    const projects = await storage.list('kanban');
    let project: KanbanProject;
    
    if (projects.length === 0) {
      project = {
        id: 'default-kanban',
        name: args.projectTitle,
        updatedAt: Date.now(),
        tags: ['project'],
        folderId: null,
        history: [],
        columns: [
          { id: 'todo', name: 'To Do', tasks: [] },
          { id: 'in-progress', name: 'In Progress', tasks: [] },
          { id: 'done', name: 'Done', tasks: [] }
        ]
      };
    } else {
      project = projects.find(p => p.name.toLowerCase() === args.projectTitle.toLowerCase())?.data || projects[0].data;
    }

    const task = {
      id: Math.random().toString(36).substr(2, 9),
      title: args.taskTitle,
      description: '',
      priority: args.priority,
      labels: [],
      checklist: [],
      status: 'todo' as any,
      createdAt: Date.now()
    };

    project.columns[0].tasks.push(task);
    project.updatedAt = Date.now();

    await storage.save('kanban', { id: project.id, name: project.name, data: project, updatedAt: project.updatedAt, type: 'kanban' });
    return { status: "success", message: `Task '${args.taskTitle}' added to project '${project.name}'.` };
  },

  createDocument: async (args: { title: string; content: string; category?: any }) => {
    const doc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: args.title,
      content: args.content,
      category: args.category || 'blank',
      updatedAt: Date.now(),
      tags: ['ai-generated'],
      folderId: null,
      history: []
    };
    await storage.save('docs', { id: doc.id, name: doc.name, data: doc, updatedAt: doc.updatedAt, type: 'docs' });
    return { status: "success", message: `Document '${args.title}' created.`, id: doc.id };
  },

  createSpreadsheet: async (args: { title: string; data: string }) => {
    let parsedData = {};
    try {
      parsedData = typeof args.data === 'string' ? JSON.parse(args.data) : args.data;
    } catch (e) {
      console.error("Failed to parse spreadsheet data:", e);
      parsedData = { "A1": args.data }; // Fallback
    }
    const sheet: Spreadsheet = {
      id: Math.random().toString(36).substr(2, 9),
      name: args.title,
      data: parsedData,
      updatedAt: Date.now(),
      tags: ['ai-generated'],
      folderId: null,
      history: []
    };
    await storage.save('sheets', { id: sheet.id, name: sheet.name, data: sheet, updatedAt: sheet.updatedAt, type: 'sheets' });
    return { status: "success", message: `Spreadsheet '${args.title}' created.` };
  },

  createPresentation: async (args: { title: string; slides: any[] }) => {
    const pres: Presentation = {
      id: Math.random().toString(36).substr(2, 9),
      name: args.title,
      slides: args.slides.map(s => ({ ...s, id: Math.random().toString(36).substr(2, 9) })),
      updatedAt: Date.now(),
      tags: ['ai-generated'],
      folderId: null,
      history: []
    };
    await storage.save('slides', { id: pres.id, name: pres.name, data: pres, updatedAt: pres.updatedAt, type: 'slides' });
    return { status: "success", message: `Presentation '${args.title}' created.` };
  },

  createSite: async (args: { title: string; sections: any[] }) => {
    const site: SitePage = {
      id: Math.random().toString(36).substr(2, 9),
      name: args.title,
      pages: [{
        id: 'home',
        name: 'Home',
        path: '/',
        sections: args.sections.map(s => ({ ...s, id: Math.random().toString(36).substr(2, 9) }))
      }],
      activePageId: 'home',
      primaryColor: '#6366F1',
      seo: { title: args.title, description: '', ogImage: '', favicon: '' },
      updatedAt: Date.now(),
      tags: ['ai-generated'],
      folderId: null,
      history: []
    };
    await storage.save('sites', { id: site.id, name: site.name, data: site, updatedAt: site.updatedAt, type: 'sites' });
    return { status: "success", message: `Site '${args.title}' created.` };
  },

  processIntelligenceTask: async (args: { taskType: string; input: string }) => {
    const ai = createAIInstance();
    const prompts: Record<string, string> = {
      summarize: "Summarize the following text concisely:",
      fixGrammar: "Fix the grammar and spelling of the following text:",
      generateHeadline: "Generate a catchy headline for the following text:",
      explainCode: "Explain the following code in simple terms:",
      refactorCode: "Refactor the following code for better readability and performance:",
      generateRegex: "Generate a regular expression for the following requirement:",
      buildSQL: "Build a SQL query for the following requirement:",
      generateAPIRequest: "Generate an API request (fetch or axios) for the following requirement:",
      generateCommitMessage: "Generate a conventional commit message for the following changes:",
      interpretError: "Interpret the following error message and suggest a fix:",
      generateTestCase: "Generate a test case for the following code:",
      draftLegal: "Draft a simple legal document or clause based on the following requirement:"
    };

    const prompt = `${prompts[args.taskType] || "Process the following:"}\n\n${args.input}`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return { status: "success", result: response.text };
  },

  startPodcastRecording: async () => {
    return { status: "success", message: "Podcast studio initialized. Recording starting..." };
  },

  createBusinessPlan: async (args: { name: string; companyName: string; industry: string; sections?: any[] }) => {
    const plan: BusinessPlan = {
      id: Math.random().toString(36).substr(2, 9),
      name: args.name,
      companyName: args.companyName,
      industry: args.industry,
      sections: args.sections || [
        { id: 'exec-summary', title: 'Executive Summary', content: '' },
        { id: 'mission', title: 'Mission & Vision', content: '' },
        { id: 'market', title: 'Market Opportunity', content: '' },
        { id: 'product', title: 'Products & Services', content: '' },
        { id: 'marketing', title: 'Marketing Strategy', content: '' },
        { id: 'financials', title: 'Financial Projections', content: '' }
      ],
      updatedAt: Date.now(),
      tags: ['ai-generated'],
      folderId: null,
      history: []
    };
    await storage.save('plans', { id: plan.id, name: plan.name, data: plan, updatedAt: plan.updatedAt, type: 'plans' });
    return { status: "success", message: `Business plan '${args.name}' created for ${args.companyName}.` };
  },

  startTimer: async (args: { duration: number; label?: string }) => {
    return { status: "success", message: `Timer for ${args.duration}s started.`, duration: args.duration, label: args.label };
  },

  storeMemory: async (args: { fact: string; category?: string }) => {
    const memory = {
      id: Math.random().toString(36).substr(2, 9),
      fact: args.fact,
      category: args.category || 'general',
      timestamp: Date.now()
    };
    const existing = await storage.list('memories');
    await storage.save('memories', { id: memory.id, name: memory.fact.substring(0, 20), data: memory, updatedAt: memory.timestamp, type: 'memories' });
    return { status: "success", message: "Fact stored in long-term memory." };
  },

  retrieveMemory: async (args: { query: string }) => {
    const memories = await storage.list('memories');
    const data = memories.map(m => m.data);
    // Simple filter for demo purposes
    const results = data.filter(m => 
      m.fact.toLowerCase().includes(args.query.toLowerCase()) || 
      m.category.toLowerCase().includes(args.query.toLowerCase())
    );
    return { status: "success", memories: results };
  }
};
