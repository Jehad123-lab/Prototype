import * as THREE from 'three';

// Draws the highly detailed Graded PSA Slab Face with Topps Chrome Paul Skenes Baseball card!
export const createCardTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const drawFallback = () => {
    // Premium slab capsule insert dark gray background
    ctx.fillStyle = '#161920';
    ctx.fillRect(0, 0, 512, 800);

    // 1. PAPER CERTIFICATE GRADING LABEL (PSA slab label at the top)
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(24, 24, 464, 150, 4);
    ctx.fill();

    // PSA Red outer frame boundary
    ctx.strokeStyle = '#e11d48'; // PSA Grader Red
    ctx.lineWidth = 5;
    ctx.strokeRect(29, 29, 454, 140);

    // Label text details matching authentic grading aesthetics
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('2024 TOPPS CHROME', 40, 62);
    
    ctx.font = '900 24px "Inter", sans-serif';
    ctx.fillText('PAUL SKENES', 40, 96);

    ctx.font = 'bold 15px monospace';
    ctx.fillText('ROOKIE REFRACTOR #30', 40, 126);

    // PSA Grade text "GEM MT 10" on the right sidebar
    ctx.fillStyle = '#e11d48';
    ctx.font = '900 32px "Bebas Neue", sans-serif';
    ctx.fillText('GEM MT', 335, 84);
    ctx.font = '900 68px "Bebas Neue", sans-serif';
    ctx.fillText('10', 415, 140);

    // Barcode & Certificate code serial
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(40, 138, 220, 2);
    let currentX = 40;
    while (currentX < 260) {
      const barW = Math.random() > 0.45 ? 2 : 4;
      ctx.fillRect(currentX, 142, barW - 1, 18);
      currentX += barW + (Math.random() > 0.4 ? 3 : 5);
    }
    ctx.font = '12px monospace';
    ctx.fillText('84458231', 270, 155);
    ctx.restore();

    // 2. SPORTS BASEBALL CARD PANEL (nested below the label)
    ctx.save();
    // Draw card recess container border
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2d3748';
    ctx.strokeRect(22, 196, 468, 580);

    // Clip baseball card container area
    ctx.beginPath();
    ctx.rect(24, 198, 464, 576);
    ctx.clip();

    // Metallic chrome steel refractor base gradient
    const grad = ctx.createLinearGradient(24, 198, 488, 774);
    grad.addColorStop(0, '#0a0d14');
    grad.addColorStop(0.3, '#1f2536');
    grad.addColorStop(0.5, '#424a61');
    grad.addColorStop(0.7, '#1f2536');
    grad.addColorStop(1, '#05070a');
    ctx.fillStyle = grad;
    ctx.fillRect(24, 198, 464, 576);

    // Holographic green refractor accents list on card surface
    ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
    for (let i = 0; i < 20; i++) {
       const x = 24 + Math.random() * 464;
       const y = 198 + Math.random() * 576;
       const size = Math.random() * 100 + 30;
       ctx.beginPath();
       ctx.arc(x, y, size, 0, Math.PI * 2);
       ctx.fill();
    }

    // Refractor diagonal glass lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 4; i++) {
       ctx.beginPath();
       ctx.moveTo(24 + Math.random() * 200, 198);
       ctx.lineTo(24 + Math.random() * 464, 774);
       ctx.lineTo(24 + Math.random() * 464 + 100, 774);
       ctx.lineTo(24 + Math.random() * 200 + 150, 198);
       ctx.closePath();
       ctx.fill();
    }

    // Card metallic green chrome borders
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 10;
    ctx.strokeRect(32, 206, 448, 560);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 214, 432, 544);

    // Background stadium lighting glow
    const stadiumLight = ctx.createRadialGradient(256, 420, 50, 256, 420, 350);
    stadiumLight.addColorStop(0, 'rgba(34, 197, 94, 0.65)'); // Emerald green stadium beam
    stadiumLight.addColorStop(0.6, 'rgba(15, 23, 42, 0.9)');
    stadiumLight.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = stadiumLight;
    ctx.fillRect(42, 216, 428, 540);

    // Retro background stripes lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 12;
    for (let i = 0; i < 12; i++) {
       ctx.beginPath();
       ctx.moveTo(-50 + i * 50, 198);
       ctx.lineTo(200 + i * 50, 774);
       ctx.stroke();
    }

    // Draw Pitcher Paul Skenes (#30) vector figure in action pose
    ctx.translate(256, 460);

    // Striding trousers
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-35, 130);
    ctx.lineTo(-60, 190);
    ctx.lineTo(-20, 190);
    ctx.lineTo(-15, 130);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, 130);
    ctx.lineTo(60, 210);
    ctx.lineTo(85, 200);
    ctx.lineTo(25, 130);
    ctx.closePath();
    ctx.fill();

    // Cleats
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-65, 190, 35, 15);
    ctx.fillRect(72, 200, 32, 15);

    // Black Pirates Jersey with gold sleeves trim
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-40, 30);
    ctx.lineTo(40, 30);
    ctx.lineTo(32, 135);
    ctx.lineTo(-32, 135);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#eab308'; // Pirates gold stripes
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-40, 30); ctx.lineTo(-32, 135);
    ctx.moveTo(40, 30); ctx.lineTo(32, 135);
    ctx.stroke();

    // Draw code uniform number "#30"
    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 52px "Bebas Neue", sans-serif';
    ctx.fillText('30', 0, 105);

    // Pitcher head, arms, gloves
    ctx.fillStyle = '#ffded0';
    // Glove left sleeve
    ctx.beginPath();
    ctx.moveTo(-35, 35);
    ctx.lineTo(-75, 55);
    ctx.lineTo(-90, 30);
    ctx.lineTo(-35, 25);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#854d0e'; // Brown catcher leather
    ctx.beginPath();
    ctx.arc(-88, 25, 18, 0, Math.PI * 2);
    ctx.fill();

    // Right arm pitching swing
    ctx.fillStyle = '#ffded0';
    ctx.beginPath();
    ctx.moveTo(35, 40);
    ctx.lineTo(90, 5);
    ctx.lineTo(110, -20);
    ctx.lineTo(40, 30);
    ctx.closePath();
    ctx.fill();

    // Baseball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(110, -20, 8, 0, Math.PI * 2);
    ctx.fill();

    // Pitcher head
    ctx.fillStyle = '#ffded0';
    ctx.beginPath();
    ctx.moveTo(-20, 30);
    ctx.lineTo(20, 30);
    ctx.lineTo(10, 8);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -14, 25, 0, Math.PI * 2);
    ctx.fill();

    // Black Pirates Cap
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -20, 26, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-35, -20);
    ctx.lineTo(-10, -28);
    ctx.lineTo(10, -20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#eab308';
    ctx.font = '900 11px "Inter", sans-serif';
    ctx.fillText('P', 3, -23);

    // Black sports visor shades
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-14, -15); ctx.lineTo(10, -15);
    ctx.stroke();

    ctx.restore();

    // RC Rookie Badge and Topps branding card indicators
    ctx.save();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px "Bebas Neue", sans-serif';
    ctx.fillText('TOPPS CHROME', 52, 236);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(52, 248);
    ctx.lineTo(76, 248);
    ctx.lineTo(72, 268);
    ctx.lineTo(64, 276);
    ctx.lineTo(56, 268);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 10px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RC', 64, 260);
    ctx.restore();

    // Large Bold Pirates vertical banner bottom right
    ctx.save();
    ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
    ctx.beginPath();
    ctx.roundRect(330, 560, 120, 160, 6);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(334, 564, 112, 152);

    ctx.fillStyle = '#000000';
    ctx.font = '900 32px "Bebas Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PIRATES', 390, 610);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px "Victor Mono", monospace';
    ctx.fillText('PAUL SKENES', 390, 650);
    ctx.font = '11px "Victor Mono", monospace';
    ctx.fillText('PITCHER', 390, 675);
    ctx.restore();

    // Player subtitle stats label at bottom
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.roundRect(50, 655, 260, 75, 6);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(50, 652, 260, 3);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Bebas Neue", sans-serif';
    ctx.fillText('PAUL SKENES', 62, 685);

    ctx.fillStyle = '#22c55e';
    ctx.font = '10px "Victor Mono", monospace';
    ctx.fillText('ROOKIE REFRACTOR P', 62, 708);
    ctx.restore();

    ctx.restore(); // Restore display area clip
    tex.needsUpdate = true;
  };

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/assets/.aistudio/Group 1073714074.png';
  img.onload = () => {
    ctx.clearRect(0, 0, 512, 800);
    ctx.drawImage(img, 0, 0, 512, 800);
    tex.needsUpdate = true;
  };
  img.onerror = () => {
    drawFallback();
  };

  // Draw fallback first to prevent flashing while loading
  drawFallback();

  return tex;
};

