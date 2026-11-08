-- WaxDrop : économie (retouches du 08/11/2026 au soir, point 6). Prix en euros et liens Stripe INCHANGÉS.
-- Drop payé (réserve gratuite vide) : 100 -> 150 wax coins ; lot de 5 drops : 450 -> 675 (5 x 150, toujours -10 %).
--   Les événements qui fixent leur propre prix (Black Friday : 50) ne changent pas.
-- Offres Stripe (wax coins crédités) : 0,99 € 500 (inchangé) ; 1,99 € 1 200 -> 1 100 ; 4,99 € 3 000 -> 2 750 ; 9,99 € 7 000 -> 5 750 ;
--   Coffret 9,99 € : 5 000 -> 3 000 wax coins (+ 2 Drops Or + 10 drops, inchangés).
-- Rien n'est retiré à ceux qui ont déjà acheté : les soldes ne sont pas touchés, et un remboursement d'un achat passé
-- reprend le nombre noté dans purchases.coins au moment de l'achat (inchangé).
-- Méthode : remplacement exact de texte dans la définition actuelle, chaque texte doit exister une seule fois, sinon rien n'est fait.
do $m$
declare
  f text; d text; r text[]; i int;
  plan jsonb := jsonb_build_array(
    jsonb_build_object('f', 'public.eco_base(text,jsonb)', 'r', jsonb_build_array(
      jsonb_build_array($a$when 'std' then coalesce((ev->>'cost')::int, 100)$a$, $a$when 'std' then coalesce((ev->>'cost')::int, 150)$a$),
      jsonb_build_array($a$when 'lot5' then 450$a$, $a$when 'lot5' then 675$a$))),
    jsonb_build_object('f', 'public.stripe_apply(jsonb)', 'r', jsonb_build_array(
      jsonb_build_array($a$'plink_1UQDXzCpQcu4qQ3q3jcokwla' then 1200$a$, $a$'plink_1UQDXzCpQcu4qQ3q3jcokwla' then 1100$a$),
      jsonb_build_array($a$'plink_1UQDY1CpQcu4qQ3qxuy9KydQ' then 3000$a$, $a$'plink_1UQDY1CpQcu4qQ3qxuy9KydQ' then 2750$a$),
      jsonb_build_array($a$'plink_1UQDY3CpQcu4qQ3qbD7NUKQ7' then 7000$a$, $a$'plink_1UQDY3CpQcu4qQ3qbD7NUKQ7' then 5750$a$),
      jsonb_build_array($a$coins = coins + 5000, gold = gold + 2$a$, $a$coins = coins + 3000, gold = gold + 2$a$),
      jsonb_build_array($a$'coins', 5000, (o->>'amount_total')::int$a$, $a$'coins', 3000, (o->>'amount_total')::int$a$))));
  x jsonb; y jsonb;
begin
  for x in select * from jsonb_array_elements(plan) loop
    d := pg_get_functiondef((x->>'f')::regprocedure);
    for y in select * from jsonb_array_elements(x->'r') loop
      i := (length(d) - length(replace(d, y->>0, ''))) / length(y->>0);
      if i <> 1 then raise exception 'économie : % trouvé % fois dans %', y->>0, i, x->>'f'; end if;
      d := replace(d, y->>0, y->>1);
    end loop;
    execute d;
  end loop;
end $m$;
