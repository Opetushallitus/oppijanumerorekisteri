CREATE INDEX IF NOT EXISTS henkilo_kutsumanimi_lower_idx ON public.henkilo USING btree (lower((kutsumanimi)::text) text_pattern_ops);
CREATE INDEX IF NOT EXISTS henkilo_etunimet_lower_idx ON public.henkilo USING btree (lower((etunimet)::text) text_pattern_ops);
CREATE INDEX IF NOT EXISTS henkilo_sukunimi_lower_idx ON public.henkilo USING btree (lower((sukunimi)::text) text_pattern_ops);
