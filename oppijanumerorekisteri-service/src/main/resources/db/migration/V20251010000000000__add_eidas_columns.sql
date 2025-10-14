ALTER TABLE henkilo ADD COLUMN yksiloityeidas bool default false;
ALTER TABLE henkilo_aud ADD COLUMN yksiloityeidas bool default false;
ALTER TABLE henkilo ADD CONSTRAINT henkilo_yksiloityeidas_exclusive_check
    CHECK (NOT (yksiloityeidas AND (yksiloity or yksiloityvtj)));
ALTER TABLE henkilo ADD CONSTRAINT henkilo_yksiloityeidas_ei_hetua_check
    CHECK (NOT (yksiloityeidas AND hetu IS NOT NULL));
CREATE INDEX henkilo_yksiloityeidas_idx ON henkilo USING btree (yksiloityeidas);