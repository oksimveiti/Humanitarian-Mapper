ALTER TABLE activity
    ADD COLUMN review_status VARCHAR(32) NOT NULL DEFAULT 'DRAFT';

-- Existing activities predate the review workflow -> treat them as already approved.
UPDATE activity SET review_status = 'APPROVED';
