# Manya Agarwal — Interactive Portfolio

> **UI/UX Designer · Data Analyst · AI/ML Explorer · Business Development Enthusiast**  
> *“Turning ideas into meaningful experiences — through design, data, technology and real human connections.”*

[![Live Portfolio](https://img.shields.io/badge/Live%20Demo-manya--agarwal--portfolio.onrender.com-00C4CC?style=for-the-badge&logo=render&logoColor=white)](https://manya-agarwal-portfolio.onrender.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-manyaagarwal23-181717?style=for-the-badge&logo=github)](https://github.com/manyaagarwal23)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Manya%20Agarwal-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/manya-agarwal-0605492b0/)

---

## 🌐 Live Website

🔗 **[Manya Agarwal — UI/UX Designer • Data Analyst • Business Development](https://manya-agarwal-portfolio.onrender.com/)**

Deployed and running live on Render with automated HTTPS, zero-lag asset delivery, and continuous deployment from GitHub.

---

## 🌟 Overview

This portfolio is an immersive, interactive digital experience designed and engineered from the ground up without heavy frameworks. Combining rich storytelling, responsive aesthetics, hardware-accelerated animations, and deep-level interactivity, each section takes the visitor through a different dimension of my journey:

- **Scenic Village Hero Canvas**: Edge-to-edge day/night village landscape with discrete interactive location beacons.
- **Interactive 3D Mascot**: A cursor-following companion that responds dynamically to mouse coordinates, clicks, idle periods, and hobby pill hovers.
- **Top-Down Workspace & Open Book**: A physical desk perspective featuring a realistic open leather-bound journal with navigable chapter tabs (`Chapter 01`, `Chapter 02`, `Chapter 03`).
- **Two-Row Tech Stack Marquee**: Continuous dual-direction infinite brand marquee with hover-activated directional tooltips.
- **Interactive Project Map**: An illustrated vector city map with 8 interactive pulsing pins, radar beacons, and rich frosted-glass case study modals.
- **Physical 3D Contact Hub**: Direct push-button connect channels with tactile 3D extrusion feedback.

---

## 🗺️ Key Portfolio Sections

### 1. Village Hero (`#home`)
- **Full Viewport Scenic Canvas (`100svh`)**: Seamless crossfade between peaceful lush-green daytime village scenery and cinematic twilight night-lights.
- **Three Location Pins**:
  - **Bharat Electronics Limited (BEL)** — Previous ML Internship details.
  - **BML Munjal University** — B.Tech CSE (AI & Data Science specialization).
  - **Azisly.ai** — Current B2B Business Development Internship.
- **Frosted Glass Popups**: Compact modals with backdrop blur (`blur(24px)`), smooth scale entrance, outside-click dismissal, and keyboard accessibility (<kbd>Esc</kbd>).
- **Corner Scroll Cue**: Minimal bottom-left indicator that smoothly scrolls to the About section.

### 2. About Me & 3D Interactive Mascot (`#about`)
- **3D Mascot Companion**:
  - **Cursor Tracking**: Calculates pointer angles relative to viewport center and applies smooth lerp rotation (`rotateY`, `rotateX`).
  - **Dynamic Poses**: Preloads 7 expressions (`smile`, `left`, `right`, `thinking`, `happy`, `surprised`, `waving`).
  - **Smart Reactions**: Waves on hover, smiles on click, thinks when idle for 4 seconds, looks surprised when the cursor exits the window, and reacts to hobbies/skills hover.
  - **Dynamic Drop-Shadow**: Perspective shadows that project based on light angles.
- **Things I Love**: Interactive badges for design, food, pets, music, travel, cinema, and learning.
- **Focus Areas**: Frosted cards detailing Data Analytics, AI/ML, UI/UX Design, and Business Development.

### 3. Work Experience Book (`#work`)
- **Realistic 3D Open Book Spread**: Illustrated edge-to-edge top-down desk with illuminated candle glow in night mode.
- **Chapter Index Tabs**:
  - **`Chapter 01`** — Bharat Electronics Limited (BEL) | Machine Learning Intern
  - **`Chapter 02`** — Unified Mentor | Data Analyst Intern & Fellow
  - **`Chapter 03`** — Azisly.ai | Business Development Intern
- **Detailed Reading Modals**: Complete breakdown of responsibilities, technical workflows, datasets used (UNSW-NB15, etc.), and key accomplishments.

### 4. Skills & Technologies Marquee (`#skillsMarquee`)
- **Row 1 (Moves Left)**: Figma, Canva, Python, Microsoft Power BI, Microsoft Excel, TensorFlow, Keras, Scikit-learn, OpenCV, Hugging Face, LangChain.
- **Row 2 (Moves Right)**: HTML5, CSS3, JavaScript, React, Node.js, PostgreSQL, MySQL, Firebase, GitHub, Docker, Linux.
- **Directional Floating Tooltips**:
  - Row 1 tooltips pop upward into dedicated spacing.
  - Row 2 tooltips pop downward to prevent collisions.
  - Native `title` tags for browser tooltip support.

### 5. Interactive City Project Map (`#projects`)
- **8 Interactive Illustrated Pins**:
  - **LogicLens** — AI-Powered Code Dependency Analyzer (AST graph & impact simulator).
  - **CampaignIQ** — Marketing Analytics Dashboard & DAX What-If Simulator.
  - **WatchMate** — AI-Powered Movie & TV Discovery Platform (RAG + pgvector).
  - **Placement Platform** — University placement management system.
  - **PersonaPath** — Speech analysis and personalized learning path navigator.
  - **University LLM** — Campus query assistant powered by retrieval-augmented generation.
  - **K-Pop Trends** — Sentiment & virality analytics dashboard.
  - **Unimingle App** — Student campus networking application.
- **Pulsing Radar Rings**: All 8 pins feature animated expanding radar beacons (`pin-pulse-ring`) and glowing auras.
- **Glassmorphic Case Study Modal**: Detailed overview including problem statement, system architecture, tech stack pills, and GitHub repository links.

### 6. Contact Hub (`#contact`)
- **Tactile 3D Buttons**: Custom pressable button designs for:
  - **LinkedIn**: [linkedin.com/in/manya-agarwal-0605492b0](https://www.linkedin.com/in/manya-agarwal-0605492b0/)
  - **GitHub**: [github.com/manyaagarwal23](https://github.com/manyaagarwal23)
  - **Gmail**: [manyagarwal.20@gmail.com](mailto:manyagarwal.20@gmail.com)
  - **Instagram**: [@iamanya_9719](https://www.instagram.com/iamanya_9719/)

---

## 📁 Repository Structure

```text
manya-agarwal-portfolio/
├── assets/                       # Assets organized tab-wise
│   ├── home/                     # Hero village artwork (Day & Night)
│   │   ├── village_day.jpg
│   │   └── village_night.jpg
│   ├── about/                    # Interactive mascot pose assets
│   │   └── mascot/
│   │       ├── happy.png
│   │       ├── left.png
│   │       ├── right.png
│   │       ├── smile.png
│   │       ├── surprised.png
│   │       ├── thinking.png
│   │       └── waving.png
│   ├── work/                     # Workspace desk textures & documents
│   │   ├── desk_surface_day.jpg
│   │   ├── desk_surface_night.jpg
│   │   └── Manya_Agarwal_Resume.pdf
│   ├── projects/                 # Project media & diagrams
│   └── contact/                  # Contact icons & branding
├── data/                         # Local server storage
│   ├── messages.json
│   └── stats.json
├── index.html                    # Main HTML markup
├── style.css                     # Design system & CSS stylesheet
├── script.js                     # Core interactions, map & navigation logic
├── mascot.css                    # 3D mascot perspective & animations
├── mascot.js                     # Cursor tracking & pose engine
├── server.js                     # Node.js static & API dev server
├── package.json                  # Scripts & metadata
└── README.md                     # Documentation & live links
```

---

## 🛠️ Tech Stack

- **Markup & Layout**: Semantic HTML5 with ARIA accessibility roles
- **Styling**: Vanilla CSS3 (Custom design tokens, CSS Grid, Flexbox, glassmorphism, 3D CSS transforms)
- **Scripting**: Vanilla JavaScript (ES6+ modular logic, requestAnimationFrame render loop)
- **Server**: Node.js HTTP runtime with lightweight REST endpoints
- **Icons & Typography**: Google Fonts (`Bricolage Grotesque`, `Geist`, `Gaegu`), Simple Icons, Devicon
- **Hosting**: Render ([Web Service](https://manya-agarwal-portfolio.onrender.com/))

---

## 💻 Local Setup & Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [Git](https://git-scm.com/)

### 1. Clone the repository
```bash
git clone https://github.com/manyaagarwal23/manya-agarwal-portfolio.git
cd manya-agarwal-portfolio
```

### 2. Start the local server
```bash
npm run dev
# or
node server.js
```

### 3. Open in browser
Visit **[http://localhost:3000](http://localhost:3000)** to view the portfolio.

### 4. Build / Validate scripts
```bash
npm run build
```

---

## 📬 Contact & Connect

- **Portfolio**: [manya-agarwal-portfolio.onrender.com](https://manya-agarwal-portfolio.onrender.com/)
- **Email**: [manyagarwal.20@gmail.com](mailto:manyagarwal.20@gmail.com)
- **LinkedIn**: [linkedin.com/in/manya-agarwal-0605492b0](https://www.linkedin.com/in/manya-agarwal-0605492b0/)
- **GitHub**: [github.com/manyaagarwal23](https://github.com/manyaagarwal23)
- **Instagram**: [@iamanya_9719](https://www.instagram.com/iamanya_9719/)

---

© 2026 Manya Agarwal. Released under the [MIT License](LICENSE).
