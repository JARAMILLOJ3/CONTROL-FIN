import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crisp modern SVG icon: deep slate & emerald gradient background, glowing gold/emerald finance emblem
const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="brandEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="accentGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#059669" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="0" fill="url(#bgGrad)"/>

  <!-- Subtle Ambient Glow Rings -->
  <circle cx="256" cy="256" r="180" stroke="#10b981" stroke-opacity="0.12" stroke-width="2"/>
  <circle cx="256" cy="256" r="215" stroke="#10b981" stroke-opacity="0.06" stroke-width="2"/>

  <!-- Central Emblem Container -->
  <g filter="url(#glow)">
    <!-- Shield / Vault Base Rounded Hexagon -->
    <path d="M256 90 L380 155 V280 C380 345 320 405 256 425 C192 405 132 345 132 280 V155 L256 90 Z" 
          fill="#1e293b" stroke="url(#brandEmerald)" stroke-width="8" stroke-linejoin="round"/>
    
    <!-- Rising Trend Dynamic Lines inside Shield -->
    <path d="M175 315 L225 260 L275 290 L340 205" 
          stroke="url(#brandEmerald)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Dynamic Arrowhead -->
    <path d="M312 205 H340 V233" 
          stroke="url(#brandEmerald)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Accent Golden Coin in the center -->
    <circle cx="256" cy="235" r="32" fill="url(#accentGold)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"/>
    <text x="256" y="247" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="34" font-weight="900" fill="#78350f" text-anchor="middle">$</text>
  </g>
</svg>
`;

// Maskable icon with 15% inner padding for Android squircle / circle safe zones
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="brandEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="accentGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" fill="url(#bgGrad)"/>

  <!-- Scaled emblem within 80% safe center area -->
  <g transform="translate(51, 51) scale(0.8)">
    <circle cx="256" cy="256" r="180" stroke="#10b981" stroke-opacity="0.12" stroke-width="2"/>
    <path d="M256 90 L380 155 V280 C380 345 320 405 256 425 C192 405 132 345 132 280 V155 L256 90 Z" 
          fill="#1e293b" stroke="url(#brandEmerald)" stroke-width="8" stroke-linejoin="round"/>
    
    <path d="M175 315 L225 260 L275 290 L340 205" 
          stroke="url(#brandEmerald)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>

    <path d="M312 205 H340 V233" 
          stroke="url(#brandEmerald)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>

    <circle cx="256" cy="235" r="32" fill="url(#accentGold)"/>
    <text x="256" y="247" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="34" font-weight="900" fill="#78350f" text-anchor="middle">$</text>
  </g>
</svg>
`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

  const svgBuffer = Buffer.from(svgContent);
  const maskableBuffer = Buffer.from(maskableSvg);

  // iOS Apple Touch Icon (180x180 PNG)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 192x192 PWA Icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512 PWA Icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 Maskable Icon
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Favicon (64x64 PNG & 32x32)
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Successfully generated all PWA and iOS touch icons in /public!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
