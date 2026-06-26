import type { Conversation, FlowState } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/admin';

export class StateManager {
  private state: FlowState;

  constructor(private conversation: Conversation) {
    this.state = { ...conversation.flow_state };
  }

  getState(): FlowState {
    return { ...this.state };
  }

  getCollected(): Record<string, string> {
    return { ...this.state.collected };
  }

  getCurrentField(): string | undefined {
    return this.state.currentField;
  }

  getStep(): number {
    return this.state.step ?? 0;
  }

  getRetries(): number {
    return this.state.retries ?? 0;
  }

  setFlow(flow: string): void {
    this.state.flow = flow;
    this.state.step = 0;
  }

  setStep(step: number): void {
    this.state.step = step;
  }

  setCurrentField(field: string | undefined): void {
    this.state.currentField = field;
  }

  collectField(field: string, value: string): void {
    if (!this.state.collected) this.state.collected = {};
    this.state.collected[field] = value;
    this.state.currentField = undefined;
  }

  incrementRetries(): void {
    this.state.retries = (this.state.retries ?? 0) + 1;
  }

  resetRetries(): void {
    this.state.retries = 0;
  }

  setError(error: string): void {
    if (!this.state.errors) this.state.errors = [];
    this.state.errors.push(error);
  }

  isComplete(): boolean {
    return this.state.step !== undefined && this.state.step < 0;
  }

  markComplete(): void {
    this.state.step = -1;
  }

  async persist(): Promise<void> {
    const admin = createAdminClient();
    await admin
      .from('conversations')
      .update({
        flow_state: this.state,
        current_flow: this.state.flow ?? null,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', this.conversation.id);
  }

  static async load(conversationId: string): Promise<StateManager> {
    const admin = createAdminClient();
    const { data } = await admin
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (!data) throw new Error(`Conversation not found: ${conversationId}`);
    return new StateManager(data as Conversation);
  }
}
