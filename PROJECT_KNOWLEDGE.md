# BigLittleBox - Storage Management Platform

## Overview
BigLittleBox is a comprehensive storage management SaaS platform that connects storage providers with customers seeking storage solutions. The platform handles facility management, unit booking, payments, and customer relations.

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router v6
- **State Management**: TanStack React Query
- **UI Components**: shadcn/ui (Radix UI)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Authentication**: Supabase Auth

### Database Schema
- **profiles**: User accounts with roles (provider/customer)
- **facilities**: Storage facilities managed by providers
- **units**: Individual storage units within facilities
- **bookings**: Customer reservations for units
- **payments**: Payment records for bookings

### User Roles
1. **Storage Providers**: Manage facilities, units, bookings, and customers
2. **Customers**: Browse units, make bookings, manage accounts

## Application Structure

### Routes
#### Public Routes
- `/` - Landing page with platform overview
- `/auth` - Login/signup page
- `/storefront` - Customer storefront (facility showcase)
- `/units` - Browse available units
- `/unit/:unitId` - Unit details page

#### Protected Routes (Customers)
- `/account` - Customer account management
- `/book/:unitId` - Booking flow for specific unit

#### Protected Routes (Providers)
- `/provider` - Provider dashboard overview
- `/provider/units` - Units management
- `/provider/customers` - Customer management
- `/provider/billing` - Billing and payments
- `/provider/analytics` - Analytics and reports
- `/provider/customize` - Site customization

### Key Features

#### For Storage Providers
- Facility and unit management
- Customer relationship management
- Booking and payment tracking
- Analytics and reporting
- Site customization options

#### For Customers
- Facility and unit browsing
- Online booking system
- Account management
- Payment tracking

### Design System
The application uses a semantic token-based design system defined in:
- `index.css` - Core design tokens and variables
- `tailwind.config.ts` - Tailwind configuration with custom tokens

Key design principles:
- HSL color system for consistency
- Semantic color tokens (no direct colors in components)
- Responsive design patterns
- Professional business appearance

### Authentication & Security
- Supabase Auth with email/password
- Row Level Security (RLS) policies for data protection
- Role-based access control
- Automatic user profile creation via database triggers

### Data Flow
1. Users sign up and get assigned roles
2. Providers create facilities and units
3. Customers browse and book units
4. System tracks bookings and payments
5. Providers manage customer relationships

## Development Guidelines

### Code Organization
- Components in `/src/components`
- Pages in `/src/pages` (organized by user role)
- Hooks in `/src/hooks`
- Types from Supabase auto-generation
- Utilities in `/src/lib`

### Best Practices
- Use semantic design tokens from the design system
- Implement proper loading states
- Handle errors gracefully with toast notifications
- Follow React Query patterns for data fetching
- Use TypeScript strictly
- Implement responsive designs

### Database Considerations
- All tables use RLS for security
- User profiles linked to auth.users via user_id
- Facility-unit-booking relationships properly structured
- Automatic timestamps and triggers for data integrity

## Current Status
The application has been cleaned of all demo-related functionality and is now a production-ready SaaS platform. Users can sign up, create facilities, manage units, and handle bookings through a professional interface.