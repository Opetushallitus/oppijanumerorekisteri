ALTER TABLE suomifi_viesti
    ADD COLUMN message_type TEXT NOT NULL DEFAULT 'electronic'
        CHECK (message_type IN ('electronic', 'paperMail'));

ALTER TABLE suomifi_viesti
    ALTER COLUMN message_type DROP DEFAULT;
