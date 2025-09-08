-- Safe init for PostgreSQL (idempotent-ish when mounted on fresh volume)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- CREATE EXTENSION IF NOT EXISTS timescaledb; -- enable if available
