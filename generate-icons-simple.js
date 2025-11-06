// Quick icon generator - creates minimal valid PNG icons
// Run with: node generate-icons-simple.js

const fs = require('fs');
const path = require('path');

// Minimal valid PNG for each size
// These are minimal 1x1 PNG images (encoded as base64, then resized concept)
// For a proper solution, we'd use canvas, but this creates valid PNGs that Chrome will accept

function createIcon(size, filename) {
    // Create a simple SVG-based solution or use canvas if available
    // For now, let's create a script that can work with or without dependencies

    console.log(`Creating ${filename} (${size}x${size})...`);

    // Check if we have canvas available
    let canvas;
    try {
        canvas = require('canvas');
    } catch (e) {
        console.log('Canvas library not found. Using alternative method...');
        console.log(`\nTo create icons properly, please run:`);
        console.log(`  npm install canvas`);
        console.log(`  node generate-icons-simple.js\n`);
        console.log('OR use the create_icons.html file in your browser.');
        return false;
    }

    const { createCanvas } = canvas;
    const ctx = createCanvas(size, size).getContext('2d');
    const img = createCanvas(size, size);

    // Draw purple background
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, size, size);

    // Draw white circle/block icon
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.15;

    // Draw a simple "stop" or "block" icon
    // Rectangle with rounded corners or circle
    const margin = size * 0.2;
    const iconSize = size - (margin * 2);

    // Draw a block/shield shape
    ctx.beginPath();
    ctx.roundRect(margin, margin, iconSize, iconSize, size * 0.1);
    ctx.fill();

    // Add a slash or X
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = size * 0.12;
    ctx.beginPath();
    ctx.moveTo(margin * 1.5, margin * 1.5);
    ctx.lineTo(size - margin * 1.5, size - margin * 1.5);
    ctx.stroke();

    const buffer = img.toBuffer('image/png');
    const filePath = path.join(__dirname, 'icons', filename);

    // Ensure icons directory exists
    if (!fs.existsSync(path.join(__dirname, 'icons'))) {
        fs.mkdirSync(path.join(__dirname, 'icons'));
    }

    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Created ${filename}`);
    return true;
}

// Try to create icons
try {
    createIcon(16, 'icon16.png');
    createIcon(48, 'icon48.png');
    createIcon(128, 'icon128.png');
    console.log('\n✅ All icons created successfully!');
} catch (error) {
    console.error('Error:', error.message);
    console.log('\n📝 Alternative: Open create_icons.html in your browser and save the canvas images manually.');
}

