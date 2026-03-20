alter table public.use_cases
add column if not exists impact_score integer,
add column if not exists feasibility_score integer;

alter table public.use_cases
drop constraint if exists use_cases_impact_score_check;

alter table public.use_cases
add constraint use_cases_impact_score_check
check (impact_score is null or impact_score between 1 and 5);

alter table public.use_cases
drop constraint if exists use_cases_feasibility_score_check;

alter table public.use_cases
add constraint use_cases_feasibility_score_check
check (feasibility_score is null or feasibility_score between 1 and 5);
