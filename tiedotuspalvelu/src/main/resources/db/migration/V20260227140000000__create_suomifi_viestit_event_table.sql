CREATE TABLE suomifi_viestit_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type TEXT NOT NULL,
    message_id TEXT NOT NULL,
    metadata JSONB NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suomifi_viestit_event_message_id ON suomifi_viestit_event (message_id);

CREATE TABLE suomifi_viestit_events_cursor (
    id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE),
    continuation_token TEXT NOT NULL
);
