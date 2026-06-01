# BlogNest

A full-stack AI-powered blog platform built with **Next.js 15**, **Neon PostgreSQL**, **Prisma**, **NextAuth.js**, and **Groq**. Read world-affairs stories, write with an AI assistant, and subscribe to a real SMTP newsletter.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![Groq](https://img.shields.io/badge/Groq-AI-orange)

---

## Features

### Core blog

- **Home feed** — Hero featured post, category filters, paginated grid, trending sidebar
- **Post detail** — Cover images, author card, tags, related posts, reading stats
- **Create post** — Rich editor with categories, tags, cover image URL, live preview
- **Auth** — Email/password signup & login with **NextAuth.js** (JWT sessions)
- **Protected routes** — `/create-post` requires sign-in
- **Seeded content** — 20+ sample articles on technology, politics, science, climate, and more

### AI (Groq — Llama 3)

| Feature | Where | Description |
|--------|--------|-------------|
| **TL;DR Summarizer** | Post page | 5-bullet AI summary of any article |
| **Natural language search** | Home | Search posts by meaning, not just keywords |
| **Personalized “For You” feed** | Home sidebar | Recommendations from reading history (localStorage) |
| **Full article generator** | Create post | Topic + tone + length → draft with title, body, excerpt, tags |
| **Title suggestions** | Create post | 5 headline alternatives |
| **Auto excerpt** | Create post | Compelling summary for post cards |
| **Auto tag suggestions** | Create post | SEO-friendly tags in one click |
| **Continue writing** | Create post | AI continues from your last paragraphs |
| **Grammar & tone check** | Create post | Score, issues, strengths |
| **Rewrite in tone** | Create post | Professional, casual, academic, persuasive, simple, bold |
| **SEO analyzer** | Create post | Score, grade, keywords, recommendations |
| **Semantic related posts** | Post page | Category-based related articles |

### Newsletter

- **Subscribe** on home (hero + sidebar), footer, and post sidebar
- Saves subscribers to **Neon** via Prisma
- Sends a **welcome email** through your **SMTP** provider

### Security

- **API auth** — Post creation and editor AI routes require login
- **Rate limiting** — Per-IP limits on register, newsletter, AI, and read APIs
- **CORS** — `/api` routes only allow your app origin (`NEXTAUTH_URL` + localhost in dev)

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | [Neon](https://neon.tech) PostgreSQL |
| ORM | Prisma 7 |
| Auth | NextAuth.js v5 (Credentials + Prisma adapter) |
| AI | [Groq](https://groq.com) (`groq-sdk`) |
| Email | Nodemailer (SMTP) |
| Charts | Recharts |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/zain0313233/blognest.git
cd blognest
npm install
```

### 2. Environment variables

Create **`.env`** (Prisma CLI) and **`.env.local`** (Next.js):

```env
# Database (use Neon pooler URL for serverless deploys)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/blognest?sslmode=require"

# NextAuth (Auth.js v5 — set both naming styles on Netlify)
AUTH_SECRET="generate-a-long-random-string"
AUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="same-as-AUTH_SECRET"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

# Groq AI
GROQ_API_KEY="your_groq_api_key"

# SMTP (newsletter welcome emails)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your_smtp_user"
SMTP_PASS="your_smtp_password"
SMTP_FROM_EMAIL="newsletter@yourdomain.com"
SMTP_FROM_NAME="BlogNest"
```

> **Production (Netlify):** Set `NEXTAUTH_URL` and `AUTH_URL` to `https://blognestpk.netlify.app` (no trailing slash). Set `NEXTAUTH_SECRET` and `AUTH_SECRET` to the same random string. Add `AUTH_TRUST_HOST=true` or rely on `trustHost: true` in code (already enabled).

### 3. Database setup

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build for production

```bash
npm run build
npm start
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed authors and sample posts |

---

## API overview

| Route | Method | Access |
|-------|--------|--------|
| `/api/posts` | GET | Public (rate limited) |
| `/api/posts` | POST | Authenticated |
| `/api/posts/[id]` | GET | Public (rate limited) |
| `/api/register` | POST | Public (rate limited) |
| `/api/newsletter/subscribe` | POST | Public (rate limited) |
| `/api/auth/[...nextauth]` | * | NextAuth handlers |
| `/api/ai/summarize` | POST | Public (rate limited) |
| `/api/ai/search` | POST | Public (rate limited) |
| `/api/ai/*` (editor tools) | POST | **Authenticated** |

---

## Deployment

Works on **Netlify**, **Vercel**, or any Node host that supports Next.js 15.

1. Push to GitHub and connect the repo.
2. Set all environment variables in the hosting dashboard.
3. Use Neon **pooler** `DATABASE_URL` for serverless.
4. Run `npx prisma db push` against production DB once (or use migrations).
5. Redeploy after changing env vars.

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/          # Groq-powered features
│   │   ├── auth/        # NextAuth
│   │   ├── newsletter/  # Subscribe + SMTP
│   │   ├── posts/       # CRUD
│   │   └── register/
│   ├── auth/            # Login & signup pages
│   ├── create-post/     # Editor + AI assistant
│   ├── posts/[id]/      # Article + TL;DR
│   └── page.tsx         # Home + search + feed
├── components/
│   ├── Layout.tsx
│   ├── NewsletterForm.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── prisma.ts
│   ├── groq.ts
│   ├── mail.ts
│   ├── api-guard.ts     # Auth + rate limits
│   ├── cors.ts
│   └── rate-limit.ts
├── auth.ts
├── auth.config.ts
└── middleware.ts        # CORS + /create-post guard
prisma/
├── schema.prisma
└── seed.ts
```

---

## Author

**Zain Aown**  
GitHub: [@zain0313233](https://github.com/zain0313233)

---

## License

Private portfolio project. All rights reserved unless otherwise noted.
