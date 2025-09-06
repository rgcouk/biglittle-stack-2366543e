import * as React from "react"
import { Outlet } from "react-router-dom"
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/modern-sidebar"
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/modern-breadcrumb"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Search,
  Bell,
  User,
  LogOut,
  Palette,
  Warehouse,
  Calendar,
  FileText,
  Shield
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"
import { useLocation, Link } from "react-router-dom"

interface ModernLayoutProps {
  children?: React.ReactNode
}

const providerNavigation = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/provider/dashboard", icon: Home },
      { title: "Analytics", url: "/provider/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "Management",
    items: [
      { title: "Units", url: "/provider/units", icon: Warehouse },
      { title: "Customers", url: "/provider/customers", icon: Users },
      { title: "Billing", url: "/provider/billing", icon: CreditCard },
    ]
  },
  {
    title: "Advanced",
    items: [
      { title: "Settings", url: "/provider/settings", icon: Settings },
      { title: "Integrations", url: "/provider/integrations", icon: Shield },
      { title: "Site Customization", url: "/provider/site-customization", icon: Palette },
    ]
  }
]

const customerNavigation = [
  {
    title: "Account",
    items: [
      { title: "Dashboard", url: "/customer/dashboard", icon: Home },
      { title: "Bookings", url: "/customer/bookings", icon: Calendar },
    ]
  }
]

function AppSidebar() {
  const { data: userRole } = useUserRole()
  const { user } = useAuth()
  const location = useLocation()
  const { state } = useSidebar()
  
  const navigation = userRole === 'provider' ? providerNavigation : customerNavigation
  
  const isActive = (path: string) => location.pathname === path
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          {state === "expanded" && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">StoragePro</span>
              <span className="truncate text-xs text-muted-foreground">
                {userRole === 'provider' ? 'Provider Portal' : 'Customer Portal'}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        {state === "expanded" && (
          <div className="p-2">
            <div className="rounded-lg bg-gradient-subtle p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="size-4 text-primary" />
                <span className="text-sm font-medium">Pro Plan</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Advanced features enabled
              </p>
              <Badge variant="secondary" className="text-xs">
                Premium
              </Badge>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

function ModernHeader() {
  const { user, signOut } = useAuth()
  
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/provider/dashboard">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] pl-8 sm:w-[300px]"
          />
        </div>
        
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{user?.email}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <ModernHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 pt-6">
            {children || <Outlet />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}