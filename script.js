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

  function getPreferredTheme() {
    const params = new URLSearchParams(window.location.search);
    const queryTheme = params.get('theme');
    if (queryTheme === 'light' || queryTheme === 'dark') return queryTheme;
    const saved = localStorage.getItem('manya-theme');
    if (saved) return saved;
    return 'light'; // Default to light (Day) theme
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('manya-theme', theme);

    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Night' : 'Day';
    }

    // Ping backend for interaction tracking
    fetch('/api/toggle-theme', { method: 'POST' }).catch(() => {});
  }

  // Apply on initial load
  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
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
  // 5. Interactive Project Map: Data, Pins & Preview Modal
  // =========================================================

  const DEFAULT_GITHUB_PROFILE = 'https://github.com/manyaagarwal23?tab=repositories';

  const PROJECTS_DATA = {
    'logiclens': {
      id: 'logiclens',
      title: 'LogicLens',
      subtitle: 'AI-Powered Code Dependency Analyzer',
      category: 'AI / DEVELOPER TOOLS',
      featured: true,
      metric: 'AST Graph & Impact AI',
      summary: 'An AI-powered platform that helps developers understand complex codebases, explore dependencies, search code using natural-language queries, and analyse the impact of code changes.',
      problem: 'Navigating large, unfamiliar, or legacy codebases is cognitively demanding and error-prone. Developers struggle to trace multi-file dependencies, understand downstream side effects before modifying code, and identify high-risk architectural hotspots.',
      architecture: 'Engineered an end-to-end code intelligence pipeline using Tree-sitter for multi-language Abstract Syntax Tree (AST) extraction, Neo4j for persistent dependency graphing, ChromaDB for semantic vector embeddings, and CrewAI multi-agent orchestration for natural-language query resolution and What-If impact simulation.',
      features: [
        'Interactive dependency graphs for files, classes, and functions rendered with vis.js',
        'Semantic code search powered by natural-language query embeddings in ChromaDB',
        'AI-powered “What-If” impact analysis to simulate ripple effects before code commits',
        'Git hotspot analysis and automated code vulnerability detection'
      ],
      techStack: ['Python', 'Flask', 'Tree-sitter', 'Neo4j', 'ChromaDB', 'CrewAI', 'LLaMA', 'HTML', 'CSS', 'JavaScript', 'vis.js'],
      githubUrl: 'https://github.com/manyaagarwal23/LogicLens-Code-Dependency-Analyzer',
      githubLabel: 'View LogicLens on GitHub',
      repoName: 'manyaagarwal23/LogicLens-Code-Dependency-Analyzer',
      repoDesc: 'AI-Powered Code Dependency Analyzer with interactive graph exploration, AST parsing, and impact simulation.',
      demoUrl: null
    },
    'campaigniq': {
      id: 'campaigniq',
      title: 'CampaignIQ',
      subtitle: 'Marketing Analytics Dashboard & What-If Simulator',
      category: 'BUSINESS INTELLIGENCE',
      featured: true,
      metric: '3-Page BI Suite',
      summary: 'A three-page interactive Power BI dashboard for monitoring marketing performance, comparing campaigns and channels, and exploring budget scenarios.',
      problem: 'Marketing leaders and growth managers face fragmented performance data across multi-channel campaigns, making it difficult to pinpoint return on ad spend (ROAS) drivers and simulate future budget reallocations with financial confidence.',
      architecture: 'Constructed an executive-ready three-page business intelligence suite in Power BI backed by relational SQL and normalized Excel schemas, featuring dynamic DAX measure hierarchies, spend-to-revenue correlation models, and parametric What-If scenario forecasting.',
      features: [
        'Executive KPIs for ad spend, revenue, ROAS, CTR, conversion rate, and CPA',
        'Comprehensive multi-channel and campaign performance comparison matrices',
        'Spend-versus-ROAS analytical scatter and trend trajectory views',
        'Dynamic budget scenario simulator using DAX What-If parameters for predictive spend allocation'
      ],
      techStack: ['Power BI', 'DAX', 'SQL', 'Excel', 'Data Analysis', 'Data Visualization'],
      githubUrl: 'https://github.com/manyaagarwal23/CampaignIQ-PowerBI-Marketing-Analytics',
      githubLabel: 'View CampaignIQ on GitHub',
      repoName: 'manyaagarwal23/CampaignIQ-PowerBI-Marketing-Analytics',
      repoDesc: 'Interactive Power BI marketing analytics dashboard featuring multi-channel comparison and DAX What-If budget simulation.',
      demoUrl: null
    },
    'watchmate': {
      id: 'watchmate',
      title: 'WatchMate',
      subtitle: 'AI-Powered Movie & TV Discovery Platform',
      category: 'FULL-STACK / RAG AI',
      featured: true,
      metric: 'RAG & Multi-Agent',
      summary: 'A movie and TV discovery platform combining real-time content data, semantic search, mood-based discovery, image-based title identification, and grounded AI recommendations.',
      problem: 'Streaming discovery is fragmented across siloed services, with keyword-based searches failing to capture nuanced viewer moods, plot descriptions, or screenshots from social media clips.',
      architecture: 'Full-stack media intelligence platform combining a high-performance FastAPI backend, responsive React client, PostgreSQL with pgvector for high-dimensional semantic search, Voyage AI embeddings, Groq Vision for frame analysis, and CrewAI multi-agent comparison workflows.',
      features: [
        'TMDB integration for live movie metadata, cast, crew, ratings, similar titles, and streaming providers',
        'Semantic and mood-based natural language discovery powered by pgvector similarity search',
        'Image-based scene and movie identification utilizing Groq Vision models',
        'RAG architecture with PostgreSQL, pgvector, and Voyage AI contextual embeddings',
        'CrewAI multi-agent recommendation and comparison workflows',
        'User authentication and personalised Watch Later queue management'
      ],
      techStack: ['Python', 'React', 'FastAPI', 'PostgreSQL', 'TMDB API', 'Groq Vision', 'Voyage AI', 'pgvector', 'RAG', 'CrewAI', 'Docker'],
      githubUrl: 'https://github.com/manyaagarwal23/WatchMate',
      githubLabel: 'View WatchMate on GitHub',
      repoName: 'manyaagarwal23/WatchMate',
      repoDesc: 'AI-powered movie and TV discovery platform featuring semantic search, Groq Vision, and CrewAI multi-agent workflows.',
      demoUrl: null
    },
    'placement': {
      id: 'placement',
      title: 'Placement Management Intelligence Platform',
      subtitle: 'Campus Recruitment & Pipeline Analytics',
      category: 'FULL-STACK PLATFORM',
      featured: false,
      metric: 'Relational Intelligence',
      summary: 'A full-stack platform that centralises placement data for students, companies, jobs, applications, interviews, offers, and skills.',
      problem: 'University placement departments face heavy administrative overhead managing decentralized spreadsheets, tracking asynchronous candidate interview rounds, and uncovering why students fail specific technical assessment funnels.',
      architecture: 'Architected with a strictly normalized PostgreSQL relational schema enforcing referential integrity and optimized indexes, decoupled Express.js RESTful API microservices, and a modern React dashboard UI.',
      features: [
        'Normalised PostgreSQL relational database with foreign keys, indexes, and constraint integrity',
        'Advanced SQL-based placement analytics, readiness scoring, and skill gap metrics',
        'High-throughput REST APIs connecting the database to administrative and student portals',
        'Interactive analytics dashboard for readiness scoring, skill matching, recruitment funnel drop-offs, and hiring bottleneck detection'
      ],
      techStack: ['PostgreSQL', 'SQL', 'Express.js', 'React', 'REST APIs', 'Tailwind CSS'],
      githubUrl: 'https://github.com/manyaagarwal23/placement-management-platform',
      githubLabel: 'View Placement Platform on GitHub',
      repoName: 'manyaagarwal23/placement-management-platform',
      repoDesc: 'Full-stack campus placement management intelligence platform with normalized relational PostgreSQL database.',
      demoUrl: null
    },
    'personapath': {
      id: 'personapath',
      title: 'PersonaPath',
      subtitle: 'AI-Based Speech & Literacy Assessment System',
      category: 'MULTI-MODAL AI / AUDIO-VISION',
      featured: true,
      metric: 'Multi-Modal ML',
      summary: 'An AI-powered system that analyses vocal confidence, pronunciation, speaking pace, facial emotions, and communication patterns from uploaded audio and video recordings.',
      problem: 'Coaching effective public speaking and literacy is traditionally manual, costly, and subjective. Learners lack access to objective, fine-grained telemetry on phoneme clarity, pitch variation, and non-verbal engagement cues.',
      architecture: 'Multi-modal ML pipeline combining acoustic feature extraction via Librosa, automatic speech recognition and alignment via Whisper and Wav2Vec2, facial emotion recognition using MobileNetV2 with OpenCV, and sequential confidence classification using LSTM recurrent networks.',
      features: [
        'LSTM-based vocal confidence, speech rate, and pause duration analysis',
        'Facial emotion recognition and expressive engagement tracking using MobileNetV2 and OpenCV',
        'Pronunciation and literacy assessment with granular phoneme-level feedback',
        'Comprehensive dashboard displaying confidence scores, emotion breakdowns, vocal cadence metrics, and AI coaching insights'
      ],
      techStack: ['Python', 'TensorFlow/Keras', 'OpenCV', 'Librosa', 'Whisper', 'Wav2Vec2', 'MobileNetV2', 'Flask', 'Gradio', 'Hugging Face', 'HTML', 'CSS', 'JavaScript'],
      githubUrl: 'https://github.com/manyaagarwal23/PersonaPath-Literacy-Speech-Assessment',
      githubLabel: 'View PersonaPath on GitHub',
      repoName: 'manyaagarwal23/PersonaPath-Literacy-Speech-Assessment',
      repoDesc: 'AI-based speech and literacy assessment analyzing vocal confidence, pronunciation, and facial emotions.',
      demoUrl: null
    },
    'university-assistant': {
      id: 'university-assistant',
      title: 'University Assistant',
      subtitle: 'Domain-Adapted LLM Fine-Tuning',
      category: 'NLP / LLM FINE-TUNING',
      featured: false,
      metric: 'PEFT / LoRA Adapted',
      summary: 'A domain-specific conversational assistant fine-tuned on university information to answer academic and administrative questions.',
      problem: 'General-purpose large language models lack institutional context, frequently hallucinate administrative deadlines, and require cost-effective customization methods without full-parameter retraining.',
      architecture: 'Engineered a parameter-efficient fine-tuning (PEFT) pipeline using Low-Rank Adaptation (LoRA) on Microsoft’s Phi-2 architecture, trained on a curated campus QA dataset, and systematically evaluated with BLEU and ROUGE scoring benchmarks.',
      features: [
        'Curated university-specific academic and administrative Q&A dataset',
        'Parameter-efficient fine-tuning of Microsoft Phi-2 using LoRA adapters',
        'Modular training and validation pipeline built with Hugging Face Transformers',
        'Systematic performance evaluation using BLEU, ROUGE, and factual accuracy metrics',
        'Interactive real-time CLI querying interface for campus consultations'
      ],
      techStack: ['Python', 'Microsoft Phi-2', 'PEFT/LoRA', 'Hugging Face Transformers', 'PyTorch', 'Google Colab'],
      githubUrl: 'https://github.com/manyaagarwal23/university-assistant-llm-finetuning',
      githubLabel: 'View University Assistant on GitHub',
      repoName: 'manyaagarwal23/university-assistant-llm-finetuning',
      repoDesc: 'Domain-adapted conversational assistant fine-tuning Microsoft Phi-2 with PEFT/LoRA on university QA data.',
      demoUrl: null
    },
    'kpop-trends': {
      id: 'kpop-trends',
      title: 'K-Pop Trend Analysis',
      subtitle: 'Chart & Fandom Intelligence',
      category: 'DATA SCIENCE / ANALYTICS',
      featured: false,
      metric: 'Fandom Trajectory KPIs',
      summary: 'A data-driven system that analyses daily Top 50 K-Pop chart data to uncover song retention, re-entry patterns, comeback momentum, and artist performance.',
      problem: 'Music streaming data is noisy and heavily distorted by concentrated fandom streaming spikes. Conventional charts fail to isolate organic listener retention from initial comeback surges.',
      architecture: 'Complete data science exploratory pipeline utilizing Pandas and NumPy for time-series aggregation, Scikit-learn for anomaly detection and clustering, and Streamlit for dynamic multi-dimensional chart exploration.',
      features: [
        'Formulated custom KPIs for comeback momentum, chart retention rate, rank recovery, and fandom intensity',
        'Systematic data preprocessing, time-series alignment, and missing value interpolation',
        'Granular song- and artist-level trajectory trend analysis over promotional cycles',
        'Interactive Streamlit web dashboard for filtering historical rankings, dates, and artists'
      ],
      techStack: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Streamlit'],
      githubUrl: 'https://github.com/manyaagarwal23/kpop-trend-analysis',
      githubLabel: 'View K-Pop Trend Analysis on GitHub',
      repoName: 'manyaagarwal23/kpop-trend-analysis',
      repoDesc: 'Data-driven analytics system evaluating daily Top 50 K-Pop charts, retention metrics, and fandom momentum.',
      demoUrl: null
    },
    'unimingle': {
      id: 'unimingle',
      title: 'Unimingle',
      subtitle: 'Campus Social Networking App',
      category: 'MOBILE APP / ANDROID',
      featured: false,
      metric: 'Native Android & Firebase',
      summary: 'A campus-based Android application that helps students discover activities, create events, connect with peers, and communicate.',
      problem: 'College students often experience difficulty discovering spontaneous study groups, campus sports, and peer events outside rigid student clubs.',
      architecture: 'Native Android application developed in Android Studio using Java, architected with Clean Architecture principles, Firebase Authentication for campus verification, and Firebase Realtime Database for synchronous chat.',
      features: [
        'Figma interactive prototypes, wireframes, and design system user flows',
        'Dynamic activity cards for creating, browsing, and joining campus events',
        'Student profile management and peer connection directory',
        'Real-time peer and group messaging backed by Firebase Realtime Database'
      ],
      techStack: ['Java', 'Android Studio', 'Firebase Auth', 'Firebase Realtime DB', 'Figma'],
      githubUrl: 'https://github.com/manyaagarwal23/UNIMINGLE',
      githubLabel: 'View Unimingle on GitHub',
      repoName: 'manyaagarwal23/UNIMINGLE',
      repoDesc: 'Campus-based Android social networking application for student activity discovery, events, and real-time chat.',
      demoUrl: null
    }
  };

  // =========================================================
  // Modal DOM Elements & Logic
  // =========================================================

  let currentActiveProjectId = null;
  let lastFocusedTrigger = null;

  // Overview Popup Elements
  const overviewBackdrop = document.getElementById('projectOverviewBackdrop');
  const overviewModal = document.getElementById('projectOverviewModal');
  const overviewCloseBtn = document.getElementById('overviewCloseBtn');
  const overviewDismissBtn = document.getElementById('overviewDismissBtn');
  const overviewDetailsBtn = document.getElementById('overviewDetailsBtn');
  const overviewGithubBtn = document.getElementById('overviewGithubBtn');
  const overviewGithubLabel = document.getElementById('overviewGithubLabel');
  const overviewDemoBtn = document.getElementById('overviewDemoBtn');
  const overviewCategory = document.getElementById('overviewCategory');
  const overviewFeaturedBadge = document.getElementById('overviewFeaturedBadge');
  const overviewMetric = document.getElementById('overviewMetric');
  const overviewTitle = document.getElementById('overviewTitle');
  const overviewSubtitle = document.getElementById('overviewSubtitle');
  const overviewSummary = document.getElementById('overviewSummary');
  const overviewProblem = document.getElementById('overviewProblem');
  const overviewFeatures = document.getElementById('overviewFeatures');
  const overviewTags = document.getElementById('overviewTags');

  // Full Detail Modal Elements
  const detailBackdrop = document.getElementById('projectDetailBackdrop');
  const detailModal = document.getElementById('projectDetailModal');
  const detailCloseBtn = document.getElementById('detailCloseBtn');
  const detailDismissBtn = document.getElementById('detailDismissBtn');
  const detailCategory = document.getElementById('detailCategory');
  const detailFeaturedBadge = document.getElementById('detailFeaturedBadge');
  const detailTitle = document.getElementById('detailTitle');
  const detailSubtitle = document.getElementById('detailSubtitle');
  const detailProblem = document.getElementById('detailProblem');
  const detailArchitecture = document.getElementById('detailArchitecture');
  const detailFeatures = document.getElementById('detailFeatures');
  const detailTechStack = document.getElementById('detailTechStack');
  const detailRepoName = document.getElementById('detailRepoName');
  const detailRepoDesc = document.getElementById('detailRepoDesc');
  const detailRepoLink = document.getElementById('detailRepoLink');

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
    if (overviewSummary) overviewSummary.textContent = data.summary;
    if (overviewProblem) overviewProblem.textContent = data.problem;

    // Implementation features bullets
    if (overviewFeatures) {
      overviewFeatures.innerHTML = '';
      (data.features || []).forEach(feat => {
        const li = document.createElement('li');
        li.textContent = feat;
        overviewFeatures.appendChild(li);
      });
    }

    // Tech Tags
    if (overviewTags) {
      overviewTags.innerHTML = '';
      (data.techStack || []).slice(0, 6).forEach(tag => {
        const span = document.createElement('span');
        span.className = 'modal-tag';
        span.textContent = tag;
        overviewTags.appendChild(span);
      });
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

    // Demo Button (Only if valid URL)
    if (overviewDemoBtn) {
      if (data.demoUrl) {
        overviewDemoBtn.href = data.demoUrl;
        overviewDemoBtn.style.display = 'inline-flex';
        overviewDemoBtn.setAttribute('aria-label', `Launch live demo for ${data.title}`);
      } else {
        overviewDemoBtn.style.display = 'none';
      }
    }

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
    if (detailTitle) detailTitle.textContent = data.title;
    if (detailSubtitle) detailSubtitle.textContent = data.subtitle;
    if (detailProblem) detailProblem.textContent = data.problem;
    if (detailArchitecture) detailArchitecture.textContent = data.architecture;

    // Detailed features grid
    if (detailFeatures) {
      detailFeatures.innerHTML = '';
      (data.features || []).forEach(feat => {
        const li = document.createElement('li');
        li.className = 'detail-feature-item';
        li.innerHTML = `<span class="feat-bullet">✦</span><span class="feat-text">${feat}</span>`;
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

    // Verified GitHub card
    const targetRepoUrl = data.githubUrl || DEFAULT_GITHUB_PROFILE;
    if (detailRepoName) detailRepoName.textContent = data.repoName || 'manyaagarwal23 / repositories';
    if (detailRepoDesc) detailRepoDesc.textContent = data.repoDesc || 'Explore project repository on GitHub.';
    if (detailRepoLink) {
      detailRepoLink.href = targetRepoUrl;
      detailRepoLink.setAttribute('aria-label', `View ${data.title} repository on GitHub`);
    }

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
  const pinAnchors = document.querySelectorAll('.map-pin-anchor');
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
  if (overviewDismissBtn) overviewDismissBtn.addEventListener('click', closeProjectOverview);
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

  if (detailBackdrop) {
    detailBackdrop.addEventListener('click', (e) => {
      if (e.target === detailBackdrop) {
        closeProjectDetail();
      }
    });
  }

  // Keyboard navigation: Escape key closes active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (detailBackdrop && detailBackdrop.classList.contains('is-open')) {
        closeProjectDetail();
      } else if (overviewBackdrop && overviewBackdrop.classList.contains('is-open')) {
        closeProjectOverview();
      }
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
      date: 'June 2025 – July 2025',
      status: 'Completed',
      narrative: 'Worked on a machine learning-based network intrusion and anomaly detection project using the UNSW-NB15 dataset. Explored network traffic data and supported the development of ML approaches for identifying potentially malicious network activity. I also contributed to designing UI screens for the BEL website.',
      responsibilities: [
        'Explored and prepared network traffic data for machine learning analysis.',
        'Worked with the UNSW-NB15 dataset for network intrusion and anomaly detection.',
        'Supported machine learning experimentation and analysis of network activity.',
        'Designed UI screens for the BEL website.'
      ],
      skills: ['Machine Learning', 'Data Analysis', 'Network Security Fundamentals', 'Dataset Exploration', 'UI Design'],
      takeaway: 'Working on a real-world problem showed me how data, technology, and thoughtful interfaces can come together to solve practical challenges.'
    },
    {
      index: 1,
      badge: 'CHAPTER 02 / JUNE 2026 – SEPTEMBER 2026',
      icon: '📊',
      company: 'Unified Mentor',
      role: 'Data Analyst Intern',
      date: 'June 2026 – September 2026',
      status: 'Completed',
      narrative: 'Participated in a structured Data Analyst internship and fellowship focused on practical, project-based learning. The program involved working on analytics projects using data tools to explore datasets, extract insights, and communicate findings.',
      responsibilities: [
        'Worked on assigned data analytics projects as part of the internship.',
        'Focused on data exploration, analysis, and extracting useful insights.',
        'Developed practical familiarity with SQL, Python, Excel, and Power BI through project-based work, reflecting the tools actually used in each project.',
        'Organized findings and worked toward presenting data-driven results clearly.'
      ],
      skills: ['Data Analytics', 'Data Cleaning', 'SQL', 'Python', 'Excel', 'Power BI'],
      takeaway: 'Data becomes valuable when you can turn it into a clear insight and explain why it matters.'
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

  let currentChapter = 0;
  const totalChapters = bookSpreads.length;

  function setChapter(index, direction = 'next') {
    if (index < 0 || index >= totalChapters) return;

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

  // Initialize button state
  setChapter(0);

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


