# NicheReply

Multi-tenant WhatsApp automation engine for African small businesses.

## Quick Start

### 1. Prerequisites
- **Node.js 18+** (download from [nodejs.org](https://nodejs.org))
- **A Supabase account** (free at [supabase.com](https://supabase.com))
- **(Optional)** A WhatsApp Business API setup for production

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (takes ~2 minutes)
3. Once created, go to **Project Settings → API**
4. Copy these to your `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **SQL Editor**, paste the contents of `supabase\schema.sql`, and click **Run**

### 3. Configure Environment

```bash
copy .env.example .env.local
```
Then edit `.env.local` and fill in your Supabase credentials.

### 4. Install & Run

```bash
npm install
npm run dev
```

Visit **http://localhost:3000**

### 5. First Time Setup

1. Click **Get Started** → Create an account
2. Complete the **Setup Wizard** (business name → pick niche → optional WhatsApp)
3. You'll land on the dashboard. Use the **Settings → Niche Config** page to switch between:
   - **Salons** — Beauty, barbershops, nail studios
   - **Clinics** — Medical, dental, eye centres
   - **Real Estate** — Property agents, housing agencies

### 6. Connect WhatsApp (for real messaging)

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a **WhatsApp Business App**
3. Get your **Phone Number ID** and **Access Token**
4. Add them to `.env.local`
5. Configure the webhook URL:
   ```
   https://your-domain.com/api/webhook/whatsapp
   ```
   Verify token: `nichereply_verify_2024`

## Project Structure

```
nichereply/
├── app/              # Next.js App Router pages & API routes
├── components/       # UI components
├── configs/         # Niche JSON configs (swap these to change behavior)
├── lib/             # Business logic
│   ├── config/      # Zod validation & config loader
│   ├── engine/      # Flow engine (intent, state, scoring)
│   ├── whatsapp/    # WhatsApp API integration
│   ├── services/    # Database CRUD services
│   └── supabase/    # Database clients
├── hooks/           # React hooks
└── supabase/        # Database schema
```

## Key Concepts

- **Niche configs** live in `configs/*.json` — add a new one to support a new industry
- **Flow engine** in `lib/engine/` handles intent detection, state management, and responses
- **Webhook** at `/api/webhook/whatsapp` ingests all inbound messages
- **Cron** at `/api/cron/reminders` sends scheduled reminders (trigger via pg_cron or external cron)

## License

Private — built for small businesses in Uganda
