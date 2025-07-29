# ClassConnect Application

## Overview

ClassConnect is a full-stack web application for discovering and booking local classes and workshops. It features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database management. The application provides real-time class availability, filtering capabilities, and includes features like live chat support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for API server
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL storage

### Development Setup
- **Monorepo Structure**: Shared schema between client and server
- **Hot Reloading**: Vite middleware integrated with Express in development
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared code

## Key Components

### Database Schema (`shared/schema.ts`)
- **Instructors**: User profiles with ratings and experience
- **Locations**: Physical venues with address and coordinates
- **Classes**: Course offerings with pricing, duration, and metadata
- **Class Sessions**: Scheduled instances of classes with availability tracking
- **Reviews**: User feedback and ratings system
- **Chat Messages**: Live chat support system

### API Layer (`server/routes.ts`)
- **Class Search**: Advanced filtering with real-time availability
- **Class Details**: Comprehensive class information with instructor and location data
- **Chat System**: Session-based messaging for customer support

### Frontend Pages
- **Home Page**: Hero section with search, class listings with filters
- **Class Detail Page**: Full class information, booking interface
- **404 Page**: Error handling for unknown routes

### UI Components
- **Class Cards**: Responsive cards showing class information and availability
- **Filter Sidebar**: Advanced search and filtering capabilities
- **Live Chat**: Customer support chat widget
- **Header/Footer**: Navigation and branding

## Data Flow

1. **Search & Discovery**: Users search classes via hero section or apply filters
2. **API Requests**: Frontend makes REST API calls to Express backend
3. **Database Queries**: Drizzle ORM executes PostgreSQL queries with filtering
4. **Real-time Updates**: TanStack Query manages caching and background refetching
5. **State Management**: React components receive data through query hooks

## External Dependencies

### Frontend Dependencies
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React icon library
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date formatting and manipulation

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Session Storage**: connect-pg-simple for PostgreSQL session store
- **Validation**: Zod schemas shared between client and server

### Development Tools
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint and Prettier (implied by setup)
- **Replit Integration**: Custom plugins for Replit environment

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express middleware
- **Hot Module Replacement**: Full HMR support for React components
- **API Proxy**: Vite proxies API requests to Express server
- **Database**: Direct connection to Neon PostgreSQL instance

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Static Serving**: Express serves built frontend assets in production
- **Environment Variables**: Database URL and other config via environment

### Database Management
- **Migrations**: Drizzle Kit handles schema migrations
- **Schema Evolution**: Shared TypeScript schema ensures type safety
- **Connection Pooling**: Neon handles connection management automatically

The application follows a modern full-stack architecture with strong type safety, real-time capabilities, and a focus on user experience through responsive design and live data updates.