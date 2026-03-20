alter table public.use_cases
add column if not exists rating integer;

alter table public.use_cases
drop constraint if exists use_cases_rating_check;

alter table public.use_cases
add constraint use_cases_rating_check
check (rating is null or rating between 1 and 5);
