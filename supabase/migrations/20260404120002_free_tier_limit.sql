-- Enforce free tier limit (5 active leads) at database level
-- This function is called before insert on leads table
create or replace function public.check_free_tier_limit()
returns trigger as $$
declare
  user_status text;
  active_count integer;
begin
  select subscription_status into user_status
  from public.users
  where id = new.user_id;

  if user_status = 'free' then
    select count(*) into active_count
    from public.leads
    where user_id = new.user_id
      and state in ('reply_now', 'waiting');

    if active_count >= 5 then
      raise exception 'Free tier limit reached. Upgrade to Pro for unlimited leads.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger enforce_free_tier_limit
  before insert on public.leads
  for each row execute function public.check_free_tier_limit();
