export interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'owner' | 'admin' | 'agent';
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  niche: string;
  phone_number_id: string | null;
  waba_id: string | null;
  timezone: string;
  config_overrides: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  business_id: string;
  wa_id: string;
  name: string | null;
  tags: string[];
  lead_score: number;
  lead_status: 'new' | 'warm' | 'hot' | 'cold' | 'converted';
  custom_fields: Record<string, unknown>;
  first_seen_at: string;
  last_message_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  business_id: string;
  contact_id: string;
  status: 'active' | 'waiting' | 'resolved' | 'handed_off';
  current_flow: string | null;
  flow_state: FlowState;
  session_expires_at: string | null;
  is_24h_window_open: boolean;
  last_message_at: string;
  created_at: string;
}

export interface FlowState {
  step?: number;
  currentField?: string;
  collected?: Record<string, string>;
  errors?: string[];
  retries?: number;
  lastFaqId?: string;
  flow?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  business_id: string;
  direction: 'inbound' | 'outbound';
  message_type: 'text' | 'template' | 'image' | 'interactive' | 'button';
  content: string | null;
  template_name: string | null;
  wa_message_id: string | null;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Lead {
  id: string;
  business_id: string;
  contact_id: string;
  conversation_id: string | null;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  score: number;
  collected_data: Record<string, unknown>;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  business_id: string;
  contact_id: string;
  lead_id: string | null;
  service: string | null;
  date: string | null;
  time: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reminder_sent: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Reminder {
  id: string;
  business_id: string;
  contact_id: string | null;
  conversation_id: string | null;
  booking_id: string | null;
  type: 'booking_reminder' | 'follow_up' | 're_engagement';
  scheduled_for: string;
  message_template: string | null;
  template_params: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sent_at: string | null;
  created_at: string;
}

export interface HandoffRequest {
  id: string;
  business_id: string;
  conversation_id: string;
  contact_id: string;
  reason: string | null;
  requested_by: 'bot' | 'contact';
  status: 'pending' | 'accepted' | 'resolved';
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  business_id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type IntentType = 'greeting' | 'faq' | 'booking' | 'pricing' | 'urgent' | 'unknown';

export interface IntentResult {
  type: IntentType;
  confidence: number;
  faqId?: string;
}

export interface FlowResult {
  response: string | null;
  action: 'send' | 'handoff' | 'wait' | 'end';
  intent: IntentType;
  state: FlowState;
  booking?: { service: string };
  handoff?: boolean;
}

export interface InboundMessage {
  businessPhoneNumberId: string;
  waId: string;
  waMessageId: string;
  type: string;
  text: string | null;
  timestamp: string;
}

export interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}
