-- =========================================================
-- PULSE — Un bénévole quitte son association
--
-- Le bénévole n'a pas le droit de modifier lui-même son rattachement
-- (règles RLS de la table profiles). Cette fonction le fait côté
-- serveur, uniquement pour l'utilisateur connecté et uniquement s'il
-- est bénévole et rattaché à une association.
--
-- Après l'appel, le bénévole n'est plus rattaché : il retrouve la liste
-- des associations et peut demander à en rejoindre une autre.
-- L'historique des demandes de l'association n'est pas modifié.
--
-- À exécuter une seule fois dans Supabase :
-- Dashboard > SQL Editor > New query > coller ce script > Run.
-- =========================================================

create or replace function public.leave_my_association()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller public.profiles%rowtype;
begin
  select * into v_caller
  from public.profiles
  where id = auth.uid()
  for update;

  if not found or v_caller.role::text <> 'benevole' then
    raise exception 'Seul un compte bénévole peut quitter une association.';
  end if;

  if v_caller.association_id is null then
    raise exception 'Tu n’es rattaché à aucune association.';
  end if;

  update public.profiles
     set association_id = null,
         updated_at = now()
   where id = auth.uid();
end;
$$;

revoke all on function public.leave_my_association() from public;
grant execute on function public.leave_my_association() to authenticated;
