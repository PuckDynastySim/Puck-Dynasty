create or replace view user_profiles as
  select 
    id,
    email,
    raw_user_meta_data->>'name' as display_name
  from auth.users;
