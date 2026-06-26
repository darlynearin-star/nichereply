import type { NicheConfig } from '@/lib/config/validator';
import type { IntentResult } from '@/lib/types';

const GREETING_PATTERNS = [
  /^(hi|hello|hey|good\s*(morning|afternoon|evening)|yo|sup|howdy|greetings)\b/i,
  /^(morning|afternoon|evening)[!.]?$/i,
];

const BOOKING_KEYWORDS = [
  'book', 'appointment', 'schedule', 'reserve', 'order',
  'booking', 'scheduling', 'reservation',
];

export class IntentDetector {
  constructor(private config: NicheConfig) {}

  detect(text: string): IntentResult {
    const lower = text.toLowerCase().trim();
    if (!lower) return { type: 'unknown', confidence: 0 };

    if (this.isGreeting(lower)) {
      return { type: 'greeting', confidence: 1 };
    }

    const faqMatch = this.matchFAQ(lower);
    if (faqMatch) return faqMatch;

    if (this.isUrgent(lower)) {
      return { type: 'urgent', confidence: 0.9 };
    }

    if (this.isBooking(lower)) {
      return { type: 'booking', confidence: 0.8 };
    }

    if (this.isPricing(lower)) {
      return { type: 'pricing', confidence: 0.8 };
    }

    if (this.isHandoffRequest(lower)) {
      return { type: 'urgent', confidence: 0.95 };
    }

    return { type: 'unknown', confidence: 0.2 };
  }

  private isGreeting(text: string): boolean {
    return GREETING_PATTERNS.some((p) => p.test(text));
  }

  private matchFAQ(text: string): IntentResult | null {
    let bestMatch: { faqId: string; score: number } | null = null;

    for (const faq of this.config.faqs) {
      const matchCount = faq.keywords.filter((kw) => text.includes(kw.toLowerCase())).length;
      if (matchCount > 0) {
        const score = matchCount / faq.keywords.length;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { faqId: faq.id, score };
        }
      }
    }

    if (bestMatch && bestMatch.score >= 0.3) {
      return { type: 'faq', confidence: Math.min(0.9, bestMatch.score + 0.5), faqId: bestMatch.faqId };
    }

    return null;
  }

  private isBooking(text: string): boolean {
    if (!this.config.booking.enabled) return false;
    return BOOKING_KEYWORDS.some((kw) => text.includes(kw));
  }

  private isPricing(text: string): boolean {
    if (!this.config.pricing.enabled) return false;
    return this.config.pricing.triggerKeywords.some((kw) => text.includes(kw));
  }

  private isUrgent(text: string): boolean {
    return this.config.handoff.urgencyKeywords.some((kw) => text.includes(kw));
  }

  private isHandoffRequest(text: string): boolean {
    const handoffWords = ['agent', 'human', 'manager', 'speak to', 'talk to', 'person', 'real person'];
    return handoffWords.some((w) => text.includes(w));
  }
}
