-- =========================================================
-- PULSE — Accepter / refuser une demande de bénévole
--
-- Problème corrigé : l'app modifiait directement la demande et le
-- profil du bénévole. Les règles de sécurité (RLS) de Supabase
-- bloquaient ces modifications SANS renvoyer d'erreur : l'app affichait
-- « Demande traitée avec succès » mais rien ne changeait.
--
-- Cette fonction fait les deux modifications côté serveur, après avoir
-- vérifié que l'utilisateur connecté est bien le compte association
-- qui a reçu la demande.
--
-- À exécuter une seule fois dans Supabase :
-- Dashboard > SQL Editor > New query > coller ce script > Run.
-- =========================================================

create or replace function public.respond_my_association_join_request(
  p_request_id public.association_join_requests.id%type,
  p_decision text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller public.profiles%rowtype;
  v_request public.association_join_requests%rowtype;
begin
  if p_decision is null or p_decision not in ('acceptee', 'refusee') then
    raise exception 'Décision invalide.';
  end if;

  select * into v_caller
  from public.profiles
  where id = auth.uid();

  if not found
     or v_caller.role::text <> 'association'
     or v_caller.association_id is null then
    raise exception 'Seul un compte association peut traiter les demandes.';
  end if;

  select * into v_request
  from public.association_join_requests
  where id = p_request_id
  for update;

  if not found
     or v_request.association_id is distinct from v_caller.association_id then
    raise exception 'Demande introuvable pour ton association.';
  end if;

  if v_request.statut::text <> 'en_attente' then
    raise exception 'Cette demande a déjà été traitée.';
  end if;

  -- %L : la valeur est convertie dans le type de la colonne
  -- (texte ou type énuméré), quel qu'il soit.
  execute format(
    'update public.association_join_requests
        set statut = %L, updated_at = now()
      where id = $1',
    p_decision
  )
  using p_request_id;

  if p_decision = 'acceptee' then
    update public.profiles
       set role = 'benevole',
           association_id = v_request.association_id,
           statut_compte = 'actif',
           updated_at = now()
     where id = v_request.benevole_id;

    if not found then
      raise exception 'Profil du bénévole introuvable.';
    end if;
  end if;
end;
$$;

revoke all on function public.respond_my_association_join_request(
  public.association_join_requests.id%type, text
) from public;

grant execute on function public.respond_my_association_join_request(
  public.association_join_requests.id%type, text
) to authenticated;
