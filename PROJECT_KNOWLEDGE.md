BigLittleBox - Storage Facility Marketplace SaaS
Overview
BigLittleBox is evolving into a two-sided marketplace platform for storage. The platform serves two primary user types:
 * Storage Providers: Business owners who subscribe to the service to manage their facilities.
 * Customers: The public who can find, book, and manage storage units from individual providers.
This new model maintains data isolation, meaning each provider's customer and booking data is securely stored and managed with that specific provider.
Architecture
Technology Stack
 * Frontend: React 18 + TypeScript + Vite
 * Styling: Tailwind CSS with semantic design system
 * Routing: React Router v6
 * State Management: TanStack React Query
 * UI Components: shadcn/ui (Radix UI)
 * Backend: Supabase (PostgreSQL + Auth + RLS)
 * Authentication: Supabase Auth (email/password for providers and customers)
Core Business Model
 * Two-Sided Platform: The application supports both providers and customers with distinct user experiences.
 * Provider-Owned Data: Each provider has their own self-contained storage management system. Customer and booking data are securely linked to a specific provider.
 * Public Storefronts: Each provider's facility is exposed via a public-facing storefront (e.g., subdomain.biglittlebox.co.uk) where customers can find and book units.
Database Schema
Core Tables
The database schema has been refined to support the two-sided model with data isolation.
 * profiles: User accounts for both providers and customers.
 * facilities: Storage facilities, each owned by a single provider.
 * units: Individual storage units within facilities.
 * bookings: Tracks customer bookings for a specific unit.
 * payments: Payment records for bookings.
Data Security
 * All tables use Row Level Security (RLS) to enforce data ownership.
 * Providers can only access data for their own facilities and customers.
 * Customers can only access their own profile, bookings, and payments.
 * The public can view facility and unit information but cannot access sensitive data.
Planned Database Fixes
A key part of this new plan is resolving the database migration issues. We will:
 * Consolidate Migrations: Combine the entire database schema into a single, clean migration file to ensure consistency and prevent future conflicts.
 * Correct handle_new_user: Update the signup function to properly assign provider or customer roles based on the user's signup flow.
Application Structure
Routes
 * / - Public marketing homepage.
 * /auth - Authentication for both providers and customers.
 * /provider/* - Protected routes for the provider's management dashboard.
 * /facility/:id - Public-facing storefront for a specific facility.
 * /customer/* - Protected routes for the customer's account portal.
Authentication Flow
 * Provider Signup: A user signs up as a provider, creating a new account with the provider role and a new facility.
 * Customer Signup: A user signs up on a provider's storefront, creating a new account with the customer role linked to that provider.
Key Features
For Storage Providers
 * Facility Management: Create and configure storage facilities.
 * Unit Management: Add, edit, delete, and organize units.
 * Customer & Booking Management: View and manage customer information and bookings for their facility.
 * Secure Data: Complete data isolation for each provider.
For Customers
 * Public Storefront: Browse a provider's facilities and available units.
 * Online Booking: Book and pay for a storage unit online.
 * Customer Portal: Manage personal details, view bookings, and track payments.