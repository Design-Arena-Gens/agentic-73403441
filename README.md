# VisionCrafter — 4K Hyperrealistic Generator

VisionCrafter is a Next.js application that orchestrates high-fidelity text-to-image generations tailored for 4K pipelines. Direct the model with cinematic prompts, control the aspect ratio, and fine-tune guidance to deliver campaign-ready visuals that can be deployed straight to Vercel.

## 🚀 Stack

- [Next.js 14](https://nextjs.org/) with the App Router
- React 18 + TypeScript
- Tailwind CSS for styling
- Flux Pro via [FAL](https://fal.ai) (primary) with an OpenAI fallback

## 🧭 Capabilities

- Prompt-driven 4K-oriented rendering with bespoke aspect ratios
- Negative prompting, guidance strength, diffusion steps, and style reinforcement controls
- Recent render history with instant preview swapping and download actions
- Graceful fallback to OpenAI Images (`gpt-image-1`) when `FAL_KEY` is absent

## ⚙️ Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Provide provider credentials via environment variables:
   ```bash
   # FAL (Flux Pro 1.1) — preferred for 4K output
   export FAL_KEY="fal-secret"

   # Optional fallback (will upscale-friendly dimensions)
   export OPENAI_API_KEY="sk-..."
   ```

   Configure these in your Vercel project settings for production.

3. Run locally:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## 🧩 Environment contract

`POST /api/generate`

```json
{
  "prompt": "Stunning spill of neon lights across rainy asphalt",
  "negativePrompt": "blurry, low detail",
  "aspectRatio": "21:9",
  "guidanceScale": 6.5,
  "steps": 42,
  "styleStrength": 0.35
}
```

Response:

```json
{
  "id": "uuid",
  "imageUrl": "https://...",
  "width": 4096,
  "height": 2048,
  "prompt": "..."
}
```

## 📦 Deployment

- Production ready for Vercel (`npm run build`)
- Images served from the upstream provider (remote patterns enabled)
- Configure `FAL_KEY` and/or `OPENAI_API_KEY` in Vercel → Project Settings → Environment Variables
- Deploy via the provided command:
  ```bash
  vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-73403441
  ```

## 🛡️ Notes

- Flux Pro requires the `FAL_KEY` secret — obtain one from the FAL dashboard.
- OpenAI fallback renders sub-4K dimensions due to model limits but maintains pipeline continuity.
- All generated images stream directly from the provider CDN; download actions use the original URL.

Happy rendering! 🌌
