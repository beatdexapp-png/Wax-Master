-- WaxDrop : correctif de 20261108233000_economie.sql, appliqué le 08/11/2026 juste après.
-- Les produits Stripe des offres 1,99 / 4,99 / 9,99 € s'appellent « 1 200 / 3 000 / 7 000 wax WaxDrop » et Stripe refuse
-- de les renommer (produits créés automatiquement avec les liens) : on garde ces montants pour ne jamais créditer moins
-- que ce qu'affiche la page de paiement. Les réduire demanderait de nouveaux liens Stripe (décision d'Alexi).
-- Coffret : 4 500 wax coins + 2 Drops Or + 10 drops (description du produit Stripe mise à jour).
do $m$
declare
  d text; i int;
  r jsonb := jsonb_build_array(
      jsonb_build_array($a$'plink_1UQDXzCpQcu4qQ3q3jcokwla' then 1100$a$, $a$'plink_1UQDXzCpQcu4qQ3q3jcokwla' then 1200$a$),
      jsonb_build_array($a$'plink_1UQDY1CpQcu4qQ3qxuy9KydQ' then 2750$a$, $a$'plink_1UQDY1CpQcu4qQ3qxuy9KydQ' then 3000$a$),
      jsonb_build_array($a$'plink_1UQDY3CpQcu4qQ3qbD7NUKQ7' then 5750$a$, $a$'plink_1UQDY3CpQcu4qQ3qbD7NUKQ7' then 7000$a$),
      jsonb_build_array($a$coins = coins + 3000, gold = gold + 2$a$, $a$coins = coins + 4500, gold = gold + 2$a$),
      jsonb_build_array($a$'coins', 3000, (o->>'amount_total')::int$a$, $a$'coins', 4500, (o->>'amount_total')::int$a$));
  y jsonb;
begin
  d := pg_get_functiondef('public.stripe_apply(jsonb)'::regprocedure);
  for y in select * from jsonb_array_elements(r) loop
    i := (length(d) - length(replace(d, y->>0, ''))) / length(y->>0);
    if i <> 1 then raise exception 'offres : % trouvé % fois', y->>0, i; end if;
    d := replace(d, y->>0, y->>1);
  end loop;
  execute d;
end $m$;
