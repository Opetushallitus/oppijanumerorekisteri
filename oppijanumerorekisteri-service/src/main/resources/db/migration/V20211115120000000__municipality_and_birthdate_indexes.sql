--
-- Paging of municipality and birthdate search created for VALPAS
-- caused serious performance issues. Create couple of new indexes
-- to cope with that
--
CREATE INDEX IF NOT EXISTS henkilo_kotikunta_idx ON public.henkilo USING btree (kotikunta);
CREATE INDEX IF NOT EXISTS henkilo_syntymaaika_idx ON public.henkilo USING btree (syntymaaika);
