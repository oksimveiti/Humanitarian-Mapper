CREATE TABLE instance_settings (
    id             BIGINT       PRIMARY KEY,
    map_visibility VARCHAR(32)  NOT NULL DEFAULT 'ALL',
    configured     BOOLEAN      NOT NULL DEFAULT false,
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Single settings row; defaults to showing all activities until the coordinator sets it.
INSERT INTO instance_settings (id, map_visibility, configured) VALUES (1, 'ALL', false);
