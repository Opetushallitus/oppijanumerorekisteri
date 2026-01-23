CREATE OR REPLACE FUNCTION update_updated_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated = current_timestamp;
    RETURN NEW;
END;
$$ language 'plpgsql';

ALTER TABLE tiedote
    ADD COLUMN notification_sent BOOLEAN                  NOT NULL DEFAULT FALSE,
    ADD COLUMN created           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    ADD COLUMN updated           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp;

CREATE TRIGGER update_tiedote_updated
    BEFORE UPDATE
    ON tiedote
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_column();
