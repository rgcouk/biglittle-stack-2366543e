import React from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  schema?: object;
  noIndex?: boolean;
}

export function SEOHead({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = '/og-default.jpg',
  ogType = 'website',
  schema,
  noIndex = false
}: SEOHeadProps) {
  const fullTitle = title.includes('SecureStore') ? title : `${title} | SecureStore`;
  
  React.useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    if (noIndex) updateMetaTag('robots', 'noindex, nofollow');
    
    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', 'SecureStore', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    
    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }
    
    // Structured data
    if (schema) {
      let schemaScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    }
  }, [fullTitle, description, keywords, canonicalUrl, ogImage, ogType, schema, noIndex]);
  
  return null; // This component doesn't render anything
}

// Pre-built schemas for common pages
export const facilitySchema = (facility: {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  description?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "SelfStorage",
  "name": facility.name,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": facility.address
  },
  "telephone": facility.phone,
  "email": facility.email,
  "description": facility.description,
  "openingHours": "Mo-Su 06:00-22:00",
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "24/7 Access" },
    { "@type": "LocationFeatureSpecification", "name": "CCTV Security" },
    { "@type": "LocationFeatureSpecification", "name": "Climate Control Available" }
  ]
});

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SecureStore",
  "description": "Professional self-storage facility management platform",
  "url": "https://securestore.com",
  "logo": "https://securestore.com/logo.png",
  "sameAs": [
    "https://twitter.com/securestore",
    "https://linkedin.com/company/securestore"
  ]
};