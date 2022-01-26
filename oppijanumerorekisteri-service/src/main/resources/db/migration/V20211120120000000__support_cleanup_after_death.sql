--
-- Placeholder for holding death cleanup state
--
ALTER TABLE henkilo ADD COLUMN kuolinsiivous VARCHAR(255);
ALTER TABLE henkilo_aud ADD COLUMN kuolinsiivous VARCHAR(255);
