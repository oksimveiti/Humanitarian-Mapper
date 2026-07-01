ALTER TABLE instance_settings
    ADD COLUMN public_share_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN public_share_token   VARCHAR(64);
