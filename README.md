# invyte AI ⚡

An AI-powered web application that generates beautiful event invitations as dynamic landing pages. Create stunning, personalized invites for any occasion with the power of artificial intelligence.

## ✨ Features

- 🤖 AI-powered invitation generation (Claude 3.5 Sonnet)
- 🎨 Beautiful, responsive landing page designs
- 📸 Upload your own images, logos, and backgrounds
- 📱 Mobile-first, modern UI
- 🌙 Dark/light theme support
- 💬 WhatsApp RSVP integration
- 📍 Google Places venue suggestions
- 📊 Invite analytics (views, engagement)
- 🏷️ Multiple event types (birthday, wedding, corporate, etc.)
- ⚡ Lightning-fast performance
- 🛠️ Built with Next.js 14, React 18, Tailwind CSS, Radix UI
- 🗃️ Supabase for data storage and analytics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Gresham24/invite-ai.git
   cd invite-ai
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables
- Copy `.env.example` to `.env.local` and fill in required values (Supabase, Anthropic, etc).

## 🛠️ Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🏗️ Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/             # API routes (RESTful endpoints)
│   │   ├── generate-invite/route.ts         # AI invite generation
│   │   ├── upload-images/route.ts           # Image upload endpoint
│   │   ├── invite/[inviteId]/route.ts       # Fetch invite by ID
│   │   ├── invite/[inviteId]/analytics/     # Analytics endpoint
│   │   └── user/[email]/invites/route.ts    # User's invites
│   ├── create/           # Invite creation page
│   ├── invite/[inviteId]/page.tsx           # Dynamic invite landing page
│   └── page.tsx          # Main landing page
├── components/          # Reusable UI components
│   ├── invite-form.tsx  # Main invite creation form
│   ├── invite-renderer.tsx # Renders generated invites
│   ├── load-screen.tsx  # Loading/animation screens
│   ├── theme-provider.tsx
│   └── ui/              # Base UI components (Radix, custom)
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions (Supabase, API, etc)
├── public/              # Static assets (icons, manifest, etc)
├── scripts/             # Setup and utility scripts
├── styles/              # Global styles (Tailwind)
└── tests/               # Test files
```

## 📚 API Endpoints

- `POST /api/generate-invite` — Generate a new invite using AI
- `POST /api/upload-images` — Upload images for invites
- `GET /api/invite/[inviteId]` — Fetch invite data by ID
- `GET /api/invite/[inviteId]/analytics` — Fetch analytics for an invite
- `GET /api/user/[email]/invites` — Fetch all invites for a user

## 🧩 Component Library
- Extensive set of UI components in `components/ui/` (Radix UI, custom, and utility components)
- Form handling with React Hook Form + Zod
- Animations with Framer Motion

## 📊 Analytics
- Track invite views and engagement per invite
- Analytics endpoint: `/api/invite/[inviteId]/analytics`

## 📝 Usage Flow
1. Go to `/create` to generate a new invite
2. Fill in event details, upload images, and submit
3. Share the generated invite link with guests
4. Track analytics and engagement in real time

## 🏗️ Tech Stack
- **Framework:** Next.js 14
- **Language:** TypeScript, React 18
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, custom
- **Form Handling:** React Hook Form + Zod
- **AI:** Anthropic Claude 3.5 Sonnet
- **Database:** Supabase
- **Animations:** Framer Motion
- **Theme:** next-themes

## 🧪 Testing
- Jest for unit/integration tests (`/tests`)

