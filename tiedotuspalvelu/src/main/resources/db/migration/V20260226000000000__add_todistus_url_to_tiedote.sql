ALTER TABLE tiedote ADD COLUMN todistus_url TEXT;
UPDATE tiedote SET todistus_url = 'placeholder' WHERE todistus_url IS NULL;
ALTER TABLE tiedote ALTER COLUMN todistus_url SET NOT NULL;
