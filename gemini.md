# Gemini Project Knowledge File

## 1. Project Overview

- **Project Name**: BigLittleBox
- **Description**: A SaaS platform for storage facility providers to manage their business operations. This is not a public marketplace; each provider has their own private, isolated instance.
- **Core Idea**: One user account corresponds to one provider, who manages one facility.

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS with a semantic, token-based design system.
- **Routing**: React Router v6
- **State Management/Data Fetching**: TanStack React Query
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with email/password and Row Level Security (RLS) enabled.

## 3. Getting Started

- **Install Dependencies**: `npm install`
- **Run Development Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Linting**: `npm run lint`

## 4. Application Structure

- **Components**: Reusable UI components are in `src/components`.
- **Pages**: Top-level page components are in `src/pages`.
- **Hooks**: Custom hooks for data fetching and state are in `src/hooks`.
- **Supabase Integration**: Supabase client and types are in `src/integrations/supabase`.
- **Styling**: Global styles and Tailwind config are in `src/index.css` and `tailwind.config.ts`.

## 5. Database and Authentication

- **Database Schema**: The core tables are `profiles`, `facilities`, `units`, `bookings`, and `payments`.
- **Security**: All data is protected with Supabase's Row Level Security (RLS), ensuring providers can only access their own data.
- **Authentication Flow**:
    1. A new provider signs up.
    2. They are redirected to an onboarding flow to set up their facility.
    ### Automated Payment Management

The following functions and triggers have been implemented to automate payment management:

- **`generate_payment_for_booking()`**: A trigger that automatically generates a payment record when a new booking is created.
- **`update_payment_statuses()`**: A function that updates the status of payments (e.g., to overdue) based on their due dates.
- **`generate_monthly_payments()`**: A function that generates recurring monthly payments for active bookings.

## 6. Key Commands

- `npm run dev`: Starts the local development server.
- `npm run build`: Creates a production build.
- `npm run lint`: Runs the linter to check for code quality.
- `npm run lint:fix`: Automatically fixes fixable linting issues.

## 7. Testing

- **Run Tests**: `npm test` (This is a placeholder, the actual command may differ).
