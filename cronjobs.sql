-- Clean up soft-deleted members older than 30 days
SELECT cron.schedule(
    'delete_soft_deleted_members',
    '0 1 * * *',  -- 1:00 AM daily
    $$
        DELETE FROM core_member
        WHERE deleted_at IS NOT NULL
          AND deleted_at < NOW() - INTERVAL '30 days';
    $$
);

-- Delete expired gifts flagged for deletion
SELECT cron.schedule(
    'delete_expired_gifts',
    '30 1 * * *',  -- 1:30 AM daily
    $$
        DELETE FROM tenant_gift
        WHERE expires_delete = TRUE
          AND expires_at IS NOT NULL
          AND expires_at < NOW()::date;
    $$
);

SELECT cron.schedule(
    'activate_authorization',
    '0 2 * * *',  -- 2:00 AM daily
    $$
    -- Step 1: Activate authorization(s) starting today
    UPDATE core_authorization
    SET active = TRUE
    WHERE start_date = NOW()::date
        AND active = FALSE;

    -- Step 2: Deactivate all other authorizations for the same members
    UPDATE core_authorization AS a
    SET active = FALSE
    FROM (
        SELECT member_id, id
        FROM core_authorization
        WHERE start_date = NOW()::date
    ) AS active_today
    WHERE a.member_id = active_today.member_id
        AND a.id <> active_today.id
        AND a.active = TRUE;
    $$
);