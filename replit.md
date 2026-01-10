# FETW College Information Chatbot

## Overview

This is an AI-powered chatbot application designed as an academic college project for the Faculty of Engineering and Technology (FETW), Sharnbasva University. The chatbot serves as a College Information and Electronics Assistant, helping students and visitors with questions about the college, department details, and basic electronics and communication engineering concepts.

The application features a modern React frontend with a clean academic blue theme, connected to an Express backend that integrates with OpenAI's API for generating conversational responses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled using Vite
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (academic blue palette)
- **Animations**: Framer Motion for smooth chat bubble transitions
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **AI Integration**: OpenAI API via Replit AI Integrations for chat completions
- **Session Management**: Ephemeral in-memory storage (`MemStorage` class) - each browser session gets a unique ID stored in sessionStorage, cleared on page refresh

### Data Storage
- **Primary Storage**: In-memory storage for chat messages (ephemeral by design)
- **Database Schema**: Drizzle ORM with PostgreSQL dialect configured but messages use MemStorage for session isolation
- **Schema Location**: `shared/schema.ts` defines the messages table structure with sessionId for user isolation

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: esbuild bundles server code, Vite builds client to `dist/public`
- **Type Checking**: TypeScript with strict mode enabled

## External Dependencies

### AI Services
- **OpenAI API**: Used for chat completions via Replit AI Integrations
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - System prompt configures the bot as a college information assistant specializing in ECE topics

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
  - ORM: Drizzle with `drizzle-kit` for migrations
  - Note: Currently using MemStorage for chat sessions, but Postgres schema exists for potential persistence

### Key NPM Packages
- **Server**: express, openai, drizzle-orm, zod, pg
- **Client**: react, @tanstack/react-query, framer-motion, date-fns, wouter
- **UI**: Full Shadcn/ui component set with Radix UI primitives

### Replit Integrations
- `server/replit_integrations/` contains reusable modules for:
  - Chat routes and storage patterns
  - Image generation capabilities
  - Batch processing utilities with rate limiting