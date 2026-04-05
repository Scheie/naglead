-- Add country code to users for currency/phone localization
alter table public.users add column if not exists country text default 'US';
