-- Allow lead_events to store non-lead events (e.g. weekly_summary)
-- lead_id must be nullable for user-level events

alter table public.lead_events alter column lead_id drop not null;

-- Expand event_type check constraint to include weekly_summary
alter table public.lead_events drop constraint if exists lead_events_event_type_check;
alter table public.lead_events add constraint lead_events_event_type_check
  check (event_type in (
    'created', 'called', 'texted', 'emailed',
    'replied', 'snoozed', 'won', 'lost', 'nagged',
    'weekly_summary'
  ));
