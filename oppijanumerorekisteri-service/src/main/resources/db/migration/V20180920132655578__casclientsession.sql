create table cas_client_session (
    mapping_id text primary key,
    session_id text not null unique
);