// Generates the white certificate grading label texture individually if needed
export const createSlabLabelTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Clean white paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 160);

  // Red outline frame (iconic PSA label style)
  ctx.strokeStyle = '#ef4444'; // PSA Grader Red
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 144);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('2016 P.M. JAPANESE XY', 20, 38);
  ctx.fillText('#015', 430, 38);

  ctx.font = 'bold 23px monospace';
  ctx.fillText('JIRACHI', 20, 72);
  ctx.font = 'bold 18px monospace';
  ctx.fillText('MINT', 330, 72);

  ctx.fillText('POKEK_YUN COLL-1ST ED.', 20, 102);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

// Generates the Back Face of the PSA Slab, housing both certificate label and card backing details
export const createBackPatternTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 800; // 800 height matching front slab sheet exactly!
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Solid dark capsule insert
  ctx.fillStyle = '#161920';
  ctx.fillRect(0, 0, 512, 800);

  // 1. BACK PSA GRADING LABEL
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(24, 24, 464, 150, 4);
  ctx.fill();

  ctx.strokeStyle = '#e11d48'; // Red frame
  ctx.lineWidth = 5;
  ctx.strokeRect(29, 29, 454, 140);

  // Hologram seal sticker on back right side 
  const holoGrad = ctx.createRadialGradient(415, 94, 5, 415, 94, 40);
  holoGrad.addColorStop(0, '#fef08a');
  holoGrad.addColorStop(0.3, '#a7f3d0');
  holoGrad.addColorStop(0.6, '#bfdbfe');
  holoGrad.addColorStop(1, '#e9d5ff');
  ctx.fillStyle = holoGrad;
  ctx.beginPath();
  ctx.arc(415, 94, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Write "PSA" in hologram
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.font = 'bold 15px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PSA', 415, 99);

  // Certification details list
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('CERTIFICATE OF AUTHENTICITY', 40, 62);
  ctx.font = '13px monospace';
  ctx.fillText('PSA Cert: 84458231', 40, 88);
  ctx.fillText('Database verified grade: GEM MT 10', 40, 114);

  // Security guard indicator
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(45, 142, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.fillText('SECURITY GUARD ENHANCED', 58, 146);
  ctx.restore();

  // 2. BACK OF COLLECTION CARD
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#2d3748';
  ctx.strokeRect(22, 196, 468, 580);

  ctx.beginPath();
  ctx.rect(24, 198, 464, 576);
  ctx.clip();

  // Glowing green backing matching the front refractor style (green color shift request)
  const backGrad = ctx.createRadialGradient(256, 486, 20, 256, 486, 350);
  backGrad.addColorStop(0, '#15803d');
  backGrad.addColorStop(0.65, '#166534');
  backGrad.addColorStop(1, '#052e16');
  ctx.fillStyle = backGrad;
  ctx.fillRect(24, 198, 464, 576);

  // Symmetrical golden/silver lines forming refractor network
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let i = -400; i < 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(24 + i, 198);
    ctx.lineTo(24 + i + 576, 774);
    ctx.stroke();
  }

  // Draw card back details
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 10;
  ctx.strokeRect(32, 206, 448, 560);

  // Geometric layout
  drawLabyrinth(ctx, '#dcfce7');

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

