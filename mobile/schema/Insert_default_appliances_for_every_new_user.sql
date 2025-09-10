create or replace function create_default_appliances()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into appliances (user_id, name, timer) values
    (new.id, 'Washing Machine', 0),
    (new.id, 'Dryer', 7200),
    (new.id, 'Air Fryer', 0),
    (new.id, 'Gas Stove', 0);
  return new;
end;
$$;

-- drop trigger if exists on_user_created on auth.users;

create trigger on_user_created
after insert on auth.users
for each row execute function create_default_appliances();