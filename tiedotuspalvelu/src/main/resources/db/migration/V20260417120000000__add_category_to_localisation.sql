ALTER TABLE localisation ADD COLUMN category TEXT NOT NULL DEFAULT 'omat-viestit';
ALTER TABLE localisation ALTER COLUMN category DROP DEFAULT;
ALTER TABLE localisation DROP CONSTRAINT localisation_pkey;
ALTER TABLE localisation ADD PRIMARY KEY (key, locale, category);
