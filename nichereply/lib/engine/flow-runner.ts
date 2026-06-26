import type { NicheConfig } from '@/lib/config/validator';
import type { Business, Contact, Conversation, InboundMessage, FlowResult } from '@/lib/types';
import { IntentDetector } from './intent-detector';
import { StateManager } from './state-manager';
import { LeadScorer } from './lead-scorer';
import { createAdminClient } from '@/lib/supabase/admin';

export class FlowRunner {
  private detector: IntentDetector;
  private scorer: LeadScorer;

  constructor(private config: NicheConfig) {
    this.detector = new IntentDetector(config);
    this.scorer = new LeadScorer(config);
  }

  async process(
    business: Business,
    contact: Contact,
    conversation: Conversation,
    message: InboundMessage
  ): Promise<FlowResult> {
    const text = message.text?.trim() || '';
    const intent = this.detector.detect(text);
    const sm = new StateManager(conversation);

    let result: FlowResult;

    switch (intent.type) {
      case 'greeting':
        result = this.handleGreeting(sm);
        break;
      case 'faq':
        result = this.handleFAQ(intent.faqId!, sm);
        break;
      case 'booking':
        result = this.handleBooking(text, sm);
        break;
      case 'pricing':
        result = this.handlePricing(sm);
        break;
      case 'urgent':
        result = this.handleUrgent(business, contact, conversation, sm);
        break;
      default:
        result = this.handleUnknown(text, sm);
    }

    // Persist state changes
    await sm.persist();

    // Score and update lead
    const collected = sm.getCollected();
    const leadScore = this.scorer.score(contact, collected);
    await this.scorer.updateLeadScore(contact.id, leadScore);

    // Log analytics event
    await this.logEvent(business.id, 'message_processed', {
      intent: intent.type,
      confidence: intent.confidence,
      contact_id: contact.id,
      conversation_id: conversation.id,
    });

    return result;
  }

  private handleGreeting(sm: StateManager): FlowResult {
    const collected = sm.getCollected();
    const hasStarted = Object.keys(collected).length > 0;

    if (!hasStarted) {
      sm.setFlow('welcome');
      sm.setStep(0);
      const q = this.config.leadQualification.questions[0];
      if (q) sm.setCurrentField(q.id);

      return {
        response: this.config.welcome.message,
        action: 'send',
        intent: 'greeting',
        state: sm.getState(),
      };
    }

    return this.resumeFlow(sm);
  }

  private handleFAQ(faqId: string, sm: StateManager): FlowResult {
    const faq = this.config.faqs.find((f) => f.id === faqId);
    if (!faq) {
      return {
        response: this.config.fallback.unknownMessage,
        action: 'send',
        intent: 'faq',
        state: sm.getState(),
      };
    }

    sm.setFlow('faq');
    sm.setStep(0);
    sm.resetRetries();

    let response = faq.answer;
    if (faq.followUpOptions?.length) {
      response += '\n\n' + faq.followUpOptions.join(' | ');
    }

    return {
      response,
      action: 'send',
      intent: 'faq',
      state: sm.getState(),
    };
  }

  private handleBooking(text: string, sm: StateManager): FlowResult {
    if (!this.config.booking.enabled) {
      return {
        response: "I'm sorry, booking is not available at the moment. Would you like to speak with someone?",
        action: 'send',
        intent: 'unknown',
        state: sm.getState(),
      };
    }

    const collected = sm.getCollected();
    const fields = this.config.booking.fields;

    // Start booking flow if not started
    if (!sm.getState().flow || sm.getState().flow !== 'booking') {
      sm.setFlow('booking');
      sm.setStep(0);
      const firstField = fields[0];
      if (firstField) {
        sm.setCurrentField(firstField.id);
        const label = firstField.options
          ? `${firstField.label} (options: ${firstField.options.join(', ')})`
          : firstField.label;
        return {
          response: `Let's get that booked! ${label}:`,
          action: 'send',
          intent: 'booking',
          state: sm.getState(),
        };
      }
    }

    // Collect next field
    const currentStep = sm.getStep();
    const currentField = fields[currentStep];

    if (currentField && text) {
      sm.collectField(currentField.id, text);
      const nextStep = currentStep + 1;

      if (nextStep < fields.length) {
        sm.setStep(nextStep);
        const nextField = fields[nextStep];
        sm.setCurrentField(nextField.id);
        const label = nextField.options
          ? `${nextField.label} (options: ${nextField.options.join(', ')})`
          : nextField.label;
        return {
          response: `Thanks! ${label}:`,
          action: 'send',
          intent: 'booking',
          state: sm.getState(),
        };
      } else {
        sm.markComplete();
        sm.setCurrentField(undefined);

        return {
          response: `Perfect! We've received your ${this.config.booking.type} request. We'll confirm via WhatsApp shortly.`,
          action: 'send',
          intent: 'booking',
          state: sm.getState(),
          booking: { service: collected['service'] || '' },
        };
      }
    }

    return {
      response: this.config.fallback.unknownMessage,
      action: 'send',
      intent: 'booking',
      state: sm.getState(),
    };
  }

