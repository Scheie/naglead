-- Read timezone and country from signup metadata so device locale is respected
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, trade, timezone, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'trade',
    coalesce(new.raw_user_meta_data->>'timezone', 'America/New_York'),
    coalesce(new.raw_user_meta_data->>'country', 'US')
  );
  return new;
end;
$$ language plpgsql security definer;
