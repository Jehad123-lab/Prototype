# LLM.md — LLM Instructions & Code Map

### 🗺️ Core Code File Paths
- `/src/components/App/CardRevealApp.tsx` : Manages the main 3D lifecycle, gesture interactions (swipes, pointer clicks), and splitting GSAP timelines.
- `/src/utils/TextureUtils.ts` : Generates multi-layered canvas textures representing the graded baseball card, the holographic mask, and the crimson labyrinth seal.
- `/src/shaders/CardShaderMaterial.ts` : Houses Custom ShaderMaterials for holographic back animations and dissolve burning edge effects.

---

### 📝 ELI10 LLM Guidelines
- **Solid Depth, No Leaks**: Always use an inset inner `boxGeometry` inside any card pouch representation. Keep the box width slightly smaller than the outer front/back planes (e.g. `2.62` vs `2.7`). Never map the main `alphaMap` directly to the box, to prevent edge outline bleeding (white lines). Color the box flat obsidian colors (`#08080c`).
- **No Background Star Fields**: Keep the background pure matte black for a premium aesthetic unless the user explicitly requests starscapes.
- **Framer Motion + GSAP**: Use GSAP strictly for non-linear Three.js timeline animations (splitting pack halves, spinning wheels) and Framer Motion for React HUD UI.
- **Zero Inline CSS**: Do not use raw Tailwind, instead use CSS-in-JS style objects inside React components for style safety.