  private handlePricing(sm: StateManager): FlowResult {
    sm.setFlow('pricing');
    sm.setStep(0);
    sm.resetRetries();

    let response = this.config.pricing.response;
    if (this.config.pricing.askForContact) {
      response += '\n\nWould you like me to share more details? Just provide your name and number.';
      sm.setCurrentField('pricing_contact');
    }

    return {
      response,
      action: 'send',
      intent: 'pricing',
      state: sm.getState(),
    };
  }

  private handleUrgent(
    business: Business,
    contact: Contact,
    conversation: Conversation,
    sm: StateManager
  ): FlowResult {
    sm.setFlow('handoff');
    sm.markComplete();

    // Create handoff request
    this.createHandoffRequest(business.id, conversation.id, contact.id, 'Customer requested agent');

    return {
      response: this.config.handoff.triggers[0]?.message || this.config.handoff.fallbackMessage,
      action: 'handoff',
      intent: 'urgent',
      state: sm.getState(),
      handoff: true,
    };
  }

  private handleUnknown(text: string, sm: StateManager): FlowResult {
    sm.incrementRetries();
    const retries = sm.getRetries();

    // Check if we're mid-flow in booking or lead qualification
    if (sm.getState().flow && sm.getState().flow !== 'unknown') {
      return this.resumeFlow(sm);
    }

    if (retries >= this.config.fallback.maxRetries) {
      // Escalate to handoff after max retries
      return {
        response: this.config.handoff.fallbackMessage,
        action: 'handoff',
        intent: 'unknown',
        state: sm.getState(),
        handoff: true,
      };
    }

    sm.setFlow('unknown');

    return {
      response: this.config.fallback.unknownMessage,
      action: 'send',
      intent: 'unknown',
      state: sm.getState(),
    };
  }

  private resumeFlow(sm: StateManager): FlowResult {
    const currentFlow = sm.getState().flow;

    if (currentFlow === 'booking') {
      const text = '';
      return this.handleBooking(text, sm);
    }

    // Restart lead qualification
    const q = this.config.leadQualification.questions[0];
    if (q && !sm.getCollected()[q.field]) {
      sm.setCurrentField(q.id);
      return {
        response: q.question,
        action: 'send',
        intent: 'greeting',
        state: sm.getState(),
      };
    }

    return {
      response: this.config.fallback.unknownMessage,
      action: 'send',
      intent: 'unknown',
      state: sm.getState(),
    };
  }

  private async createHandoffRequest(
    businessId: string,
    conversationId: string,
    contactId: string,
    reason: string
  ): Promise<void> {
    const admin = createAdminClient();
    await admin.from('handoff_requests').insert({
      business_id: businessId,
      conversation_id: conversationId,
      contact_id: contactId,
      reason,
      requested_by: 'bot',
      status: 'pending',
    });

    await admin
      .from('conversations')
      .update({ status: 'handed_off', current_flow: 'handoff' })
      .eq('id', conversationId);
  }

  private async logEvent(
    businessId: string,
    eventType: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    const admin = createAdminClient();
    await admin.from('events').insert({
      business_id: businessId,
      event_type: eventType,
      entity_type: 'conversation',
      entity_id: metadata.conversation_id as string,
      metadata,
    });
  }
}
