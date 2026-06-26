import { z } from 'zod';

export const NicheConfigSchema = z.object({
  niche: z.string(),
  version: z.string(),
  displayName: z.string(),
  description: z.string(),

  tone: z.object({
    voice: z.string(),
    formality: z.enum(['casual', 'professional', 'friendly']),
    language: z.string().default('en'),
  }),

  welcome: z.object({
    message: z.string().min(10),
    quickReplies: z.array(z.string()).max(4).default([]),
    autoTag: z.string().optional(),
  }),

  faqs: z
    .array(
      z.object({
        id: z.string(),
        keywords: z.array(z.string()).min(1),
        question: z.string(),
        answer: z.string(),
        followUpOptions: z.array(z.string()).optional(),
      })
    )
    .min(5)
    .max(30),

  leadQualification: z.object({
    enabled: z.boolean(),
    minimumScore: z.number().min(0).max(100).default(50),
    questions: z.array(
      z.object({
        id: z.string(),
        field: z.string(),
        question: z.string(),
        type: z.enum(['text', 'select', 'date', 'phone', 'email', 'number']),
        options: z.array(z.string()).optional(),
        required: z.boolean().default(true),
      })
    ),
  }),

  booking: z.object({
    enabled: z.boolean(),
    type: z.enum(['appointment', 'order', 'inquiry']),
    fields: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(['text', 'date', 'time', 'select', 'number', 'phone', 'email']),
        options: z.array(z.string()).optional(),
        required: z.boolean().default(true),
      })
    ),
    confirmationTemplate: z.string(),
  }),

  pricing: z.object({
    enabled: z.boolean(),
    triggerKeywords: z.array(z.string()).default([]),
    response: z.string(),
    askForContact: z.boolean().default(false),
  }),

  handoff: z.object({
    enabled: z.boolean(),
    triggers: z.array(
      z.object({
        id: z.string(),
        triggerType: z.enum(['keyword', 'low_confidence', 'high_value', 'contact_request']),
        condition: z.string(),
        description: z.string(),
        message: z.string(),
      })
    ),
    fallbackMessage: z.string(),
    urgencyKeywords: z.array(z.string()).default([]),
  }),

  reminders: z.object({
    enabled: z.boolean(),
    rules: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['booking_reminder', 'follow_up', 're_engagement']),
        delay: z.string(),
        template: z.string(),
      })
    ),
  }),

  crm: z.object({
    tags: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        autoAssign: z.string().optional(),
      })
    ),
    leadStages: z.array(z.string()),
  }),

  metrics: z.object({
    kpis: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        type: z.enum(['count', 'rate', 'duration']),
      })
    ),
  }),

  templates: z.object({
    welcome: z.string(),
    booking_confirmation: z.string(),
    reminder: z.string(),
    handoff_notification: z.string(),
    fallback: z.string(),
  }),

  fallback: z.object({
    unknownMessage: z.string(),
    errorMessage: z.string(),
    maxRetries: z.number().default(3),
  }),
});

export type NicheConfig = z.infer<typeof NicheConfigSchema>;

export function validateNicheConfig(data: unknown): NicheConfig {
  const result = NicheConfigSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.flatten();
    const fieldList = Object.entries(errors.fieldErrors)
      .map(([field, msgs]) => `  ${field}: ${msgs.join(', ')}`)
      .join('\n');
    throw new Error(`Niche config validation failed:\n${fieldList}`);
  }
  return result.data;
}
