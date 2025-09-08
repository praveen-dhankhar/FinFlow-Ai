# API Documentation

OpenAPI is available via Swagger UI at `/swagger-ui/index.html`.

## Performance Notes
- H2: low overhead; not indicative of production latency
- PostgreSQL: indexes and query plans impact latency; monitor slow queries

## Database-specific Features
- PostgreSQL JSON fields and full-text search (if used)

## Rate Limiting
- Configure via gateway/proxy; note DB load under spikes
