# BigLittleBox - Storage Facility Management System
## Project Knowledge Base

### 🏗️ **SYSTEM ARCHITECTURE**

#### Core Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router v6

#### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── auth/           # Authentication components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client & types
├── lib/                # Utility functions
├── pages/              # Route components
│   ├── customer/       # Customer-facing pages
│   └── provider/       # Provider dashboard pages
└── main.tsx           # App entry point
```

---

### 🗄️ **DATABASE SCHEMA & API**

#### Core Tables Structure

**profiles** - User management
```sql
- id: uuid (PK)
- user_id: uuid (FK to auth.users)
- display_name: text
- role: text ('customer' | 'provider')
- phone: text
- company_name: text
- created_at, updated_at: timestamps
```

**facilities** - Storage locations
```sql
- id: uuid (PK)
- provider_id: uuid (FK to profiles.id)
- name: text
- address: text
- postcode: text
- description: text
- email: text
- phone: text
- created_at, updated_at: timestamps
```

**units** - Individual storage units
```sql
- id: uuid (PK)
- facility_id: uuid (FK to facilities.id)
- unit_number: text
- size_category: text
- length_metres: numeric
- width_metres: numeric
- height_metres: numeric
- floor_level: integer
- monthly_price_pence: integer
- status: text ('available' | 'occupied' | 'maintenance')
- features: text[] (array)
- created_at, updated_at: timestamps
```

**bookings** - Rental agreements
```sql
- id: uuid (PK)
- unit_id: uuid (FK to units.id)
- customer_id: uuid (FK to profiles.id)
- start_date: date
- end_date: date (nullable)
- monthly_rate_pence: integer
- status: text ('active' | 'ended' | 'pending')
- created_at, updated_at: timestamps
```

**payments** - Payment tracking
```sql
- id: uuid (PK)
- booking_id: uuid (FK to bookings.id)
- amount_pence: integer
- payment_date: timestamp
- payment_method: text
- status: text ('pending' | 'completed' | 'failed')
- stripe_payment_id: text
- created_at: timestamp
```

#### Row Level Security (RLS) Policies

**Key Security Rules:**
- Users can only access their own profile data
- Customers can view all facilities and available units
- Providers can manage their own facilities and units
- Customers can only view/create their own bookings
- Providers can view bookings for their units
- Payment access follows booking ownership rules

#### API Patterns

**Data Fetching Hooks:**
```typescript
// Single resource
const { data: facility } = useFacility(facilityId);

// List resources
const { data: facilities } = useFacilities();

// Filtered resources
const { data: units } = useUnits(facilityId);
```

**Mutation Hooks:**
```typescript
// Create resource
const createUnit = useCreateUnit();
createUnit.mutate(unitData);

// Update resource
const updateFacility = useUpdateFacility();
updateFacility.mutate({ id, updates });

// Delete resource
const deleteUnit = useDeleteUnit();
deleteUnit.mutate(unitId);
```

---

### 🎨 **STYLING SYSTEM**

#### Design Tokens (index.css)
```css
:root {
  /* Colors use HSL format */
  --primary: [hsl values];
  --secondary: [hsl values];
  --background: [hsl values];
  --foreground: [hsl values];
  
  /* Semantic tokens for consistency */
  --muted: [hsl values];
  --accent: [hsl values];
  --destructive: [hsl values];
}
```

#### Component Styling Rules
1. **Always use semantic tokens** from design system
2. **Never use direct colors** like `text-white`, `bg-black`
3. **Use shadcn variants** for consistent styling
4. **Responsive design** with mobile-first approach
5. **Dark/light mode support** through CSS variables

#### Key Component Patterns
```typescript
// Button variants
<Button variant="default" size="md">
<Button variant="outline" size="sm">
<Button variant="destructive" size="lg">

// Card layouts
<Card className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Form components
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### 🔧 **DEVELOPMENT TEMPLATES**

#### Custom Hook Template
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useResourceName() {
  return useQuery({
    queryKey: ['resource-name'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('table_name')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateData) => {
      const { data: result, error } = await supabase
        .from('table_name')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-name'] });
      toast({
        title: "Success",
        description: "Resource created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create resource.",
        variant: "destructive",
      });
    },
  });
}
```

#### Form Component Template
```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  field: z.string().min(1, "Field is required"),
});

