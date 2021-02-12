ALTER TABLE henkilo_huoltaja_suhde ADD COLUMN alkupvm DATE;
ALTER TABLE henkilo_huoltaja_suhde_aud ADD COLUMN alkupvm DATE;
ALTER TABLE henkilo_huoltaja_suhde ADD COLUMN loppupvm DATE;
ALTER TABLE henkilo_huoltaja_suhde_aud ADD COLUMN loppupvm DATE;

-- asetetaan not null constraintit vasta, kun populoitu puuttuva data
