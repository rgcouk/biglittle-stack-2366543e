
# BigLittleBox - Storage Facility Management SaaS

## Overview
BigLittleBox is a **pure SaaS platform** for storage facility providers to manage their business operations. It is **NOT** a public marketplace like Airbnb for storage. Each provider owns and manages their own facility within the platform with complete data isolation and privacy.

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with semantic design system
- **Routing**: React Router v6
- **State Management**: TanStack React Query
- **UI Components**: shadcn/ui (Radix UI)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Authentication**: Supabase Auth (email/password only)

### Core Business Model
- **One User = One Provider = One Facility**
- Each provider signs up, sets up their facility, and manages their units
- All data is scoped to the provider who owns it
- No public customer interface or marketplace functionality
- Future customer features will be facility-specific and behind authentication

## Database Schema

### Core Tables
- **profiles**: User accounts (provider role only)
- **facilities**: Storage facilities (one per provider)
- **units**: Individual storage units within facilities
- **bookings**: Internal booking/customer tracking (optional)
- **payments**: Payment records for bookings (optional)

### Data Security
- All tables use Row Level Security (RLS)
- Data access restricted to facility owners only
- No shared or public data between providers
- User profiles linked to auth.users via user_id

## Application Structure

### Routes (Provider-Only SaaS)
```
/                    - Marketing homepage (provider-focused)
/auth               - Provider authentication (signup/login)
/provider           - Main dashboard (requires facility setup)
/provider/onboarding - First-time facility setup
/provider/units     - Unit CRUD management
/provider/settings  - Profile, billing, password management
```

### Authentication Flow
1. Provider signs up via `/auth`
2. Automatic redirect to `/provider/onboarding` for facility setup
3. Once facility is created, access to full dashboard
4. Single role: `provider` (no customer roles)

### Key Features

#### For Storage Providers Only
- **Facility Setup**: Create and configure storage facility
- **Unit Management**: Add, edit, delete, and organize storage units
- **Dashboard**: Overview of facility operations and metrics
- **Settings**: Profile management and account settings
- **Secure Data**: Complete data isolation between providers

#### Removed Features (No Longer Applicable)
- ❌ Public storefront/marketplace
- ❌ Customer browsing interface
- ❌ Public unit booking system
- ❌ Customer account management
- ❌ Multi-tenant customer systems

## Design System
The application uses a semantic token-based design system:
- `index.css` - Core design tokens and HSL color variables
- `tailwind.config.ts` - Tailwind configuration with custom tokens
- **NO direct colors in components** - everything uses semantic tokens
- Professional business appearance optimized for SaaS users

## Data Flow
1. Provider signs up and creates account
2. Provider completes facility onboarding
3. Provider manages units and facility operations
4. All data remains private to the provider
5. Future customer interactions (if any) will be facility-specific

## Development Guidelines

### Code Organization
- **Components**: `/src/components` (UI components and auth)
- **Pages**: `/src/pages` (provider-only pages)
- **Hooks**: `/src/hooks` (data fetching and state management)
- **Types**: Auto-generated from Supabase
- **Utilities**: `/src/lib` (helpers and utilities)

### Best Practices
- Use semantic design tokens exclusively
- Implement proper loading states and error handling
- Follow React Query patterns for data fetching
- Use TypeScript strictly throughout
- All designs must be responsive
- Provider-focused UX and messaging

### Database Guidelines
- All tables use RLS for security
- Data scoped by provider ownership
- No shared data between providers
- Automatic timestamps and triggers for data integrity
- Direct table queries instead of functions for reliability

## Current Status
BigLittleBox has been transformed from a marketplace concept into a focused SaaS platform for storage providers. The application provides:

✅ **Clean provider-only authentication flow**
✅ **Facility onboarding and setup**
✅ **Unit management system**
✅ **Provider dashboard and settings**
✅ **Secure data isolation**
✅ **Professional SaaS interface**

The platform is ready for storage facility providers to sign up, create their facility, and manage their business operations efficiently and securely.

## Demo Data Requirements
For testing the provider dashboard:
- Create a test provider account via `/auth`
- Complete facility onboarding at `/provider/onboarding`
- Add sample units via `/provider/units`
- Access full dashboard functionality at `/provider`

The application works out of the box with the current database schema and RLS policies.