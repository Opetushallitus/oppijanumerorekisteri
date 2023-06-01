--
-- Fix null timestamps in tuonti table (KJHH-2232)
--
UPDATE tuonti SET aikaleima = CURRENT_TIMESTAMP WHERE aikaleima IS NULL;
ALTER TABLE tuonti ALTER COLUMN aikaleima SET NOT NULL;
