# CordiaEC Web Application

## Overview

CordiaEC is a modern full-stack web application built as a corporate website for a global solutions company. The application features a responsive React frontend with a Node.js/Express backend, showcasing company information, research papers, news articles, initiatives, and contact functionality. The project uses a monorepo structure with shared TypeScript schemas and implements modern web development practices including server-side rendering support and comprehensive UI components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library built on Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Styling**: CSS variables for theming with support for light/dark modes and custom brand colors

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reloading with Vite middleware integration
- **Error Handling**: Centralized error middleware with structured error responses

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless driver
- **Schema**: Shared TypeScript schemas between frontend and backend
- **Migrations**: Drizzle Kit for database schema management
- **Development**: In-memory storage implementation for rapid development and testing

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **No Authentication**: Currently implements public-facing corporate website without user authentication

### Database Schema Design
The application uses four main entities:
- **Contacts**: User contact form submissions with name, email, and message
- **Research Papers**: Academic publications with metadata, view counts, and download tracking
- **News Articles**: Company news with excerpts and publication dates
- **Initiatives**: Company programs and projects with categorization and detailed content

### Component Architecture
- **Design System**: Comprehensive UI component library based on shadcn/ui
- **Modal System**: Reusable modal components for displaying detailed content
- **Layout System**: Shared layout component with responsive navigation
- **Form Components**: Validated form components with error handling
- **Loading States**: Skeleton components and loading indicators

### Build and Deployment
- **Development**: Vite dev server with Express API proxy
- **Production**: Vite build for static assets, esbuild for server bundling
- **Assets**: Static file serving with Vite integration
- **Environment**: Environment-based configuration with development/production modes

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **Backend Framework**: Express.js with TypeScript support
- **Build Tools**: Vite, esbuild, TypeScript compiler

### Database and ORM
- **Database**: PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Validation**: Zod for runtime type validation and schema generation

### UI and Styling
- **CSS Framework**: Tailwind CSS with PostCSS and Autoprefixer
- **Component Library**: Extensive Radix UI primitives for accessible components
- **Icons**: Lucide React icon library
- **Utilities**: clsx and tailwind-merge for conditional styling

### Development Tools
- **Routing**: Wouter for lightweight client-side routing
- **Date Handling**: date-fns for date manipulation and formatting
- **Carousel**: Embla Carousel for interactive content sliders
- **Session Storage**: connect-pg-simple for PostgreSQL session management

### Replit Integration
- **Development**: Replit-specific development tools and error overlay
- **Cartographer**: Replit code mapping for development environment
- **Banner**: Development mode banner for external access