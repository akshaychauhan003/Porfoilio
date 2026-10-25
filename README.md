# Personal Portfolio — Systems Architect

A high-performance, cinematic personal portfolio website showcasing full-stack systems architecture, engineering skills, and featured interactive projects.

---

## 📁 Modular Directory Architecture

```
portfolio/
├── index.html                     # Clean modular entry point & mount orchestrator
├── README.md                      # Project documentation & architecture overview
├── assets/                        # Production media & vendor assets
│   ├── images/                    # Avatars, badges & favicon
│   │   ├── Akshay S. Chauhan copy.png
│   │   ├── Billa Gatte.png
│   │   ├── Ellon Mask.png
│   │   ├── Jhun Yung.png
│   │   ├── Leesa Seuu.png
│   │   ├── Marc Jukarburg.png
│   │   ├── Sunndar Pechai.png
│   │   ├── Tom Cooked.png
│   │   └── favicon.png
│   ├── videos/                    # Project showcase preview video
│   │   └── Travoqix.mp4
│   ├── vendor/                    # Third-party libraries
│   │   └── three.min.js           # Three.js 3D library
│   ├── docs/                      # Attached PDF documents
│   │   └── Final_ML_Practical_File_Cleaned.pdf
│   └── css/
│       └── style.css              # Central CSS manifest importing all section stylesheets
└── sections/                      # Modular Section Components (HTML, CSS, JS)
    ├── shared/                    # Design tokens & foundation layer
    │   ├── variables.css          # Design tokens & theme variables
    │   ├── global.css             # Base reset & typography
    │   ├── animations.css         # Keyframe animations
    │   ├── utilities.css          # Shared utility classes
    │   ├── responsive.css         # Media queries
    │   ├── helpers.js             # Utility & math helpers
    │   ├── glow-effects.js        # Ambient mouse-tracking glow
    │   ├── scroll-engine.js       # IntersectionObserver scroll manager
    │   └── loader.js              # Modular section loader & orchestrator
    ├── header/                    # Navigation, progress bar & section dots
    │   ├── header.html
    │   ├── header.css
    │   └── header.js
    ├── intro/                     # Amazon-style search & results intro
    │   ├── intro.html
    │   ├── intro.css
    │   └── intro.js
    ├── architect/                 # Hero & The Architect (About) section
    │   ├── architect.html
    │   ├── architect.css
    │   └── architect.js
    ├── technical-arsenal/         # Skills & Capabilities (12 cards)
    │   ├── technical-arsenal.html
    │   ├── technical-arsenal.css
    │   └── technical-arsenal.js
    ├── project-portfolio/         # Selected Work & 3D carousel
    │   ├── project-portfolio.html
    │   ├── project-portfolio.css
    │   └── project-portfolio.js
    ├── experience/                # Journey & vertical timeline
    │   ├── experience.html
    │   ├── experience.css
    │   └── experience.js
    ├── client-review/             # Testimonials & reviews slider
    │   ├── client-review.html
    │   ├── client-review.css
    │   └── client-review.js
    ├── contact/                   # Collaboration form & direct channels
    │   ├── contact.html
    │   ├── contact.css
    │   └── contact.js
    ├── footer/                    # Footer, status & simulation controls
    │   ├── footer.html
    │   ├── footer.css
    │   └── footer.js
    ├── background/                # Three.js 3D background canvas
    │   ├── background.html
    │   ├── background.css
    │   └── background.js
    └── cursor/                    # Custom cursor with ghost mode
        ├── cursor.html
        ├── cursor.css
        └── cursor.js
```

---

## 🚀 Running the Project

You can run the portfolio locally using any static web server:

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx serve)
npx serve .
```

Then navigate to `http://localhost:8080/` in your browser.