type FormData = z.infer<typeof formSchema>;

export function FormComponent() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { field: "" },
  });

  const onSubmit = (data: FormData) => {
    // Handle form submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

#### Page Component Template
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useResourceName } from "@/hooks/useResourceName";

export default function PageName() {
  const { data, isLoading } = useResourceName();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Page Title</h1>
        <Button>Action Button</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Section Title</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Content */}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 🐛 **DEBUGGING STRATEGIES**

#### Network Request Issues
1. **Check Supabase Console** for API errors
2. **Verify RLS policies** match user permissions
3. **Check authentication state** before API calls
4. **Use network tab** to inspect request/response

#### React Query Issues
```typescript
// Debug query state
const { data, error, isLoading, isError } = useQuery({
  queryKey: ['debug-key'],
  queryFn: fetchFunction,
  onError: (error) => console.error('Query error:', error),
  onSuccess: (data) => console.log('Query success:', data),
});

// Check query cache
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log(queryClient.getQueryData(['key']));
```

#### Form Validation Issues
```typescript
// Debug form state
const form = useForm({
  mode: "onChange", // Show errors immediately
  resolver: zodResolver(schema),
});

// Check form errors
console.log('Form errors:', form.formState.errors);
console.log('Form values:', form.getValues());
```

#### Supabase RLS Debugging
```sql
-- Test RLS policies in SQL editor
SELECT auth.uid(); -- Check current user
SELECT * FROM profiles WHERE user_id = auth.uid();
SELECT * FROM facilities; -- Test visibility
```

#### Common Error Patterns
- **406 Not Acceptable**: Schema configuration issue
- **403 Forbidden**: RLS policy blocking access
- **401 Unauthorized**: Authentication required
- **422 Unprocessable**: Form validation failure

---

### 🚀 **ROADMAP TO FINAL PRODUCT**

#### Phase 1: Core Infrastructure ✅
- [x] Database schema design
- [x] Authentication system
- [x] RLS policies
- [x] Basic CRUD operations
- [x] Component library setup

#### Phase 2: Provider Features 🔄
- [x] Facility management
- [x] Unit management
- [x] Provider dashboard
- [ ] Booking management interface
- [ ] Revenue analytics
- [ ] Customer management

#### Phase 3: Customer Features 📋
- [ ] Unit browsing/search
- [ ] Booking flow
- [ ] Payment integration
- [ ] Customer account management
- [ ] Booking history

#### Phase 4: Advanced Features 📋
- [ ] Email notifications
- [ ] File upload/storage
- [ ] Advanced search filters
- [ ] Mobile responsiveness optimization
- [ ] SEO optimization

#### Phase 5: Business Features 📋
- [ ] Multi-facility support
- [ ] Pricing management
- [ ] Inventory tracking
- [ ] Reporting dashboard
- [ ] API rate limiting

#### Phase 6: Production Ready 📋
- [ ] Error monitoring
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Deployment automation

---

### 📝 **BEST PRACTICES**

#### Code Organization
- Keep components small and focused
- Use custom hooks for business logic
- Separate concerns (UI, data, business logic)
- Follow consistent naming conventions
- Write TypeScript interfaces for all data

#### Performance
- Use React Query for data fetching
- Implement proper loading states
- Optimize database queries
- Use proper indexing in Supabase
- Lazy load heavy components

#### Security
- Always use RLS policies
- Validate all inputs
- Sanitize user data
- Use proper authentication
- Follow principle of least privilege

#### Testing Strategy
- Unit tests for utility functions
- Integration tests for API calls
- Component tests for UI logic
- E2E tests for critical flows
- Manual testing for UX

---

### 🔗 **KEY INTEGRATIONS**

#### Supabase Configuration
```typescript
// Client setup
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

#### Route Structure
```typescript
// Main routes
/                    # Landing page
/auth               # Authentication
/customer/*         # Customer dashboard
/provider/*         # Provider dashboard
/demo              # Demo page
```

#### Authentication Flow
1. User signs up/in through Supabase Auth
2. Profile created via database trigger
3. Role-based routing to appropriate dashboard
4. RLS policies enforce data access

This knowledge base should be updated as the project evolves and new patterns emerge.