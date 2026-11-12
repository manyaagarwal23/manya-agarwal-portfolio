/**
 * Manya Agarwal Portfolio — Core Client Logic
 * Handles Day/Night Theme Switcher, Lag-Free Valley Parallax Camera, 
 * Smooth Scrolling with Lenis, and Floating Nav Bar Active Highlighting.
 */

(() => {
  'use strict';

  // DOM Elements
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const cam = document.getElementById('cam');
  const heroContent = document.getElementById('heroContent');
  const scrollCue = document.getElementById('scrollCue');
  const valley = document.getElementById('home');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = ['home', 'about', 'work', 'projects', 'contact'];

  // =========================================================
  // 1. Theme Management (Day / Night Mode)
  // =========================================================

  const THEME_STORAGE_KEY = 'manya-theme-pref';

  function getPreferredTheme() {
    const params = new URLSearchParams(window.location.search);
    const queryTheme = params.get('theme');
    if (queryTheme === 'light' || queryTheme === 'dark') return queryTheme;
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default to dark (Night) theme
  }

  function applyTheme(theme, { persist = false, track = false } = {}) {
    html.setAttribute('data-theme', theme);

    if (persist) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Night' : 'Day';
    }

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', theme === 'dark' ? '#090F1C' : '#FFF8EC');
    }

    if (track) {
      // Ping backend only when user explicitly toggles theme
      fetch('/api/toggle-theme', { method: 'POST' }).catch(() => {});
    }
  }

  // Apply on initial load (defaults to Night mode without locking localStorage)
  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, { persist: true, track: true });
    });
  }

  // =========================================================
  // 2. Interactive Village Hero Location Pins & Corner Scroll Indicator
  // =========================================================

  const pinSpots = document.querySelectorAll('.village-pin-spot');
  const popupScrim = document.getElementById('villagePopupScrim');

  function closeAllPinPopups() {
    pinSpots.forEach(s => s.classList.remove('is-active'));
    document.querySelectorAll('.village-pin-popup').forEach(p => {
      p.classList.remove('is-open');
      p.hidden = true;
      p.setAttribute('aria-modal', 'false');
    });
    document.querySelectorAll('.village-pin-btn').forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-expanded', 'false');
    });
    if (popupScrim) {
      popupScrim.classList.remove('is-open');
      popupScrim.hidden = true;
    }
  }

  pinSpots.forEach(spot => {
    const btn = spot.querySelector('.village-pin-btn');
    const popup = spot.querySelector('.village-pin-popup');
    const closeBtn = spot.querySelector('.pin-popup-close');
    const linkBtn = spot.querySelector('.pin-popup-link');

    if (btn && popup) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = popup.classList.contains('is-open');
        closeAllPinPopups();
        if (!isOpen) {
          spot.classList.add('is-active');
          popup.hidden = false;
          popup.classList.add('is-open');
          popup.setAttribute('aria-modal', 'true');
          btn.classList.add('is-active');
          btn.setAttribute('aria-expanded', 'true');
          if (popupScrim) {
            popupScrim.hidden = false;
            popupScrim.classList.add('is-open');
          }
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllPinPopups();
      });
    }

    if (linkBtn) {
      linkBtn.addEventListener('click', (e) => {
        const chapterIdx = linkBtn.getAttribute('data-chapter');
        if (chapterIdx !== null) {
          const idx = parseInt(chapterIdx, 10);
          setTimeout(() => {
            const tabToClick = document.querySelector(`.book-tab[data-chapter="${idx}"]`);
            if (tabToClick) tabToClick.click();
          }, 350);
        }
        closeAllPinPopups();
      });
    }

    // Stop clicks inside popup from bubbling to document
    if (popup) {
      popup.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  });

  // Close when clicking outside or clicking popup scrim
  if (popupScrim) {
    popupScrim.addEventListener('click', closeAllPinPopups);
  }
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.village-pin-spot')) {
      closeAllPinPopups();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllPinPopups();
    }
  });

  // URL query parameter support to auto-open a specific pin (e.g. ?openPin=bel)
  const pinParam = new URLSearchParams(window.location.search).get('openPin');
  if (pinParam) {
    const targetPinBtn = document.getElementById(`pinBtn${pinParam.charAt(0).toUpperCase() + pinParam.slice(1).toLowerCase()}`);
    if (targetPinBtn) {
      setTimeout(() => targetPinBtn.click(), 150);
    }
  }

  // URL query parameter to scroll directly to a section
  const scrollParam = new URLSearchParams(window.location.search).get('scrollSection');
  if (scrollParam) {
    const targetSection = document.getElementById(scrollParam);
    if (targetSection) {
      window.scrollTo(0, targetSection.offsetTop);
    }
  }

  // Bottom-Left "Explore My Story" Scroll Indicator
  const villageScrollCorner = document.getElementById('villageScrollCorner');
  if (villageScrollCorner) {
    villageScrollCorner.addEventListener('click', (e) => {
      e.preventDefault();
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        aboutEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function updateActiveNav(scrollY) {
    const scrollMiddle = scrollY + window.innerHeight * 0.45;

    let currentSection = 'home';
    for (let i = 0; i < sections.length; i++) {
      const el = document.getElementById(sections[i]);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollMiddle >= top && scrollMiddle < top + height) {
          currentSection = sections[i];
          break;
        }
      }
    }

    navLinks.forEach(link => {
      const section = link.getAttribute('data-section');
      if (section === currentSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Native Passive Scroll Listener (Zero Lag, 120 FPS hardware acceleration)
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    if (villageScrollCorner) {
      if (scrollY > 50) {
        villageScrollCorner.style.opacity = '0';
        villageScrollCorner.style.pointerEvents = 'none';
      } else {
        villageScrollCorner.style.opacity = '1';
        villageScrollCorner.style.pointerEvents = 'auto';
      }
    }
    updateActiveNav(scrollY);
  }, { passive: true });

  // Initial trigger
  updateActiveNav(window.scrollY || 0);

  // Smooth scroll click handler for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // =========================================================
  // 5. Interactive Project Map: Data, Filters, Pins & Modals
  // =========================================================

  const DEFAULT_GITHUB_PROFILE = 'https://github.com/manyaagarwal23?tab=repositories';

  const PROJECTS_DATA = {
    'logiclens': {
      id: 'logiclens',
      title: 'LogicLens',
      subtitle: 'X-ray vision for unfamiliar codebases.',
      category: 'AI & DEVELOPER TOOLS',
      featured: true,
      metric: 'AST Graph + Impact AI',
      role: 'Team Project • UI/UX Design & VS Code-Inspired Frontend',
      summary: 'Reads multi-language source repositories and turns them into an interactive dependency graph with natural-language code search and streamed "what-if" impact reports.',
      problem: 'Jumping into a big or legacy repo usually means hours of Ctrl+F guessing which files call which—and hoping changing one function doesn’t quietly break three services.',
      standout: 'Maps frontend-to-backend API bridges across 6 languages (Python, JS/TS, Java, Go, C++) and runs a 3-agent CrewAI blast-radius check before you commit a change.',
      architecture: 'Uses Tree-sitter to extract files, classes, functions, and API routes into a Neo4j graph alongside ChromaDB semantic embeddings, served through a Flask + vis-network interface inspired by VS Code.',
      features: [
        'Interactive file, class, and function dependency graph powered by Neo4j and vis-network',
        'Natural-language semantic code search indexed locally in ChromaDB',
        'Streamed CrewAI "what-if" blast-radius reports for any target function',
        'Git churn hotspots plus basic hardcoded-secret and SQL-injection pattern checks'
      ],
      techStack: ['Python', 'Flask', 'Tree-sitter', 'Neo4j', 'ChromaDB', 'CrewAI', 'Groq', 'JavaScript', 'Tailwind CSS', 'vis-network'],
      githubUrl: 'https://github.com/manyaagarwal23/LogicLens-Code-Dependency-Analyzer',
      repoName: 'manyaagarwal23/LogicLens-Code-Dependency-Analyzer',
      repoDesc: 'Local-first code intelligence tool mapping repositories into Neo4j graphs, ChromaDB embeddings, and CrewAI impact reports.',
      demoUrl: 'https://shivin4.github.io/logiclens/'
    },
    'skillora': {
      id: 'skillora',
      title: 'SkillOra',
      subtitle: 'Build your verified work ledger once. Tailor every resume with receipts.',
      category: 'AGENTIC AI & CAREER TECH',
      featured: true,
      metric: 'Verified Fact Ledger',
      role: 'Team of 4 • Owned Profile Builder, CrewAI IngestFlow & /sources /verify UI',
      summary: 'An agentic AI career workspace that pulls real proof from your GitHub repos, PDFs, and notes into a fact ledger, tailors resumes to any job description, and explains your ATS match score.',
      problem: 'Most AI resume builders happily invent fake numbers and buzzwords—which looks good on paper until an interviewer asks you to explain a bullet you never actually did.',
      standout: 'Every generated bullet has to cite a verified fact ID with a quoted source span (checked by a Google ADK verifier callback), and the backend gracefully falls back to deterministic rules if Gemini is offline.',
      architecture: 'Next.js workspace backed by FastAPI and PostgreSQL (with automatic SQLite fallback). CrewAI flows handle repo/document ingestion and JD parsing, RapidFuzz + n-gram cosine run 3-tier matching, and fpdf2/python-docx export verified resumes.',
      features: [
        'Multimodal ingestion from GitHub repos, PDFs, DOCX, PPTX, and raw notes into a quoted-span fact ledger',
        '3-tier JD requirement matcher (exact, fuzzy token set, and cosine similarity)',
        'Google ADK tailoring agent + verifier guard that blocks ungrounded claims',
        'Explainable ATS-style score breakdown and interactive Coordinator chat drawer'
      ],
      techStack: ['Next.js', 'TypeScript', 'FastAPI', 'Python', 'CrewAI', 'Google ADK', 'Gemini', 'PostgreSQL', 'RapidFuzz', 'fpdf2', 'Docker'],
      githubUrl: 'https://github.com/manyaagarwal23/skillora',
      repoName: 'manyaagarwal23/skillora',
      repoDesc: 'Agentic AI resume intelligence & job-readiness platform built around a verifiable fact ledger.',
      demoUrl: 'https://skillora-frontend-1w3w.onrender.com/'
    },
    'campaigniq': {
      id: 'campaigniq',
      title: 'CampaignIQ',
      subtitle: 'A 3-page Power BI command center with live budget what-if math.',
      category: 'BUSINESS INTELLIGENCE',
      featured: true,
      metric: '3-Page BI + What-If',
      role: 'Solo Project • Data Modeling, DAX & Dashboard UX',
      summary: 'A three-page interactive Power BI dashboard built to track marketing spend, revenue, ROAS, CTR, conversion rate, and CPA across campaigns, products, and channels.',
      problem: 'Growth and marketing teams get stuck bouncing between raw spreadsheets without a quick way to spot which channel is burning cash—or what happens if they shift budget around.',
      standout: 'Includes a live Budget Scenario Simulator built with DAX What-If parameters so you can dial spend up or down and immediately see projected revenue, ROAS, and net impact.',
      architecture: 'Structured Excel campaign data into a clean Power BI reporting model with custom DAX KPI measures, cross-filtering slicers (category, product, channel, date), and a three-view storytelling flow.',
      features: [
        'Executive Overview tracking total spend, revenue, ROAS, CTR, conversion rate, and CPA',
        'Campaign Intelligence matrix comparing spend vs. ROAS across channels and products',
        'Budget Scenario Simulator using DAX What-If parameters for spend-shift exploration',
        'Dynamic filtering by category, product, marketing channel, and campaign window'
      ],
      techStack: ['Microsoft Power BI', 'DAX', 'Microsoft Excel', 'Data Modeling', 'KPI Design', 'Data Visualization'],
      githubUrl: 'https://github.com/manyaagarwal23/CampaignIQ-PowerBI-Marketing-Analytics',
      repoName: 'manyaagarwal23/CampaignIQ-PowerBI-Marketing-Analytics',
      repoDesc: 'Three-page Power BI marketing analytics suite with channel comparison and DAX budget scenario simulation.',
      demoUrl: null
    },
    'watchmate': {
      id: 'watchmate',
      title: 'WatchMate',
      subtitle: 'Ask by mood, plot, or screenshot—get real titles and where to stream them.',
      category: 'FULL-STACK & RAG AI',
      featured: true,
      metric: 'RAG + Vision + Watchie',
      role: 'Solo Build • Full-Stack, pgvector RAG & Product UI',
      summary: 'A movie and TV discovery app combining live TMDB catalog data, natural-language mood search, screenshot-to-title identification, Watch Later lists, and Watchie—a grounded AI movie buddy.',
      problem: 'Standard search bars fall flat when you want "a cozy mystery without gore," only remember a single movie frame from a reel, or just want to know which Indian OTT platform actually streams it.',
      standout: 'Strict grounding rule: Watchie and CrewAI only recommend titles resolved against live TMDB and pgvector records—and if an external API fails, it tells you honestly instead of making up fake movies or OTT links.',
      architecture: 'Dockerized React + TypeScript frontend talking to a FastAPI backend and PostgreSQL 17 with pgvector (HNSW index on Voyage embeddings), Groq text + vision models, and selective CrewAI orchestration.',
      features: [
        'Live TMDB discovery, cast/crew details, similar titles, and India (IN) Where to Watch providers',
        'Semantic mood and plot search backed by Voyage embeddings and pgvector cosine similarity',
        'Upload a movie still or scene screenshot to identify the title via Groq Vision',
        'Watchie conversational assistant + cookie-auth accounts with persistent Watch Later lists'
      ],
      techStack: ['React', 'TypeScript', 'Vite', 'FastAPI', 'Python', 'PostgreSQL', 'pgvector', 'Groq Vision', 'Voyage AI', 'CrewAI', 'TMDB API', 'Docker'],
      githubUrl: 'https://github.com/manyaagarwal23/WatchMate',
      repoName: 'manyaagarwal23/WatchMate',
      repoDesc: 'Full-stack movie & TV discovery platform with pgvector RAG, Groq Vision identification, CrewAI, and Watchie.',
      demoUrl: null
    },
    'disaster-hub': {
      id: 'disaster-hub',
      title: 'Disaster Response Intelligence Hub',
      subtitle: 'Onboard onto massive humanitarian codebases with live diagrams, not guesswork.',
      category: 'RAG & DEVELOPER TOOLS',
      featured: true,
      metric: 'Code RAG + Mermaid',
      role: 'Collaborative Build • RAG Interface & Visual Architecture',
      summary: 'An AI codebase assistant built specifically for the Ushahidi disaster-response PHP platform, pairing semantic code search and LLM reranking with dynamically generated Mermaid.js flowcharts.',
      problem: 'Crisis-response open-source tools rely on fast volunteer contributions, yet legacy codebases are huge and hard to untangle when you just want to find where a feature lives.',
      standout: 'Lets you toggle between a "Simple Explanation" and "Technical Details," shows the exact source snippets it pulled from, and draws fresh Mermaid architecture diagrams on the fly.',
      architecture: 'FastAPI backend indexing the codebase with BAAI/bge-base-en-v1.5 SentenceTransformers into ChromaDB, reranked and explained via LangChain + ChatGroq (Qwen), rendered inside a zero-framework dark glassmorphism UI.',
      features: [
        'Semantic code search using SentenceTransformers (bge-base-en-v1.5) and ChromaDB',
        'LangChain + Groq LLM reranking with dual Simple vs. Technical explanation modes',
        'Auto-generated Mermaid.js flowcharts illustrating retrieved code paths',
        'Expandable source-code evidence cards, Pytest suite, and GitHub Actions CI'
      ],
      techStack: ['Python', 'FastAPI', 'ChromaDB', 'SentenceTransformers', 'LangChain', 'Groq', 'HTML5', 'CSS3', 'JavaScript', 'Mermaid.js', 'Pytest'],
      githubUrl: 'https://github.com/manyaagarwal23/disaster-response-intelligence-repo-hub',
      repoName: 'manyaagarwal23/disaster-response-intelligence-repo-hub',
      repoDesc: 'RAG-based codebase assistant for the Ushahidi platform with semantic search, reranking, and Mermaid diagrams.',
      demoUrl: null
    },
    'personapath': {
      id: 'personapath',
      title: 'PersonaPath',
      subtitle: 'An AI speaking coach that listens to your voice and reads your delivery.',
      category: 'MULTIMODAL AI · AUDIO & VISION',
      featured: true,
      metric: 'Audio + Video ML',
      role: 'Team Project • Multimodal ML & Assessment Pipeline',
      summary: 'A two-phase multimodal speech and literacy system: Phase 1 helps kids (5–10) with reading speed and pronunciation, while Phase 2 coaches older speakers (10+) on vocal confidence and facial delivery.',
      problem: 'Speaking coaching is expensive and subjective, while basic speech-to-text tools ignore hesitation, pacing, tone steadiness, and whether your facial expressions match your message.',
      standout: 'Combines three separate deep-learning signals—Wav2Vec 2.0 phoneme/text alignment, an MFCC-trained 2-layer LSTM confidence model, and MobileNetV2 facial emotion tracking—into one coaching feedback loop.',
      architecture: 'Decoupled multimodal inference combining Librosa acoustic extraction, Whisper/Wav2Vec 2.0 transcription with Levenshtein alignment, OpenCV + fine-tuned MobileNetV2 on video frames, and LLM-generated coaching tips.',
      features: [
        'Phase 1 Literacy Coach: WPM reading speed, hesitation detection, and pronunciation alignment',
        'Phase 2 Presentation Pro: LSTM vocal confidence scoring from MFCC, delta, and pitch features',
        'Frame-by-frame facial emotion analysis using OpenCV and fine-tuned MobileNetV2',
        'Actionable, personalized speaking feedback dashboard'
      ],
      techStack: ['Python', 'TensorFlow', 'Keras', 'Wav2Vec 2.0', 'Whisper', 'MobileNetV2', 'LSTM', 'OpenCV', 'Librosa', 'Gradio', 'Hugging Face'],
      githubUrl: 'https://github.com/manyaagarwal23/PersonaPath-Literacy-Speech-Assessment',
      repoName: 'manyaagarwal23/PersonaPath-Literacy-Speech-Assessment',
      repoDesc: 'Multimodal speech & literacy assessment combining Wav2Vec 2.0, LSTM vocal confidence, and MobileNetV2 emotion analysis.',
      demoUrl: 'https://personapath-ai.vercel.app'
    },
    'cjp-discourse': {
      id: 'cjp-discourse',
      title: 'CJP Online Discourse Analysis',
      subtitle: 'Testing whether social media really traps everyone in sealed echo chambers.',
      category: 'DATA SCIENCE & NETWORK NLP',
      featured: false,
      metric: '86.11% Validated Acc',
      role: 'Research & Analytics Build • Pipeline, Stance Validation & Network Viz',
      summary: 'A cross-platform computational study of 150 Reddit posts, 2,329 comments, and multi-period X (Twitter) data around the CJP–NEET protest—tracking communities, sentiment, stance, and cross-side replies.',
      problem: 'People often label any online cluster an "echo chamber" without actually measuring whether opposing sides talk to each other or how interaction changes from Before → Peak → After.',
      standout: 'Measured Krackhardt E-I indices alongside manual-validated stance mixing (N=180, 86.11% accuracy), finding that over 64% (X) and 70% (Reddit) of Anti-CJP outgoing replies targeted Pro-CJP users directly.',
      architecture: '9-stage reproducible Python pipeline: ingestion & cleaning, directed mention/reply graphs, Louvain community detection (Q=0.89 Reddit, Q=0.75 X), VADER sentiment + Dunn post-hoc tests, TF-IDF + Logistic Regression stance model, and PyVis graphs.',
      features: [
        'Louvain community detection across Reddit reply graphs (Q = 0.89) and X mention graphs (Q = 0.75)',
        'Separates emotional tone (VADER sentiment) from position (Pro / Anti / Neutral stance)',
        'Stratified manual validation on 180 samples (86.11% accuracy, 0.8493 Macro F1)',
        'Interactive PyVis network visualizations and Before → Peak → After polarization timelines'
      ],
      techStack: ['Python', 'NetworkX', 'Louvain Modularity', 'VADER', 'Scikit-learn', 'TF-IDF', 'PyVis', 'Pandas', 'Matplotlib'],
      githubUrl: 'https://github.com/manyaagarwal23/cjp-neet-protest-social-media-analysis',
      repoName: 'manyaagarwal23/cjp-neet-protest-social-media-analysis',
      repoDesc: 'Cross-platform analysis of echo chambers, stance polarization, and network communities on X and Reddit.',
      demoUrl: null
    },
    'placement': {
      id: 'placement',
      title: 'Placement Management Platform',
      subtitle: 'Turning messy campus placement spreadsheets into live funnel intelligence.',
      category: 'FULL-STACK & SQL ANALYTICS',
      featured: false,
      metric: '10-Table 3NF + SQL',
      role: 'Solo Build • 3NF PostgreSQL Schema, Express API & React Dashboard',
      summary: 'A full-stack campus placement system that unifies student profiles, recruiting companies, job drives, applications, interview rounds, offers, and skill matching in one live analytics hub.',
      problem: 'Placement cells usually run on scattered Excel files, making it impossible to quickly see which students are placement-ready or which roles are losing candidates mid-funnel.',
      standout: 'Live SQL bottleneck detection automatically flags job roles whose interview-to-offer conversion drops below the platform average, paired with a transparent weighted Placement Readiness Score.',
      architecture: 'Strictly normalized 10-table 3NF PostgreSQL 16 schema (foreign keys, CHECK constraints, indexes, and audit logging) connected through an Express.js REST API to a React + Vite + Recharts frontend.',
      features: [
        'Executive dashboard with 8 live KPIs and 7 interactive Recharts visualizations',
        'Automated status pipeline (logging an interview or offer updates application status)',
        'Transparent Placement Readiness Score, skill-gap matching %, and company conversion metrics',
        'Full CRUD with backend pagination/filtering and automatic mutation audit logs'
      ],
      techStack: ['React', 'Vite', 'Tailwind CSS', 'Recharts', 'Node.js', 'Express.js', 'PostgreSQL', 'SQL', 'REST APIs'],
      githubUrl: 'https://github.com/manyaagarwal23/placement-management-platform',
      repoName: 'manyaagarwal23/placement-management-platform',
      repoDesc: 'Full-stack campus placement & intelligence platform backed by a 10-table 3NF PostgreSQL schema.',
      demoUrl: null
    },
    'linkpulse-api': {
      id: 'linkpulse-api',
      title: 'ShortLink & TeamOps API',
      subtitle: 'Production-ready URL shortener, click telemetry, and real-time team collaboration.',
      category: 'BACKEND & SYSTEM DESIGN',
      featured: false,
      metric: 'Rate Limits + Metrics',
      role: 'Backend & Systems Engineering • APIs, RBAC, Migrations & Observability',
      summary: 'A production-focused backend suite pairing a FastAPI URL shortener (with click analytics, background workers, and Prometheus telemetry) and a Node.js WebSocket team collaboration & RBAC service.',
      problem: 'Basic CRUD tutorials fall over in production: they skip rate limiting, leak raw IPs in analytics, lack database migrations, or allow role-escalation bugs in team permissions.',
      standout: 'Built with real production guardrails: 30/120 rpm rate limiters, SHA-256 IP hashing for privacy-safe click logs, Alembic migrations, structlog request tracing, Prometheus metrics, and WebSocket event-bus audit logs.',
      architecture: 'Two complementary services: a FastAPI + SQLAlchemy + Alembic link service with background worker and Prometheus `/metrics`, plus a Node.js team RBAC API using explicit endpoint role checks and an EventEmitter-driven WebSocket activity feed.',
      features: [
        'FastAPI URL shortener with user-scoped link creation (30 rpm) and IP-throttled redirects (120 rpm)',
        'Privacy-safe click tracking (SHA-256 hashed IPs, user-agent, referrer) + background worker',
        'Strict RBAC team & invitation endpoints with WebSocket real-time activity feed and audit log',
        'Docker Compose setup, Alembic DB migrations, structured JSON logging, and automated tests'
      ],
      techStack: ['Python', 'FastAPI', 'SQLAlchemy', 'Alembic', 'PostgreSQL', 'Node.js', 'WebSockets', 'Docker', 'Prometheus', 'Structlog'],
      githubUrl: 'https://github.com/manyaagarwal23/CAW-Assignment',
      repoName: 'FastAPI ShortLink & TeamOps Repository',
      repoDesc: 'Production-oriented URL shortener & analytics API plus WebSocket team RBAC collaboration backend.',
      demoUrl: null
    },
    'university-assistant': {
      id: 'university-assistant',
      title: 'University Assistant (Phi-2 LoRA)',
      subtitle: 'Teaching a compact open-weight LLM campus rules without burning GPU budgets.',
      category: 'NLP & LLM FINE-TUNING',
      featured: false,
      metric: '9x Accuracy Boost',
      role: 'Solo ML Experiment • Dataset Curation, LoRA Fine-Tuning & Eval',
      summary: 'A domain-adapted campus Q&A assistant built by fine-tuning Microsoft’s Phi-2 language model with LoRA/PEFT on 900 curated university academic and administrative questions.',
      problem: 'General-purpose LLMs confidently invent fake course prerequisites and open-elective rules, while full-parameter fine-tuning is overkill for a focused campus assistant.',
      standout: 'Jumped accuracy 9x over the base Phi-2 model (5% → 45%) and more than doubled ROUGE-1 (0.168 → 0.379) by tuning lightweight LoRA attention adapters on a single Colab GPU.',
      architecture: 'Tokenized a custom 900-sample university Q&A dataset via Hugging Face Datasets, attached LoRA adapters (r=8, alpha=16 targeting q_proj and v_proj) on quantized Phi-2, trained for 3 epochs in fp16, and benchmarked against base Phi-2.',
      features: [
        'Custom 900-sample university Q&A dataset covering electives, courses, and admin processes',
        'Parameter-efficient LoRA fine-tuning (PEFT) on Microsoft Phi-2 using BitsAndBytes fp16',
        'Head-to-head benchmark vs. base model on BLEU, ROUGE-1/2/L, and exact accuracy',
        'Interactive CLI loop for real-time campus queries'
      ],
      techStack: ['Python', 'Microsoft Phi-2', 'PEFT / LoRA', 'PyTorch', 'Hugging Face Transformers', 'BitsAndBytes', 'Google Colab'],
      githubUrl: 'https://github.com/manyaagarwal23/university-assistant-llm-finetuning',
      repoName: 'manyaagarwal23/university-assistant-llm-finetuning',
      repoDesc: 'LoRA/PEFT fine-tuning of Microsoft Phi-2 on university Q&A data with BLEU/ROUGE benchmarks.',
      demoUrl: null
    },
    'smart-greenhouse': {
      id: 'smart-greenhouse',
      title: 'Smart Greenhouse + 3D Twin',
      subtitle: 'Physical sensors, automated climate control, and a live 3D greenhouse in the browser.',
      category: 'IOT & 3D VISUALIZATION',
      featured: false,
      metric: 'ESP32 + Three.js Twin',
      role: 'Solo Hardware & Web Build • Firmware, Cloud Alerts & 3D UI',
      summary: 'An ESP32-based greenhouse automation build that monitors soil moisture and ambient light, automatically toggles water pumps, fans, and grow lights, and pairs with an interactive Three.js 3D web dashboard.',
      problem: 'Small greenhouses and indoor setups suffer when moisture drops or light fades while nobody is around to flip a switch.',
      standout: 'Connects embedded C++ firmware (simulated in Wokwi with an OLED readout and RGB status LED) directly to ThingSpeak cloud telemetry, instant Telegram bot alerts, and a Three.js OrbitControls 3D dashboard.',
      architecture: 'PlatformIO C++ firmware on ESP32 reading analog soil/LDR pins to actuate relays, SSD1306 OLED, and buzzer, pushing live metrics over HTTPS to ThingSpeak & Telegram while a custom Three.js frontend visualizes the environment in 3D.',
      features: [
        'Automated pump, cooling fan, and grow-light actuation from soil moisture & LDR thresholds',
        'Live SSD1306 OLED status display, RGB status indicator, and buzzer warnings',
        'Instant HTTPS Telegram Bot alerts and ThingSpeak cloud logging',
        'Interactive Three.js + OrbitControls 3D Smart Greenhouse web dashboard'
      ],
      techStack: ['ESP32', 'C++', 'PlatformIO', 'Wokwi', 'Three.js', 'HTML5', 'CSS3', 'ThingSpeak', 'Telegram Bot API'],
      githubUrl: 'https://github.com/manyaagarwal23/projects/tree/main/SmartGreenHouse',
      repoName: 'manyaagarwal23/projects (SmartGreenHouse)',
      repoDesc: 'ESP32 smart greenhouse firmware with Wokwi simulation, Telegram alerts, and a Three.js 3D dashboard.',
      demoUrl: null
    },
    'unimingle': {
      id: 'unimingle',
      title: 'Unimingle',
      subtitle: 'Find spontaneous campus plans, host meetups, and chat in real time.',
      category: 'MOBILE APP & UI/UX',
      featured: false,
      metric: 'Figma → Native Android',
      role: 'Designer & Android Developer • Figma UI/UX, Java & Firebase',
      summary: 'A campus social networking Android app built in Java and Firebase where students discover nearby hangouts, create campus events, browse peer profiles, and chat in real time.',
      problem: 'College life outside formal clubs can feel surprisingly fragmented—putting together an impromptu study jam or badminton game shouldn’t mean spamming five WhatsApp groups.',
      standout: 'Designed from scratch in Figma (wireframes, user flows, and card layouts) and shipped into a working native Android build backed by Firebase Authentication and Realtime Database.',
      architecture: 'Native Android (Java) client in Android Studio structured around event discovery cards, student profile directories, Firebase Auth verification, and live Firebase Realtime Database messaging.',
      features: [
        'End-to-end UI/UX wireframes and interactive flows designed in Figma',
        'Activity feed for creating, browsing, and joining student-led campus events',
        'Student profile cards and peer connection directory',
        'Real-time 1:1 and group messaging powered by Firebase Realtime Database'
      ],
      techStack: ['Figma', 'UI/UX Design', 'Java', 'Android Studio', 'Firebase Auth', 'Firebase Realtime DB'],
      githubUrl: 'https://github.com/manyaagarwal23/UNIMINGLE',
      repoName: 'manyaagarwal23/UNIMINGLE',
      repoDesc: 'Native Android campus social networking app with Figma UI/UX, event discovery, and Firebase chat.',
      demoUrl: null
    },
    'portfolio': {
      id: 'portfolio',
      title: 'Interactive Story Portfolio',
      subtitle: 'A day-to-night illustrated world built from scratch without heavy frameworks.',
      category: 'UI/UX DESIGN & CREATIVE DEV',
      featured: false,
      metric: 'Zero-Framework Build',
      role: 'Solo Designer & Engineer • Concept, Visual UX & Full Codebase',
      summary: 'The website you’re exploring right now—blending a day/night illustrated village hero, a cursor-tracking 3D mascot, a 3D leather-bound work journal, and this interactive project city map.',
      problem: 'Too many portfolios look like identical sterile templates that list bullet points instead of showing how a designer and engineer actually thinks about experience.',
      standout: 'Zero frontend frameworks or animation libraries—crafted purely with vanilla CSS 3D perspective transforms, requestAnimationFrame cursor physics, 7 reactive mascot expressions, and a live Node.js server.',
      architecture: 'Semantic HTML5 and custom CSS design tokens with Day/Night crossfades, modular vanilla JS engines for the mascot, open book, and pannable SVG city map, served by a lightweight Node.js HTTP & stats API.',
      features: [
        'Full-screen Day/Night village canvas with interactive location pins and frosted modals',
        '3D cursor-following mascot that waves, thinks when idle, and reacts to hobby pills',
        'Top-down desk & 3D open-book work journal with keyboard-navigable chapter tabs',
        'Pannable, zoomable, domain-filterable project city map deployed live on Render'
      ],
      techStack: ['UI/UX Design', 'HTML5', 'CSS3', 'Vanilla JavaScript', 'Node.js', '3D Transforms', 'ARIA Accessibility', 'Render'],
      githubUrl: 'https://github.com/manyaagarwal23/manya-agarwal-portfolio',
      repoName: 'manyaagarwal23/manya-agarwal-portfolio',
      repoDesc: 'Interactive zero-framework portfolio with day/night worlds, 3D mascot, open-book work journal, and project map.',
      demoUrl: 'https://manya-agarwal-portfolio.onrender.com/'
    }
  };

  // Ordered list of projects for Prev/Next modal browsing
  const PROJECT_ORDER = [
    'logiclens',
    'skillora',
    'campaigniq',
    'watchmate',
    'disaster-hub',
    'personapath',
    'cjp-discourse',
    'placement',
    'linkpulse-api',
    'university-assistant',
    'smart-greenhouse',
    'unimingle',
    'portfolio'
  ];

  // =========================================================
  // Filter Bar & Modal DOM Elements & Logic
  // =========================================================

  let currentActiveProjectId = null;
  let lastFocusedTrigger = null;
  let activeDomainFilter = 'all';

  const filterBar = document.getElementById('mapFilterBar');
  const filterPills = document.querySelectorAll('.map-filter-pill');
  const mapHintText = document.getElementById('mapHintText');
  const pinAnchors = document.querySelectorAll('.map-pin-anchor');

  function getFilteredProjectIds() {
    if (activeDomainFilter === 'all') return [...PROJECT_ORDER];
    return PROJECT_ORDER.filter(id => {
      const pin = document.querySelector(`.map-pin-anchor[data-project-id="${id}"]`);
      if (!pin) return false;
      const domains = (pin.getAttribute('data-domain') || '').split(/\s+/);
      return domains.includes(activeDomainFilter);
    });
  }

  function applyDomainFilter(filterKey, labelText) {
    activeDomainFilter = filterKey;
    let visibleCount = 0;

    pinAnchors.forEach(pin => {
      const domains = (pin.getAttribute('data-domain') || '').split(/\s+/);
      const matches = filterKey === 'all' || domains.includes(filterKey);
      pin.classList.toggle('is-dimmed', !matches);
      if (matches) visibleCount++;
    });

    if (mapHintText) {
      if (filterKey === 'all') {
        mapHintText.textContent = `🧭 ${visibleCount} Interactive Projects • Click any pin to explore`;
      } else {
        mapHintText.textContent = `🧭 ${visibleCount} ${labelText} Projects • Click any highlighted pin`;
      }
    }
  }

  if (filterBar) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = pill.getAttribute('data-filter') || 'all';
        filterPills.forEach(p => {
          p.classList.remove('is-active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('is-active');
        pill.setAttribute('aria-selected', 'true');
        applyDomainFilter(key, pill.textContent.trim());
      });
    });
  }

  // Overview Popup Elements
  const overviewBackdrop = document.getElementById('projectOverviewBackdrop');
  const overviewCloseBtn = document.getElementById('overviewCloseBtn');
  const overviewDetailsBtn = document.getElementById('overviewDetailsBtn');
  const overviewGithubBtn = document.getElementById('overviewGithubBtn');
  const overviewGithubLabel = document.getElementById('overviewGithubLabel');
  const overviewDemoBtn = document.getElementById('overviewDemoBtn');
  const overviewTopDemoBtn = document.getElementById('overviewTopDemoBtn');
  const overviewCategory = document.getElementById('overviewCategory');
  const overviewFeaturedBadge = document.getElementById('overviewFeaturedBadge');
  const overviewMetric = document.getElementById('overviewMetric');
  const overviewTitle = document.getElementById('overviewTitle');
  const overviewSubtitle = document.getElementById('overviewSubtitle');
  const overviewRole = document.getElementById('overviewRole');
  const overviewSummary = document.getElementById('overviewSummary');
  const overviewProblem = document.getElementById('overviewProblem');
  const overviewStandoutBox = document.getElementById('overviewStandoutBox');
  const overviewStandout = document.getElementById('overviewStandout');
  const overviewFeatures = document.getElementById('overviewFeatures');
  const overviewTags = document.getElementById('overviewTags');
  const overviewPrevBtn = document.getElementById('overviewPrevBtn');
  const overviewNextBtn = document.getElementById('overviewNextBtn');
  const overviewPagerCount = document.getElementById('overviewPagerCount');

  // Full Detail Modal Elements
  const detailBackdrop = document.getElementById('projectDetailBackdrop');
  const detailCloseBtn = document.getElementById('detailCloseBtn');
  const detailDismissBtn = document.getElementById('detailDismissBtn');
  const detailCategory = document.getElementById('detailCategory');
  const detailFeaturedBadge = document.getElementById('detailFeaturedBadge');
  const detailMetric = document.getElementById('detailMetric');
  const detailTitle = document.getElementById('detailTitle');
  const detailSubtitle = document.getElementById('detailSubtitle');
  const detailRole = document.getElementById('detailRole');
  const detailSummary = document.getElementById('detailSummary');
  const detailProblem = document.getElementById('detailProblem');
  const detailStandoutBox = document.getElementById('detailStandoutBox');
  const detailStandout = document.getElementById('detailStandout');
  const detailArchitecture = document.getElementById('detailArchitecture');
  const detailFeatures = document.getElementById('detailFeatures');
  const detailTechStack = document.getElementById('detailTechStack');
  const detailRepoName = document.getElementById('detailRepoName');
  const detailRepoDesc = document.getElementById('detailRepoDesc');
  const detailRepoLink = document.getElementById('detailRepoLink');
  const detailDemoBtn = document.getElementById('detailDemoBtn');
  const detailTopDemoBtn = document.getElementById('detailTopDemoBtn');
  const detailPrevBtn = document.getElementById('detailPrevBtn');
  const detailNextBtn = document.getElementById('detailNextBtn');
  const detailPagerCount = document.getElementById('detailPagerCount');

  function updatePagerUI(projectId, prevBtn, nextBtn, countEl) {
    const list = getFilteredProjectIds();
    const activeList = list.includes(projectId) ? list : PROJECT_ORDER;
    const idx = activeList.indexOf(projectId);
    if (countEl) {
      countEl.textContent = `${idx + 1} / ${activeList.length}`;
    }
    if (prevBtn) prevBtn.disabled = activeList.length <= 1;
    if (nextBtn) nextBtn.disabled = activeList.length <= 1;
  }

  function stepProject(delta, mode) {
    if (!currentActiveProjectId) return;
    const list = getFilteredProjectIds();
    const activeList = list.includes(currentActiveProjectId) ? list : PROJECT_ORDER;
    const idx = activeList.indexOf(currentActiveProjectId);
    const nextIdx = (idx + delta + activeList.length) % activeList.length;
    const nextId = activeList[nextIdx];
    if (mode === 'detail') {
      openProjectDetail(nextId);
    } else {
      openProjectOverview(nextId);
    }
  }

  function openProjectOverview(projectId) {
    const data = PROJECTS_DATA[projectId];
    if (!data || !overviewBackdrop) return;

    currentActiveProjectId = projectId;

    if (overviewCategory) overviewCategory.textContent = data.category;
    if (overviewFeaturedBadge) {
      overviewFeaturedBadge.style.display = data.featured ? 'inline-flex' : 'none';
    }
    if (overviewMetric) overviewMetric.textContent = data.metric;
    if (overviewTitle) overviewTitle.textContent = data.title;
    if (overviewSubtitle) overviewSubtitle.textContent = data.subtitle;

    if (overviewRole) {
      if (data.role) {
        overviewRole.textContent = data.role;
        overviewRole.style.display = 'block';
      } else {
        overviewRole.style.display = 'none';
      }
    }

    if (overviewSummary) overviewSummary.textContent = data.summary;
    if (overviewProblem) overviewProblem.textContent = data.problem;

    if (overviewStandoutBox && overviewStandout) {
      if (data.standout) {
        overviewStandout.textContent = data.standout;
        overviewStandoutBox.style.display = 'block';
      } else {
        overviewStandoutBox.style.display = 'none';
      }
    }

    // Implementation features bullets
    if (overviewFeatures) {
      overviewFeatures.innerHTML = '';
      (data.features || []).forEach(feat => {
        const li = document.createElement('li');
        li.textContent = feat;
        overviewFeatures.appendChild(li);
      });
    }

    // Tech Tags (show top 6 + remainder badge)
    if (overviewTags) {
      overviewTags.innerHTML = '';
      const stack = data.techStack || [];
      stack.slice(0, 6).forEach(tag => {
        const span = document.createElement('span');
        span.className = 'modal-tag';
        span.textContent = tag;
        overviewTags.appendChild(span);
      });
      if (stack.length > 6) {
        const more = document.createElement('span');
        more.className = 'modal-tag modal-tag-more';
        more.textContent = `+${stack.length - 6} more`;
        overviewTags.appendChild(more);
      }
    }

    // GitHub Button
    const targetRepoUrl = data.githubUrl || DEFAULT_GITHUB_PROFILE;
    if (overviewGithubBtn) {
      overviewGithubBtn.href = targetRepoUrl;
      overviewGithubBtn.setAttribute('aria-label', `View ${data.title} repository on GitHub`);
    }
    if (overviewGithubLabel) {
      overviewGithubLabel.textContent = data.githubUrl ? 'GitHub Repo' : 'GitHub Profile';
    }

    // Deployed Live Demo Buttons (Top beside heading + Bottom action bar)
    [overviewDemoBtn, overviewTopDemoBtn].forEach(btn => {
      if (!btn) return;
      if (data.demoUrl) {
        btn.href = data.demoUrl;
        btn.style.display = 'inline-flex';
        btn.setAttribute('aria-label', `Open live deployment for ${data.title}`);
      } else {
        btn.style.display = 'none';
      }
    });

    updatePagerUI(projectId, overviewPrevBtn, overviewNextBtn, overviewPagerCount);

    // Close detail modal if open
    if (detailBackdrop) {
      detailBackdrop.classList.remove('is-open');
      detailBackdrop.setAttribute('aria-hidden', 'true');
    }

    overviewBackdrop.classList.add('is-open');
    overviewBackdrop.setAttribute('aria-hidden', 'false');
    if (overviewCloseBtn) overviewCloseBtn.focus();
  }

  function closeProjectOverview() {
    if (!overviewBackdrop) return;
    overviewBackdrop.classList.remove('is-open');
    overviewBackdrop.setAttribute('aria-hidden', 'true');
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
    }
  }

  function openProjectDetail(projectId) {
    const data = PROJECTS_DATA[projectId];
    if (!data || !detailBackdrop) return;

    currentActiveProjectId = projectId;

    if (detailCategory) detailCategory.textContent = data.category;
    if (detailFeaturedBadge) {
      detailFeaturedBadge.style.display = data.featured ? 'inline-flex' : 'none';
    }
    if (detailMetric) {
      if (data.metric) {
        detailMetric.textContent = data.metric;
        detailMetric.style.display = 'inline-flex';
      } else {
        detailMetric.style.display = 'none';
      }
    }
    if (detailTitle) detailTitle.textContent = data.title;
    if (detailSubtitle) detailSubtitle.textContent = data.subtitle;

    if (detailRole) {
      if (data.role) {
        detailRole.textContent = data.role;
        detailRole.style.display = 'block';
      } else {
        detailRole.style.display = 'none';
      }
    }

    if (detailSummary) detailSummary.textContent = data.summary;
    if (detailProblem) detailProblem.textContent = data.problem;

    if (detailStandoutBox && detailStandout) {
      if (data.standout) {
        detailStandout.textContent = data.standout;
        detailStandoutBox.style.display = 'block';
      } else {
        detailStandoutBox.style.display = 'none';
      }
    }

    if (detailArchitecture) detailArchitecture.textContent = data.architecture;

    // Detailed features grid
    if (detailFeatures) {
      detailFeatures.innerHTML = '';
      (data.features || []).forEach(feat => {
        const li = document.createElement('li');
        li.className = 'detail-feature-item';
        const bullet = document.createElement('span');
        bullet.className = 'feat-bullet';
        bullet.textContent = '✦';
        const text = document.createElement('span');
        text.className = 'feat-text';
        text.textContent = feat;
        li.appendChild(bullet);
        li.appendChild(text);
        detailFeatures.appendChild(li);
      });
    }

    // Full tech stack pills
    if (detailTechStack) {
      detailTechStack.innerHTML = '';
      (data.techStack || []).forEach(tech => {
        const span = document.createElement('span');
        span.className = 'skill-pill';
        span.textContent = tech;
        detailTechStack.appendChild(span);
      });
    }

    // Verified GitHub & Live Link card
    const targetRepoUrl = data.githubUrl || DEFAULT_GITHUB_PROFILE;
    if (detailRepoName) detailRepoName.textContent = data.repoName || 'manyaagarwal23 / repositories';
    if (detailRepoDesc) detailRepoDesc.textContent = data.repoDesc || 'Explore project repository on GitHub.';
    if (detailRepoLink) {
      detailRepoLink.href = targetRepoUrl;
      detailRepoLink.setAttribute('aria-label', `View ${data.title} repository on GitHub`);
    }
    [detailDemoBtn, detailTopDemoBtn].forEach(btn => {
      if (!btn) return;
      if (data.demoUrl) {
        btn.href = data.demoUrl;
        btn.style.display = 'inline-flex';
        btn.setAttribute('aria-label', `Open live deployment for ${data.title}`);
      } else {
        btn.style.display = 'none';
      }
    });

    updatePagerUI(projectId, detailPrevBtn, detailNextBtn, detailPagerCount);

    // Close overview popup
    if (overviewBackdrop) {
      overviewBackdrop.classList.remove('is-open');
      overviewBackdrop.setAttribute('aria-hidden', 'true');
    }

    detailBackdrop.classList.add('is-open');
    detailBackdrop.setAttribute('aria-hidden', 'false');
    if (detailCloseBtn) detailCloseBtn.focus();
  }

  function closeProjectDetail() {
    if (!detailBackdrop) return;
    detailBackdrop.classList.remove('is-open');
    detailBackdrop.setAttribute('aria-hidden', 'true');
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
    }
  }

  // Pin click listeners
  pinAnchors.forEach(pin => {
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectId = pin.getAttribute('data-project-id');
      if (projectId) {
        lastFocusedTrigger = pin.querySelector('.pin-label-pill') || pin;
        openProjectOverview(projectId);
      }
    });

    // Make pin keyboard accessible via Enter / Space
    pin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const projectId = pin.getAttribute('data-project-id');
        if (projectId) {
          lastFocusedTrigger = pin.querySelector('.pin-label-pill') || pin;
          openProjectOverview(projectId);
        }
      }
    });
  });

  // Overview Action Listeners
  if (overviewCloseBtn) overviewCloseBtn.addEventListener('click', closeProjectOverview);
  if (overviewPrevBtn) overviewPrevBtn.addEventListener('click', () => stepProject(-1, 'overview'));
  if (overviewNextBtn) overviewNextBtn.addEventListener('click', () => stepProject(1, 'overview'));
  if (overviewDetailsBtn) {
    overviewDetailsBtn.addEventListener('click', () => {
      if (currentActiveProjectId) {
        openProjectDetail(currentActiveProjectId);
      }
    });
  }

  if (overviewBackdrop) {
    overviewBackdrop.addEventListener('click', (e) => {
      if (e.target === overviewBackdrop) {
        closeProjectOverview();
      }
    });
  }

  // Detail Action Listeners
  if (detailCloseBtn) detailCloseBtn.addEventListener('click', closeProjectDetail);
  if (detailDismissBtn) detailDismissBtn.addEventListener('click', closeProjectDetail);
  if (detailPrevBtn) detailPrevBtn.addEventListener('click', () => stepProject(-1, 'detail'));
  if (detailNextBtn) detailNextBtn.addEventListener('click', () => stepProject(1, 'detail'));

  if (detailBackdrop) {
    detailBackdrop.addEventListener('click', (e) => {
      if (e.target === detailBackdrop) {
        closeProjectDetail();
      }
    });
  }

  // Keyboard navigation: Escape closes active modal, Left/Right steps projects
  document.addEventListener('keydown', (e) => {
    const detailOpen = detailBackdrop && detailBackdrop.classList.contains('is-open');
    const overviewOpen = overviewBackdrop && overviewBackdrop.classList.contains('is-open');

    if (e.key === 'Escape') {
      if (detailOpen) closeProjectDetail();
      else if (overviewOpen) closeProjectOverview();
    } else if (e.key === 'ArrowLeft') {
      if (detailOpen) stepProject(-1, 'detail');
      else if (overviewOpen) stepProject(-1, 'overview');
    } else if (e.key === 'ArrowRight') {
      if (detailOpen) stepProject(1, 'detail');
      else if (overviewOpen) stepProject(1, 'overview');
    }
  });

  // =========================================================
  // 6. Interactive Map Panning & Zoom Controls
  // =========================================================

  const mapViewport = document.getElementById('mapViewport');
  const mapCanvas = document.getElementById('mapCanvas');
  const mapZoomIn = document.getElementById('mapZoomIn');
  const mapZoomOut = document.getElementById('mapZoomOut');
  const mapReset = document.getElementById('mapReset');

  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let currentZoom = 1.0;

  function updateMapTransform() {
    if (!mapCanvas) return;
    mapCanvas.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${currentZoom})`;
  }

  if (mapViewport) {
    // Mouse Drag
    mapViewport.addEventListener('mousedown', (e) => {
      // Don't drag if clicking pin or button
      if (e.target.closest('.map-pin-anchor') || e.target.closest('button')) return;
      isPanning = true;
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      mapViewport.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;

      // Soft clamp pan bounds
      const maxPanX = 180;
      const maxPanY = 120;
      currentX = Math.max(-maxPanX, Math.min(maxPanX, currentX));
      currentY = Math.max(-maxPanY, Math.min(maxPanY, currentY));

      updateMapTransform();
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        if (mapViewport) mapViewport.classList.remove('is-dragging');
      }
    });

    // Touch Drag (Mobile friendly)
    mapViewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        if (e.target.closest('.map-pin-anchor')) return;
        isPanning = true;
        startX = e.touches[0].clientX - currentX;
        startY = e.touches[0].clientY - currentY;
      }
    }, { passive: true });

    mapViewport.addEventListener('touchmove', (e) => {
      if (!isPanning || e.touches.length !== 1) return;
      currentX = e.touches[0].clientX - startX;
      currentY = e.touches[0].clientY - startY;

      const maxPan = 160;
      currentX = Math.max(-maxPan, Math.min(maxPan, currentX));
      currentY = Math.max(-maxPan, Math.min(maxPan, currentY));

      updateMapTransform();
    }, { passive: true });

    mapViewport.addEventListener('touchend', () => {
      isPanning = false;
    });
  }

  // Zoom buttons
  if (mapZoomIn) {
    mapZoomIn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentZoom = Math.min(1.4, currentZoom + 0.15);
      updateMapTransform();
    });
  }

  if (mapZoomOut) {
    mapZoomOut.addEventListener('click', (e) => {
      e.stopPropagation();
      currentZoom = Math.max(0.85, currentZoom - 0.15);
      updateMapTransform();
    });
  }

  if (mapReset) {
    mapReset.addEventListener('click', (e) => {
      e.stopPropagation();
      currentX = 0;
      currentY = 0;
      currentZoom = 1.0;
      updateMapTransform();
    });
  }

  // =========================================================
  // 7. Interactive 3D Open Book Engine (Work Section)
  // =========================================================

  const CHAPTERS_DATA = [
    {
      index: 0,
      badge: 'CHAPTER 01 / JUNE 2025 – JULY 2025',
      icon: '🛡️',
      company: 'Bharat Electronics Limited (BEL)',
      role: 'Machine Learning Intern',
      date: 'June 2025 – July 2025 (6–7 Weeks)',
      status: 'Completed',
      narrative: 'Completed a 2-month PS-II internship on "Machine Learning-Based Network Anomaly Detection" to strengthen automated fault detection and cybersecurity monitoring. Preprocessed the UNSW-NB15 dataset, performed feature selection, and compared Logistic Regression, Decision Tree, and Random Forest classifiers for anomaly detection and attack classification—alongside exposure to defense network systems, Linux, SNMP monitoring, and UI screens for the BEL website.',
      responsibilities: [
        'Performed data preprocessing, feature analysis, and feature selection on the UNSW-NB15 network traffic dataset using Pandas, NumPy, and Matplotlib in Google Colab.',
        'Applied and evaluated Logistic Regression, Decision Tree, and Random Forest models in Scikit-learn to detect anomalies and classify intrusion attacks.',
        'Gained hands-on exposure to defense communication setups, Linux commands, and SNMP network monitoring systems.',
        'Presented weekly review updates, prepared technical project documentation, and designed UI screens for the BEL website.'
      ],
      skills: ['Python', 'Scikit-learn', 'Pandas & NumPy', 'Matplotlib', 'Google Colab', 'UNSW-NB15', 'Random Forest', 'Decision Trees', 'Logistic Regression', 'SNMP & Linux', 'Network Security', 'UI Design'],
      takeaway: 'Working on a real-world problem showed me how data, technology, and thoughtful interfaces can come together to solve practical challenges.'
    },
    {
      index: 1,
      badge: 'CHAPTER 02 / JUNE 2026 – SEPTEMBER 2026',
      icon: '📊',
      company: 'Unified Mentor',
      role: 'Data Analyst Intern (Project-Based)',
      date: 'June 2026 – September 2026',
      status: 'Completed',
      narrative: 'A casual, project-based data analytics internship focused on learning through hands-on practice. My main guided project was analyzing a K-Pop music chart dataset—practicing how to clean CSV data, explore ranking and comeback patterns, and summarize what I found in simple charts.',
      responsibilities: [
        'Cleaned and explored a K-Pop chart dataset in Jupyter Notebook using Python and Pandas.',
        'Calculated straightforward trend metrics around rank movement, comeback comparisons, and chart retention.',
        'Created basic Matplotlib visualizations and a small Streamlit dashboard to display the findings.',
        'Practiced general analytics fundamentals across Python, SQL, Excel, and Power BI basics.'
      ],
      skills: ['Python', 'Pandas', 'Matplotlib', 'Streamlit', 'Data Cleaning', 'SQL & Excel Basics'],
      takeaway: 'Even simple metrics and clean charts can make a noisy spreadsheet much easier to understand.'
    },
    {
      index: 2,
      badge: 'CHAPTER 03 / OCTOBER 2026 – PRESENT',
      icon: '🚀',
      company: 'Azisly.ai',
      role: 'Business Development Intern',
      date: 'October 2026 – Present',
      status: 'In Progress',
      narrative: 'Beginning my journey in B2B business development, with a focus on understanding business needs, researching potential clients, identifying relevant opportunities, and learning how to communicate value to prospective customers.',
      responsibilities: [
        'Learn about B2B customers, their business challenges, and potential solutions.',
        'Research prospective clients and identify relevant business opportunities.',
        'Support lead generation, outreach, and prospect communication as assigned.',
        'Develop an understanding of the sales pipeline, follow-ups, and relationship building.',
        'Learn to communicate product value and contribute to business development goals.'
      ],
      skills: ['B2B Communication', 'Lead Research', 'Prospecting', 'Business Development', 'Client Relationship Building', 'Sales Fundamentals'],
      takeaway: 'Every conversation is an opportunity to understand a problem, build trust, and discover where value can be created.'
    }
  ];

  const bookPrevBtn = document.getElementById('bookPrevBtn');
  const bookNextBtn = document.getElementById('bookNextBtn');
  const counterCurrent = document.getElementById('counterCurrent');
  const bookTabs = document.querySelectorAll('.book-tab');
  const bookSpreads = document.querySelectorAll('.book-spread');
  const openBookEl = document.getElementById('openBook');
  const bookFlipOverlay = document.getElementById('bookFlipOverlay');

  let currentChapter = 0;
  const totalChapters = bookSpreads.length;
  let bookFlipTimer = null;

  function sanitizeFlipClone(pageEl) {
    const clone = pageEl.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    clone.querySelectorAll('button, a').forEach(el => el.setAttribute('tabindex', '-1'));
    return clone;
  }

  function clearBookFlipOverlay() {
    if (bookFlipTimer) {
      clearTimeout(bookFlipTimer);
      bookFlipTimer = null;
    }
    if (bookFlipOverlay) {
      bookFlipOverlay.classList.remove('is-flipping');
      bookFlipOverlay.innerHTML = '';
    }
  }

  function runBookPageFlip(fromIndex, toIndex, direction) {
    if (!bookFlipOverlay || window.innerWidth <= 860) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const oldSpread = bookSpreads[fromIndex];
    const newSpread = bookSpreads[toIndex];
    if (!oldSpread || !newSpread) return;

    const oldLeft = oldSpread.querySelector('.page-left');
    const oldRight = oldSpread.querySelector('.page-right');
    const newLeft = newSpread.querySelector('.page-left');
    const newRight = newSpread.querySelector('.page-right');
    if (!oldLeft || !oldRight || !newLeft || !newRight) return;

    clearBookFlipOverlay();

    const underlay = document.createElement('div');
    const castShadow = document.createElement('div');
    const sheet = document.createElement('div');
    const frontFace = document.createElement('div');
    const backFace = document.createElement('div');

    if (direction === 'next') {
      // Turning forward: old left waits underneath, old right flips over to become new left, new right is revealed underneath
      underlay.className = 'flip-underlay-half is-left';
      underlay.appendChild(sanitizeFlipClone(oldLeft));

      castShadow.className = 'flip-cast-shadow on-left';

      sheet.className = 'flip-sheet flip-next';
      frontFace.className = 'flip-face flip-face-front is-right';
      frontFace.appendChild(sanitizeFlipClone(oldRight));
      backFace.className = 'flip-face flip-face-back is-left';
      backFace.appendChild(sanitizeFlipClone(newLeft));
    } else {
      // Turning backward: old right waits underneath, old left flips back to reveal new left underneath and land as new right
      underlay.className = 'flip-underlay-half is-right';
      underlay.appendChild(sanitizeFlipClone(oldRight));

      castShadow.className = 'flip-cast-shadow on-right';

      sheet.className = 'flip-sheet flip-prev';
      frontFace.className = 'flip-face flip-face-front is-left';
      frontFace.appendChild(sanitizeFlipClone(oldLeft));
      backFace.className = 'flip-face flip-face-back is-right';
      backFace.appendChild(sanitizeFlipClone(newRight));
    }

    sheet.appendChild(frontFace);
    sheet.appendChild(backFace);
    bookFlipOverlay.appendChild(underlay);
    bookFlipOverlay.appendChild(castShadow);
    bookFlipOverlay.appendChild(sheet);

    // Force reflow so CSS 3D flip animation plays cleanly on every click
    void bookFlipOverlay.offsetWidth;
    bookFlipOverlay.classList.add('is-flipping');

    bookFlipTimer = setTimeout(() => {
      clearBookFlipOverlay();
    }, 690);
  }

  function setChapter(index, direction, animate = true) {
    if (index < 0 || index >= totalChapters) return;

    const prevIndex = currentChapter;
    const shouldFlip = animate && prevIndex !== index;
    const turnDir = direction || (index > prevIndex ? 'next' : 'prev');

    if (shouldFlip) {
      runBookPageFlip(prevIndex, index, turnDir);
    } else {
      clearBookFlipOverlay();
    }

    bookSpreads.forEach((spread, i) => {
      if (i === index) {
        spread.classList.add('active');
        spread.style.animation = 'none';
        spread.offsetHeight; // trigger reflow
        spread.style.animation = null;
      } else {
        spread.classList.remove('active');
      }
    });

    bookTabs.forEach(tab => {
      const tabIndex = parseInt(tab.getAttribute('data-chapter'), 10);
      if (tabIndex === index) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    currentChapter = index;

    if (counterCurrent) {
      counterCurrent.textContent = String(currentChapter + 1).padStart(2, '0');
    }

    if (bookPrevBtn) {
      bookPrevBtn.disabled = currentChapter === 0;
    }
    if (bookNextBtn) {
      bookNextBtn.disabled = currentChapter === totalChapters - 1;
    }
  }

  // Initialize button state (without initial flip)
  setChapter(0, 'next', false);

  // Button clicks
  if (bookPrevBtn) {
    bookPrevBtn.addEventListener('click', () => {
      if (currentChapter > 0) {
        setChapter(currentChapter - 1, 'prev');
      }
    });
  }

  if (bookNextBtn) {
    bookNextBtn.addEventListener('click', () => {
      if (currentChapter < totalChapters - 1) {
        setChapter(currentChapter + 1, 'next');
      }
    });
  }

  // Chapter top tabs click
  bookTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.getAttribute('data-chapter'), 10);
      if (!isNaN(idx)) {
        setChapter(idx, idx > currentChapter ? 'next' : 'prev');
      }
    });
  });

  // Page edge click turning:
  // If clicking on left page (and not on button/link/interactive), turn previous
  // If clicking on right page (and not on button/link/interactive), turn next
  if (openBookEl) {
    openBookEl.addEventListener('click', (e) => {
      // Ignore if clicking a button, link, or tag
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.skill-tag')) {
        return;
      }

      const leftPage = e.target.closest('.page-left');
      const rightPage = e.target.closest('.page-right');

      if (leftPage && currentChapter > 0) {
        setChapter(currentChapter - 1, 'prev');
      } else if (rightPage && currentChapter < totalChapters - 1) {
        setChapter(currentChapter + 1, 'next');
      }
    });
  }

  // Keyboard left/right arrow navigation when work section is in view
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    
    const workSec = document.getElementById('work');
    if (!workSec) return;
    const rect = workSec.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;

    if (inView) {
      if (e.key === 'ArrowLeft' && currentChapter > 0) {
        setChapter(currentChapter - 1, 'prev');
      } else if (e.key === 'ArrowRight' && currentChapter < totalChapters - 1) {
        setChapter(currentChapter + 1, 'next');
      }
    }
  });

  // Chapter Deep Dive Modal Elements & Handlers
  const chapterModalBackdrop = document.getElementById('chapterModalBackdrop');
  const chapterModalCloseBtn = document.getElementById('chapterModalCloseBtn');
  const chapterModalDismissBtn = document.getElementById('chapterModalDismissBtn');
  const chapterModalBadge = document.getElementById('chapterModalBadge');
  const chapterModalIcon = document.getElementById('chapterModalIcon');
  const chapterModalCompany = document.getElementById('chapterModalCompany');
  const chapterModalRoleMeta = document.getElementById('chapterModalRoleMeta');
  const chapterModalNarrative = document.getElementById('chapterModalNarrative');
  const chapterModalResponsibilities = document.getElementById('chapterModalResponsibilities');
  const chapterModalSkills = document.getElementById('chapterModalSkills');
  const chapterModalTakeaway = document.getElementById('chapterModalTakeaway');

  function openChapterModal(chapterIndex) {
    const data = CHAPTERS_DATA[chapterIndex];
    if (!data || !chapterModalBackdrop) return;

    if (chapterModalBadge) chapterModalBadge.textContent = data.badge;
    if (chapterModalIcon) chapterModalIcon.textContent = data.icon;
    if (chapterModalCompany) chapterModalCompany.textContent = data.company;
    if (chapterModalRoleMeta) chapterModalRoleMeta.textContent = `${data.role} • ${data.date} (${data.status})`;
    if (chapterModalNarrative) chapterModalNarrative.textContent = data.narrative;
    if (chapterModalTakeaway) chapterModalTakeaway.textContent = `“${data.takeaway}”`;

    if (chapterModalResponsibilities) {
      chapterModalResponsibilities.innerHTML = '';
      data.responsibilities.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>✦</span> ${item}`;
        chapterModalResponsibilities.appendChild(li);
      });
    }

    if (chapterModalSkills) {
      chapterModalSkills.innerHTML = '';
      data.skills.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'skill-tag';
        span.textContent = skill;
        chapterModalSkills.appendChild(span);
      });
    }

    chapterModalBackdrop.classList.add('is-open');
    chapterModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  function closeChapterModal() {
    if (!chapterModalBackdrop) return;
    chapterModalBackdrop.classList.remove('is-open');
    chapterModalBackdrop.setAttribute('aria-hidden', 'true');
  }

  // Hook up "Read this chapter" buttons
  const readChapterBtns = document.querySelectorAll('.read-chapter-btn');
  readChapterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const chapterIdx = parseInt(btn.getAttribute('data-chapter'), 10);
      if (!isNaN(chapterIdx)) {
        openChapterModal(chapterIdx);
      }
    });
  });

  if (chapterModalCloseBtn) chapterModalCloseBtn.addEventListener('click', closeChapterModal);
  if (chapterModalDismissBtn) chapterModalDismissBtn.addEventListener('click', closeChapterModal);

  if (chapterModalBackdrop) {
    chapterModalBackdrop.addEventListener('click', (e) => {
      if (e.target === chapterModalBackdrop) {
        closeChapterModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chapterModalBackdrop && chapterModalBackdrop.classList.contains('is-open')) {
      closeChapterModal();
    }
  });

  // =========================================================
  // 8. Interactive Cursor-Following Mascot Hooks
  // =========================================================

  // Connect "Things I Love" pills with Mascot Reactions
  const lovePills = document.querySelectorAll('.love-pill');
  lovePills.forEach(pill => {
    pill.addEventListener('mouseenter', () => {
      const reaction = pill.getAttribute('data-reaction') || 'wink';
      if (typeof window.setMascotPose === 'function') {
        if (reaction === 'happy') window.setMascotPose('happy');
        else if (reaction === 'wink') window.setMascotPose('waving');
        else if (reaction === 'up') window.setMascotPose('thinking');
        else window.setMascotPose('smile');
      }
    });

    pill.addEventListener('mouseleave', () => {
      if (typeof window.resetMascotPose === 'function') {
        window.resetMascotPose();
      }
    });
  });

  // Connect "Areas I'm Exploring" cards with Mascot Reactions
  const exploreCards = document.querySelectorAll('.explore-glass-card');
  exploreCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (typeof window.setMascotPose === 'function') {
        window.setMascotPose('happy');
      }
    });

    card.addEventListener('mouseleave', () => {
      if (typeof window.resetMascotPose === 'function') {
        window.resetMascotPose();
      }
    });
  });

  // =========================================================
  // 9. Register Visit with Stats API
  // =========================================================

  fetch('/api/stats').catch(() => {});

})();


