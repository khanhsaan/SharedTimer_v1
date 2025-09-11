create or replace function create_default_appliances()
returns trigger
language plpgsql
security definer --  adding SECURITY DEFINER 
set search_path = public -- and setting search_path = public made the function run with the function owner’s privileges (ideally the table owner), which bypasses RLS and has the right schema, so the insert succeeds.
as $$
begin
  insert into appliances (user_id, name, timer) values
    (new.id, 'Washing Machine', 0),
    (new.id, 'Dryer', 7200),
    (new.id, 'Air Fryer', 0),
    (new.id, 'Gas Stove', 0);

update public.appliances
set modes = '{
    "Cotton":[{"label":"Cold","minutes":143},{"label":"20°C","minutes":148},{"label":"40°C","minutes":392},{"label":"60°C","minutes":350},{"label":"90°C","minutes":204}],
    "Mix":[{"label":"Cold","minutes":121},{"label":"40°C","minutes":133},{"label":"60°C","minutes":150}],
    "Synthetic":[{"label":"Cold","minutes":116},{"label":"40°C","minutes":128}],
    "Delicate":[{"label":"Cold","minutes":111},{"label":"20°C","minutes":114}],
    "Tub Clean":[{"label":"60°C","minutes":133}],
    "Spin":[{"label":"No temperature","minutes":69}],
    "Quick 15":[{"label":"Cold","minutes":70}],
    "Rinse+Spin":[{"label":"Cold","minutes":89}]
}'::jsonb
where user_id = new.id and name = 'Washing Machine';
return new;
end;
$$;

drop trigger if exists on_user_created on auth.users;

create trigger on_user_created
after insert on auth.users
for each row execute function create_default_appliances();

-- CHECK
select * from appliances;