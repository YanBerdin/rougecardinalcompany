const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove ambient-grain GSAP
html = html.replace(/tl\.fromTo\([\s\S]*?"#ambient-grain"[\s\S]*?,\n\s*0,\n\s*\);/, '');

// Increase smoke movements
html = html.replace(
  /tl\.fromTo\([\s\S]*?"#smoke-a"[\s\S]*?\),/,
  `tl.fromTo(
        "#smoke-a",
        { x: -150, y: 50, scale: 0.8, opacity: 0.2, rotation: -5.0 },
        {
          x: 150,
          y: -100,
          scale: 1.4,
          opacity: 0.55,
          rotation: 5.0,
          duration: 6,
          repeat: Math.floor(DURATION_SECONDS / 6) - 1,
          yoyo: true,
          ease: "sine.inOut",
        }
      )`
);

html = html.replace(
  /tl\.fromTo\([\s\S]*?"#smoke-b"[\s\S]*?\),/,
  `tl.fromTo(
        "#smoke-b",
        { x: 150, y: 50, scale: 0.8, opacity: 0.15, rotation: 5.0 },
        {
          x: -150,
          y: -100,
          scale: 1.4,
          opacity: 0.50,
          rotation: -5.0,
          duration: 6,
          repeat: Math.floor(DURATION_SECONDS / 6) - 1,
          yoyo: true,
          ease: "sine.inOut",
        }
      )`
);

html = html.replace(
  /tl\.fromTo\([\s\S]*?"#smoke-c"[\s\S]*?\),/,
  `tl.fromTo(
        "#smoke-c",
        { x: -100, y: 100, scale: 0.7, opacity: 0.2, rotation: -6.0 },
        {
          x: 100,
          y: -150,
          scale: 1.5,
          opacity: 0.60,
          rotation: 6.0,
          duration: 4,
          repeat: Math.floor(DURATION_SECONDS / 4) - 1,
          yoyo: true,
          ease: "power1.inOut",
        }
      )`
);

// Add spot GSAP animations before window.__timelines
html = html.replace(/window\.__timelines\["main"\] = tl;/, `tl.fromTo("#spot-1", { rotation: -20 }, { rotation: -12, duration: 6, repeat: Math.floor(DURATION_SECONDS / 6) - 1, yoyo: true, ease: "sine.inOut" }, 0);
      tl.fromTo("#spot-2", { rotation: 0 }, { rotation: 6, duration: 6, repeat: Math.floor(DURATION_SECONDS / 6) - 1, yoyo: true, ease: "sine.inOut" }, 0);
      tl.fromTo("#spot-3", { rotation: 20 }, { rotation: 12, duration: 6, repeat: Math.floor(DURATION_SECONDS / 6) - 1, yoyo: true, ease: "sine.inOut" }, 0);
      
      window.__timelines["main"] = tl;`);


// Add spot CSS
const spotCSS = `
      .spotlight {
        position: absolute;
        top: -200px;
        width: 300px;
        height: 1500px;
        background: linear-gradient(180deg, rgba(255, 255, 240, 0.4) 0%, rgba(255, 255, 240, 0) 100%);
        filter: blur(25px);
        mix-blend-mode: screen;
        transform-origin: top center;
        z-index: 5;
        pointer-events: none;
      }
      .spot-1 {
        left: 15%;
        transform: rotate(-20deg);
      }
      .spot-2 {
        left: 50%;
        margin-left: -150px;
        transform: rotate(0deg);
      }
      .spot-3 {
        left: 85%;
        margin-left: -300px;
        transform: rotate(20deg);
      }
`;
html = html.replace('</style>', spotCSS + '\n    </style>');

// Add spot HTML before vignette
const spotHTML = `
          <div class="spotlight spot-1" id="spot-1"></div>
          <div class="spotlight spot-2" id="spot-2"></div>
          <div class="spotlight spot-3" id="spot-3"></div>
`;
html = html.replace('<div class="vignette"></div>', spotHTML + '\n          <div class="vignette"></div>');

fs.writeFileSync('index.html', html);
