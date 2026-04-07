# Aural Form Studio

Production-ready AI Form Builder SaaS built with Next.js App Router, TypeScript, Tailwind, and OpenAI.

## Highlights

- Prompt-to-form AI generation from natural language.
- Drag-and-drop form builder with editable fields.
- Live split-screen preview.
- Public shareable form route via form id and snapshot query payload.
- Local response capture and analytics dashboards.
- CSV download for responses and JSON export for form schema.
- Dark and light theme toggle with default dark premium UI.
- Fully guest mode with no authentication.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- React Hook Form + Zod
- OpenAI API
- Mongoose (optional — for MongoDB persistence)
- Recharts
- Framer Motion
- Sonner
- dnd-kit

## Routes

- /: Landing and prompt input
- /builder: AI builder studio
- /preview: Full live preview
- /analytics: Response insights with charts
- /responses/[formId]: Response list and CSV export
- /form/[id]: Public form endpoint
- /api/generate: AI schema generation endpoint

## Local Setup

1. Install dependencies:

   npm install

2. Optional: add OpenAI key in a local environment file:

   OPENAI_API_KEY=your_api_key_here

3. Start development:

   npm run dev

4. Build for production:

   npm run build

5. Start production server:

   npm run start

## AI Behavior

- If OPENAI_API_KEY is present, /api/generate uses OpenAI to return structured form JSON.
- If no key is present, the app falls back to a deterministic local parser so the full workflow still works.

## Deployment

### Production on Vercel

The app is optimized for serverless deployment on [Vercel](https://vercel.com).

#### Step 1: Push to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a GitHub repo and push:
   ```bash
   git remote add origin https://github.com/your-username/saur-forms.git
   git branch -M main
   git push -u origin main
   ```

#### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repo
4. Vercel will auto-detect Next.js and configure build settings
5. Click **"Deploy"**

#### Step 3: Configure Environment Variables

In Vercel project settings (Settings → Environment Variables), add:

**Required:**
- `OPENAI_API_KEY` — [Get from OpenAI](https://platform.openai.com/api-keys)
- `NEXT_PUBLIC_USE_MONGODB` — Set to `false` (localStorage only) or `true` (MongoDB)

**Optional (if using MongoDB):**
- `MONGODB_URI` — MongoDB connection string

Example:
```
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_USE_MONGODB=false
```

#### Deploying with MongoDB (Optional)

To enable MongoDB persistence:

1. Get a connection string:
   - **MongoDB Atlas (Cloud)**: Create cluster at [mongodb.com/cloud](https://mongodb.com/cloud)
   - **Local MongoDB**: Use `mongodb://localhost:27017/saur-forms`

2. In Vercel, set:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/saur-forms
   NEXT_PUBLIC_USE_MONGODB=true
   ```

3. Redeploy (or auto-redeploys on git push)

### Local Production Test

Before deploying to Vercel:

```bash
npm run build
npm run start
```

Should run on `http://localhost:3000` with production optimizations.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | Yes | AI form generation via OpenAI |
| `MONGODB_URI` | No | MongoDB connection (if using database persistence) |
| `NEXT_PUBLIC_USE_MONGODB` | No | Set to `true` to enable MongoDB storage adapter |

Copy `.env.example` → `.env.local` for local development.

## Notes

- **Hybrid Storage**: By default, data is stored in browser localStorage (zero backend). Optionally connect MongoDB for cross-device persistence.
- **Public Sharing**: Forms can be shared via snapshot links that encode the entire schema in the URL, making them portable.
- **Graceful Degradation**: If OpenAI API fails, the app falls back to deterministic form generation so the workflow never breaks.
- **Production Ready**: The app is fully typed, handles errors, and uses CSS optimizations for fast load times.