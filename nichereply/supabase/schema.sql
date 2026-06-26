create extension if not exists "pgcrypto";

create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'owner' check (role in ('owner','admin','agent')),
  created_at  timestamptz not null default now()
);

create table public.businesses (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  owner_id          uuid not null references public.users(id),
  niche             text not null,
  phone_number_id   text,
  waba_id           text,
  timezone          text not null default 'Africa/Kampala',
  config_overrides  jsonb not null default '{}',
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

create table public.contacts (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  wa_id           text not null,
  name            text,
  tags            text[] not null default '{}',
  lead_score      integer not null default 0,
  lead_status     text not null default 'new' check (lead_status in ('new','warm','hot','cold','converted')),
  custom_fields   jsonb not null default '{}',
  first_seen_at   timestamptz not null default now(),
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),
  unique(business_id, wa_id)
);

create table public.conversations (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,
  contact_id        uuid not null references public.contacts(id) on delete cascade,
  status            text not null default 'active' check (status in ('active','waiting','resolved','handed_off')),
  current_flow      text,
  flow_state        jsonb not null default '{}',
  session_expires_at timestamptz,
  is_24h_window_open boolean not null default false,
  last_message_at   timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  business_id     uuid not null references public.businesses(id) on delete cascade,
  direction       text not null check (direction in ('inbound','outbound')),
  message_type    text not null default 'text' check (message_type in ('text','template','image','interactive','button')),
  content         text,
  template_name   text,
  wa_message_id   text,
  status          text not null default 'sent' check (status in ('sent','delivered','read','failed')),
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create table public.leads (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  contact_id      uuid not null references public.contacts(id) on delete cascade,
  conversation_id uuid references public.conversations(id),
  source          text not null default 'whatsapp',
  status          text not null default 'new' check (status in ('new','contacted','qualified','converted','lost')),
  score           integer not null default 0,
  collected_data  jsonb not null default '{}',
  notes           text,
  assigned_to     uuid references public.users(id),
  created_at      timestamptz not null default now()
);

create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  contact_id      uuid not null references public.contacts(id) on delete cascade,
  lead_id         uuid references public.leads(id),
  service         text,
  date            date,
  time            time,
  status          text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  reminder_sent   boolean not null default false,
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create table public.reminders (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  contact_id      uuid references public.contacts(id),
  conversation_id uuid references public.conversations(id),
  booking_id      uuid references public.bookings(id),
  type            text not null check (type in ('booking_reminder','follow_up','re_engagement')),
  scheduled_for   timestamptz not null,
  message_template text,
  template_params  jsonb not null default '{}',
  status          text not null default 'pending' check (status in ('pending','sent','failed','cancelled')),
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);

create table public.templates (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  name            text not null,
  category        text check (category in ('marketing','utility','authentication')),
  language        text not null default 'en',
  status          text not null default 'approved' check (status in ('approved','pending','rejected')),
  body            text,
  namespace       text,
  created_at      timestamptz not null default now()
);

create table public.handoff_requests (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  contact_id      uuid not null references public.contacts(id) on delete cascade,
  reason          text,
  requested_by    text not null default 'bot' check (requested_by in ('bot','contact')),
  status          text not null default 'pending' check (status in ('pending','accepted','resolved')),
  assigned_to     uuid references public.users(id),
  notes           text,
  created_at      timestamptz not null default now()
);

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_type  text not null,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index idx_contacts_business      on public.contacts(business_id);
create index idx_contacts_wa_id         on public.contacts(business_id, wa_id);
create index idx_conversations_business on public.conversations(business_id);
create index idx_conversations_contact   on public.conversations(contact_id);
create index idx_messages_conversation   on public.messages(conversation_id);
create index idx_leads_business          on public.leads(business_id);
create index idx_bookings_business       on public.bookings(business_id);
create index idx_reminders_pending       on public.reminders(status, scheduled_for) where status = 'pending';
create index idx_events_business_time    on public.events(business_id, created_at desc);
create index idx_events_type             on public.events(event_type);

alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.contacts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.leads enable row level security;
alter table public.bookings enable row level security;
alter table public.reminders enable row level security;
alter table public.handoff_requests enable row level security;

create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can view their businesses"
  on public.businesses for select using (auth.uid() = owner_id);

create policy "Business owners can insert"
  on public.businesses for insert with check (auth.uid() = owner_id);
