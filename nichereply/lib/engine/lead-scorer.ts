import type { NicheConfig } from '@/lib/config/validator';
import type { Contact } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/admin';

const weightMap: Record<string, number> = {
  // Higher weights for niche-specific signals
  name: 5,
  phone: 10,
  email: 15,
  budget: 20,
  service_needed: 10,
  preferred_service: 10,
  intent: 15,
  is_new_patient: 5,
};

export class LeadScorer {
  constructor(private config: NicheConfig) {}

  score(contact: Contact, collected: Record<string, string>): number {
    let score = 0;

    // Points for each collected field
    for (const [field, value] of Object.entries(collected)) {
      if (value && value.length > 0) {
        score += weightMap[field] || 5;
      }
    }

    // Points for having a name
    if (contact.name || collected.name) score += 10;

    // Points for phone
    if (contact.wa_id || collected.phone) score += 15;

    // Budget-based scoring for real estate
    if (collected.budget) {
      if (collected.budget.includes('500M+') || collected.budget.includes('300M')) score += 25;
      else if (collected.budget.includes('100M')) score += 15;
      else score += 5;
    }

    // Engagement bonus
    if (contact.last_message_at) {
      const hoursSinceLast = (Date.now() - new Date(contact.last_message_at).getTime()) / 3600000;
      if (hoursSinceLast < 1) score += 10;
    }

    return Math.min(100, score);
  }

  getStatus(score: number): Contact['lead_status'] {
    if (score >= 70) return 'hot';
    if (score >= 40) return 'warm';
    if (score > 0) return 'new';
    return 'cold';
  }

  async updateLeadScore(contactId: string, score: number): Promise<void> {
    const admin = createAdminClient();
    const status = this.getStatus(score);

    await admin
      .from('contacts')
      .update({ lead_score: score, lead_status: status })
      .eq('id', contactId);
  }
}