// Symmetrical labyrinth geometric pattern renderer
function drawLabyrinth(ctx: CanvasRenderingContext2D, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = 256;
  const cy = 486; // Shifted center down to baseball card viewport!

  // Inner card boundary line inside cards 
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(50, 222, 412, 528, 14);
  ctx.stroke();

  // Bold geometric accents
  ctx.lineWidth = 26;
  
  // Concentric central diamonds
  ctx.beginPath();
  ctx.moveTo(cx, cy - 90);
  ctx.lineTo(cx + 90, cy);
  ctx.lineTo(cx, cy + 90);
  ctx.lineTo(cx - 90, cy);
  ctx.closePath();
  ctx.stroke();

  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 40);
  ctx.lineTo(cx + 40, cy);
  ctx.lineTo(cx, cy + 40);
  ctx.lineTo(cx - 40, cy);
  ctx.closePath();
  ctx.stroke();

  ctx.lineWidth = 26;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 200);
  ctx.lineTo(cx + 170, cy);
  ctx.lineTo(cx, cy + 200);
  ctx.lineTo(cx - 170, cy);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

export const createMaskTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 800; // 800 height matching slab face exactly!
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createLinearGradient(0, 0, 512, 800);
  grad.addColorStop(0, '#052e16');
  grad.addColorStop(0.5, '#15803d');
  grad.addColorStop(1, '#22c55e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 800);

  ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 800; i += 30) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  drawLabyrinth(ctx, '#f0fdf4');

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

