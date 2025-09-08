# Performance Guide

## Baselines
- H2: fast functional checks; not production-accurate
- PostgreSQL: measure realistic latencies and throughput

## Profiling
- Use Java Flight Recorder, async-profiler
- Micrometer timers around critical queries

## DB Tuning
- HikariCP pool sizes per CPU and workload
- PostgreSQL: `shared_buffers`, `work_mem`, indexes, VACUUM/ANALYZE

## Load Testing
- Run against prod compose stack; capture metrics from exporter
