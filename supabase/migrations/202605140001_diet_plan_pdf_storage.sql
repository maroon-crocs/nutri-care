insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'diet-plan-pdfs',
  'diet-plan-pdfs',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.diet_plans
add column if not exists pdf_path text;

drop policy if exists "diet_plan_pdfs_select_own" on storage.objects;
create policy "diet_plan_pdfs_select_own"
on storage.objects for select
using (
  bucket_id = 'diet-plan-pdfs'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "diet_plan_pdfs_insert_own" on storage.objects;
create policy "diet_plan_pdfs_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'diet-plan-pdfs'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "diet_plan_pdfs_update_own" on storage.objects;
create policy "diet_plan_pdfs_update_own"
on storage.objects for update
using (
  bucket_id = 'diet-plan-pdfs'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'diet-plan-pdfs'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "diet_plan_pdfs_delete_own" on storage.objects;
create policy "diet_plan_pdfs_delete_own"
on storage.objects for delete
using (
  bucket_id = 'diet-plan-pdfs'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);
