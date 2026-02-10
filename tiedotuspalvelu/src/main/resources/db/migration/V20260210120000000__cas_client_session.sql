CREATE TABLE cas_client_session (
    mapping_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE
);
