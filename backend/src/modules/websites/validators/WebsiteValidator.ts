import { z } from 'zod';

const themeSchema = z.object({
  primaryColor: z.string().min(3).max(7),
  secondaryColor: z.string().min(3).max(7),
  font: z.string().min(1),
  buttonStyle: z.string().min(1)
});

const sectionSchema = z.object({
  id: z.string(),
  type: z.enum(['hero', 'about', 'rooms', 'amenities', 'gallery', 'testimonials', 'location', 'contact', 'footer']),
  title: z.string(),
  visible: z.boolean().default(true),
  content: z.record(z.string()).default({})
});

export const createWebsiteSchema = z.object({
  templateId: z.string().default('modern'),
  theme: themeSchema,
  sections: z.array(sectionSchema).default([]),
  subdomain: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Subdomain must be lowercase alphanumeric and hyphens only'),
  customDomain: z.string().optional(),
  published: z.boolean().default(false)
});

export const updateWebsiteSchema = createWebsiteSchema.partial();
