# Overview

CordiaEC is a Korean diaspora-focused web platform that connects Korean businesses with international markets through various initiatives. The platform features a modern React-based frontend with a Node.js/Express backend, providing services for K-Food, K-Beauty, startup programs, VC matching, and internship opportunities. The website includes content management for initiatives and news articles, along with contact form functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application uses React with TypeScript, built with Vite as the build tool. The application follows a component-based architecture with:

- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Components**: Custom component library built with Radix UI primitives and styled with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom brand colors and design tokens

The frontend is organized into pages (Home, About, Initiatives, News, Contact), reusable components, and modal dialogs for detailed content display.

## Backend Architecture

The server uses Express.js with TypeScript, following a RESTful API design:

- **Database Layer**: Drizzle ORM with PostgreSQL, featuring both in-memory storage for development and PostgreSQL for production
- **API Routes**: RESTful endpoints for contacts, news articles, research papers, and initiatives
- **Storage Interface**: Abstracted storage layer supporting both memory-based and PostgreSQL implementations
- **Development Setup**: Vite integration for hot module replacement in development

## Database Schema

The application uses PostgreSQL with the following main entities:

- **contacts**: User inquiries with name, email, message, and timestamps
- **news_articles**: Content management for news with title, content, excerpt, and publication dates
- **research_papers**: Academic content with view/download tracking
- **initiatives**: Program information with slugs, categories, and rich content
- **UUID Primary Keys**: All tables use UUID primary keys for better distributed system support

## Authentication and Authorization

Currently implements a simple approach without user authentication, suitable for a public-facing informational website. Contact forms are the primary user interaction point.

# External Dependencies

## Core Framework Dependencies

- **React 18**: Frontend framework with TypeScript support
- **Express.js**: Backend web framework
- **Vite**: Build tool and development server
- **Node.js**: Runtime environment

## Database and ORM

- **PostgreSQL**: Production database (via Supabase or other providers)
- **Drizzle ORM**: Type-safe database toolkit
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments

## UI and Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI components
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component patterns

## Development and Platform Tools

- **@replit/vite-plugin-cartographer**: Replit-specific development tooling (removed for external deployments)
- **@replit/vite-plugin-runtime-error-modal**: Development error handling (removed for external deployments)

## Form Handling and Validation

- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## Deployment Infrastructure

- **Supabase**: Recommended PostgreSQL hosting for production
- **Vercel/Netlify**: Supported deployment platforms
- **Environment Variables**: DATABASE_URL for database connection

The application includes deployment preparation scripts that automatically remove Replit-specific dependencies and configure the project for external hosting platforms.