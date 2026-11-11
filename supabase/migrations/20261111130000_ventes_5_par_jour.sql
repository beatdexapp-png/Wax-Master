-- Bourse : retour à 5 ventes par jour sans Pro (demande d'Alexi, 11/11). Retour arrière : relancer le bloc 38 du lot 5.
do $$ declare d text;
begin
  d := pg_get_functiondef('public.eco_base(text,jsonb)'::regprocedure);
  if strpos(d, '''bsell'')::int, 0) >= 10 then raise exception ''10 ventes') > 0 then
    execute replace(d, '''bsell'')::int, 0) >= 10 then raise exception ''10 ventes', '''bsell'')::int, 0) >= 5 then raise exception ''5 ventes');
  elsif strpos(d, '''bsell'')::int, 0) >= 5 then raise exception ''5 ventes') = 0 then
    raise exception 'Limite de ventes introuvable dans eco_base';
  end if;
  d := pg_get_functiondef('public.bourse_list(text,text,integer)'::regprocedure);
  if strpos(d, '''sells'', 10 -') > 0 then execute replace(d, '''sells'', 10 -', '''sells'', 5 -');
  elsif strpos(d, '''sells'', 5 -') = 0 then raise exception 'Limite de ventes introuvable dans bourse_list'; end if;
end $$;
