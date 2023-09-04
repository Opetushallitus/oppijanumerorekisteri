ALTER TABLE public.vtj_muutostieto
ADD CONSTRAINT vtj_muutostieto_pkey PRIMARY KEY (id),
ADD COLUMN processed timestamp without time zone default null,
ADD COLUMN error boolean default false;

CREATE INDEX vtj_muutostieto_henkilotunnus_idx ON public.vtj_muutostieto (henkilotunnus);
CREATE INDEX vtj_muutostieto_muutospv_idx ON public.vtj_muutostieto (muutospv);
CREATE INDEX vtj_muutostieto_processed_idx ON public.vtj_muutostieto (processed);
CREATE INDEX vtj_muutostieto_error_idx ON public.vtj_muutostieto (error);

ALTER TABLE public.vtj_muutostieto_kirjausavain
ADD CONSTRAINT vtj_muutostieto_kirjausavain_pkey PRIMARY KEY (id);
