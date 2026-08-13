-- Allow chapter membership applications to be stored in the shared submissions table.

alter table public.form_submissions
  drop constraint if exists form_submissions_form_type_check;

alter table public.form_submissions
  add constraint form_submissions_form_type_check
  check (form_type in (
    'volunteer',
    'speaker',
    'mentor',
    'partnership',
    'sponsor',
    'chapter_lead',
    'ambassador',
    'contact',
    'chapter_member'
  ));
