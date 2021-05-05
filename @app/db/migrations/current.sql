-- maintain idempotency
drop table if exists app_public.tasks;
drop type if exists status;

create type status as enum (
  'TO_DO',
  'IN_PROGRESS',
  'DONE'
);

create table if not exists app_public.tasks (
  id uuid DEFAULT uuid_generate_v4 () primary key,
  title text,
  description text,
  status status,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant
  select,
  insert (title),
  update (title),

  insert (description),
  update (description),

  insert (status),
  update (status),

  insert (created_at),
  update (created_at),

  insert (updated_at),
  update (updated_at),
  delete
on app_public.tasks to :DATABASE_VISITOR;
