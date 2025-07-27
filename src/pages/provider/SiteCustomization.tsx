import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Palette, Globe, Upload, Home } from "lucide-react"
import { Link } from "react-router-dom"

export default function SiteCustomization() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/provider" className="flex items-center space-x-2 text-primary">
                <Home className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-border" />
              <h1 className="text-2xl font-bold">Site Customization</h1>
            </div>
            <Button className="bg-gradient-primary hover:opacity-90">
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>Configure your business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" defaultValue="Premier Storage Solutions" />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" defaultValue="Secure Storage Solutions" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    defaultValue="Premium self-storage facilities with state-of-the-art security, climate control, and convenient access."
                    className="min-h-20"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <span>Branding</span>
                </CardTitle>
                <CardDescription>Customize your storefront appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <Button variant="outline">Upload Logo</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-4">
                    <input type="color" className="w-16 h-10 border rounded" defaultValue="#3b82f6" />
                    <Input placeholder="#3b82f6" className="flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Domain Settings</span>
                </CardTitle>
                <CardDescription>Configure your custom domain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <div className="flex">
                    <Input id="subdomain" defaultValue="premier-storage" className="rounded-r-none" />
                    <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground">
                      .bigbox.app
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
                  <Input id="custom-domain" placeholder="www.yourdomain.com" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your storefront will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
                    <h3 className="text-2xl font-bold mb-2">Premier Storage Solutions</h3>
                    <p className="opacity-90">Secure Storage Solutions</p>
                  </div>
                  <div className="p-6 bg-white">
                    <p className="text-gray-600 mb-4">
                      Premium self-storage facilities with state-of-the-art security, climate control, and convenient access.
                    </p>
                    <div className="space-y-2">
                      <div className="bg-gray-100 h-4 rounded"></div>
                      <div className="bg-gray-100 h-4 rounded w-3/4"></div>
                      <div className="bg-gray-100 h-4 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}