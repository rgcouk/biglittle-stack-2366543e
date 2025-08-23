
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
/                        - Marketing homepage (provider-focused)
/auth                   - Provider authentication (signup/login)
/provider               - Main dashboard with real-time statistics
/provider/onboarding    - First-time facility setup
/provider/units         - Unit CRUD management with advanced features
/provider/customers     - Customer management and booking oversight
/provider/analytics     - Business analytics and reporting dashboard
/provider/billing       - Financial management and payment processing
/provider/customization - Site customization and advanced settings
/provider/settings      - Profile, billing, and account management
```

### Authentication Flow
1. Provider signs up via `/auth`
2. Automatic redirect to `/provider/onboarding` for facility setup
3. Once facility is created, access to full dashboard
4. Single role: `provider` (no customer roles)

### Key Features

#### Core Management System
- **Comprehensive Dashboard**: Real-time statistics, metrics, and facility overview
- **Unit Management**: Full CRUD operations with detailed unit information and status tracking
- **Customer Management**: Customer profiles, booking history, and payment tracking
- **Analytics & Reporting**: Revenue analytics, occupancy trends, and business insights
- **Billing Management**: Payment processing, invoicing, and financial tracking
- **Maintenance System**: Unit maintenance scheduling and status management

#### Advanced Features
- **Multi-Facility Management**: Support for providers with multiple facilities
- **Advanced Reporting**: Detailed business reports and performance analytics
- **Mobile Optimization**: Responsive design for mobile facility management
- **Automation Center**: Automated workflows and business process management
- **Site Customization**: Facility branding and configuration options

#### Data & Security
- **Real-Time Data**: Live statistics and instant updates across all management areas
- **Secure Data Isolation**: Complete data privacy between different providers
- **Role-Based Access**: Proper authentication and authorization system

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
- **Components**: `/src/components` (UI components, auth, provider features)
  - `/auth` - Authentication components
  - `/provider` - Advanced management components (dialogs, dashboards)
  - `/ui` - Reusable UI components (shadcn/ui)
  - `/forms` - Form components for data entry
  - `/layout` - Navigation and layout components
- **Pages**: `/src/pages` (provider management pages)
- **Hooks**: `/src/hooks` (data fetching, business logic, and state management)
  - Real-time dashboard statistics
  - Customer and billing management
  - Analytics and multi-facility support
- **Types**: Auto-generated from Supabase with comprehensive coverage
- **Utilities**: `/src/lib` (helpers, currency formatting, utilities)

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
BigLittleBox is a comprehensive SaaS platform for storage facility management. The application provides:

### Core Features ✅
- **Authentication & Onboarding**: Complete provider signup and facility setup flow
- **Real-Time Dashboard**: Live statistics, metrics, and business overview
- **Unit Management**: Full CRUD operations with detailed unit tracking
- **Customer Management**: Complete customer profiles and booking management
- **Financial Management**: Billing, payments, and revenue tracking

### Advanced Features ✅
- **Analytics & Reporting**: Business intelligence with charts and insights  
- **Multi-Facility Support**: Management across multiple facility locations
- **Mobile Optimization**: Responsive design for mobile management
- **Automation Center**: Workflow automation and process management
- **Maintenance System**: Unit maintenance scheduling and tracking

### Technical Excellence ✅
- **Secure Data Isolation**: Complete privacy between providers
- **Professional SaaS Interface**: Modern, responsive design system
- **Real-Time Updates**: Live data across all management areas
- **Comprehensive Type Safety**: Full TypeScript implementation

The platform is production-ready for storage facility providers to manage complex business operations efficiently and securely.

## Demo Data Requirements
For testing the provider dashboard:
- Create a test provider account via `/auth`
- Complete facility onboarding at `/provider/onboarding`
- Add sample units via `/provider/units`
- Access full dashboard functionality at `/provider`

The application works out of the box with the current database schema and RLS policies.