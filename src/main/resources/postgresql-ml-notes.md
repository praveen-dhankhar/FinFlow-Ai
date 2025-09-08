PostgreSQL ML Readiness Notes

Window functions (example, commented for reference):

-- SELECT date_trunc('day', fd.date) AS day,
--        SUM(fd.amount) OVER (PARTITION BY fd.user_id ORDER BY date_trunc('day', fd.date)
--            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS sma_7
-- FROM financial_data fd
-- WHERE fd.user_id = :userId;

Array operations (example, commented):

-- WITH series AS (
--   SELECT ARRAY_AGG(fd.amount ORDER BY fd.date) AS amounts
--   FROM financial_data fd WHERE fd.user_id = :userId
-- )
-- SELECT unnest(amounts) FROM series;

Data types/functions:
- timestamptz for audit, date for daily series
- date_trunc(), generate_series(), width_bucket(), percentile_cont()
- Extensions worth considering: timescaledb (if available), pg_stat_statements for perf


