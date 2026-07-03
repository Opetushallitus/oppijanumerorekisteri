CREATE INDEX CONCURRENTLY IF NOT EXISTS henkilo_aud_rev_idx
    ON henkilo_aud (rev);

CREATE INDEX CONCURRENTLY IF NOT EXISTS henkilo_huoltaja_suhde_aud_rev_idx
    ON henkilo_huoltaja_suhde_aud (rev);