import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

// Security-focused validation schemas
export const secureEmailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please provide a valid email address')
  .max(254, 'Email is too long')
  .refine((email) => {
    // Additional security checks
    const normalizedEmail = email.toLowerCase();
    
    // Block obvious test/disposable email patterns
    const disposablePatterns = [
      /^test@/,
      /temp[0-9]/,
      /disposable/,
      /throwaway/
    ];
    
    return !disposablePatterns.some(pattern => pattern.test(normalizedEmail));
  }, 'Please use a valid business email address');

export const securePasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .refine((password) => {
    // Check for common weak passwords
    const weakPasswords = [
      'password', 'password123', '123456', 'qwerty', 
      'admin', 'root', 'guest', 'user', 'test'
    ];
    return !weakPasswords.includes(password.toLowerCase());
  }, 'Password is too common, please choose a stronger password')
  .refine((password) => {
    // Require at least one letter and one number
    return /(?=.*[a-zA-Z])(?=.*[0-9])/.test(password);
  }, 'Password must contain at least one letter and one number');

export const secureNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .refine((name) => {
    // Only allow letters, spaces, hyphens, and apostrophes
    return /^[a-zA-Z\s\-']+$/.test(name);
  }, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform((name) => name.trim());

export const securePhoneSchema = z
  .string()
  .optional()
  .refine((phone) => {
    if (!phone) return true;
    // Allow international phone formats
    return /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/.test(phone);
  }, 'Please provide a valid phone number')
  .transform((phone) => {
    if (!phone) return phone;
    // Sanitize phone number
    return phone.replace(/[^0-9+\-\s\(\)]/g, '');
  });

export const secureSubdomainSchema = z
  .string()
  .min(3, 'Subdomain must be at least 3 characters')
  .max(63, 'Subdomain is too long')
  .refine((subdomain) => {
    // Only alphanumeric and hyphens, can't start or end with hyphen
    return /^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?$/.test(subdomain);
  }, 'Subdomain can only contain letters, numbers, and hyphens')
  .transform((subdomain) => subdomain.toLowerCase());

export const secureTextSchema = z
  .string()
  .max(1000, 'Text is too long')
  .transform((text) => {
    // Basic XSS prevention - strip dangerous characters
    return text.replace(/[<>"/]/g, '').trim();
  });

// Validation helper functions
export function validateAndSanitizeInput<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  fieldName: string
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || `Invalid ${fieldName}`;
      toast({
        title: "Validation Error",
        description: message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Validation Error", 
        description: `Invalid ${fieldName} provided`,
        variant: "destructive"
      });
    }
    return null;
  }
}

// Security monitoring helpers
export function logSecurityEvent(eventType: string, details: Record<string, any> = {}) {
  console.warn(`SECURITY_EVENT: ${eventType}`, {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details
  });
}

export function detectSuspiciousInput(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /expression\s*\(/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

export function sanitizeForDisplay(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}