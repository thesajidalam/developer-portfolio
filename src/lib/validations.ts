import { z } from 'zod'

export const PortfolioFiltersSchema = z.object({
  search: z.string().optional(),
  tech: z.string().optional(),
  category: z.string().optional(),
  experience: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'score', 'name', 'trending']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
})

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
})

export const SubmissionSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine((u) => u.startsWith('https://'), 'Only HTTPS URLs are accepted'),
  name: z.string().max(100).optional(),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  description: z.string().max(500).optional(),
  role: z.string().max(100).optional(),
})

export const UrlValidationSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine((u) => u.startsWith('https://'), 'Only HTTPS URLs are accepted'),
})

export const ComparisonSchema = z.object({
  ids: z.array(z.string().min(1)).min(2).max(5),
})

export type PortfolioFiltersInput = z.infer<typeof PortfolioFiltersSchema>
export type SubmissionInput = z.infer<typeof SubmissionSchema>
export type UrlValidationInput = z.infer<typeof UrlValidationSchema>
export type ComparisonInput = z.infer<typeof ComparisonSchema>
