-- Create app schema and extensions
CREATE SCHEMA IF NOT EXISTS app;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: ensure time zone
SET TIME ZONE 'UTC';

