# Card Reveal Applet

A premium, minimalist 3D sport/trading card opening simulator built using **React 18**, **Three.js (React Three Fiber)**, **GSAP**, and **Framer Motion**.

---

### 📂 Directory Structure

```text
/
├── index.html                  # Main HTML entry
├── vite.config.ts              # Vite configuration
├── package.json                # Project dependencies
├── src/
│   ├── main.tsx                # React app bootstrapping
│   ├── index.css               # Global styling (Bebas Neue fonts & tailwind core)
│   ├── components/
│   │   └── App/
│   │       └── CardRevealApp.tsx  # Main 3D canvas and state manager
│   ├── shaders/
│   │   └── CardShaderMaterial.ts  # GPU shaders for card burning and holograms
│   └── utils/
│       └── TextureUtils.ts     # Procedural high-res card/package canvas textures
```

---

### 🧸 Explain Like I'm 10 (ELI10 TLDR)

1. **Pressing "BUY PACK"**: The app authorizes a pack and spawns a spinning wheel of shiny base-packs.
2. **Carousel & Drag-to-Slice**: One pack flys forward. You slide your finger sideways to trigger a beautiful burning laser cut, slicing the pack top off!
3. **The Tear**: The paper-thin halves separate, revealing a thick premium dark inner core volume, making it realistic.
4. **The card flip**: Tap the card and it spins in 3D to show your ultimate graded card inside: ultra rare supporter, complete with premium holographic reflections!
