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

## Screenshots and Page Guide

### 1. Overview Page (`/`)

![Overview](app/Screenshots/Overview.png)

What this page does:
- Entry point for the product.
- Lets users describe a form in plain English.
- Shows pre-built template prompts for fast starts.

How it works:
- User enters a prompt and clicks Generate with AI.
- Frontend sends POST request to `/api/generate`.
- Returned schema is saved and user is routed to `/builder`.

### 2. Templates Section (`/`, template cards)

![Templates](app/Screenshots/Templates.png)

What this section does:
- Provides ready-made prompt presets like hiring, support, event registration, and lead qualification.
- Helps users generate high-quality forms without writing prompts from scratch.

How it works:
- Clicking a template fills the AI prompt.
- User can generate immediately or modify the prompt first.

### 3. Builder Page (`/builder`)

![Builder](app/Screenshots/Builder.png)

What this page does:
- Main studio for form editing and refinement.
- Supports drag-and-drop field ordering.
- Supports field edits (label, placeholder, required, validation).
- Includes AI assist actions:
   - Improve whole form (`/api/improve`)
   - Instruction-based edits (`/api/edit`)

How it works:
- Form schema is loaded from storage adapter.
- User edits update in-memory state (Zustand).
- Save operation persists via storage adapter:
   - MongoDB API (if enabled)
   - localStorage fallback/cache

### 4. Live Preview Page (`/preview`)

![Live Preview](app/Screenshots/Livepreview.png)

What this page does:
- Renders the current form as end users will see it.
- Validates fields using React Hook Form + Zod.

How it works:
- Uses the current active form schema.
- Submissions create response records and persist through storage adapter.

### 5. Analytics Page (`/analytics`)

![Analytics](app/Screenshots/Analytics.png)

What this page does:
- Shows form-level response metrics and charts.
- Displays aggregate counts and field-level insights.
- Reacts to data changes (deletes/new submissions) automatically.

How it works:
- Reads forms and responses for selected form.
- Uses chart components to compute answer distributions.
- Subscribes to storage change events to auto-refresh view.

### 6. Responses Page (`/responses/[formId]`)

![Responses](app/Screenshots/Responses.png)

What this page does:
- Lists all submissions for one form.
- Supports delete single response and clear all.
- Exports CSV.
- Includes AI insights panel (`/api/insights`).

How it works:
- Fetches the form + responses by form id.
- Mutations update storage and re-render immediately.
- AI Insights summarizes trends from response samples.

## How AI Works

AI features in this app are schema-first and resilient.

1. Prompt to Form (`/api/generate`)
- Input: plain text prompt.
- Action: OpenAI (`gpt-4o-mini`) returns strict JSON schema.
- Output: normalized form schema with title, description, and fields.
- Fallback: deterministic local schema generator when key/model is unavailable.

2. Improve Form (`/api/improve`)
- Input: current form schema.
- Action: AI rewrites labels/placeholders/descriptions for clarity.
- Output: polished schema while preserving form identity.

3. Edit by Instruction (`/api/edit`)
- Input: current schema + user instruction (for example: add phone field).
- Action: AI applies targeted changes.
- Output: full updated schema.

4. Response Insights (`/api/insights`)
- Input: schema + response samples.
- Action: AI summarizes trends and returns key insights + score.
- Output: dashboard-friendly insights object.
- Fallback: structural non-AI insights if key is missing.

## How DB Works (MongoDB + Local Fallback)

Storage is controlled by `NEXT_PUBLIC_USE_MONGODB`.

- `false` (default):
   - All forms and responses use browser localStorage.
   - Works offline and requires no backend setup.

- `true`:
   - Frontend storage adapter calls Next.js API routes.
   - API routes use Mongoose models and persist to MongoDB.
   - Local storage is still kept as client-side cache/fallback.

Main flow:
1. UI calls storage adapter (`lib/storageAdapter.ts`).
2. Adapter decides data source based on env toggle.
3. If MongoDB mode is on:
    - Calls `/api/forms`, `/api/forms/[id]`, `/api/forms/[id]/responses`.
4. If request fails:
    - Adapter gracefully falls back to localStorage.

## How Submission Works (End-to-End)

1. User opens public form (`/form/[id]`) or preview.
2. User fills fields and submits.
3. Frontend validates inputs with Zod schema generated from field config.
4. On success, a response object is created:
    - `id`
    - `formId`
    - `submittedAt`
    - `values` map
5. Response is persisted through storage adapter:
    - MongoDB API (if enabled), plus local cache
    - localStorage only (if MongoDB disabled)
6. Analytics and responses pages update from latest stored data.
7. Admin can delete single responses, clear all, or export CSV.

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