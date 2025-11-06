// Simple script to generate placeholder icons using Node.js
// Run with: node generate-icons.js
// Requires: npm install canvas (if using node-canvas)
// Or use online icon generators like favicon.io

// Alternative: Use this HTML file (create_icons.html) in a browser
// Right-click each canvas and save as PNG

console.log(`
Icon Generation Instructions:
=============================

Option 1: Use Online Tool
- Visit https://favicon.io/favicon-generator/
- Create an icon with text "🚫" or "⛔" 
- Download and save as:
  - icon16.png (16x16)
  - icon48.png (48x48)
  - icon128.png (128x128)

Option 2: Use create_icons.html
- Open create_icons.html in your browser
- Right-click each canvas and "Save image as..."
- Save with appropriate names

Option 3: Create Simple Icons Manually
- Use any image editor
- Create square images with purple background (#667eea)
- Add a stop sign emoji or "B" text in white
- Export as PNG at required sizes

The extension will work without icons, but Chrome will show a default icon.
`);