// Generates the luxurious emerald gold foil pack cover
export const createPackOverlayTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 712;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createLinearGradient(0, 0, 512, 712);
  grad.addColorStop(0, '#111827');
  grad.addColorStop(0.2, '#1e293b');
  grad.addColorStop(0.4, '#0f766e'); // Teal metallic highlights
  grad.addColorStop(0.5, '#22d3ee'); // Bright metallic glare
  grad.addColorStop(0.6, '#0f766e');
  grad.addColorStop(0.8, '#1f2937');
  grad.addColorStop(1, '#111827');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 712);

  // Slices structure
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 160);
    ctx.lineTo(512, i * 160 + 200);
    ctx.lineTo(512, i * 160 + 260);
    ctx.lineTo(0, i * 160 + 60);
    ctx.closePath();
    ctx.fill();
  }

  // Green refractor highlights
  ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
  ctx.beginPath();
  ctx.moveTo(80, 0); ctx.lineTo(512, 432); ctx.lineTo(512, 482); ctx.lineTo(30, 0);
  ctx.closePath();
  ctx.fill();

  ctx.lineWidth = 16;
  ctx.strokeStyle = '#0d9488'; // Teal borders
  ctx.strokeRect(8, 8, 496, 696);

  ctx.fillStyle = '#115e59';
  for (let x = 16; x < 496; x += 12) {
    ctx.fillRect(x, 8, 6, 26);
    ctx.fillRect(x, 678, 6, 26);
  }

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 48px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('╦', 256, 150);
  
  ctx.font = 'bold 15px "Victor Mono", monospace';
  ctx.letterSpacing = '5px';
  ctx.fillText('COLLECTIBLES', 256, 185);
  ctx.restore();

  // Emerald center sphere ball
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 8;
  
  const outerGrad = ctx.createLinearGradient(256, 380, 256, 500);
  outerGrad.addColorStop(0, '#10b981'); // Emerald green top half
  outerGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = outerGrad;

  ctx.beginPath();
  ctx.arc(256, 440, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#222222';
  ctx.fillRect(200, 436, 112, 8);

  ctx.beginPath();
  ctx.arc(256, 440, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(256, 440, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#222222';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 85px "Bebas Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText('TRIUMPH', 256, 310);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#34d399';
  ctx.font = '900 16px "Victor Mono", monospace';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('POKEMON EMERALD PACK', 256, 580);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

// Generates an incredibly high-fidelity, premium back face texture for the booster pack
// Free of mirrored or backwards text, incorporating barcodes, certifications, and realistic stats.
export const createPackBackOverlayTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 712;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Draw background gradient matching front pack (deep navy top to rich crimson bottom)
  // Top half: Premium deep blue
  const blueGrad = ctx.createLinearGradient(0, 0, 0, 356);
  blueGrad.addColorStop(0, '#091226');
  blueGrad.addColorStop(1, '#152544');
  ctx.fillStyle = blueGrad;
  ctx.fillRect(0, 0, 512, 356);

  // Bottom half: Premium deep red
  const redGrad = ctx.createLinearGradient(0, 356, 0, 712);
  redGrad.addColorStop(0, '#5f0d19');
  redGrad.addColorStop(1, '#2c040a');
  ctx.fillStyle = redGrad;
  ctx.fillRect(0, 356, 512, 356);

  // Subtle metallic texture lines to mimic continuous vacuum foil press
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 712);
    ctx.stroke();
  }
  for (let i = 0; i < 712; i += 16) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Draw elegant double-thin border frame matching the front pack
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 696);
  
  ctx.strokeStyle = '#0c4a6e'; // Sky borders
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, 480, 680);

  // Leave center column (x: 200 - 312) completely free of textual overlays
  // as the physical 3D center heat-seal strip mesh lies directly on top of it.
  
  // ==================== LEFT HALF: CERTS, WARNINGS, & INFO ====================
  ctx.save();
  // 1. Pack statistics outline box
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 40, 165, 240);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(30, 40, 165, 240);

  // Header for pack stats
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px "Victor Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('• REPACKZ CERT •', 112, 60);

  // Sub data keys/values
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '10px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SERIES: 2026 BASKET', 42, 90);
  ctx.fillText('CAPACITY: 1 SLABBED', 42, 110);
  ctx.fillText('ESTIMATED: 100% REAL', 42, 130);
  ctx.fillText('GRADED BY: PSA ONLY', 42, 150);

  // Bright sky blue assurance label
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px "Victor Mono", monospace';
  ctx.fillText('GUARANTEED ORIGIN', 42, 185);
  ctx.fillText('VERIFIABLE BLOCK', 42, 200);

  // Fine metadata numbering
  ctx.fillStyle = '#64748b';
  ctx.font = '8px monospace';
  ctx.fillText('TRACK: #8445-8231', 42, 235);
  ctx.fillText('S/N: REPACK-B072', 42, 248);
  ctx.fillText('MADE IN CALIFORNIA', 42, 260);
  ctx.restore();

  // 2. Informational disclaimers list
  ctx.save();
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('IMPORTANT TRADING CARD DISCLAIMER:', 30, 390);

  const fineLines = [
    'All enclosed cards are authentic and',
    'graded strictly by PSA authorized labs.',
    'Repackaging acts as secondary collector',
    'curation. Product is not sponsored by,',
    'or affiliated with MLB, NHL, or individual',
    'athletes. Avoid direct humidity. Keep',
    'stored in physical casing at room temp.'
  ];
  ctx.fillStyle = '#94a3b8';
  ctx.font = '8px monospace';
  let yPos = 405;
  fineLines.forEach(ln => {
    ctx.fillText(ln, 30, yPos);
    yPos += 13;
  });

  // Small compliance boxes on bottom left
  // Age Indicator box
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 530, 42, 20);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AGE 6+', 51, 543);

  // CE box
  ctx.strokeRect(78, 530, 34, 20);
  ctx.fillText('CE', 95, 543);

  // Recyclable box
  ctx.strokeRect(118, 530, 36, 20);
  ctx.fillText('RECY', 136, 543);
  ctx.restore();


  // ==================== RIGHT HALF: BARCODE & SECURITY ====================
  ctx.save();
  // 1. Gold Radial Metallic Certification Holographic Emblem
  const holoG = ctx.createRadialGradient(386, 120, 5, 386, 120, 45);
  holoG.addColorStop(0, '#fef08a'); // Shiny golden bright core
  holoG.addColorStop(0.4, '#eab308'); 
  holoG.addColorStop(0.8, '#854d0e'); // Darker metallic shadow rim
  holoG.addColorStop(1, '#451a03');
  ctx.fillStyle = holoG;
  ctx.beginPath();
  ctx.arc(386, 120, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Print text inside hologram
  ctx.fillStyle = '#451a03';
  ctx.font = 'bold 10px "Victor Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('REPACKZ', 386, 115);
  ctx.font = '8px "Inter", sans-serif';
  ctx.fillText('VERIFIED', 386, 128);
  ctx.fillText('OFFICIAL', 386, 138);
  ctx.restore();

  // 2. High-precision Barcode Plate
  ctx.save();
  const boxX = 312;
  const boxY = 400;
  const boxW = 168;
  const boxH = 110;

  // Render pristine crisp white card
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.fillRect(boxX, boxY, boxW, boxH);

  // Generate randomized but organic looking physical barcode lines
  ctx.fillStyle = '#000000';
  let startPixelX = boxX + 11;
  const barcodeStructure = [
    2, 1, 3, 1, 1, 2, 4, 1, 1, 3, 2, 2, 1, 3, 1, 1, 4, 1, 2, 2, 1, 3, 1, 1, 2, 1, 4, 2, 1, 1, 3, 2, 1, 2, 1
  ];
  barcodeStructure.forEach((size, counter) => {
    if (counter % 2 === 0) {
      ctx.fillRect(startPixelX, boxY + 12, size * 2, 68);
    }
    startPixelX += size * 2 + (counter % 4 === 0 ? 1 : 2);
  });

  // Numeric caption at base of plate
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('(00) 844582 31234 4', boxX + boxW / 2, boxY + 98);
  ctx.restore();

  // 3. Web URLs and handles print
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('URL: WWW.COLLECTIBLES.COM', 480, 620);
  ctx.fillText('EMAIL: CARE@COLLECTIBLES.COM', 480, 638);
  ctx.fillText('TWITTER: @COLLECTIBLES_HQ', 480, 656);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
};
