-- This function is to insert the default appliances for EVERY new user
create or replace function create_default_appliances()
returns trigger as $$
begin
insert into appliances (user_id, name, timer) values
(new.id, 'Washing Machines', 0),
(new.id, 'Dryer', 7200),
(new.id, 'Air Fryer', 0),
(new.id, 'Gas Stove', 0);
return new;
end;
$$ language plpgsql;

-- This trigger fires on every user creation
create trigger on_user_created
after insert on auth.users
for each row execute function create_default_appliances();