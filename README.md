# Veda AI 🧠

> AI-powered assessment creator platform — built with a production-ready monorepo architecture.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-green.svg)](https://expressjs.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.x-red.svg)](https://turbo.build/)

---

## 🏗️ Architecture

This is a **Turborepo monorepo** with npm workspaces.

```
veda-ai/
├── apps/
│   ├── web/          # Next.js 15 App Router frontend (port 3000)
│   └── server/       # Express + TypeScript backend (port 4000)
│
├── packages/
│   ├── ui/           # Shared React component library
│   ├── types/        # Shared TypeScript types + Zod schemas
│   └── config/       # Shared ESLint, Prettier, TypeScript configs
│
├── docker/           # Docker init scripts
├── docker-compose.yml
└── turbo.json
```

---

## 🚀 Tech Stack

### Frontend (`apps/web`)
| Technology | Purpose |
|---|---|
| **Next.js 15** | App Router, RSC, Server Actions |
| **Tailwind CSS v3** | Styling |
| **shadcn/ui** | Component primitives (Radix-based) |
| **Zustand** | Global state management |
| **React Hook Form + Zod** | Form handling & validation |
| **Framer Motion** | Animations |
| **Socket.IO Client** | Real-time communication |

### Backend (`apps/server`)
| Technology | Purpose |
|---|---|
| **Express + TypeScript** | HTTP server |
| **MongoDB + Mongoose** | Primary database |
| **Redis + ioredis** | Caching, sessions, pub/sub |
| **BullMQ** | Job queues (grading, AI generation) |
| **Socket.IO** | WebSocket server |
| **Zod** | Input validation |

---

## 📦 Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** (for local MongoDB + Redis)

---

## 🛠️ Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd veda-ai
npm install
```

### 2. Set up environment variables

```bash
# Root
cp .env.example .env

# Server
cp apps/server/.env.example apps/server/.env

# Web
cp apps/web/.env.local.example apps/web/.env.local
```

Fill in the values in each `.env` file.

### 3. Start local infrastructure (MongoDB + Redis)

```bash
docker-compose up -d
```

This starts:
- **MongoDB** on `localhost:27017`
- **Redis** on `localhost:6379`
- **mongo-express** (DB GUI) on `http://localhost:8081`
- **redis-commander** (Redis GUI) on `http://localhost:8082`

### 4. Run the development servers

```bash
npm run dev
```

This starts both apps simultaneously via Turborepo:
- **Web**: http://localhost:3000
- **Server**: http://localhost:4000
- **API**: http://localhost:4000/api/v1
- **Health**: http://localhost:4000/health

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps and packages |
| `npm run lint` | Lint all workspaces |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run type-check` | TypeScript type check all workspaces |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting |
| `npm run clean` | Remove all build artifacts |

### Workspace-specific commands

```bash
# Run a script in a specific workspace
npm run dev --workspace=apps/web
npm run dev --workspace=apps/server

# Or use Turbo to filter
npx turbo run dev --filter=@veda-ai/web
npx turbo run dev --filter=@veda-ai/server
```

---

## 🎨 Adding shadcn/ui Components

```bash
# From the apps/web directory
cd apps/web
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
# etc.
```

---

## 📁 Package Details

### `@veda-ai/types`
Shared TypeScript types and Zod schemas:
- `User`, `RegisterInput`, `LoginInput`, `AuthTokens`
- `Assessment`, `Question`, `Submission`, `Answer`
- `SOCKET_EVENTS`, `ServerToClientEvents`, `ClientToServerEvents`
- `ApiResponse<T>`, `PaginatedResponse<T>`

```ts
import { User, Assessment, SOCKET_EVENTS } from '@veda-ai/types';
```

### `@veda-ai/ui`
Shared component library with `cn()` utility:
```ts
import { cn } from '@veda-ai/ui';
```

### `@veda-ai/config`
Shared configs (consumed by `extends` in local config files):
- `packages/config/eslint/base.js`
- `packages/config/eslint/next.js`
- `packages/config/eslint/server.js`
- `packages/config/typescript/base.json`
- `packages/config/typescript/nextjs.json`
- `packages/config/typescript/server.json`

---

## 🔐 Environment Variables

See `.env.example` for all available variables with descriptions.

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `REDIS_URL` | Redis connection URL | ✅ |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |
| `NEXT_PUBLIC_API_URL` | Backend API URL (frontend) | ✅ |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | ✅ |

---

## 🐳 Docker Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f mongodb
docker-compose logs -f redis

# Reset data volumes
docker-compose down -v
```

---

## 🔧 Git Conventions

This project uses **Conventional Commits**:

```
feat(web): add assessment creation wizard
fix(server): resolve socket connection leak
docs: update README with Docker setup
chore: bump dependencies
```

**Husky hooks:**
- `pre-commit` — runs ESLint + Prettier on staged files
- `commit-msg` — validates conventional commit format

---

## 📐 Path Aliases

### `apps/web`
| Alias | Resolves to |
|---|---|
| `@/*` | `apps/web/src/*` |
| `@ui/*` | `packages/ui/src/*` |
| `@types-pkg/*` | `packages/types/src/*` |

### `apps/server`
| Alias | Resolves to |
|---|---|
| `@/*` | `apps/server/src/*` |

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Commit with conventional commits: `git commit -m "feat: add X"`
3. Push and open a Pull Request

---

## 📄 License

MIT © Veda AI Team
