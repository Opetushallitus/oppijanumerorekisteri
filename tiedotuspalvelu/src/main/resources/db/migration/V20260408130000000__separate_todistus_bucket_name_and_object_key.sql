ALTER TABLE tiedote ADD COLUMN todistusbucketname text;
ALTER TABLE tiedote ADD COLUMN todistusobjectkey text;
ALTER TABLE tiedote ALTER COLUMN todistus_url DROP NOT NULL;
