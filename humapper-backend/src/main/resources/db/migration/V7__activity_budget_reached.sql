ALTER TABLE activity
    ADD COLUMN budget         NUMERIC(15, 2),
    ADD COLUMN currency       VARCHAR(3),
    ADD COLUMN reached_people INTEGER;
