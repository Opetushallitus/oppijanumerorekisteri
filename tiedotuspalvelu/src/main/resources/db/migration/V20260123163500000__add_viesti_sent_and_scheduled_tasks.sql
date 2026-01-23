ALTER TABLE tiedote
    ADD COLUMN suomi_fi_viesti_sent BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE scheduled_tasks
(
    task_name            text                     not null,
    task_instance        text                     not null,
    task_data            bytea,
    execution_time       timestamp with time zone not null,
    picked               boolean                  not null,
    picked_by            text,
    last_success         timestamp with time zone,
    last_failure         timestamp with time zone,
    consecutive_failures integer,
    priority             integer,
    last_heartbeat       timestamp with time zone,
    version              bigint                   not null,
    PRIMARY KEY (task_name, task_instance)
);

CREATE INDEX idx_scheduled_tasks_execution_time ON scheduled_tasks (execution_time);
